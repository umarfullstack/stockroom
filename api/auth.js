import { supabaseAnon, toAccount } from './_supabase.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ ok: false, error: 'Method not allowed' });
  const { email, password } = request.body || {};
  if (!email || !password) return response.status(400).json({ ok: false, error: 'Заполните все поля' });
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error || !data?.user) return response.status(401).json({ ok: false, error: 'Неверный email или пароль' });
  return response.status(200).json({ ok: true, user: toAccount(data.user), access_token: data.session.access_token });
}
