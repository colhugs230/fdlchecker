// src/validator-node.mjs
import { validateFdlContent } from './validator-core.mjs';

// Node-only convenience function: validate by filename.
export async function validateFdlFile(filename, { verbose = true } = {}) {
  // Import node:fs/promises
  const fs = await import('node:fs/promises');

  // Read in file
  const content = await fs.readFile(filename, 'utf8');
  if (verbose) console.log(`===== Validating '${filename}' =====`);

  // Validate the content
  return validateFdlContent(content, { verbose });
}
