import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Run against Vite. Intercept every API request so no real booking or account is changed.
const origin = process.env.PROVIDER_TEST_ORIGIN ?? 'http://127.0.0.1:5181';
const browserPath = process.env.PROVIDER_TEST_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const output = resolve('test-results');
const profile = resolve(output, `provider-preview-${Date.now()}`);
mkdirSync(profile, { recursive: true });
const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
const provider = { accountId: 2, role: 'PROVIDER', status: 'ACTIVE', fullName: 'Chủ nhà thử nghiệm',
  email: 'provider@example.vn', phone: '0912345678', provider: { id: 1, name: 'Homestay thử nghiệm', status: 'ACTIVE' } };
const traveler = { fullName: 'Khách thử nghiệm', email: 'traveler@example.vn', phone: '0987654321' };
const homestay = { id: 21, slug: 'homestay-thu-nghiem', name: 'Homestay thử nghiệm', kind: 'HOMESTAY',
  operationStatus: 'OPERATING', address: 'Mù Cang Chải', regionName: 'Mù Cang Chải', description: 'Chỗ nghỉ bản địa',
  priceRefMin: 400000, ratingAvg: 4.8, ratingCount: 8, attributes: {}, images: [], amenities: [], contacts: [],
  homestayProfile: null, rooms: [{ id: 31, name: 'Phòng đôi', description: 'Phòng hai khách', status: 'ACTIVE',
    maxOccupancy: 2, totalRoomCount: 5, areaSqm: 20, basePrice: 400000, images: [], amenities: [], bedType: 'Giường đôi' }] };
const future = new Date();
future.setDate(future.getDate() + 10);
const checkIn = future.toISOString().slice(0, 10);
future.setDate(future.getDate() + 2);
const checkOut = future.toISOString().slice(0, 10);
const bookingRequest = { placeId: 21, roomTypeId: 31, checkIn, checkOut, roomCount: 1, guestCount: 2,
  guestName: traveler.fullName, guestPhone: traveler.phone, guestEmail: traveler.email };
const calls = [];
const errors = [];
const browserLogs = [];
const pending = new Map();
let socket;
let nextId = 0;

function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(Error(`Browser command timed out: ${method}`)); }, 30000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
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
  calls.push({ path, method: request.method, authorization: request.headers.Authorization });
  if (path === '/api/public/home') {
    await fulfill(requestId, { categories: [], featuredDestinations: [], homestays: [homestay], featuredTours: [], specialties: [] });
  } else if (path === '/api/public/places/21') {
    await fulfill(requestId, homestay);
  } else if (path.endsWith('/notifications')) {
    await fulfill(requestId, { items: [], unread: 0 });
  } else if (path.endsWith('/change-requests')) {
    await fulfill(requestId, { content: [], totalElements: 0, totalPages: 0 });
  } else if (path === '/api/public/bookings' && request.method === 'POST') {
    await fulfill(requestId, { ...bookingRequest, id: 101, bookingCode: 'TEST-101', status: 'PENDING', totalAmount: 800000 }, 201);
  } else {
    await fulfill(requestId, []);
  }
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression, label) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  throw Error(`Timed out: ${label}\n${await evaluate('location.href + "\\n" + document.body.innerText.slice(0, 1500)')}\n${errors.join('\n')}`);
}
async function click(expression) {
  await evaluate(`(${expression}).scrollIntoView({ block: 'center', behavior: 'instant' })`);
  await delay(350);
  const point = await evaluate(`(() => {
    const el = ${expression}; const r = el.getBoundingClientRect();
    const x = r.x + r.width / 2; const y = r.y + r.height / 2;
    if (!el.contains(document.elementFromPoint(x, y))) throw Error('Click target is covered');
    return { x, y };
  })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}
async function visit(path) {
  await send('Page.navigate', { url: `${origin}${path}` });
  await until(`location.pathname === ${JSON.stringify(path.split('?')[0])} && document.readyState === 'complete'`, path);
}
async function screenshot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(resolve(output, name), Buffer.from(data, 'base64'));
}
const notice = "document.getElementById('booking-preview-notice')";
const desktopCta = "document.querySelector('button[aria-describedby=\"booking-preview-notice\"].hidden')";
const mobileCta = "Array.from(document.querySelectorAll('button[aria-describedby=\"booking-preview-notice\"]')).find(b => !b.classList.contains('hidden'))";
const bookingPosts = () => calls.filter(c => c.path === '/api/public/bookings' && c.method === 'POST').length;
async function checkServiceBlocked() {
  const result = await evaluate(`(async () => {
    const { createBooking } = await import('/src/services/bookingService.ts');
    try { await createBooking(${JSON.stringify(bookingRequest)}); return 'unexpected success'; }
    catch (error) { return error.message; }
  })()`);
  assert.match(result, /không thể xác nhận đặt phòng/);
  assert.equal(bookingPosts(), 0, 'Portal previews must not send a booking POST');
}

try {
  browser.on('error', error => errors.push(error.message));
  browser.stderr.on('data', data => browserLogs.push(data.toString()));
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { port = readFileSync(resolve(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; break; } catch { await delay(100); }
  }
  if (!port) throw Error(`Browser did not start: ${errors.join(', ')}`);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(task?.timeout);
      if (message.error) task?.reject(Error(message.error.message)); else task?.resolve(message.result);
    } else if (message.method === 'Fetch.requestPaused') void onRequest(message.params).catch(error => errors.push(error.message));
    else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  });
  socket.addEventListener('close', () => {
    for (const task of pending.values()) { clearTimeout(task.timeout); task.reject(Error('Browser connection closed')); }
    pending.clear();
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setBypassServiceWorker', { bypass: true });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*://*/*' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    if (!sessionStorage.getItem('provider-preview-test')) {
      localStorage.clear();
      localStorage.setItem('portal_token', 'provider-test-token');
      localStorage.setItem('portal_user', JSON.stringify(${JSON.stringify(provider)}));
      sessionStorage.setItem('provider-preview-test', '1');
    }` });
  await visit('/partner/profile');
  await until("!!document.querySelector('main a[href=\"/\"]')", 'desktop homepage shortcut');
  await click("document.querySelector('main a[href=\"/\"]')");
  await until("location.pathname === '/' && !!document.querySelector('a[href=\"/homestays/21\"]')", 'provider homepage');
  assert.ok(await evaluate("document.body.innerText.includes('Về cổng nhà cung cấp')"));
  assert.equal(await evaluate("localStorage.getItem('portal_token')"), 'provider-test-token');
  console.log('PASS: desktop shortcut opens the homepage and keeps the provider session');

  await visit(`/homestays/21?checkIn=${checkIn}&checkOut=${checkOut}`);
  const roomCta = "Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Đặt 1 phòng')";
  await until(`!!${roomCta} && !(${roomCta}).disabled`, 'homestay room selection');
  await click(roomCta);
  await until(`location.pathname === '/booking' && !!${notice}`, 'provider booking form');
  const editable = await evaluate("Array.from(document.querySelectorAll('input[type=text], input[type=tel], input[type=email], textarea')).every(el => !el.disabled && !el.readOnly)");
  assert.equal(editable, true, 'All contact and note fields stay editable');
  await evaluate(`(() => {
    const input = document.querySelector('input[placeholder="Nhập họ và tên đầy đủ"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Người liên hệ mới');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  assert.equal(await evaluate("document.querySelector('input[placeholder=\"Nhập họ và tên đầy đủ\"]').value"), 'Người liên hệ mới');
  assert.equal(await evaluate(`(${desktopCta}).disabled`), true);
  await evaluate(`(${desktopCta}).click()`);
  await checkServiceBlocked();
  await evaluate("window.scrollTo({ top: 0, behavior: 'instant' })");
  await screenshot('provider-preview-desktop.png');
  console.log('PASS: provider can select dates and enter information, but UI and service block creation');

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await until(`!!${mobileCta}`, 'mobile booking CTA');
  assert.equal(await evaluate(`(${mobileCta}).disabled`), true);
  await evaluate(`(${mobileCta}).click()`);
  assert.equal(bookingPosts(), 0);
  await screenshot('provider-preview-mobile.png');
  await visit('/partner/profile');
  await until("!!document.querySelector('header a[aria-label=\"Về trang chủ du lịch\"]')", 'mobile homepage icon');
  await click("document.querySelector('header a[aria-label=\"Về trang chủ du lịch\"]')");
  await until("location.pathname === '/' && document.body.innerText.includes('Về cổng nhà cung cấp')", 'mobile provider homepage');
  const returnButton = "Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Về cổng nhà cung cấp'))";
  await click(returnButton);
  await until("location.pathname === '/partner'", 'return to provider portal');
  console.log('PASS: mobile homepage icon, disabled booking button and return to portal');

  await evaluate(`localStorage.setItem('traveler_token', 'traveler-test-token'); localStorage.setItem('traveler_user', JSON.stringify(${JSON.stringify(traveler)}));`);
  await checkServiceBlocked();
  await evaluate(`localStorage.setItem('portal_user', JSON.stringify({ ...${JSON.stringify(provider)}, role: 'ADMIN' }));`);
  await checkServiceBlocked();
  console.log('PASS: simultaneous traveler sessions cannot bypass provider or admin restrictions');

  await evaluate("localStorage.removeItem('portal_token'); window.dispatchEvent(new Event('auth_change'));");
  await visit(`/homestays/21?checkIn=${checkIn}&checkOut=${checkOut}`);
  await until(`!!${roomCta} && !(${roomCta}).disabled`, 'traveler room selection');
  await click(roomCta);
  await until("location.pathname === '/booking' && !!document.querySelector('input[type=email]')", 'traveler booking');
  assert.equal(await evaluate(`!!${notice}`), false, 'Stale portal user without token must not restrict a traveler');
  const travelerCta = "Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Đặt phòng')";
  assert.equal(await evaluate(`(${travelerCta}).disabled`), false);
  await click(travelerCta);
  await until("document.body.innerText.includes('Xem lại chi tiết đơn đặt phòng')", 'traveler review dialog');
  assert.equal(await evaluate("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Xác nhận đặt phòng' && !b.classList.contains('hidden')).disabled"), false);
  await evaluate(`(async () => { const { createBooking } = await import('/src/services/bookingService.ts'); await createBooking(${JSON.stringify(bookingRequest)}); })()`);
  assert.equal(bookingPosts(), 1, 'Traveler still sends a booking to the mocked API');
  assert.equal(calls.find(c => c.path === '/api/public/bookings' && c.method === 'POST').authorization, 'Bearer traveler-test-token');
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS: traveler booking, authorization and review remain available; no browser exceptions');
} catch (error) {
  console.error(error, errors.join('\n'), browserLogs.join('\n'));
  process.exitCode = 1;
} finally {
  socket?.close();
  browser.kill();
}
