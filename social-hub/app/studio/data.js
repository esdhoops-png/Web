// Datos del Estudio Creativo en Supabase: creatividades, versiones, archivos exportados y vínculo con publicaciones.
import { sb, check, getState, uploadFile } from '../lib/store.js';
import { exportPage, cleanDoc } from './engine.js';

let available = null;
export async function studioAvailable(force = false) {
  if (available !== null && !force) return available;
  const { error } = await sb.from('creatives').select('id', { head: true, count: 'exact' }).limit(1);
  available = !error || !/PGRST205|does not exist|schema cache/.test(error.message + (error.code || ''));
  return available;
}

const slug = (s) => (s || 'general').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'general';
export function folderFor(creative, versionNo) {
  const d = new Date();
  return `studio/${slug(creative.campaign)}/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}/${creative.id}/v${versionNo}`;
}

async function put(path, blob, type) {
  check(await sb.storage.from('hub').upload(path, blob, { contentType: type, upsert: false }));
  return path;
}

export async function listCreatives() {
  return check(await sb.from('creatives').select('*, creative_versions(id, version_no, preview_path, exports, note, created_at, created_by)').order('updated_at', { ascending: false }).limit(300));
}
export async function getCreative(id) {
  return check(await sb.from('creatives').select('*, creative_versions(*)').eq('id', id).single());
}
export async function createCreative(meta) {
  return check(await sb.from('creatives').insert(meta).select().single());
}
export async function updateCreative(id, patch) {
  return check(await sb.from('creatives').update(patch).eq('id', id).select().single());
}

// Guarda una versión nueva: documento editable + miniatura + (opcional) archivos exportados
export async function saveVersion(creative, doc, { note = null, exports = [], previewDoc = null } = {}) {
  const prev = (creative.creative_versions || []).reduce((m, v) => Math.max(m, v.version_no), creative.current_version || 0);
  const vNo = prev + 1;
  const dir = folderFor(creative, vNo);
  const preview = await exportPage(previewDoc || doc, 0, { type: 'image/jpeg', scale: 360 / (previewDoc || doc).width, quality: 0.8 });
  const previewPath = await put(`${dir}/preview.jpg`, preview, 'image/jpeg');
  const ex = [];
  for (const e of exports) {
    const name = `${dir}/${e.name}`;
    await put(name, e.blob, e.blob.type);
    ex.push({ path: name, type: e.blob.type, width: e.width, height: e.height, page: e.page, scale: e.scale, size: e.blob.size });
  }
  const v = check(await sb.from('creative_versions').insert({ creative_id: creative.id, doc: cleanDoc(doc), preview_path: previewPath, exports: ex, note }).select().single());
  if (v.version_no !== vNo) { /* otro usuario guardó a la vez: la numeración la decide la base de datos */ }
  return v;
}

// Genera los archivos finales (PNG/JPG) de todas las páginas o de una
export async function renderExports(doc, { type = 'image/png', scale = 1, pages = null } = {}) {
  const idx = pages || doc.pages.map((_, i) => i);
  const ext = type === 'image/png' ? 'png' : 'jpg';
  const out = [];
  for (const i of idx) {
    const blob = await exportPage(doc, i, { type, scale, quality: 0.93 });
    out.push({ blob, page: i + 1, scale, width: Math.round(doc.width * scale), height: Math.round(doc.height * scale), name: `${doc.format || 'diseno'}-${doc.width * scale}x${doc.height * scale}-p${i + 1}.${ext}` });
  }
  return out;
}

// Vincula una versión (con exportaciones) a una publicación: nueva versión de diseño + adjuntos + biblioteca
export async function linkToPost(creative, version, postId, { requestApproval = false, title } = {}) {
  if (!version.exports || !version.exports.length) throw new Error('Esta versión no tiene archivos exportados. Usa «Guardar y exportar» primero.');
  const pv = check(await sb.from('post_versions').insert({ post_id: postId, note: `Diseño del Estudio: «${creative.title}» v${version.version_no}` }).select().single());
  check(await sb.from('attachments').insert(version.exports.map((e) => ({
    post_id: postId, version_id: pv.id, role: 'design', source: 'storage', storage_path: e.path, mime_type: e.type, size_bytes: e.size || null,
    name: `${title || creative.title} · v${version.version_no}${version.exports.length > 1 ? ' · ' + e.page : ''}.${e.type === 'image/png' ? 'png' : e.type === 'video/mp4' ? 'mp4' : e.type === 'video/webm' ? 'webm' : 'jpg'}`,
    creative_version_id: version.id
  }))));
  if (!creative.post_id) await updateCreative(creative.id, { post_id: postId });
  if (requestApproval) {
    const p = getState().posts.find((x) => x.id === postId);
    if (p && ['idea', 'pending_prep', 'in_design', 'in_review'].includes(p.status)) check(await sb.from('posts').update({ status: 'pending_approval' }).eq('id', postId));
  }
  return pv;
}

// Guarda las exportaciones también en la biblioteca (categoría «Estudio creativo»)
export async function addToLibrary(creative, version) {
  const cat = getState().categories.find((c) => c.slug === (creative.category === 'video' ? 'videos' : 'estudio')) || getState().categories[0];
  const rows = (version.exports || []).map((e) => ({ category_id: cat?.id || null, source: 'storage', storage_path: e.path, name: `${creative.title} · v${version.version_no} · ${e.width}×${e.height}${version.exports.length > 1 ? ' · p' + e.page : ''}`, mime_type: e.type, size_bytes: e.size || null, tags: [creative.category, creative.campaign].filter(Boolean), notes: `Estudio creativo · ${creative.campaign || 'sin campaña'}` }));
  if (rows.length) check(await sb.from('library_items').insert(rows));
}

// Una foto elegida en el selector → referencia utilizable en el lienzo (Storage, sin problemas de CORS)
export async function refForCanvas(f) {
  if (f.source === 'storage') return { kind: 'storage', path: f.storage_path };
  if (f.source === 'drive') {
    const { driveConnected, downloadDriveFile } = await import('../lib/drive.js');
    if (!driveConnected()) throw new Error('Para usar una foto de Drive en el editor hay que traerla a la app: súbela desde «Subir archivo» o conecta Google Drive (ID de cliente de Google, ver README).');
    const blob = await downloadDriveFile(f.drive_file_id);
    const ref = await uploadFile(new File([blob], f.name || 'drive.jpg', { type: blob.type || f.mime_type || 'image/jpeg' }), 'studio/fotos');
    return { kind: 'storage', path: ref.storage_path };
  }
  throw new Error('Los enlaces externos no se pueden usar dentro del diseño (el navegador no permite exportarlos). Sube la imagen.');
}
