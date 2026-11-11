// Hilo de comentarios de una publicación o tarea (con adjuntos y tiempo real).
import { html, useState, useEffect, useRef, Icon, Avatar, fmt, toastError, Linkify } from '../lib/ui.js';
import { sb, check, useStore, profileById, onRealtime } from '../lib/store.js';
import { pickFiles, AttachmentRow } from '../lib/media.js';

export function CommentsThread({ postId, taskId }) {
  const st = useStore();
  const [items, setItems] = useState(null);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const col = postId ? 'post_id' : 'task_id';
  const val = postId || taskId;
  const endRef = useRef();
  async function load() {
    const rows = check(await sb.from('comments').select('*, attachments(*)').eq(col, val).order('created_at'));
    setItems(rows);
  }
  useEffect(() => { load().catch(toastError); return onRealtime((t, pl) => {
    if (t === 'comments' && ((pl.new && pl.new[col] === val) || pl.eventType === 'DELETE')) load().catch(() => {});
    if (t === 'attachments' && pl.new?.comment_id) load().catch(() => {});
  }); }, [val]);
  async function send(e) {
    e.preventDefault();
    if (!text.trim() && !files.length) return;
    setBusy(true);
    try {
      const c = check(await sb.from('comments').insert({ [col]: val, body: text.trim() || '📎', created_by: st.me.id }).select().single());
      if (files.length) check(await sb.from('attachments').insert(files.map((f) => ({ ...f, comment_id: c.id, role: /^image/.test(f.mime_type || '') ? 'photo' : 'file' }))));
      setText(''); setFiles([]); await load();
    } catch (err) { toastError(err); } finally { setBusy(false); }
  }
  async function del(c) {
    try { check(await sb.from('comments').delete().eq('id', c.id)); await load(); } catch (err) { toastError(err); }
  }
  if (!items) return html`<p class="empty">Cargando comentarios…</p>`;
  return html`<div class="stack">
    ${items.length ? items.map((c) => { const a = profileById(c.created_by); return html`<div class="row nowrap" key=${c.id} style="align-items:flex-start">
      <${Avatar} p=${a} size="sm" /><div style="flex:1;min-width:0"><div class="small"><b>${a?.full_name || '—'}</b> <span class="muted xs">${fmt.dateTime(c.created_at)}</span>
        ${c.created_by === st.me.id ? html`<button class="btn ghost sm" style="padding:0 6px" onClick=${() => del(c)} title="Borrar">×</button>` : null}</div>
      <div style="white-space:pre-wrap;word-break:break-word"><${Linkify} text=${c.body === '📎' ? '' : c.body} /></div>
      ${(c.attachments || []).length ? html`<div class="stack" style="margin-top:6px">${c.attachments.map((x) => html`<${AttachmentRow} a=${x} key=${x.id} />`)}</div>` : null}</div></div>`; })
      : html`<p class="empty">Sin comentarios. Escribe el primero.</p>`}
    <div ref=${endRef}></div>
    <form onSubmit=${send} class="stack" style="gap:8px">
      ${files.map((f, i) => html`<${AttachmentRow} a=${f} onRemove=${() => setFiles(files.filter((_, j) => j !== i))} />`)}
      <textarea class="input" placeholder="Escribe un comentario…" value=${text} onInput=${(e) => setText(e.target.value)} style="min-height:64px"
        onKeyDown=${(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(e); }}></textarea>
      <div class="row"><button type="button" class="btn sm ghost" onClick=${async () => setFiles([...files, ...(await pickFiles({ title: 'Adjuntar al comentario' }))])}><${Icon} name="clip" size=${15} />Adjuntar</button>
        <button class="btn primary sm" style="margin-left:auto" disabled=${busy}><${Icon} name="send" size=${15} />Comentar</button></div>
    </form></div>`;
}
