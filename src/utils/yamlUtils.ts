import yaml from 'js-yaml';

export const parseYaml = (yamlString: string): Record<string, unknown> => {
  try {
    if (!yamlString || yamlString.trim() === '') {
      return {};
    }
    return yaml.load(yamlString) as Record<string, unknown>;
  } catch (error) {
    console.error('Error parsing YAML:', error);
    return {};
  }
};

export const stringifyYaml = (data: Record<string, unknown>): string => {
  try {
    return yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
  } catch (error) {
    console.error('Error stringifying YAML:', error);
    return '';
  }
};

export const formatYamlForDisplay = (data: Record<string, unknown>): string => {
  return stringifyYaml(data).trim();
};