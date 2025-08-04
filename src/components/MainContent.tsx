import React, { useState } from 'react';
import { FileEditor } from './FileEditor';
import { DiffViewer } from './DiffViewer';
import { CommitPanel } from './CommitPanel';
import { Repository, YamlFile, JsonSchema, GitStatus } from '../types';

interface MainContentProps {
  repository: Repository | null;
  selectedFile: YamlFile | null;
  schema: JsonSchema;
  onFileChange: (fileId: string, content: any) => void;
  gitStatus: GitStatus;
  onGitStatusChange: (status: GitStatus) => void;
}

type ViewMode = 'edit' | 'diff' | 'commit';

export const MainContent: React.FC<MainContentProps> = ({
  repository,
  selectedFile,
  schema,
  onFileChange,
  gitStatus,
  onGitStatusChange
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('edit');

  if (!repository) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No Repository Connected</h2>
          <p className="text-gray-500">Connect to a GitLab repository to get started</p>
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
            disabled={!gitStatus.hasChanges}
          >
            Diff {gitStatus.hasChanges && `(${gitStatus.changedFiles.length + gitStatus.newFiles.length})`}
          </button>
          <button
            onClick={() => setViewMode('commit')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'commit'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            disabled={!gitStatus.hasChanges}
          >
            Commit
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'edit' && (
          <FileEditor
            file={selectedFile}
            schema={schema}
            onFileChange={onFileChange}
          />
        )}
        {viewMode === 'diff' && (
          <DiffViewer
            repository={repository}
            gitStatus={gitStatus}
          />
        )}
        {viewMode === 'commit' && (
          <CommitPanel
            repository={repository}
            gitStatus={gitStatus}
            onGitStatusChange={onGitStatusChange}
          />
        )}
      </div>
    </div>
  );
};