import { expect } from 'chai';
import { validateFdlFile, validateFdlContent, validateFdlObject } from '../src/validator.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const testDir = path.resolve('test-data');

function filePath(name) {
  return path.join(testDir, name);
}

describe('FDL Validator', () => {
  it('should return an empty array for valid FDL', async () => {
    const {version, errors} = await validateFdlFile(filePath('valid_v1-1.fdl'), { verbose: false });
    expect(version).to.be.an('object');
    expect(version.major).to.equal(1);
    expect(version.minor).to.equal(1);
    expect(errors).to.be.an('array').that.is.empty;
  });

  it('should fail JSON parsing for invalid content', () => {
    const invalidJson = '{ not: "json" ';
    const {version, errors} = validateFdlContent(invalidJson, { verbose: false });
    expect(errors).to.have.lengthOf(1);
    expect(version).to.be.null;
    expect(errors[0]).to.match(/^JSON Decode Error:/);
  });

  it('should validate parsed object with validateFdlObject() and return no errors', async () => {
    const content = await fs.readFile(filePath('valid_v1-1.fdl'), 'utf8');
    const json = JSON.parse(content);
    const {version, errors} = validateFdlObject(json, { verbose: false });
    expect(version).to.be.an('object');
    expect(version.major).to.equal(1);
    expect(version.minor).to.equal(1);
    expect(errors).to.be.an('array').that.is.empty;
  });

  it('should validate parsed object with validateFdlObject() and return errors', async () => {
    const content = await fs.readFile(filePath('invalid_v1-0.fdl'), 'utf8');
    const json = JSON.parse(content);
    const {version, errors} = validateFdlObject(json, { verbose: false });
    expect(version).to.be.an('object');
    expect(version.major).to.equal(1);
    expect(version.minor).to.equal(0);
    expect(errors).to.have.lengthOf(16);
  });
});
