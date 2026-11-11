// 5 MENTARIOS SOCIAL HUB — arranque, inicio de sesión y estructura de navegación.
import { html, render, useState, useEffect, Icon, Avatar, Toasts, ModalHost, toastError } from './lib/ui.js';
import { sb, configured, useStore, useRoute, go, bootstrap, setState, getState, signOut } from './lib/store.js';
import { registerSW, refreshPushState } from './lib/push.js';
import { Dashboard } from './views/dashboard.js';
import { CalendarView } from './views/calendar.js';
import { PostsView, PostDetail, openPostForm } from './views/posts.js';
import { LibraryView } from './views/library.js';
import { TasksView, TaskDetail, openTaskForm } from './views/tasks.js';
import { ChatView } from './views/chat.js';
import { NotificationsView } from './views/notifications.js';
import { ActivityView } from './views/activity.js';
import { SettingsView } from './views/settings.js';
import { SearchView } from './views/search.js';
import { GeneratorView } from './views/generator.js';

const NAV = [
  ['inicio', 'Inicio', 'home'], ['calendario', 'Calendario', 'calendar'], ['publicaciones', 'Publicaciones', 'posts'], ['generador', 'Generador y marca', 'sparkle'],
  ['biblioteca', 'Biblioteca', 'library'], ['tareas', 'Tareas', 'tasks'], ['chat', 'Chat', 'chat'],
  ['notificaciones', 'Notificaciones', 'bell'], ['actividad', 'Actividad', 'activity'], ['ajustes', 'Configuración', 'settings']
];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [mode, setMode] = useState('login');
  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error(/Invalid login/i.test(error.message) ? 'Email o contraseña incorrectos.' : error.message);
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin + location.pathname + '#/ajustes?reset=1' });
        if (error) throw error;
        setErr('Si el email existe, te hemos enviado un enlace para crear una nueva contraseña.');
      }
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }
  return html`<div class="login">
    <div class="art"><img src="icons/5mentarios-sello.svg" alt="Heineken 5mentarios" />
      <div class="claim">Social Hub<br /><span>Heineken 5mentarios</span></div></div>
    <form onSubmit=${submit} aria-label="Iniciar sesión">
      <div><h1>${mode === 'login' ? 'Entrar' : 'Recuperar acceso'}</h1><p class="muted" style="margin:6px 0 0">Acceso privado para el equipo de 5mentarios.</p></div>
      <label class="field"><span>Email</span><input class="input" type="email" autocomplete="username" required value=${email} onInput=${(e) => setEmail(e.target.value)} /></label>
      ${mode === 'login' ? html`<label class="field"><span>Contraseña</span><input class="input" type="password" autocomplete="current-password" required value=${password} onInput=${(e) => setPassword(e.target.value)} /></label>` : null}
      ${err ? html`<p class=${/enviado/.test(err) ? 'muted small' : 'error-text'} style="margin:0">${err}</p>` : null}
      <button class="btn primary block" disabled=${busy}>${busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Enviar enlace'}</button>
      <button type="button" class="btn ghost block" onClick=${() => { setMode(mode === 'login' ? 'reset' : 'login'); setErr(''); }}>
        ${mode === 'login' ? '¿Has olvidado la contraseña?' : 'Volver a entrar'}</button>
    </form></div>`;
}

function NotConfigured() {
  return html`<div class="setup"><div class="brand"><img src="icons/icon-192.png" alt="" /><div><b>5 MENTARIOS</b><small>Social Hub</small></div></div>
    <div class="card stack"><h2>Falta conectar la base de datos</h2>
      <p style="margin:0">La aplicación está instalada pero todavía no apunta a ningún proyecto de Supabase. Edita <code>social-hub/config.js</code> con la URL y la <i>anon key</i> de tu proyecto.</p>
      <ol><li>Crea un proyecto gratis en supabase.com.</li><li>SQL Editor → pega y ejecuta <code>supabase/setup.sql</code>.</li>
        <li>Project Settings → API → copia <i>Project URL</i> y <i>anon public key</i> a <code>config.js</code>.</li>
        <li>Authentication → Users → crea los dos usuarios.</li></ol>
      <p class="muted small" style="margin:0">Guía completa en <code>social-hub/README.md</code>.</p></div></div>`;
}

function NewMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!open) return; const f = () => setOpen(false); setTimeout(() => addEventListener('click', f, { once: true })); return () => removeEventListener('click', f); }, [open]);
  const pick = (fn) => { setOpen(false); fn(); };
  return html`<div class="menu-wrap"><button class="btn primary" onClick=${() => setOpen(!open)} aria-haspopup="menu"><${Icon} name="plus" /><span class="hide-sm">Nuevo</span></button>
    ${open ? html`<div class="menu" role="menu">
      <button onClick=${() => pick(() => go('#/generador'))}><${Icon} name="sparkle" />Generar contenido</button>
      <button onClick=${() => pick(() => openPostForm({ kind: 'post' }))}><${Icon} name="posts" />Publicación</button>
      <button onClick=${() => pick(() => openPostForm({ kind: 'event', requires_approval: false }))}><${Icon} name="music" />Evento</button>
      <button onClick=${() => pick(() => openPostForm({ kind: 'reminder', requires_approval: false }))}><${Icon} name="bell" />Recordatorio / reunión</button>
      <button onClick=${() => pick(() => openTaskForm({}))}><${Icon} name="tasks" />Tarea</button>
      <button onClick=${() => pick(() => go('#/chat'))}><${Icon} name="chat" />Mensaje</button>
    </div>` : null}</div>`;
}

function Shell() {
  const st = useStore();
  const { parts, query } = useRoute();
  const section = parts[0] || 'inicio';
  const unread = st.notifications.filter((n) => !n.read_at).length;
  const pendingApproval = st.posts.filter((p) => p.status === 'pending_approval').length;
  const badges = { notificaciones: unread, chat: st.chatUnread, publicaciones: st.me.can_approve ? pendingApproval : 0 };
  const [q, setQ] = useState('');
  const [more, setMore] = useState(false);
  useEffect(() => { setMore(false); window.scrollTo(0, 0); }, [section, parts[1]]);
  useEffect(() => { document.title = (NAV.find((n) => n[0] === section)?.[1] || 'Social Hub') + ' · 5 Mentarios Social Hub'; }, [section]);

  let view;
  switch (section) {
    case 'calendario': view = html`<${CalendarView} query=${query} />`; break;
    case 'publicaciones': view = parts[1] ? html`<${PostDetail} id=${parts[1]} key=${parts[1]} />` : html`<${PostsView} query=${query} />`; break;
    case 'biblioteca': view = html`<${LibraryView} />`; break;
    case 'tareas': view = parts[1] ? html`<${TaskDetail} id=${parts[1]} key=${parts[1]} />` : html`<${TasksView} />`; break;
    case 'chat': view = html`<${ChatView} />`; break;
    case 'notificaciones': view = html`<${NotificationsView} />`; break;
    case 'actividad': view = html`<${ActivityView} />`; break;
    case 'ajustes': view = html`<${SettingsView} query=${query} />`; break;
    case 'buscar': view = html`<${SearchView} query=${query} />`; break;
    case 'generador': view = html`<${GeneratorView} query=${query} />`; break;
    default: view = html`<${Dashboard} />`;
  }
  const navBtn = ([k, label, icon]) => html`<a class=${'nav-item' + (section === k ? ' active' : '')} href=${'#/' + k} key=${k}>
    <${Icon} name=${icon} />${label}${badges[k] ? html`<span class=${'badge' + (k === 'notificaciones' ? ' red' : '')}>${badges[k]}</span>` : null}</a>`;
  const mobileMain = ['inicio', 'calendario', 'tareas', 'chat'];

  return html`<div class="shell">
    <aside class="sidebar" aria-label="Menú principal">
      <a class="brand" href="#/inicio"><img src="icons/icon-192.png" alt="" /><div><b>5 MENTARIOS</b><small>Social Hub</small></div></a>
      ${NAV.map(navBtn)}
      <div class="spacer"></div>
      <div class="me-chip"><${Avatar} p=${st.me} /><div style="min-width:0;flex:1"><b class="ellipsis" style="display:block">${st.me.full_name}</b>
        <small>${st.me.role === 'owner' ? 'Propietario' : st.me.role === 'marketing' ? 'Marketing y redes' : 'Colaborador'}</small></div>
        <button class="btn ghost icon sm" title="Cerrar sesión" onClick=${signOut}><${Icon} name="logout" size=${16} /></button></div>
    </aside>
    <div class="main">
      <header class="topbar">
        <a class="mobile-title" href="#/inicio"><img src="icons/icon-192.png" alt="" />Social Hub</a>
        <form class="search" onSubmit=${(e) => { e.preventDefault(); go('#/buscar?q=' + encodeURIComponent(q)); }}>
          <${Icon} name="search" size=${16} /><input placeholder="Buscar publicaciones, tareas, mensajes, archivos…" value=${q} onInput=${(e) => setQ(e.target.value)} aria-label="Buscar" /></form>
        <div class="grow"></div>
        ${!st.online ? html`<span class="tag" style="color:var(--ambar)">Sin conexión</span>` : null}
        <a class="btn ghost icon" href="#/buscar" aria-label="Buscar"><${Icon} name="search" /></a>
        <a class="btn ghost icon" href="#/notificaciones" aria-label="Notificaciones" style="position:relative"><${Icon} name="bell" />
          ${unread ? html`<span class="badge red" style="position:absolute;top:-2px;right:-4px">${unread}</span>` : null}</a>
        <${NewMenu} />
      </header>
      <main class="content" key=${section + (parts[1] || '') + '?' + query.toString()}>${view}</main>
    </div>
    <nav class="bottom-nav" aria-label="Menú">
      ${mobileMain.map((k) => { const n = NAV.find((x) => x[0] === k); return html`<button class=${section === k ? 'active' : ''} onClick=${() => go('#/' + k)}>
        <${Icon} name=${n[2]} size=${22} />${n[1]}${badges[k] ? html`<span class="badge">${badges[k]}</span>` : null}</button>`; })}
      <button class=${!mobileMain.includes(section) ? 'active' : ''} onClick=${() => setMore(!more)}><${Icon} name="menu" size=${22} />Más
        ${unread ? html`<span class="badge red">${unread}</span>` : null}</button>
    </nav>
    ${more ? html`<div class="overlay" onClick=${(e) => e.target === e.currentTarget && setMore(false)}><div class="modal narrow"><div class="modal-body stack" style="gap:2px">
      ${NAV.filter((n) => !mobileMain.includes(n[0])).map(navBtn)}
      <hr class="sep" /><button class="nav-item" onClick=${signOut}><${Icon} name="logout" />Cerrar sesión</button></div></div></div>` : null}
  </div>`;
}

function App() {
  const st = useStore();
  useEffect(() => {
    if (!configured) { setState({ ready: true }); return; }
    registerSW().then(() => refreshPushState().catch(() => {}));
    sb.auth.getSession().then(({ data }) => {
      if (data.session) bootstrap(data.session).catch((e) => { toastError(e); setState({ ready: true }); });
      else setState({ ready: true });
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && !getState().me) { setState({ ready: false }); bootstrap(session).catch((e) => { toastError(e); setState({ ready: true }); }); }
      if (event === 'SIGNED_OUT') setState({ session: null, me: null, ready: true });
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  let body;
  if (!configured) body = html`<${NotConfigured} />`;
  else if (!st.ready) body = html`<div class="boot"><img src="icons/icon-192.png" alt="" width="96" height="96" /><p>Sincronizando…</p></div>`;
  else if (!st.session) body = html`<${Login} />`;
  else if (!st.me) body = html`<div class="setup"><div class="card stack"><h2>Tu usuario no tiene acceso</h2>
      <p style="margin:0">Has iniciado sesión, pero tu perfil no está activo en el Social Hub. Pide a un administrador que te dé acceso.</p>
      <button class="btn" onClick=${signOut}>Cerrar sesión</button></div></div>`;
  else body = html`<${Shell} />`;
  return html`${body}<${ModalHost} /><${Toasts} />`;
}
render(html`<${App} />`, document.getElementById('app'));
