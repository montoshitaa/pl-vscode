import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const BIN = new URL('../server/dist/bin.js', import.meta.url);

if (!existsSync(BIN)) {
  console.error('server/dist/bin.js is missing; run `npm run bundle:server` first.');
  process.exit(1);
}

/** Incremental parser for Content-Length framed JSON-RPC over stdout. */
class FrameParser {
  buffer = Buffer.alloc(0);
  error = null;

  push(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    const messages = [];
    for (;;) {
      const headerEnd = this.buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) break;
      const header = this.buffer.subarray(0, headerEnd).toString('ascii');
      const match = /^Content-Length: (\d+)$/im.exec(header);
      if (match === null) {
        this.error = new Error(`non-framed stdout: ${header}`);
        break;
      }
      const length = Number(match[1]);
      const bodyStart = headerEnd + 4;
      if (this.buffer.length < bodyStart + length) break;
      messages.push(JSON.parse(this.buffer.subarray(bodyStart, bodyStart + length).toString('utf8')));
      this.buffer = this.buffer.subarray(bodyStart + length);
    }
    return messages;
  }
}

const child = spawn(process.execPath, [BIN.pathname, '--stdio'], { stdio: ['pipe', 'pipe', 'pipe'] });
const parser = new FrameParser();
const messages = [];
let stderr = '';
child.stdout.on('data', (chunk) => messages.push(...parser.push(chunk)));
child.stderr.on('data', (chunk) => {
  stderr += chunk.toString();
});

function send(message) {
  const body = JSON.stringify(message);
  child.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
}

function waitFor(predicate, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = () => {
      const found = messages.find(predicate);
      if (found !== undefined) return resolve(found);
      if (Date.now() > deadline) return reject(new Error(`timed out; got ${JSON.stringify(messages)}`));
      setTimeout(tick, 10);
    };
    tick();
  });
}

const exitCode = new Promise((resolve) => child.once('close', resolve));

try {
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { processId: null, rootUri: null, capabilities: {} } });
  const initialized = await waitFor((m) => m.id === 1);
  assert.equal(initialized.result.capabilities.positionEncoding, 'utf-16');

  send({ jsonrpc: '2.0', method: 'initialized', params: {} });
  send({
    jsonrpc: '2.0',
    method: 'textDocument/didOpen',
    params: {
      textDocument: {
        uri: 'file:///tmp/smoke.placitum',
        languageId: 'placitum',
        version: 1,
        text: 'let config = fs.readFile!("/etc/app.json")',
      },
    },
  });
  const published = await waitFor((m) => m.method === 'textDocument/publishDiagnostics');
  assert.deepEqual(published.params.diagnostics.map((d) => d.code), ['E301_EXTRACT_UNCOVERED_CAPABILITY']);

  const diagnosticCount = () => messages.filter((m) => m.method === 'textDocument/publishDiagnostics').length;
  const before = diagnosticCount();
  send({
    jsonrpc: '2.0',
    id: 2,
    method: 'workspace/executeCommand',
    params: { command: 'placitum.reanalyze', arguments: ['file:///tmp/smoke.placitum'] },
  });
  await waitFor((m) => m.id === 2);
  await waitFor(() => diagnosticCount() > before);

  send({
    jsonrpc: '2.0',
    id: 3,
    method: 'placitum/manifest',
    params: { textDocument: { uri: 'file:///tmp/smoke.placitum' } },
  });
  const manifest = await waitFor((m) => m.id === 3);
  assert.ok(typeof manifest.result.markdown === 'string' && manifest.result.markdown.length > 0);

  send({ jsonrpc: '2.0', id: 4, method: 'shutdown' });
  await waitFor((m) => m.id === 4);
  send({ jsonrpc: '2.0', method: 'exit' });

  assert.equal(await exitCode, 0);
  assert.equal(parser.error, null);
  assert.equal(parser.buffer.length, 0);
  assert.ok(messages.every((m) => m.jsonrpc === '2.0'));
  assert.ok(stderr.includes('placitum-lsp'));
  console.log('smoke: server bundle answered over stdio with pure JSON-RPC stdout (E301).');
} catch (error) {
  child.kill();
  console.error(error);
  process.exit(1);
}
