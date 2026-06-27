#!/usr/bin/env node
/**
 * Structural normalization for contract ↔ runtime OpenAPI comparison.
 * Keeps paths, operations, parameters, request/response schemas, and component schemas.
 */
'use strict';

const HTTP_METHODS = new Set([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sortKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (!isPlainObject(value)) {
    return value;
  }
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortKeys(value[key]);
      return acc;
    }, {});
}

function normalizeSchema(schema) {
  if (!schema) {
    return undefined;
  }
  if (schema.$ref) {
    return { $ref: schema.$ref };
  }
  if (schema.allOf) {
    return { allOf: schema.allOf.map(normalizeSchema) };
  }
  if (schema.oneOf) {
    return { oneOf: schema.oneOf.map(normalizeSchema) };
  }
  if (schema.anyOf) {
    return { anyOf: schema.anyOf.map(normalizeSchema) };
  }

  const normalized = {};
  for (const key of [
    'type',
    'format',
    'enum',
    'items',
    'properties',
    'additionalProperties',
    'nullable',
  ]) {
    if (schema[key] !== undefined) {
      normalized[key] =
        key === 'properties'
          ? Object.fromEntries(
              Object.entries(schema.properties).map(([name, value]) => [
                name,
                normalizeSchema(value),
              ])
            )
          : key === 'items'
            ? normalizeSchema(schema.items)
            : schema[key];
    }
  }
  return normalized;
}

function normalizeParameter(parameter) {
  if (parameter?.$ref) {
    return { $ref: parameter.$ref };
  }
  return sortKeys({
    name: parameter.name,
    in: parameter.in,
    required: parameter.required ?? false,
    schema: normalizeSchema(parameter.schema),
  });
}

function pickJsonContent(content) {
  if (!content) {
    return undefined;
  }
  return content['application/json'] ?? content['*/*'];
}

function normalizeRequestBody(requestBody) {
  if (!requestBody) {
    return undefined;
  }
  const json = pickJsonContent(requestBody.content);
  if (!json) {
    return undefined;
  }
  return sortKeys({
    required: requestBody.required ?? false,
    content: {
      'application/json': {
        schema: normalizeSchema(json.schema),
      },
    },
  });
}

function normalizeResponses(responses) {
  const successEntries = Object.entries(responses ?? {}).filter(([status]) =>
    /^2/.test(status)
  );

  for (const [, response] of successEntries) {
    const json = pickJsonContent(response.content);
    if (json?.schema) {
      return sortKeys({
        '200': {
          description: response.description ?? 'OK',
          content: {
            'application/json': {
              schema: normalizeSchema(json.schema),
            },
          },
        },
      });
    }
  }

  for (const [, response] of successEntries) {
    if (!response.content) {
      return sortKeys({
        '204': {
          description: response.description ?? 'No Content',
        },
      });
    }
  }

  return sortKeys({
    '200': {
      description: 'OK',
    },
  });
}

function normalizePaths(paths) {
  const normalized = {};
  for (const [path, pathItem] of Object.entries(paths ?? {})) {
    normalized[path] = {};
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method)) {
        continue;
      }
      normalized[path][method] = sortKeys({
        operationId: operation.operationId,
        parameters: (operation.parameters ?? []).map(normalizeParameter),
        requestBody: normalizeRequestBody(operation.requestBody),
        responses: normalizeResponses(operation.responses),
      });
    }
  }
  return normalized;
}

function normalizeComponents(components) {
  return sortKeys({
    parameters: Object.fromEntries(
      Object.entries(components?.parameters ?? {}).map(([name, parameter]) => [
        name,
        normalizeParameter(parameter),
      ])
    ),
    schemas: Object.fromEntries(
      Object.entries(components?.schemas ?? {}).map(([name, schema]) => [
        name,
        normalizeSchema(schema),
      ])
    ),
  });
}

function normalizeOpenApi(spec) {
  const paths = normalizePaths(spec.paths);
  delete paths['/api/match'];
  delete paths['/api/match-job'];

  return sortKeys({
    paths,
    components: normalizeComponents(spec.components),
  });
}

module.exports = { normalizeOpenApi };
