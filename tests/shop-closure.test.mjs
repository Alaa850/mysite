import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { readFile } from 'node:fs/promises';
import { SHOP_CLOSURE, getShopClosure } from '../assets/shop-closure-config.mjs';
import handler from '../api/repair-request.mjs';

test('holiday window lasts exactly 18 hours and ends exclusively', () => {
  const start = Date.parse(SHOP_CLOSURE.startsAt);
  const end = Date.parse(SHOP_CLOSURE.reopensAt);
  assert.equal(end - start, 18 * 60 * 60 * 1000);
  assert.equal(getShopClosure(start - 1), null);
  assert.equal(getShopClosure(start).retryAfterSeconds, 64800);
  assert.equal(getShopClosure(end - 1).retryAfterSeconds, 1);
  assert.equal(getShopClosure(end), null);
  assert.equal(getShopClosure(end + 1), null);
  assert.equal(getShopClosure(NaN), null);
});

test('closed API returns a timed refusal without calling CAPTCHA or CRM', async () => {
  mock.timers.enable({ apis: ['Date'], now: Date.parse(SHOP_CLOSURE.startsAt) + 1000 });
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('Must not call external services'); };
  try {
    const response = await handler.fetch(new Request('https://techpro99.com/api/repair-request', { method: 'POST', body: '{}' }));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Retry-After'), '64799');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await response.json(), {
      success: false,
      code: 'SHOP_TEMPORARILY_CLOSED',
      error: 'The shop is closed for a holiday. Repair requests will resume automatically at the reopening time.',
      reopensAt: SHOP_CLOSURE.reopensAt
    });
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; mock.timers.reset(); }
});

test('normal server validation resumes at the reopening instant', async () => {
  mock.timers.enable({ apis: ['Date'], now: Date.parse(SHOP_CLOSURE.reopensAt) });
  try {
    const response = await handler.fetch(new Request('https://techpro99.com/api/repair-request', {
      method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://techpro99.com' }, body: '{}'
    }));
    assert.equal(response.status, 422);
    assert.equal((await response.json()).code, 'VALIDATION_FAILED');
  } finally { mock.timers.reset(); }
});

test('all eight existing localized pages load the shared holiday controls', async () => {
  const paths = ['index.html', 'es/index.html', 'ar/index.html', 'ru/index.html', 'iphone-repair-chicago/index.html', 'es/reparacion-iphone-chicago/index.html', 'ar/iphone-repair-chicago/index.html', 'ru/remont-iphone-chicago/index.html'];
  for (const path of paths) {
    const html = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.ok(html.includes('/assets/shop-closure.mjs?v=20261023'), path);
    assert.ok(html.includes('/assets/shop-closure.css?v=20261023'), path);
  }
});
