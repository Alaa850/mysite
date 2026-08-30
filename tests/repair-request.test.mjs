import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/repair-request.mjs';

function buildRequest(body, ip = '203.0.113.10') {
  return new Request('https://techpro99.com/api/repair-request', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://techpro99.com',
      'x-forwarded-for': ip
    },
    body: JSON.stringify(body)
  });
}

function validBody(overrides = {}) {
  return {
    customerName: 'Jordan Lee',
    phoneNumber: '(773) 628-7132',
    email: 'jordan@example.com',
    deviceType: 'Phone',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    problemDescription: 'Broken screen',
    preferredContactMethod: 'Text Message',
    pageUrl: 'https://techpro99.com/#services',
    consent: true,
    companyWebsite: '',
    captchaToken: 'test-captcha-token',
    requestId: 'request-000001',
    ...overrides
  };
}

function applyEnvironment(values) {
  const before = new Map(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return () => {
    for (const [key, value] of before.entries()) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

test('mock mode accepts valid requests and returns a reference', async () => {
  const restore = applyEnvironment({ REPAIR_REQUEST_MODE: 'mock' });
  try {
    const response = await handler.fetch(buildRequest(validBody({ requestId: 'mock-request-0001' }), '203.0.113.11'));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.match(body.referenceNumber, /^WEB-MOCK-\d+$/);
  } finally {
    restore();
  }
});

test('server-side validation rejects missing required data and invalid US phone numbers', async () => {
  const restore = applyEnvironment({ REPAIR_REQUEST_MODE: 'mock' });
  try {
    const response = await handler.fetch(buildRequest(validBody({ customerName: '', phoneNumber: '555' }), '203.0.113.12'));
    const body = await response.json();
    assert.equal(response.status, 422);
    assert.equal(body.success, false);
    assert.deepEqual(body.fields.sort(), ['customerName', 'phoneNumber']);
  } finally {
    restore();
  }
});

test('honeypot submissions never reach the CRM', async () => {
  const restore = applyEnvironment({
    REPAIR_REQUEST_MODE: 'production',
    TURNSTILE_SECRET_KEY: 'secret',
    REPAIR_REQUEST_API_URL: 'https://crm.example.test/requests',
    REPAIR_REQUEST_API_KEY: 'key'
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('The CRM must not be called for honeypots');
  };
  try {
    const response = await handler.fetch(buildRequest(validBody({ companyWebsite: 'https://spam.example' }), '203.0.113.13'));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});

test('production mode verifies CAPTCHA server-side and forwards a normalized CRM payload', async () => {
  const restore = applyEnvironment({
    REPAIR_REQUEST_MODE: 'production',
    TURNSTILE_SECRET_KEY: 'turnstile-secret',
    TURNSTILE_EXPECTED_HOSTNAME: 'techpro99.com',
    REPAIR_REQUEST_API_URL: 'https://crm.example.test/requests',
    REPAIR_REQUEST_API_KEY: 'crm-secret'
  });
  const originalFetch = globalThis.fetch;
  let crmRequest;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('turnstile')) {
      return Response.json({ success: true, hostname: 'techpro99.com' });
    }
    crmRequest = { url: String(url), options, body: JSON.parse(options.body) };
    return Response.json({ referenceNumber: 'WEB-1042' });
  };
  try {
    const response = await handler.fetch(buildRequest(validBody({ phoneNumber: '(312) 555-0100', requestId: 'production-request-1' }), '203.0.113.14'));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(body, { success: true, referenceNumber: 'WEB-1042' });
    assert.equal(crmRequest.url, 'https://crm.example.test/requests');
    assert.equal(crmRequest.options.headers['X-API-Key'], 'crm-secret');
    assert.equal(crmRequest.body.source, 'TecPro99 Website');
    assert.equal(crmRequest.body.phoneNumber, '3125550100');
    assert.equal(crmRequest.body.customerName, 'Jordan Lee');
    assert.match(crmRequest.body.submittedAt, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});

test('network rate limiting rejects the fourth request inside the window', async () => {
  const restore = applyEnvironment({ REPAIR_REQUEST_MODE: 'mock' });
  try {
    let response;
    for (let index = 0; index < 4; index += 1) {
      response = await handler.fetch(buildRequest(validBody({ phoneNumber: `202555010${index}`, requestId: `ip-rate-limit-request-${index}` }), '203.0.113.15'));
    }
    const body = await response.json();
    assert.equal(response.status, 429);
    assert.equal(body.success, false);
    assert.equal(body.code, 'IP_RATE_LIMITED');
  } finally {
    restore();
  }
});

test('phone rate limiting rejects a third recent request even across different networks', async () => {
  const restore = applyEnvironment({ REPAIR_REQUEST_MODE: 'mock' });
  try {
    let response;
    for (let index = 0; index < 3; index += 1) {
      response = await handler.fetch(buildRequest(validBody({ phoneNumber: '6465550199', requestId: `phone-rate-limit-${index}` }), `203.0.113.${20 + index}`));
    }
    const body = await response.json();
    assert.equal(response.status, 429);
    assert.equal(body.success, false);
    assert.equal(body.code, 'PHONE_RATE_LIMITED');
  } finally {
    restore();
  }
});

test('idempotent retries return the original reference without consuming another request', async () => {
  const restore = applyEnvironment({ REPAIR_REQUEST_MODE: 'mock' });
  try {
    const requestBody = validBody({ phoneNumber: '4155550198', requestId: 'idempotent-request-1' });
    const firstResponse = await handler.fetch(buildRequest(requestBody, '203.0.113.30'));
    const firstBody = await firstResponse.json();
    const retryResponse = await handler.fetch(buildRequest(requestBody, '203.0.113.30'));
    const retryBody = await retryResponse.json();
    assert.equal(firstResponse.status, 200);
    assert.equal(retryResponse.status, 200);
    assert.equal(retryBody.referenceNumber, firstBody.referenceNumber);
  } finally {
    restore();
  }
});
