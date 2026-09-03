const fs = require('fs');
const path = require('path');

let ts = null;
try {
  ts = require('typescript');
} catch (error) {
  ts = null;
}

const ROOT = process.cwd();
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'];
const SKIP_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  '.vite',
  'coverage',
  'dev-dist',
  'dist',
  'docs',
  'e2e',
  'logs',
  'node_modules',
  'playwright',
  'public',
]);
const IGNORE_FILE_PATTERNS = [
  /\.d\.ts$/i,
  /\.test\.[^.]+$/i,
  /\.spec\.[^.]+$/i,
  /\.stories\.[^.]+$/i,
  /test-setup\.[^.]+$/i,
  /\.tsbuildinfo$/i,
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function isIgnoredFile(filePath) {
  return IGNORE_FILE_PATTERNS.some((pattern) => pattern.test(filePath));
}

function findWorkspaceDirs() {
  const workspaceFile = path.join(ROOT, 'pnpm-workspace.yaml');
  const lines = fs.readFileSync(workspaceFile, 'utf8').split(/\r?\n/);
  const patterns = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line) => line.replace(/^-+\s*/, '').replace(/^["']|["']$/g, ''));

  const dirs = [];
  for (const pattern of patterns) {
    if (!pattern.includes('*')) {
      dirs.push(path.join(ROOT, pattern));
      continue;
    }

    const base = pattern.slice(0, pattern.indexOf('*'));
    const baseDir = path.join(ROOT, base);
    if (!fs.existsSync(baseDir)) {
      continue;
    }
    for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        dirs.push(path.join(baseDir, entry.name));
      }
    }
  }

  return dirs.filter((dir) => fs.existsSync(path.join(dir, 'package.json')));
}

function findPrimaryTsconfig(packageDir) {
  const appConfig = path.join(packageDir, 'tsconfig.app.json');
  if (fs.existsSync(appConfig)) {
    return appConfig;
  }
  const defaultConfig = path.join(packageDir, 'tsconfig.json');
  if (fs.existsSync(defaultConfig)) {
    return defaultConfig;
  }
  return null;
}

function parseTsconfigPaths(tsconfigPath) {
  if (!tsconfigPath) {
    return [];
  }

  const config = readJson(tsconfigPath);
  const compilerOptions = config.compilerOptions || {};
  const baseUrl = compilerOptions.baseUrl
    ? path.resolve(path.dirname(tsconfigPath), compilerOptions.baseUrl)
    : path.dirname(tsconfigPath);
  const paths = compilerOptions.paths || {};

  return Object.entries(paths).flatMap(([pattern, targets]) => {
    const targetList = Array.isArray(targets) ? targets : [targets];
    return targetList.map((target) => {
      const [fromPrefix, fromSuffix = ''] = pattern.split('*');
      const [toPrefix, toSuffix = ''] = String(target).split('*');
      return {
        pattern,
        hasWildcard: pattern.includes('*'),
        fromPrefix,
        fromSuffix,
        toPrefix,
        toSuffix,
        baseUrl,
      };
    });
  });
}

function collectPackages() {
  return findWorkspaceDirs().map((dir) => {
    const manifest = readJson(path.join(dir, 'package.json'));
    const srcDir = path.join(dir, 'src');
    return {
      dir,
      srcDir,
      name: manifest.name || path.basename(dir),
      manifest,
      tsconfigPath: findPrimaryTsconfig(dir),
      pathMappings: parseTsconfigPaths(findPrimaryTsconfig(dir)),
    };
  });
}

function walkSourceFiles(dir, files) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walkSourceFiles(fullPath, files);
      }
      continue;
    }

    if (!SOURCE_EXTENSIONS.includes(path.extname(entry.name))) {
      continue;
    }
    if (isIgnoredFile(entry.name)) {
      continue;
    }
    files.push(fullPath);
  }
}

function collectSourceFiles(packages) {
  const files = [];
  for (const pkg of packages) {
    walkSourceFiles(pkg.srcDir, files);
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function getNearestPackage(filePath, packages) {
  return packages
    .filter((pkg) => filePath.startsWith(pkg.dir + path.sep) || filePath === pkg.dir)
    .sort((a, b) => b.dir.length - a.dir.length)[0];
}

function getSubmoduleKey(pkg, filePath) {
  const relative = toPosix(path.relative(pkg.srcDir, filePath));
  const segments = relative.split('/').filter(Boolean);
  if (segments.length === 0) {
    return '(root)';
  }
  if (segments.length === 1) {
    return '(root)';
  }
  if (segments[0] === 'modules' && segments[1]) {
    return `modules/${segments[1]}`;
  }
  if (segments[0] === 'domain-kernel') {
    return 'domain-kernel';
  }
  if (segments[0] === 'idaas-facade') {
    return 'idaas-facade';
  }
  return segments[0];
}

function resolveCandidate(basePath) {
  const candidates = [];
  const ext = path.extname(basePath);

  if (ext) {
    candidates.push(basePath);
  } else {
    for (const extension of SOURCE_EXTENSIONS) {
      candidates.push(basePath + extension);
    }
    for (const extension of SOURCE_EXTENSIONS) {
      candidates.push(path.join(basePath, 'index' + extension));
    }
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

function resolveWithMappings(specifier, mappings) {
  for (const mapping of mappings) {
    if (!mapping.hasWildcard) {
      if (specifier !== mapping.pattern) {
        continue;
      }
      return resolveCandidate(path.resolve(mapping.baseUrl, mapping.toPrefix));
    }

    if (
      !specifier.startsWith(mapping.fromPrefix) ||
      !specifier.endsWith(mapping.fromSuffix)
    ) {
      continue;
    }

    const middle = specifier.slice(
      mapping.fromPrefix.length,
      specifier.length - mapping.fromSuffix.length,
    );
    const target = `${mapping.toPrefix}${middle}${mapping.toSuffix}`;
    const resolved = resolveCandidate(path.resolve(mapping.baseUrl, target));
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

function resolveInternalPackageImport(specifier, packagesByName) {
  for (const [name, pkg] of packagesByName.entries()) {
    if (specifier === name) {
      return resolveCandidate(path.join(pkg.srcDir, 'index'));
    }
    if (specifier.startsWith(name + '/')) {
      const suffix = specifier.slice(name.length + 1);
      return resolveCandidate(path.join(pkg.srcDir, suffix));
    }
  }
  return null;
}

function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (ts) {
    const processed = ts.preProcessFile(content, true, true);
    return processed.importedFiles.map((item) => item.fileName);
  }

  const specifiers = new Set();
  const patterns = [
    /import\s+[^'"]*?from\s+['"]([^'"]+)['"]/g,
    /export\s+[^'"]*?from\s+['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content))) {
      specifiers.add(match[1]);
    }
  }

  return [...specifiers];
}

function resolveImport(specifier, importer, packages, packagesByName) {
  const importerPkg = getNearestPackage(importer, packages);
  if (!importerPkg) {
    return null;
  }

  if (specifier.startsWith('.')) {
    return resolveCandidate(path.resolve(path.dirname(importer), specifier));
  }

  const mappingHit = resolveWithMappings(specifier, importerPkg.pathMappings);
  if (mappingHit) {
    return mappingHit;
  }

  const packageHit = resolveInternalPackageImport(specifier, packagesByName);
  if (packageHit) {
    return packageHit;
  }

  return null;
}

function createBucketMap() {
  return new Map();
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function topEntries(map, limit = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit);
}

function formatRatio(ca, ce) {
  const total = ca + ce;
  if (!total) {
    return '0.00';
  }
  return (ce / total).toFixed(2);
}

function formatList(items) {
  if (!items.length) {
    return 'None';
  }
  return items.map(([label, value]) => `${label} (${value})`).join(', ');
}

function analyze() {
  const packages = collectPackages();
  const packagesByName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const sourceFiles = collectSourceFiles(packages);
  const sourceFileSet = new Set(sourceFiles);
  const packageByFile = new Map(sourceFiles.map((filePath) => [filePath, getNearestPackage(filePath, packages)]));
  const submoduleByFile = new Map(
    sourceFiles.map((filePath) => {
      const pkg = packageByFile.get(filePath);
      return [filePath, pkg ? getSubmoduleKey(pkg, filePath) : '(unknown)'];
    }),
  );

  const fileStats = new Map();
  const packageStats = new Map();
  const submoduleStats = new Map();
  const packageEdges = createBucketMap();
  const submoduleEdges = createBucketMap();
  const externalImports = createBucketMap();

  for (const pkg of packages) {
    packageStats.set(pkg.name, {
      package: pkg,
      files: sourceFiles.filter((filePath) => packageByFile.get(filePath)?.name === pkg.name),
      outgoingPackages: new Set(),
      incomingPackages: new Set(),
      outgoingEdges: createBucketMap(),
      incomingEdges: createBucketMap(),
      crossPackageFileEdges: 0,
      internalFileEdges: 0,
      externalDeps: createBucketMap(),
    });
  }

  function ensureFileStat(filePath) {
    if (!fileStats.has(filePath)) {
      fileStats.set(filePath, {
        out: new Set(),
        in: new Set(),
        crossPackageOut: new Set(),
        crossPackageIn: new Set(),
      });
    }
    return fileStats.get(filePath);
  }

  function ensureSubmoduleStat(key, pkgName, submodule) {
    if (!submoduleStats.has(key)) {
      submoduleStats.set(key, {
        key,
        packageName: pkgName,
        submodule,
        files: new Set(),
        outgoing: new Set(),
        incoming: new Set(),
        outgoingEdges: createBucketMap(),
        incomingEdges: createBucketMap(),
      });
    }
    return submoduleStats.get(key);
  }

  for (const filePath of sourceFiles) {
    const importerPkg = packageByFile.get(filePath);
    const importerSubmodule = submoduleByFile.get(filePath);
    const importerSubmoduleKey = `${importerPkg.name}:${importerSubmodule}`;

    ensureSubmoduleStat(importerSubmoduleKey, importerPkg.name, importerSubmodule).files.add(filePath);

    const imports = extractImports(filePath);
    for (const specifier of imports) {
      const resolved = resolveImport(specifier, filePath, packages, packagesByName);
      if (!resolved || !sourceFileSet.has(resolved)) {
        if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
          increment(externalImports, specifier);
          packageStats.get(importerPkg.name).externalDeps.set(
            specifier,
            (packageStats.get(importerPkg.name).externalDeps.get(specifier) || 0) + 1,
          );
        }
        continue;
      }

      const targetPkg = packageByFile.get(resolved);
      const targetSubmodule = submoduleByFile.get(resolved);
      const targetSubmoduleKey = `${targetPkg.name}:${targetSubmodule}`;

      ensureSubmoduleStat(targetSubmoduleKey, targetPkg.name, targetSubmodule).files.add(resolved);

      ensureFileStat(filePath).out.add(resolved);
      ensureFileStat(resolved).in.add(filePath);

      const packageStat = packageStats.get(importerPkg.name);
      if (importerPkg.name === targetPkg.name) {
        packageStat.internalFileEdges += 1;
      } else {
        packageStat.crossPackageFileEdges += 1;
        packageStat.outgoingPackages.add(targetPkg.name);
        packageStats.get(targetPkg.name).incomingPackages.add(importerPkg.name);
        increment(packageStat.outgoingEdges, targetPkg.name);
        increment(packageStats.get(targetPkg.name).incomingEdges, importerPkg.name);
        increment(packageEdges, `${importerPkg.name}=>${targetPkg.name}`);

        ensureFileStat(filePath).crossPackageOut.add(resolved);
        ensureFileStat(resolved).crossPackageIn.add(filePath);
      }

      if (importerSubmoduleKey !== targetSubmoduleKey) {
        ensureSubmoduleStat(importerSubmoduleKey, importerPkg.name, importerSubmodule).outgoing.add(targetSubmoduleKey);
        ensureSubmoduleStat(targetSubmoduleKey, targetPkg.name, targetSubmodule).incoming.add(importerSubmoduleKey);
        increment(
          ensureSubmoduleStat(importerSubmoduleKey, importerPkg.name, importerSubmodule).outgoingEdges,
          targetSubmoduleKey,
        );
        increment(
          ensureSubmoduleStat(targetSubmoduleKey, targetPkg.name, targetSubmodule).incomingEdges,
          importerSubmoduleKey,
        );
        increment(submoduleEdges, `${importerSubmoduleKey}=>${targetSubmoduleKey}`);
      }
    }
  }

  return {
    packages,
    sourceFiles,
    packageStats,
    submoduleStats,
    fileStats,
    packageEdges,
    submoduleEdges,
    externalImports,
  };
}

function buildMarkdown(result) {
  const analyzedAt = new Date().toISOString();
  const packageRows = [...result.packageStats.values()]
    .sort((a, b) => {
      const aScore = a.outgoingPackages.size + a.incomingPackages.size;
      const bScore = b.outgoingPackages.size + b.incomingPackages.size;
      return bScore - aScore || a.package.name.localeCompare(b.package.name);
    })
    .map((stat) => {
      const ca = stat.incomingPackages.size;
      const ce = stat.outgoingPackages.size;
      return `| ${stat.package.name} | ${stat.files.length} | ${ce} | ${ca} | ${formatRatio(ca, ce)} | ${formatList(topEntries(stat.outgoingEdges, 3))} | ${formatList(topEntries(stat.incomingEdges, 3))} |`;
    });

  const topPackageEdges = [...result.packageEdges.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 20)
    .map(([edge, count]) => {
      const [from, to] = edge.split('=>');
      return `| ${from} | ${to} | ${count} |`;
    });

  const topSubmodules = [...result.submoduleStats.values()]
    .sort((a, b) => {
      const aScore = a.incoming.size + a.outgoing.size;
      const bScore = b.incoming.size + b.outgoing.size;
      return bScore - aScore || a.key.localeCompare(b.key);
    })
    .slice(0, 25)
    .map((stat) => {
      return `| ${stat.packageName} | ${stat.submodule} | ${stat.files.size} | ${stat.outgoing.size} | ${stat.incoming.size} | ${formatList(topEntries(stat.outgoingEdges, 3))} | ${formatList(topEntries(stat.incomingEdges, 3))} |`;
    });

  const topSubmoduleEdges = [...result.submoduleEdges.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 25)
    .map(([edge, count]) => {
      const [from, to] = edge.split('=>');
      return `| ${from} | ${to} | ${count} |`;
    });

  const topFiles = [...result.fileStats.entries()]
    .sort((a, b) => {
      const aScore = a[1].in.size + a[1].out.size;
      const bScore = b[1].in.size + b[1].out.size;
      return bScore - aScore || a[0].localeCompare(b[0]);
    })
    .slice(0, 25)
    .map(([filePath, stat]) => {
      const pkg = result.packages.find((candidate) => filePath.startsWith(candidate.dir + path.sep));
      const submodule = pkg ? getSubmoduleKey(pkg, filePath) : '(unknown)';
      return `| ${toPosix(path.relative(ROOT, filePath))} | ${pkg?.name || '(unknown)'} | ${submodule} | ${stat.out.size} | ${stat.in.size} | ${stat.crossPackageOut.size} | ${stat.crossPackageIn.size} |`;
    });

  const packageDeepDives = [...result.packageStats.values()]
    .filter((stat) => {
      const submodules = [...result.submoduleStats.values()].filter(
        (submoduleStat) => submoduleStat.packageName === stat.package.name,
      );
      return submodules.length > 1;
    })
    .sort((a, b) => b.files.length - a.files.length || a.package.name.localeCompare(b.package.name))
    .map((stat) => {
      const submodules = [...result.submoduleStats.values()]
        .filter((submoduleStat) => submoduleStat.packageName === stat.package.name)
        .sort((a, b) => {
          const aScore = a.incoming.size + a.outgoing.size;
          const bScore = b.incoming.size + b.outgoing.size;
          return bScore - aScore || a.submodule.localeCompare(b.submodule);
        })
        .slice(0, 8)
        .map(
          (submoduleStat) =>
            `- \`${submoduleStat.submodule}\`: ${submoduleStat.files.size} files, outgoing to ${submoduleStat.outgoing.size} sub-modules, incoming from ${submoduleStat.incoming.size}; strongest outgoing ${formatList(
              topEntries(submoduleStat.outgoingEdges, 2),
            )}.`,
        )
        .join('\n');

      const externalDeps = topEntries(stat.externalDeps, 5)
        .map(([name, count]) => `${name} (${count})`)
        .join(', ');

      return `### ${stat.package.name}\n- Files analyzed: ${stat.files.length}\n- Package efferent coupling (Ce): ${stat.outgoingPackages.size}\n- Package afferent coupling (Ca): ${stat.incomingPackages.size}\n- Strongest package dependencies: ${formatList(topEntries(stat.outgoingEdges, 5))}\n- Strongest package dependents: ${formatList(topEntries(stat.incomingEdges, 5))}\n- Most referenced external imports: ${externalDeps || 'None'}\n${submodules}`;
    })
    .join('\n\n');

  return `# Module Coupling Report

- Scope: workspace source files under \`app/src\` and \`packages/**/src\`
- Generated: ${analyzedAt}
- Source files analyzed: ${result.sourceFiles.length}
- Workspace packages analyzed: ${result.packages.length}
- Sub-modules identified: ${result.submoduleStats.size}
- Exclusions: \`node_modules\`, \`dist\`, \`dev-dist\`, \`public\`, \`e2e\`, \`playwright\`, tests/specs/stories, type declaration files

## How To Read This

- \`Ce\` (efferent coupling) is the number of other workspace packages a package depends on.
- \`Ca\` (afferent coupling) is the number of other workspace packages depending on it.
- \`Instability\` is \`Ce / (Ca + Ce)\`; closer to \`1.00\` means the package mainly depends outward, closer to \`0.00\` means it is a stable dependency used by others.
- Sub-module keys use the first meaningful source boundary: \`modules/<name>\`, \`domain-kernel\`, or the first folder under \`src\`.

## Package Overview

| Package | Files | Ce | Ca | Instability | Strongest outgoing | Strongest incoming |
| --- | ---: | ---: | ---: | ---: | --- | --- |
${packageRows.join('\n')}

## Strongest Package-To-Package Edges

| From | To | File-level edges |
| --- | --- | ---: |
${topPackageEdges.join('\n')}

## Top Sub-Modules By Coupling

| Package | Sub-module | Files | Outgoing sub-modules | Incoming sub-modules | Strongest outgoing | Strongest incoming |
| --- | --- | ---: | ---: | ---: | --- | --- |
${topSubmodules.join('\n')}

## Strongest Sub-Module Edges

| From | To | File-level edges |
| --- | --- | ---: |
${topSubmoduleEdges.join('\n')}

## File Hotspots

| File | Package | Sub-module | Internal out | Internal in | Cross-package out | Cross-package in |
| --- | --- | --- | ---: | ---: | ---: | ---: |
${topFiles.join('\n')}

## Package Deep Dives

${packageDeepDives}
`;
}

function main() {
  const result = analyze();
  const markdown = buildMarkdown(result);
  const outputPath = path.join(ROOT, 'docs', 'MODULE_COUPLING_REPORT.md');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log(`Wrote ${outputPath}`);
  console.log(`Analyzed ${result.sourceFiles.length} files across ${result.packages.length} packages and ${result.submoduleStats.size} sub-modules.`);
}

main();
