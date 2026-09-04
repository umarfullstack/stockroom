import 'dotenv/config';
import { createCompany } from './_provision.mjs';

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? null : process.argv[index + 1];
}

const id = arg('id');
const name = arg('name');
const adminName = arg('admin-name');
const adminEmail = arg('admin-email');
const adminPassword = arg('admin-password');

if (!id || !name || !adminName || !adminEmail || !adminPassword) {
  console.error('Использование: node scripts/create-company.mjs --id <slug> --name "<Название компании>" --admin-name "<Имя админа>" --admin-email <email> --admin-password <пароль>');
  process.exit(1);
}

try {
  const { telegramLinkCode } = await createCompany({ id, name, adminName, adminEmail, adminPassword });
  console.log(`✓ Компания "${name}" (${id}) создана, админ ${adminEmail} может входить`);
  console.log(`  Telegram-код привязки: ${telegramLinkCode} (можно подключить в разделе «Сотрудники»)`);
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
