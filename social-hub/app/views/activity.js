// Historial de actividad de toda la app.
import { html, useState, useEffect, Avatar, fmt, dayKey, todayKey, parseDay, toastError } from '../lib/ui.js';
import { useStore, sb, check, go, profileById, onRealtime } from '../lib/store.js';

const TYPES = [['', 'Todo'], ['post', 'Publicaciones'], ['task', 'Tareas'], ['library_item', 'Biblioteca']];
const PAGE = 80;

export function ActivityView() {
  const st = useStore();
  const [rows, setRows] = useState(null);
  const [more, setMore] = useState(false);
  const [f, setF] = useState({ actor: '', type: '' });
  async function load(before) {
    let q = sb.from('activity_log').select('*').order('created_at', { ascending: false }).limit(PAGE);
    if (f.actor) q = q.eq('actor_id', f.actor);
    if (f.type) q = q.eq('entity_type', f.type);
    if (before) q = q.lt('created_at', before);
    const r = check(await q);
    setMore(r.length === PAGE);
    setRows((cur) => (before ? [...cur, ...r] : r));
  }
  useEffect(() => { load().catch(toastError); return onRealtime((t) => { if (t === 'activity_log') load().catch(() => {}); }); }, [f.actor, f.type]);
  const link = (a) => (a.entity_type === 'post' ? '#/publicaciones/' + a.entity_id : a.entity_type === 'task' ? '#/tareas/' + a.entity_id : a.entity_type === 'library_item' ? '#/biblioteca' : null);
  let last = null;
  return html`
    <div class="page-head"><div><h1>Actividad</h1><p>Todo lo que pasa en el Social Hub queda registrado.</p></div></div>
    <div class="toolbar">
      <select class="input" value=${f.actor} onChange=${(e) => setF({ ...f, actor: e.target.value })}><option value="">Todas las personas</option>${st.profiles.map((p) => html`<option value=${p.id}>${p.full_name}</option>`)}</select>
      <div class="seg">${TYPES.map(([k, l]) => html`<button class=${f.type === k ? 'on' : ''} onClick=${() => setF({ ...f, type: k })}>${l}</button>`)}</div>
    </div>
    <div class="card">${rows === null ? html`<p class="empty">Cargando…</p>` : !rows.length ? html`<p class="empty big">Sin actividad.</p>` : rows.map((a) => {
      const k = dayKey(a.created_at); const head = k !== last ? html`<h2 style="margin:${last ? '18px' : '0'} 0 6px">${k === todayKey() ? 'Hoy' : fmt.dateLong(parseDay(k))}</h2>` : null; last = k;
      const l = link(a);
      return html`${head}<div class="act" key=${a.id} style=${l ? 'cursor:pointer' : ''} onClick=${() => l && go(l)}><${Avatar} p=${profileById(a.actor_id)} size="sm" />
        <span class="small">${a.summary}</span><time>${fmt.time(a.created_at)}</time></div>`; })}
      ${more ? html`<button class="btn sm" style="margin-top:12px" onClick=${() => load(rows[rows.length - 1].created_at).catch(toastError)}>Cargar más</button>` : null}</div>`;
}
