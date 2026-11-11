// Utilidades de interfaz: plantillas, iconos, etiquetas, fechas y pequeños componentes.
import { h, render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import htm from 'htm';
export const html = htm.bind(h);
export { h, render, useState, useEffect, useRef };

// ---------- Iconos (trazos estilo Lucide, licencia ISC) ----------
const P = {
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  posts: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
  library: '<path d="M4 20V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16M14 20V8l4-1 3 13-4 1z"/><path d="M3 20h18"/>',
  tasks: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>', chevR: '<path d="m9 18 6-6-6-6"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
  palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c1 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-1 .8-1.7 1.7-1.7H16a6 6 0 0 0 6-6c0-4.9-4.5-8.4-10-8.4z"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0z"/>',
  poster: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  tag: '<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.6-8.6a1 1 0 0 0 0-1.41z"/><circle cx="7" cy="7" r="1.5"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  reply: '<path d="m9 17-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
  thumb: '<path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  drive: '<path d="M8 3h8l6 11-4 7H6l-4-7z"/><path d="M8 3l6 11H2M16 3 10 14M18 21l-4-7"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  kanban: '<rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="4" height="8" rx="1"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>'
};
export function Icon({ name, size = 18, style }) {
  return html`<svg width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style=${style}
    dangerouslySetInnerHTML=${{ __html: P[name] || P.file }}></svg>`;
}

// ---------- Etiquetas ----------
export const STATUS = [
  ['idea', 'Idea'], ['pending_prep', 'Pendiente de preparar'], ['in_design', 'En diseño'], ['in_review', 'En revisión'],
  ['pending_approval', 'Pendiente de aprobación'], ['approved', 'Aprobado'], ['scheduled', 'Programado'], ['published', 'Publicado']
];
export const STATUS_LABEL = Object.fromEntries(STATUS);
export const statusColor = (s) => `var(--st-${s})`;

export const KINDS = [
  ['post', 'Publicación', 'posts'], ['reel', 'Reel', 'video'], ['story', 'Story', 'phone'], ['carousel', 'Carrusel', 'layers'],
  ['weekly_poster', 'Cartel semanal', 'poster'], ['champions', 'Champions League', 'trophy'], ['event', 'Evento', 'music'],
  ['promo', 'Promoción', 'tag'], ['sports', 'Actividad deportiva', 'trophy'], ['special_date', 'Fecha especial', 'star'],
  ['marketing_task', 'Tarea de marketing', 'tasks'], ['meeting', 'Reunión', 'users'], ['reminder', 'Recordatorio', 'bell']
];
export const KIND_LABEL = Object.fromEntries(KINDS.map(([k, l]) => [k, l]));
export const KIND_ICON = Object.fromEntries(KINDS.map(([k, , i]) => [k, i]));
export const CONTENT_KINDS = ['post', 'reel', 'story', 'carousel', 'weekly_poster', 'champions', 'promo'];
export const PLATFORMS = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['whatsapp', 'Canal WhatsApp'], ['google', 'Google Business'], ['web', 'Web']];
export const PLATFORM_LABEL = Object.fromEntries(PLATFORMS);
export const FORMATS = ['Post 4:5', 'Post 1:1', 'Carrusel', 'Reel 9:16', 'Story 9:16', 'Stories (secuencia)', 'Cartel', 'Texto', 'Presencial'];

export const TASK_STATUS = [['pending', 'Pendiente'], ['in_progress', 'En proceso'], ['in_review', 'En revisión'], ['done', 'Completada']];
export const TASK_STATUS_LABEL = Object.fromEntries(TASK_STATUS);
export const PRIORITY = [['urgent', 'Urgente'], ['high', 'Alta'], ['medium', 'Media'], ['low', 'Baja']];
export const PRIORITY_LABEL = Object.fromEntries(PRIORITY);
export const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

export const NOTIF_TYPES = [
  ['message', 'Mensajes del chat', 'chat'], ['comment', 'Comentarios', 'chat'], ['design_uploaded', 'Diseños nuevos', 'palette'],
  ['task_assigned', 'Tareas asignadas', 'tasks'], ['task_done', 'Tareas completadas', 'check'], ['date_changed', 'Cambios de fecha', 'calendar'],
  ['deadline', 'Fechas límite cercanas', 'clock'], ['approval_requested', 'Solicitudes de aprobación', 'eye'],
  ['approved', 'Publicaciones aprobadas', 'thumb'], ['changes_requested', 'Cambios solicitados / diseño rechazado', 'alert'],
  ['event_created', 'Eventos nuevos', 'music'], ['library_added', 'Contenido nuevo en la biblioteca', 'library'],
  ['published', 'Publicaciones publicadas', 'instagram']
];
export const NOTIF_ICON = Object.fromEntries(NOTIF_TYPES.map(([k, , i]) => [k, i]));

// ---------- Fechas (hora local del dispositivo: Canarias) ----------
const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d) => { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const todayKey = () => dayKey(new Date());
export const parseDay = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const startOfWeek = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); const wd = (x.getDay() + 6) % 7; return addDays(x, -wd); };
export const fmt = {
  time: (d) => d ? new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
  date: (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '',
  dateLong: (d) => d ? new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '',
  dateTime: (d) => d ? new Date(d).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin fecha',
  wd: (d) => new Date(d).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
  month: (d) => new Date(d).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
  rel(d) {
    if (!d) return '';
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 45) return 'ahora';
    if (s < 3600) return `hace ${Math.round(s / 60)} min`;
    if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
    if (s < 86400 * 6) return `hace ${Math.round(s / 86400)} d`;
    return fmt.date(d);
  }
};
// <input type="datetime-local"> ↔ ISO
export const toLocalInput = (iso) => { if (!iso) return ''; const d = new Date(iso); return `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const fromLocalInput = (v) => v ? new Date(v).toISOString() : null;
export const isOverdueDate = (dateStr) => dateStr && dateStr < todayKey();

// ---------- Componentes pequeños ----------
export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
export function Avatar({ p, size = '' }) {
  if (!p) return html`<span class=${'avatar ' + size} style="background:var(--line2);color:var(--mute)">?</span>`;
  return html`<span class=${'avatar ' + size} style=${{ background: p.color }} title=${p.full_name}>${initials(p.full_name)}</span>`;
}
export function StatusPill({ s }) {
  return html`<span class="pill" style=${{ background: `color-mix(in srgb, ${statusColor(s)} 16%, transparent)`, color: statusColor(s), borderColor: `color-mix(in srgb, ${statusColor(s)} 40%, transparent)` }}>
    <span class="dot" style=${{ background: statusColor(s) }}></span>${STATUS_LABEL[s]}</span>`;
}
export function PriorityPill({ p }) {
  return html`<span class="pill" style=${{ background: `color-mix(in srgb, var(--pr-${p}) 15%, transparent)`, color: `var(--pr-${p})` }}>${PRIORITY_LABEL[p]}</span>`;
}
export function Switch({ checked, onChange, label }) {
  return html`<label class="switch" title=${label}><input type="checkbox" checked=${checked} onChange=${(e) => onChange(e.target.checked)} aria-label=${label} /><i></i></label>`;
}

// enlaces clicables en texto
export function Linkify({ text }) {
  if (!text) return null;
  const parts = String(text).split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) => (i % 2 ? html`<a href=${p} target="_blank" rel="noopener noreferrer">${p}</a>` : p));
}

// ---------- Toasts ----------
let toastSetter = null;
export function Toasts() {
  const [items, setItems] = useState([]);
  toastSetter = setItems;
  return html`<div class="toasts" role="status" aria-live="polite">${items.map((t) => html`
    <div class=${'toast ' + (t.kind || '')} key=${t.id} onClick=${() => { t.onClick && t.onClick(); setItems((x) => x.filter((y) => y.id !== t.id)); }}>
      <b>${t.title}</b>${t.body ? html`<span>${t.body}</span>` : null}
    </div>`)}</div>`;
}
export function toast(title, body, opts = {}) {
  const id = Math.random().toString(36).slice(2);
  toastSetter && toastSetter((x) => [...x.slice(-3), { id, title, body, ...opts }]);
  setTimeout(() => toastSetter && toastSetter((x) => x.filter((y) => y.id !== id)), opts.ms || 4500);
}
export const toastError = (e) => toast('Algo ha fallado', (e && (e.message || e.error_description)) || String(e), { kind: 'error', ms: 7000 });

// ---------- Modales ----------
let modalSetter = null;
export function ModalHost() {
  const [stack, setStack] = useState([]);
  modalSetter = setStack;
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setStack((s) => s.slice(0, -1)); };
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey);
  }, []);
  return stack.map((m, i) => html`<div class="overlay" key=${m.id} style=${{ zIndex: 100 + i }}
      onMouseDown=${(e) => { if (e.target === e.currentTarget && !m.sticky) closeModal(m.id); }}>
      <div class=${'modal ' + (m.size || '')} role="dialog" aria-modal="true">${m.render(() => closeModal(m.id))}</div>
    </div>`);
}
export function openModal(renderFn, opts = {}) {
  const id = Math.random().toString(36).slice(2);
  modalSetter && modalSetter((s) => [...s, { id, render: renderFn, ...opts }]);
  return id;
}
export function closeModal(id) { modalSetter && modalSetter((s) => (id ? s.filter((m) => m.id !== id) : s.slice(0, -1))); }
export function ModalHead({ title, close, children }) {
  return html`<div class="modal-head"><h2>${title}</h2>${children}<button class="btn ghost icon" onClick=${close} aria-label="Cerrar"><${Icon} name="x" /></button></div>`;
}
export function confirmDialog({ title, body, ok = 'Confirmar', danger = false, input = null }) {
  return new Promise((resolve) => {
    openModal((close) => {
      const Comp = () => {
        const [val, setVal] = useState(input?.value || '');
        const done = (v) => { close(); resolve(v); };
        return html`<${ModalHead} title=${title} close=${() => done(null)} />
          <div class="modal-body stack">${body ? html`<p style="margin:0">${body}</p>` : null}
            ${input ? html`<label class="field"><span>${input.label}</span>${input.multiline
              ? html`<textarea class="input" value=${val} onInput=${(e) => setVal(e.target.value)} placeholder=${input.placeholder || ''} autofocus></textarea>`
              : html`<input class="input" type=${input.type || 'text'} value=${val} onInput=${(e) => setVal(e.target.value)} placeholder=${input.placeholder || ''} autofocus />`}
              ${input.hint ? html`<span class="hint">${input.hint}</span>` : null}</label>` : null}
          </div>
          <div class="modal-foot"><button class="btn ghost" onClick=${() => done(null)}>Cancelar</button>
            <button class=${'btn ' + (danger ? 'danger' : 'primary')} disabled=${input?.required && !val.trim()} onClick=${() => done(input ? val : true)}>${ok}</button></div>`;
      };
      return html`<${Comp} />`;
    }, { size: 'narrow' });
  });
}
