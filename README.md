# ASC FDL Checker (fdl-checker)

Validate **ASC Framing Decision List (FDL)** files against the official JSON‑Schema – from the command line **or** programmatically.

![Node](https://badgen.net/badge/node/%3E=14/green)

---

## ✨ Features

* **Schema‑level validation** with [Ajv 8] – fast, standards‑compliant.
* **Logical cross‑checks** (duplicate IDs, broken references, etc.) that JSON‑Schema alone can’t express.
* **Version‑aware**: validates each file against the *exact* schema that matches `version.major/minor`.
* **Human‑friendly errors** – shows the failing value, expected constants / patterns, and logical‑tree messages.
* **Both CLI & API** in pure ES‑modules; zero runtime dependencies beyond Ajv.

---

## Install

```bash
# Local project usage
npm install --save-dev fdl-checker

# Global CLI (optional)
npm install --global fdl-checker
```

## CLI usage
```bash
fdl-checker <file.fdl> [more‑files...]

# exit‑code = total number of errors
```

## Example
```bash
$ fdl-checker tests/bad-v1.0.fdl
===== Validating 'tests/bad-v1.0.fdl' =====
/contexts/0/canvases/0/id: string "e9709e42‑…" length must not exceed 32 characters
/contexts/0/canvases/0/id: value "e9709e42‑…" must match pattern ^[A-Za-z0-9_]+$
ID Tree Error: Context (DXL2) > Canvas e9709e42‑… > Framing Decision 2‑1Framing: Framing Intent ID 2‑1Framing not in framing_intents
```

## Programmatic API
```javascript
import { validateFdlFile } from 'fdl-checker';

const errors = await validateFdlFile('path/to/shot.fdl', { verbose: false });
if (errors) {
  console.error(`${errors} validation errors`);
  process.exit(1);
}
```
