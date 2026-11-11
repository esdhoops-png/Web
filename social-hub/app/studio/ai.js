// Cliente del módulo de imágenes con IA. Nunca simula: si el servidor no está configurado, lo dice.
import { sb } from '../lib/store.js';

let cached = null;
export async function aiStatus(force = false) {
  if (cached && !force) return cached;
  try {
    const { data, error } = await sb.functions.invoke('ai-image', { method: 'GET' });
    if (error) throw error;
    cached = { configured: !!data.configured, provider: data.provider, model: data.model, deployed: true };
  } catch (e) {
    cached = { configured: false, deployed: false, error: e?.message || String(e) };
  }
  return cached;
}
export async function generateImage(prompt, size) {
  const { data, error } = await sb.functions.invoke('ai-image', { body: { prompt, size } });
  if (error) { let m = error.message; try { m = (await error.context.json()).error || m; } catch {} throw new Error(m); }
  return data; // { path, width, height, provider, model }
}
