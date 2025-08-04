import { Repository, JsonSchema } from '../types';
import { stringifyYaml } from '../utils/yamlUtils';

export const mockRepository: Repository = {
  id: 'repo-1',
  name: 'config-management',
  url: 'https://gitlab.local/team/config-management',
  localPath: '/workspace/config-management',
  files: [
    {
      id: 'file-1',
      name: 'app-config.yaml',
      path: 'config/app-config.yaml',
      content: stringifyYaml({
        name: 'MyApplication',
        version: '2.1.0',
        environment: 'production',
        features: ['logging', 'monitoring', 'caching'],
        database: {
          host: 'db.example.com',
          port: 5432,
          ssl: true
        },
        cache: {
          enabled: true,
          ttl: 3600
        }
      })
    },
    {
      id: 'file-2',
      name: 'service-config.yaml',
      path: 'config/service-config.yaml',
      content: stringifyYaml({
        name: 'UserService',
        version: '1.5.2',
        environment: 'staging',
        features: ['authentication', 'authorization'],
        database: {
          host: 'staging-db.example.com',
          port: 5432,
          ssl: false
        },
        cache: {
          enabled: false,
          ttl: 1800
        }
      })
    },
    {
      id: 'file-3',
      name: 'deployment.yaml',
      path: 'deploy/deployment.yaml',
      content: stringifyYaml({
        name: 'WebApp',
        version: '3.0.0',
        environment: 'development',
        features: ['hot-reload', 'debug'],
        database: {
          host: 'localhost',
          port: 5432,
          ssl: false
        },
        cache: {
          enabled: true,
          ttl: 300
        }
      })
    }
  ]
};

export const mockSchema: JsonSchema = {
  type: 'object',
  title: 'Application Configuration',
  description: 'Configuration schema for application services',
  required: ['name', 'version', 'environment'],
  properties: {
    name: {
      type: 'string',
      title: 'Application Name',
      description: 'The name of the application or service',
      minLength: 1,
      maxLength: 100
    },
    version: {
      type: 'string',
      title: 'Version',
      description: 'Semantic version of the application',
      format: 'version'
    },
    environment: {
      type: 'string',
      title: 'Environment',
      description: 'Target deployment environment',
      enum: ['development', 'staging', 'production']
    },
    features: {
      type: 'array',
      title: 'Features',
      description: 'List of enabled features',
      items: {
        type: 'string'
      }
    },
    database: {
      type: 'object',
      title: 'Database Configuration',
      description: 'Database connection settings',
      required: ['host', 'port'],
      properties: {
        host: {
          type: 'string',
          title: 'Host',
          description: 'Database host address'
        },
        port: {
          type: 'integer',
          title: 'Port',
          description: 'Database port number',
          minimum: 1,
          maximum: 65535,
          default: 5432
        },
        ssl: {
          type: 'boolean',
          title: 'SSL Enabled',
          description: 'Enable SSL connection',
          default: true
        }
      }
    },
    cache: {
      type: 'object',
      title: 'Cache Configuration',
      description: 'Caching system settings',
      properties: {
        enabled: {
          type: 'boolean',
          title: 'Cache Enabled',
          description: 'Enable caching system',
          default: false
        },
        ttl: {
          type: 'integer',
          title: 'TTL (seconds)',
          description: 'Time to live for cached items',
          minimum: 0,
          default: 3600
        }
      }
    },
    logging: {
      type: 'object',
      title: 'Logging Configuration',
      description: 'Application logging settings',
      properties: {
        level: {
          type: 'string',
          title: 'Log Level',
          description: 'Minimum log level to record',
          enum: ['debug', 'info', 'warn', 'error']
        },
        format: {
          type: 'string',
          title: 'Log Format',
          description: 'Output format for log messages',
          enum: ['json', 'text', 'structured']
        }
      }
    },
    description: {
      type: 'string',
      title: 'Description',
      description: 'Detailed description of the application',
      format: 'textarea'
    }
  }
};