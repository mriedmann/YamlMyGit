import React, { useState } from 'react';
import { 
  FolderOpen, 
  File, 
  Plus, 
  Circle,
  Dot
} from 'lucide-react';
import { LocalDirectory, YamlFile, FileStatus } from '../types';

interface SidebarProps {
  directory: LocalDirectory | null;
  selectedFile: YamlFile | null;
  onFileSelect: (file: YamlFile) => void;
  onCreateFile: (fileName: string) => void;
  fileStatus: FileStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({
  directory,
  selectedFile,
  onFileSelect,
  onCreateFile,
  fileStatus
}) => {
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const fileName = newFileName.endsWith('.yaml') ? newFileName : `${newFileName}.yaml`;
      onCreateFile(fileName);
      setNewFileName('');
      setShowCreateFile(false);
    }
  };

  const getFileIcon = (file: YamlFile) => {
    if (file.modified || file.isNew) {
      return <Dot className="w-4 h-4 text-orange-400" />;
    }
    return <Circle className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Directory</h2>
        </div>
        
        {directory && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300 truncate">{directory.name}</span>
            </div>
            <div className="text-sm text-gray-400">
              {directory.files.length} YAML file{directory.files.length !== 1 ? 's' : ''}
            </div>
            {fileStatus.hasChanges && (
              <div className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                {fileStatus.changedFiles.length + fileStatus.newFiles.length} changes
              </div>
            )}
          </div>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Files</h3>
            <button
              onClick={() => setShowCreateFile(true)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Create new file"
            >
              <Plus className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>

          {showCreateFile && (
            <div className="mb-3 p-2 bg-gray-700 rounded">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter file name..."
                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border-none outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                autoFocus
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleCreateFile}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateFile(false);
                    setNewFileName('');
                  }}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {directory?.files.map((file) => (
              <button
                key={file.id}
                onClick={() => onFileSelect(file)}
                className={`w-full flex items-center space-x-2 p-2 rounded text-left transition-colors ${
                  selectedFile?.id === file.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                {getFileIcon(file)}
                <File className="w-4 h-4" />
                <span className="text-sm truncate">{file.name}</span>
                {file.isNew && (
                  <span className="text-xs bg-green-500 text-white px-1 rounded">NEW</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* File Status */}
      {fileStatus.hasChanges && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Changes</h3>
          <div className="space-y-1 text-sm">
            {fileStatus.newFiles.length > 0 && (
              <div className="text-green-400">
                + {fileStatus.newFiles.length} new file{fileStatus.newFiles.length !== 1 ? 's' : ''}
              </div>
            )}
            {fileStatus.changedFiles.length > 0 && (
              <div className="text-orange-400">
                ~ {fileStatus.changedFiles.length} modified file{fileStatus.changedFiles.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};