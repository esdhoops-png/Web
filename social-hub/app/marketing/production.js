// Ejecuta la producción de diseños del plan dentro de la app (con la sesión del usuario):
// plantilla → datos → render real → Storage → versión editable → vínculo a la publicación → «Pendiente de aprobación».
// Idempotente: si una publicación ya tiene un diseño del estudio, no lo repite. Si ese diseño lo hizo la propia producción con otra
// plantilla (estilo anterior) y nadie lo ha tocado, guarda una versión nueva con el estilo de los PSD.
import { sb, check, getState, reloadAll } from '../lib/store.js';
import { templateByKey, buildDoc } from '../studio/templates.js';
import { createCreative, updateCreative, saveVersion, renderExports, linkToPost, addToLibrary, studioAvailable } from '../studio/data.js';
import { DESIGNS } from './production-plan.js';
import { campaignOf } from './strategy.js';

const CAT = { artista: 'carteles', lista: 'carteles', 'tardeo-xl': 'eventos', finde: 'carruseles', mes: 'carruseles', 'story-hoy': 'stories', anuncio: 'carteles', 'navidad-menus': 'promociones', marca: 'marca', programacion: 'carteles', 'champions-partido': 'futbol', 'fotos-portada': 'carruseles' };

// Sin foto: no se dibuja el hueco punteado en los archivos finales
function finalize(doc) {
  for (const p of doc.pages) for (const l of p.layers) if (l.type === 'image' && !l.ref && l.placeholder !== false) l.visible = false;
  return doc;
}

export async function runProduction({ keyToId, onLog = () => {}, onlyKeys = null } = {}) {
  if (!(await studioAvailable(true))) throw new Error('El Estudio creativo no está activado: pega supabase/estudio.sql en Supabase antes de producir diseños.');
  const out = { generated: [], drafts: [], skipped: [], errors: [] };
  const keys = Object.keys(DESIGNS).filter((k) => !onlyKeys || onlyKeys.includes(k));
  // diseños ya existentes por publicación
  const ids = keys.map((k) => keyToId[k]).filter(Boolean);
  const existing = ids.length ? check(await sb.from('creatives').select('*, creative_versions(id, version_no, note)').in('post_id', ids)) : [];
  const byPost = Object.fromEntries(existing.map((c) => [c.post_id, c]));
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
  await reloadAll();
  return out;
}
