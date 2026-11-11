// Inicio: visión general del trabajo de marketing.
import { html, Icon, Avatar, StatusPill, PriorityPill, fmt, dayKey, todayKey, addDays, startOfWeek, statusColor, KIND_LABEL, KIND_ICON, PRIORITY_ORDER, isOverdueDate } from '../lib/ui.js';
import { useStore, go, profileById } from '../lib/store.js';
import { MediaCard } from '../lib/media.js';

export function PostLine({ p, showDate = true }) {
  const a = profileById(p.assignee_id);
  const overdue = p.status !== 'published' && p.starts_at && new Date(p.starts_at) < new Date() && p.status !== 'scheduled';
  return html`<div class=${'li' + (overdue ? ' overdue' : '')} onClick=${() => go('#/publicaciones/' + p.id)}>
    <span class="bar" style=${{ background: statusColor(p.status) }}></span>
    ${showDate ? html`<div class="when"><b>${p.starts_at ? fmt.time(p.starts_at) : '—'}</b>${p.starts_at ? fmt.date(p.starts_at) : 'sin fecha'}</div>` : null}
    <div class="body"><div class="title">${p.title}</div>
      <div class="sub"><${Icon} name=${KIND_ICON[p.kind]} size=${12} /> ${KIND_LABEL[p.kind]}${p.format ? ' · ' + p.format : ''}${p.pending_info ? ' · ⚠ pendiente de confirmar' : ''}</div></div>
    <${StatusPill} s=${p.status} />${a ? html`<${Avatar} p=${a} size="sm" />` : null}
  </div>`;
}
export function TaskLine({ t }) {
  const a = profileById(t.assignee_id);
  const overdue = t.status !== 'done' && isOverdueDate(t.due_date);
  return html`<div class=${'li' + (overdue ? ' overdue' : '')} onClick=${() => go('#/tareas/' + t.id)}>
    <span class="bar" style=${{ background: `var(--pr-${t.priority})` }}></span>
    <div class="body"><div class="title">${t.title}</div>
      <div class="sub">${t.due_date ? (overdue ? 'Atrasada · venció el ' : 'Vence el ') + fmt.date(t.due_date + 'T12:00') : 'Sin fecha límite'}</div></div>
    <${PriorityPill} p=${t.priority} />${a ? html`<${Avatar} p=${a} size="sm" />` : null}
  </div>`;
}

export function Dashboard() {
  const st = useStore();
  const now = new Date();
  const today = todayKey();
  const posts = st.posts.filter((p) => !p.is_draft || p.created_by === st.me.id);
  const openTasks = st.tasks.filter((t) => t.status !== 'done');
  const todayPosts = posts.filter((p) => p.starts_at && dayKey(p.starts_at) === today && p.status !== 'published');
  const overduePosts = posts.filter((p) => p.starts_at && dayKey(p.starts_at) < today && !['published'].includes(p.status) && p.kind !== 'event' && p.kind !== 'special_date' && p.kind !== 'meeting' && p.kind !== 'reminder');
  const todayTasks = openTasks.filter((t) => t.due_date && t.due_date <= today || t.priority === 'urgent')
    .sort((a, b) => (a.due_date || '9') .localeCompare(b.due_date || '9') || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const pendingApproval = posts.filter((p) => p.status === 'pending_approval');
  const inDesign = posts.filter((p) => p.status === 'in_design' || p.status === 'in_review');
  const urgent = openTasks.filter((t) => t.priority === 'urgent');
  const overdueTasks = openTasks.filter((t) => isOverdueDate(t.due_date));
  const upcomingPosts = posts.filter((p) => p.starts_at && new Date(p.starts_at) >= now && p.status !== 'published' && ['post', 'reel', 'story', 'carousel', 'weekly_poster', 'champions', 'promo'].includes(p.kind)).slice(0, 8);
  const soon = posts.filter((p) => p.starts_at && new Date(p.starts_at) >= now && new Date(p.starts_at) < addDays(now, 21) && ['event', 'special_date', 'champions', 'sports', 'promo', 'meeting'].includes(p.kind)).slice(0, 8);
  const ws = startOfWeek(now);
  const week = [...Array(7)].map((_, i) => addDays(ws, i));
  const hour = now.getHours();
  const hello = hour < 13 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches';
  const unreadN = st.notifications.filter((n) => !n.read_at);

  return html`
  <div class="page-head"><div><h1>${hello}, ${st.me.full_name.split(' ')[0]}</h1>
    <p>${fmt.dateLong(now)} · ${st.realtime === 'SUBSCRIBED' ? html`<span style="color:var(--verde)">● Sincronizado en tiempo real</span>` : html`<span class="muted">○ Conectando…</span>`}</p></div></div>

  <div class="kpis">
    <div class="kpi warn" onClick=${() => go('#/publicaciones?status=pending_approval')}><b>${pendingApproval.length}</b><span>Pendientes de aprobación</span></div>
    <div class="kpi" onClick=${() => go('#/publicaciones?status=in_design')}><b>${inDesign.length}</b><span>Diseños en proceso</span></div>
    <div class="kpi ok" onClick=${() => go('#/tareas')}><b>${openTasks.length}</b><span>Tareas pendientes</span></div>
    <div class="kpi alert" onClick=${() => go('#/tareas?f=urgent')}><b>${urgent.length}</b><span>Tareas urgentes</span></div>
    <div class="kpi alert" onClick=${() => go('#/tareas?f=overdue')}><b>${overdueTasks.length + overduePosts.length}</b><span>Atrasadas</span></div>
    <div class="kpi" onClick=${() => go('#/notificaciones')}><b>${unreadN.length}</b><span>Avisos sin leer</span></div>
  </div>

  <div class="grid dash">
    <section class="card hero span-7"><h2><${Icon} name="sparkle" />Qué tenemos que hacer hoy</h2>
      ${!todayPosts.length && !todayTasks.length && !overduePosts.length && !(st.me.can_approve && pendingApproval.length)
        ? html`<p class="empty">Nada urgente para hoy. 🍻</p>` : html`<div class="list">
        ${st.me.can_approve ? pendingApproval.map((p) => html`<${PostLine} p=${p} key=${'a' + p.id} />`) : null}
        ${overduePosts.slice(0, 5).map((p) => html`<${PostLine} p=${p} key=${'o' + p.id} />`)}
        ${todayPosts.map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}
        ${todayTasks.slice(0, 8).map((t) => html`<${TaskLine} t=${t} key=${t.id} />`)}</div>`}
    </section>
    <section class="card span-5"><h2><${Icon} name="calendar" />Próximamente<a href="#/calendario?v=events">Ver todo</a></h2>
      ${soon.length ? html`<div class="list">${soon.map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}</div>` : html`<p class="empty">Sin eventos en las próximas 3 semanas.</p>`}
    </section>

    <section class="card span-12"><h2><${Icon} name="calendar" />Esta semana<a href="#/calendario?v=week">Abrir calendario</a></h2>
      <div class="strip">${week.map((d) => { const k = dayKey(d); const items = posts.filter((p) => p.starts_at && dayKey(p.starts_at) === k);
        return html`<div class=${'d' + (k === today ? ' today' : '')} onClick=${() => go('#/calendario?v=day&d=' + k)}>
          <small>${fmt.wd(d)}</small><b>${d.getDate()}</b>
          <div class="dots">${items.slice(0, 10).map((p) => html`<i title=${p.title} style=${{ background: statusColor(p.status) }}></i>`)}</div>
          <div class="xs muted hide-sm">${items.length ? items.length + ' elem.' : ''}</div></div>`; })}</div>
    </section>

    <section class="card span-7"><h2><${Icon} name="posts" />Próximas publicaciones<a href="#/publicaciones">Todas</a></h2>
      ${upcomingPosts.length ? html`<div class="list">${upcomingPosts.map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}</div>` : html`<p class="empty">No hay publicaciones planificadas. Importa el calendario editorial en Configuración.</p>`}
    </section>
    <section class="card span-5"><h2><${Icon} name="eye" />Pendientes de aprobación</h2>
      ${pendingApproval.length ? html`<div class="list">${pendingApproval.map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}</div>` : html`<p class="empty">Nada esperando aprobación.</p>`}
      <h2 style="margin-top:16px"><${Icon} name="palette" />Diseños en proceso</h2>
      ${inDesign.length ? html`<div class="list">${inDesign.slice(0, 6).map((p) => html`<${PostLine} p=${p} key=${p.id} />`)}</div>` : html`<p class="empty">Ningún diseño en marcha.</p>`}
    </section>

    <section class="card span-6"><h2><${Icon} name="tasks" />Tareas pendientes<a href="#/tareas">Tablero</a></h2>
      ${openTasks.length ? html`<div class="list">${[...openTasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || (a.due_date || '9').localeCompare(b.due_date || '9')).slice(0, 8).map((t) => html`<${TaskLine} t=${t} key=${t.id} />`)}</div>`
        : html`<p class="empty">Sin tareas abiertas.</p>`}
    </section>
    <section class="card span-6"><h2><${Icon} name="chat" />Últimos mensajes<a href="#/chat">Abrir chat${st.chatUnread ? ` (${st.chatUnread})` : ''}</a></h2>
      ${st.lastMessages.length ? html`<div class="list">${st.lastMessages.map((m) => { const a = profileById(m.created_by);
        return html`<div class="li" onClick=${() => go('#/chat')} key=${m.id}><${Avatar} p=${a} size="sm" /><div class="body"><div class="title" style="font-weight:500">${m.body || '📎 Archivo'}</div>
          <div class="sub">${a?.full_name || ''} · ${fmt.rel(m.created_at)}</div></div></div>`; })}</div>` : html`<p class="empty">Todavía no hay mensajes.</p>`}
    </section>

    <section class="card span-4"><h2><${Icon} name="bell" />Notificaciones<a href="#/notificaciones">Ver</a></h2>
      ${st.notifications.length ? html`<div class="list">${st.notifications.slice(0, 6).map((n) => html`<div class="li" key=${n.id} onClick=${() => n.link && go(n.link)}>
        ${!n.read_at ? html`<span class="dot" style="background:var(--verde)"></span>` : html`<span class="dot"></span>`}
        <div class="body"><div class="title" style="font-weight:${n.read_at ? 500 : 700}">${n.title}</div><div class="sub">${fmt.rel(n.created_at)}</div></div></div>`)}</div>` : html`<p class="empty">Sin avisos.</p>`}
    </section>
    <section class="card span-4"><h2><${Icon} name="image" />Últimos archivos<a href="#/biblioteca">Biblioteca</a></h2>
      ${(() => { const files = [...st.libraryItems.slice(0, 4), ...st.recentFiles].slice(0, 6);
        return files.length ? html`<div class="media-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${files.map((a) => html`<${MediaCard} a=${a} key=${a.id} />`)}</div>` : html`<p class="empty">Aún no se han añadido archivos.</p>`; })()}
    </section>
    <section class="card span-4"><h2><${Icon} name="activity" />Actividad<a href="#/actividad">Historial</a></h2>
      ${st.recentActivity.length ? html`<div>${st.recentActivity.slice(0, 7).map((a) => html`<div class="act" key=${a.id}><${Avatar} p=${profileById(a.actor_id)} size="sm" />
        <span class="small">${a.summary}</span><time>${fmt.rel(a.created_at)}</time></div>`)}</div>` : html`<p class="empty">Sin actividad todavía.</p>`}
    </section>
  </div>`;
}
