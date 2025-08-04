import React from 'react';
import { SchemaProperty, ValidationError } from '../types';

interface FormFieldProps {
  name: string;
  property: SchemaProperty;
  value: any;
  onChange: (value: any) => void;
  required: boolean;
  errors: ValidationError[];
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  property,
  value,
  onChange,
  required,
  errors
}) => {
  const hasError = errors.length > 0;

  const renderField = () => {
    switch (property.type) {
      case 'string':
        if (property.enum) {
          return (
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 ${
                hasError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-blue-500'
              }`}
            >
              <option value="">Select an option</option>
              {property.enum.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        
        if (property.format === 'textarea') {
          return (
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={property.description}
              rows={4}
              className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 resize-vertical ${
                hasError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-blue-500'
              }`}
            />
          );
        }

        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.description}
            className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 ${
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-blue-500'
            }`}
          />
        );

      case 'number':
      case 'integer':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={property.minimum}
            max={property.maximum}
            className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 ${
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-blue-500'
            }`}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">Enable</span>
          </label>
        );

      case 'array':
        const arrayValue = value || [];
        return (
          <div className="space-y-2">
            {arrayValue.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newArray = [...arrayValue];
                    newArray[index] = e.target.value;
                    onChange(newArray);
                  }}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newArray = arrayValue.filter((_: any, i: number) => i !== index);
                    onChange(newArray);
                  }}
                  className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange([...arrayValue, ''])}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Add Item
            </button>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            Unsupported field type: {property.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {property.title || name}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {property.description && (
        <p className="text-sm text-gray-500">{property.description}</p>
      )}
      {renderField()}
      {hasError && (
        <div className="text-red-400 text-sm">
          {errors.map((error, index) => (
            <div key={index}>{error.message}</div>
          ))}
        </div>
      )}
    </div>
  );
};