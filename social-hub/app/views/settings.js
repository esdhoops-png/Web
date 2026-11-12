// Configuración: perfil, notificaciones, equipo y permisos, Google Drive, calendario editorial, app e Instagram.
import { html, useState, useEffect, Icon, Avatar, Switch, toast, toastError, confirmDialog, NOTIF_TYPES, fmt } from '../lib/ui.js';
import { useStore, sb, check, setState, signOut, config, loadSettings, loadPrefs, loadProfiles, reloadAll } from '../lib/store.js';
import { enablePush, disablePush, pushSupported, pushConfigured, refreshPushState } from '../lib/push.js';
import { driveConfigured, driveConnected, connectDrive, disconnectDrive } from '../lib/drive.js';
import { DriveSetupHelp } from '../lib/media.js';

const TABS = [['perfil', 'Perfil', 'user'], ['notificaciones', 'Notificaciones', 'bell'], ['equipo', 'Equipo y permisos', 'users'], ['drive', 'Google Drive', 'drive'],
  ['editorial', 'Calendario editorial', 'calendar'], ['app', 'App e Instagram', 'phone']];
const COLORS = ['#34C26B', '#F2A541', '#5AA9FF', '#A58CFF', '#F0645A', '#2EC4B6', '#F2D14B', '#E7E2D8'];

function Profile() {
  const st = useStore();
  const [name, setName] = useState(st.me.full_name);
  const [pw, setPw] = useState('');
  async function save() {
    try { const p = check(await sb.from('profiles').update({ full_name: name.trim() }).eq('id', st.me.id).select().single()); setState({ me: p }); await loadProfiles(); toast('Perfil guardado'); } catch (e) { toastError(e); }
  }
  async function color(c) { try { const p = check(await sb.from('profiles').update({ color: c }).eq('id', st.me.id).select().single()); setState({ me: p }); await loadProfiles(); } catch (e) { toastError(e); } }
  async function changePw() {
    if (pw.length < 8) { toastError(new Error('La contraseña debe tener al menos 8 caracteres.')); return; }
    const { error } = await sb.auth.updateUser({ password: pw });
    if (error) toastError(error); else { setPw(''); toast('Contraseña cambiada'); }
  }
  return html`<div class="stack" style="gap:16px">
    <section class="card stack"><h2>Tu perfil</h2>
      <div class="row"><${Avatar} p=${st.me} size="lg" /><div><b>${st.me.email}</b><div class="muted small">${st.me.role === 'owner' ? 'Propietario' : st.me.role === 'marketing' ? 'Responsable de marketing' : 'Colaborador'}${st.me.is_admin ? ' · Administrador' : ''}${st.me.can_approve ? ' · Puede aprobar' : ''}</div></div></div>
      <label class="field"><span>Nombre visible</span><div class="row nowrap"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} /><button class="btn primary" onClick=${save}>Guardar</button></div></label>
      <div class="field"><span>Color</span><div class="row">${COLORS.map((c) => html`<button class="avatar" style=${{ background: c, border: st.me.color === c ? '2px solid #fff' : '0', cursor: 'pointer' }} onClick=${() => color(c)} aria-label=${c}></button>`)}</div></div>
    </section>
    <section class="card stack"><h2>Contraseña</h2>
      <div class="row nowrap"><input class="input" type="password" placeholder="Nueva contraseña (mín. 8)" value=${pw} onInput=${(e) => setPw(e.target.value)} autocomplete="new-password" /><button class="btn" onClick=${changePw}>Cambiar</button></div></section>
    <button class="btn danger" style="align-self:flex-start" onClick=${signOut}><${Icon} name="logout" />Cerrar sesión</button>
  </div>`;
}

function Notifications() {
  const st = useStore();
  const prefs = st.prefs?.prefs || {};
  useEffect(() => { refreshPushState(); }, []);
  async function toggle(k, v) {
    try { check(await sb.from('notification_prefs').update({ prefs: { ...prefs, [k]: v }, updated_at: new Date().toISOString() }).eq('user_id', st.me.id)); await loadPrefs(); } catch (e) { toastError(e); }
  }
  async function togglePushPref(v) { try { check(await sb.from('notification_prefs').update({ push_enabled: v }).eq('user_id', st.me.id)); await loadPrefs(); } catch (e) { toastError(e); } }
  const perm = st.notifPermission || ('Notification' in window ? Notification.permission : 'unsupported');
  return html`<div class="stack" style="gap:16px">
    <section class="card stack"><h2>Avisos en este dispositivo</h2>
      <p class="small muted" style="margin:0">Dentro de la app los avisos llegan siempre en tiempo real. Para recibirlos con la app cerrada, activa las notificaciones push en cada dispositivo (ordenador y móvil).</p>
      <div class="row">
        ${st.pushActive ? html`<span class="tag" style="color:var(--verde)">● Push activo en este dispositivo</span><button class="btn sm" onClick=${() => disablePush().then(() => toast('Push desactivado')).catch(toastError)}>Desactivar</button>`
          : perm === 'granted' ? html`<span class="tag">Avisos del navegador permitidos</span>${pushConfigured() ? html`<button class="btn primary sm" onClick=${() => enablePush().then(() => toast('Push activado')).catch(toastError)}>Activar push</button>` : null}`
          : perm === 'denied' ? html`<span class="tag" style="color:var(--rojo)">Bloqueadas en el navegador</span><span class="small muted">Desbloquéalas en el candado de la barra de direcciones.</span>`
          : pushSupported() || 'Notification' in window ? html`<button class="btn primary" onClick=${() => enablePush().then((m) => toast(m === 'push' ? 'Push activado' : 'Avisos activados')).catch(toastError)}><${Icon} name="bell" />Activar notificaciones</button>`
          : html`<span class="small muted">Este navegador no admite notificaciones. En iPhone: instala la app en la pantalla de inicio (Compartir → Añadir a pantalla de inicio) y ábrela desde el icono.</span>`}
      </div>
      ${!pushConfigured() ? html`<p class="xs muted" style="margin:0">El envío push con la app cerrada requiere configurar las claves VAPID (README → Push). Sin ellas, los avisos llegan con la app abierta o en segundo plano.</p>` : null}
      <label class="row between"><span>Recibir push en mis dispositivos</span><${Switch} checked=${st.prefs?.push_enabled !== false} onChange=${togglePushPref} label="Push" /></label>
    </section>
    <section class="card"><h2>Qué quiero que me avise</h2>
      ${NOTIF_TYPES.map(([k, l, i]) => html`<label class="row between" style="padding:10px 0;border-top:1px solid var(--line)" key=${k}>
        <span class="row"><${Icon} name=${i} size=${16} />${l}</span><${Switch} checked=${prefs[k] !== false} onChange=${(v) => toggle(k, v)} label=${l} /></label>`)}
    </section></div>`;
}

function Team() {
  const st = useStore();
  const [inv, setInv] = useState({ email: '', full_name: '', role: 'collaborator' });
  const [busy, setBusy] = useState(false);
  async function upd(p, patch) {
    try { check(await sb.from('profiles').update(patch).eq('id', p.id)); await loadProfiles(); toast('Permisos actualizados'); } catch (e) { toastError(e); }
  }
  async function invite(e) {
    e.preventDefault(); setBusy(true);
    try {
      const { data, error } = await sb.functions.invoke('invite-user', { body: { ...inv, redirect_to: location.origin + location.pathname } });
      if (error) { let m = error.message; try { m = (await error.context.json()).error || m; } catch {} throw new Error(m); }
      toast('Invitación enviada', `${inv.email} recibirá un email para crear su contraseña.`); setInv({ email: '', full_name: '', role: 'collaborator' }); await loadProfiles();
    } catch (err) { toastError(new Error(err.message + ' — Si la función no está desplegada, crea el usuario en Supabase → Authentication → Users (ver README).')); } finally { setBusy(false); }
  }
  return html`<div class="stack" style="gap:16px">
    <section class="card"><h2>Equipo</h2>
      ${st.profiles.map((p) => html`<div class="row" style="padding:12px 0;border-top:1px solid var(--line)" key=${p.id}>
        <${Avatar} p=${p} /><div style="flex:1;min-width:160px"><b>${p.full_name}</b> ${p.id === st.me.id ? html`<span class="tag">Tú</span>` : null}<div class="muted small">${p.email}</div></div>
        ${st.me.is_admin && p.id !== st.me.id ? html`
          <select class="input" style="width:auto" value=${p.role} onChange=${(e) => upd(p, { role: e.target.value })}><option value="marketing">Marketing</option><option value="owner">Propietario</option><option value="collaborator">Colaborador</option></select>
          <label class="row small">Aprueba <${Switch} checked=${p.can_approve} onChange=${(v) => upd(p, { can_approve: v })} label="Puede aprobar" /></label>
          <label class="row small">Admin <${Switch} checked=${p.is_admin} onChange=${(v) => upd(p, { is_admin: v })} label="Administrador" /></label>
          <label class="row small">Activo <${Switch} checked=${p.active} onChange=${(v) => upd(p, { active: v })} label="Activo" /></label>`
          : html`<span class="tag">${p.role === 'owner' ? 'Propietario' : p.role === 'marketing' ? 'Marketing' : 'Colaborador'}</span>${p.can_approve ? html`<span class="tag" style="color:var(--verde)">Aprueba</span>` : null}${p.is_admin ? html`<span class="tag">Admin</span>` : null}`}
      </div>`)}
      <p class="xs muted">Nadie puede cambiar sus propios permisos: así quien prepara el contenido no puede autoaprobarlo.</p>
    </section>
    ${st.me.is_admin ? html`<form class="card stack" onSubmit=${invite}><h2>Invitar a una persona</h2>
      <div class="form-grid"><label class="field"><span>Email</span><input class="input" type="email" required value=${inv.email} onInput=${(e) => setInv({ ...inv, email: e.target.value })} /></label>
        <label class="field"><span>Nombre</span><input class="input" required value=${inv.full_name} onInput=${(e) => setInv({ ...inv, full_name: e.target.value })} /></label>
        <label class="field"><span>Rol</span><select class="input" value=${inv.role} onChange=${(e) => setInv({ ...inv, role: e.target.value })}><option value="collaborator">Colaborador</option><option value="marketing">Marketing</option><option value="owner">Propietario</option></select></label></div>
      <button class="btn primary" style="align-self:flex-start" disabled=${busy}>${busy ? 'Enviando…' : 'Enviar invitación'}</button></form>` : null}
  </div>`;
}

function Drive() {
  const st = useStore();
  const d = st.settings.drive || {};
  const [v, setV] = useState({ root_folder_id: d.root_folder_id || '', root_folder_name: d.root_folder_name || '', shortcuts: (d.shortcuts || []).map((s) => `${s.id} | ${s.name}`).join('\n') });
  async function save() {
    const extract = (s) => (s.match(/folders\/([\w-]+)/) || [null, s.trim()])[1];
    const value = { root_folder_id: extract(v.root_folder_id), root_folder_name: v.root_folder_name.trim() || 'Drive',
      shortcuts: v.shortcuts.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [id, ...n] = l.split('|'); return { id: extract(id), name: (n.join('|') || id).trim() }; }) };
    try { check(await sb.from('app_settings').upsert({ key: 'drive', value, updated_by: st.me.id, updated_at: new Date().toISOString() })); await loadSettings(); toast('Carpeta de Drive guardada'); } catch (e) { toastError(e); }
  }
  const connected = st.driveConnected ?? driveConnected();
  return html`<div class="stack" style="gap:16px">
    ${!driveConfigured() ? html`<${DriveSetupHelp} />` : html`<section class="card stack"><h2>Conexión</h2>
      <div class="row">${connected ? html`<span class="tag" style="color:var(--verde)">● Conectado en esta sesión</span><button class="btn sm" onClick=${disconnectDrive}>Desconectar</button>`
        : html`<span class="tag">No conectado</span><button class="btn primary sm" onClick=${() => connectDrive().then(() => toast('Google Drive conectado')).catch(toastError)}><${Icon} name="drive" size=${15} />Conectar Google Drive</button>`}</div>
      <p class="small muted" style="margin:0">Cada persona conecta su propia cuenta de Google (solo lectura). La carpeta debe estar compartida con esa cuenta.</p></section>`}
    <section class="card stack"><h2>Carpeta principal</h2>
      <label class="field"><span>ID o enlace de la carpeta raíz</span><input class="input" value=${v.root_folder_id} onInput=${(e) => setV({ ...v, root_folder_id: e.target.value })} disabled=${!st.me.is_admin} /></label>
      <label class="field"><span>Nombre</span><input class="input" value=${v.root_folder_name} onInput=${(e) => setV({ ...v, root_folder_name: e.target.value })} disabled=${!st.me.is_admin} /></label>
      <label class="field"><span>Accesos directos (uno por línea: ID | nombre)</span><textarea class="input" value=${v.shortcuts} onInput=${(e) => setV({ ...v, shortcuts: e.target.value })} disabled=${!st.me.is_admin}></textarea></label>
      ${st.me.is_admin ? html`<button class="btn primary" style="align-self:flex-start" onClick=${save}>Guardar</button>` : html`<p class="xs muted">Solo un administrador puede cambiar la carpeta.</p>`}
    </section></div>`;
}

function Editorial() {
  const st = useStore();
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState(null);
  useEffect(() => { import('../plan/editorial-plan.js').then((m) => setPlan(m)).catch(toastError); }, []);
  const imported = st.posts.filter((p) => p.import_key && p.import_key.startsWith('p2-'));
  const oldPlan = st.posts.filter((p) => p.import_key && plan && p.import_key.startsWith(plan.OLD_PREFIX));
  async function run() {
    if (!plan) return;
    if (!(await confirmDialog({ title: 'Importar calendario editorial', body: `Se crearán ${plan.PLAN.length} elementos (11 nov – 31 dic 2026) y ${plan.TASKS.length} tareas. Si ya se importaron, no se duplican.${oldPlan.length ? ` El plan anterior (${oldPlan.length} elementos) se sustituye, salvo lo que ya hayáis editado, comentado o con diseño subido.` : ''}`, ok: 'Importar' }))) return;
    setBusy(true);
    try {
      const { importEditorialPlan } = await import('../plan/importer.js');
      const { PLAN_EXTRA } = await import('../marketing/production-plan.js');
      const r = await importEditorialPlan({ plan, extra: PLAN_EXTRA });
      toast('Calendario importado', `${r.inserted} elementos nuevos · ${r.tasks} tareas${r.replaced ? ` · ${r.replaced} del plan anterior sustituidos` : ''}${r.kept ? ` · ${r.kept} del plan anterior se conservan porque ya los habíais tocado` : ''}${r.duplicates.length ? ` · ${r.duplicates.length} ya existían` : ''}`);
    } catch (e) { toastError(e); } finally { setBusy(false); }
  }
  return html`<section class="card stack"><h2>Calendario editorial 11 nov – 31 dic 2026</h2>
    <p style="margin:0">Versión 2, hecha con la guía de transferencia de la marca: programación real de noviembre (monólogos, Tardeo Exterior del 14, aniversario del 29), diseños ya entregados, menús de Navidad y el ritmo del planificador: lunes 13:00 fotos · miércoles 12:00 programación + canal de WhatsApp + reel · jueves 19:00 reel Volcán/ambiente · viernes y sábado stories · domingo 17:00 tardeo.</p>
    <p class="small muted" style="margin:0">No se inventan artistas, horarios, partidos ni promociones: todo lo que falta aparece marcado como <b>«Pendiente de confirmar»</b> para completarlo desde cada ficha.</p>
    ${plan ? html`<div class="row"><span class="tag">${plan.PLAN.length} elementos</span><span class="tag">${plan.TASKS.length} tareas</span><span class="tag">${plan.LIBRARY.length} archivos de Drive</span>
      <span class="tag" style="color:var(--verde)">${imported.length} ya importados</span>${oldPlan.length ? html`<span class="tag" style="color:var(--ambar)">${oldPlan.length} del plan anterior</span>` : null}</div>` : null}
    <button class="btn primary" style="align-self:flex-start" disabled=${busy || !plan} onClick=${run}>${busy ? 'Importando…' : oldPlan.length ? 'Actualizar al plan v2' : imported.length ? 'Importar lo que falte' : 'Importar calendario editorial'}</button>
  </section>`;
}

function AppInfo() {
  const [deferred, setDeferred] = useState(window.__installPrompt || null);
  useEffect(() => { const f = (e) => { e.preventDefault(); window.__installPrompt = e; setDeferred(e); }; addEventListener('beforeinstallprompt', f); return () => removeEventListener('beforeinstallprompt', f); }, []);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  return html`<div class="stack" style="gap:16px">
    <section class="card stack"><h2>Instalar en el móvil</h2>
      ${standalone ? html`<span class="tag" style="color:var(--verde);align-self:flex-start">● Ya estás usando la app instalada</span>` : null}
      ${deferred ? html`<button class="btn primary" style="align-self:flex-start" onClick=${async () => { deferred.prompt(); await deferred.userChoice; setDeferred(null); }}><${Icon} name="download" />Instalar Social Hub</button>` : null}
      <p style="margin:0"><b>iPhone (Safari):</b> botón Compartir → «Añadir a pantalla de inicio». Ábrela desde el icono para recibir notificaciones.</p>
      <p style="margin:0"><b>Android (Chrome):</b> menú ⋮ → «Instalar aplicación» o «Añadir a pantalla de inicio».</p>
      <p style="margin:0"><b>Ordenador (Chrome/Edge):</b> icono de instalar en la barra de direcciones.</p>
      <p class="small muted" style="margin:0">Enlace privado: <code>${location.origin + location.pathname}</code> — solo entra quien tenga usuario y contraseña.</p></section>
    <section class="card stack"><h2><${Icon} name="instagram" />Integración con Instagram (estudio)</h2>
      <p style="margin:0">Publicar automáticamente es técnicamente viable con la <b>Instagram Graph API (Content Publishing)</b> de Meta, que permite publicar fotos, carruseles y reels en cuentas <b>profesionales</b> (empresa o creador) vinculadas a una página de Facebook.</p>
      <ul class="small" style="margin:0;padding-left:18px;line-height:1.7">
        <li>Requiere crear una app en Meta for Developers, permisos <code>instagram_content_publish</code> y la revisión de la app por Meta.</li>
        <li>Límite de 50 publicaciones por cuenta cada 24 h. Las <b>stories</b> solo se pueden publicar por API en cuentas de empresa y con limitaciones.</li>
        <li>Alternativa rápida: herramientas que ya tienen esa aprobación (Meta Business Suite, Metricool…) — la app puede marcar «Programado» y enlazar la publicación.</li>
      </ul>
      <p class="small muted" style="margin:0">Por ahora la app <b>no publica nada sola</b>: una publicación solo pasa a «Publicada» cuando alguien lo marca tras publicarla de verdad.</p></section>
    <section class="card small muted">Social Hub · datos en Supabase (${config.supabaseUrl?.replace(/^https?:\/\//, '')}) · sincronización en tiempo real</section>
  </div>`;
}

export function SettingsView({ query }) {
  const [tab, setTab] = useState(query.get('tab') || 'perfil');
  const body = { perfil: Profile, notificaciones: Notifications, equipo: Team, drive: Drive, editorial: Editorial, app: AppInfo }[tab] || Profile;
  return html`<div class="page-head"><div><h1>Configuración</h1></div></div>
    <div class="lib-layout"><nav class="cat-list">${TABS.map(([k, l, i]) => html`<button class=${tab === k ? 'on' : ''} onClick=${() => setTab(k)}><${Icon} name=${i} />${l}</button>`)}</nav>
      <div>${html`<${body} />`}</div></div>`;
}
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__installPrompt = e; });
