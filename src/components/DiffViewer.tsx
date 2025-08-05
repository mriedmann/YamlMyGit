import React from 'react';
import { LocalDirectory, FileStatus, YamlFile } from '../types';
import { computeInlineDiff, DiffLine } from '../utils/diffUtils';
import { XCircle } from 'lucide-react';

interface DiffViewerProps {
  directory: LocalDirectory;
  fileStatus: FileStatus;
  onDiscardFile?: (fileId: string) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  directory,
  fileStatus,
  onDiscardFile
}) => {
  const getModifiedFiles = () => {
    return directory.files.filter(file => 
      fileStatus.changedFiles.includes(file.id) || fileStatus.newFiles.includes(file.id)
    );
  };

  const renderDiffLine = (line: DiffLine, index: number) => {
    const getLineClass = () => {
      switch (line.type) {
        case 'added':
          return 'text-green-300 bg-green-900/20';
        case 'removed':
          return 'text-red-300 bg-red-900/20';
        default:
          return 'text-gray-300';
      }
    };

    const getLineIcon = () => {
      switch (line.type) {
        case 'added':
          return <span className="text-green-400 w-4 text-center select-none">+</span>;
        case 'removed':
          return <span className="text-red-400 w-4 text-center select-none">-</span>;
        default:
          return <span className="text-gray-500 w-4 text-center select-none"> </span>;
      }
    };

    const getLineNumber = () => {
      if (line.type === 'added') {
        return line.newLineNumber;
      } else if (line.type === 'removed') {
        return line.originalLineNumber;
      } else {
        return line.lineNumber;
      }
    };

    return (
      <div key={index} className="flex">
        <span className="w-8 text-gray-500 text-right pr-2 select-none">
          {getLineNumber() || ''}
        </span>
        {getLineIcon()}
        <span className={`flex-1 px-2 ${getLineClass()}`}>
          {line.content}
        </span>
      </div>
    );
  };

  const renderFileDiff = (file: YamlFile) => {
    const isNew = file.isNew;
    const content = file.content;
    
    if (isNew) {
      return (
        <div className="bg-gray-800 rounded border">
          <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-mono text-sm">+++ {file.path}</span>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">NEW</span>
              </div>
              {onDiscardFile && (
                <button
                  onClick={() => onDiscardFile(file.id)}
                  className="p-1 hover:bg-gray-600 rounded transition-colors"
                  title="Discard changes for this file"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          </div>
          <div className="p-4">
            <pre className="text-sm font-mono">
              {content.split('\n').map((line: string, index: number) => (
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
      );
    }

    // For modified files, compute proper diff
    const originalContent = file.originalContent || '';
    const newContent = file.content;
    
    // Use the more sophisticated diff algorithm
    const diffResult = computeInlineDiff(originalContent, newContent);
    
    return (
      <div className="bg-gray-800 rounded border">
        <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-orange-400 font-mono text-sm">~ {file.path}</span>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-red-400">-{diffResult.removedLines}</span>
                <span className="text-green-400">+{diffResult.addedLines}</span>
              </div>
            </div>
            {onDiscardFile && (
              <button
                onClick={() => onDiscardFile(file.id)}
                className="p-1 hover:bg-gray-600 rounded transition-colors"
                title="Discard changes for this file"
              >
                <XCircle className="w-4 h-4 text-red-400" />
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <pre className="text-sm font-mono">
            {diffResult.lines.map((line, index) => renderDiffLine(line, index))}
          </pre>
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
            Review the changes before approving. You can discard individual file changes or approve all changes to write them to the filesystem.
          </p>
        </div>

        <div className="space-y-6">
          {modifiedFiles.map((file) => (
            <div key={file.id}>
              <h3 className="text-lg font-medium text-white mb-3">{file.name}</h3>
              {renderFileDiff(file)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};