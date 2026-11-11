// Pruebas reales contra Supabase (local o remoto): dos usuarios, permisos,
// flujo de aprobación, notificaciones, chat y actividad.
// Uso: SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_KEY=... node api.test.mjs
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_KEY;
const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

let passed = 0;
async function step(name, fn) {
  try { await fn(); passed++; console.log('  ✓', name); }
  catch (e) { console.error('  ✗', name, '\n   ', e.message); process.exitCode = 1; throw e; }
}

async function ensureUser(email, password, full_name, role) {
  const { data: list } = await admin.auth.admin.listUsers();
  let u = list.users.find(x => x.email === email);
  if (!u) {
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name, role } });
    if (error) throw error;
    u = data.user;
  }
  const c = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { id: u.id, c };
}

const mk = await ensureUser('marketing@test.local', 'Prueba-1234', 'Responsable Marketing', 'marketing');
const ow = await ensureUser('propietario@test.local', 'Prueba-1234', 'Propietario', 'owner');

console.log('Backend 5 Mentarios Social Hub');

await step('perfiles creados con roles correctos', async () => {
  const { data } = await mk.c.from('profiles').select('*').order('created_at');
  const m = data.find(p => p.id === mk.id), o = data.find(p => p.id === ow.id);
  assert.equal(m.role, 'marketing'); assert.equal(m.can_approve, false);
  assert.equal(o.role, 'owner'); assert.equal(o.can_approve, true);
});

await step('un anónimo no ve nada', async () => {
  const anon = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data } = await anon.from('posts').select('id');
  assert.equal((data || []).length, 0);
});

await step('marketing no puede darse permisos de aprobación', async () => {
  const { error } = await mk.c.from('profiles').update({ can_approve: true }).eq('id', mk.id);
  assert.ok(error, 'debería fallar');
});

let post;
await step('marketing crea publicación y el propietario la ve', async () => {
  const { data, error } = await mk.c.from('posts').insert({
    kind: 'weekly_poster', title: 'Cartel semanal prueba', starts_at: '2026-11-19T18:00:00Z',
    platforms: ['instagram'], format: 'Post 4:5', copy: 'Este finde...', status: 'in_design', assignee_id: mk.id
  }).select().single();
  assert.ifError(error); post = data;
  const { data: seen } = await ow.c.from('posts').select('id,title').eq('id', post.id).single();
  assert.equal(seen.title, 'Cartel semanal prueba');
});

await step('no se puede programar sin aprobación', async () => {
  const { error } = await mk.c.from('posts').update({ status: 'scheduled' }).eq('id', post.id);
  assert.match(error?.message || '', /aprobación/);
});

await step('marketing no puede aprobar poniendo el estado a mano', async () => {
  const { error } = await mk.c.from('posts').update({ status: 'approved' }).eq('id', post.id);
  assert.ok(error);
});

await step('marketing no puede usar decide_approval', async () => {
  const { error } = await mk.c.rpc('decide_approval', { p_post: post.id, p_decision: 'approved' });
  assert.match(error?.message || '', /permiso/);
});

let v1;
await step('subir versión 1 con diseño (referencia Drive) notifica al propietario', async () => {
  const { data, error } = await mk.c.from('post_versions').insert({ post_id: post.id, note: 'Primera versión' }).select().single();
  assert.ifError(error); v1 = data; assert.equal(v1.version_no, 1);
  const { error: e2 } = await mk.c.from('attachments').insert({
    post_id: post.id, version_id: v1.id, role: 'design', source: 'drive',
    drive_file_id: '1eT6Eu3OqCR2knBRFykqtS7xy4hiE33r7', name: 'champions-01-portada-jugadores.png', mime_type: 'image/png' });
  assert.ifError(e2);
  const { data: n } = await ow.c.from('notifications').select('*').eq('type', 'design_uploaded').eq('link', '#/publicaciones/' + post.id);
  assert.equal(n.length, 1);
});

await step('solicitar aprobación avisa al propietario y registra la solicitud', async () => {
  const { error } = await mk.c.from('posts').update({ status: 'pending_approval' }).eq('id', post.id);
  assert.ifError(error);
  const { data: n } = await ow.c.from('notifications').select('*').eq('type', 'approval_requested').eq('link', '#/publicaciones/' + post.id);
  assert.equal(n.length, 1);
  const { data: a } = await ow.c.from('approvals').select('*').eq('post_id', post.id);
  assert.equal(a.at(-1).decision, 'requested'); assert.equal(a.at(-1).version_id, v1.id);
});

await step('propietario pide cambios con comentario obligatorio', async () => {
  const bad = await ow.c.rpc('decide_approval', { p_post: post.id, p_decision: 'changes_requested', p_comment: '' });
  assert.ok(bad.error);
  const { error } = await ow.c.rpc('decide_approval', { p_post: post.id, p_decision: 'changes_requested', p_comment: 'Me gusta, pero cambiaría el horario' });
  assert.ifError(error);
  const { data: p } = await mk.c.from('posts').select('status').eq('id', post.id).single();
  assert.equal(p.status, 'in_design');
  const { data: n } = await mk.c.from('notifications').select('*').eq('type', 'changes_requested');
  assert.ok(n.some(x => x.body.includes('horario')));
});

await step('comentarios en la publicación (ida y vuelta) notifican', async () => {
  assert.ifError((await ow.c.from('comments').insert({ post_id: post.id, body: '¿Puedes poner 22:30?', created_by: ow.id })).error);
  assert.ifError((await mk.c.from('comments').insert({ post_id: post.id, body: 'Hecho, subo v2', created_by: mk.id })).error);
  const { data } = await mk.c.from('comments').select('*').eq('post_id', post.id);
  assert.equal(data.length, 2);
  const { data: n } = await ow.c.from('notifications').select('*').eq('type', 'comment');
  assert.ok(n.length >= 1);
});

await step('versión 2 + aprobación por el propietario → aprobado con autor y fecha', async () => {
  const { data: v2 } = await mk.c.from('post_versions').insert({ post_id: post.id, note: 'Horario corregido' }).select().single();
  assert.equal(v2.version_no, 2);
  await mk.c.from('posts').update({ status: 'pending_approval' }).eq('id', post.id);
  const { error } = await ow.c.rpc('decide_approval', { p_post: post.id, p_decision: 'approved', p_comment: 'Perfecto' });
  assert.ifError(error);
  const { data: p } = await mk.c.from('posts').select('*').eq('id', post.id).single();
  assert.equal(p.status, 'approved'); assert.equal(p.approved_by, ow.id); assert.ok(p.approved_at);
  const { data: vs } = await mk.c.from('post_versions').select('*').eq('post_id', post.id);
  assert.equal(vs.length, 2, 'las versiones anteriores se conservan');
});

await step('aprobado → programado → publicado (con autor)', async () => {
  assert.ifError((await mk.c.from('posts').update({ status: 'scheduled' }).eq('id', post.id)).error);
  assert.ifError((await mk.c.from('posts').update({ status: 'published', published_url: 'https://instagram.com/p/x' }).eq('id', post.id)).error);
  const { data: p } = await mk.c.from('posts').select('*').eq('id', post.id).single();
  assert.equal(p.published_by, mk.id); assert.ok(p.published_at);
});

await step('mover fecha deja historial y avisa', async () => {
  await mk.c.from('posts').update({ starts_at: '2026-11-20T19:00:00Z' }).eq('id', post.id);
  const { data: h } = await ow.c.from('post_history').select('*').eq('post_id', post.id).eq('field', 'starts_at');
  assert.ok(h.length >= 1);
  const { data: n } = await ow.c.from('notifications').select('*').eq('type', 'date_changed');
  assert.ok(n.length >= 1);
});

await step('el propietario añade un evento → aviso a marketing', async () => {
  const { error } = await ow.c.from('posts').insert({ kind: 'event', title: 'Cena de empresa (prueba)',
    starts_at: '2026-12-12T20:00:00Z', requires_approval: false, status: 'scheduled' });
  assert.ifError(error);
  const { data: n } = await mk.c.from('notifications').select('*').eq('type', 'event_created');
  assert.ok(n.length >= 1);
});

await step('tareas vinculadas a la publicación y asignación', async () => {
  const rows = ['Diseño', 'Copy', 'Aprobación'].map(t => ({ title: `${t} · Cartel semanal prueba`, post_id: post.id, assignee_id: mk.id, priority: 'high', due_date: '2026-11-18' }));
  const { error } = await ow.c.from('tasks').insert(rows);
  assert.ifError(error);
  const { data: n } = await mk.c.from('notifications').select('*').eq('type', 'task_assigned');
  assert.ok(n.length >= 3);
  const { data: t } = await mk.c.from('tasks').select('*').eq('post_id', post.id);
  await mk.c.from('tasks').update({ status: 'done' }).eq('id', t[0].id);
  const { data: done } = await mk.c.from('tasks').select('completed_at').eq('id', t[0].id).single();
  assert.ok(done.completed_at);
});

await step('chat: mensaje, notificación y marca de leído', async () => {
  const { data: m, error } = await mk.c.from('chat_messages').insert({ body: 'Hola, ¿revisas el cartel?', created_by: mk.id }).select().single();
  assert.ifError(error);
  const { data: n } = await ow.c.from('notifications').select('*').eq('type', 'message');
  assert.ok(n.length >= 1);
  assert.ifError((await ow.c.from('chat_reads').upsert({ user_id: ow.id, channel: 'general', last_read_at: new Date().toISOString() })).error);
  const { data: r } = await mk.c.from('chat_reads').select('*').eq('user_id', ow.id).single();
  assert.ok(new Date(r.last_read_at) >= new Date(m.created_at));
});

await step('preferencias: si se desactiva "message" no llega', async () => {
  await ow.c.from('notification_prefs').update({ prefs: { message: false } }).eq('user_id', ow.id);
  const before = (await ow.c.from('notifications').select('id').eq('type', 'message')).data.length;
  await mk.c.from('chat_messages').insert({ body: 'Esto no debería notificar', created_by: mk.id });
  const after = (await ow.c.from('notifications').select('id').eq('type', 'message')).data.length;
  assert.equal(after, before);
  await ow.c.from('notification_prefs').update({ prefs: {} }).eq('user_id', ow.id);
});

await step('cada usuario solo ve sus notificaciones', async () => {
  const { data } = await mk.c.from('notifications').select('user_id');
  assert.ok(data.every(x => x.user_id === mk.id));
});

await step('biblioteca: añadir referencia de Drive avisa y registra actividad', async () => {
  const { data: cat } = await mk.c.from('library_categories').select('id').eq('slug', 'fotografias').single();
  const { error } = await mk.c.from('library_items').upsert({ category_id: cat.id, source: 'drive',
    drive_file_id: '1N-Ttg-TI8hbzJwSea_SrCjIjXS7YgXoC', name: 'DSC01927.JPG', mime_type: 'image/jpeg' },
    { onConflict: 'drive_file_id,category_id', ignoreDuplicates: true });
  assert.ifError(error);
  const { data: a } = await ow.c.from('activity_log').select('*').eq('entity_type', 'library_item');
  assert.ok(a.length >= 1);
});

await step('duplicar publicación (+7 días, como borrador)', async () => {
  const { data, error } = await mk.c.rpc('duplicate_post', { p_post: post.id });
  assert.ifError(error);
  assert.equal(data.is_draft, true); assert.equal(data.status, 'idea');
  assert.equal(new Date(data.starts_at) - new Date('2026-11-20T19:00:00Z'), 7 * 864e5);
});

await step('recordatorios de fecha límite (cron) generan avisos', async () => {
  const { data: t } = await mk.c.from('tasks').insert({ title: 'Tarea que vence hoy', assignee_id: mk.id,
    due_date: new Date().toISOString().slice(0, 10) }).select().single();
  const { data: n0 } = await mk.c.from('notifications').select('id').eq('type', 'deadline');
  const { error } = await admin.rpc('run_deadline_reminders_for_tests');
  if (error && !/function/.test(error.message)) throw error;
  if (error) { console.log('    (función de prueba no instalada; se omite)'); return; }
  const { data: n1 } = await mk.c.from('notifications').select('id').eq('type', 'deadline');
  assert.ok(n1.length > n0.length, 'debería haber nuevo aviso de vencimiento ' + t.id);
});

await step('actividad reciente visible para ambos', async () => {
  const { data } = await ow.c.from('activity_log').select('summary').order('created_at', { ascending: false }).limit(50);
  assert.ok(data.some(a => /aprobado/.test(a.summary)));
  assert.ok(data.some(a => /completado la tarea/.test(a.summary)));
});

await step('limpieza de datos de prueba', async () => {
  await admin.from('posts').delete().in('title', ['Cartel semanal prueba', 'Cartel semanal prueba (copia)', 'Cena de empresa (prueba)']);
  await admin.from('tasks').delete().like('title', '%prueba%');
  await admin.from('tasks').delete().eq('title', 'Tarea que vence hoy');
  await admin.from('chat_messages').delete().in('body', ['Hola, ¿revisas el cartel?', 'Esto no debería notificar']);
});

console.log(`\n${passed} comprobaciones superadas`);
