document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const NS = 'http://www.w3.org/2000/svg';

/* Logo del hero: se dibuja trazo a trazo al cargar */
document.querySelectorAll('.cap-logo path').forEach((p) => p.setAttribute('pathLength', '1'));
requestAnimationFrame(() => document.body.classList.add('is-loaded'));

/* Manifiesto: palabras que se encienden al bajar */
const wordsEl = document.querySelector('[data-words]');
const fullText = wordsEl.textContent.trim();
wordsEl.setAttribute('aria-label', fullText);
wordsEl.textContent = '';
const words = fullText.split(/\s+/).map((w, i, all) => {
  const s = document.createElement('span');
  s.className = 'w';
  s.setAttribute('aria-hidden', 'true');
  s.textContent = w;
  wordsEl.append(s);
  if (i < all.length - 1) wordsEl.append(' ');
  return s;
});

/* Líneas de pista concéntricas (arriba y abajo) para la sección de entrenamientos */
function buildArches() {
  const tones = ['#d7cfc7', '#e3ddd7', '#cfc6bd'];
  const make = (group, down) => {
    for (let k = 0; k < 7; k++) {
      const r = 150 + k * 46;
      const path = document.createElementNS(NS, 'path');
      const d = down
        ? `M${500 - r} 0V${430 - r * 0.25}A${r} ${r} 0 0 0 ${500 + r} ${430 - r * 0.25}V0`
        : `M${500 - r} 1000V${570 + r * 0.25}A${r} ${r} 0 0 1 ${500 + r} ${570 + r * 0.25}V1000`;
      path.setAttribute('d', d);
      path.setAttribute('pathLength', '1');
      path.setAttribute('stroke', tones[k % 3]);
      path.setAttribute('stroke-width', '22');
      group.append(path);
    }
  };
  make(document.getElementById('archesTop'), true);
  make(document.getElementById('archesBot'), false);
}
buildArches();

/* Balón 3D: costuras de baloncesto proyectadas sobre una esfera que gira */
const SEAMS = (() => {
  const curves = [];
  const N = 96;
  const circle = (fn) => {
    const pts = [];
    for (let i = 0; i <= N; i++) pts.push(fn((i / N) * Math.PI * 2));
    curves.push(pts);
  };
  circle((t) => [Math.cos(t), Math.sin(t), 0]);
  circle((t) => [0, Math.cos(t), Math.sin(t)]);
  [-1, 1].forEach((s) => circle((t) => {
    const v = [s * 0.74, Math.cos(t) * 0.67, Math.sin(t) * 0.67];
    const l = Math.hypot(...v);
    return v.map((c) => c / l);
  }));
  return curves;
})();

const balls = [...document.querySelectorAll('[data-ball]')].map((el) => ({
  el,
  canvas: el.querySelector('canvas'),
  speed: parseFloat(el.dataset.ballSpeed || '0.4'),
  visible: true,
}));

function sizeBall(b) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const s = b.el.clientWidth;
  b.size = s;
  b.canvas.width = Math.round(s * dpr);
  b.canvas.height = Math.round(s * dpr);
  b.ctx = b.canvas.getContext('2d');
  b.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBall(b, angle) {
  const { ctx, size } = b;
  if (!ctx || !size) return;
  const R = size / 2;
  ctx.clearRect(0, 0, size, size);
  const ay = angle;
  const ax = 0.42;
  const az = 0.32;
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const cx = Math.cos(ax), sx = Math.sin(ax);
  const cz = Math.cos(az), sz = Math.sin(az);
  ctx.lineCap = 'round';
  SEAMS.forEach((pts) => {
    let prev = null;
    pts.forEach(([x, y, z]) => {
      let x1 = x * cy + z * sy;
      let z1 = -x * sy + z * cy;
      let y1 = y * cx - z1 * sx;
      let z2 = y * sx + z1 * cx;
      const x2 = x1 * cz - y1 * sz;
      const y2 = x1 * sz + y1 * cz;
      const p = [R + x2 * R * 0.985, R + y2 * R * 0.985, z2];
      if (prev && prev[2] > -0.05 && p[2] > -0.05) {
        const depth = (prev[2] + p[2]) / 2;
        ctx.strokeStyle = `rgba(70, 58, 50, ${0.45 + depth * 0.5})`;
        ctx.lineWidth = Math.max(1.2, size * 0.016) * (0.55 + depth * 0.45);
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(p[0], p[1]);
        ctx.stroke();
      }
      prev = p;
    });
  });
}

if ('IntersectionObserver' in window) {
  const bio = new IntersectionObserver((es) => es.forEach((e) => {
    const b = balls.find((x) => x.el === e.target);
    if (b) b.visible = e.isIntersecting;
  }));
  balls.forEach((b) => bio.observe(b.el));
}

let scrollSpin = 0;
function spin(t) {
  balls.forEach((b) => {
    if (!b.visible) return;
    drawBall(b, (reduceMotion ? 0.6 : t / 1000 * b.speed) + scrollSpin);
  });
  if (!reduceMotion) requestAnimationFrame(spin);
}

/* Aparición al entrar en pantalla */
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) {
    e.target.classList.add('is-visible');
    io.unobserve(e.target);
  }
}), { threshold: 0.2 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* Progreso de scroll (--p) de cada sección anclada */
const tracked = [...document.querySelectorAll('[data-track]')];
const heroSticky = document.querySelector('.hero-sticky');
const header = document.getElementById('siteHeader');
const navLinks = [...document.querySelectorAll('#mainNav a')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
let lastY = window.scrollY;
let ticking = false;

function update() {
  ticking = false;
  const vh = window.innerHeight;
  const y = window.scrollY;

  header.classList.toggle('is-hidden', y > lastY + 2 && y > vh);
  if (y < lastY - 2) header.classList.remove('is-hidden');
  lastY = y;
  scrollSpin = y / 380;

  let current = -1;
  sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * 0.5) current = i; });
  navLinks.forEach((a, i) => a.classList.toggle('on', i === current));

  if (reduceMotion) return;

  tracked.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 2) return;
    const p = clamp(-r.top / Math.max(1, r.height - vh));
    el.style.setProperty('--p', p.toFixed(4));
    if (el.id === 'inicio') {
      const m = clamp((p - 0.12) * 2.6);
      heroSticky.toggleAttribute('data-open', m > 0.9);
      const lit = Math.round(clamp((p - 0.5) / 0.42) * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    }
  });
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
}

function resize() {
  balls.forEach(sizeBall);
  update();
  if (reduceMotion) spin(0);
}

if (reduceMotion) words.forEach((w) => w.classList.add('on'));
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', resize);
document.fonts?.ready.then(resize);
resize();
if (!reduceMotion) requestAnimationFrame(spin);
