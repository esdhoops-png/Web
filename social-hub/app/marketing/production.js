// Ejecuta la producción de diseños del plan dentro de la app (con la sesión del usuario):
// plantilla → datos → render real → Storage → versión editable → vínculo a la publicación → «Pendiente de aprobación».
// Idempotente: si una publicación ya tiene un diseño del estudio, no lo repite. Si ese diseño lo hizo la propia producción con otra
// plantilla (estilo anterior) y nadie lo ha tocado, guarda una versión nueva con el estilo de los PSD.
import { sb, check, getState, reloadAll } from '../lib/store.js';
import { templateByKey, buildDoc } from '../studio/templates.js';
import { createCreative, updateCreative, saveVersion, renderExports, linkToPost, addToLibrary, studioAvailable } from '../studio/data.js';
import { DESIGNS } from './production-plan.js';
import { STORY_VIDEOS } from './video-plan.js';
import { drawStory, loadStoryAssets, storyDuration } from '../studio/story-motion.js';
import { campaignOf } from './strategy.js';

const CAT = { artista: 'carteles', lista: 'carteles', 'tardeo-xl': 'eventos', finde: 'carruseles', mes: 'carruseles', 'story-hoy': 'stories', anuncio: 'carteles', 'navidad-menus': 'promociones', marca: 'marca', programacion: 'carteles', 'champions-partido': 'futbol', 'fotos-portada': 'carruseles' };

// Sin foto: no se dibuja el hueco punteado en los archivos finales
function finalize(doc) {
  for (const p of doc.pages) for (const l of p.layers) if (l.type === 'image' && !l.ref && l.placeholder !== false) l.visible = false;
  return doc;
}

export async function runProduction({ keyToId, onLog = () => {}, onlyKeys = null } = {}) {
  if (!(await studioAvailable(true))) throw new Error('El Estudio creativo no está activado: pega supabase/estudio.sql en Supabase antes de producir diseños.');
  const out = { generated: [], drafts: [], skipped: [], errors: [], videos: [] };
  const keys = Object.keys(DESIGNS).filter((k) => !onlyKeys || onlyKeys.includes(k));
  const vkeys = STORY_VIDEOS.filter((v) => !onlyKeys || onlyKeys.includes(v.key));
  // diseños ya existentes por publicación
  const ids = [...new Set([...keys, ...vkeys.map((v) => v.key)].map((k) => keyToId[k]).filter(Boolean))];
  const existing = ids.length ? check(await sb.from('creatives').select('*, creative_versions(id, version_no, note)').in('post_id', ids)) : [];
  const byPost = Object.fromEntries(existing.filter((c) => c.category !== 'video').map((c) => [c.post_id, c]));
  const hasVideo = new Set(existing.filter((c) => c.category === 'video').map((c) => c.post_id));
  const posts = ids.length ? check(await sb.from('posts').select('id, title, status, pending_info, import_key').in('id', ids)) : [];
  const postById = Object.fromEntries(posts.map((p) => [p.id, p]));
  for (const key of keys) {
    const spec = DESIGNS[key]; const postId = keyToId[key];
    if (!postId) { out.skipped.push({ key, why: 'La publicación no está en el calendario (fecha pasada o no importada).' }); continue; }
    const post = postById[postId];
    const prev = byPost[postId];
    // Rediseño automático al estilo de los PSD: solo si el diseño anterior lo hizo esta producción, nadie lo ha retocado a mano
    // y la publicación no está aprobada, programada ni publicada.
    const auto = prev && (prev.creative_versions || []).every((v) => /^(Producción del plan|BORRADOR)/.test(v.note || ''));
    const restyle = prev && auto && prev.template_key !== spec.template && post && ['idea', 'pending_prep', 'in_design', 'in_review', 'pending_approval'].includes(post.status);
    if (prev && !restyle) { out.skipped.push({ key, title: post?.title, why: auto ? 'Ya tiene un diseño del Estudio con este estilo (no se repite).' : 'Ya tiene un diseño retocado a mano (no se toca).' }); continue; }
    try {
      const t = templateByKey(spec.template);
      const doc = buildDoc(t, spec.format, spec.data || {}, {});
      const camp = campaignOf(key);
      const creative = restyle
        ? { ...(await updateCreative(prev.id, { template_key: t.key, category: CAT[spec.template] || t.category, format: spec.format, width: doc.width, height: doc.height, pages: doc.pages.length })), creative_versions: prev.creative_versions || [] }
        : { ...(await createCreative({ title: post?.title || key, category: CAT[spec.template] || t.category, campaign: camp?.name || null, format: spec.format,
          width: doc.width, height: doc.height, pages: doc.pages.length, template_key: t.key, post_id: postId })), creative_versions: [] };
      if (restyle) onLog(`↻ ${creative.title} — nueva versión con el estilo de los PSD`);
      if (spec.complete) {
        finalize(doc);
        const files = await renderExports(doc, { type: 'image/png', scale: 1 });
        const v = await saveVersion(creative, doc, { note: `Producción del plan de marketing · ${spec.source || ''}`, exports: files });
        await addToLibrary(creative, v);
        await linkToPost(creative, v, postId, { requestApproval: true });
        out.generated.push({ key, title: creative.title, files: files.length, format: `${doc.width}×${doc.height}`, campaign: camp?.name, creativeId: creative.id });
        onLog(`✓ ${creative.title} — ${files.length} PNG ${doc.width}×${doc.height} · pendiente de aprobación`);
      } else {
        const v = await saveVersion(creative, doc, { note: `BORRADOR · falta: ${spec.missing}` });
        const pend = post?.pending_info && !post.pending_info.includes(spec.missing) ? `${post.pending_info} · Diseño: ${spec.missing}` : (post?.pending_info || `Diseño: ${spec.missing}`);
        const patch = { pending_info: pend };
        if (post && (['idea', 'pending_prep'].includes(post.status) || (restyle && post.status === 'pending_approval'))) patch.status = 'in_design';
        check(await sb.from('posts').update(patch).eq('id', postId));
        out.drafts.push({ key, title: creative.title, missing: spec.missing, campaign: camp?.name, creativeId: creative.id, version: v.version_no });
        onLog(`… ${creative.title} — borrador editable guardado (falta: ${spec.missing})`);
      }
    } catch (e) { out.errors.push({ key, error: e.message }); onLog(`✗ ${key}: ${e.message}`); }
  }
  // Stories animadas: vídeo MP4 ya renderizado y publicado junto a la app (media/stories/…)
  let assets = null;
  for (const v of vkeys) {
    const postId = keyToId[v.key]; const post = postById[postId];
    if (!postId) { out.skipped.push({ key: v.key, why: 'La publicación del vídeo no está en el calendario (fecha pasada o no importada).' }); continue; }
    if (hasVideo.has(postId)) { out.skipped.push({ key: v.key, title: post?.title, why: 'Ya tiene su story animada (no se repite).' }); continue; }
    try {
      const res = await fetch(new URL('media/stories/' + v.file, document.baseURI).href);
      if (!res.ok) throw new Error(`no se encuentra el vídeo ${v.file} (HTTP ${res.status})`);
      const blob = await res.blob(); const mp4 = blob.type === 'video/mp4' ? blob : new Blob([blob], { type: 'video/mp4' });
      assets = assets || (await loadStoryAssets());
      const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; drawStory(cv.getContext('2d'), v.spec, 1.6, assets);
      const thumb = { v: 1, width: 1080, height: 1920, pages: [{ id: 'p', bg: '#000', layers: [{ id: 'i', type: 'image', x: 0, y: 0, w: 1080, h: 1920, ref: { kind: 'url', url: cv.toDataURL('image/jpeg', 0.8) }, visible: true, opacity: 1, rotation: 0 }] }] };
      const dur = storyDuration(v.spec), camp = campaignOf(v.key);
      const creative = { ...(await createCreative({ title: `Story animada · ${post?.title || v.key}`, category: 'video', campaign: camp?.name || null, format: 'video', width: 1080, height: 1920, pages: 1, template_key: 'story-animada', post_id: postId })), creative_versions: [] };
      const ver = await saveVersion(creative, { kind: 'story-motion', width: 1080, height: 1920, file: v.file, spec: v.spec }, { previewDoc: thumb,
        note: `Producción del plan de marketing · story animada MP4 (${dur.toFixed(1)} s)`, exports: [{ blob: mp4, page: 1, scale: 1, width: 1080, height: 1920, name: `story-1080x1920.mp4` }] });
      await addToLibrary(creative, ver);
      await linkToPost(creative, ver, postId, { requestApproval: true });
      out.videos.push({ key: v.key, title: creative.title, seconds: dur, creativeId: creative.id });
      onLog(`✓ ${creative.title} — MP4 1080×1920 · ${dur.toFixed(1)} s · pendiente de aprobación`);
    } catch (e) { out.errors.push({ key: v.key, error: e.message }); onLog(`✗ vídeo ${v.key}: ${e.message}`); }
  }
  await reloadAll();
  return out;
}
