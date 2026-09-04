import { supabaseAdmin, requireUser, ROLES } from './_supabase.js';
import { sendTelegramMessage, lowStockItems, formatLowStockMessage } from './_telegram.js';

export default async function handler(request, response) {
  const user = await requireUser(request);
  if (!user) return response.status(401).json({ ok: false, error: 'Требуется вход' });
  const companyId = user.user_metadata?.company_id;
  if (!companyId) return response.status(400).json({ ok: false, error: 'Аккаунт не привязан к компании' });

  if (request.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('stockroom_state').select('data').eq('company_id', companyId).single();
    if (error) return response.status(500).json({ ok: false, error: 'Не удалось загрузить состояние' });
    return response.status(200).json(data.data);
  }

  if (request.method === 'PUT') {
    if (!Array.isArray(request.body?.products) || !Array.isArray(request.body?.movements)) {
      return response.status(400).json({ ok: false, error: 'Invalid state' });
    }
    const { data: existing } = await supabaseAdmin.from('stockroom_state').select('data').eq('company_id', companyId).single();
    const existingProducts = existing?.data?.products || [];
    const wasLow = new Set(lowStockItems(existingProducts).map(product => product.id));

    if (user.user_metadata?.role !== ROLES.ADMIN) {
      const newIds = new Set(request.body.products.map(product => product.id));
      const removedProduct = existingProducts.some(product => !newIds.has(product.id));
      if (removedProduct) return response.status(403).json({ ok: false, error: 'Оператор не может удалять товары' });
    }

    const { error } = await supabaseAdmin.from('stockroom_state').update({ data: request.body, updated_at: new Date().toISOString() }).eq('company_id', companyId);
    if (error) return response.status(500).json({ ok: false, error: 'Не удалось сохранить состояние' });

    const newlyLow = lowStockItems(request.body.products).filter(product => !wasLow.has(product.id));
    if (newlyLow.length) {
      const { data: company } = await supabaseAdmin.from('companies').select('name, telegram_chat_id').eq('id', companyId).single();
      if (company?.telegram_chat_id) await sendTelegramMessage(company.telegram_chat_id, formatLowStockMessage(company.name, newlyLow));
    }

    return response.status(200).json({ ok: true });
  }

  response.setHeader('Allow', 'GET, PUT');
  return response.status(405).json({ ok: false, error: 'Method not allowed' });
}
