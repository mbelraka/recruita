#!/usr/bin/env node
/**
 * Build a Prism-friendly OpenAPI document with static response examples for Playwright e2e.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

const ROOT = path.resolve(__dirname, '..');
const CONTRACT_PATH = path.join(ROOT, 'backend/openapi/openapi.yaml');
const SEED_PATH = path.join(ROOT, 'backend/src/main/resources/seed/applicants-demo.json');
const OUT_PATH = path.join(ROOT, 'backend/openapi/openapi.prism.yaml');

function toSummary(record) {
  const { notes: _notes, ...summary } = record;
  return summary;
}

function setExampleResponse(pathItem, method, status, example) {
  const operation = pathItem?.[method];
  if (!operation?.responses?.[status]) {
    throw new Error(`Missing ${method.toUpperCase()} ${status} response in contract`);
  }
  const content = operation.responses[status].content?.['application/json'];
  if (!content) {
    throw new Error(`Missing application/json response for ${method} ${status}`);
  }
  content.examples = {
    e2e: { value: example },
  };
}

const spec = YAML.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
const seedRecords = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));

setExampleResponse(spec.paths['/api/health'], 'get', '200', { ok: true });
setExampleResponse(
  spec.paths['/api/applicants'],
  'get',
  '200',
  seedRecords.map(toSummary)
);
setExampleResponse(spec.paths['/api/applicants/full'], 'get', '200', seedRecords);
setExampleResponse(spec.paths['/api/profiles/{id}'], 'get', '200', {
  id: 'admin',
  privacyNoticeAccepted: true,
  lastLanguage: 'en',
  optionalRemoteTranslation: false,
  optionalGeocoding: false,
  optionalAiMatching: true,
});

fs.writeFileSync(OUT_PATH, YAML.stringify(spec));
console.log(`Wrote ${OUT_PATH}`);
