// Calendario editorial interactivo: mes, semana, día, listado y próximos eventos. Arrastrar para mover.
import { html, useState, Icon, StatusPill, fmt, dayKey, todayKey, parseDay, addDays, startOfWeek, statusColor, STATUS, KINDS, KIND_LABEL, KIND_ICON, PLATFORMS, toastError, toast } from '../lib/ui.js';
import { useStore, sb, check, go, profileById } from '../lib/store.js';
import { openPostForm } from './posts.js';
import { PostLine } from './dashboard.js';

const VIEWS = [['month', 'Mes'], ['week', 'Semana'], ['day', 'Día'], ['list', 'Listado'], ['events', 'Próximos eventos']];

async function moveTo(post, dayK, hour) {
  const old = post.starts_at ? new Date(post.starts_at) : null;
  const d = parseDay(dayK);
  if (hour != null) d.setHours(hour, old && hour === old.getHours() ? old.getMinutes() : 0);
  else if (old) d.setHours(old.getHours(), old.getMinutes());
  else d.setHours(12, 0);
  if (old && +old === +d) return;
  try {
    check(await sb.from('posts').update({ starts_at: d.toISOString() }).eq('id', post.id));
    toast('Fecha cambiada', `«${post.title}» → ${fmt.dateTime(d)}`);
  } catch (e) { toastError(e); }
}

function Ev({ p, big }) {
  return html`<div class=${'ev' + (big ? ' big' : '')} draggable="true" style=${{ '--c': statusColor(p.status) }} title=${`${p.title} · ${KIND_LABEL[p.kind]}`}
    onDragStart=${(e) => { e.dataTransfer.setData('text/plain', p.id); e.currentTarget.classList.add('dragging'); }}
    onDragEnd=${(e) => e.currentTarget.classList.remove('dragging')}
    onClick=${(e) => { e.stopPropagation(); go('#/publicaciones/' + p.id); }}>
    ${big ? html`<span class="row nowrap" style="gap:6px"><${Icon} name=${KIND_ICON[p.kind]} size=${13} /><span class="t">${p.all_day ? 'Todo el día' : fmt.time(p.starts_at)}</span></span>
      <span style="white-space:normal">${p.title}</span><${StatusPill} s=${p.status} />`
      : html`${!p.all_day ? html`<span class="t">${fmt.time(p.starts_at)}</span>` : null}<span class="n">${p.title}</span>`}
  </div>`;
}

function dropProps(onDrop, setOver, key) {
  return {
    onDragOver: (e) => { e.preventDefault(); setOver(key); },
    onDragLeave: () => setOver(null),
    onDrop: (e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/plain'); if (id) onDrop(id); }
  };
}

export function CalendarView({ query }) {
  const st = useStore();
  const [view, setView] = useState(query.get('v') || (innerWidth < 700 ? 'list' : 'month'));
  const [cursor, setCursor] = useState(query.get('d') ? parseDay(query.get('d')) : new Date());
  const [f, setF] = useState({ kind: '', status: '', assignee: '', platform: '' });
  const [over, setOver] = useState(null);
  const posts = st.posts.filter((p) => p.starts_at && (!f.kind || p.kind === f.kind) && (!f.status || p.status === f.status)
    && (!f.assignee || p.assignee_id === f.assignee) && (!f.platform || (p.platforms || []).includes(f.platform)));
  const byDay = {};
  posts.forEach((p) => { (byDay[dayKey(p.starts_at)] ||= []).push(p); });
  Object.values(byDay).forEach((l) => l.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)));
  const today = todayKey();
  const find = (id) => st.posts.find((p) => p.id === id);

  const step = (n) => {
    const d = new Date(cursor);
    if (view === 'month') d.setMonth(d.getMonth() + n, 1);
    else if (view === 'week') d.setDate(d.getDate() + 7 * n);
    else d.setDate(d.getDate() + n);
    setCursor(d);
  };
  let title = fmt.month(cursor);
  if (view === 'week') { const s = startOfWeek(cursor); title = `${fmt.date(s)} – ${fmt.date(addDays(s, 6))}`; }
  if (view === 'day') title = fmt.dateLong(cursor);

  let body;
  if (view === 'month') {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    const cells = [...Array(42)].map((_, i) => addDays(start, i));
    body = html`<div class="month">
      ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => html`<div class="dow">${d}</div>`)}
      ${cells.map((d) => { const k = dayKey(d); const items = byDay[k] || [];
        return html`<div key=${k} class=${'day-cell' + (d.getMonth() !== cursor.getMonth() ? ' other' : '') + (k === today ? ' today' : '') + (over === k ? ' drop' : '')}
            ...${dropProps((id) => moveTo(find(id), k), setOver, k)} onDblClick=${() => openPostForm({ starts_at: parseDay(k).setHours(20) && new Date(parseDay(k).setHours(20)).toISOString() })}>
          <div class="num"><span style="cursor:pointer" onClick=${() => { setCursor(d); setView('day'); }}>${d.getDate()}</span>
            <button title="Añadir" onClick=${() => openPostForm({ starts_at: new Date(parseDay(k).setHours(20)).toISOString() })}>+</button></div>
          <div class="evs stack" style="gap:3px">${items.slice(0, 4).map((p) => html`<${Ev} p=${p} key=${p.id} />`)}</div>
          ${items.length > 4 ? html`<span class="more" onClick=${() => { setCursor(d); setView('day'); }}>+${items.length - 4} más</span>` : null}
        </div>`; })}
    </div>`;
  } else if (view === 'week') {
    const s = startOfWeek(cursor);
    body = html`<div class="week">${[...Array(7)].map((_, i) => { const d = addDays(s, i); const k = dayKey(d); const items = byDay[k] || [];
      return html`<div key=${k} class=${'week-col' + (k === today ? ' today' : '') + (over === k ? ' drop' : '')} ...${dropProps((id) => moveTo(find(id), k), setOver, k)}>
        <h3><span>${fmt.wd(d)}</span><b>${d.getDate()}</b></h3>
        ${items.map((p) => html`<${Ev} p=${p} big key=${p.id} />`)}
        <button class="btn ghost sm" onClick=${() => openPostForm({ starts_at: new Date(parseDay(k).setHours(20)).toISOString() })}><${Icon} name="plus" size=${14} />Añadir</button>
      </div>`; })}</div>`;
  } else if (view === 'day') {
    const k = dayKey(cursor); const items = byDay[k] || [];
    const allDay = items.filter((p) => p.all_day);
    body = html`<div class="card">
      ${allDay.length ? html`<div class="row" style="margin-bottom:10px"><span class="muted small">Todo el día:</span>${allDay.map((p) => html`<${Ev} p=${p} key=${p.id} />`)}</div>` : null}
      <div class="timeline">${[...Array(18)].map((_, i) => { const hr = i + 8 > 23 ? i + 8 - 24 : i + 8; const slotKey = k + 'h' + hr;
        const inSlot = items.filter((p) => !p.all_day && new Date(p.starts_at).getHours() === hr);
        return html`<div class="h">${String(hr).padStart(2, '0')}:00</div>
          <div class=${'slot' + (over === slotKey ? ' drop' : '')} ...${dropProps((id) => moveTo(find(id), k, hr), setOver, slotKey)}
            onDblClick=${() => openPostForm({ starts_at: new Date(parseDay(k).setHours(hr)).toISOString() })}>${inSlot.map((p) => html`<${Ev} p=${p} big key=${p.id} />`)}</div>`; })}
        ${(() => { const early = items.filter((p) => !p.all_day && new Date(p.starts_at).getHours() < 8 && new Date(p.starts_at).getHours() > 1);
          return early.length ? html`<div class="h">Madrugada</div><div class="slot">${early.map((p) => html`<${Ev} p=${p} big key=${p.id} />`)}</div>` : null; })()}
      </div>
      <p class="muted xs">Arrastra un elemento a otra hora para cambiarla. Doble clic en una franja para crear.</p></div>`;
  } else if (view === 'list') {
    const from = addDays(new Date(), -7);
    const items = posts.filter((p) => new Date(p.starts_at) >= from);
    const groups = {};
    items.forEach((p) => { (groups[dayKey(p.starts_at)] ||= []).push(p); });
    body = Object.keys(groups).length ? html`<div class="stack">${Object.entries(groups).map(([k, l]) => html`<section class="card" key=${k}>
      <h2 style=${k === today ? 'color:var(--verde)' : ''}>${k === today ? 'Hoy · ' : ''}${fmt.dateLong(parseDay(k))}</h2>
      <div class="list">${l.map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}</div></section>`)}</div>` : html`<p class="empty big">No hay nada planificado.</p>`;
  } else {
    const items = posts.filter((p) => new Date(p.starts_at) >= addDays(new Date(), -1) && ['event', 'special_date', 'champions', 'sports', 'promo', 'meeting', 'reminder'].includes(p.kind));
    body = items.length ? html`<div class="card"><div class="list">${items.map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}</div></div>` : html`<p class="empty big">No hay eventos próximos.</p>`;
  }

  return html`
    <div class="page-head"><div><h1>Calendario</h1><p>Arrastra para cambiar fechas. Cualquiera puede añadir eventos.</p></div>
      <div class="actions"><button class="btn" onClick=${() => openPostForm({ kind: 'event', requires_approval: false })}><${Icon} name="music" />Evento</button>
        <button class="btn primary" onClick=${() => openPostForm({})}><${Icon} name="plus" />Publicación</button></div></div>
    <div class="cal-head">
      ${['month', 'week', 'day'].includes(view) ? html`<button class="btn icon" onClick=${() => step(-1)} aria-label="Anterior"><${Icon} name="chevL" /></button>
        <button class="btn sm" onClick=${() => setCursor(new Date())}>Hoy</button>
        <button class="btn icon" onClick=${() => step(1)} aria-label="Siguiente"><${Icon} name="chevR" /></button><h2>${title}</h2>` : html`<h2>${view === 'list' ? 'Listado' : 'Próximos eventos'}</h2>`}
      <div class="seg" style="margin-left:auto">${VIEWS.map(([k, l]) => html`<button class=${view === k ? 'on' : ''} onClick=${() => setView(k)}>${l}</button>`)}</div>
    </div>
    <div class="toolbar">
      <select class="input" value=${f.kind} onChange=${(e) => setF({ ...f, kind: e.target.value })}><option value="">Todos los tipos</option>${KINDS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <select class="input" value=${f.status} onChange=${(e) => setF({ ...f, status: e.target.value })}><option value="">Todos los estados</option>${STATUS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      <select class="input" value=${f.assignee} onChange=${(e) => setF({ ...f, assignee: e.target.value })}><option value="">Todos los responsables</option>${st.profiles.map((p) => html`<option value=${p.id}>${p.full_name}</option>`)}</select>
      <select class="input" value=${f.platform} onChange=${(e) => setF({ ...f, platform: e.target.value })}><option value="">Todas las plataformas</option>${PLATFORMS.map(([k, l]) => html`<option value=${k}>${l}</option>`)}</select>
      ${Object.values(f).some(Boolean) ? html`<button class="btn ghost sm" onClick=${() => setF({ kind: '', status: '', assignee: '', platform: '' })}>Quitar filtros</button>` : null}
    </div>
    ${body}
    <div class="legend">${STATUS.map(([k, l]) => html`<span class="row" style="gap:6px"><span class="dot" style=${{ background: statusColor(k) }}></span>${l}</span>`)}</div>`;
}
