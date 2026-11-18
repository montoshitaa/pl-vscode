import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { countDiagnostics, statusText, summaryLine } = require(
  fileURLToPath(new URL('../out/status.js', import.meta.url)),
);

test('counts errors and warnings, ignoring other severities', () => {
  assert.deepEqual(countDiagnostics([0, 0, 1, 2, 3, undefined]), { errors: 2, warnings: 1 });
});

test('status text prioritizes errors over warnings', () => {
  assert.equal(statusText({ errors: 2, warnings: 1 }), '$(error) Placitum: 2');
  assert.equal(statusText({ errors: 0, warnings: 1 }), '$(warning) Placitum: 1');
  assert.equal(statusText({ errors: 0, warnings: 0 }), '$(check) Placitum');
});

test('summary line uses singular and plural wording', () => {
  assert.equal(summaryLine('a.placitum', { errors: 1, warnings: 0 }), 'a.placitum: 1 error, 0 advertencias');
  assert.equal(summaryLine('a.placitum', { errors: 0, warnings: 2 }), 'a.placitum: 0 errores, 2 advertencias');
});
