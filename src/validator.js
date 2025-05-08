// src/validator.js
import fs from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { validateIdTree } from './idTree.js';
import { pickValidator } from './schemaLoader.js';

// Helpers
function formatAjvError(err) {
  const path  = err.instancePath || '/';
  const value = JSON.stringify(err.data);

  switch (err.keyword) {
    case 'const':
      // { allowedValue }
      return `${path}: value ${value} must equal ${JSON.stringify(err.params.allowedValue)}`;

    case 'pattern':
      // { pattern }
      return `${path}: value ${value} must match pattern ${err.params.pattern}`;

    case 'type':
      // { type }
      return `${path}: value ${value} must be of type ${err.params.type}`;

    case 'maxLength':
    case 'minLength':
      // { limit }
      return `${path}: string ${value} length must ${err.keyword == 'maxLength' ? 'not exceed' : 'be at least'} ${err.params.limit} characters`;

    case 'additionalProperties':
      // { additionalProperty }
      return `${path}: unknown additional property "${err.params.additionalProperty}"`;

    default:
      // fallback to Ajv’s own message
      return `${path}: ${err.message} (value: ${value})`;
  }
}

// one Ajv instance = many files
const ajv = new Ajv2020({ allErrors: true, strict: false, verbose: true });
addFormats(ajv);

// Validate one FDL file. Returns number of errors (0 == success)
export async function validateFdlFile (filename, { verbose = true } = {}) {
  if (verbose) console.log(`===== Validating '${filename}' =====`);
  let errors = 0;

  let fdl;
  try {
    fdl = JSON.parse(await fs.readFile(filename, 'utf8'));
  } catch (error) {
    console.error(`JSON Decode Error: ${error.message}`);
    return 1;
  }

  const { version } = fdl;
  const validate = pickValidator(version);

  if (!validate) {
    console.error(`No schema for version ${version.major}.${version.minor}`);
    return 1;
  }

  if (!validate(fdl)) {
    for (const err of validate.errors) console.error(formatAjvError(err));
    return validate.errors.length;
  }

  try {
    validateIdTree(fdl);
  } catch (error) {
    console.error(`ID Tree Error: ${error.message}`);
    errors += 1;
  }
  return errors;
}
