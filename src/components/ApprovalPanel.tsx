import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, FileText, GitCommit } from 'lucide-react';
import { LocalDirectory, FileStatus } from '../types';

interface ApprovalPanelProps {
  directory: LocalDirectory;
  fileStatus: FileStatus;
  onApproveChanges: () => void;
  onDiscardChanges: () => void;
  onJumpToEdit?: () => void;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  directory,
  fileStatus,
  onApproveChanges,
  onDiscardChanges,
  onJumpToEdit
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [commitWithGit, setCommitWithGit] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');

  const getModifiedFiles = () => {
    return directory.files.filter(file => 
      fileStatus.changedFiles.includes(file.id) || fileStatus.newFiles.includes(file.id)
    );
  };

  const writeFileToFilesystem = async (fileHandle: FileSystemFileHandle, content: string): Promise<void> => {
    // Create a writable stream to the file
    const writable = await fileHandle.createWritable();
    
    try {
      // Write the content to the file
      await writable.write(content);
      // Close the writable stream
      await writable.close();
    } catch (error) {
      // If there's an error, try to abort the writable
      try {
        await writable.abort();
      } catch (abortError) {
        console.error('Error aborting writable:', abortError);
      }
      throw error;
    }
  };

  const createNewFile = async (fileName: string, content: string): Promise<void> => {
    if (!directory.directoryHandle) {
      throw new Error('No directory handle available');
    }

    // Create a new file in the directory
    const fileHandle = await directory.directoryHandle.getFileHandle(fileName, { create: true });
    
    // Write the content to the new file
    await writeFileToFilesystem(fileHandle, content);
  };

  const handleApproveChanges = async () => {
    setIsApproving(true);
    setApprovalMessage('');
    
    try {
      // Write changes to original files on the filesystem
      const modifiedFiles = getModifiedFiles();
      const writePromises: Promise<void>[] = [];
      
      for (const file of modifiedFiles) {
        if (file.isNew) {
          // Create new file
          writePromises.push(createNewFile(file.name, file.content));
        } else if (file.modified && file.originalContent !== undefined && file.fileHandle) {
          // Write to existing file
          writePromises.push(writeFileToFilesystem(file.fileHandle, file.content));
        }
      }

      // Wait for all file writes to complete
      await Promise.all(writePromises);

      // Handle git operations if requested
      if (commitWithGit && directory.gitService && commitMessage.trim()) {
        try {
          // Stage all changed and new files
          const filesToStage = [...fileStatus.changedFiles, ...fileStatus.newFiles];
          console.log('Files to stage for git:', filesToStage);
          
          if (filesToStage.length > 0) {
            const stageSuccess = await directory.gitService.stageFiles(filesToStage);
            if (!stageSuccess) {
              throw new Error('Failed to stage files');
            }
          }
          
          // Commit the changes
          const commitResult = await directory.gitService.commitChanges(commitMessage.trim());
          if (commitResult.success) {
            setApprovalMessage(`Successfully wrote changes to ${modifiedFiles.length} file${modifiedFiles.length !== 1 ? 's' : ''} and committed to git!`);
          } else {
            setApprovalMessage(`Successfully wrote changes to ${modifiedFiles.length} file${modifiedFiles.length !== 1 ? 's' : ''} but git commit failed: ${commitResult.error}`);
          }
        } catch (error) {
          console.error('Git operation error:', error);
          setApprovalMessage(`Successfully wrote changes to ${modifiedFiles.length} file${modifiedFiles.length !== 1 ? 's' : ''} but git commit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        setApprovalMessage(`Successfully wrote changes to ${modifiedFiles.length} file${modifiedFiles.length !== 1 ? 's' : ''}!`);
      }

      // Call the parent's approval handler
      onApproveChanges();
      
      // Jump back to edit view after a short delay
      setTimeout(() => {
        if (onJumpToEdit) {
          onJumpToEdit();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error writing changes to files:', error);
      setApprovalMessage(`Error writing changes to files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDiscardChanges = async () => {
    setIsDiscarding(true);
    setApprovalMessage('');
    
    try {
      // Call the parent's discard handler
      onDiscardChanges();
      
      setApprovalMessage('All changes have been discarded.');
      
      // Jump back to edit view after a short delay
      setTimeout(() => {
        if (onJumpToEdit) {
          onJumpToEdit();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error discarding changes:', error);
      setApprovalMessage('Error discarding changes. Please try again.');
    } finally {
      setIsDiscarding(false);
    }
  };

  const modifiedFiles = getModifiedFiles();

  if (modifiedFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Changes to Approve</h3>
          <p className="text-gray-500">Make some changes to files to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Approve Changes</h2>
          <p className="text-gray-400">
            Review and approve the changes. Modified files will be updated on the filesystem.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Modified Files</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {fileStatus.changedFiles.length}
              </div>
            </div>
            <div className="bg-gray-700 rounded p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">New Files</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {fileStatus.newFiles.length}
              </div>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Files to Update</h3>
          <div className="space-y-3">
            {modifiedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">{file.name}</div>
                    <div className="text-sm text-gray-400">
                      {file.isNew ? 'New file' : 'Modified file'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.isNew ? (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">NEW</span>
                  ) : (
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">MODIFIED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Message */}
        {approvalMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            approvalMessage.includes('Error') 
              ? 'bg-red-900/20 border border-red-700' 
              : 'bg-green-900/20 border border-green-700'
          }`}>
            <div className="flex items-center space-x-2">
              {approvalMessage.includes('Error') ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              <span className={approvalMessage.includes('Error') ? 'text-red-300' : 'text-green-300'}>
                {approvalMessage}
              </span>
            </div>
          </div>
        )}

        {/* Git Commit Options */}
        {directory.gitService && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <GitCommit className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-medium text-white">Git Integration</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="commitWithGit"
                  checked={commitWithGit}
                  onChange={(e) => setCommitWithGit(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="commitWithGit" className="text-white">
                  Commit changes to git after writing files
                </label>
              </div>
              
              {commitWithGit && (
                <div className="space-y-2">
                  <label htmlFor="commitMessage" className="block text-sm font-medium text-gray-300">
                    Commit Message
                  </label>
                  <textarea
                    id="commitMessage"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Enter a descriptive commit message..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleApproveChanges}
            disabled={isApproving}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isApproving ? 'Writing Changes...' : 'Approve & Write Changes'}</span>
          </button>
          
          <button
            onClick={handleDiscardChanges}
            disabled={isDiscarding}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
            <span>{isDiscarding ? 'Discarding...' : 'Discard All Changes'}</span>
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <h4 className="text-blue-400 font-medium mb-2">What happens when you approve?</h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Changes will be written directly to the original files on the filesystem</li>
            <li>• New files will be created in the selected directory</li>
            <li>• All changes will be marked as approved and cleared from the diff view</li>
            <li>• You can review the changes in the diff view before approving</li>
            <li>• You'll be automatically redirected to the edit view after approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 