// Prueba E2E real: dos navegadores a la vez (marketing en ordenador, propietario en móvil)
// contra Supabase. Comprueba importación del plan, flujo de aprobación, tiempo real, chat,
// tareas Kanban, calendario y persistencia tras cerrar sesión.
// Uso: SUPABASE_ANON_KEY=... APP_URL=http://127.0.0.1:5173/ SHOTS=dir node e2e.cjs
const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const APP = process.env.APP_URL || 'http://127.0.0.1:5173/';
const SHOTS = process.env.SHOTS || '.';
const cfg = `window.HUB_CONFIG={supabaseUrl:'${process.env.SUPABASE_URL || 'http://127.0.0.1:54321'}',supabaseAnonKey:'${process.env.SUPABASE_ANON_KEY}',googleClientId:'',vapidPublicKey:''}`;
let n = 0;
const step = async (name, fn) => { const t = Date.now(); await fn(); n++; console.log(`  ✓ ${name} (${Date.now() - t} ms)`); };

async function login(ctx, email, label) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.error(`[${label}] pageerror:`, e.message));
  p.on('console', (m) => m.type() === 'error' && !/Failed to load resource|favicon/.test(m.text()) && console.error(`[${label}]`, m.text()));
  await p.route('**/config.js', (r) => r.fulfill({ contentType: 'application/javascript', body: cfg }));
  await p.goto(APP);
  await p.fill('input[type=email]', email); await p.fill('input[type=password]', 'Prueba-1234');
  await p.click('form button.primary');
  await p.waitForSelector('.kpis', { timeout: 15000 });
  await p.waitForFunction(() => document.body.innerText.includes('Sincronizado en tiempo real'), null, { timeout: 15000 });
  return p;
}
const shot = (p, name) => p.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const phone = await browser.newContext({ ...devices['iPhone 13'] });
  console.log('E2E 5 Mentarios Social Hub');
  const mk = await login(desk, 'marketing@test.local', 'marketing');
  const ow = await login(phone, 'propietario@test.local', 'propietario');

  await step('existe un plan v1 anterior (uno sin tocar y otro ya editado)', async () => {
    const { createClient } = require('@supabase/supabase-js');
    const c = createClient(process.env.SUPABASE_URL || 'http://127.0.0.1:54321', process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await c.auth.signInWithPassword({ email: 'marketing@test.local', password: 'Prueba-1234' });
    const { data } = await c.from('posts').insert([{ import_key: 'plan-2026-viejo-intacto', title: 'V1 intacto', kind: 'post', starts_at: '2026-11-20T12:00:00Z' },
      { import_key: 'plan-2026-viejo-editado', title: 'V1 editado', kind: 'post', starts_at: '2026-11-21T12:00:00Z' }]).select();
    await new Promise((r) => setTimeout(r, 2500));
    await c.from('posts').update({ copy: 'cambiado a mano' }).eq('id', data[1].id);
    global.__v1 = data;
  });

  await step('marketing importa el calendario editorial (11 nov – 31 dic)', async () => {
    await mk.goto(APP + '#/ajustes?tab=editorial');
    await mk.click('button:has-text("Actualizar al plan v2")');
    await mk.click('.modal-foot button.primary:has-text("Importar")');
    await mk.waitForSelector('.toast:has-text("Calendario importado")', { timeout: 20000 });
    await mk.waitForSelector('.toast:has-text("1 del plan anterior sustituidos")');
    await mk.waitForSelector('.toast:has-text("1 del plan anterior se conservan")');
  });

  await step('el propietario ve el calendario importado en su móvil sin recargar', async () => {
    await ow.goto(APP + '#/calendario?v=list');
    await ow.waitForSelector('text=Así fue Halloween', { timeout: 10000 });
    await shot(ow, 'm-calendario-lista');
  });

  await step('vista mensual, semanal y diaria en ordenador', async () => {
    await mk.goto(APP + '#/calendario?v=month&d=2026-11-12'); await mk.waitForSelector('.month .ev'); await shot(mk, 'd-calendario-mes');
    await mk.goto(APP + '#/calendario?v=week&d=2026-11-23'); await mk.waitForSelector('.week .ev'); await shot(mk, 'd-calendario-semana');
    await mk.goto(APP + '#/calendario?v=day&d=2026-11-24'); await mk.waitForSelector('.timeline .ev'); await shot(mk, 'd-calendario-dia');
  });

  await step('arrastrar una publicación a otro día cambia la fecha (y avisa al propietario)', async () => {
    await mk.goto(APP + '#/calendario?v=week&d=2026-11-16');
    const ev = mk.locator('.week-col .ev', { hasText: 'Monólogos con Saúl Romero (jue 19)' });
    await ev.waitFor();
    const target = mk.locator('.week-col').nth(3); // jueves 19
    await ev.dragTo(target);
    await mk.waitForSelector('.toast:has-text("Fecha cambiada")');
    await ow.waitForSelector('.toast:has-text("Fecha modificada")', { timeout: 10000 });
  });

  let postUrl;
  await step('marketing crea una publicación con el formulario (validación incluida)', async () => {
    await mk.goto(APP + '#/publicaciones');
    await mk.click('button:has-text("Nueva publicación")');
    await mk.click('.modal-foot button.primary:has-text("Crear")');
    await mk.waitForSelector('.error-text:has-text("Pon un nombre")');
    await mk.click('.chip:has-text("Cartel semanal")');
    await mk.fill('.modal input[placeholder^="Ej.: Cartel"]', 'Cartel semanal E2E · finde 21-22 nov');
    await mk.fill('.modal input[type=datetime-local]', '2026-11-19T13:00');
    await mk.fill('.modal textarea[placeholder^="Gancho"]', 'Este finde en 5mentarios 🎶');
    await mk.fill('.modal input[placeholder^="#Arucas"]', '#Arucas #GranCanaria');
    await mk.selectOption('.modal select >> nth=0', 'in_design');
    await mk.click('.modal-foot button.primary:has-text("Crear")');
    await mk.waitForURL(/#\/publicaciones\/[0-9a-f-]+/);
    postUrl = mk.url();
    await mk.waitForSelector('h1:has-text("Cartel semanal E2E")');
  });

  await step('subir versión 1 del diseño (archivo real a Storage) → aviso al propietario', async () => {
    await mk.click('button:has-text("Subir nueva versión")');
    await mk.click('.seg button:has-text("Subir archivo")');
    await mk.setInputFiles('.modal input[type=file]', `${__dirname}/../icons/icon-512.png`);
    await mk.fill('.modal input[placeholder^="Horario"]', 'Primera versión');
    await mk.click('.modal-foot button.primary:has-text("Subir versión")');
    await mk.waitForSelector('.toast:has-text("Versión 1 subida")');
    await mk.waitForSelector('.media img');
    await ow.waitForSelector('.toast:has-text("Nuevo diseño")', { timeout: 10000 });
  });

  await step('marketing NO tiene botón de aprobar; solicita aprobación', async () => {
    assert.equal(await mk.locator('button:has-text("Aprobar")').count(), 0);
    await mk.click('button:has-text("Solicitar aprobación")');
    await mk.waitForSelector('.approval-box:has-text("Pendiente de aprobación")');
    await ow.waitForSelector('.toast:has-text("Aprobación pendiente")', { timeout: 10000 });
  });

  await step('propietario (móvil) abre la notificación, pide cambios con comentario', async () => {
    await ow.goto(APP + '#/notificaciones');
    await ow.click('.notif:has-text("Aprobación pendiente")');
    await ow.waitForSelector('h1:has-text("Cartel semanal E2E")');
    await shot(ow, 'm-aprobacion');
    await ow.click('button:has-text("Pedir cambios")');
    await ow.fill('.modal textarea', 'Me gusta, pero cambiaría el horario');
    await ow.click('.modal-foot button:has-text("Enviar cambios")');
    await ow.waitForSelector('.toast:has-text("Cambios solicitados")');
    await mk.waitForSelector('.toast:has-text("Cambios solicitados")', { timeout: 10000 });
  });

  await step('comentarios en la publicación en tiempo real (ida y vuelta)', async () => {
    await ow.fill('textarea[placeholder="Escribe un comentario…"]', '¿Puedes poner las 22:30?');
    await ow.click('button:has-text("Comentar")');
    await mk.waitForSelector('text=¿Puedes poner las 22:30?', { timeout: 10000 });
    await mk.fill('textarea[placeholder="Escribe un comentario…"]', 'Hecho, subo la versión 2');
    await mk.click('button:has-text("Comentar")');
    await ow.waitForSelector('text=Hecho, subo la versión 2', { timeout: 10000 });
  });

  await step('versión 2 + nueva solicitud → propietario aprueba → registro de quién y cuándo', async () => {
    await mk.click('button:has-text("Subir nueva versión")');
    await mk.click('.seg button:has-text("Subir archivo")');
    await mk.setInputFiles('.modal input[type=file]', `${__dirname}/../icons/icon-192.png`);
    await mk.fill('.modal input[placeholder^="Horario"]', 'Horario corregido');
    await mk.click('.modal-foot button.primary:has-text("Subir versión")');
    await mk.waitForSelector('.toast:has-text("Versión 2 subida")');
    await mk.click('button:has-text("Solicitar aprobación")');
    await ow.waitForSelector('.approval-box button:has-text("Aprobar")', { timeout: 10000 });
    await ow.click('.approval-box button:has-text("Aprobar")');
    await ow.click('.modal-foot button.primary:has-text("Aprobar")');
    await ow.waitForSelector('.toast:has-text("Aprobada")');
    await mk.waitForSelector('.pill:has-text("Aprobado")', { timeout: 10000 });
    await mk.waitForSelector('text=Versiones anteriores (1)');
    await mk.waitForSelector('.tv-item:has-text("Aprobado")');
    await shot(mk, 'd-publicacion-aprobada');
  });

  await step('programar y marcar como publicada (con confirmación)', async () => {
    await mk.click('button:has-text("Marcar como programada")');
    await mk.waitForSelector('.pill:has-text("Programado")');
    await mk.click('button:has-text("Marcar como publicada")');
    await mk.fill('.modal input', 'https://www.instagram.com/p/prueba');
    await mk.click('.modal-foot button.primary');
    await mk.waitForSelector('.pill:has-text("Publicado")');
  });

  await step('crear tareas diseño/copy/aprobación desde la publicación', async () => {
    await mk.click('button:has-text("Crear tareas: diseño, copy y aprobación")');
    await mk.waitForSelector('.toast:has-text("3 tareas creadas")');
    await ow.waitForSelector('.toast:has-text("Aprobación · Cartel semanal E2E")', { timeout: 10000 });
  });

  await step('Kanban: arrastrar tarea a «Completada» y el propietario lo ve', async () => {
    await mk.goto(APP + '#/tareas');
    await mk.click('.seg button:has-text("Kanban")');
    const card = mk.locator('.kcard', { hasText: 'Diseño · Cartel semanal E2E' });
    await card.dragTo(mk.locator('.kcol').nth(3));
    await mk.waitForSelector('.toast:has-text("Tarea completada")');
    await shot(mk, 'd-kanban');
    await ow.goto(APP + '#/actividad');
    await ow.waitForSelector('text=ha completado la tarea «Diseño · Cartel semanal E2E', { timeout: 10000 });
  });

  await step('el propietario añade un evento desde el móvil → aviso en el ordenador', async () => {
    await ow.goto(APP + '#/calendario');
    await ow.click('button:has-text("Evento")');
    await ow.fill('.modal input[placeholder^="Ej.: Cartel"]', 'Reunión con proveedor de Heineken (E2E)');
    await ow.fill('.modal input[type=datetime-local]', '2026-11-18T11:00');
    await ow.click('.modal-foot button.primary:has-text("Crear")');
    await mk.waitForSelector('.toast:has-text("Nuevo evento")', { timeout: 10000 });
  });

  await step('chat en tiempo real con imagen, respuesta y «leído»', async () => {
    await mk.goto(APP + '#/chat');
    await mk.fill('.composer textarea', 'Hola, te he dejado el cartel del finde aprobado ✅');
    await mk.keyboard.press('Enter');
    await ow.waitForSelector('.toast:has-text("Mensaje de")', { timeout: 10000 });
    await ow.goto(APP + '#/chat');
    await ow.waitForSelector('.bubble:has-text("te he dejado el cartel")');
    await mk.waitForSelector('.read-mark:has-text("Leído")', { timeout: 10000 });
    await ow.click('.composer button[title^="Adjuntar"]');
    await ow.setInputFiles('.modal input[type=file]', `${__dirname}/../icons/icon-192.png`);
    await ow.waitForSelector('.composer .att-row');
    await ow.fill('.composer textarea', 'Perfecto, mira esta foto https://www.instagram.com/heineken5mentarios/');
    await ow.click('.composer button[aria-label="Enviar"]');
    await mk.waitForSelector('.bubble:has-text("Perfecto, mira esta foto") a[href*="instagram"]', { timeout: 10000 });
    await mk.waitForSelector('.bubble img.chat-img', { timeout: 10000 });
    await shot(mk, 'd-chat'); await shot(ow, 'm-chat');
  });

  await step('buscador general encuentra publicaciones, tareas y mensajes', async () => {
    await mk.goto(APP + '#/buscar?q=cartel');
    await mk.waitForSelector('h2:has-text("Publicaciones y eventos")');
    await mk.waitForSelector('h2:has-text("Tareas")');
    await mk.waitForSelector('h2:has-text("Mensajes y comentarios")', { timeout: 10000 });
  });

  await step('biblioteca con las referencias de Drive del plan (sin duplicar archivos)', async () => {
    await mk.goto(APP + '#/biblioteca');
    await mk.waitForSelector('.cat-list button:has-text("Champions League")');
    await mk.click('.cat-list button:has-text("Champions League")');
    await mk.waitForSelector('.media:has-text("champions-01-portada-jugadores.png")');
    await shot(mk, 'd-biblioteca');
  });

  await step('preferencias: el propietario desactiva avisos de chat', async () => {
    await ow.goto(APP + '#/ajustes?tab=notificaciones');
    await ow.locator('label:has-text("Mensajes del chat") .switch i').click();
    await ow.waitForTimeout(800);
    await mk.goto(APP + '#/chat');
    await mk.fill('.composer textarea', 'Este no debería avisar');
    await mk.keyboard.press('Enter');
    await ow.waitForTimeout(2500);
    assert.equal(await ow.locator('.toast:has-text("Este no debería avisar")').count(), 0);
    await ow.locator('label:has-text("Mensajes del chat") .switch i').click();
  });

  await step('persistencia: cerrar sesión y volver a entrar mantiene los datos', async () => {
    await mk.goto(APP + '#/ajustes');
    await mk.click('.card + button.danger:has-text("Cerrar sesión"), button.danger:has-text("Cerrar sesión")');
    await mk.waitForSelector('form[aria-label="Iniciar sesión"]');
    await mk.fill('input[type=email]', 'marketing@test.local'); await mk.fill('input[type=password]', 'Prueba-1234');
    await mk.click('form button.primary');
    await mk.waitForSelector('.kpis');
    await mk.goto(postUrl);
    await mk.waitForSelector('.pill:has-text("Publicado")');
  });

  await step('generador: monólogos con datos reales → crear en el calendario', async () => {
    await mk.goto(APP + '#/generador');
    await mk.click('.chip:has-text("Monólogos")');
    await mk.waitForSelector('text=Sin estos datos saldrá [POR CONFIRMAR]');
    await mk.fill('#g-humorista', 'Saúl Romero');
    await mk.fill('#g-fecha', '2026-11-19');
    await mk.fill('#g-hora', '21:00');
    await mk.waitForSelector('text=✓ Datos completos.');
    await mk.waitForSelector('.copybox:has-text("Saúl Romero viene con su monólogo")');
    await mk.waitForSelector('.copybox:has-text("jueves, 19 de noviembre · 🕘 21:00")');
    await shot(mk, 'd-generador');
    await mk.click('button:has-text("Crear en el calendario")');
    await mk.click('.modal-foot button.primary:has-text("Crear")');
    await mk.waitForURL(/#\/publicaciones\/[0-9a-f-]+/);
    await mk.waitForSelector('.copybox:has-text("reserva en el 627 304 115")');
    await mk.goto(APP + '#/generador?tab=marca'); await mk.waitForSelector('text=Las 10 reglas'); await shot(mk, 'd-marca');
  });

  await step('dashboard final (ordenador y móvil)', async () => {
    await mk.goto(APP + '#/inicio'); await mk.waitForTimeout(800); await shot(mk, 'd-inicio');
    await ow.goto(APP + '#/inicio'); await ow.waitForTimeout(800); await shot(ow, 'm-inicio');
    await mk.goto(APP + '#/calendario?v=month&d=2026-12-01'); await mk.waitForTimeout(500); await shot(mk, 'd-calendario-diciembre');
    await ow.goto(APP + '#/tareas'); await ow.waitForTimeout(500); await shot(ow, 'm-tareas');
  });

  console.log(`\n${n} pasos E2E superados`);
  await browser.close();
})().catch((e) => { console.error('\n✗ FALLO:', e.message); process.exit(1); });
