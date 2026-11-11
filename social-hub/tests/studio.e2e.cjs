// E2E del Estudio Creativo contra Supabase: plantillas, edición, versiones, exportación real (PNG/JPG/ZIP),
// archivos en Storage, vínculo con el calendario, aprobación, plantillas reutilizables, IA sin configurar y vídeo.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createClient } = require('@supabase/supabase-js');

const APP = process.env.APP_URL || 'http://127.0.0.1:5173/';
const URL_SB = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SHOTS = process.env.SHOTS || '.';
const cfg = `window.HUB_CONFIG={supabaseUrl:'${URL_SB}',supabaseAnonKey:'${process.env.SUPABASE_ANON_KEY}',googleClientId:'',vapidPublicKey:''}`;
const admin = createClient(URL_SB, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
let n = 0;
const step = async (name, fn) => { const t = Date.now(); await fn(); n++; console.log(`  ✓ ${name} (${Date.now() - t} ms)`); };

async function login(ctx, email) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.error('pageerror:', e.message));
  await p.route('**/config.js', (r) => r.fulfill({ contentType: 'application/javascript', body: cfg }));
  await p.goto(APP);
  await p.fill('input[type=email]', email); await p.fill('input[type=password]', 'Prueba-1234');
  await p.click('form button.primary'); await p.waitForSelector('.kpis', { timeout: 15000 });
  return p;
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 }, acceptDownloads: true });
  const ownerCtx = await browser.newContext({ viewport: { width: 1300, height: 900 } });
  console.log('E2E Estudio Creativo');
  const mk = await login(ctx, 'marketing@test.local');
  const ow = await login(ownerCtx, 'propietario@test.local');

  // publicación del calendario para vincular
  const { data: post } = await admin.from('posts').insert({ kind: 'champions', title: 'Champions · miércoles (E2E estudio)', starts_at: '2026-11-25T20:00:00Z', status: 'in_design',
    created_by: (await admin.from('profiles').select('id').eq('email', 'marketing@test.local').single()).data.id }).select().single();

  await step('plantillas de marca: se listan y se renderizan sus vistas previas', async () => {
    await mk.goto(APP + '#/estudio?tab=plantillas');
    await mk.waitForSelector('.tpl:has-text("Champions · Partido")');
    await mk.waitForFunction(() => document.querySelectorAll('.tpl-prev img').length >= 8, null, { timeout: 20000 });
    await mk.screenshot({ path: `${SHOTS}/s-plantillas.png` });
  });

  await step('instrucción escrita → propuesta visual con foto y hueco de horario', async () => {
    await mk.goto(APP + '#/estudio?tab=crear');
    await mk.fill('.card.hero textarea', 'Quiero un cartel para anunciar el partido de Champions del miércoles: Barça contra Inter. Utiliza el estilo de nuestros carteles anteriores, incorpora esta fotografía y deja espacio para el horario.');
    await mk.click('button:has-text("Interpretar instrucción")');
    await mk.waitForSelector('text=Champions · Partido (pantalla partida VS)');
    await mk.waitForSelector('text=He dejado el horario como hueco');
    await mk.click('button:has-text("Crear la propuesta visual")');
    await mk.click('.seg button:has-text("Subir archivo")');
    await mk.setInputFiles('.modal input[type=file]', `${__dirname}/../icons/icon-512.png`);
    await mk.waitForSelector('.studio canvas', { timeout: 20000 });
    const hasVal = (v) => mk.waitForFunction((v) => [...document.querySelectorAll('.studio input, .studio textarea')].some((i) => i.value === v), v, { timeout: 15000 });
    await hasVal('BARÇA'); await hasVal('INTER'); await hasVal('[HORA] H');
    await mk.waitForTimeout(800);
    await mk.screenshot({ path: `${SHOTS}/s-editor-propuesta.png` });
  });

  await step('editar elementos: texto, color, posición y añadir capa', async () => {
    await mk.fill('.studio-title', 'Champions Barça–Inter (E2E)');
    await mk.click('.layer-row:has-text("Equipo visitante")');
    await mk.fill('.studio-side textarea >> nth=-1', 'INTER');
    await mk.locator('.studio-side textarea >> nth=-1').blur();
    await mk.click('.chip:has-text("+ Texto")');
    await mk.waitForSelector('.layer-row.on:has-text("Texto")');
    const box = await mk.locator('.stage').boundingBox();
    await mk.mouse.move(box.x + box.width / 2, box.y + box.height * 0.45); await mk.mouse.down();
    await mk.mouse.move(box.x + box.width / 2 + 40, box.y + box.height * 0.45 + 60, { steps: 6 }); await mk.mouse.up();
    await mk.locator('.studio-side .swatch[title="#7CFFB0"]').first().click();
    await mk.waitForSelector('text=Sin guardar');
  });

  let creativeId;
  await step('guardar versión 1 (documento editable + miniatura en Storage)', async () => {
    await mk.click('button:has-text("Guardar versión")');
    await mk.waitForSelector('.toast:has-text("Versión 1 guardada")', { timeout: 20000 });
    creativeId = new URLSearchParams(mk.url().split('?')[1]).get('c');
    const { data: v } = await admin.from('creative_versions').select('*').eq('creative_id', creativeId);
    assert.equal(v.length, 1); assert.ok(v[0].preview_path);
    assert.ok(JSON.stringify(v[0].doc).includes('INTER'));
    const { data: f } = await admin.storage.from('hub').download(v[0].preview_path); assert.ok(f.size > 1000);
  });

  await step('exportar PNG real y descargarlo', async () => {
    await mk.click('button:has-text("Exportar")');
    const [dl] = await Promise.all([mk.waitForEvent('download'), mk.click('.modal button:has-text("Solo descargar")')]);
    const path = `${SHOTS}/export-${dl.suggestedFilename()}`; await dl.saveAs(path);
    const buf = fs.readFileSync(path); assert.equal(buf.slice(1, 4).toString(), 'PNG');
    assert.equal(buf.readUInt32BE(16), 1080); assert.equal(buf.readUInt32BE(20), 1350);
    await mk.click('.modal-head button[aria-label="Cerrar"]');
  });

  await step('exportar JPG ×2, guardar versión 2 en Storage y vincular a la publicación con aprobación', async () => {
    await mk.click('button:has-text("Exportar")');
    await mk.click('.modal .seg button:has-text("JPG")');
    await mk.click('.modal .seg button:has-text("2160×2700")');
    await mk.waitForSelector(`.modal select option[value="${post.id}"]`, { state: 'attached', timeout: 10000 });
    await mk.selectOption('.modal select', post.id);
    await mk.check('.modal label:has-text("Enviar a aprobación") input');
    await mk.click('.modal button:has-text("Guardar versión y exportar")');
    await mk.waitForSelector('.toast:has-text("Vinculado a la publicación")', { timeout: 30000 });
    const { data: v } = await admin.from('creative_versions').select('*').eq('creative_id', creativeId).order('version_no');
    assert.equal(v.length, 2); assert.equal(v[1].exports[0].width, 2160); assert.equal(v[1].exports[0].type, 'image/jpeg');
    const { data: f } = await admin.storage.from('hub').download(v[1].exports[0].path);
    const b = Buffer.from(await f.arrayBuffer()); assert.equal(b[0], 0xff); assert.equal(b[1], 0xd8);
    const { data: p } = await admin.from('posts').select('status').eq('id', post.id).single(); assert.equal(p.status, 'pending_approval');
    const { data: att } = await admin.from('attachments').select('*').eq('post_id', post.id).not('creative_version_id', 'is', null); assert.equal(att.length, 1);
    const { data: lib } = await admin.from('library_items').select('*').like('storage_path', `%${creativeId}%`); assert.ok(lib.length >= 1);
  });

  await step('el propietario recibe el aviso y ve el diseño en la publicación', async () => {
    await ow.waitForSelector('.toast:has-text("Aprobación pendiente")', { timeout: 10000 });
    await ow.goto(APP + '#/publicaciones/' + post.id);
    await ow.waitForSelector('.media img'); await ow.waitForSelector('button:has-text("Editar en el Estudio")');
  });

  await step('editar de nuevo desde la publicación → versión 3 y las anteriores se conservan', async () => {
    await mk.goto(APP + '#/publicaciones/' + post.id);
    await mk.click('button:has-text("Editar en el Estudio")');
    await mk.waitForSelector('.studio canvas');
    await mk.click('.layer-row:has-text("Equipo local")');
    await mk.fill('.studio-side textarea >> nth=-1', 'FC BARCELONA'); await mk.locator('.studio-side textarea >> nth=-1').blur();
    await mk.click('button:has-text("Guardar versión")');
    await mk.waitForSelector('.toast:has-text("Versión 3 guardada")', { timeout: 20000 });
    await mk.click('button:has-text("Versiones")');
    await mk.waitForSelector('.modal .media:has-text("Versión 1")'); await mk.waitForSelector('.modal .media:has-text("Versión 3")');
    await mk.click('.modal .media:has-text("Versión 1") button:has-text("Abrir y editar")');
    await mk.waitForSelector('.toast:has-text("Abierta la versión 1")');
  });

  await step('cambiar a formato story 1080×1920 y exportar ZIP de carrusel (varias diapositivas)', async () => {
    await mk.selectOption('.studio-top select >> nth=1', 'story');
    await mk.waitForSelector('text=1080×1920 px');
    await mk.click('.chip:has-text("+ Diapositiva")');
    await mk.waitForSelector('text=2 diapositiva(s)');
    await mk.click('button:has-text("Exportar")');
    const [dl] = await Promise.all([mk.waitForEvent('download'), mk.click('.modal button:has-text("Solo descargar")')]);
    const path = `${SHOTS}/export-${dl.suggestedFilename()}`; await dl.saveAs(path);
    const buf = fs.readFileSync(path); assert.equal(buf.readUInt32LE(0), 0x04034b50);
    assert.equal(buf.readUInt16LE(buf.length - 22 + 10), 2, 'el ZIP lleva 2 archivos');
    await mk.click('.modal-head button[aria-label="Cerrar"]');
  });

  await step('guardar como plantilla y reutilizarla', async () => {
    await mk.click('button:has-text("Guardar como plantilla")');
    await mk.waitForSelector('.toast:has-text("Guardado como plantilla reutilizable")', { timeout: 20000 });
    await mk.goto(APP + '#/estudio?tab=plantillas');
    await mk.waitForSelector('.tpl:has-text("Champions Barça–Inter (E2E)") button:has-text("Usar")', { timeout: 15000 });
    await mk.click('.tpl:has-text("Champions Barça–Inter (E2E)") button:has-text("Usar")');
    await mk.waitForSelector('.studio canvas'); await mk.waitForSelector('text=1080×1920 px');
  });

  await step('diseños originales verificados (planos marcados sin capas)', async () => {
    await mk.goto(APP + '#/estudio?tab=originales');
    await mk.waitForSelector('.tpl:has-text("cartel-halloween-31-octubre.png") :text("imagen plana (sin capas)")');
    await mk.waitForSelector('text=«Tipos de personas» es un carrusel de Volcán');
    await mk.screenshot({ path: `${SHOTS}/s-originales.png` });
  });

  await step('IA sin configurar: lo dice y no simula resultados', async () => {
    await mk.goto(APP + '#/estudio?tab=ia');
    await mk.waitForSelector('text=necesita configuración', { timeout: 20000 });
    await mk.waitForSelector('text=No se simula ningún resultado');
  });

  await step('vídeo: escenas con foto, exportación real y guardado en Storage', async () => {
    await mk.goto(APP + '#/estudio?tab=video');
    await mk.click('button:has-text("Reel / story 9:16")');
    await mk.click('button:has-text("Añadir fotos/vídeos")');
    await mk.click('.seg button:has-text("Subir archivo")');
    await mk.setInputFiles('.modal input[type=file]', [`${__dirname}/../icons/icon-512.png`]);
    await mk.waitForSelector('text=Escena 1');
    await mk.fill('.scene input >> nth=0', 'ASÍ FUE LA NOCHE');
    await mk.fill('.scene input[type=number] >> nth=0', '1.5');
    const [dl] = await Promise.all([mk.waitForEvent('download', { timeout: 60000 }), mk.click('button:has-text("Exportar vídeo")')]);
    const path = `${SHOTS}/export-${dl.suggestedFilename()}`; await dl.saveAs(path);
    const buf = fs.readFileSync(path); assert.ok(buf.length > 10000, 'vídeo con contenido');
    const isMp4 = buf.slice(4, 8).toString() === 'ftyp'; const isWebm = buf.readUInt32BE(0) === 0x1a45dfa3; assert.ok(isMp4 || isWebm);
    console.log(`    (formato de vídeo: ${isMp4 ? 'MP4' : 'WebM'}, ${buf.length} bytes)`);
    await mk.waitForSelector('.toast:has-text("Vídeo exportado y guardado")', { timeout: 30000 });
    const { data: c } = await admin.from('creatives').select('*, creative_versions(*)').eq('category', 'video');
    assert.ok(c[0].creative_versions[0].exports[0].path);
  });

  await step('permisos: un anónimo no ve diseños', async () => {
    const anon = createClient(URL_SB, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data } = await anon.from('creatives').select('id'); assert.equal((data || []).length, 0);
  });

  console.log(`\n${n} pasos del estudio superados`);
  await browser.close();
})().catch((e) => { console.error('\n✗ FALLO:', e.message); process.exit(1); });
