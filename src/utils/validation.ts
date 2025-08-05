import { JsonSchema, SchemaProperty, ValidationError } from '../types';

export const validateAgainstSchema = (data: Record<string, unknown>, schema: JsonSchema): ValidationError[] => {
  const errors: ValidationError[] = [];

  const validateValue = (value: unknown, property: SchemaProperty, path: string) => {
    // Check required fields
    if (value === undefined || value === null || value === '') {
      return; // Handle required validation at object level
    }

    // Type validation
    switch (property.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({ path, message: 'Must be a string' });
          return;
        }
        
        if (property.minLength && value.length < property.minLength) {
          errors.push({ path, message: `Must be at least ${property.minLength} characters` });
        }
        
        if (property.maxLength && value.length > property.maxLength) {
          errors.push({ path, message: `Must be no more than ${property.maxLength} characters` });
        }
        
        if (property.enum && !property.enum.includes(value)) {
          errors.push({ path, message: `Must be one of: ${property.enum.join(', ')}` });
        }
        break;

      case 'number':
      case 'integer':
        if (typeof value !== 'number' || (property.type === 'integer' && !Number.isInteger(value))) {
          errors.push({ path, message: `Must be ${property.type === 'integer' ? 'an integer' : 'a number'}` });
          return;
        }
        
        if (property.minimum !== undefined && value < property.minimum) {
          errors.push({ path, message: `Must be at least ${property.minimum}` });
        }
        
        if (property.maximum !== undefined && value > property.maximum) {
          errors.push({ path, message: `Must be no more than ${property.maximum}` });
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({ path, message: 'Must be a boolean' });
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push({ path, message: 'Must be an array' });
          return;
        }
        
        if (property.items) {
          value.forEach((item, index) => {
            validateValue(item, property.items!, `${path}[${index}]`);
          });
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push({ path, message: 'Must be an object' });
          return;
        }
        
        if (property.properties) {
          // Check required properties
          if (property.required) {
            property.required.forEach(requiredKey => {
              if (!(requiredKey in value) || value[requiredKey] === undefined || value[requiredKey] === null || value[requiredKey] === '') {
                errors.push({ path: `${path}.${requiredKey}`, message: 'This field is required' });
              }
            });
          }
          
          // Validate existing properties
          Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
            if (property.properties![key]) {
              validateValue(val, property.properties![key], `${path}.${key}`);
            }
          });
        }
        break;
    }
  };

  // Check required root properties
  if (schema.required) {
    schema.required.forEach(requiredKey => {
      if (!(requiredKey in data) || data[requiredKey] === undefined || data[requiredKey] === null || data[requiredKey] === '') {
        errors.push({ path: requiredKey, message: 'This field is required' });
      }
    });
  }

  // Validate root properties
  Object.entries(data).forEach(([key, value]) => {
    if (schema.properties[key]) {
      validateValue(value, schema.properties[key], key);
    }
  });

  return errors;
};