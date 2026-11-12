// Importador del calendario editorial (compartido por Configuración y el Plan de marketing).
// - No duplica: ignora lo que ya existe por clave de importación y lo que ya existe a mano el mismo día con un título equivalente.
// - Sustituye el plan v1 solo en lo que nadie ha tocado.
// - No importa elementos con fecha anterior a hoy.
import { sb, check, getState, reloadAll } from '../lib/store.js';

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ');
const STOP = new Set(['story', 'stories', 'post', 'reel', 'carrusel', 'cartel', 'este', 'esta', 'para', 'con', 'del', 'los', 'las', 'una', 'semana', 'hoy', '5mentarios']);
const tokens = (s) => new Set(norm(s).split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)));
const dayOf = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : null);
function similar(a, b) {
  const A = tokens(a), B = tokens(b); if (!A.size || !B.size) return false;
  let n = 0; for (const t of A) if (B.has(t)) n++;
  return n >= 2 || n / Math.min(A.size, B.size) >= 0.6;
}

export async function importEditorialPlan({ plan, extra = [], onLog = () => {} }) {
  const st = getState();
  const report = { inserted: 0, already: 0, duplicates: [], past: 0, replaced: 0, kept: 0, tasks: 0, library: 0, keyToId: {} };
  // 1) plan v1: sustituir lo que nadie ha tocado
  const old = check(await sb.from('posts').select('id, created_at, updated_at, import_key').like('import_key', plan.OLD_PREFIX + '%'));
  if (old.length) {
    const ids = old.map((p) => p.id);
    const [vers, coms] = await Promise.all([sb.from('post_versions').select('post_id').in('post_id', ids), sb.from('comments').select('post_id').in('post_id', ids)]);
    const touched = new Set([...check(vers), ...check(coms)].map((r) => r.post_id));
    const untouched = old.filter((p) => !touched.has(p.id) && Math.abs(new Date(p.updated_at) - new Date(p.created_at)) < 2000);
    report.kept = old.length - untouched.length;
    if (untouched.length) {
      const uids = untouched.map((p) => p.id);
      check(await sb.from('tasks').delete().in('post_id', uids).eq('status', 'pending'));
      check(await sb.from('posts').delete().in('id', uids));
      report.replaced = untouched.length;
    }
    const oldTasks = check(await sb.from('tasks').select('id, created_at, updated_at, title').in('title', plan.OLD_TASK_TITLES).eq('status', 'pending'))
      .filter((t) => Math.abs(new Date(t.updated_at) - new Date(t.created_at)) < 2000);
    if (oldTasks.length) check(await sb.from('tasks').delete().in('id', oldTasks.map((t) => t.id)));
    onLog(`Plan anterior: ${report.replaced} sustituidos, ${report.kept} conservados (ya editados).`);
  }
  // 2) estado real de la base de datos
  const existing = check(await sb.from('posts').select('id, title, starts_at, import_key'));
  const byKey = Object.fromEntries(existing.filter((p) => p.import_key).map((p) => [p.import_key, p.id]));
  const manual = existing.filter((p) => !p.import_key || !p.import_key.startsWith('p'));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const all = [...plan.PLAN, ...extra];
  const mk = st.profiles.find((p) => p.role === 'marketing') || st.me;
  const owner = st.profiles.find((p) => p.role === 'owner') || st.me;
  const who = (r) => (r === 'owner' ? owner.id : mk.id);
  const toInsert = [];
  for (const p of all) {
    if (byKey[p.key]) { report.already++; report.keyToId[p.key] = byKey[p.key]; continue; }
    if (new Date(p.starts_at) < today) { report.past++; continue; }
    const dup = manual.find((m) => dayOf(m.starts_at) === dayOf(p.starts_at) && similar(m.title, p.title));
    if (dup) { report.duplicates.push({ plan: p.title, existing: dup.title }); report.keyToId[p.key] = dup.id; continue; }
    toInsert.push({ import_key: p.key, kind: p.kind, title: p.title, description: p.description || null, starts_at: p.starts_at, all_day: !!p.all_day, deadline: p.deadline || null,
      platforms: p.platforms || ['instagram'], format: p.format || null, objective: p.objective || null, copy: p.copy || null, hashtags: p.hashtags || null, cta: p.cta || null,
      material: p.material || null, status: p.status || 'idea', requires_approval: p.requires_approval ?? true, assignee_id: who(p.assignee || 'marketing'), pending_info: p.pending_info || null });
  }
  for (let i = 0; i < toInsert.length; i += 50) {
    const r = check(await sb.from('posts').upsert(toInsert.slice(i, i + 50), { onConflict: 'import_key', ignoreDuplicates: true }).select('id,import_key'));
    r.forEach((x) => { report.keyToId[x.import_key] = x.id; }); report.inserted += r.length;
  }
  const newKeys = new Set(toInsert.map((r) => r.import_key));
  // 2b) información nueva confirmada: actualizar publicaciones ya importadas que nadie ha tocado
  report.synced = 0;
  const syncKeys = (plan.SYNC_KEYS || []).filter((k) => byKey[k]);
  if (syncKeys.length) {
    const rows = check(await sb.from('posts').select('id, import_key, status, created_at, updated_at').in('import_key', syncKeys));
    const ids = rows.map((r) => r.id);
    const [vers, coms] = await Promise.all([sb.from('post_versions').select('post_id').in('post_id', ids), sb.from('comments').select('post_id').in('post_id', ids)]);
    const touched = new Set([...check(vers), ...check(coms)].map((r) => r.post_id));
    for (const r of rows) {
      if (touched.has(r.id) || !['idea', 'pending_prep', 'in_design'].includes(r.status)) continue;
      const p = all.find((x) => x.key === r.import_key); if (!p) continue;
      check(await sb.from('posts').update({ title: p.title, copy: p.copy || null, description: p.description || null, cta: p.cta || null, pending_info: p.pending_info || null }).eq('id', r.id));
      report.synced++;
    }
    onLog(`Actualizadas con la programación confirmada: ${report.synced}.`);
  }
  if (plan.OBSOLETE_TASKS?.length) {
    const obs = check(await sb.from('tasks').select('id, created_at, updated_at').in('title', plan.OBSOLETE_TASKS).eq('status', 'pending'))
      .filter((t) => Math.abs(new Date(t.updated_at) - new Date(t.created_at)) < 2000);
    if (obs.length) { check(await sb.from('tasks').delete().in('id', obs.map((t) => t.id))); onLog(`Tareas de confirmación ya resueltas eliminadas: ${obs.length}.`); }
  }
  onLog(`Calendario: ${report.inserted} publicaciones nuevas, ${report.already} ya estaban, ${report.duplicates.length} coincidían con publicaciones creadas a mano, ${report.past} con fecha pasada no importadas.`);
  // 3) adjuntos de Drive y tareas de lo que se ha creado ahora
  const atts = all.flatMap((p) => (newKeys.has(p.key) && report.keyToId[p.key] ? (p.attachments || []).map((a) => ({ post_id: report.keyToId[p.key], role: a.role || (/^video/.test(a.mime_type) ? 'video' : /^image/.test(a.mime_type) ? 'photo' : 'file'),
    source: 'drive', drive_file_id: a.id, name: a.name, mime_type: a.mime_type, web_url: `https://drive.google.com/file/d/${a.id}/view` })) : []));
  for (let i = 0; i < atts.length; i += 100) check(await sb.from('attachments').insert(atts.slice(i, i + 100)));
  const existingTasks = new Set(check(await sb.from('tasks').select('title')).map((t) => t.title));
  const tasks = plan.TASKS.filter((t) => !existingTasks.has(t.title) && (!t.post || newKeys.has(t.post)) && (!t.due_date || new Date(t.due_date) >= today))
    .map((t) => ({ title: t.title, description: t.description || null, priority: t.priority || 'medium', due_date: t.due_date || null, assignee_id: who(t.assignee || 'marketing'), post_id: t.post ? report.keyToId[t.post] || null : null }));
  if (tasks.length) check(await sb.from('tasks').insert(tasks));
  report.tasks = tasks.length;
  // 4) biblioteca (referencias a Drive)
  const cats = Object.fromEntries(st.categories.map((c) => [c.slug, c.id]));
  const lib = plan.LIBRARY.filter((l) => cats[l.category]).map((l) => ({ category_id: cats[l.category], source: 'drive', drive_file_id: l.id, name: l.name, mime_type: l.mime_type, web_url: `https://drive.google.com/file/d/${l.id}/view`, notes: l.notes || null }));
  if (lib.length) { const r = check(await sb.from('library_items').upsert(lib, { onConflict: 'drive_file_id,category_id', ignoreDuplicates: true }).select('id')); report.library = r.length; }
  onLog(`Tareas nuevas: ${report.tasks}. Referencias de Drive nuevas en la biblioteca: ${report.library}.`);
  await reloadAll();
  return report;
}
