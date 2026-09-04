import { supabaseAdmin } from './_supabase.js';
import { sendTelegramMessage, lowStockItems, formatLowStockMessage } from './_telegram.js';

export default async function handler(request, response) {
  if (process.env.CRON_SECRET && request.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({ ok: false });
  }

  const { data: companies, error } = await supabaseAdmin.from('companies').select('id, name, telegram_chat_id').not('telegram_chat_id', 'is', null);
  if (error) return response.status(500).json({ ok: false, error: error.message });

  for (const company of companies) {
    const { data: state } = await supabaseAdmin.from('stockroom_state').select('data').eq('company_id', company.id).single();
    const items = lowStockItems(state?.data?.products);
    if (items.length) await sendTelegramMessage(company.telegram_chat_id, formatLowStockMessage(company.name, items));
  }

  return response.status(200).json({ ok: true, checked: companies.length });
}
