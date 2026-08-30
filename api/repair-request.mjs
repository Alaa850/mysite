import { createHash, randomUUID } from 'node:crypto';

const MAX_REQUEST_BYTES = 16 * 1024;
const IP_RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;
const IP_RATE_LIMIT_MAX_REQUESTS = 3;
const PHONE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const PHONE_RATE_LIMIT_MAX_REQUESTS = 2;
const COMPLETED_REQUEST_TTL_MS = 60 * 60 * 1000;
const CRM_TIMEOUT_MS = 10 * 1000;
const completedRequests = new Map();
const requestLog = new Map();
const phoneSubmissionLog = new Map();

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'Referrer-Policy': 'same-origin',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
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

function normalizePhoneNumber(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits.length === 10 ? digits : '';
}

function hashPhoneNumber(phoneNumber) {
  return createHash('sha256').update(phoneNumber).digest('base64url');
}

function cleanPageUrl(value) {
  const candidate = cleanText(value, 2048);
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function validatePayload(input) {
  const customerName = cleanText(input.customerName, 100);
  const phoneNumber = normalizePhoneNumber(input.phoneNumber);
  const email = cleanText(input.email, 160).toLowerCase();
  const deviceType = cleanText(input.deviceType, 40);
  const brand = cleanText(input.brand, 80);
  const model = cleanText(input.model, 100);
  const problemDescription = cleanText(input.problemDescription, 1500);
  const preferredContactMethod = cleanText(input.preferredContactMethod, 30);
  const requestId = cleanText(input.requestId, 80);
  const errors = [];
  const allowedDeviceTypes = new Set(['', 'Phone', 'Tablet', 'Laptop', 'Console', 'Other']);
  const allowedContactMethods = new Set(['', 'Phone Call', 'Text Message', 'Email']);

  if (customerName.length < 2) errors.push('customerName');
  if (!phoneNumber) errors.push('phoneNumber');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email');
  if (!allowedDeviceTypes.has(deviceType)) errors.push('deviceType');
  if (!allowedContactMethods.has(preferredContactMethod)) errors.push('preferredContactMethod');
  if (input.consent !== true) errors.push('consent');
  if (requestId && !/^[a-zA-Z0-9-]{8,80}$/.test(requestId)) errors.push('requestId');

  return {
    errors,
    requestId,
    payload: {
      source: 'TecPro99 Website',
      customerName,
      phoneNumber,
      email,
      deviceType,
      brand,
      model,
      problemDescription,
      preferredContactMethod,
      pageUrl: cleanPageUrl(input.pageUrl),
      submittedAt: new Date().toISOString()
    }
  };
}

function pruneMemory(now) {
  for (const [ip, timestamps] of requestLog.entries()) {
    const activeTimestamps = timestamps.filter((timestamp) => timestamp > now - IP_RATE_LIMIT_WINDOW_MS);
    if (activeTimestamps.length) requestLog.set(ip, activeTimestamps);
    else requestLog.delete(ip);
  }
  for (const [phoneHash, timestamps] of phoneSubmissionLog.entries()) {
    const activeTimestamps = timestamps.filter((timestamp) => timestamp > now - PHONE_RATE_LIMIT_WINDOW_MS);
    if (activeTimestamps.length) phoneSubmissionLog.set(phoneHash, activeTimestamps);
    else phoneSubmissionLog.delete(phoneHash);
  }
  for (const [key, value] of completedRequests.entries()) {
    if (value.expiresAt <= now) completedRequests.delete(key);
  }
}

function isIpRateLimited(ip, now) {
  const timestamps = (requestLog.get(ip) || []).filter((timestamp) => timestamp > now - IP_RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= IP_RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  if (requestLog.size > 250 || phoneSubmissionLog.size > 250 || completedRequests.size > 250) pruneMemory(now);
  return false;
}

function isPhoneRateLimited(phoneHash, now) {
  const timestamps = (phoneSubmissionLog.get(phoneHash) || []).filter((timestamp) => timestamp > now - PHONE_RATE_LIMIT_WINDOW_MS);
  phoneSubmissionLog.set(phoneHash, timestamps);
  return timestamps.length >= PHONE_RATE_LIMIT_MAX_REQUESTS;
}

function recordPhoneSubmission(phoneHash, now) {
  const timestamps = phoneSubmissionLog.get(phoneHash) || [];
  timestamps.push(now);
  phoneSubmissionLog.set(phoneHash, timestamps);
}

function createMockReference() {
  return `WEB-MOCK-${String(Date.now()).slice(-7)}`;
}

async function verifyTurnstile(token, requestId, clientIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error('Turnstile is not configured');
  if (!token || token.length > 2048) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: clientIp,
    idempotency_key: requestId || randomUUID()
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal
    });
    const result = await response.json().catch(() => ({}));
    const expectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME;
    return response.ok && result.success === true && (!expectedHostname || result.hostname === expectedHostname);
  } finally {
    clearTimeout(timeout);
  }
}

async function sendToCrm(payload, requestId) {
  const apiUrl = process.env.REPAIR_REQUEST_API_URL;
  const apiKey = process.env.REPAIR_REQUEST_API_KEY;
  if (!apiUrl || !apiKey) throw new Error('Repair request CRM is not configured');

  let crmUrl;
  try {
    crmUrl = new URL(apiUrl);
  } catch {
    throw new Error('Repair request CRM URL is invalid');
  }
  if (crmUrl.protocol !== 'https:') throw new Error('Repair request CRM must use HTTPS');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
  try {
    const response = await fetch(crmUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': requestId || randomUUID(),
        'X-API-Key': apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Repair CRM rejected a request:', response.status);
      throw new Error('Repair request CRM rejected the submission');
    }
    const referenceNumber = cleanText(result.referenceNumber || result.reference || result.id, 100);
    return referenceNumber || `WEB-${String(Date.now()).slice(-7)}`;
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed.' }, 405, { Allow: 'POST' });
    }

    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) {
      return jsonResponse({ success: false, error: 'Request origin is not allowed.' }, 403);
    }
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return jsonResponse({ success: false, error: 'Unsupported request format.' }, 415);
    }

    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_REQUEST_BYTES) {
      return jsonResponse({ success: false, error: 'Request is too large.' }, 413);
    }

    let input;
    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
        return jsonResponse({ success: false, error: 'Request is too large.' }, 413);
      }
      input = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ success: false, error: 'Invalid request.' }, 400);
    }
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return jsonResponse({ success: false, error: 'Invalid request.' }, 400);
    }

    // Quietly accept filled honeypots without forwarding the request to the CRM.
    if (cleanText(input.companyWebsite, 200)) {
      return jsonResponse({ success: true, referenceNumber: createMockReference() });
    }

    const { errors, requestId, payload } = validatePayload(input);
    if (errors.length) {
      return jsonResponse({ success: false, error: 'Please check the required information.', fields: errors }, 422);
    }

    const clientIp = getClientIp(request);
    const idempotencyKey = requestId ? `${clientIp}:${requestId}` : '';
    const now = Date.now();
    const duplicate = idempotencyKey ? completedRequests.get(idempotencyKey) : null;
    if (duplicate && duplicate.expiresAt > now) {
      return jsonResponse({ success: true, referenceNumber: duplicate.referenceNumber });
    }
    if (isIpRateLimited(clientIp, now)) {
      return jsonResponse(
        { success: false, code: 'IP_RATE_LIMITED', error: 'Too many repair requests were submitted from this network. Please wait 30 minutes or call TecPro99 at (773) 628-7132.' },
        429,
        { 'Retry-After': String(IP_RATE_LIMIT_WINDOW_MS / 1000) }
      );
    }

    try {
      const mockMode = process.env.REPAIR_REQUEST_MODE === 'mock';
      if (!mockMode) {
        const captchaToken = typeof input.captchaToken === 'string' ? input.captchaToken.trim() : '';
        const isHuman = await verifyTurnstile(captchaToken, requestId, clientIp);
        if (!isHuman) {
          return jsonResponse({ success: false, error: 'Spam protection could not verify this request.' }, 422);
        }
      }

      const phoneHash = hashPhoneNumber(payload.phoneNumber);
      if (isPhoneRateLimited(phoneHash, now)) {
        return jsonResponse(
          { success: false, code: 'PHONE_RATE_LIMITED', error: 'This phone number already has recent repair requests. Please wait one hour or call TecPro99 at (773) 628-7132.' },
          429,
          { 'Retry-After': String(PHONE_RATE_LIMIT_WINDOW_MS / 1000) }
        );
      }

      const referenceNumber = mockMode ? createMockReference() : await sendToCrm(payload, requestId);
      recordPhoneSubmission(phoneHash, now);
      if (idempotencyKey) {
        completedRequests.set(idempotencyKey, { referenceNumber, expiresAt: now + COMPLETED_REQUEST_TTL_MS });
      }
      return jsonResponse({ success: true, referenceNumber });
    } catch (error) {
      console.error('Repair request submission failed:', error instanceof Error ? error.message : 'Unknown error');
      return jsonResponse({ success: false, error: 'Repair requests are temporarily unavailable.' }, 503);
    }
  }
};
