import { createClient } from '@supabase/supabase-js';

const clientOptions = { auth: { autoRefreshToken: false, persistSession: false } };

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const publicKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

export const supabaseAdmin = createClient(url, secretKey, clientOptions);
export const supabaseAnon = createClient(url, publicKey, clientOptions);

export const ROLES = { ADMIN: 'Администратор', OPERATOR: 'Оператор' };

export function toAccount(user) {
  return { id: user.id, name: user.user_metadata?.name || user.email, email: user.email, role: user.user_metadata?.role || ROLES.OPERATOR };
}

export async function requireUser(request) {
  const header = request.headers?.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function requireAdmin(request) {
  const user = await requireUser(request);
  if (!user || user.user_metadata?.role !== ROLES.ADMIN) return null;
  return user;
}
