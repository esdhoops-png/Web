// Envía una notificación push (Web Push / VAPID) a todos los dispositivos del destinatario.
// La llama la base de datos (trigger notifications_push → pg_net) con la cabecera x-push-secret.
import { createClient } from 'npm:@supabase/supabase-js@2.81.1';
import webpush from 'npm:web-push@3.6.7';

const PUSH_SECRET = Deno.env.get('PUSH_SECRET') ?? '';
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!PUSH_SECRET || req.headers.get('x-push-secret') !== PUSH_SECRET) return new Response('Forbidden', { status: 403 });
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return Response.json({ error: 'VAPID no configurado' }, { status: 500 });
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  const { notification_id } = await req.json().catch(() => ({}));
  if (!notification_id) return Response.json({ error: 'notification_id requerido' }, { status: 400 });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  const { data: n, error } = await admin.from('notifications').select('*').eq('id', notification_id).single();
  if (error || !n) return Response.json({ error: 'no encontrada' }, { status: 404 });
  const { data: prefs } = await admin.from('notification_prefs').select('push_enabled').eq('user_id', n.user_id).maybeSingle();
  if (prefs && prefs.push_enabled === false) return Response.json({ sent: 0, skipped: 'push desactivado' });
  const { data: subs } = await admin.from('push_subscriptions').select('*').eq('user_id', n.user_id);

  const payload = JSON.stringify({ id: n.id, title: n.title, body: n.body ?? '', link: n.link ?? '#/notificaciones' });
  let sent = 0;
  const gone: string[] = [];
  await Promise.all((subs ?? []).map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 24 });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) gone.push(s.id); // suscripción caducada
      else console.error('push error', code, (e as Error).message);
    }
  }));
  if (gone.length) await admin.from('push_subscriptions').delete().in('id', gone);
  return Response.json({ sent, removed: gone.length });
});
