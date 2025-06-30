'use client';

import { File } from 'lucide-react';

interface FileInfo {
  name: string;
  size: number;
  modified: string;
  isDirectory: boolean;
}

interface FileBrowserProps {
  files: FileInfo[];
}

export default function FileBrowser({ files }: FileBrowserProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Files</h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {files.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No files uploaded yet. Use the upload area above to add files.
          </div>
        ) : (
          files.map((file) => (
            <div key={file.name} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {file.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} • {formatDate(file.modified)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 