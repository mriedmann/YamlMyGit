export interface Repository {
  id: string;
  name: string;
  url: string;
  localPath: string;
  files: YamlFile[];
}

export interface YamlFile {
  id: string;
  name: string;
  path: string;
  content: string; // YAML string content
  modified?: boolean;
  isNew?: boolean;
}

export interface GitStatus {
  currentBranch: string;
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
  default?: any;
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

export interface CommitInfo {
  message: string;
  branch: string;
  createMergeRequest: boolean;
  mergeRequestTitle?: string;
  mergeRequestDescription?: string;
}