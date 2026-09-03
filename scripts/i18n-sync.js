const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = path.resolve(__dirname, '..');
const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git', '.vscode', '.husky', 'dev-dist'];

// Flatten nested JSON objects to dot-separated keys
function flattenObject(obj, prefix = '') {
  let flattened = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propName = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], propName));
      } else {
        flattened[propName] = obj[key];
      }
    }
  }
  return flattened;
}

// Unflatten dot-separated keys to nested JSON object
function unflattenObject(flatObj) {
  const result = {};
  for (const key in flatObj) {
    if (Object.prototype.hasOwnProperty.call(flatObj, key)) {
      const keys = key.split('.');
      let current = result;
      for (let i = 0; i < keys.length; i++) {
        const part = keys[i];
        if (i === keys.length - 1) {
          current[part] = flatObj[key];
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      }
    }
  }
  return result;
}

// Find all en.json files recursively
function findEnJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        findEnJsonFiles(filePath, fileList);
      }
    } else if (file === 'en.json') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function syncDictionaries() {
  console.log('=== Synchronizing i18n Dictionaries ===\n');
  const enFiles = findEnJsonFiles(WORKSPACE_DIR);

  for (const enPath of enFiles) {
    const dir = path.dirname(enPath);
    const relativeDir = path.relative(WORKSPACE_DIR, dir);
    console.log(`Syncing files in: ${relativeDir}`);

    let enContent;
    try {
      enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    } catch (err) {
      console.error(`  Error parsing en.json: ${err.message}`);
      continue;
    }

    const enFlat = flattenObject(enContent);
    const enKeys = Object.keys(enFlat);

    const targetLangs = ['ar', 'fr'];
    for (const lang of targetLangs) {
      const targetPath = path.join(dir, `${lang}.json`);
      let targetContent = {};

      if (fs.existsSync(targetPath)) {
        try {
          targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        } catch (err) {
          console.error(`  Failed to parse existing ${lang}.json: ${err.message}. Overwriting.`);
        }
      } else {
        console.log(`  Creating missing file: ${lang}.json`);
      }

      const targetFlat = flattenObject(targetContent);
      const newTargetFlat = {};

      for (const enKey of enKeys) {
        // Look up key directly or with 'auth.' prefix, or stripped of 'auth.' prefix
        let value = targetFlat[enKey];

        if (value === undefined && !enKey.startsWith('auth.')) {
          // If enKey is 'signIn.title', try 'auth.signIn.title'
          value = targetFlat[`auth.${enKey}`];
        }

        if (value === undefined && enKey.startsWith('auth.')) {
          // If enKey is 'auth.account.address', try 'account.address'
          const stripped = enKey.replace(/^auth\./, '');
          value = targetFlat[stripped];
        }

        // If still undefined, fallback to the English value as placeholder
        if (value === undefined) {
          value = enFlat[enKey];
          console.log(`  [Warning] Key "${enKey}" missing in ${lang}.json. Fallback to English value.`);
        }

        newTargetFlat[enKey] = value;
      }

      // Write back synced file
      const newTargetContent = unflattenObject(newTargetFlat);
      fs.writeFileSync(targetPath, JSON.stringify(newTargetContent, null, 2) + '\n', 'utf8');
      console.log(`  Successfully synced ${lang}.json`);
    }
  }

  console.log('\nAll dictionaries synced!');
}

syncDictionaries();
