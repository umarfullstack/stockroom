import 'dotenv/config';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import authHandler from './api/auth.js';
import accountsHandler from './api/accounts.js';
import stateHandler from './api/state.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const routes = { '/api/auth': authHandler, '/api/accounts': accountsHandler, '/api/state': stateHandler };

async function readBody(request) {
  let body = '';
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
}

function withVercelResponse(response) {
  response.status = code => { response.statusCode = code; return response; };
  response.json = payload => { response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(payload)); return response; };
  return response;
}

createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }

  const handler = routes[request.url];
  if (handler) {
    try { request.body = await readBody(request); }
    catch { return withVercelResponse(response).status(400).json({ ok: false, error: 'Некорректный запрос' }); }
    await handler(request, withVercelResponse(response));
    return;
  }

  const requested = request.url === '/' ? '/index.html' : request.url;
  const filePath = normalize(join(root, requested));
  if (!filePath.startsWith(root)) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  try {
    const content = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
}).listen(4173, () => console.log('Stockroom is running at http://localhost:4173'));
