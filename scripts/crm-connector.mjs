import { randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_REQUEST_BYTES = 16 * 1024;
const FORWARD_TIMEOUT_MS = 10 * 1000;
const HEALTH_TIMEOUT_MS = 3 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const root = path.resolve(import.meta.dirname, '..');

function jsonResponse(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders
  });
  response.end(JSON.stringify(body));
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function safePath(value, fallback) {
  const candidate = cleanText(value, 200) || fallback;
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('?') || candidate.includes('#')) {
    throw new Error('CRM path must start with one slash and cannot include a query or fragment');
  }
  return candidate;
}

export async function loadConnectorConfig(configPath) {
  let parsed;
  try {
    parsed = JSON.parse(await readFile(configPath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`CRM connector config was not found: ${configPath}`);
    }
    throw new Error(`CRM connector config is invalid: ${error instanceof Error ? error.message : 'unknown error'}`);
  }

  const crmHost = cleanText(parsed.crmHost, 100) || '127.0.0.1';
  if (!['127.0.0.1', 'localhost'].includes(crmHost)) {
    throw new Error('CRM host must be 127.0.0.1 or localhost');
  }
  const crmPort = Number(parsed.crmPort);
  if (!Number.isInteger(crmPort) || crmPort < 1 || crmPort > 65535) {
    throw new Error('CRM port must be an integer between 1 and 65535');
  }

  return {
    crmUrl: new URL(safePath(parsed.crmPath, '/api/repair-requests'), `http://${crmHost}:${crmPort}`),
    healthUrl: new URL(safePath(parsed.crmHealthPath, '/health/ready'), `http://${crmHost}:${crmPort}`)
  };
}

function secretMatches(received, expected) {
  const left = Buffer.from(received || '', 'utf8');
  const right = Buffer.from(expected || '', 'utf8');
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

function validatePayload(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const allowedContactMethods = new Set(['', 'Phone Call', 'Text Message', 'Email']);
  const allowedDeviceTypes = new Set(['', 'Phone', 'Tablet', 'Laptop', 'Console', 'Other']);
  return input.source === 'TecPro99 Website'
    && cleanText(input.customerName, 100).length >= 2
    && /^\d{10}$/.test(String(input.phoneNumber || ''))
    && cleanText(input.email, 160).length === String(input.email || '').trim().length
    && allowedDeviceTypes.has(cleanText(input.deviceType, 40))
    && allowedContactMethods.has(cleanText(input.preferredContactMethod, 30))
    && !Number.isNaN(Date.parse(input.submittedAt));
}

async function readJsonBody(request) {
  const declaredLength = Number(request.headers['content-length'] || 0);
  if (declaredLength > MAX_REQUEST_BYTES) throw Object.assign(new Error('Request is too large'), { status: 413 });

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_REQUEST_BYTES) throw Object.assign(new Error('Request is too large'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 });
  }
}

function clientAddress(request) {
  return cleanText(request.headers['cf-connecting-ip'] || request.headers['x-forwarded-for'] || request.socket.remoteAddress, 100) || 'unknown';
}

export function createCrmConnector(options = {}) {
  const connectorApiKey = options.connectorApiKey ?? process.env.CRM_CONNECTOR_API_KEY;
  if (!connectorApiKey || connectorApiKey.length < 32) {
    throw new Error('CRM_CONNECTOR_API_KEY must contain at least 32 characters');
  }

  const configPath = path.resolve(options.configPath || process.env.CRM_CONNECTOR_CONFIG || path.join(root, '.crm-connector.local.json'));
  const localApiKey = options.localApiKey ?? process.env.CRM_LOCAL_API_KEY ?? '';
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const requestLog = new Map();
  const completedRequests = new Map();

  function isRateLimited(address, now) {
    const active = (requestLog.get(address) || []).filter((time) => time > now - RATE_LIMIT_WINDOW_MS);
    if (active.length >= RATE_LIMIT_MAX_REQUESTS) {
      requestLog.set(address, active);
      return true;
    }
    active.push(now);
    requestLog.set(address, active);
    if (requestLog.size > 250) {
      for (const [key, times] of requestLog.entries()) {
        const remaining = times.filter((time) => time > now - RATE_LIMIT_WINDOW_MS);
        if (remaining.length) requestLog.set(key, remaining);
        else requestLog.delete(key);
      }
    }
    return false;
  }

  return createServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://connector.local');
    if (request.method === 'GET' && url.pathname === '/health') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
      try {
        const { healthUrl } = await loadConnectorConfig(configPath);
        const crmResponse = await fetchImpl(healthUrl, {
          method: 'GET',
          headers: { Accept: 'text/plain' },
          signal: controller.signal
        });
        if (!crmResponse.ok) {
          throw new Error(`Local CRM readiness check returned HTTP ${crmResponse.status}`);
        }

        jsonResponse(response, 200, {
          status: 'ok',
          service: 'TecPro99 CRM Connector',
          crm: 'ready'
        });
      } catch {
        jsonResponse(response, 503, {
          status: 'unavailable',
          service: 'TecPro99 CRM Connector',
          crm: 'unavailable'
        });
      } finally {
        clearTimeout(timeout);
      }
      return;
    }
    if (request.method !== 'POST' || url.pathname !== '/repair-requests') {
      jsonResponse(response, 404, { success: false, error: 'Not found.' });
      return;
    }
    if (!secretMatches(request.headers['x-api-key'], connectorApiKey)) {
      jsonResponse(response, 401, { success: false, error: 'Unauthorized.' });
      return;
    }
    if (!String(request.headers['content-type'] || '').toLowerCase().includes('application/json')) {
      jsonResponse(response, 415, { success: false, error: 'Unsupported request format.' });
      return;
    }

    const now = Date.now();
    const idempotencyKey = cleanText(request.headers['idempotency-key'], 100);
    const duplicate = idempotencyKey ? completedRequests.get(idempotencyKey) : null;
    if (duplicate && duplicate.expiresAt > now) {
      jsonResponse(response, 200, { success: true, referenceNumber: duplicate.referenceNumber });
      return;
    }
    if (isRateLimited(clientAddress(request), now)) {
      jsonResponse(response, 429, { success: false, error: 'Too many requests.' }, { 'Retry-After': '60' });
      return;
    }

    try {
      const payload = await readJsonBody(request);
      if (!validatePayload(payload)) {
        jsonResponse(response, 422, { success: false, error: 'Invalid repair request.' });
        return;
      }

      // The local target is re-read for every request, so changing its port needs no restart.
      const { crmUrl } = await loadConnectorConfig(configPath);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);
      let crmResponse;
      try {
        const headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey || randomUUID()
        };
        if (localApiKey) headers['X-API-Key'] = localApiKey;
        crmResponse = await fetchImpl(crmUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }

      const result = await crmResponse.json().catch(() => ({}));
      if (!crmResponse.ok) throw new Error(`Local CRM returned HTTP ${crmResponse.status}`);
      const referenceNumber = cleanText(result.referenceNumber || result.reference || result.id, 100)
        || `WEB-${String(Date.now()).slice(-7)}`;
      if (idempotencyKey) {
        completedRequests.set(idempotencyKey, { referenceNumber, expiresAt: now + IDEMPOTENCY_TTL_MS });
      }
      jsonResponse(response, 200, { success: true, referenceNumber });
    } catch (error) {
      const status = Number(error?.status) || 502;
      console.error('CRM connector forwarding failed:', error instanceof Error ? error.message : 'Unknown error');
      jsonResponse(response, status, {
        success: false,
        error: status < 500 ? error.message : 'The local CRM is temporarily unavailable.'
      });
    }
  });
}

export async function startCrmConnector() {
  const configPath = path.resolve(process.env.CRM_CONNECTOR_CONFIG || path.join(root, '.crm-connector.local.json'));
  await loadConnectorConfig(configPath);
  const port = Number(process.env.CRM_CONNECTOR_PORT || 4399);
  const host = process.env.CRM_CONNECTOR_HOST || '127.0.0.1';
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('CRM_CONNECTOR_PORT is invalid');

  const server = createCrmConnector({ configPath });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  console.log(`TecPro99 CRM connector listening on http://${host}:${port}`);
  console.log(`Forwarding repair requests using ${configPath}`);
  return server;
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  startCrmConnector().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
