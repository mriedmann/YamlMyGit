export interface LocalDirectory {
  id: string;
  name: string;
  path: string;
  files: YamlFile[];
  schema: JsonSchema;
  directoryHandle?: FileSystemDirectoryHandle; // File System Access API handle
  gitService?: any; // Git service instance
  gitStatus?: GitStatus; // Current git status
}

export interface YamlFile {
  id: string;
  name: string;
  path: string;
  content: string; // YAML string content
  originalContent?: string; // Original content for diff comparison
  modified?: boolean;
  isNew?: boolean;
  fileHandle?: FileSystemFileHandle; // File System Access API handle for the file
}

export interface FileStatus {
  hasChanges: boolean;
  changedFiles: string[];
  newFiles: string[];
}

export interface JsonSchema {
  type: string;
  properties: Record<string, SchemaProperty>;
  required?: string[];
  title?: string;
  description?: string;
}

export interface SchemaProperty {
  type: string;
  title?: string;
  description?: string;
  enum?: string[];
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  default?: string | number | boolean | string[] | Record<string, unknown>;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface DirectoryInfo {
  path: string;
  name: string;
  yamlFiles: string[];
  hasSchema: boolean;
}

// Git-related types
export interface GitStatus {
  isGitRepository: boolean;
  currentBranch: string;
  hasChanges: boolean;
  stagedFiles: string[];
  unstagedFiles: string[];
  untrackedFiles: string[];
}

export interface GitCommitResult {
  success: boolean;
  commitHash?: string;
  error?: string;
}