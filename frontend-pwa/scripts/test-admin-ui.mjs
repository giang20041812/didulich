import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Run against Vite. All API requests are intercepted: this never writes to a real backend.
const origin = process.env.ADMIN_TEST_ORIGIN ?? 'http://127.0.0.1:5174';
const browserPath = process.env.ADMIN_TEST_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const output = resolve('test-results');
const profile = resolve(output, `admin-browser-${Date.now()}`);
mkdirSync(profile, { recursive: true });
const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
let socket;
let id = 0;
let documentLoads = 0;
const waiting = new Map();
const errors = [];
const calls = [];
const downloads = new Map();
let failRead = false;
let adminLevel = 1;
let holdFeed = false;
const heldFeeds = [];
let notifications = [
  { id: 1, title: 'Có đơn đặt phòng mới', message: 'Khách vừa đặt Homestay Mùa Vàng.', target: 'bookings',
    entityType: 'Booking', entityId: 32, read: false, createdAt: '2026-10-06T10:00:00' },
  { id: 2, title: 'Hồ sơ NCC chờ duyệt', message: 'Nhà cung cấp mới gửi hồ sơ.', target: 'applications',
    entityType: 'ProviderApplication', entityId: 4, read: false, createdAt: '2026-10-06T09:00:00' },
];
const summary = {
  totalPlaces: 36, unverifiedPlaces: 5, totalProviders: 14, activeProviders: 12, suspendedProviders: 1,
  totalAccounts: 20, activeAccounts: 18, monthlyBookingsCount: 28, monthlyRevenue: 12500000,
  pendingRefundsCount: 2, terminatedProviders: 1, needsUpdatePlaces: 3, pendingSosCount: 0,
  totalTravelers: 248, newTravelers7d: 16, newTravelers30d: 42, lockedTravelers: 2,
  revenueTrend: [], gmvTrend: [],
};
const page = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };
const report = {
  from: '2026-09-07', to: '2026-10-06', providerId: null, granularity: 'DAY', generatedAt: '2026-10-06T10:00:00',
  kpi: { totalBookings: 28, confirmedBookings: 18, openBookings: 7, lostBookings: 3, bookingValue: 17000000,
    averageValue: 600000, paidRevenue: 12500000, confirmationRate: 64, newProviders: 2, newPlaces: 4 },
  byStatus: [{ status: 'PENDING', count: 7 }, { status: 'CONFIRMED', count: 6 }, { status: 'PAID', count: 12 }, { status: 'CANCELLED', count: 3 }],
  series: [{ key: '2026-10-06', label: '06/10', from: '2026-10-06', to: '2026-10-06', bookings: 4, value: 2400000 }],
  topProviders: [], topPlaces: [],
};
function send(method, params = {}) {
  const next = ++id;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { waiting.delete(next); reject(new Error(`Browser command timed out: ${method}`)); }, 30000);
    waiting.set(next, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id: next, method, params }));
  });
}
async function fulfill(requestId, data, responseCode = 200) {
  await send('Fetch.fulfillRequest', { requestId, responseCode,
    responseHeaders: [{ name: 'Content-Type', value: 'application/json; charset=utf-8' }],
    body: responseCode === 204 ? '' : Buffer.from(JSON.stringify(data)).toString('base64') });
}
async function onRequest({ requestId, request }) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!path.startsWith('/api/')) {
    if (url.origin === origin) await send('Fetch.continueRequest', { requestId });
    else await fulfill(requestId, null, 204);
    return;
  }
  calls.push({ path, query: url.search, method: request.method });
  if (path.endsWith('/notifications')) {
    const feed = { items: structuredClone(notifications), unread: notifications.filter(n => !n.read).length };
    if (holdFeed) heldFeeds.push({ requestId, feed });
    else await fulfill(requestId, feed);
  } else if (/\/notifications\/(read-all|\d+\/read)$/.test(path)) {
    if (failRead) await fulfill(requestId, { message: 'Không lưu được trạng thái đã đọc. Vui lòng thử lại.' }, 500);
    else {
      await delay(200);
      notifications.forEach(n => { if (path.endsWith('read-all') || path.endsWith(`/${n.id}/read`)) n.read = true; });
      await fulfill(requestId, null, 204);
    }
  } else if (path.endsWith('/accounts/me')) await fulfill(requestId, { id: 1, accountId: 1, role: 'ADMIN', adminLevel, fullName: 'Quản trị viên thử nghiệm', status: 'ACTIVE' });
  else if (path.endsWith('/dashboard/summary')) await fulfill(requestId, summary);
  else if (path.endsWith('/bookings/summary')) await fulfill(requestId, { PENDING: 7, CONFIRMED: 6, PAID: 12, CANCELLED: 3 });
  else if (path.endsWith('/provider-applications/summary') || path.endsWith('/change-requests/summary')) await fulfill(requestId, { pending: 4 });
  else if (path.endsWith('/reports/overview')) await fulfill(requestId, report);
  else if (path.endsWith('/providers')) await fulfill(requestId, [{ id: 1, name: 'Mùa Vàng', status: 'ACTIVE' }]);
  else if (path.includes('/sos')) await fulfill(requestId, { items: [], total: 0 });
  else if (path.endsWith('/push/public-key')) await fulfill(requestId, { publicKey: '' });
  else await fulfill(requestId, page);
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + result.exceptionDetails.exception?.description);
  return result.result.value;
}
async function until(expression, label) {
  const limit = Date.now() + 15000;
  while (Date.now() < limit) {
    try {
      if (await evaluate(`document.body && (${expression})`)) return;
    } catch (err) {
      if (!/navigated or closed|Execution context was destroyed|Cannot find context/.test(err.message)) throw err;
    }
    await delay(80);
  }
  throw new Error(`Timed out: ${label}\n${await evaluate("({url: location.href, text: document.body?.innerText?.slice(0, 1500)})").then(JSON.stringify)}\n${errors.join('\n')}\nAPI calls: ${JSON.stringify(calls.slice(-12))}`);
}
async function click(expression) {
  const point = await evaluate(`(() => { const el = ${expression}; if (!el) throw Error('Missing click target');
    const r = el.getBoundingClientRect(); const x = r.x + r.width / 2; const y = r.y + r.height / 2;
    if (!el.contains(document.elementFromPoint(x, y))) throw Error('Click target is covered');
    return { x, y }; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}
const bell = "document.querySelector('.admin-page-header button[title=\"Thông báo\"]')";
const panel = "document.querySelector('[data-admin-overlay=\"notification\"]')";
const readButton = `${panel}?.querySelector('button[data-read-notifications]')`;
const allRead = `${panel}?.innerText.includes('Đã đọc tất cả')`;
async function openBell() {
  await click(bell);
  await until(`!!${panel}`, 'notification panel');
  await delay(320);
}
async function syncFeed() {
  await evaluate("window.dispatchEvent(new Event('admin-notifications-changed'))");
  await delay(300);
}
async function screenshot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(resolve(output, name), Buffer.from(data, 'base64'));
}
async function visit(method, params = {}) {
  const before = documentLoads;
  await send(method, params);
  const limit = Date.now() + 15000;
  while (documentLoads === before && Date.now() < limit) await delay(80);
  assert.ok(documentLoads > before, 'navigation must finish loading its new document');
}
try {
  browser.on('error', err => errors.push(err.message));
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { port = readFileSync(resolve(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; break; } catch { await delay(100); }
  }
  if (!port) throw new Error(`Browser did not start: ${errors.join(', ')}`);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  socket.addEventListener('message', e => {
    const message = JSON.parse(e.data);
    if (message.id) {
      const task = waiting.get(message.id);
      waiting.delete(message.id);
      clearTimeout(task?.timeout);
      if (message.error) task?.reject(new Error(message.error.message)); else task?.resolve(message.result);
    } else if (message.method === 'Fetch.requestPaused') void onRequest(message.params).catch(err => errors.push(err.message));
    else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
    else if (message.method === 'Page.domContentEventFired') documentLoads += 1;
    else if (message.method === 'Browser.downloadWillBegin') downloads.set(message.params.guid, { name: message.params.suggestedFilename });
    else if (message.method === 'Browser.downloadProgress') {
      const download = downloads.get(message.params.guid);
      if (download) download.state = message.params.state;
    }
  });
  socket.addEventListener('close', () => {
    for (const task of waiting.values()) { clearTimeout(task.timeout); task.reject(new Error('Browser connection closed')); }
    waiting.clear();
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: output, eventsEnabled: true });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*://*/*' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('portal_token', 'browser-test-token');
    localStorage.setItem('portal_user', JSON.stringify({ accountId: 1, role: 'ADMIN', adminLevel: 1, status: 'ACTIVE', fullName: 'Admin thử nghiệm' }));` });
  await visit('Page.navigate', { url: `${origin}/admin?tab=dashboard` });
  await until("document.body.innerText.includes('Điểm đến toàn sàn')", 'admin overview');
  await delay(1100);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'desktop must not overflow');
  await screenshot('admin-overview-desktop.png');
  await openBell();
  assert.ok(await evaluate(`!!${readButton}`), 'read-all button must exist');
  const writesBefore = calls.filter(c => c.path.endsWith('/notifications/read-all')).length;
  await click(readButton);
  assert.equal(await evaluate(`(${readButton}).disabled`), true, 'prevent duplicate writes while saving');
  await evaluate(`(${readButton}).click()`);
  await until(allRead, 'read-all success');
  assert.equal(notifications.filter(n => !n.read).length, 0);
  assert.equal(calls.filter(c => c.path.endsWith('/notifications/read-all')).length, writesBefore + 1);
  await until("Array.from(document.querySelectorAll('button[title=\"Thông báo\"]')).every(b => b.getAttribute('aria-label') === 'Thông báo')", 'both bells synchronized');
  console.log('PASS: desktop read-all is reachable and saved through the API');

  notifications.forEach(n => { n.read = false; });
  failRead = true;
  await syncFeed();
  await click(readButton);
  await until(`${panel}?.innerText.includes('Không lưu được trạng thái đã đọc')`, 'visible read-all error');
  assert.ok(await evaluate(`!!${readButton}`), 'failed reads must remain unread and retryable');
  assert.equal(await evaluate(`!!(${readButton})?.disabled`), false);
  console.log('PASS: failed save shows an error and permits retry');
  failRead = false;
  await click(readButton);
  await until(allRead, 'read-all retry');
  assert.equal(await evaluate(`${panel}?.innerText.includes('Không lưu được trạng thái đã đọc')`), false);

  await click(`${panel}.querySelector('button[aria-label="Đóng thông báo"]')`);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(500);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'mobile must not overflow');
  await screenshot('admin-overview-mobile.png');
  notifications.forEach(n => { n.read = false; });
  await syncFeed();
  await openBell();
  const height = await evaluate(`(${readButton}).getBoundingClientRect().height`);
  assert.ok(height >= 44, 'mobile read-all must have a touch target of at least 44px');
  await click(readButton);
  await until(allRead, 'mobile read-all');
  await screenshot('admin-notifications-mobile.png');
  console.log('PASS: mobile read-all is reachable with a 44px touch target');

  // A GET started before the write must not restore obsolete unread flags after the write completes.
  notifications.forEach(n => { n.read = false; });
  await syncFeed();
  holdFeed = true;
  await evaluate("window.dispatchEvent(new Event('admin-notifications-changed'))");
  await delay(200);
  await click(readButton);
  await delay(350);
  holdFeed = false;
  for (const pending of heldFeeds.splice(0)) await fulfill(pending.requestId, pending.feed);
  await delay(350);
  assert.equal(await evaluate(allRead), true, 'an old feed must not overwrite a successful read');
  console.log('PASS: concurrent feed refresh cannot undo read status');

  notifications.forEach(n => { n.read = false; });
  await syncFeed();
  await click(`Array.from(${panel}.querySelectorAll('button')).find(b => b.textContent.includes('Hồ sơ NCC chờ duyệt'))`);
  await until("location.search.includes('tab=applications')", 'notification opens its target');
  await until("Array.from(document.querySelectorAll('button[title=\"Thông báo\"]')).every(b => b.getAttribute('aria-label')?.includes('1 chưa đọc'))", 'single notification read');
  assert.equal(notifications.find(n => n.id === 2).read, true);
  assert.equal(notifications.find(n => n.id === 1).read, false);
  console.log('PASS: individual notification saves its read state and opens the correct section');
  await visit('Page.navigate', { url: `${origin}/admin?tab=dashboard` });
  await until("document.body.innerText.includes('Điểm đến toàn sàn')", 'return to overview');

  for (const width of [320, 768, 1024]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 1024 });
    await delay(350);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, `no horizontal overflow at ${width}px`);
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await visit('Page.reload', { ignoreCache: true });
  await until("document.body.innerText.includes('Điểm đến toàn sàn')", 'reduced-motion overview');
  assert.ok(await evaluate("document.body.innerText.includes('12.500.000')"), 'currency keeps Vietnamese grouping');
  assert.ok(await evaluate("document.body.innerText.includes('Báo cáo đặt phòng') && document.body.innerText.includes('Xuất')"), 'reports and export remain available');
  const exportButton = "document.querySelector('button[title=\"Xuất báo cáo đang xem ra file Excel (.xlsx)\"]')";
  await evaluate(`(${exportButton}).scrollIntoView({ block: 'center', behavior: 'instant' })`);
  await delay(300);
  await click(exportButton);
  for (let attempt = 0; attempt < 50 && !Array.from(downloads.values()).some(d => d.state === 'completed'); attempt++) await delay(100);
  const exported = Array.from(downloads.values()).find(d => d.state === 'completed' && d.name.endsWith('.xlsx'));
  assert.ok(exported, 'export must download an Excel file');
  assert.equal(readFileSync(resolve(output, exported.name)).subarray(0, 2).toString(), 'PK', 'Excel file is a ZIP workbook');
  console.log('PASS: report export downloads an Excel workbook');
  adminLevel = 3;
  await visit('Page.reload', { ignoreCache: true });
  await until("document.body.innerText.includes('Điểm đến toàn sàn')", 'admin level 3 overview');
  await delay(400);
  assert.equal(await evaluate("!!Array.from(document.querySelectorAll('main button')).find(b => b.textContent.includes('Hồ sơ đăng ký NCC chờ duyệt'))"), false, 'restricted queues remain hidden');
  assert.equal(errors.length, 0, errors.join('\n'));
  assert.ok(calls.some(c => c.path.endsWith('/notifications/read-all') && c.method === 'POST'));
  console.log('PASS: reduced motion, currency, reporting, export, and Admin permissions');
} finally {
  socket?.close();
  browser.kill();
}
