// Chat interno en tiempo real: mensajes, respuestas, imágenes, archivos, enlaces y marcas de leído.
import { html, useState, useEffect, useRef, Icon, Avatar, fmt, dayKey, todayKey, toastError, Linkify } from '../lib/ui.js';
import { sb, check, useStore, profileById, onRealtime, signedUrl, setState } from '../lib/store.js';
import { pickFiles, AttachmentRow, openPreview, isImage } from '../lib/media.js';
import { driveThumb } from '../lib/drive.js';

const PAGE = 60;

function ChatImage({ a }) {
  const [url, setUrl] = useState(a.source === 'drive' ? driveThumb(a.drive_file_id, 520) : null);
  useEffect(() => { if (a.source === 'storage') signedUrl(a.storage_path).then(setUrl).catch(() => {}); }, [a.id]);
  return url ? html`<img class="chat-img" src=${url} alt=${a.name} loading="lazy" referrerpolicy="no-referrer" onClick=${() => openPreview(a)} />` : null;
}

export function ChatView() {
  const st = useStore();
  const [msgs, setMsgs] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [reply, setReply] = useState(null);
  const [busy, setBusy] = useState(false);
  const scroller = useRef();
  const stick = useRef(true);

  async function load(before) {
    let q = sb.from('chat_messages').select('*, attachments(*)').eq('channel', 'general').order('created_at', { ascending: false }).limit(PAGE);
    if (before) q = q.lt('created_at', before);
    const rows = check(await q).reverse();
    setHasMore(rows.length === PAGE);
    setMsgs((cur) => (before ? [...rows, ...(cur || [])] : rows));
  }
  async function markRead() {
    if (document.visibilityState !== 'visible') return;
    await sb.from('chat_reads').upsert({ user_id: st.me.id, channel: 'general', last_read_at: new Date().toISOString() });
    setState({ chatUnread: 0 });
    const ids = st.notifications.filter((n) => n.type === 'message' && !n.read_at).map((n) => n.id);
    if (ids.length) await sb.from('notifications').update({ read_at: new Date().toISOString() }).in('id', ids);
  }
  useEffect(() => {
    load().then(markRead).catch(toastError);
    const off = onRealtime((t, pl) => {
      if (t === 'chat_messages' && pl.eventType === 'INSERT') {
        // pequeña espera para que lleguen los adjuntos del mensaje
        setTimeout(async () => {
          const row = check(await sb.from('chat_messages').select('*, attachments(*)').eq('id', pl.new.id).single());
          setMsgs((cur) => (cur && !cur.some((m) => m.id === row.id) ? [...cur, row] : cur));
          markRead();
        }, 350);
      }
      if (t === 'attachments' && pl.new?.message_id) {
        setMsgs((cur) => cur && cur.map((m) => (m.id === pl.new.message_id && !(m.attachments || []).some((a) => a.id === pl.new.id) ? { ...m, attachments: [...(m.attachments || []), pl.new] } : m)));
      }
      if (t === 'chat_messages' && pl.eventType === 'UPDATE') setMsgs((cur) => cur && cur.map((m) => (m.id === pl.new.id ? { ...m, ...pl.new } : m)));
    });
    const vis = () => markRead();
    document.addEventListener('visibilitychange', vis);
    return () => { off(); document.removeEventListener('visibilitychange', vis); };
  }, []);
  useEffect(() => { const el = scroller.current; if (el && stick.current) el.scrollTop = el.scrollHeight; }, [msgs]);

  async function send(e) {
    e && e.preventDefault();
    const body = text.trim();
    if (!body && !files.length) return;
    setBusy(true);
    try {
      const m = check(await sb.from('chat_messages').insert({ body, reply_to_id: reply?.id || null, created_by: st.me.id }).select().single());
      if (files.length) check(await sb.from('attachments').insert(files.map((f) => ({ ...f, message_id: m.id, role: isImage(f.mime_type) ? 'photo' : 'file' }))));
      setText(''); setFiles([]); setReply(null); stick.current = true;
      const row = check(await sb.from('chat_messages').select('*, attachments(*)').eq('id', m.id).single());
      setMsgs((cur) => (cur.some((x) => x.id === row.id) ? cur.map((x) => (x.id === row.id ? row : x)) : [...cur, row]));
    } catch (err) { toastError(err); } finally { setBusy(false); }
  }
  async function del(m) {
    try { check(await sb.from('chat_messages').update({ deleted_at: new Date().toISOString(), body: '' }).eq('id', m.id)); } catch (err) { toastError(err); }
  }

  const other = st.chatReads.filter((r) => r.user_id !== st.me.id);
  const myLast = msgs && [...msgs].reverse().find((m) => m.created_by === st.me.id);
  const seenBy = myLast ? other.filter((r) => new Date(r.last_read_at) >= new Date(myLast.created_at)).map((r) => profileById(r.user_id)?.full_name?.split(' ')[0]).filter(Boolean) : [];
  let lastDay = null;
  const byId = Object.fromEntries((msgs || []).map((m) => [m.id, m]));

  return html`
    <div class="page-head chat-head"><div><h1>Chat</h1><p>Conversación privada del equipo · ${st.profiles.filter((p) => p.active).map((p) => p.full_name.split(' ')[0]).join(', ')}</p></div></div>
    <div class="chat">
      <div class="chat-scroll" ref=${scroller} onScroll=${(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
        ${hasMore ? html`<button class="btn sm ghost" style="align-self:center" onClick=${() => { stick.current = false; load(msgs[0].created_at).catch(toastError); }}>Cargar mensajes anteriores</button>` : null}
        ${msgs === null ? html`<p class="empty">Cargando mensajes…</p>` : !msgs.length ? html`<p class="empty big">Aún no hay mensajes. ¡Escribe el primero!</p>` : null}
        ${(msgs || []).map((m) => {
          const a = profileById(m.created_by); const mine = m.created_by === st.me.id; const k = dayKey(m.created_at);
          const sep = k !== lastDay ? html`<div class="day-sep">${k === todayKey() ? 'Hoy' : fmt.dateLong(m.created_at)}</div>` : null; lastDay = k;
          const q = m.reply_to_id && byId[m.reply_to_id];
          return html`${sep}<div class=${'msg' + (mine ? ' mine' : '')} key=${m.id} id=${'m-' + m.id}>
            <${Avatar} p=${a} size="sm" />
            <div class="bubble"><div class="meta"><b>${a?.full_name || '—'}</b><span>${fmt.time(m.created_at)}</span>${m.edited_at ? html`<span>(editado)</span>` : null}</div>
              ${q ? html`<div class="quote"><b>${profileById(q.created_by)?.full_name?.split(' ')[0]}:</b> ${(q.body || '📎').slice(0, 120)}</div>` : null}
              ${m.deleted_at ? html`<div class="txt muted"><i>Mensaje eliminado</i></div>` : html`<div class="txt"><${Linkify} text=${m.body} /></div>`}
              ${!m.deleted_at ? (m.attachments || []).map((x) => isImage(x.mime_type) ? html`<${ChatImage} a=${x} key=${x.id} />` : html`<div style="margin-top:6px" key=${x.id}><${AttachmentRow} a=${x} /></div>`) : null}
            </div>
            ${!m.deleted_at ? html`<div class="actions"><button class="btn ghost icon sm" title="Responder" onClick=${() => setReply(m)}><${Icon} name="reply" size=${15} /></button>
              ${mine ? html`<button class="btn ghost icon sm" title="Eliminar" onClick=${() => del(m)}><${Icon} name="trash" size=${15} /></button>` : null}</div>` : null}
          </div>`;
        })}
        ${seenBy.length ? html`<div class="read-mark">✓✓ Leído por ${seenBy.join(', ')}</div>` : myLast ? html`<div class="read-mark muted" style="color:var(--mute)">✓ Enviado</div>` : null}
      </div>
      <form class="composer" onSubmit=${send}>
        ${reply ? html`<div class="row small"><span class="muted">Respondiendo a <b>${profileById(reply.created_by)?.full_name}</b>: ${(reply.body || '📎').slice(0, 80)}</span>
          <button type="button" class="btn ghost sm" onClick=${() => setReply(null)}>×</button></div>` : null}
        ${files.map((f, i) => html`<${AttachmentRow} a=${f} onRemove=${() => setFiles(files.filter((_, j) => j !== i))} />`)}
        <div class="row nowrap">
          <button type="button" class="btn ghost icon" title="Adjuntar imagen, archivo o enlace de Drive" onClick=${async () => setFiles([...files, ...(await pickFiles({ title: 'Compartir en el chat', defaultTab: 'upload' }))])}><${Icon} name="clip" /></button>
          <textarea class="input" rows="1" placeholder="Escribe un mensaje… (Enter para enviar, Mayús+Enter salto de línea)" value=${text} onInput=${(e) => setText(e.target.value)}
            onKeyDown=${(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } }} aria-label="Mensaje"></textarea>
          <button class="btn primary icon" disabled=${busy} aria-label="Enviar"><${Icon} name="send" /></button>
        </div>
      </form>
    </div>`;
}
