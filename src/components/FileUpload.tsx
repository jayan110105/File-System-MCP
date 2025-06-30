'use client';

import { Folder } from 'lucide-react';
import { useState, useCallback } from 'react';
import { uploadFilesAction } from '@/app/actions';

interface FileUploadProps {
  onUploadComplete: (uploadDirectory: string) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
  } | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
  }, []);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const result = await uploadFilesAction(formData);

      if ('success' in result && result.success) {
        setUploadStatus({
          success: result.success,
          message: `Successfully uploaded ${result.uploadedFiles.length} file(s)`,
          errors: result.errors && result.errors.length > 0 ? result.errors : undefined,
        });
        onUploadComplete(result.uploadDirectory);
      } else {
        setUploadStatus({
          success: false,
          message: 'error' in result ? result.error : 'Upload failed',
          errors: 'errors' in result ? result.errors : undefined,
        });
      }
    } catch {
      setUploadStatus({
        success: false,
        message: 'A network or server error occurred during upload.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center border-gray-300 dark:border-gray-600"
      >
        <div className="space-y-4">
          <Folder className="w-14 h-14 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Files & Folders</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click the buttons below to select files or folders to upload
            </p>
            <div className="flex justify-center gap-4">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  multiple
                  disabled={isUploading}
                />
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="folder-upload"
                  disabled={isUploading}
                  // @ts-expect-error webkitdirectory is a non-standard property
                  webkitdirectory="true"
                />
             </div>
            <div className="flex justify-center space-x-4">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Select Files'}
              </label>
              <label
                htmlFor="folder-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Select Folder'}
              </label>
            </div>
          </div>
        </div>
      </div>

      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-md ${
          uploadStatus.success 
            ? 'bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800' 
            : 'bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800'
        }`}>
          <div className={`font-medium ${
            uploadStatus.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
          }`}>
            {uploadStatus.message}
          </div>
          {uploadStatus.errors && uploadStatus.errors.length > 0 && (
            <div className="mt-2">
              <div className="text-sm text-red-600 dark:text-red-400">Errors:</div>
              <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                {uploadStatus.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 