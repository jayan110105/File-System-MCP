'use server';

import * as fs from 'fs/promises';
import * as path from 'path';
import { revalidatePath } from 'next/cache';

const UPLOAD_DIR = './uploads';

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

function sanitizeFilename(filename: string): string {
  const baseName = path.basename(filename);
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '');
}

interface FileInfo {
  name: string;
  size: number;
  modified: string;
  isDirectory: boolean;
}

interface UploadResult {
  success: boolean;
  uploadedFiles: string[];
  errors: string[];
  uploadDirectory: string;
}

interface UploadError {
  error: string;
  details?: string;
  success?: false;
  errors?: string[];
}

export async function uploadFilesAction(formData: FormData): Promise<UploadResult | UploadError> {
  try {
    await ensureUploadDir();

    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return { error: 'No files provided' };
    }

    const uploadedFiles: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const sanitizedName = sanitizeFilename(file.name);
        const filePath = path.join(UPLOAD_DIR, sanitizedName);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await fs.writeFile(filePath, buffer);
        uploadedFiles.push(sanitizedName);
      } catch (error) {
        errors.push(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (uploadedFiles.length > 0) {
      revalidatePath('/');
    }

    return {
      success: uploadedFiles.length > 0,
      uploadedFiles,
      errors,
      uploadDirectory: path.resolve(UPLOAD_DIR),
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getFilesAction(): Promise<{
  uploadDirectory: string;
  files: FileInfo[];
}> {
  try {
    await ensureUploadDir();
    
    const files = await fs.readdir(UPLOAD_DIR);
    const fileDetails: FileInfo[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = await fs.stat(filePath);
        fileDetails.push({
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          isDirectory: stats.isDirectory(),
        });
      } catch {
        continue;
      }
    }

    return {
      uploadDirectory: path.resolve(UPLOAD_DIR),
      files: fileDetails,
    };
  } catch (error) {
    console.error('List files error:', error);
    return {
      uploadDirectory: path.resolve(UPLOAD_DIR),
      files: [],
    };
  }
} 