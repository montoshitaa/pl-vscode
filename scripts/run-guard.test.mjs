import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { runBlockReason } = require(fileURLToPath(new URL('../out/run-guard.js', import.meta.url)));

test('allows placitum files in trusted local and remote workspaces', () => {
  assert.equal(runBlockReason('placitum', 'file', true), undefined);
  assert.equal(runBlockReason('placitum', 'vscode-remote', true), undefined);
});

test('blocks untrusted workspaces before anything else', () => {
  assert.equal(runBlockReason('placitum', 'file', false), 'untrusted');
  assert.equal(runBlockReason('placitum', 'vscode-remote', false), 'untrusted');
  assert.equal(runBlockReason('markdown', 'file', false), 'untrusted');
});

test('blocks other languages and non-runnable schemes', () => {
  assert.equal(runBlockReason('markdown', 'file', true), 'unsupported');
  assert.equal(runBlockReason('placitum', 'untitled', true), 'unsupported');
  assert.equal(runBlockReason('placitum', 'vscode-vfs', true), 'unsupported');
});
