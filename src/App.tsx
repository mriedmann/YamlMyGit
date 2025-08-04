import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Repository, YamlFile, GitStatus } from './types';
import { mockRepository, mockSchema } from './data/mockData';
import { stringifyYaml } from './utils/yamlUtils';

function App() {
  const [currentRepository, setCurrentRepository] = useState<Repository | null>(mockRepository);
  const [selectedFile, setSelectedFile] = useState<YamlFile | null>(null);
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    currentBranch: 'main',
    hasChanges: false,
    changedFiles: [],
    newFiles: []
  });
  const [isConnected, setIsConnected] = useState(true);

  const handleFileSelect = (file: YamlFile) => {
    setSelectedFile(file);
  };

  const handleFileChange = (fileId: string, newYamlContent: string) => {
    if (!currentRepository) return;
    
    setCurrentRepository(prev => {
      if (!prev) return prev;
      
      const updatedFiles = prev.files.map(file => 
        file.id === fileId ? { ...file, content: newYamlContent, modified: true } : file
      );
      
      return { ...prev, files: updatedFiles };
    });

    // Update git status
    setGitStatus(prev => ({
      ...prev,
      hasChanges: true,
      changedFiles: [...new Set([...prev.changedFiles, fileId])]
    }));
  };

  const handleCreateFile = (fileName: string) => {
    if (!currentRepository) return;

    const newFile: YamlFile = {
      id: `new-${Date.now()}`,
      name: fileName,
      path: fileName,
      content: stringifyYaml({}),
      modified: true,
      isNew: true
    };

    setCurrentRepository(prev => {
      if (!prev) return prev;
      return { ...prev, files: [...prev.files, newFile] };
    });

    setGitStatus(prev => ({
      ...prev,
      hasChanges: true,
      newFiles: [...prev.newFiles, newFile.id]
    }));

    setSelectedFile(newFile);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
      <Sidebar
        repository={currentRepository}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onCreateFile={handleCreateFile}
        gitStatus={gitStatus}
        isConnected={isConnected}
        onConnect={() => setIsConnected(true)}
      />
      <MainContent
        repository={currentRepository}
        selectedFile={selectedFile}
        schema={mockSchema}
        onFileChange={handleFileChange}
        gitStatus={gitStatus}
        onGitStatusChange={setGitStatus}
      />
    </div>
  );
}

export default App;