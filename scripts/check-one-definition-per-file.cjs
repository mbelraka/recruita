#!/usr/bin/env node
/**
 * Enforce one type-level definition per file.
 *
 * TypeScript: at most one top-level class / enum / interface / type alias.
 * Java: at most one top-level type, and no public/package-private nested types.
 *
 * Exempt: frontend config + `*.constants.ts`; Java `@ConfigurationProperties`
 * and validation-message key catalogs; generated code; tests.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const TS_KIND = /^(?:export\s+(?:default\s+)?)?(?:declare\s+)?(?:abstract\s+)?(?:const\s+)?(class|enum|interface)\s+([A-Za-z_]\w*)/;
const TS_TYPE_ALIAS = /^(?:export\s+)?type\s+([A-Za-z_]\w*)\s*[=<]/;
const TS_TYPE_REEXPORT = /^(?:export\s+)?type\s*\{/;

const JAVA_TOP_LEVEL =
  /^(?:(?:public|protected|private)\s+)?(?:(?:abstract|final|sealed|non-sealed)\s+)*(class|interface|enum|record)\s+(\w+)/;
const JAVA_NESTED =
  /^(\s+)(?:(public|protected|private)\s+)?(?:static\s+)?(?:(?:abstract|final|sealed|non-sealed)\s+)*(class|interface|enum|record)\s+(\w+)/;

function parseArgs(argv) {
  const frontend = argv.includes('--frontend');
  const backend = argv.includes('--backend');
  if (!frontend && !backend) {
    return { frontend: true, backend: true };
  }
  return { frontend, backend };
}

function walkFiles(dir, extension, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, extension, files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  return files;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function isFrontendExempt(filePath) {
  const relative = toPosix(path.relative(ROOT, filePath));
  if (relative.includes('/generated/')) {
    return true;
  }
  if (relative.includes('/environments/')) {
    return true;
  }
  if (relative.includes('/src/app/config/')) {
    return true;
  }
  if (relative.endsWith('.spec.ts')) {
    return true;
  }
  if (relative.endsWith('.constants.ts') || relative.endsWith('.const.ts')) {
    return true;
  }
  if (relative.endsWith('.config.ts')) {
    return true;
  }
  return false;
}

function isBackendExempt(filePath) {
  const relative = toPosix(path.relative(ROOT, filePath));
  if (relative.includes('/generated/')) {
    return true;
  }
  if (relative.includes('/src/test/')) {
    return true;
  }
  if (relative.includes('/config/properties/')) {
    return true;
  }
  if (relative.includes('/config/validation/')) {
    return true;
  }
  return false;
}

function stripCommentsPreservingNewlines(source) {
  let output = '';
  let index = 0;
  let state = 'code';

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (state === 'code') {
      if (current === '/' && next === '/') {
        state = 'line';
        output += '  ';
        index += 2;
        continue;
      }
      if (current === '/' && next === '*') {
        state = 'block';
        output += '  ';
        index += 2;
        continue;
      }
      output += current;
      index += 1;
      continue;
    }

    if (state === 'line') {
      if (current === '\n') {
        state = 'code';
        output += '\n';
      } else {
        output += ' ';
      }
      index += 1;
      continue;
    }

    if (current === '*' && next === '/') {
      state = 'code';
      output += '  ';
      index += 2;
      continue;
    }
    output += current === '\n' ? '\n' : ' ';
    index += 1;
  }

  return output;
}

function collectTsDefinitions(source) {
  const definitions = [];
  const lines = stripCommentsPreservingNewlines(source).split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const trimmed = lines[lineIndex].trim();
    if (!trimmed || TS_TYPE_REEXPORT.test(trimmed)) {
      continue;
    }
    const kindMatch = trimmed.match(TS_KIND);
    if (kindMatch) {
      definitions.push({
        kind: kindMatch[1],
        name: kindMatch[2],
        line: lineIndex + 1,
      });
      continue;
    }
    const aliasMatch = trimmed.match(TS_TYPE_ALIAS);
    if (aliasMatch) {
      definitions.push({
        kind: 'type',
        name: aliasMatch[1],
        line: lineIndex + 1,
      });
    }
  }

  return definitions;
}

function collectJavaDefinitions(source) {
  const topLevel = [];
  const nested = [];
  const lines = stripCommentsPreservingNewlines(source).split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (!/^\s/.test(line)) {
      const match = trimmed.match(JAVA_TOP_LEVEL);
      if (match) {
        topLevel.push({
          kind: match[1],
          name: match[2],
          line: lineIndex + 1,
          visibility: 'top-level',
        });
      }
      continue;
    }

    const nestedMatch = line.match(JAVA_NESTED);
    if (!nestedMatch) {
      continue;
    }
    nested.push({
      kind: nestedMatch[3],
      name: nestedMatch[4],
      line: lineIndex + 1,
      visibility: nestedMatch[2] || 'package-private',
    });
  }

  return { topLevel, nested };
}

function formatDefinition(definition) {
  return `${definition.kind} ${definition.name} (line ${definition.line})`;
}

function checkFrontend() {
  const files = walkFiles(path.join(ROOT, 'frontend/src'), '.ts').filter(
    (filePath) => !isFrontendExempt(filePath)
  );
  const violations = [];

  for (const filePath of files) {
    const definitions = collectTsDefinitions(fs.readFileSync(filePath, 'utf8'));
    if (definitions.length <= 1) {
      continue;
    }
    violations.push({
      filePath,
      message: `expected at most one type-level definition, found ${definitions.length}: ${definitions
        .map(formatDefinition)
        .join(', ')}`,
    });
  }

  return violations;
}

function checkBackend() {
  const files = walkFiles(path.join(ROOT, 'backend/src/main/java'), '.java').filter(
    (filePath) => !isBackendExempt(filePath)
  );
  const violations = [];

  for (const filePath of files) {
    const { topLevel, nested } = collectJavaDefinitions(fs.readFileSync(filePath, 'utf8'));

    if (topLevel.length > 1) {
      violations.push({
        filePath,
        message: `expected one top-level type, found ${topLevel.length}: ${topLevel
          .map(formatDefinition)
          .join(', ')}`,
      });
    }

    const disallowedNested = nested.filter(
      (definition) => definition.visibility !== 'private'
    );
    if (disallowedNested.length > 0) {
      violations.push({
        filePath,
        message: `nested types must be private (or live in config/properties or config/validation): ${disallowedNested
          .map(
            (definition) =>
              `${definition.visibility} ${formatDefinition(definition)}`
          )
          .join(', ')}`,
      });
    }
  }

  return violations;
}

function report(label, violations) {
  if (violations.length === 0) {
    console.log(`check-one-definition-per-file: ${label} OK`);
    return;
  }
  console.error(`check-one-definition-per-file: ${label} failed (${violations.length})`);
  for (const violation of violations) {
    console.error(`  ${toPosix(path.relative(ROOT, violation.filePath))}`);
    console.error(`    ${violation.message}`);
  }
}

const scopes = parseArgs(process.argv.slice(2));
const frontendViolations = scopes.frontend ? checkFrontend() : [];
const backendViolations = scopes.backend ? checkBackend() : [];

if (scopes.frontend) {
  report('frontend', frontendViolations);
}
if (scopes.backend) {
  report('backend', backendViolations);
}

if (frontendViolations.length > 0 || backendViolations.length > 0) {
  process.exit(1);
}
