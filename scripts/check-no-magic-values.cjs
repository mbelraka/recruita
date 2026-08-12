#!/usr/bin/env node
/**
 * Fail on magic numbers, magic strings, and stringly-typed choices.
 *
 * Numbers: literals other than 0, 1, -1 in non-exempt files (named const /
 * static-final field initializers and annotation/regex literals are allowed).
 *
 * Strings: equality/switch/equals comparisons (except empty and typeof), and
 * raw literals that duplicate enum, type-union, constants, or route vocabulary.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const IGNORED_NUMBERS = new Set([0, 1, -1]);
const TYPEOF_TYPES = new Set([
  'string',
  'number',
  'boolean',
  'object',
  'undefined',
  'function',
  'symbol',
  'bigint',
]);

const TS_NAMED_CONST_LINE =
  /^\s*(?:export\s+)?(?:declare\s+)?(?:const|let|var)\s+[A-Za-z_]\w*\s*=/;
const JAVA_NAMED_CONST_LINE =
  /^\s*(?:public|protected|private|static|final|\s)+\s+[A-Za-z_.<>,\s[\]]+\s+[A-Z][A-Z0-9_]*\s*=/;
const JAVA_ANNOTATION_LINE = /^\s*@/;

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
  if (relative.includes('/constants/')) {
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
  if (relative.endsWith('.enum.ts')) {
    return true;
  }
  if (relative.endsWith('.type.ts')) {
    return true;
  }
  if (relative.endsWith('utilities/reg-ex.ts')) {
    return true;
  }
  return false;
}

function isFrontendVocabularySource(filePath) {
  const relative = toPosix(path.relative(ROOT, filePath));
  return (
    relative.endsWith('.enum.ts') ||
    relative.endsWith('.type.ts') ||
    relative.endsWith('.constants.ts') ||
    relative.endsWith('.const.ts') ||
    relative.includes('/constants/') ||
    relative.endsWith('config/app.config.ts')
  );
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

function isJavaEnumFile(source) {
  return /^(?:public\s+|protected\s+|private\s+)?(?:sealed\s+)?enum\s+\w+/m.test(
    source
  );
}

function isImportPath(value) {
  return (
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.endsWith('.ts') ||
    value.endsWith('.java') ||
    value.endsWith('.html') ||
    value.endsWith('.scss') ||
    value.includes('.enum') ||
    value.includes('.model') ||
    value.includes('.type') ||
    value.includes('.interface')
  );
}

function isPunctuationOrBlank(value) {
  return !/[A-Za-z]/.test(value);
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
      output += current === '\n' ? '\n' : ' ';
      if (current === '\n') {
        state = 'code';
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

function isRegexStart(source, index) {
  let cursor = index - 1;
  while (cursor >= 0 && /[ \t]/.test(source[cursor])) {
    cursor -= 1;
  }
  if (cursor < 0) {
    return true;
  }
  const previous = source[cursor];
  if ('=(,!&|?:;{[]~^+*%<>'.includes(previous)) {
    return true;
  }
  const before = source.slice(Math.max(0, cursor - 8), cursor + 1);
  return /\b(return|case|throw|in|of)\s$/.test(`${before} `);
}

function extractLiterals(source) {
  const stripped = stripCommentsPreservingNewlines(source);
  const numbers = [];
  const strings = [];
  let index = 0;
  let line = 1;

  const pushNumber = (raw, startLine) => {
    const numeric = Number(raw.replaceAll('_', '').replace(/[lLfFdD]$/, ''));
    if (!Number.isFinite(numeric) || IGNORED_NUMBERS.has(numeric)) {
      return;
    }
    numbers.push({ line: startLine, raw, value: numeric });
  };

  while (index < stripped.length) {
    const current = stripped[index];
    if (current === '\n') {
      line += 1;
      index += 1;
      continue;
    }

    if (current === '/' && stripped[index + 1] && stripped[index + 1] !== '/' && isRegexStart(stripped, index)) {
      let cursor = index + 1;
      while (cursor < stripped.length && stripped[cursor] !== '\n') {
        if (stripped[cursor] === '\\') {
          cursor += 2;
          continue;
        }
        if (stripped[cursor] === '/') {
          cursor += 1;
          while (cursor < stripped.length && /[a-z]/i.test(stripped[cursor])) {
            cursor += 1;
          }
          index = cursor;
          break;
        }
        cursor += 1;
      }
      if (index < cursor) {
        index += 1;
      }
      continue;
    }

    if (current === "'" || current === '"' || current === '`') {
      const quote = current;
      const startLine = line;
      let cursor = index + 1;
      let value = '';
      while (cursor < stripped.length) {
        const character = stripped[cursor];
        if (character === '\\') {
          value += character + (stripped[cursor + 1] ?? '');
          cursor += 2;
          continue;
        }
        if (character === '\n') {
          line += 1;
        }
        if (character === quote) {
          break;
        }
        value += character;
        cursor += 1;
      }
      const before = stripped.slice(Math.max(0, index - 48), index).replace(/\s+/g, ' ');
      strings.push({
        line: startLine,
        value,
        quote,
        before,
        multiline: value.includes('\n'),
      });
      index = cursor + 1;
      continue;
    }

    const previous = stripped[index - 1] ?? '';
    const identifier = /[A-Za-z0-9_$]/.test(previous);
    if (
      !identifier &&
      previous !== '%' &&
      (current === '-' || (current >= '0' && current <= '9'))
    ) {
      const match = stripped.slice(index).match(/^-?(?:\d+_)*\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[lLfFdD]?/);
      if (match && match[0] !== '-') {
        pushNumber(match[0], line);
        index += match[0].length;
        continue;
      }
    }

    index += 1;
  }

  return { numbers, strings, lines: stripped.split(/\r?\n/) };
}

function isComparisonString(stringLiteral) {
  if (
    !stringLiteral.value ||
    TYPEOF_TYPES.has(stringLiteral.value) ||
    stringLiteral.multiline ||
    isImportPath(stringLiteral.value) ||
    isPunctuationOrBlank(stringLiteral.value)
  ) {
    return false;
  }
  if (/\bfrom\s*$/.test(stringLiteral.before) || /\bimport\s*$/.test(stringLiteral.before)) {
    return false;
  }
  return (
    /(?:[=!]==?|equals\()\s*$/.test(stringLiteral.before) ||
    /\bcase\s*$/.test(stringLiteral.before)
  );
}

function isChoiceLiteral(stringLiteral) {
  if (
    !stringLiteral.value ||
    stringLiteral.multiline ||
    TYPEOF_TYPES.has(stringLiteral.value) ||
    isImportPath(stringLiteral.value) ||
    isPunctuationOrBlank(stringLiteral.value)
  ) {
    return false;
  }
  if (/\bfrom\s*$/.test(stringLiteral.before) || /\bimport\s*$/.test(stringLiteral.before)) {
    return false;
  }
  return true;
}

function collectTsVocabulary(files) {
  const vocabulary = new Map();

  const add = (value, origin) => {
    if (!value || TYPEOF_TYPES.has(value)) {
      return;
    }
    if (!vocabulary.has(value)) {
      vocabulary.set(value, origin);
    }
  };

  for (const filePath of files) {
    if (!isFrontendVocabularySource(filePath)) {
      continue;
    }
    const relative = toPosix(path.relative(ROOT, filePath));
    const { strings } = extractLiterals(fs.readFileSync(filePath, 'utf8'));
    const routeConfig = relative.endsWith('config/app.config.ts');
    for (const stringLiteral of strings) {
      if (!isChoiceLiteral(stringLiteral)) {
        continue;
      }
      if (relative.endsWith('.type.ts') || relative.endsWith('.enum.ts')) {
        add(stringLiteral.value, relative);
        continue;
      }
      if (
        relative.includes('/constants/') ||
        relative.endsWith('.constants.ts') ||
        relative.endsWith('.const.ts')
      ) {
        if (stringLiteral.value.includes('.') && !stringLiteral.value.includes('/')) {
          add(stringLiteral.value, relative);
        }
        continue;
      }
      if (routeConfig) {
        const segment = stringLiteral.value.replace(/^\//, '');
        if (
          /^(?:main|applicants|match|export|privacy|smart-action)$/.test(segment)
        ) {
          add(segment, relative);
          add(`/${segment}`, relative);
        }
      }
    }
  }

  return vocabulary;
}

function collectJavaVocabulary(files) {
  const vocabulary = new Map();
  for (const filePath of files) {
    const source = fs.readFileSync(filePath, 'utf8');
    if (!filePath.endsWith('.java') || !isJavaEnumFile(source)) {
      continue;
    }
    const relative = toPosix(path.relative(ROOT, filePath));
    const { strings } = extractLiterals(source);
    for (const stringLiteral of strings) {
      if (!isChoiceLiteral(stringLiteral)) {
        continue;
      }
      if (!vocabulary.has(stringLiteral.value)) {
        vocabulary.set(stringLiteral.value, relative);
      }
    }
  }
  return vocabulary;
}

function numberAllowedOnLine(line, java) {
  if (!line) {
    return false;
  }
  if (java && (JAVA_ANNOTATION_LINE.test(line) || JAVA_NAMED_CONST_LINE.test(line))) {
    return true;
  }
  if (!java && TS_NAMED_CONST_LINE.test(line)) {
    return true;
  }
  return false;
}

function checkTsFile(filePath, vocabulary) {
  const source = fs.readFileSync(filePath, 'utf8');
  const { numbers, strings, lines } = extractLiterals(source);
  const violations = [];
  const relative = toPosix(path.relative(ROOT, filePath));

  for (const numberLiteral of numbers) {
    const line = lines[numberLiteral.line - 1] ?? '';
    if (numberAllowedOnLine(line, false)) {
      continue;
    }
    violations.push({
      filePath,
      message: `magic number ${numberLiteral.raw} (line ${numberLiteral.line}) — move to APP_CONFIG or a *.constants.ts file`,
    });
  }

  for (const stringLiteral of strings) {
    if (
      stringLiteral.multiline ||
      (stringLiteral.quote === '`' && stringLiteral.value.includes('${'))
    ) {
      continue;
    }
    if (isComparisonString(stringLiteral)) {
      violations.push({
        filePath,
        message: `magic string comparison ${JSON.stringify(stringLiteral.value)} (line ${stringLiteral.line}) — use an enum or constant`,
      });
      continue;
    }
    if (!isChoiceLiteral(stringLiteral)) {
      continue;
    }
    const origin = vocabulary.get(stringLiteral.value);
    if (origin && origin !== relative) {
      violations.push({
        filePath,
        message: `stringly-typed choice ${JSON.stringify(stringLiteral.value)} (line ${stringLiteral.line}) — use the enum/constant from ${origin}`,
      });
    }
  }

  return violations;
}

function checkJavaFile(filePath, vocabulary) {
  const source = fs.readFileSync(filePath, 'utf8');
  if (isJavaEnumFile(source)) {
    return [];
  }
  const { numbers, strings, lines } = extractLiterals(source);
  const violations = [];

  for (const numberLiteral of numbers) {
    const line = lines[numberLiteral.line - 1] ?? '';
    if (numberAllowedOnLine(line, true)) {
      continue;
    }
    violations.push({
      filePath,
      message: `magic number ${numberLiteral.raw} (line ${numberLiteral.line}) — move to application.yml / @ConfigurationProperties or a named constant`,
    });
  }

  for (const stringLiteral of strings) {
    if (isComparisonString(stringLiteral)) {
      violations.push({
        filePath,
        message: `magic string comparison ${JSON.stringify(stringLiteral.value)} (line ${stringLiteral.line}) — use an enum or configuration property`,
      });
      continue;
    }
    const origin = vocabulary.get(stringLiteral.value);
    if (origin) {
      violations.push({
        filePath,
        message: `stringly-typed choice ${JSON.stringify(stringLiteral.value)} (line ${stringLiteral.line}) — use the enum from ${origin}`,
      });
    }
  }

  return violations;
}

function report(label, violations) {
  if (violations.length === 0) {
    console.log(`check-no-magic-values: ${label} OK`);
    return;
  }
  console.error(`check-no-magic-values: ${label} failed (${violations.length})`);
  for (const violation of violations) {
    console.error(`  ${toPosix(path.relative(ROOT, violation.filePath))}`);
    console.error(`    ${violation.message}`);
  }
}

const scopes = parseArgs(process.argv.slice(2));
const tsFiles = walkFiles(path.join(ROOT, 'frontend/src'), '.ts');
const javaFiles = walkFiles(path.join(ROOT, 'backend/src/main/java'), '.java');
const tsVocabulary = collectTsVocabulary(tsFiles);
const javaVocabulary = collectJavaVocabulary(javaFiles);

const frontendViolations = scopes.frontend
  ? tsFiles.filter((filePath) => !isFrontendExempt(filePath)).flatMap((filePath) => checkTsFile(filePath, tsVocabulary))
  : [];
const backendViolations = scopes.backend
  ? javaFiles.filter((filePath) => !isBackendExempt(filePath)).flatMap((filePath) => checkJavaFile(filePath, javaVocabulary))
  : [];

if (scopes.frontend) {
  report('frontend', frontendViolations);
}
if (scopes.backend) {
  report('backend', backendViolations);
}

if (frontendViolations.length > 0 || backendViolations.length > 0) {
  process.exit(1);
}
