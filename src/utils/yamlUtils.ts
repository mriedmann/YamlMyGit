import yaml from 'js-yaml';

export const parseYaml = (yamlString: string): any => {
  try {
    if (!yamlString || yamlString.trim() === '') {
      return {};
    }
    return yaml.load(yamlString);
  } catch (error) {
    console.error('Error parsing YAML:', error);
    return {};
  }
};

export const stringifyYaml = (data: any): string => {
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

export const formatYamlForDisplay = (data: any): string => {
  return stringifyYaml(data).trim();
};