import 'dotenv/config';
import { supabaseAdmin as supabase } from '../api/_supabase.js';

const seedAccounts = [
  { name: 'Анна Петрова', email: 'admin@stockroom.local', password: 'admin2025', role: 'Администратор' },
  { name: 'Сотрудник склада', email: 'worker@stockroom.local', password: 'stockroom2025', role: 'Оператор' }
];

for (const account of seedAccounts) {
  const { error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { name: account.name, role: account.role }
  });
  if (error) console.error(`✗ ${account.email}: ${error.message}`);
  else console.log(`✓ ${account.email} создан (${account.role})`);
}
