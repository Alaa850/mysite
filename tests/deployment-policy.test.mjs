import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('production allowlist excludes internal tooling and unfinished chat', async () => {
  const rules = (await readFile(new URL('../.vercelignore', import.meta.url), 'utf8'))
    .split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  assert.equal(rules[0], '/*');
  assert.ok(rules.includes('/api/*'));
  assert.deepEqual(rules.filter(line => line.startsWith('!/api/')), [
    '!/api/', '!/api/repair-request.mjs', '!/api/repair-request-config.mjs'
  ]);
  for (const entry of ['index.html', 'assets/', 'ar/', 'es/', 'ru/', 'iphone-repair-chicago/',
    'favicon.ico', 'robots.txt', 'sitemap.xml', 'llms.txt', 'vercel.json']) {
    assert.ok(rules.includes(`!/${entry}`), `${entry} must remain deployable`);
  }
  for (const entry of ['scripts/', 'tests/', '.github/', '.env.local', '.crm-connector.local.json',
    'REPAIR_REQUEST_SETUP.md', 'parts-desk/']) {
    assert.ok(!rules.includes(`!/${entry}`), `${entry} must not be published`);
  }
});
