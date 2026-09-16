import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  'index.html', 'es/index.html', 'ar/index.html', 'ru/index.html',
  'iphone-repair-chicago/index.html', 'es/reparacion-iphone-chicago/index.html',
  'ar/iphone-repair-chicago/index.html', 'ru/remont-iphone-chicago/index.html'
];

function verifyPng(bytes, size) {
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16), size);
  assert.equal(bytes.readUInt32BE(20), size);
}

test('brand icons have the declared dimensions and valid file headers', () => {
  for (const size of [96, 192]) {
    verifyPng(fs.readFileSync(path.join(root, `assets/favicon-${size}.png`)), size);
  }
  verifyPng(fs.readFileSync(path.join(root, 'assets/apple-touch-icon.png')), 180);
  const ico = fs.readFileSync(path.join(root, 'favicon.ico'));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 1);
  assert.equal(ico[6], 48);
  assert.equal(ico[7], 48);
  assert.equal(ico.readUInt32LE(18), 22);
  assert.equal(ico.readUInt32LE(14), ico.length - 22);
  verifyPng(ico.subarray(22), 48);
});

test('all public languages and service pages use the same root-relative brand icons', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.ok(html.includes('<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="48x48">'), page);
    for (const size of [96, 192]) {
      assert.ok(html.includes(`<link rel="icon" href="/assets/favicon-${size}.png" type="image/png" sizes="${size}x${size}">`), page);
    }
    assert.ok(html.includes('<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180">'), page);
  }
});
