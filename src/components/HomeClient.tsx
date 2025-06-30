'use client';

import { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import FileBrowser from '@/components/FileBrowser';
import { File, Folder, MessageSquare } from 'lucide-react';

interface FileInfo {
  name: string;
  size: number;
  modified: string;
  isDirectory: boolean;
}

interface HomeClientProps {
  initialFiles: FileInfo[];
  initialBaseDirectory: string | null;
}

export default function HomeClient({ initialFiles, initialBaseDirectory }: HomeClientProps) {
  const [baseDirectory, setBaseDirectory] = useState<string | undefined>(initialBaseDirectory || undefined);
  const [activeTab, setActiveTab] = useState<'upload' | 'chat' | 'files'>('upload');

  const handleUploadComplete = useCallback((uploadDirectory: string) => {
    setBaseDirectory(uploadDirectory);
    setActiveTab('chat');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              MCP Filesystem Manager
            </h1>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Folder className="w-4 h-4" />
               Upload Files
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat Assistant
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'files'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <File className="w-4 h-4" />
              File Browser ({initialFiles.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Upload Your Files
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Upload files to get started. Once uploaded, you can use the chat interface to 
                create, edit, delete, and manage your files using natural language commands.
              </p>
            </div>
            <FileUpload 
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-200px)]">
            {!baseDirectory ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  No files uploaded yet. Please upload files first to start using the chat assistant.
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Upload Files
                </button>
              </div>
            ) : (
              <ChatInterface 
                baseDirectory={baseDirectory}
              />
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                File Browser
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Browse and preview your uploaded files
              </p>
            </div>
            <FileBrowser 
              files={initialFiles}
            />
          </div>
        )}
      </main>
    </div>
  );
} 