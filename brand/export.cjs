/*
 * Exporta las plantillas de brand/social/*.html a PNG (brand/social/png/).
 * Uso:  npm i -D playwright  &&  node brand/export.cjs
 * Edita los textos en cada .html y vuelve a ejecutar para regenerar las imágenes.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'social', 'png');

const JOBS = [
  ['perfil.html', 'perfil-1080.png'],
  ['post-torneo.html', 'post-torneo-3x3.png'],
  ['post-resultado.html', 'post-resultado.png'],
  ['post-jugador.html', 'post-jugador-destacado.png'],
  ['post-recap.html', 'post-street-series-recap.png'],
  ['post-campeones.html', 'post-campeones.png'],
  ['post-kgm.html', 'post-partner-kgm.png'],
  ['post-entrenamiento.html', 'post-entrenamiento.png'],
  ['post-camp.html', 'post-camp-maite-cazorla.png'],
  ['post-frase.html', 'post-frase.png'],
  ['story-inscripciones.html', 'story-inscripciones.png'],
  ['story-proximamente.html', 'story-proximamente.png'],
  ...[0, 1, 2, 3, 4, 5].map((i) => [`carrusel.html#${i}`, `carrusel-programas-${i + 1}.png`]),
  ...['3x3', 'liga', 'camps', 'combine', 'showcase', 'info'].map((n, i) => [`destacada.html#${i}`, `destacada-${n}.png`]),
  ...['x', 'linkedin', 'youtube', 'facebook'].map((n) => [`banner.html#${n}`, `banner-${n}.png`]),
];

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split(/[?#]/)[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}/brand/social/`;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [page, out] of JOBS) {
    const tab = await browser.newPage({ viewport: { width: 2600, height: 2000 } });
    await tab.goto(base + page, { waitUntil: 'networkidle' });
    await tab.evaluate(() => document.fonts.ready);
    await tab.locator('.canvas').screenshot({ path: path.join(OUT, out) });
    await tab.close();
    console.log('✓', out);
  }
  await browser.close();
  server.close();
})();
