import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const dataFile = join(root, 'stockroom-data.json');
const accountsFile = join(root, 'stockroom-accounts.json');
const initialData = { products: [], movements: [] };
const initialAccounts = {
  accounts: [
    { id: 1, name: 'Анна Петрова', email: 'admin@stockroom.local', password: 'admin2025', role: 'Администратор' },
    { id: 2, name: 'Сотрудник склада', email: 'worker@stockroom.local', password: 'stockroom2025', role: 'Оператор' }
  ]
};

async function getData() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')); }
  catch { await writeFile(dataFile, JSON.stringify(initialData, null, 2)); return initialData; }
}

async function getAccounts() {
  try { return JSON.parse(await readFile(accountsFile, 'utf8')); }
  catch { await writeFile(accountsFile, JSON.stringify(initialAccounts, null, 2)); return initialAccounts; }
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
}

createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }
  if (request.url === '/api/auth' && request.method === 'POST') {
    try {
      const credentials = await readBody(request);
      const { accounts } = await getAccounts();
      const account = accounts.find(item => item.email === credentials.email && item.password === credentials.password);
      const valid = Boolean(account);
      response.writeHead(valid ? 200 : 401, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify(valid ? { ok: true, user: { id: account.id, name: account.name, email: account.email, role: account.role } } : { ok: false, error: 'Неверный email или пароль' }));
    } catch {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ ok: false, error: 'Некорректный запрос' }));
    }
    return;
  }
  if (request.url === '/api/accounts' && request.method === 'GET') {
    const { accounts } = await getAccounts();
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(accounts.map(({ password, ...account }) => account)));
    return;
  }
  if (request.url === '/api/accounts' && request.method === 'POST') {
    try {
      const account = await readBody(request);
      if (!account.name || !account.email || !account.password || !account.role) throw new Error('Missing fields');
      const data = await getAccounts();
      if (data.accounts.some(item => item.email === account.email)) throw new Error('Email exists');
      data.accounts.push({ id: Date.now(), name: account.name, email: account.email, password: account.password, role: account.role });
      await writeFile(accountsFile, JSON.stringify(data, null, 2));
      response.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ ok: true }));
    } catch (error) {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ ok: false, error: error.message === 'Email exists' ? 'Такой email уже зарегистрирован' : 'Заполните все поля' }));
    }
    return;
  }
  if (request.url === '/api/accounts' && request.method === 'DELETE') {
    try {
      const requestData = await readBody(request);
      const data = await getAccounts();
      const account = data.accounts.find(item => item.id === Number(requestData.id));
      if (!account) throw new Error('Account not found');
      if (account.id === Number(requestData.currentId)) throw new Error('Cannot delete self');
      if (account.role === 'Администратор' && data.accounts.filter(item => item.role === 'Администратор').length === 1) throw new Error('Last admin');
      data.accounts = data.accounts.filter(item => item.id !== account.id);
      await writeFile(accountsFile, JSON.stringify(data, null, 2));
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ ok: true }));
    } catch (error) {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ ok: false, error: error.message === 'Cannot delete self' ? 'Нельзя удалить свой аккаунт' : error.message === 'Last admin' ? 'Нельзя удалить последнего администратора' : 'Аккаунт не найден' }));
    }
    return;
  }
  if (request.url === '/api/state' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(await getData()));
    return;
  }
  if (request.url === '/api/state' && request.method === 'PUT') {
    try {
      const data = await readBody(request);
      if (!Array.isArray(data.products) || !Array.isArray(data.movements)) throw new Error('Invalid state');
      await writeFile(dataFile, JSON.stringify(data, null, 2));
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ ok: true }));
    } catch {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ ok: false, error: 'Invalid state' }));
    }
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
