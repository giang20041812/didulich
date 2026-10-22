import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/partnerGet.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
});

function setup() {
  const calls = [];
  const axios = {
    defaults: {},
    get(url, config) {
      return new Promise((resolve, reject) => calls.push({ url, config, resolve, reject }));
    },
  };
  const exports = {};
  runInNewContext(outputText, { exports, require: () => axios });
  return { get: exports.partnerGet, calls };
}

test('concurrent identical reads share one request; subsequent reads fetch fresh data', async () => {
  const { get, calls } = setup();
  const config = { headers: { Authorization: 'Bearer user-a' }, params: { placeId: 1 } };
  const first = get('/units', config);
  const second = get('/units', config);
  assert.equal(calls.length, 1);
  calls[0].resolve({ data: { available: 2 } });
  assert.equal(await first, await second);
  const fresh = get('/units', config);
  assert.equal(calls.length, 2);
  calls[1].resolve({ data: { available: 1 } });
  assert.equal((await fresh).available, 1);
});

test('different sessions and filters do not share requests', async () => {
  const { get, calls } = setup();
  const requests = [
    get('/units', { headers: { Authorization: 'Bearer user-a' }, params: { placeId: 1 } }),
    get('/units', { headers: { Authorization: 'Bearer user-b' }, params: { placeId: 1 } }),
    get('/units', { headers: { Authorization: 'Bearer user-a' }, params: { placeId: 2 } }),
  ];
  assert.equal(calls.length, 3);
  calls.forEach((call, i) => call.resolve({ data: i }));
  assert.deepEqual(await Promise.all(requests), [0, 1, 2]);
});

test('failed reads are removed so a retry can succeed', async () => {
  const { get, calls } = setup();
  const first = get('/units', {});
  const second = get('/units', {});
  const outcomes = Promise.allSettled([first, second]);
  calls[0].reject(new Error('offline'));
  assert.ok((await outcomes).every(result => result.status === 'rejected'));
  const retry = get('/units', {});
  assert.equal(calls.length, 2);
  calls[1].resolve({ data: 'online' });
  assert.equal(await retry, 'online');
});
