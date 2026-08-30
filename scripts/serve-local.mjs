import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import repairRequestHandler from '../api/repair-request.mjs';
import repairRequestConfigHandler from '../api/repair-request-config.mjs';

const root = path.resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT || 4176);
const host = process.env.HOST || '0.0.0.0';
process.env.REPAIR_REQUEST_MODE ||= 'mock';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png'
};

async function handleApiRequest(request, response, handler) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : Buffer.concat(chunks);
  const apiRequest = new Request(`http://${request.headers.host}${request.url}`, {
    method: request.method,
    headers: new Headers(request.headers),
    body,
    duplex: body ? 'half' : undefined
  });
  const apiResponse = await handler.fetch(apiRequest);
  response.writeHead(apiResponse.status, Object.fromEntries(apiResponse.headers.entries()));
  response.end(Buffer.from(await apiResponse.arrayBuffer()));
}

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);

  if (pathname === '/api/repair-request') {
    await handleApiRequest(request, response, repairRequestHandler);
    return;
  }
  if (pathname === '/api/repair-request-config') {
    await handleApiRequest(request, response, repairRequestConfigHandler);
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== path.join(root, 'index.html')) {
    response.writeHead(403).end();
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    response.end(file);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`TecPro99 local preview running on http://${host}:${port}`);
});
