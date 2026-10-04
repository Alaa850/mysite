import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import handler from '../api/repair-request.mjs';

const root = new URL('../', import.meta.url);
const canonicalDevices = ['', 'Phone', 'Tablet', 'Laptop', 'Console', 'Other'];
const canonicalContacts = ['', 'Phone Call', 'Text Message', 'Email'];

function selectValues(html, id) {
  const select = html.match(new RegExp(`<select id="${id}"[^>]*>([\\s\\S]*?)<\\/select>`));
  assert.ok(select, `Missing ${id}`);
  return [...select[1].matchAll(/<option value="([^"]*)"/g)].map(match => match[1]);
}

for (const [localeIndex, locale] of ['en', 'es', 'ar', 'ru'].entries()) {
  const html = readFileSync(new URL(locale === 'en' ? 'index.html' : `${locale}/index.html`, root), 'utf8');

  test(`${locale}: device and contact values remain canonical and API-compatible`, async () => {
    assert.deepEqual(selectValues(html, 'repairDeviceType'), canonicalDevices);
    assert.deepEqual(selectValues(html, 'repairPreferredContactMethod'), canonicalContacts);
    const previousMode = process.env.REPAIR_REQUEST_MODE;
    process.env.REPAIR_REQUEST_MODE = 'mock';
    try {
      for (const [index, deviceType] of canonicalDevices.entries()) {
        const request = new Request('https://techpro99.com/api/repair-request', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-forwarded-for': `192.0.2.${40 + localeIndex * 10 + index}` },
          body: JSON.stringify({
            customerName: 'Internal Test', phoneNumber: `31255501${localeIndex}${index}`,
            deviceType, preferredContactMethod: canonicalContacts[index % canonicalContacts.length],
            consent: true, requestId: `locale-${locale}-${index}-test`
          })
        });
        const response = await handler.fetch(request);
        assert.equal(response.status, 200, `${locale}: ${deviceType}`);
      }
    } finally {
      if (previousMode === undefined) delete process.env.REPAIR_REQUEST_MODE;
      else process.env.REPAIR_REQUEST_MODE = previousMode;
    }
  });

  test(`${locale}: inline scripts and structured data are valid`, () => {
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (match[1].includes('application/ld+json')) JSON.parse(match[2]);
      else if (!match[1].includes('src=')) new vm.Script(match[2], { filename: fileURLToPath(root) + locale });
    }
    assert.match(html, /trackEvent\('repair_request_attempt'/);
    assert.match(html, /trackEvent\('repair_request_error', 'NETWORK_ERROR'\)/);
    assert.doesNotMatch(html, /customer-assistant|api\/customer-chat/);
  });
}
