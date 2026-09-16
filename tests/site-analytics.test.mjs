import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, '..');
const analyticsSource = fs.readFileSync(path.join(projectRoot, 'assets', 'site-analytics.js'), 'utf8');

test('all public pages load the shared button analytics tracker', () => {
  const pages = [
    'index.html',
    'es/index.html',
    'ar/index.html',
    'ru/index.html',
    'iphone-repair-chicago/index.html',
    'es/reparacion-iphone-chicago/index.html',
    'ar/iphone-repair-chicago/index.html',
    'ru/remont-iphone-chicago/index.html'
  ];

  for (const page of pages) {
    const html = fs.readFileSync(path.join(projectRoot, page), 'utf8');
    assert.match(html, /<script defer src="\/assets\/site-analytics\.js"><\/script>/, page);
  }
});

test('tracker records a stable GA4 button event without reading form fields', () => {
  assert.match(analyticsSource, /sendEvent\('button_click'/);
  assert.match(analyticsSource, /button_name:/);
  assert.match(analyticsSource, /button_group:/);
  assert.match(analyticsSource, /button_section:/);
  assert.match(analyticsSource, /page_language:/);
  assert.doesNotMatch(analyticsSource, /FormData|input\.value|textarea\.value/);
});
