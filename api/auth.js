import { accounts } from './_accounts.js';

export default function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ ok: false, error: 'Method not allowed' });
  const account = accounts.find(item => item.email === request.body?.email && item.password === request.body?.password);
  if (!account) return response.status(401).json({ ok: false, error: 'Неверный email или пароль' });
  const { password, ...user } = account;
  return response.status(200).json({ ok: true, user });
}
