import React, { useState } from 'react';
import { 
  FolderOpen, 
  File, 
  Plus, 
  GitBranch, 
  Wifi, 
  WifiOff, 
  Circle,
  Dot
} from 'lucide-react';
import { Repository, YamlFile, GitStatus } from '../types';

interface SidebarProps {
  repository: Repository | null;
  selectedFile: YamlFile | null;
  onFileSelect: (file: YamlFile) => void;
  onCreateFile: (fileName: string) => void;
  gitStatus: GitStatus;
  isConnected: boolean;
  onConnect: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  repository,
  selectedFile,
  onFileSelect,
  onCreateFile,
  gitStatus,
  isConnected,
  onConnect
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
          <h2 className="text-lg font-semibold text-white">Repository</h2>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
        
        {repository && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300 truncate">{repository.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">{gitStatus.currentBranch}</span>
              {gitStatus.hasChanges && (
                <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                  {gitStatus.changedFiles.length + gitStatus.newFiles.length} changes
                </span>
              )}
            </div>
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
            {repository?.files.map((file) => (
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

      {/* Git Status */}
      {gitStatus.hasChanges && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Changes</h3>
          <div className="space-y-1 text-sm">
            {gitStatus.newFiles.length > 0 && (
              <div className="text-green-400">
                + {gitStatus.newFiles.length} new file{gitStatus.newFiles.length !== 1 ? 's' : ''}
              </div>
            )}
            {gitStatus.changedFiles.length > 0 && (
              <div className="text-orange-400">
                ~ {gitStatus.changedFiles.length} modified file{gitStatus.changedFiles.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};