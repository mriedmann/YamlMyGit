import React, { useState } from 'react';
import { GitBranch, GitCommit, GitPullRequest, Send } from 'lucide-react';
import { Repository, GitStatus, CommitInfo } from '../types';

interface CommitPanelProps {
  repository: Repository;
  gitStatus: GitStatus;
  onGitStatusChange: (status: GitStatus) => void;
}

export const CommitPanel: React.FC<CommitPanelProps> = ({
  repository,
  gitStatus,
  onGitStatusChange
}) => {
  const [commitInfo, setCommitInfo] = useState<CommitInfo>({
    message: '',
    branch: `feature/update-${Date.now()}`,
    createMergeRequest: true,
    mergeRequestTitle: '',
    mergeRequestDescription: ''
  });
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);

  const handleCommit = async () => {
    if (!commitInfo.message.trim()) return;

    setIsCommitting(true);
    
    // Simulate commit process
    setTimeout(() => {
      console.log('Committing changes:', {
        repository: repository.name,
        branch: commitInfo.branch,
        message: commitInfo.message,
        files: [...gitStatus.changedFiles, ...gitStatus.newFiles],
        createMR: commitInfo.createMergeRequest
      });

      // Reset git status
      onGitStatusChange({
        currentBranch: commitInfo.branch,
        hasChanges: false,
        changedFiles: [],
        newFiles: []
      });

      setCommitSuccess(true);
      setIsCommitting(false);

      // Reset success message after 3 seconds
      setTimeout(() => setCommitSuccess(false), 3000);
    }, 2000);
  };

  const getModifiedFiles = () => {
    return repository.files.filter(file => 
      gitStatus.changedFiles.includes(file.id) || gitStatus.newFiles.includes(file.id)
    );
  };

  const modifiedFiles = getModifiedFiles();

  if (commitSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <GitCommit className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-green-400 mb-2">Commit Successful!</h3>
          <p className="text-gray-400 mb-2">Changes have been committed to branch: {commitInfo.branch}</p>
          {commitInfo.createMergeRequest && (
            <p className="text-gray-400">Merge request created successfully</p>
          )}
        </div>
      </div>
    );
  }

  if (modifiedFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Changes to Commit</h3>
          <p className="text-gray-500">Make some changes to create a commit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Commit Changes</h2>
          <p className="text-gray-400">
            Ready to commit {modifiedFiles.length} file{modifiedFiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Summary */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Changed Files</h3>
            <div className="space-y-2">
              {modifiedFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                  <div className={`w-2 h-2 rounded-full ${file.isNew ? 'bg-green-400' : 'bg-orange-400'}`} />
                  <span className="text-gray-300">{file.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    file.isNew ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {file.isNew ? 'NEW' : 'MODIFIED'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Commit Form */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Commit Message *
              </label>
              <textarea
                value={commitInfo.message}
                onChange={(e) => setCommitInfo(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your changes..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Branch Name
              </label>
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={commitInfo.branch}
                  onChange={(e) => setCommitInfo(prev => ({ ...prev, branch: e.target.value }))}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="createMR"
                checked={commitInfo.createMergeRequest}
                onChange={(e) => setCommitInfo(prev => ({ ...prev, createMergeRequest: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="createMR" className="text-gray-300 flex items-center space-x-2">
                <GitPullRequest className="w-4 h-4" />
                <span>Create Merge Request</span>
              </label>
            </div>

            {commitInfo.createMergeRequest && (
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Merge Request Title
                  </label>
                  <input
                    type="text"
                    value={commitInfo.mergeRequestTitle}
                    onChange={(e) => setCommitInfo(prev => ({ ...prev, mergeRequestTitle: e.target.value }))}
                    placeholder="Enter merge request title..."
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={commitInfo.mergeRequestDescription}
                    onChange={(e) => setCommitInfo(prev => ({ ...prev, mergeRequestDescription: e.target.value }))}
                    placeholder="Describe the merge request..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleCommit}
              disabled={!commitInfo.message.trim() || isCommitting}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              {isCommitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Committing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Commit & Push</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};