import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schemaCache = new Map();

/**
 * Loads the named schema from schemas/<name>.yaml (OpenAPI components/schemas/<name>).
 * Results are cached so each YAML file is parsed only once per process.
 */
export function loadSchema(schemaName) {
  if (schemaCache.has(schemaName)) {
    return schemaCache.get(schemaName);
  }

  const filePath = resolve(__dirname, `../schemas/${schemaName}.yaml`);
  const doc = yaml.load(readFileSync(filePath, 'utf8'));
  const schema = doc.components.schemas[schemaName];

  if (!schema) {
    throw new Error(
      `Schema "${schemaName}" not found in components.schemas of ${filePath}`,
    );
  }

  schemaCache.set(schemaName, schema);
  return schema;
}

/**
 * Validates data against the named schema.
 * Returns { valid: boolean, errors: AJV error objects[] }.
 */
export function validateEvent(schemaName, data) {
  const schema = loadSchema(schemaName);
  const validate = ajv.compile(schema);
  const valid = validate(data);

  return {
    valid,
    errors: validate.errors ?? [],
  };
}
