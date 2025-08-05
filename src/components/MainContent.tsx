import React, { useState } from 'react';
import { FileEditor } from './FileEditor';
import { DiffViewer } from './DiffViewer';
import { ApprovalPanel } from './ApprovalPanel';
import { GitPanel } from './GitPanel';
import { LocalDirectory, YamlFile, FileStatus } from '../types';

interface MainContentProps {
  directory: LocalDirectory | null;
  selectedFile: YamlFile | null;
  onFileChange: (fileId: string, content: string) => void;
  fileStatus: FileStatus;
  onApproveChanges: () => void;
  onDiscardChanges: () => void;
  onDiscardFile?: (fileId: string) => void;
  onGitStatusUpdate?: () => void;
}

type ViewMode = 'edit' | 'diff' | 'approve' | 'git';

export const MainContent: React.FC<MainContentProps> = ({
  directory,
  selectedFile,
  onFileChange,
  fileStatus,
  onApproveChanges,
  onDiscardChanges,
  onDiscardFile,
  onGitStatusUpdate
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('edit');

  const handleJumpToEdit = () => {
    setViewMode('edit');
  };

  if (!directory) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No Directory Loaded</h2>
          <p className="text-gray-500">Select a local directory to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'edit'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setViewMode('diff')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'diff'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            disabled={!fileStatus.hasChanges}
          >
            Diff {fileStatus.hasChanges && `(${fileStatus.changedFiles.length + fileStatus.newFiles.length})`}
          </button>
          <button
            onClick={() => setViewMode('approve')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'approve'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            disabled={!fileStatus.hasChanges}
          >
            Approve Changes
          </button>
          <button
            onClick={() => setViewMode('git')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'git'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Git
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'edit' && (
          <FileEditor
            file={selectedFile}
            schema={directory.schema}
            onFileChange={onFileChange}
          />
        )}
        {viewMode === 'diff' && (
          <DiffViewer
            directory={directory}
            fileStatus={fileStatus}
            onDiscardFile={onDiscardFile}
          />
        )}
        {viewMode === 'approve' && (
          <ApprovalPanel
            directory={directory}
            fileStatus={fileStatus}
            onApproveChanges={onApproveChanges}
            onDiscardChanges={onDiscardChanges}
            onJumpToEdit={handleJumpToEdit}
          />
        )}
        {viewMode === 'git' && (
          <div className="p-6 overflow-auto">
            <GitPanel
              gitStatus={directory.gitStatus}
              gitService={directory.gitService}
              onGitStatusUpdate={onGitStatusUpdate || (() => {})}
              changedFiles={fileStatus.changedFiles}
              newFiles={fileStatus.newFiles}
            />
          </div>
        )}
      </div>
    </div>
  );
};