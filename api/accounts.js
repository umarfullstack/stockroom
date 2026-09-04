import { supabaseAdmin, requireAdmin, toAccount, ROLES } from './_supabase.js';

export default async function handler(request, response) {
  const admin = await requireAdmin(request);
  if (!admin) return response.status(401).json({ ok: false, error: 'Требуется вход администратора' });
  const companyId = admin.user_metadata?.company_id;
  const companyName = admin.user_metadata?.company_name;

  if (request.method === 'GET') {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return response.status(500).json({ ok: false, error: 'Не удалось загрузить аккаунты' });
    const accounts = data.users.filter(user => user.user_metadata?.company_id === companyId).map(toAccount);
    return response.status(200).json(accounts);
  }

  if (request.method === 'POST') {
    const { name, email, password, role } = request.body || {};
    if (!name || !email || !password || !role) return response.status(400).json({ ok: false, error: 'Заполните все поля' });
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name, role, company_id: companyId, company_name: companyName }
    });
    if (error) return response.status(400).json({ ok: false, error: error.message === 'User already registered' ? 'Такой email уже зарегистрирован' : error.message });
    return response.status(201).json({ ok: true });
  }

  if (request.method === 'DELETE') {
    const id = request.body?.id;
    if (!id) return response.status(400).json({ ok: false, error: 'Аккаунт не найден' });
    if (id === admin.id) return response.status(400).json({ ok: false, error: 'Нельзя удалить свой аккаунт' });
    const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) return response.status(500).json({ ok: false, error: 'Не удалось загрузить аккаунты' });
    const companyUsers = data.users.filter(user => user.user_metadata?.company_id === companyId);
    const account = companyUsers.find(user => user.id === id);
    if (!account) return response.status(400).json({ ok: false, error: 'Аккаунт не найден' });
    if (account.user_metadata?.role === ROLES.ADMIN && companyUsers.filter(user => user.user_metadata?.role === ROLES.ADMIN).length === 1) {
      return response.status(400).json({ ok: false, error: 'Нельзя удалить последнего администратора' });
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) return response.status(500).json({ ok: false, error: 'Не удалось удалить аккаунт' });
    return response.status(200).json({ ok: true });
  }

  response.setHeader('Allow', 'GET, POST, DELETE');
  return response.status(405).json({ ok: false, error: 'Method not allowed' });
}
