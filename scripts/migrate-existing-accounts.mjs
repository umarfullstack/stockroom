import 'dotenv/config';
import { supabaseAdmin } from '../api/_supabase.js';

const companyId = 'demo';
const companyName = 'Demo компания';

const { error: companyError } = await supabaseAdmin.from('companies').upsert({ id: companyId, name: companyName });
if (companyError) { console.error(`✗ companies: ${companyError.message}`); process.exit(1); }
console.log(`✓ компания "${companyName}" (${companyId}) готова`);

const { error: stateError } = await supabaseAdmin.from('stockroom_state').update({ company_id: companyId }).eq('company_id', 'main');
if (stateError) console.error(`✗ stockroom_state: ${stateError.message}`);
else console.log('✓ stockroom_state перенесён на компанию demo');

const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
if (listError) { console.error(`✗ listUsers: ${listError.message}`); process.exit(1); }

for (const user of data.users) {
  if (user.user_metadata?.company_id) { console.log(`· ${user.email} уже привязан к ${user.user_metadata.company_id}`); continue; }
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, company_id: companyId, company_name: companyName }
  });
  if (error) console.error(`✗ ${user.email}: ${error.message}`);
  else console.log(`✓ ${user.email} привязан к компании ${companyId}`);
}
