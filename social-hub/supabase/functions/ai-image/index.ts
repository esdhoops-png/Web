// Generación de imágenes con IA para el Estudio Creativo.
// La API key vive SOLO aquí (secreto de Supabase). Proveedores intercambiables:
//   AI_IMAGE_PROVIDER = openai | stability
//   OPENAI_API_KEY / STABILITY_API_KEY, AI_IMAGE_MODEL (opcional), AI_DAILY_LIMIT (opcional, por usuario, 25 por defecto)
// GET  → { configured, provider, model }        (sin generar nada)
// POST { prompt, size: 'square'|'portrait'|'landscape' } → { path, width, height, provider }
import { createClient } from 'npm:@supabase/supabase-js@2.81.1';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const PROVIDER = (Deno.env.get('AI_IMAGE_PROVIDER') ?? '').toLowerCase();
const KEYS: Record<string, string | undefined> = { openai: Deno.env.get('OPENAI_API_KEY'), stability: Deno.env.get('STABILITY_API_KEY') };
const configured = () => !!PROVIDER && !!KEYS[PROVIDER];

type Size = 'square' | 'portrait' | 'landscape';
interface Adapter { model: string; generate(prompt: string, size: Size): Promise<{ bytes: Uint8Array; width: number; height: number; mime: string }> }

const ADAPTERS: Record<string, () => Adapter> = {
  openai: () => {
    const model = Deno.env.get('AI_IMAGE_MODEL') || 'gpt-image-1';
    return { model, async generate(prompt, size) {
      const dims = { square: '1024x1024', portrait: '1024x1536', landscape: '1536x1024' }[size];
      const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST', headers: { Authorization: `Bearer ${KEYS.openai}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, size: dims, n: 1 })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || `OpenAI ${r.status}`);
      const b64 = j.data?.[0]?.b64_json;
      if (!b64) throw new Error('El proveedor no devolvió imagen');
      const [w, h] = dims.split('x').map(Number);
      return { bytes: Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), width: w, height: h, mime: 'image/png' };
    } };
  },
  stability: () => {
    const model = Deno.env.get('AI_IMAGE_MODEL') || 'core';
    return { model, async generate(prompt, size) {
      const ar = { square: '1:1', portrait: '9:16', landscape: '16:9' }[size];
      const fd = new FormData(); fd.append('prompt', prompt); fd.append('aspect_ratio', ar); fd.append('output_format', 'png');
      const r = await fetch(`https://api.stability.ai/v2beta/stable-image/generate/${model}`, { method: 'POST', headers: { Authorization: `Bearer ${KEYS.stability}`, Accept: 'image/*' }, body: fd });
      if (!r.ok) throw new Error(`Stability ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const bytes = new Uint8Array(await r.arrayBuffer());
      const [w, h] = { square: [1024, 1024], portrait: [768, 1344], landscape: [1344, 768] }[size];
      return { bytes, width: w, height: h, mime: 'image/png' };
    } };
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method === 'GET') return json({ configured: configured(), provider: configured() ? PROVIDER : null, model: configured() ? ADAPTERS[PROVIDER]?.().model : null });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  if (!configured() || !ADAPTERS[PROVIDER]) return json({ error: 'La generación de imágenes con IA no está configurada en el servidor.', configured: false }, 501);

  const url = Deno.env.get('SUPABASE_URL')!;
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }, auth: { persistSession: false } });
  const { data: u } = await asUser.auth.getUser();
  if (!u?.user) return json({ error: 'No autenticado' }, 401);
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: me } = await admin.from('profiles').select('active').eq('id', u.user.id).single();
  if (!me?.active) return json({ error: 'Sin acceso' }, 403);

  const { prompt, size = 'square' } = await req.json().catch(() => ({}));
  if (!prompt || String(prompt).trim().length < 5) return json({ error: 'Describe la imagen (mínimo 5 caracteres).' }, 400);
  const limit = Number(Deno.env.get('AI_DAILY_LIMIT') || 25);
  const since = new Date(Date.now() - 864e5).toISOString();
  const { count } = await admin.from('ai_images').select('id', { count: 'exact', head: true }).eq('created_by', u.user.id).gte('created_at', since);
  if ((count ?? 0) >= limit) return json({ error: `Límite diario alcanzado (${limit} imágenes).` }, 429);

  try {
    const ad = ADAPTERS[PROVIDER]();
    const out = await ad.generate(String(prompt).slice(0, 2000), (['square', 'portrait', 'landscape'].includes(size) ? size : 'square') as Size);
    const d = new Date();
    const path = `ai/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.png`;
    const up = await admin.storage.from('hub').upload(path, out.bytes, { contentType: out.mime });
    if (up.error) throw up.error;
    await admin.from('ai_images').insert({ prompt, provider: PROVIDER, model: ad.model, storage_path: path, width: out.width, height: out.height, created_by: u.user.id });
    return json({ path, width: out.width, height: out.height, provider: PROVIDER, model: ad.model });
  } catch (e) {
    return json({ error: (e as Error).message }, 502);
  }
});
