import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { DirectorySelector } from './components/DirectorySelector';
import { LocalDirectory, YamlFile, FileStatus } from './types';
import { stringifyYaml } from './utils/yamlUtils';

function App() {
  const [currentDirectory, setCurrentDirectory] = useState<LocalDirectory | null>(null);
  const [selectedFile, setSelectedFile] = useState<YamlFile | null>(null);
  const [fileStatus, setFileStatus] = useState<FileStatus>({
    hasChanges: false,
    changedFiles: [],
    newFiles: []
  });

  const handleDirectorySelect = (directory: LocalDirectory) => {
    setCurrentDirectory(directory);
    setSelectedFile(null);
    setFileStatus({
      hasChanges: false,
      changedFiles: [],
      newFiles: []
    });
  };

  const handleFileSelect = (file: YamlFile) => {
    setSelectedFile(file);
  };

  const handleFileChange = (fileId: string, newYamlContent: string) => {
    if (!currentDirectory) return;
    
    setCurrentDirectory(prev => {
      if (!prev) return prev;
      
      const updatedFiles = prev.files.map(file => 
        file.id === fileId ? { 
          ...file, 
          content: newYamlContent, 
          modified: true,
          originalContent: file.originalContent || file.content
        } : file
      );
      
      return { ...prev, files: updatedFiles };
    });

    // Update file status
    setFileStatus(prev => ({
      ...prev,
      hasChanges: true,
      changedFiles: [...new Set([...prev.changedFiles, fileId])]
    }));
  };

  const handleCreateFile = async (fileName: string) => {
    if (!currentDirectory) return;

    const newFile: YamlFile = {
      id: `new-${Date.now()}`,
      name: fileName,
      path: fileName,
      content: stringifyYaml({}),
      modified: true,
      isNew: true
    };

    setCurrentDirectory(prev => {
      if (!prev) return prev;
      return { ...prev, files: [...prev.files, newFile] };
    });

    setFileStatus(prev => ({
      ...prev,
      hasChanges: true,
      newFiles: [...prev.newFiles, newFile.id]
    }));

    setSelectedFile(newFile);
  };

  const handleApproveChanges = () => {
    // Reset file status after approval
    setFileStatus({
      hasChanges: false,
      changedFiles: [],
      newFiles: []
    });

    // Update files to mark them as not modified and update their file handles
    setCurrentDirectory(prev => {
      if (!prev) return prev;
      
      const updatedFiles = prev.files.map(file => {
        if (file.isNew) {
          // For new files, we need to get their file handle after they're created
          // This will be handled by the ApprovalPanel when it creates the file
          return {
            ...file,
            modified: false,
            isNew: false,
            originalContent: file.content // Update original content to current content
          };
        } else if (file.modified) {
          return {
            ...file,
            modified: false,
            originalContent: file.content // Update original content to current content
          };
        }
        return file;
      });
      
      return { ...prev, files: updatedFiles };
    });
  };

  const handleGitStatusUpdate = async () => {
    if (!currentDirectory?.gitService) return;
    
    try {
      const newGitStatus = await currentDirectory.gitService.getStatus();
      setCurrentDirectory(prev => {
        if (!prev) return prev;
        return { ...prev, gitStatus: newGitStatus };
      });
    } catch (error) {
      console.error('Error updating git status:', error);
    }
  };

  const handleDiscardChanges = () => {
    // Reset file status
    setFileStatus({
      hasChanges: false,
      changedFiles: [],
      newFiles: []
    });

    // Revert all files to their original content
    setCurrentDirectory(prev => {
      if (!prev) return prev;
      
      const updatedFiles = prev.files.map(file => {
        if (file.modified && file.originalContent !== undefined) {
          return {
            ...file,
            content: file.originalContent,
            modified: false,
            isNew: false
          };
        }
        return file;
      }).filter(file => !file.isNew); // Remove new files
      
      return { ...prev, files: updatedFiles };
    });

    // Clear selected file if it was a new file
    setSelectedFile(prev => {
      if (prev && prev.isNew) {
        return null;
      }
      return prev;
    });
  };

  const handleDiscardFile = (fileId: string) => {
    if (!currentDirectory) return;

    setCurrentDirectory(prev => {
      if (!prev) return prev;
      
      const updatedFiles = prev.files.map(file => {
        if (file.id === fileId) {
          if (file.isNew) {
            return null; // Remove new files
          } else if (file.modified && file.originalContent !== undefined) {
            return {
              ...file,
              content: file.originalContent,
              modified: false
            };
          }
        }
        return file;
      }).filter(Boolean) as YamlFile[]; // Remove null entries
      
      return { ...prev, files: updatedFiles };
    });

    // Update file status
    setFileStatus(prev => ({
      ...prev,
      changedFiles: prev.changedFiles.filter(id => id !== fileId),
      newFiles: prev.newFiles.filter(id => id !== fileId),
      hasChanges: (prev.changedFiles.filter(id => id !== fileId).length + 
                   prev.newFiles.filter(id => id !== fileId).length) > 0
    }));

    // Clear selected file if it was discarded
    setSelectedFile(prev => {
      if (prev && prev.id === fileId) {
        return null;
      }
      return prev;
    });
  };

  // Show directory selector if no directory is loaded
  if (!currentDirectory) {
    return (
      <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
        <DirectorySelector onDirectorySelect={handleDirectorySelect} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
      <Sidebar
        directory={currentDirectory}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onCreateFile={handleCreateFile}
        fileStatus={fileStatus}
      />
      <MainContent
        directory={currentDirectory}
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
        fileStatus={fileStatus}
        onApproveChanges={handleApproveChanges}
        onDiscardChanges={handleDiscardChanges}
        onDiscardFile={handleDiscardFile}
        onGitStatusUpdate={handleGitStatusUpdate}
      />
    </div>
  );
}

export default App;