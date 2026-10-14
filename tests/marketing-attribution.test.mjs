import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const api = require('../assets/marketing-attribution.js');
const now = Date.parse('2026-10-14T01:00:00Z');
const yes = { version: 1, allowed: true, at: now - 1000 };
const url = 'https://techpro99.com/iphone-repair-chicago/?utm_source=chatgpt&utm_medium=paid&utm_campaign=local&oppref=opaque-123&email=private%40example.com#name';

test('captures approved attribution fields only', () => {
  const data = api.fromUrl(url, now);
  assert.equal(data.oppref, 'opaque-123');
  assert.equal(data.utm_source, 'chatgpt');
  assert.equal('email' in data, false);
});
test('preserves the opaque reference without hashing or case changes', () => {
  assert.equal(api.fromUrl('https://techpro99.com/?utm_source=chatgpt&click_id=AbC%2B123%2F%3D', now).oppref, 'AbC+123/=');
});
test('absence of consent removes query strings and fragment', () => {
  assert.equal(api.requestPageUrl(url, null, api.fromUrl(url, now), now), 'https://techpro99.com/iphone-repair-chicago/');
});
test('declining consent does not retain attribution', () => {
  assert.equal(api.requestPageUrl(url, { ...yes, allowed: false }, api.fromUrl(url, now), now), 'https://techpro99.com/iphone-repair-chicago/');
});
test('attribution survives navigation to the repair form', () => {
  const result = new URL(api.requestPageUrl('https://techpro99.com/?request=repair', yes, api.fromUrl(url, now), now));
  assert.equal(result.searchParams.get('oppref'), 'opaque-123');
  assert.equal(result.searchParams.get('tp_measurement'), '1');
  assert.equal(result.searchParams.has('email'), false);
});
test('expired attribution is not transmitted', () => {
  const expired = { ...api.fromUrl(url, now), at: now - 30 * 86400000 };
  assert.equal(new URL(api.requestPageUrl(url, yes, expired, now)).search, '');
});
test('expired consent is not transmitted', () => {
  const expired = { ...yes, at: now - 180 * 86400000 };
  assert.equal(new URL(api.requestPageUrl(url, expired, api.fromUrl(url, now), now)).search, '');
});
test('future or malformed storage is ignored', () => {
  assert.equal(api.normalizeContext({ at: now + 600000, utm_source: 'chatgpt' }, now), null);
  assert.equal(api.normalizeConsent({ ...yes, allowed: 'true' }, now), null);
  assert.equal(api.normalizeContext(null, now), null);
});
test('contact-like UTM values and references are excluded', () => {
  const result = api.fromUrl('https://techpro99.com/?utm_source=chatgpt&utm_campaign=private%40example.com&oppref=private%40example.com', now);
  assert.equal('utm_campaign' in result, false);
  assert.equal('oppref' in result, false);
});
test('page URL remains within the CRM contract limit', () => {
  const long = 'https://techpro99.com/' + 'a'.repeat(1600);
  const result = api.requestPageUrl(long, yes, { at: now, utm_source: 'chatgpt', oppref: 'a'.repeat(1024) }, now);
  assert.equal(new URL(result).search, '');
});

test('other advertising sources are outside this integration', () => {
  assert.equal(api.fromUrl('https://techpro99.com/?utm_source=google&click_id=not-openai', now), null);
  assert.equal(api.fromUrl('https://techpro99.com/?click_id=not-openai', now), null);
});

test('all public pages load measurement and sanitize request page URLs', async () => {
  const { readFile } = await import('node:fs/promises');
  for (const file of ['index.html', 'es/index.html', 'ar/index.html', 'ru/index.html',
    'iphone-repair-chicago/index.html', 'es/reparacion-iphone-chicago/index.html',
    'ar/iphone-repair-chicago/index.html', 'ru/remont-iphone-chicago/index.html']) {
    const html = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    assert.ok(html.includes('/assets/marketing-attribution.js'), file);
    if (file === 'index.html' || /^(es|ar|ru)\/index.html$/.test(file)) {
      assert.ok(html.includes('TecPro99Measurement?.requestPageUrl()'), file);
    }
    assert.equal(html.includes('customer-chat.js'), false, file + ' excludes unpublished AI chat');
  }
});
