const fs = require("fs");
const path = require("path");

// Colors for output
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

const WORKSPACE_DIR = path.resolve(__dirname, "..");
const IGNORED_DIRS = [
  "node_modules",
  "dist",
  "build",
  ".git",
  ".vscode",
  ".husky",
  "dev-dist",
];

// Flatten nested JSON objects to dot-separated keys (e.g. { a: { b: "c" } } -> { "a.b": "c" })
function flattenObject(obj, prefix = "") {
  let flattened = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propName = prefix ? `${prefix}.${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(flattened, flattenObject(obj[key], propName));
      } else {
        flattened[propName] = obj[key];
      }
    }
  }
  return flattened;
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
    } else if (file === "en.json") {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function runLinter() {
  console.log(`${BOLD}${CYAN}=== CAP Boilerplate i18n Linter ===${RESET}\n`);

  const enFiles = findEnJsonFiles(WORKSPACE_DIR);
  if (enFiles.length === 0) {
    console.log(`${YELLOW}No translation files found.${RESET}`);
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const enPath of enFiles) {
    const relativeDir = path.relative(WORKSPACE_DIR, path.dirname(enPath));
    console.log(`${BOLD}Scanning dictionary in: ${relativeDir}/${RESET}`);

    // Parse en.json
    let enContent;
    try {
      enContent = JSON.parse(fs.readFileSync(enPath, "utf8"));
    } catch (err) {
      console.log(`  ${RED}Failed to parse en.json: ${err.message}${RESET}`);
      totalErrors++;
      continue;
    }
    const enFlat = flattenObject(enContent);
    const enKeys = Object.keys(enFlat);

    // Other target languages
    const targetLangs = ["ar", "fr"];
    for (const lang of targetLangs) {
      const targetPath = path.join(path.dirname(enPath), `${lang}.json`);
      if (!fs.existsSync(targetPath)) {
        console.log(
          `  ${RED}Error: Missing corresponding file: ${lang}.json${RESET}`,
        );
        totalErrors++;
        continue;
      }

      let targetContent;
      try {
        targetContent = JSON.parse(fs.readFileSync(targetPath, "utf8"));
      } catch (err) {
        console.log(
          `  ${RED}Failed to parse ${lang}.json: ${err.message}${RESET}`,
        );
        totalErrors++;
        continue;
      }
      const targetFlat = flattenObject(targetContent);
      const targetKeys = Object.keys(targetFlat);

      // Check for missing keys (present in English, missing in target)
      const missingKeys = enKeys.filter((k) => !(k in targetFlat));
      if (missingKeys.length > 0) {
        console.log(
          `  ${RED}Missing keys in ${lang}.json (${missingKeys.length}):${RESET}`,
        );
        missingKeys.forEach((k) => console.log(`    - ${k}`));
        totalErrors += missingKeys.length;
      }

      // Check for extraneous keys (present in target, missing in English)
      const extraneousKeys = targetKeys.filter((k) => !(k in enFlat));
      if (extraneousKeys.length > 0) {
        console.log(
          `  ${RED}Extraneous keys in ${lang}.json (${extraneousKeys.length}):${RESET}`,
        );
        extraneousKeys.forEach((k) => console.log(`    - ${k}`));
        totalErrors += extraneousKeys.length;
      }

      // Check for untranslated keys (value matches English value exactly, excluding trivial ones)
      const untranslatedKeys = enKeys.filter((k) => {
        if (k in targetFlat) {
          const val = targetFlat[k];
          const enVal = enFlat[k];
          // Only check strings with length > 2 and containing letters (to avoid numbers/symbols warning)
          return (
            typeof val === "string" &&
            val === enVal &&
            val.trim().length > 2 &&
            /[a-zA-Z]/.test(val)
          );
        }
        return false;
      });
      if (untranslatedKeys.length > 0) {
        console.log(
          `  ${YELLOW}Warning: Untranslated keys in ${lang}.json (${untranslatedKeys.length}):${RESET}`,
        );
        untranslatedKeys.forEach((k) =>
          console.log(`    - ${k} ("${enFlat[k]}")`),
        );
        totalWarnings += untranslatedKeys.length;
      }
    }

    // Check for duplicate translation values in en.json itself
    const enValToKeys = {};
    enKeys.forEach((k) => {
      const val = enFlat[k];
      if (typeof val === "string" && val.trim().length > 2) {
        if (!enValToKeys[val]) {
          enValToKeys[val] = [];
        }
        enValToKeys[val].push(k);
      }
    });

    const duplicateVals = Object.keys(enValToKeys).filter(
      (v) => enValToKeys[v].length > 1,
    );
    if (duplicateVals.length > 0) {
      console.log(
        `  ${YELLOW}Warning: Duplicate translation values in en.json:${RESET}`,
      );
      duplicateVals.forEach((v) => {
        console.log(
          `    Value "${v}" is used by keys: ${enValToKeys[v].join(", ")}`,
        );
      });
      totalWarnings += duplicateVals.length;
    }

    console.log("");
  }

  console.log(`${BOLD}Linter Finished Summary:${RESET}`);
  console.log(
    `  - Total Errors: ${totalErrors > 0 ? RED : GREEN}${totalErrors}${RESET}`,
  );
  console.log(
    `  - Total Warnings: ${totalWarnings > 0 ? YELLOW : GREEN}${totalWarnings}${RESET}\n`,
  );

  if (totalErrors > 0) {
    console.log(
      `${RED}i18n Linter Failed: Fix structural errors above before committing.${RESET}`,
    );
    process.exit(1);
  } else {
    console.log(`${GREEN}i18n Linter Passed successfully!${RESET}`);
    process.exit(0);
  }
}

runLinter();
