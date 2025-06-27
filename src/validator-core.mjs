// src/validator-core.mjs
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { validateIdTree } from './idTree.mjs';
import { pickValidator } from './schemaLoader.mjs';

// Helpers
function formatAjvError(err) {
  const path  = err.instancePath || '/';
  const value = JSON.stringify(err.data);

  // Make errors from Ajv "pretty"
  switch (err.keyword) {
    case 'const':
      return `${path}: value ${value} must equal ${JSON.stringify(err.params.allowedValue)}`;
    case 'pattern':
      return `${path}: value ${value} must match pattern ${err.params.pattern}`;
    case 'type':
      return `${path}: value ${value} must be of type ${err.params.type}`;
    case 'maxLength':
    case 'minLength':
      return `${path}: string ${value} length must ${err.keyword === 'maxLength' ? 'not exceed' : 'be at least'} ${err.params.limit} characters`;
    case 'additionalProperties':
      return `${path}: unknown additional property "${err.params.additionalProperty}"`;
    default:
      return `${path}: ${err.message} (value: ${value})`;
  }
}

// Shared Ajv instance
const ajv = new Ajv2020({ allErrors: true, strict: false, verbose: true });
addFormats(ajv);

// Validate FDL file contents (already parsed JSON).
export function validateFdlObject(fdl, { verbose = true } = {}) {
  // Setup
  const errors = [];

  // Get version and validator for version
  const { version } = fdl;
  if (verbose) console.log(`FDL Spec version ${version.major}.${version.minor} detected`);
  const validate = pickValidator(version);

  // No schema found for version
  if (!validate) {
    if (verbose) console.error(`No schema for version ${version?.major}.${version?.minor}`);
    errors.push(`No schema for version ${version?.major}.${version?.minor}`);
    return {version, errors};
  }

  // Errors in schema validation
  if (!validate(fdl)) {
    for (const err of validate.errors) {
      if (verbose) console.error(formatAjvError(err));
      errors.push(formatAjvError(err));
    }
  }

  // Errors in ID Tree
  try {
    validateIdTree(fdl);
  } catch (error) {
    if (verbose) console.error(`ID Tree Error: ${error.message}`);
    errors.push(`ID Tree Error: ${error.message}`);
  }

  // Return version and errors
  return {version, errors};
}

// Validate FDL file from a string.
export function validateFdlContent(content, { verbose = true } = {}) {
  // Setup
  let fdl;

  // Catch errors
  try {
    // Get JS object from FDL JSON
    fdl = JSON.parse(content);
  } catch (error) {
    if (verbose) console.error(`JSON Decode Error: ${error.message}`);
    return {version: null, errors: [`JSON Decode Error: ${error.message}`]};
  }

  // Validate FDL as JS Object
  return validateFdlObject(fdl, { verbose });
}
