import { supabaseAdmin } from './_supabase.js';
import { sendTelegramMessage } from './_telegram.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).end();

  if (process.env.TELEGRAM_WEBHOOK_SECRET) {
    const header = request.headers['x-telegram-bot-api-secret-token'];
    if (header !== process.env.TELEGRAM_WEBHOOK_SECRET) return response.status(401).end();
  }

  const message = request.body?.message;
  const text = message?.text?.trim();
  const chatId = message?.chat?.id;
  if (!text || !chatId) return response.status(200).json({ ok: true });

  if (text.startsWith('/start')) {
    const code = text.split(' ')[1];
    if (!code) {
      await sendTelegramMessage(chatId, 'Отправьте код привязки из настроек Stockroom (раздел «Сотрудники»).');
      return response.status(200).json({ ok: true });
    }
    const { data: company, error } = await supabaseAdmin.from('companies').select('id, name').eq('telegram_link_code', code).single();
    if (error || !company) {
      await sendTelegramMessage(chatId, 'Код не найден. Проверьте код в настройках Stockroom.');
      return response.status(200).json({ ok: true });
    }
    await supabaseAdmin.from('companies').update({ telegram_chat_id: String(chatId) }).eq('id', company.id);
    await sendTelegramMessage(chatId, `✅ Чат подключён к «${company.name}». Здесь будут уведомления о низких остатках.`);
    return response.status(200).json({ ok: true });
  }

  return response.status(200).json({ ok: true });
}
