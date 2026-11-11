// Invita a una nueva persona al Social Hub (solo administradores).
import { createClient } from 'npm:@supabase/supabase-js@2.81.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const url = Deno.env.get('SUPABASE_URL')!;
  const auth = req.headers.get('Authorization') ?? '';
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: u } = await asUser.auth.getUser();
  if (!u?.user) return json({ error: 'No autenticado' }, 401);
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: me } = await admin.from('profiles').select('is_admin, active').eq('id', u.user.id).single();
  if (!me?.is_admin || !me.active) return json({ error: 'Solo un administrador puede invitar.' }, 403);

  const { email, full_name, role, redirect_to } = await req.json().catch(() => ({}));
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Email no válido' }, 400);
  if (!['marketing', 'owner', 'collaborator'].includes(role)) return json({ error: 'Rol no válido' }, 400);
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name, role }, redirectTo: redirect_to });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true, user_id: data.user?.id });
});
