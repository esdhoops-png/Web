// Estado compartido + conexión con Supabase (datos reales, sincronizados en tiempo real).
import { useState, useEffect } from 'preact/hooks';
import { toast } from './ui.js';

const cfg = window.HUB_CONFIG || {};
export const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && !/TU-PROYECTO|TU-ANON/.test(cfg.supabaseUrl + cfg.supabaseAnonKey));
export const sb = configured
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'social-hub-auth' } })
  : null;
export const config = cfg;

// ---------- store mínimo ----------
const state = {
  session: null, me: null, ready: false, online: navigator.onLine,
  profiles: [], posts: [], tasks: [], categories: [], libraryItems: [], notifications: [],
  chatUnread: 0, chatReads: [], settings: {}, prefs: null, lastMessages: [], recentActivity: [], recentFiles: []
};
const subs = new Set();
let version = 0;
export function getState() { return state; }
export function setState(patch) { Object.assign(state, typeof patch === 'function' ? patch(state) : patch); version++; subs.forEach((f) => f(version)); }
export function useStore() {
  const [, set] = useState(0);
  useEffect(() => { subs.add(set); return () => subs.delete(set); }, []);
  return state;
}
export const profileById = (id) => state.profiles.find((p) => p.id === id);

// ---------- router (hash) ----------
export function useRoute() {
  const [hash, setHash] = useState(location.hash || '#/inicio');
  useEffect(() => { const f = () => setHash(location.hash || '#/inicio'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  const [path, query = ''] = hash.slice(1).split('?');
  const parts = path.split('/').filter(Boolean);
  return { parts, query: new URLSearchParams(query), hash };
}
export const go = (h) => { if (location.hash !== h) location.hash = h; };

// ---------- errores ----------
export function check({ data, error }) {
  if (error) throw new Error(friendly(error));
  return data;
}
function friendly(e) {
  const m = e.message || String(e);
  if (/JWT|token is expired/i.test(m)) return 'Tu sesión ha caducado. Vuelve a entrar.';
  if (/row-level security|permission denied/i.test(m)) return 'No tienes permiso para hacer esto.';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Sin conexión con el servidor. Revisa tu internet.';
  return m;
}

// ---------- carga de datos ----------
export async function loadProfiles() { setState({ profiles: check(await sb.from('profiles').select('*').order('created_at')) }); }
export async function loadPosts() {
  setState({ posts: check(await sb.from('posts').select('*, attachments(id,role,source,drive_file_id,storage_path,name,mime_type,web_url,thumbnail_url,version_id)').order('starts_at', { ascending: true, nullsFirst: false })) });
}
export async function loadTasks() { setState({ tasks: check(await sb.from('tasks').select('*').order('position')) }); }
export async function loadCategories() { setState({ categories: check(await sb.from('library_categories').select('*').order('sort').order('name')) }); }
export async function loadLibrary() { setState({ libraryItems: check(await sb.from('library_items').select('*').order('created_at', { ascending: false })) }); }
export async function loadNotifications() {
  setState({ notifications: check(await sb.from('notifications').select('*').eq('user_id', state.me.id).order('created_at', { ascending: false }).limit(200)) });
}
export async function loadSettings() {
  const rows = check(await sb.from('app_settings').select('*'));
  setState({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
}
export async function loadPrefs() {
  let p = check(await sb.from('notification_prefs').select('*').eq('user_id', state.me.id).maybeSingle());
  if (!p) p = check(await sb.from('notification_prefs').insert({ user_id: state.me.id }).select().single());
  setState({ prefs: p });
}
export async function loadChatMeta() {
  const reads = check(await sb.from('chat_reads').select('*').eq('channel', 'general'));
  const mine = reads.find((r) => r.user_id === state.me.id);
  let q = sb.from('chat_messages').select('id', { count: 'exact', head: true }).eq('channel', 'general').neq('created_by', state.me.id);
  if (mine) q = q.gt('created_at', mine.last_read_at);
  const { count } = await q;
  const last = check(await sb.from('chat_messages').select('*').eq('channel', 'general').is('deleted_at', null).order('created_at', { ascending: false }).limit(4));
  setState({ chatReads: reads, chatUnread: count || 0, lastMessages: last });
}
export async function loadDashboardExtras() {
  const [act, files] = await Promise.all([
    sb.from('activity_log').select('*').order('created_at', { ascending: false }).limit(12),
    sb.from('attachments').select('*').order('created_at', { ascending: false }).limit(8)
  ]);
  setState({ recentActivity: check(act), recentFiles: check(files) });
}

const loaders = {
  profiles: loadProfiles, posts: loadPosts, post_versions: loadPosts, attachments: () => Promise.all([loadPosts(), loadDashboardExtras()]),
  approvals: loadPosts, tasks: loadTasks, library_categories: loadCategories, library_items: loadLibrary,
  notifications: loadNotifications, chat_messages: loadChatMeta, chat_reads: loadChatMeta, activity_log: loadDashboardExtras
};
const timers = {};
function refresh(table) {
  clearTimeout(timers[table]);
  timers[table] = setTimeout(() => loaders[table] && loaders[table]().catch((e) => console.warn(table, e)), 250);
}

// Eventos realtime a los que se suscriben las vistas (chat, detalle de publicación…)
const rtListeners = new Set();
export function onRealtime(fn) { rtListeners.add(fn); return () => rtListeners.delete(fn); }

let channel = null;
function startRealtime() {
  const old = channel;
  const ch = sb.channel('hub-sync-' + Date.now());
  channel = ch;
  if (old) sb.removeChannel(old);
  const tables = ['profiles', 'posts', 'post_versions', 'approvals', 'tasks', 'comments', 'chat_messages', 'chat_reads', 'attachments', 'activity_log', 'library_items', 'library_categories'];
  for (const t of tables) {
    ch.on('postgres_changes', { event: '*', schema: 'public', table: t }, (payload) => {
      refresh(t);
      rtListeners.forEach((f) => f(t, payload));
    });
  }
  ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${state.me.id}` }, (payload) => {
    refresh('notifications');
    onIncomingNotification(payload.new);
  });
  ch.subscribe((status) => {
    if (ch !== channel) return; // canal antiguo que se está cerrando
    setState({ realtime: status });
    if (status === 'SUBSCRIBED') Object.keys(loaders).forEach(refresh); // al (re)conectar, ponerse al día
    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
      clearTimeout(timers.__rt);
      timers.__rt = setTimeout(() => { if (state.me && channel) startRealtime(); }, 4000);
    }
  });
}

function onIncomingNotification(n) {
  const onChat = location.hash.startsWith('#/chat');
  if (!(n.type === 'message' && onChat && document.visibilityState === 'visible')) {
    toast(n.title, n.body, { onClick: () => n.link && go(n.link) });
  }
  // Aviso del navegador si la pestaña está en segundo plano (y no hay push configurado que ya lo haga)
  if (document.visibilityState !== 'visible' && 'Notification' in window && Notification.permission === 'granted' && !state.pushActive) {
    navigator.serviceWorker?.ready.then((reg) => reg.showNotification(n.title, { body: n.body || '', icon: 'icons/icon-192.png', tag: n.id, data: { link: n.link } }))
      .catch(() => new Notification(n.title, { body: n.body || '' }));
  }
}

export async function bootstrap(session) {
  const me = check(await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle());
  if (!me || !me.active) { setState({ session, me: null, ready: true, noProfile: true }); return; }
  setState({ session, me });
  await Promise.all([loadProfiles(), loadPosts(), loadTasks(), loadCategories(), loadLibrary(), loadNotifications(), loadSettings(), loadPrefs(), loadChatMeta(), loadDashboardExtras()]);
  setState({ ready: true });
  startRealtime();
}
export async function reloadAll() {
  await Promise.all([loadPosts(), loadTasks(), loadCategories(), loadLibrary(), loadNotifications(), loadChatMeta(), loadDashboardExtras()]);
}

// Al volver a la app (móvil en segundo plano) se recarga todo por si se perdió algún evento
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.me) Object.keys(loaders).forEach(refresh);
});
addEventListener('online', () => { setState({ online: true }); if (state.me) Object.keys(loaders).forEach(refresh); });
addEventListener('offline', () => setState({ online: false }));

export async function signOut() {
  const ch = channel; channel = null;
  if (ch) sb.removeChannel(ch);
  await sb.auth.signOut();
  setState({ session: null, me: null, ready: true });
  location.hash = '#/inicio';
}

// ---------- acciones comunes ----------
export async function markNotificationsRead(ids) {
  if (!ids.length) return;
  check(await sb.from('notifications').update({ read_at: new Date().toISOString() }).in('id', ids));
  setState({ notifications: state.notifications.map((n) => (ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n)) });
}

// Subida de ficheros a Storage (bucket privado "hub")
export async function uploadFile(file, folder = 'uploads') {
  if (file.size > 50 * 1024 * 1024) throw new Error('El archivo supera 50 MB. Súbelo a Google Drive y adjúntalo desde allí.');
  const safe = file.name.normalize('NFD').replace(/[^\w.\-]+/g, '_');
  const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safe}`;
  check(await sb.storage.from('hub').upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false }));
  return { source: 'storage', storage_path: path, name: file.name, mime_type: file.type || null, size_bytes: file.size };
}
const signedCache = new Map();
export async function signedUrl(path) {
  const c = signedCache.get(path);
  if (c && c.exp > Date.now()) return c.url;
  const { data, error } = await sb.storage.from('hub').createSignedUrl(path, 3600);
  if (error) throw error;
  signedCache.set(path, { url: data.signedUrl, exp: Date.now() + 50 * 60 * 1000 });
  return data.signedUrl;
}
