import { accounts } from './_accounts.js';

export default function handler(request, response) {
  if (request.method === 'GET') return response.status(200).json(accounts.map(({ password, ...account }) => account));
  if (request.method === 'POST') {
    const { name, email, password, role } = request.body || {};
    if (!name || !email || !password || !role) return response.status(400).json({ ok: false, error: 'Заполните все поля' });
    if (accounts.some(account => account.email === email)) return response.status(400).json({ ok: false, error: 'Такой email уже зарегистрирован' });
    accounts.push({ id: Date.now(), name, email, password, role });
    return response.status(201).json({ ok: true });
  }
  if (request.method === 'DELETE') {
    const id = Number(request.body?.id);
    const currentId = Number(request.body?.currentId);
    const account = accounts.find(item => item.id === id);
    if (!account) return response.status(400).json({ ok: false, error: 'Аккаунт не найден' });
    if (account.id === currentId) return response.status(400).json({ ok: false, error: 'Нельзя удалить свой аккаунт' });
    if (account.role === 'Администратор' && accounts.filter(item => item.role === 'Администратор').length === 1) return response.status(400).json({ ok: false, error: 'Нельзя удалить последнего администратора' });
    accounts.splice(accounts.indexOf(account), 1);
    return response.status(200).json({ ok: true });
  }
  return response.status(405).json({ ok: false, error: 'Method not allowed' });
}
