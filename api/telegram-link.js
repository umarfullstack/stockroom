import { supabaseAdmin, requireAdmin } from './_supabase.js';
import { randomLinkCode } from './_telegram.js';

export default async function handler(request, response) {
  const admin = await requireAdmin(request);
  if (!admin) return response.status(401).json({ ok: false, error: 'Требуется вход администратора' });
  const companyId = admin.user_metadata?.company_id;

  if (request.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('companies').select('telegram_chat_id, telegram_link_code').eq('id', companyId).single();
    if (error) return response.status(500).json({ ok: false, error: 'Не удалось загрузить статус' });
    let code = data.telegram_link_code;
    if (!code) {
      code = randomLinkCode();
      await supabaseAdmin.from('companies').update({ telegram_link_code: code }).eq('id', companyId);
    }
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    return response.status(200).json({
      ok: true,
      linked: Boolean(data.telegram_chat_id),
      code,
      deepLink: botUsername ? `https://t.me/${botUsername}?start=${code}` : null
    });
  }

  if (request.method === 'DELETE') {
    const { error } = await supabaseAdmin.from('companies').update({ telegram_chat_id: null }).eq('id', companyId);
    if (error) return response.status(500).json({ ok: false, error: 'Не удалось отключить чат' });
    return response.status(200).json({ ok: true });
  }

  response.setHeader('Allow', 'GET, DELETE');
  return response.status(405).json({ ok: false, error: 'Method not allowed' });
}
