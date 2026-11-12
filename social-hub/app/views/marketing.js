// PLAN DE MARKETING · panel de control, auditoría, estrategia, campañas y ejecución (producción de diseños).
// Todo lo que se muestra se calcula con los datos reales de la base de datos en el momento.
import { html, useState, useEffect, Icon, StatusPill, fmt, dayKey, toast, toastError, confirmDialog, KIND_LABEL } from '../lib/ui.js';
import { useStore, sb, check, go, signedUrl, getState } from '../lib/store.js';
import { STRATEGY, CAMPAIGNS, PERIOD, campaignOf } from '../marketing/strategy.js';
import { DESIGNS, DELIVERED, PLAN_EXTRA } from '../marketing/production-plan.js';
import { ORIGINALS, MISSING } from '../studio/originals.js';
import { TEMPLATES, templateByKey } from '../studio/templates.js';
import { config } from '../lib/store.js';

const CONTENT = ['post', 'reel', 'story', 'carousel', 'weekly_poster', 'champions', 'promo'];
const EVENTS = ['event', 'special_date', 'sports', 'meeting'];
const inPeriod = (p) => p.starts_at && dayKey(p.starts_at) >= PERIOD.from && dayKey(p.starts_at) <= PERIOD.to;
const classify = (p) => (p.pending_info ? 'Pendiente de confirmación' : EVENTS.includes(p.kind) ? 'Confirmada' : 'Propuesta de marketing');

function useDesignStats() {
  const [d, setD] = useState(null);
  async function load() {
    const cr = check(await sb.from('creatives').select('id, post_id, title, campaign, category, format, width, height, current_version, creative_versions(version_no, exports, preview_path, note)'));
    setD(cr);
  }
  useEffect(() => { load().catch(() => setD([])); }, []);
  return [d, load];
}
const lastV = (c) => (c.creative_versions || []).sort((a, b) => b.version_no - a.version_no)[0];
const generated = (c) => (c.creative_versions || []).some((v) => (v.exports || []).length);

function Panel({ creatives }) {
  const st = useStore();
  const posts = st.posts.filter(inPeriod);
  const content = posts.filter((p) => CONTENT.includes(p.kind));
  const days = Math.round((new Date(PERIOD.to) - new Date(PERIOD.from)) / 864e5) + 1;
  const daysWith = new Set(content.map((p) => dayKey(p.starts_at))).size;
  const events = posts.filter((p) => EVENTS.includes(p.kind));
  const confirmedEvents = events.filter((p) => !p.pending_info);
  const withDesign = new Set((creatives || []).filter(generated).map((c) => c.post_id));
  const designsGenerated = (creatives || []).filter((c) => c.post_id && generated(c) && posts.some((p) => p.id === c.post_id));
  const designsPending = content.filter((p) => !withDesign.has(p.id) && p.kind !== 'reel');
  const approvals = posts.filter((p) => p.status === 'pending_approval');
  const today = dayKey(new Date());
  const active = CAMPAIGNS.filter((c) => c.from <= today && c.to >= today);
  const next = posts.filter((p) => (EVENTS.includes(p.kind) || p.kind === 'champions') && new Date(p.starts_at) >= new Date() && new Date(p.starts_at) < Date.now() + 21 * 864e5);
  const pct = Math.round((daysWith / days) * 100);
  return html`<div class="stack" style="gap:16px">
    <div class="kpis">
      <div class="kpi ok"><b>${pct}%</b><span>Calendario planificado (${daysWith} de ${days} días con contenido)</span></div>
      <div class="kpi"><b>${confirmedEvents.length}<small class="muted" style="font-size:18px"> / ${events.length}</small></b><span>Eventos confirmados (sin datos pendientes)</span></div>
      <div class="kpi"><b>${content.length}</b><span>Publicaciones creadas en el periodo</span></div>
      <div class="kpi ok"><b>${designsGenerated.length}</b><span>Diseños generados (archivo real)</span></div>
      <div class="kpi warn"><b>${designsPending.length}</b><span>Publicaciones sin diseño final (sin contar reels)</span></div>
      <div class="kpi warn" onClick=${() => go('#/publicaciones?status=pending_approval')}><b>${approvals.length}</b><span>Pendientes de aprobación</span></div>
      <div class="kpi"><b>${active.length}</b><span>Campañas activas hoy</span></div>
      <div class="kpi alert"><b>${posts.filter((p) => p.pending_info).length}</b><span>Con información pendiente</span></div>
    </div>
    <p class="xs muted" style="margin:-6px 0 0">Calculado ahora con los datos de la aplicación (periodo ${fmt.date(PERIOD.from + 'T12:00')} – ${fmt.date(PERIOD.to + 'T12:00')}). No hay métricas de Instagram conectadas: no se muestran alcances ni seguidores.</p>
    <div class="grid cols-2">
      <section class="card"><h2>Campañas activas</h2>${active.length ? active.map((c) => html`<div class="act"><b class="small">${c.name}</b><span class="small muted">${c.objetivo}</span><time>${fmt.date(c.to + 'T12:00')}</time></div>`) : html`<p class="empty">Ninguna hoy.</p>`}</section>
      <section class="card"><h2>Próximas fechas importantes (21 días)</h2>${next.length ? html`<div class="list">${next.map((p) => html`<div class="li" key=${p.id} onClick=${() => go('#/publicaciones/' + p.id)}>
        <div class="when"><b>${fmt.date(p.starts_at)}</b>${p.all_day ? '' : fmt.time(p.starts_at)}</div><div class="body"><div class="title">${p.title}</div><div class="sub">${KIND_LABEL[p.kind]}${p.pending_info ? ' · ⚠ ' + p.pending_info : ''}</div></div></div>`)}</div>` : html`<p class="empty">Sin fechas próximas.</p>`}</section>
    </div></div>`;
}

function Audit({ creatives }) {
  const st = useStore();
  const posts = st.posts.filter(inPeriod).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const groups = { 'Confirmada': [], 'Pendiente de confirmación': [], 'Propuesta de marketing': [] };
  posts.forEach((p) => groups[classify(p)].push(p));
  const events = posts.filter((p) => EVENTS.includes(p.kind));
  const sports = posts.filter((p) => p.kind === 'champions' || p.kind === 'sports' || /champions|clásico|partido/i.test(p.title));
  const promos = posts.filter((p) => p.kind === 'promo' || /menú|menu|promo|sorteo/i.test(p.title));
  const lib = st.libraryItems; const cats = Object.fromEntries(st.categories.map((c) => [c.id, c.name]));
  const libBy = lib.reduce((a, i) => ((a[cats[i.category_id] || 'Sin categoría'] = (a[cats[i.category_id] || 'Sin categoría'] || 0) + 1), a), {});
  const deliveredMissing = DELIVERED.map((k) => posts.find((p) => p.import_key === k)).filter(Boolean).filter((p) => !(p.attachments || []).some((a) => a.role === 'design'));
  const Row = (p) => html`<div class="li" key=${p.id} onClick=${() => go('#/publicaciones/' + p.id)}><div class="when"><b>${fmt.date(p.starts_at)}</b>${p.all_day ? '' : fmt.time(p.starts_at)}</div>
    <div class="body"><div class="title">${p.title}</div><div class="sub">${KIND_LABEL[p.kind]}${p.pending_info ? ' · Falta: ' + p.pending_info : ''}</div></div><${StatusPill} s=${p.status} /></div>`;
  return html`<div class="stack" style="gap:16px">
    <section class="card stack"><h2>Fuentes analizadas</h2><ul class="small" style="margin:0;padding-left:18px;line-height:1.8">
      <li><b>Guía de marca</b> «00_TRANSFERENCIA_HEINEKEN_5MENTARIOS.md» (11 nov 2026): identidad, tono, programación de noviembre, menús de Navidad, plan semanal. Los otros 2 documentos mencionados no llegaron.</li>
      <li><b>Plantillas</b>: ${TEMPLATES.length} plantillas editables (${TEMPLATES.filter((t) => t.basedOn.kind === 'original').length} recreadas desde originales y ${TEMPLATES.filter((t) => t.basedOn.kind !== 'original').length} desde la guía).</li>
      <li><b>Diseños originales verificados en Drive</b>: ${ORIGINALS.length} (Champions ×3, cartel de Halloween, 2 logos). «Tipos de personas» es de Volcán (descartado).</li>
      <li><b>Biblioteca de la app</b>: ${lib.length} elementos — ${Object.entries(libBy).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'vacía'}.</li>
      <li><b>Calendario de la app</b>: ${posts.length} elementos en el periodo, ${events.length} eventos/fechas, ${(creatives || []).length} diseños del Estudio.</li>
      <li><b>Calendario UEFA</b>: Champions J5 24–25 nov y J6 8–9 dic (fechas). Partidos que se emiten y horas: sin confirmar.</li></ul></section>
    <section class="card stack"><h2>Sin acceso / no disponible</h2><ul class="small" style="margin:0;padding-left:18px;line-height:1.8">
      ${MISSING.map((m) => html`<li>${m}</li>`)}
      <li>Estadísticas de Instagram (alcance, seguidores, mejores horas): no hay integración conectada.</li>
      <li>Fotos de los fines de semana de noviembre y diciembre, fotos de humoristas y de equipos: no están en la app.</li>
      ${!config.googleClientId ? html`<li>Google Drive dentro del editor (ID de cliente de Google sin configurar): las fotos de Drive no se pueden usar en los diseños hasta subirlas.</li>` : null}</ul></section>
    <div class="grid cols-2">
      <section class="card"><h2>Eventos registrados · ${events.length}</h2><div class="list">${events.map(Row)}</div></section>
      <section class="card"><h2>Fútbol / Champions · ${sports.length}</h2><div class="list">${sports.map(Row)}</div>
        <h2 style="margin-top:14px">Promociones y fechas comerciales · ${promos.length}</h2><div class="list">${promos.map(Row)}</div></section>
    </div>
    ${deliveredMissing.length ? html`<section class="card"><h2>Diseños entregados que hay que subir (${deliveredMissing.length})</h2><p class="small muted" style="margin-top:0">Existen en el paquete de transferencia (PNG + PSD) pero no están en la app. No se rehacen para no duplicar.</p><div class="list">${deliveredMissing.map(Row)}</div></section>` : null}
    ${Object.entries(groups).map(([k, list]) => html`<section class="card"><h2>${k} · ${list.length}</h2>${list.length ? html`<div class="list">${list.map(Row)}</div>` : html`<p class="empty">Ninguna.</p>`}</section>`)}
  </div>`;
}

function Strategy() {
  const S = STRATEGY; const L = (arr) => html`<ul class="small" style="margin:0;padding-left:18px;line-height:1.7">${arr.map((x) => html`<li>${x}</li>`)}</ul>`;
  return html`<div class="stack" style="gap:16px">
    <div class="grid cols-2"><section class="card stack"><h2>Objetivos de marketing</h2>${L(S.objetivosMarketing)}</section><section class="card stack"><h2>Objetivos de redes sociales</h2>${L(S.objetivosRedes)}</section></div>
    <div class="grid cols-2"><section class="card stack"><h2>Posicionamiento y personalidad</h2><p class="small" style="margin:0">${S.posicionamiento}</p><p class="small muted" style="margin:0">${S.personalidad}</p></section>
      <section class="card stack"><h2>Público</h2><p class="small" style="margin:0">${S.publico}</p><h2 style="margin-top:8px">Tono</h2><p class="small" style="margin:0">${S.tono}</p></section></div>
    <div class="grid cols-2"><section class="card stack"><h2>Pilares de contenido</h2>${L(S.pilares)}</section>
      <section class="card stack"><h2>Frecuencia</h2>${S.frecuencia.map(([d, w]) => html`<div class="small"><b>${d}</b> · ${w}</div>`)}<p class="xs muted" style="margin:0">${S.horas}</p></section></div>
    <div class="grid cols-2">${[['Stories', S.stories], ['Reels', S.reels], ['Carruseles', S.carruseles], ['Carteles y promociones', S.carteles], ['Eventos deportivos', S.deportes], ['Navidad y fin de año', S.navidad]].map(([t, x]) => html`<section class="card stack"><h2>${t}</h2><p class="small" style="margin:0">${x}</p></section>`)}</div>
    <section class="card stack"><h2>Acciones para más interacción y visitas</h2>${L(S.interaccion)}</section></div>`;
}

function Campaigns({ creatives }) {
  const st = useStore();
  return html`<div class="stack" style="gap:16px">${CAMPAIGNS.map((c) => {
    const posts = st.posts.filter((p) => p.import_key && campaignOf(p.import_key)?.id === c.id).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
    const gen = posts.filter((p) => (creatives || []).some((cr) => cr.post_id === p.id && generated(cr))).length;
    return html`<section class="card stack" key=${c.id}><h2 class="card-title">${c.name}<span class="tag" style="margin-left:auto">${fmt.date(c.from + 'T12:00')} – ${fmt.date(c.to + 'T12:00')}</span></h2>
      <div class="info-grid"><div><span>Objetivo</span>${c.objetivo}</div><div><span>Mensaje principal</span>${c.mensaje}</div><div><span>Público</span>${c.publico}</div><div><span>Canales</span>${c.canales.join(' · ')}</div>
        <div><span>Piezas</span>${c.piezas.join(' · ')}</div><div><span>Indicadores (a medir)</span>${c.kpis.join(' · ')}</div></div>
      <div class="small muted">${posts.length} publicaciones en el calendario · ${gen} con diseño generado · ${posts.filter((p) => p.status === 'pending_approval').length} pendientes de aprobación</div>
      ${posts.length ? html`<details><summary class="small" style="cursor:pointer">Ver publicaciones</summary><div class="list" style="margin-top:8px">${posts.map((p) => html`<div class="li" key=${p.id} onClick=${() => go('#/publicaciones/' + p.id)}>
        <div class="when"><b>${fmt.date(p.starts_at)}</b>${fmt.time(p.starts_at)}</div><div class="body"><div class="title">${p.title}</div>${p.pending_info ? html`<div class="sub">⚠ ${p.pending_info}</div>` : null}</div><${StatusPill} s=${p.status} /></div>`)}</div></details>` : html`<p class="empty">Aún no importado: usa «Ejecutar plan».</p>`}
    </section>`; })}</div>`;
}

function Thumb({ path }) {
  const [u, setU] = useState(null);
  useEffect(() => { if (path) signedUrl(path).then(setU).catch(() => {}); }, [path]);
  return u ? html`<img src=${u} alt="" loading="lazy" />` : html`<${Icon} name="palette" size=${24} />`;
}

function Execute({ creatives, reloadCreatives }) {
  const st = useStore();
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(() => st.settings.marketing_report || null);
  const add = (m) => setLog((l) => [...l, m]);
  async function run() {
    if (!(await confirmDialog({ title: 'Ejecutar el plan de marketing', body: `1) Se importa el calendario 12 nov – 31 dic sin duplicar lo que ya existe. 2) Se generan los diseños con información completa (${Object.values(DESIGNS).filter((d) => d.complete).length}), se guardan en la biblioteca, se vinculan a su publicación y quedan «Pendiente de aprobación». 3) Para las piezas con datos pendientes (${Object.values(DESIGNS).filter((d) => !d.complete).length}) se guarda un borrador editable con los huecos marcados. Nada se marca como publicado. Se puede repetir: no duplica.`, ok: 'Ejecutar' }))) return;
    setBusy(true); setLog([]);
    try {
      const plan = await import('../plan/editorial-plan.js');
      const { importEditorialPlan } = await import('../plan/importer.js');
      const { runProduction } = await import('../marketing/production.js');
      add('Fase 1–4 · Importando el calendario…');
      const imp = await importEditorialPlan({ plan, extra: PLAN_EXTRA, onLog: add });
      add('Fase 5–7 · Produciendo diseños (render real en este navegador)…');
      const prod = await runProduction({ keyToId: imp.keyToId, onLog: add });
      const rep = { at: new Date().toISOString(), by: st.me.full_name, import: { inserted: imp.inserted, already: imp.already, duplicates: imp.duplicates, past: imp.past, tasks: imp.tasks, replaced: imp.replaced, kept: imp.kept },
        generated: prod.generated, drafts: prod.drafts, skipped: prod.skipped, errors: prod.errors };
      setResult(rep);
      if (st.me.is_admin) await sb.from('app_settings').upsert({ key: 'marketing_report', value: rep, updated_by: st.me.id, updated_at: new Date().toISOString() });
      await reloadCreatives();
      toast('Plan ejecutado', `${prod.generated.length} diseños generados · ${prod.drafts.length} borradores con datos pendientes`);
    } catch (e) { toastError(e); add('✗ ' + e.message); } finally { setBusy(false); }
  }
  const generatedC = (creatives || []).filter((c) => c.post_id && generated(c));
  const draftsC = (creatives || []).filter((c) => c.post_id && !generated(c));
  return html`<div class="stack" style="gap:16px">
    <section class="card hero stack"><h2><${Icon} name="sparkle" />Ejecutar el plan en la aplicación</h2>
      <p style="margin:0">Importa el calendario, genera los diseños reales con las plantillas de la marca, los guarda en la biblioteca, los vincula a cada publicación y los deja pendientes de aprobación del propietario. Lo que tiene datos pendientes queda como borrador editable, claramente marcado.</p>
      <button class="btn primary" style="align-self:flex-start" disabled=${busy} onClick=${run}>${busy ? 'Ejecutando… (no cierres la pestaña)' : 'Ejecutar plan de marketing'}</button>
      ${log.length ? html`<pre class="copybox" style="max-height:260px;overflow:auto;font-size:12.5px">${log.join('\n')}</pre>` : null}</section>
    ${result ? html`<section class="card stack"><h2>Informe de la última ejecución</h2>
      <p class="small muted" style="margin:0">${fmt.dateTime(result.at)} · ${result.by}</p>
      <div class="info-grid"><div><span>Publicaciones nuevas</span>${result.import.inserted}</div><div><span>Ya existían (no duplicadas)</span>${result.import.already + result.import.duplicates.length}</div>
        <div><span>Tareas nuevas</span>${result.import.tasks}</div><div><span>Fechas pasadas no importadas</span>${result.import.past}</div>
        <div><span>Diseños generados</span>${result.generated.length} (${result.generated.reduce((a, g) => a + g.files, 0)} archivos PNG)</div><div><span>Borradores con datos pendientes</span>${result.drafts.length}</div>
        <div><span>Omitidos</span>${result.skipped.length}</div><div><span>Errores</span>${result.errors.length}</div></div>
      ${result.import.duplicates.length ? html`<details><summary class="small">Coincidían con publicaciones ya creadas (${result.import.duplicates.length})</summary><ul class="small">${result.import.duplicates.map((d) => html`<li>${d.plan} ↔ ${d.existing}</li>`)}</ul></details>` : null}
      ${result.errors.length ? html`<ul class="small error-text">${result.errors.map((e) => html`<li>${e.key}: ${e.error}</li>`)}</ul>` : null}</section>` : null}
    <section class="card"><h2>Diseños generados (archivo real) · ${generatedC.length}</h2>${generatedC.length ? html`<div class="tpl-grid">${generatedC.map((c) => { const v = lastV(c); const p = st.posts.find((x) => x.id === c.post_id);
      return html`<div class="tpl" key=${c.id}><div class="tpl-prev" style="cursor:pointer" onClick=${() => go('#/estudio?c=' + c.id)}><${Thumb} path=${v?.preview_path} /></div>
        <div class="stack" style="gap:4px;padding:10px"><b class="small ellipsis">${c.title}</b><span class="xs muted">${c.campaign || ''} · ${c.width}×${c.height} · ${(v?.exports || []).length} PNG · v${c.current_version}</span>
          ${p ? html`<div class="row" style="gap:6px"><${StatusPill} s=${p.status} /><a class="xs" href=${'#/publicaciones/' + p.id}>Ver publicación</a></div>` : null}
          <div class="row"><a class="btn sm" href=${'#/estudio?c=' + c.id}>Editar / versiones</a></div></div></div>`; })}</div>` : html`<p class="empty">Aún no hay diseños generados.</p>`}</section>
    <section class="card"><h2>Pendientes de información (borradores editables) · ${draftsC.length}</h2>${draftsC.length ? html`<div class="list">${draftsC.map((c) => { const p = st.posts.find((x) => x.id === c.post_id);
      return html`<div class="li" key=${c.id} onClick=${() => go('#/estudio?c=' + c.id)}><${Icon} name="edit" /><div class="body"><div class="title">${c.title}</div><div class="sub">${p?.pending_info || ''}</div></div><span class="btn sm">Completar</span></div>`; })}</div>` : html`<p class="empty">Ninguno.</p>`}</section>
  </div>`;
}

export function MarketingView({ query }) {
  const [creatives, reload] = useDesignStats();
  const tab = query.get('tab') || 'panel';
  const TABS = [['panel', 'Panel de control'], ['auditoria', 'Auditoría'], ['estrategia', 'Estrategia'], ['campanas', 'Campañas'], ['ejecucion', 'Ejecución e informe']];
  return html`<div class="page-head"><div><h1>Plan de marketing</h1><p>Heineken 5mentarios · 12 de noviembre – 31 de diciembre de 2026</p></div></div>
    <div class="seg" style="margin-bottom:16px;flex-wrap:wrap">${TABS.map(([k, l]) => html`<button class=${tab === k ? 'on' : ''} onClick=${() => go('#/marketing?tab=' + k)}>${l}</button>`)}</div>
    ${creatives === null ? html`<p class="empty">Calculando…</p>` : tab === 'panel' ? html`<${Panel} creatives=${creatives} />` : tab === 'auditoria' ? html`<${Audit} creatives=${creatives} />`
      : tab === 'estrategia' ? html`<${Strategy} />` : tab === 'campanas' ? html`<${Campaigns} creatives=${creatives} />` : html`<${Execute} creatives=${creatives} reloadCreatives=${reload} />`}`;
}
