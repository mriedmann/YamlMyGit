import React, { useState } from 'react';
import { GitBranch, GitCommit, Plus, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { GitStatus, GitCommitResult } from '../types';

interface GitPanelProps {
  gitStatus: GitStatus | undefined;
  gitService: any;
  onGitStatusUpdate: () => void;
  changedFiles: string[];
  newFiles: string[];
}

export const GitPanel: React.FC<GitPanelProps> = ({
  gitStatus,
  gitService,
  onGitStatusUpdate,
  changedFiles,
  newFiles
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [showNewBranchInput, setShowNewBranchInput] = useState(false);
  const [lastCommitResult, setLastCommitResult] = useState<GitCommitResult | null>(null);

  if (!gitStatus) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <GitBranch className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-300">Git Status</h3>
        </div>
        <p className="text-gray-400 text-sm">No git repository found in this directory.</p>
      </div>
    );
  }

  const handleRefreshStatus = async () => {
    if (!gitService) return;
    
    setIsLoading(true);
    try {
      await onGitStatusUpdate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!gitService || !newBranchName.trim()) return;
    
    setIsLoading(true);
    try {
      const success = await gitService.createBranch(newBranchName.trim());
      if (success) {
        await gitService.checkoutBranch(newBranchName.trim());
        setNewBranchName('');
        setShowNewBranchInput(false);
        await onGitStatusUpdate();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitChanges = async () => {
    if (!gitService || !commitMessage.trim()) return;
    
    setIsLoading(true);
    try {
      // Stage all changed and new files
      const filesToStage = [...changedFiles, ...newFiles];
      if (filesToStage.length > 0) {
        await gitService.stageFiles(filesToStage);
      }
      
      // Commit the changes
      const result = await gitService.commitChanges(commitMessage.trim());
      setLastCommitResult(result);
      
      if (result.success) {
        setCommitMessage('');
        await onGitStatusUpdate();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = changedFiles.length > 0 || newFiles.length > 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Git Status</h3>
        </div>
        <button
          onClick={handleRefreshStatus}
          disabled={isLoading}
          className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Current Branch */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Current Branch:</span>
          <span className="text-sm font-medium text-blue-400">{gitStatus.currentBranch}</span>
        </div>
      </div>

      {/* Git Status */}
      <div className="space-y-2 mb-4">
        {gitStatus.stagedFiles.length > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400">{gitStatus.stagedFiles.length} staged</span>
          </div>
        )}
        {gitStatus.unstagedFiles.length > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">{gitStatus.unstagedFiles.length} modified</span>
          </div>
        )}
        {gitStatus.untrackedFiles.length > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <Plus className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400">{gitStatus.untrackedFiles.length} untracked</span>
          </div>
        )}
      </div>

      {/* Create New Branch */}
      <div className="mb-4">
        {!showNewBranchInput ? (
          <button
            onClick={() => setShowNewBranchInput(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Branch</span>
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Branch name"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateBranch}
                disabled={isLoading || !newBranchName.trim()}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewBranchInput(false);
                  setNewBranchName('');
                }}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Commit Changes */}
      {hasChanges && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <GitCommit className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Commit Changes</span>
          </div>
          
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Enter commit message..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none"
          />
          
          <button
            onClick={handleCommitChanges}
            disabled={isLoading || !commitMessage.trim()}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            {isLoading ? 'Committing...' : 'Commit Changes'}
          </button>
        </div>
      )}

      {/* Commit Result */}
      {lastCommitResult && (
        <div className={`mt-4 p-3 rounded text-sm ${
          lastCommitResult.success 
            ? 'bg-green-900/20 border border-green-700 text-green-300' 
            : 'bg-red-900/20 border border-red-700 text-red-300'
        }`}>
          {lastCommitResult.success ? (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Commit successful! Hash: {lastCommitResult.commitHash?.substring(0, 8)}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Commit failed: {lastCommitResult.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 