// Centro de notificaciones.
import { html, useState, Icon, fmt, NOTIF_ICON, toastError, toast } from '../lib/ui.js';
import { useStore, sb, check, go, markNotificationsRead, profileById } from '../lib/store.js';
import { enablePush, pushSupported } from '../lib/push.js';

export function NotificationsView() {
  const st = useStore();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const list = st.notifications.filter((n) => !onlyUnread || !n.read_at);
  const unread = st.notifications.filter((n) => !n.read_at);
  async function open(n) {
    if (!n.read_at) await markNotificationsRead([n.id]).catch(() => {});
    if (n.link) go(n.link);
  }
  async function clearRead() {
    try { check(await sb.from('notifications').delete().eq('user_id', st.me.id).not('read_at', 'is', null)); toast('Notificaciones leídas eliminadas'); } catch (e) { toastError(e); }
  }
  return html`
    <div class="page-head"><div><h1>Notificaciones</h1><p>${unread.length} sin leer</p></div>
      <div class="actions">
        ${!st.pushActive && pushSupported() ? html`<button class="btn" onClick=${() => enablePush().then((m) => toast(m === 'push' ? 'Notificaciones push activadas' : 'Avisos del navegador activados')).catch(toastError)}><${Icon} name="bell" />Activar avisos en este dispositivo</button>` : null}
        <button class="btn" disabled=${!unread.length} onClick=${() => markNotificationsRead(unread.map((n) => n.id)).catch(toastError)}><${Icon} name="check" />Marcar todo como leído</button>
        <button class="btn ghost" onClick=${clearRead}>Limpiar leídas</button>
        <a class="btn ghost" href="#/ajustes?tab=notificaciones"><${Icon} name="settings" />Preferencias</a></div></div>
    <div class="toolbar"><div class="seg"><button class=${!onlyUnread ? 'on' : ''} onClick=${() => setOnlyUnread(false)}>Todas</button><button class=${onlyUnread ? 'on' : ''} onClick=${() => setOnlyUnread(true)}>Sin leer</button></div></div>
    <div class="card">${list.length ? list.map((n) => html`<div class=${'notif' + (!n.read_at ? ' unread' : '')} key=${n.id} onClick=${() => open(n)}>
        <span class="ic"><${Icon} name=${NOTIF_ICON[n.type] || 'bell'} /></span>
        <div style="min-width:0;flex:1"><b style="font-weight:${n.read_at ? 600 : 700}">${n.title}</b>${n.body ? html`<div class="muted small" style="white-space:pre-wrap;overflow:hidden;max-height:3em">${n.body}</div>` : null}
          ${n.actor_id ? html`<div class="xs muted">${profileById(n.actor_id)?.full_name || ''}</div>` : null}</div>
        <span class="when">${fmt.rel(n.created_at)}</span></div>`) : html`<p class="empty big">No tienes notificaciones${onlyUnread ? ' sin leer' : ''}.</p>`}</div>`;
}
