// src/schemaLoader.js
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import v1_0 from '../schemas/ascfdl.schema-1.0.json' with { type: 'json' };
import v1_1 from '../schemas/ascfdl.schema-1.1.json' with { type: 'json' };

const ajv = new Ajv2020({ allErrors: true, strict: false, verbose: true });
addFormats(ajv);

// Map of schemas
const schemaMap = {
  '1.0': ajv.compile(v1_0),
  '1.1': ajv.compile(v1_1),
};

export function pickValidator({ major, minor }) {
  const key = `${major}.${minor}`;
  return schemaMap[key]
      ?? schemaMap[`${major}.latest`]
      ?? null;              // unknown/beta schema → handle gracefully
}
