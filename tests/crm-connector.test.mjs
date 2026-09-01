import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createCrmConnector } from '../scripts/crm-connector.mjs';

const connectorKey = 'test-connector-key-with-more-than-32-characters';

function repairPayload(name = 'Jordan Lee') {
  return {
    source: 'TecPro99 Website',
    customerName: name,
    phoneNumber: '7736287132',
    email: 'jordan@example.com',
    deviceType: 'Phone',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    problemDescription: 'Broken screen',
    preferredContactMethod: 'Text Message',
    pageUrl: 'https://techpro99.com/',
    submittedAt: new Date().toISOString()
  };
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return server.address().port;
}

async function close(server) {
  if (!server.listening) return;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

function createMockCrm(referenceNumber, received) {
  return createServer(async (request, response) => {
    if (request.method === 'GET' && request.url === '/health/ready') {
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end('Healthy');
      return;
    }

    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    received.push({
      path: request.url,
      idempotencyKey: request.headers['idempotency-key'],
      body: JSON.parse(Buffer.concat(chunks).toString('utf8'))
    });
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ referenceNumber }));
  });
}

async function postRepair(connectorPort, body, idempotencyKey, apiKey = connectorKey) {
  return fetch(`http://127.0.0.1:${connectorPort}/repair-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      'X-API-Key': apiKey
    },
    body: JSON.stringify(body)
  });
}

test('connector reloads a changed CRM port without a restart', async () => {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'tecpro99-connector-'));
  const configPath = path.join(temporaryDirectory, 'connector.json');
  const firstReceived = [];
  const secondReceived = [];
  const firstCrm = createMockCrm('WEB-1001', firstReceived);
  const secondCrm = createMockCrm('WEB-1002', secondReceived);
  const firstPort = await listen(firstCrm);
  const secondPort = await listen(secondCrm);
  const connector = createCrmConnector({ configPath, connectorApiKey: connectorKey });
  const connectorPort = await listen(connector);

  try {
    await writeFile(configPath, JSON.stringify({
      crmHost: '127.0.0.1',
      crmPort: firstPort,
      crmPath: '/api/repair-requests',
      crmHealthPath: '/health/ready'
    }));
    const firstResponse = await postRepair(connectorPort, repairPayload('First Customer'), 'connector-request-1');
    assert.equal(firstResponse.status, 200);
    assert.equal((await firstResponse.json()).referenceNumber, 'WEB-1001');

    await writeFile(configPath, JSON.stringify({
      crmHost: '127.0.0.1',
      crmPort: secondPort,
      crmPath: '/api/repair-requests',
      crmHealthPath: '/health/ready'
    }));
    const secondResponse = await postRepair(connectorPort, repairPayload('Second Customer'), 'connector-request-2');
    assert.equal(secondResponse.status, 200);
    assert.equal((await secondResponse.json()).referenceNumber, 'WEB-1002');

    assert.equal(firstReceived.length, 1);
    assert.equal(secondReceived.length, 1);
    assert.equal(firstReceived[0].body.customerName, 'First Customer');
    assert.equal(secondReceived[0].body.customerName, 'Second Customer');
  } finally {
    await Promise.all([close(connector), close(firstCrm), close(secondCrm)]);
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('connector rejects callers without the shared API key', async () => {
  const connector = createCrmConnector({
    configPath: path.join(tmpdir(), 'unused-connector-config.json'),
    connectorApiKey: connectorKey
  });
  const connectorPort = await listen(connector);
  try {
    const response = await postRepair(connectorPort, repairPayload(), 'unauthorized-request-1', 'wrong-key');
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, error: 'Unauthorized.' });
  } finally {
    await close(connector);
  }
});

test('connector rejects malformed repair payloads before contacting the CRM', async () => {
  const connector = createCrmConnector({
    configPath: path.join(tmpdir(), 'unused-connector-config.json'),
    connectorApiKey: connectorKey
  });
  const connectorPort = await listen(connector);
  try {
    const response = await postRepair(
      connectorPort,
      repairPayload('A'),
      'invalid-payload-request-1'
    );
    assert.equal(response.status, 422);
    assert.deepEqual(await response.json(), { success: false, error: 'Invalid repair request.' });
  } finally {
    await close(connector);
  }
});

test('connector health reports ready only when the CRM is ready', async () => {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'tecpro99-health-'));
  const configPath = path.join(temporaryDirectory, 'connector.json');
  const crm = createMockCrm('WEB-HEALTH', []);
  const crmPort = await listen(crm);
  const connector = createCrmConnector({ configPath, connectorApiKey: connectorKey });
  const connectorPort = await listen(connector);

  try {
    await writeFile(configPath, JSON.stringify({
      crmHost: '127.0.0.1',
      crmPort,
      crmPath: '/api/repair-requests',
      crmHealthPath: '/health/ready'
    }));

    const response = await fetch(`http://127.0.0.1:${connectorPort}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: 'ok',
      service: 'TecPro99 CRM Connector',
      crm: 'ready'
    });
  } finally {
    await Promise.all([close(connector), close(crm)]);
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('connector health reports unavailable when the CRM is offline', async () => {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'tecpro99-health-'));
  const configPath = path.join(temporaryDirectory, 'connector.json');
  const stoppedCrm = createMockCrm('WEB-OFFLINE', []);
  const stoppedPort = await listen(stoppedCrm);
  await close(stoppedCrm);
  const connector = createCrmConnector({ configPath, connectorApiKey: connectorKey });
  const connectorPort = await listen(connector);

  try {
    await writeFile(configPath, JSON.stringify({
      crmHost: '127.0.0.1',
      crmPort: stoppedPort,
      crmPath: '/api/repair-requests',
      crmHealthPath: '/health/ready'
    }));

    const response = await fetch(`http://127.0.0.1:${connectorPort}/health`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      status: 'unavailable',
      service: 'TecPro99 CRM Connector',
      crm: 'unavailable'
    });
  } finally {
    await close(connector);
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
