#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const openapiDiff = require('openapi-diff');
const SwaggerParser = require('@apidevtools/swagger-parser');

const { normalizeOpenApi } = require('./openapi-normalize.cjs');

const ROOT = path.resolve(__dirname, '..');
const CONTRACT_PATH = path.join(ROOT, 'backend/openapi/openapi.yaml');
const RUNTIME_PATH = process.argv[2];

if (!RUNTIME_PATH) {
  console.error('Usage: node scripts/validate-openapi-drift.cjs <runtime-openapi.json>');
  process.exit(1);
}

function downgradeOpenApiVersion(spec) {
  return { ...spec, openapi: '3.0.3' };
}

async function loadContract() {
  const spec = downgradeOpenApiVersion(
    YAML.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'))
  );
  return SwaggerParser.dereference(spec);
}

async function loadRuntime() {
  const spec = downgradeOpenApiVersion(
    JSON.parse(fs.readFileSync(RUNTIME_PATH, 'utf8'))
  );
  return SwaggerParser.dereference(spec);
}

function toComparableDocument(normalized) {
  return {
    openapi: '3.0.3',
    info: { title: 'Recruita API compare', version: '0.0.0' },
    paths: normalized.paths,
    components: normalized.components,
  };
}

function toSpecOption(spec, location) {
  return {
    content: JSON.stringify(spec),
    location,
    format: 'openapi3',
  };
}

async function diff(label, source, destination) {
  const result = await openapiDiff.diffSpecs({
    sourceSpec: toSpecOption(
      toComparableDocument(source),
      `${label}-source.json`
    ),
    destinationSpec: toSpecOption(
      toComparableDocument(destination),
      `${label}-destination.json`
    ),
  });

  return {
    label,
    breaking: result.breakingDifferences ?? [],
    nonBreaking: result.nonBreakingDifferences ?? [],
    unclassified: result.unclassifiedDifferences ?? [],
  };
}

function printDiffGroup(title, differences) {
  if (differences.length === 0) {
    return;
  }
  console.error(`\n${title} (${differences.length})`);
  for (const entry of differences) {
    console.error(`- [${entry.code}] ${entry.action} ${entry.entity}: ${entry.details ?? ''}`);
  }
}

async function main() {
  const contract = normalizeOpenApi(await loadContract());
  const runtime = normalizeOpenApi(await loadRuntime());

  const contractToRuntime = await diff('contract->runtime', contract, runtime);
  const runtimeToContract = await diff('runtime->contract', runtime, contract);

  const groups = [contractToRuntime, runtimeToContract];
  const totalDiffs = groups.reduce(
    (count, group) =>
      count + group.breaking.length + group.nonBreaking.length + group.unclassified.length,
    0
  );

  if (totalDiffs === 0) {
    console.log('OpenAPI contract matches springdoc runtime spec');
    return;
  }

  console.error(
    'OpenAPI drift detected between backend/openapi/openapi.yaml and springdoc runtime output.'
  );
  console.error('Update the contract or controller implementations so they stay aligned.\n');

  for (const group of groups) {
    console.error(`=== ${group.label} ===`);
    printDiffGroup('Breaking', group.breaking);
    printDiffGroup('Non-breaking', group.nonBreaking);
    printDiffGroup('Unclassified', group.unclassified);
  }

  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
