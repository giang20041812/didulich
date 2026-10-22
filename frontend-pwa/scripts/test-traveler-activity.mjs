import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/services/travelerActivityService.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function browser() {
  const storage = new Map();
  const requests = [];
  let respond = async () => ({ ok: true });
  const module = { exports: {} };
  const document = { visibilityState: 'visible' };
  const context = vm.createContext({
    module, exports: module.exports, URL,
    require: () => ({ apiOrigin: () => 'https://viettrek.test' }),
    localStorage: { getItem: (name) => storage.get(name) ?? null },
    document,
    fetch: (...args) => { requests.push(args); return respond(...args); },
  });
  new vm.Script(compiled).runInContext(context);
  return {
    record: module.exports.recordHomestayView, storage, requests, document,
    respondWith: (handler) => { respond = handler; },
    signIn: (email = 'guest@test.vn') => {
      storage.set('traveler_token', `token-${email}`);
      storage.set('traveler_user', JSON.stringify({ email }));
    },
  };
}

const guest = browser();
await guest.record(21);
assert.equal(guest.requests.length, 0, 'Anonymous visitors are not recorded');
guest.storage.set('portal_token', 'admin-token');
await guest.record(21);
assert.equal(guest.requests.length, 0, 'Portal sessions are not used for traveler history');
guest.signIn();
guest.document.visibilityState = 'hidden';
await guest.record(21);
assert.equal(guest.requests.length, 0, 'Background tabs are not recorded');
guest.document.visibilityState = 'visible';
await guest.record(21);
assert.equal(guest.requests.length, 1);
assert.equal(guest.requests[0][0].pathname, '/api/v1/traveler/activity/homestays/21/view');
assert.equal(guest.requests[0][1].method, 'POST');
assert.equal(guest.requests[0][1].headers.Authorization, 'Bearer token-guest@test.vn');
await guest.record(21);
assert.equal(guest.requests.length, 1, 'Repeated renders use the recorded view');
guest.signIn('other@test.vn');
await guest.record(21);
assert.equal(guest.requests.length, 2, 'Switching travelers does not share deduplication state');

const concurrent = browser();
concurrent.signIn();
let finish;
concurrent.respondWith(() => new Promise((resolve) => { finish = resolve; }));
const pending = concurrent.record(21);
await concurrent.record(21);
await concurrent.record(21);
assert.equal(concurrent.requests.length, 1, 'Concurrent requests do not release another request lock');
finish({ ok: true });
await pending;

const failed = browser();
failed.signIn();
failed.respondWith(async () => { throw new Error('Offline'); });
await failed.record(21);
failed.respondWith(async () => ({ ok: true }));
await failed.record(21);
assert.equal(failed.requests.length, 2, 'Failed tracking is retryable and never rejects the page flow');

console.log('Traveler activity tracking: authorization, visibility, deduplication, account switching and retry passed.');
