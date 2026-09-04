const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_TOKEN || !chatId) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
}

export function lowStockItems(products) {
  return (products || []).filter(product => product.stock < product.min);
}

export function formatLowStockMessage(companyName, items) {
  const lines = items.map(product => `• ${product.name}: ${product.stock} ${product.unit} (мин. ${product.min})`);
  return `⚠️ <b>${companyName}</b> — низкий остаток:\n${lines.join('\n')}`;
}

export function randomLinkCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
