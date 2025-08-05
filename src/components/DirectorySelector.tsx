import React, { useState } from 'react';
import { FolderOpen, Upload, AlertCircle } from 'lucide-react';
import { LocalDirectory, DirectoryInfo } from '../types';

interface DirectorySelectorProps {
  onDirectorySelect: (directory: LocalDirectory) => void;
}

export const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  onDirectorySelect
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDirectorySelect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the File System Access API to select a directory
      const dirHandle = await (window as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
      
      // Get directory info
      const directoryInfo = await scanDirectory(dirHandle);
      
      if (!directoryInfo.hasSchema) {
        setError('No schema.json file found in the selected directory');
        setIsLoading(false);
        return;
      }

      if (directoryInfo.yamlFiles.length === 0) {
        setError('No YAML files found in the selected directory');
        setIsLoading(false);
        return;
      }

      // Load schema
      const schemaFile = await dirHandle.getFileHandle('schema.json');
      const schemaContent = await schemaFile.getFile();
      const schemaText = await schemaContent.text();
      const schema = JSON.parse(schemaText);

      // Load YAML files with their handles
      const files = await Promise.all(
        directoryInfo.yamlFiles.map(async (fileName) => {
          const fileHandle = await dirHandle.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          const content = await file.text();
          
          return {
            id: fileName,
            name: fileName,
            path: fileName,
            content,
            originalContent: content,
            modified: false,
            isNew: false,
            fileHandle // Store the file handle for writing back
          };
        })
      );

      const directory: LocalDirectory = {
        id: directoryInfo.path,
        name: directoryInfo.name,
        path: directoryInfo.path,
        files,
        schema,
        directoryHandle: dirHandle // Store the directory handle
      };

      onDirectorySelect(directory);
    } catch (err) {
      console.error('Error selecting directory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setIsLoading(false);
    }
  };

  const scanDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<DirectoryInfo> => {
    const yamlFiles: string[] = [];
    let hasSchema = false;

    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file') {
        if (name === 'schema.json') {
          hasSchema = true;
        } else if (name.endsWith('.yaml') || name.endsWith('.yml')) {
          yamlFiles.push(name);
        }
      }
    }

    return {
      path: dirHandle.name,
      name: dirHandle.name,
      yamlFiles,
      hasSchema
    };
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <FolderOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Select Directory</h2>
          <p className="text-gray-400">
            Choose a local directory containing YAML files and a schema.json file
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleDirectorySelect}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors mx-auto"
        >
          <Upload className="w-5 h-5" />
          <span>{isLoading ? 'Loading...' : 'Select Directory'}</span>
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">Requirements:</p>
          <ul className="text-left space-y-1">
            <li>• Directory must contain a <code className="bg-gray-800 px-1 rounded">schema.json</code> file</li>
            <li>• Directory must contain at least one <code className="bg-gray-800 px-1 rounded">.yaml</code> or <code className="bg-gray-800 px-1 rounded">.yml</code> file</li>
            <li>• Files will be loaded using the browser's File System Access API</li>
            <li>• Changes will be written directly back to the original files</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 