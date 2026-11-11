// Notificaciones push del navegador (Web Push estándar con claves VAPID).
import { sb, config, check, setState, getState } from './store.js';

export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
export const pushConfigured = () => !!config.vapidPublicKey;

function b64ToUint8(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  try { return await navigator.serviceWorker.register('sw.js'); } catch (e) { console.warn('SW', e); return null; }
}

export async function currentSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function refreshPushState() {
  const sub = await currentSubscription().catch(() => null);
  setState({ pushActive: !!sub && Notification.permission === 'granted', notifPermission: 'Notification' in window ? Notification.permission : 'unsupported' });
}

export async function enablePush() {
  if (!('Notification' in window)) throw new Error('Este navegador no admite notificaciones. En iPhone, instala primero la app en la pantalla de inicio.');
  const perm = await Notification.requestPermission();
  setState({ notifPermission: perm });
  if (perm !== 'granted') throw new Error('Has bloqueado las notificaciones. Actívalas en los ajustes del navegador para este sitio.');
  if (!pushSupported() || !pushConfigured()) { await refreshPushState(); return 'browser-only'; }
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(config.vapidPublicKey) });
  const j = sub.toJSON();
  check(await sb.from('push_subscriptions').upsert({
    user_id: getState().me.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, user_agent: navigator.userAgent.slice(0, 200)
  }, { onConflict: 'endpoint' }));
  await refreshPushState();
  return 'push';
}

export async function disablePush() {
  const sub = await currentSubscription();
  if (sub) {
    await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
  }
  await refreshPushState();
}
