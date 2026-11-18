import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { referenceHtml } = require(fileURLToPath(new URL('../out/reference.js', import.meta.url)));

test('reference contains the main language sections', () => {
  const html = referenceHtml();
  for (const heading of ['Palabras reservadas', 'Variables, salida y control', 'Tipos', 'Capabilities y efectos', 'Comandos de la extensión']) {
    assert.match(html, new RegExp(heading));
  }
  assert.doesNotMatch(html, /<script/i);
});

test('reference explains the multi-file exclusion', () => {
  const html = referenceHtml();
  assert.match(html, /No hay <code>import<\/code> ni archivo principal/);
});
