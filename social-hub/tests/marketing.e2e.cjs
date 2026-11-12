// E2E del Plan de marketing: ejecuta el plan en la app y comprueba en la base de datos y en Storage
// que se han creado publicaciones sin duplicar, diseños reales, borradores pendientes y aprobaciones.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createClient } = require('@supabase/supabase-js');
const APP = process.env.APP_URL || 'http://127.0.0.1:5173/';
const URL_SB = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SHOTS = process.env.SHOTS || '.';
const cfg = `window.HUB_CONFIG={supabaseUrl:'${URL_SB}',supabaseAnonKey:'${process.env.SUPABASE_ANON_KEY}',googleClientId:'',vapidPublicKey:''}`;
const admin = createClient(URL_SB, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
let n = 0; const step = async (name, fn) => { const t = Date.now(); await fn(); n++; console.log(`  ✓ ${name} (${Math.round((Date.now() - t) / 1000)} s)`); };

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.error('pageerror', e.message));
  await p.route('**/config.js', (r) => r.fulfill({ contentType: 'application/javascript', body: cfg }));
  await p.goto(APP); await p.fill('input[type=email]', 'marketing@test.local'); await p.fill('input[type=password]', 'Prueba-1234');
  await p.click('form button.primary'); await p.waitForSelector('.kpis');
  console.log('E2E Plan de marketing');
  // una publicación creada «a mano» antes, que coincide con una del plan: no debe duplicarse
  const mkId = (await admin.from('profiles').select('id').eq('email', 'marketing@test.local').single()).data.id;
  await admin.from('posts').insert({ kind: 'weekly_poster', title: 'Cartel del Tardeo de Navidad', starts_at: '2026-12-20T10:00:00Z', created_by: mkId, status: 'idea' });

  let firstGen;
  await step('ejecutar el plan: importa, produce diseños y deja pendientes de aprobación', async () => {
    await p.goto(APP + '#/marketing?tab=ejecucion');
    await p.click('button:has-text("Ejecutar plan de marketing")');
    await p.click('.modal-foot button.primary:has-text("Ejecutar")');
    await p.waitForSelector('.toast:has-text("Plan ejecutado")', { timeout: 300000 });
    const { data: cr0 } = await admin.from('creatives').select('id, post_id, title, category, creative_versions(exports, doc)');
    const vids = cr0.filter((c) => c.category === 'video'); const cr = cr0.filter((c) => c.category !== 'video');
    const gen = cr.filter((c) => c.creative_versions.some((v) => v.exports.length));
    const drafts = cr.filter((c) => !c.creative_versions.some((v) => v.exports.length));
    firstGen = gen.length;
    console.log(`    diseños con archivo: ${gen.length} · borradores: ${drafts.length} · stories animadas: ${vids.length}`);
    assert.equal(vids.length, 22, 'deberían adjuntarse las 22 stories animadas');
    for (const c of vids.slice(0, 3)) { const e = c.creative_versions[0].exports[0]; const { data } = await admin.storage.from('hub').download(e.path); const buf = Buffer.from(await data.arrayBuffer());
      assert.equal(buf.slice(4, 8).toString(), 'ftyp', e.path); assert.ok(buf.length > 500000); }
    const vposts = (await admin.from('posts').select('id, status').in('id', vids.map((c) => c.post_id))).data;
    assert.ok(vposts.every((x) => x.status === 'pending_approval'));
    assert.ok(gen.length >= 25, 'debería haber al menos 25 diseños generados');
    // todos los archivos existen en Storage y son PNG
    for (const c of gen.slice(0, 40)) for (const v of c.creative_versions) for (const e of v.exports) {
      const { data } = await admin.storage.from('hub').download(e.path); const buf = Buffer.from(await data.arrayBuffer());
      assert.equal(buf.slice(1, 4).toString(), 'PNG', e.path);
    }
    // vinculados y pendientes de aprobación; nada publicado
    const { data: posts } = await admin.from('posts').select('id, status, title, import_key');
    for (const c of gen) { const po = posts.find((x) => x.id === c.post_id); assert.equal(po.status, 'pending_approval', po.title); }
    assert.equal(posts.filter((x) => x.status === 'published').length, 0);
    // no se duplicó la publicación creada a mano
    assert.equal(posts.filter((x) => /tardeo de navidad/i.test(x.title) && x.title.startsWith('Cart')).length, 1);
    // ninguna fecha anterior a hoy importada
    const { data: old } = await admin.from('posts').select('id').lt('starts_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()).like('import_key', 'p%');
    assert.equal(old.length, 0);
    // los borradores dejan la información pendiente visible
    const draftPosts = posts.filter((x) => drafts.some((d) => d.post_id === x.id));
    const { data: dp } = await admin.from('posts').select('pending_info').in('id', draftPosts.map((x) => x.id));
    assert.ok(dp.every((x) => x.pending_info && x.pending_info.length > 3));
    // aprobaciones solicitadas y avisos al propietario
    const { data: ap } = await admin.from('approvals').select('id').eq('decision', 'requested');
    assert.ok(ap.length >= gen.length);
    // biblioteca
    const { data: lib } = await admin.from('library_items').select('id').like('storage_path', 'studio/%');
    assert.ok(lib.length >= gen.length);
  });

  await step('repetir la ejecución no duplica publicaciones ni diseños', async () => {
    const before = (await admin.from('posts').select('id', { count: 'exact', head: true })).count;
    await p.goto(APP + '#/inicio'); await p.waitForSelector('.kpis');
    await p.goto(APP + '#/marketing?tab=ejecucion');
    await p.click('button:has-text("Ejecutar plan de marketing")');
    await p.click('.modal-foot button.primary:has-text("Ejecutar")');
    await p.waitForSelector('.toast:has-text("Plan ejecutado")', { timeout: 300000 });
    const after = (await admin.from('posts').select('id', { count: 'exact', head: true })).count;
    assert.equal(after, before);
    const { data: cr } = await admin.from('creatives').select('id, category, creative_versions(exports)');
    assert.equal(cr.filter((c) => c.category !== 'video' && c.creative_versions.some((v) => v.exports.length)).length, firstGen);
    assert.equal(cr.filter((c) => c.category === 'video').length, 22);
    await p.screenshot({ path: `${SHOTS}/m-ejecucion.png`, fullPage: true });
  });

  await step('los diseños hechos con el estilo anterior se rehacen con el de los PSD (solo si nadie los tocó)', async () => {
    const { data: cr } = await admin.from('creatives').select('id, template_key, creative_versions(id, note)').eq('template_key', 'artista').limit(2);
    const [a, b] = cr;
    await admin.from('creatives').update({ template_key: 'story-hoy' }).in('id', [a.id, b.id]);
    // b ha sido retocado a mano: no se debe tocar
    const docB = (await admin.from('creative_versions').select('doc, preview_path').eq('creative_id', b.id).limit(1).single()).data;
    await admin.from('creative_versions').insert({ creative_id: b.id, doc: docB.doc, preview_path: docB.preview_path, exports: [], note: 'Retoque a mano' });
    await p.goto(APP + '#/inicio'); await p.waitForSelector('.kpis');
    await p.goto(APP + '#/marketing?tab=ejecucion');
    await p.click('button:has-text("Ejecutar plan de marketing")');
    await p.click('.modal-foot button.primary:has-text("Ejecutar")');
    await p.waitForSelector('.toast:has-text("Plan ejecutado")', { timeout: 300000 });
    const A = (await admin.from('creatives').select('template_key, creative_versions(id)').eq('id', a.id).single()).data;
    const B = (await admin.from('creatives').select('template_key, creative_versions(id)').eq('id', b.id).single()).data;
    assert.equal(A.template_key, 'artista'); assert.equal(A.creative_versions.length, a.creative_versions.length + 1);
    assert.equal(B.template_key, 'story-hoy'); assert.equal(B.creative_versions.length, b.creative_versions.length + 1);
  });

  await step('panel de control con datos reales', async () => {
    await p.goto(APP + '#/marketing?tab=panel'); await p.waitForSelector('text=Calendario planificado');
    await p.screenshot({ path: `${SHOTS}/m-panel.png` });
    await p.goto(APP + '#/marketing?tab=auditoria'); await p.waitForSelector('text=Fuentes analizadas'); await p.screenshot({ path: `${SHOTS}/m-auditoria.png`, fullPage: true });
    await p.goto(APP + '#/marketing?tab=campanas'); await p.waitForSelector('text=Navidad en grupo');
  });

  // descargar los diseños generados para revisarlos
  const { data: cr } = await admin.from('creatives').select('title, creative_versions(exports)');
  const dir = `${SHOTS}/disenos`; fs.mkdirSync(dir, { recursive: true });
  for (const c of cr) for (const v of c.creative_versions) for (const e of v.exports) {
    const { data } = await admin.storage.from('hub').download(e.path);
    fs.writeFileSync(`${dir}/${c.title.replace(/[^\w]+/g, '_').slice(0, 60)}-p${e.page}.png`, Buffer.from(await data.arrayBuffer()));
  }
  console.log(`\n${n} pasos superados`); await b.close();
})().catch((e) => { console.error('\n✗ FALLO:', e.message); process.exit(1); });
