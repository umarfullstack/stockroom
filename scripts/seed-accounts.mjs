import 'dotenv/config';
import { createCompany } from './_provision.mjs';
import { supabaseAdmin } from '../api/_supabase.js';

const companyId = 'demo';
const companyName = 'Demo компания';

try {
  await createCompany({ id: companyId, name: companyName, adminName: 'Анна Петрова', adminEmail: 'admin@stockroom.local', adminPassword: 'admin2025' });
  console.log('✓ admin@stockroom.local создан (Администратор)');
} catch (error) {
  console.error(`✗ admin@stockroom.local: ${error.message}`);
}

const { error } = await supabaseAdmin.auth.admin.createUser({
  email: 'worker@stockroom.local',
  password: 'stockroom2025',
  email_confirm: true,
  user_metadata: { name: 'Сотрудник склада', role: 'Оператор', company_id: companyId, company_name: companyName }
});
if (error) console.error(`✗ worker@stockroom.local: ${error.message}`);
else console.log('✓ worker@stockroom.local создан (Оператор)');
