import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Save } from 'lucide-react';
import { YamlFile, JsonSchema, ValidationError } from '../types';
import { FormField } from './FormField';
import { validateAgainstSchema } from '../utils/validation';
import { parseYaml, stringifyYaml } from '../utils/yamlUtils';

interface FileEditorProps {
  file: YamlFile | null;
  schema: JsonSchema;
  onFileChange: (fileId: string, content: string) => void;
}

export const FileEditor: React.FC<FileEditorProps> = ({
  file,
  schema,
  onFileChange
}) => {
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [yamlContent, setYamlContent] = useState<string>('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (file) {
      const yamlString = file.content || '';
      setYamlContent(yamlString);
      const parsedContent = parseYaml(yamlString) || {};
      setContent(parsedContent);
    }
  }, [file]);

  useEffect(() => {
    if (file && Object.keys(content).length > 0) {
      const validationErrors = validateAgainstSchema(content, schema);
      setErrors(validationErrors);
      setIsValid(validationErrors.length === 0);
    }
  }, [content, schema, file]);

  const handleFieldChange = (path: string, value: string | number | boolean | string[] | Record<string, unknown>) => {
    const newContent = { ...content };
    const pathParts = path.split('.');
    
    let current = newContent;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]] as Record<string, unknown>;
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    setContent(newContent);
    
    // Update YAML content
    const newYamlContent = stringifyYaml(newContent);
    setYamlContent(newYamlContent);
  };

  const handleSave = () => {
    if (file && isValid) {
      onFileChange(file.id, yamlContent);
    }
  };

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-400 mb-2">No File Selected</h3>
          <p className="text-gray-500">Select a file from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">{file.name}</h2>
              <p className="text-gray-400 text-sm">{file.path}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-sm ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {isValid ? 'Valid' : `${errors.length} error${errors.length !== 1 ? 's' : ''}`}
                </span>
              </div>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Schema Form */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">{schema.title || 'Configuration'}</h3>
              {schema.description && (
                <p className="text-gray-400 mb-6">{schema.description}</p>
              )}

              <div className="space-y-6">
                {Object.entries(schema.properties).map(([key, property]) => (
                  <FormField
                    key={key}
                    name={key}
                    property={property}
                    value={content[key]}
                    onChange={(value) => handleFieldChange(key, value)}
                    required={schema.required?.includes(key) || false}
                    errors={errors.filter(e => e.path.startsWith(key))}
                  />
                ))}
              </div>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="mt-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2">Validation Errors</h4>
                <ul className="space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-red-300 text-sm">
                      <span className="font-mono">{error.path}</span>: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};