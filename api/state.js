import { supabaseAdmin, requireUser } from './_supabase.js';

export default async function handler(request, response) {
  if (request.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('stockroom_state').select('data').eq('id', 'main').single();
    if (error) return response.status(500).json({ ok: false, error: 'Не удалось загрузить состояние' });
    return response.status(200).json(data.data);
  }

  if (request.method === 'PUT') {
    if (!Array.isArray(request.body?.products) || !Array.isArray(request.body?.movements)) {
      return response.status(400).json({ ok: false, error: 'Invalid state' });
    }
    const user = await requireUser(request);
    if (!user) return response.status(401).json({ ok: false, error: 'Требуется вход' });
    const { error } = await supabaseAdmin.from('stockroom_state').update({ data: request.body, updated_at: new Date().toISOString() }).eq('id', 'main');
    if (error) return response.status(500).json({ ok: false, error: 'Не удалось сохранить состояние' });
    return response.status(200).json({ ok: true });
  }

  response.setHeader('Allow', 'GET, PUT');
  return response.status(405).json({ ok: false, error: 'Method not allowed' });
}
