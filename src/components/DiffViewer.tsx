import React from 'react';
import { Repository, GitStatus } from '../types';
import { parseYaml, stringifyYaml } from '../utils/yamlUtils';

interface DiffViewerProps {
  repository: Repository;
  gitStatus: GitStatus;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  repository,
  gitStatus
}) => {
  const getModifiedFiles = () => {
    return repository.files.filter(file => 
      gitStatus.changedFiles.includes(file.id) || gitStatus.newFiles.includes(file.id)
    );
  };

  const renderDiff = (file: any) => {
    const isNew = file.isNew;
    const content = file.content; // Already YAML string
    
    if (isNew) {
      return (
        <div className="bg-gray-800 rounded border">
          <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-green-400 font-mono text-sm">+++ {file.path}</span>
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">NEW</span>
            </div>
          </div>
          <div className="p-4">
            <pre className="text-sm font-mono">
              {content.split('\n').map((line, index) => (
                <div key={index} className="flex">
                  <span className="w-12 text-gray-500 text-right pr-4 select-none">
                    {index + 1}
                  </span>
                  <span className="text-green-400 w-6 text-center select-none">+</span>
                  <span className="text-green-300 bg-green-900/20 flex-1 px-2">
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      );
    }

    // Mock diff for modified files
    const originalContent = stringifyYaml({
      name: "example",
      version: "1.0.0", 
      enabled: false
    });
    
    const newContent = file.content;

    return (
      <div className="bg-gray-800 rounded border">
        <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
          <span className="text-orange-400 font-mono text-sm">~ {file.path}</span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-600">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Original</h4>
            <pre className="text-sm font-mono">
              {originalContent.split('\n').map((line, index) => (
                <div key={index} className="flex">
                  <span className="w-8 text-gray-500 text-right pr-2 select-none">
                    {index + 1}
                  </span>
                  <span className="text-red-400 w-4 text-center select-none">-</span>
                  <span className="text-red-300 bg-red-900/20 flex-1 px-2">
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Modified</h4>
            <pre className="text-sm font-mono">
              {newContent.split('\n').map((line, index) => (
                <div key={index} className="flex">
                  <span className="w-8 text-gray-500 text-right pr-2 select-none">
                    {index + 1}
                  </span>
                  <span className="text-green-400 w-4 text-center select-none">+</span>
                  <span className="text-green-300 bg-green-900/20 flex-1 px-2">
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  const modifiedFiles = getModifiedFiles();

  if (modifiedFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Changes</h3>
          <p className="text-gray-500">Make some changes to see the diff</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Changes</h2>
          <p className="text-gray-400">
            {modifiedFiles.length} file{modifiedFiles.length !== 1 ? 's' : ''} modified
          </p>
        </div>

        <div className="space-y-6">
          {modifiedFiles.map((file) => (
            <div key={file.id}>
              <h3 className="text-lg font-medium text-white mb-3">{file.name}</h3>
              {renderDiff(file)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};