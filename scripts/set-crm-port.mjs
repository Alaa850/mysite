import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const configPath = path.resolve(process.env.CRM_CONNECTOR_CONFIG || path.join(root, '.crm-connector.local.json'));
const port = Number(process.argv[2]);
const requestedPath = process.argv[3];

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Usage: node scripts/set-crm-port.mjs <port> [/api/path]');
  process.exitCode = 1;
} else {
  let config = {
    crmHost: '127.0.0.1',
    crmPort: port,
    crmPath: '/api/repair-requests',
    crmHealthPath: '/health/ready'
  };
  try {
    config = { ...config, ...JSON.parse(await readFile(configPath, 'utf8')) };
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  if (requestedPath && (!requestedPath.startsWith('/') || requestedPath.startsWith('//'))) {
    throw new Error('The CRM API path must begin with one slash, for example /api/repair-requests');
  }
  config.crmHost = '127.0.0.1';
  config.crmPort = port;
  if (requestedPath) config.crmPath = requestedPath;
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  console.log(`Local CRM target updated to http://${config.crmHost}:${config.crmPort}${config.crmPath}`);
  console.log('The connector reads this setting automatically; no website deployment is needed.');
}
