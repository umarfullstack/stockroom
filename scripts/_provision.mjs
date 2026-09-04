import { supabaseAdmin } from '../api/_supabase.js';

export async function createCompany({ id, name, adminName, adminEmail, adminPassword }) {
  const { error: companyError } = await supabaseAdmin.from('companies').upsert({ id, name });
  if (companyError) throw new Error(`companies: ${companyError.message}`);

  const { error: stateError } = await supabaseAdmin.from('stockroom_state').upsert({ company_id: id, data: { products: [], movements: [] } });
  if (stateError) throw new Error(`stockroom_state: ${stateError.message}`);

  const { error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { name: adminName, role: 'Администратор', company_id: id, company_name: name }
  });
  if (userError) throw new Error(`auth user: ${userError.message}`);
}
