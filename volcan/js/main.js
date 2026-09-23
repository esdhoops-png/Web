/* =========================================================
   VOLCÁN SMASH BURGER — interacciones
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const euro = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  /* ---------------------------------------------------------
     CAPAS DE LA HAMBURGUESA
     --------------------------------------------------------- */
  const LAYERS = [
    { key: 'bun-top', h: 170, name: 'Pan superior', desc: 'Brioche de obrador local, tostado en mantequilla hasta que brilla. Tierno por dentro, dorado por fuera.', meta: 'Brioche · Sésamo · Mantequilla' },
    { key: 'patty', h: 86, name: 'Carne smash', desc: '90 g de vaca madurada aplastada contra la plancha a 250°C. Bordes de encaje y costra crujiente de Maillard.', meta: '90 g · 250°C · 10 segundos' },
    { key: 'cheese', h: 96, name: 'Queso fundido', desc: 'Cheddar americano que se derrama por los lados como lava. Se funde bajo campana en 30 segundos.', meta: 'Cheddar · Fusión lenta' },
    { key: 'sauce', h: 56, name: 'Salsa Volcán', desc: 'Nuestra receta secreta: mayonesa ahumada, chipotle, pepinillo y un toque de miel. Picante justo.', meta: 'Receta secreta · Picor 2/5' },
    { key: 'pickles', h: 60, name: 'Pepinillos', desc: 'Encurtidos en casa durante 48 horas con eneldo y mostaza. El golpe ácido que equilibra todo.', meta: 'Eneldo · 48 h de encurtido' },
    { key: 'onion', h: 52, name: 'Cebolla', desc: 'Cebolla morada en aros finos, cruda y crujiente. Frescura para cortar tanta intensidad.', meta: 'Morada · Corte fino' },
    { key: 'bun-bottom', h: 92, name: 'Pan inferior', desc: 'La base que lo sostiene todo. Tostado para resistir los jugos sin perder ni una gota de sabor.', meta: 'Brioche · Base tostada' }
  ];

  const layerSVG = (key, h) =>
    `<svg viewBox="0 0 400 ${h}" aria-hidden="true" focusable="false"><use href="#l-${key}"/></svg>`;

  /**
   * Construye una hamburguesa por capas dentro de `el`.
   * opts.tags  → etiquetas laterales numeradas (sección anatomía)
   * opts.float → envuelve las capas en un contenedor flotante (hero)
   * opts.extra → capas extra de carne+queso (burgers dobles/triples)
   */
  function makeBurger(el, opts = {}) {
    const list = LAYERS.slice();
    if (opts.extra) {
      const add = [];
      for (let i = 0; i < opts.extra; i++) add.push(LAYERS[1], LAYERS[2]);
      list.splice(3, 0, ...add);
    }
    const html = list.map((l, i) => {
      const tag = opts.tags ? `<span class="b-tag"><b>${String(i + 1).padStart(2, '0')}</b>${l.name}</span>` : '';
      return `<div class="b-layer" data-layer="${l.key}" style="z-index:${list.length - i}"><div class="b-inner">${layerSVG(l.key, l.h)}</div>${tag}</div>`;
    }).join('');
    el.innerHTML = (opts.float ? `<div class="b-float">${html}</div>` : html) + '<div class="burger-shadow"></div>';
    return $$('.b-layer', el);
  }

  const burgerMarkup = (variant = '', extra = 0) => {
    const d = document.createElement('div');
    d.className = 'burger ' + variant;
    makeBurger(d, { extra });
    return d.outerHTML;
  };

  /* ---------------------------------------------------------
     DATOS
     --------------------------------------------------------- */
  const MENU = [
    { id: 'crater', cat: 'burgers', name: 'El Cráter', price: 9.9, heat: 1, badge: 'La original', variant: '', extra: 0,
      desc: 'Doble smash, doble cheddar, salsa Volcán, pepinillos y cebolla morada. La que lo empezó todo.' },
    { id: 'pompeya', cat: 'burgers', name: 'Pompeya', price: 11.5, heat: 2, variant: '', extra: 0,
      desc: 'Smash doble, bacon crujiente, cebolla caramelizada 6 horas y BBQ ahumada con whisky.' },
    { id: 'ceniza', cat: 'burgers', name: 'Ceniza Negra', price: 12.5, heat: 2, badge: 'Nueva', variant: 'v-black', extra: 0,
      desc: 'Pan de carbón vegetal, cheddar ahumado, mayo de ajo negro y cebolla crujiente.' },
    { id: 'fumarola', cat: 'burgers', name: 'Fumarola', price: 12.9, heat: 3, variant: '', extra: 0,
      desc: 'Chipotle ahumado, jalapeños asados, pepper jack fundido y lima. Humo con carácter.' },
    { id: 'lava', cat: 'burgers', name: 'Lava Picante', price: 12.9, heat: 4, badge: 'Top ventas', hot: true, variant: 'v-hot', extra: 0,
      desc: 'Salsa de habanero y mango, jalapeños frescos, queso picante y cebolla encurtida.' },
    { id: 'erupcion', cat: 'burgers', name: 'Erupción Total', price: 14.9, heat: 5, badge: 'Solo valientes', hot: true, variant: 'v-hot', extra: 1,
      desc: 'Triple smash, triple queso y salsa Carolina Reaper. Firmas un papel antes de pedirla.' },
    { id: 'basalto', cat: 'burgers', name: 'Basalto Verde', price: 11.5, heat: 1, badge: 'Veggie', variant: 'v-veggie', extra: 0,
      desc: 'Smash vegetal de garbanzo y remolacha con costra, cheddar vegano y salsa Volcán.' },

    { id: 'piedra', cat: 'sides', name: 'Patatas Piedra', price: 4.5, heat: 0, icon: 'i-fries',
      desc: 'Patata natural en doble fritura con sal de ceniza volcánica. Crujientes de verdad.' },
    { id: 'lavafries', cat: 'sides', name: 'Lava Fries', price: 6.9, heat: 2, badge: 'Para compartir', icon: 'i-fries',
      desc: 'Patatas cubiertas de salsa de cheddar, bacon, jalapeño y cebollino.' },
    { id: 'aros', cat: 'sides', name: 'Aros de Obsidiana', price: 5.5, heat: 0, icon: 'i-rings',
      desc: 'Aros de cebolla rebozados en cerveza negra. Con mayo de chipotle.' },
    { id: 'bombas', cat: 'sides', name: 'Bombas de Lava', price: 6.5, heat: 3, icon: 'i-bites',
      desc: 'Bocados de mac & cheese con corazón de jalapeño que explotan al morder.' },

    { id: 'azufre', cat: 'drinks', name: 'Limonada Azufre', price: 3.5, heat: 0, icon: 'i-cup',
      desc: 'Limonada casera con jengibre y cúrcuma. Apaga cualquier incendio.' },
    { id: 'refresco', cat: 'drinks', name: 'Refresco', price: 2.9, heat: 0, icon: 'i-cup',
      desc: 'Cola, naranja, limón o zero. Con mucho hielo.' },
    { id: 'basaltobeer', cat: 'drinks', name: 'Cerveza Basalto', price: 3.9, heat: 0, icon: 'i-beer',
      desc: 'IPA de cervecera local con notas cítricas. Nuestra pareja perfecta.' },

    { id: 'shake', cat: 'desserts', name: 'Shake Magma', price: 5.9, heat: 0, badge: 'Adictivo', icon: 'i-shake',
      desc: 'Batido de vainilla con dulce de leche, galleta tostada y nata.' },
    { id: 'brownie', cat: 'desserts', name: 'Brownie Carbón', price: 5.5, heat: 0, icon: 'i-brownie',
      desc: 'Brownie de cacao negro con corazón fundido y sal en escamas. Se sirve caliente.' }
  ];
  const byId = Object.fromEntries(MENU.map((m) => [m.id, m]));

  const HEAT = [
    { level: 'Humo', temp: '90°', id: 'crater', desc: 'Sabor puro sin picante. La smash como debe ser: carne, queso y costra.' },
    { level: 'Brasa', temp: '140°', id: 'pompeya', desc: 'Dulce, ahumada y con un calor muy suave. Para empezar a jugar con fuego.' },
    { level: 'Fumarola', temp: '180°', id: 'fumarola', desc: 'Chipotle y jalapeño asado. Pica, pero te deja disfrutar cada bocado.' },
    { level: 'Magma', temp: '220°', id: 'lava', desc: 'Habanero y mango. El picante sube poco a poco… y se queda.' },
    { level: 'Erupción', temp: '250°', id: 'erupcion', desc: 'Carolina Reaper y triple carne. Si la terminas, sales en nuestro muro.' }
  ];

  const PLACES = [
    { city: 'Madrid', name: 'Malasaña', addr: 'C/ del Espíritu Santo, 21', hours: 'Lun–Jue 13:00–16:30 · 20:00–00:00<br>Vie–Dom 13:00–01:00',
      sched: { weekday: [[780, 990], [1200, 1440]], weekend: [[780, 1500]] } },
    { city: 'Valencia', name: 'Ruzafa', addr: 'C/ de Cádiz, 58', hours: 'Todos los días 13:00–16:00 · 20:00–23:30',
      sched: { weekday: [[780, 960], [1200, 1410]], weekend: [[780, 960], [1200, 1410]] } },
    { city: 'Barcelona', name: 'Gràcia', addr: 'Carrer de Verdi, 34', hours: 'Mar–Dom 13:00–00:00<br>Lunes cerrado',
      sched: { weekday: [[780, 1440]], weekend: [[780, 1440]], closed: [1] } }
  ];

  /* ---------------------------------------------------------
     PRELOADER + ENTRADA
     --------------------------------------------------------- */
  const root = document.documentElement;
  const heroBurger = $('#heroBurger');
  const heroLayers = makeBurger(heroBurger, { float: true });
  // la hamburguesa se construye de abajo arriba
  heroLayers.forEach((l, i) => {
    const fromBottom = heroLayers.length - 1 - i;
    const delay = i === 0 ? 1.25 : 0.25 + fromBottom * 0.14;
    l.querySelector('.b-inner').style.setProperty('--ld', delay + 's');
  });

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    $('#preloader')?.classList.add('is-done');
    root.classList.add('is-loaded');
    if (!reduced) {
      // chispazo cuando aterriza el pan superior
      setTimeout(() => heroEmbers?.burst(90), 1850);
      setTimeout(() => heroEmbers?.burst(40), 500);
    }
  };
  const minDelay = reduced ? 0 : 900;
  const t0 = performance.now();
  const onReady = () => setTimeout(start, Math.max(0, minDelay - (performance.now() - t0)));
  if (document.readyState === 'complete') onReady(); else window.addEventListener('load', onReady);
  setTimeout(start, 3500); // red lenta: no bloquear

  /* ---------------------------------------------------------
     BRASAS (canvas)
     --------------------------------------------------------- */
  class Embers {
    constructor(canvas, { density = 1, origin = null } = {}) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.density = density;
      this.origin = origin;
      this.p = [];
      this.running = false;
      this.visible = true;
      this.resize = this.resize.bind(this);
      this.tick = this.tick.bind(this);
      this.resize();
      window.addEventListener('resize', this.resize);
      new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.play(); }).observe(canvas);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.play(); });
    }
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const r = this.c.getBoundingClientRect();
      this.w = r.width; this.h = r.height;
      this.c.width = r.width * dpr; this.c.height = r.height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.max = Math.round(clamp(this.w * this.h / 14000, 25, 90) * this.density);
    }
    spawn(burst = false) {
      const o = this.origin ? this.origin() : null;
      const fromCrater = o && (burst || Math.random() < 0.45);
      const x = fromCrater ? o.x + (Math.random() - 0.5) * o.w : Math.random() * this.w;
      const y = fromCrater ? o.y : this.h + 10;
      const speed = burst ? 2.5 + Math.random() * 5 : 0.4 + Math.random() * 1.2;
      this.p.push({
        x, y,
        vx: (Math.random() - 0.5) * (burst ? 5 : 0.6),
        vy: -speed,
        life: 0,
        max: 90 + Math.random() * (burst ? 60 : 160),
        s: 0.8 + Math.random() * (burst ? 2.4 : 2),
        hue: 18 + Math.random() * 28,
        wob: Math.random() * Math.PI * 2
      });
    }
    burst(n = 60) {
      if (reduced) return;
      for (let i = 0; i < n; i++) this.spawn(true);
      this.play();
    }
    play() {
      if (reduced || this.running || !this.visible || document.hidden) return;
      this.running = true;
      requestAnimationFrame(this.tick);
    }
    tick() {
      if (!this.visible || document.hidden) { this.running = false; return; }
      const { ctx } = this;
      ctx.clearRect(0, 0, this.w, this.h);
      if (this.p.length < this.max && Math.random() < 0.6) this.spawn();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = this.p.length - 1; i >= 0; i--) {
        const p = this.p[i];
        p.life++;
        p.wob += 0.05;
        p.vx += Math.sin(p.wob) * 0.03;
        p.vy *= 0.992; p.vx *= 0.985;
        p.vy -= 0.004;
        p.x += p.vx; p.y += p.vy;
        const t = p.life / p.max;
        if (t >= 1 || p.y < -20) { this.p.splice(i, 1); continue; }
        const a = (t < 0.1 ? t / 0.1 : 1 - (t - 0.1) / 0.9) * (0.6 + 0.4 * Math.sin(p.life * 0.3));
        ctx.fillStyle = `hsla(${p.hue},100%,55%,${a * 0.18})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsla(${p.hue + 12},100%,${65 + p.s * 6}%,${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(this.tick);
    }
  }

  const heroVisual = $('#heroVisual');
  const heroSection = $('.hero');
  const heroEmbers = reduced ? null : new Embers($('#heroEmbers'), {
    density: 1,
    origin: () => {
      const hs = heroSection.getBoundingClientRect();
      const r = heroVisual.getBoundingClientRect();
      return { x: r.left - hs.left + r.width / 2, y: r.bottom - hs.top - r.width * 0.28, w: r.width * 0.35 };
    }
  });
  heroEmbers?.play();
  const clubEmbers = reduced ? null : new Embers($('#clubEmbers'), { density: 0.7 });
  clubEmbers?.play();

  /* ---------------------------------------------------------
     HEADER / NAV
     --------------------------------------------------------- */
  const header = $('#siteHeader');
  const nav = $('#mainNav');
  const toggle = $('#navToggle');
  let lastY = window.scrollY;

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('open', open);
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  }));

  const sections = $$('main section[id]');
  const navLinks = $$('a', nav);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------------------------------------------------------
     HERO: reacción al scroll + ratón
     --------------------------------------------------------- */
  const mouse = { x: 0, y: 0, cx: 0, cy: 0 };
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    heroSection.addEventListener('pointermove', (e) => {
      const r = heroSection.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width - 0.5;
      mouse.y = (e.clientY - r.top) / r.height - 0.5;
      requestTick();
    });
    heroSection.addEventListener('pointerleave', () => { mouse.x = 0; mouse.y = 0; requestTick(); });
  }

  function updateHero() {
    const h = heroSection.offsetHeight;
    const p = clamp(window.scrollY / (h * 0.9));
    mouse.cx = lerp(mouse.cx, mouse.x, 0.08);
    mouse.cy = lerp(mouse.cy, mouse.y, 0.08);
    heroBurger.style.transform =
      `translate3d(${mouse.cx * 18}px, ${p * 120}px, 0) rotateX(${-mouse.cy * 10 + p * 18}deg) rotateY(${mouse.cx * 14}deg) rotate(${p * -8}deg) scale(${1 + p * 0.12})`;
    const n = heroLayers.length;
    heroLayers.forEach((l, i) => {
      const off = (i - (n - 1) / 2) * p * 26;
      l.style.transform = `translate3d(0, ${off}px, 0)`;
    });
    return Math.abs(mouse.cx - mouse.x) > 0.001 || Math.abs(mouse.cy - mouse.y) > 0.001;
  }

  /* ---------------------------------------------------------
     ANATOMÍA: la hamburguesa se desmonta con el scroll
     --------------------------------------------------------- */
  const build = $('#anatomia');
  const buildStage = $('#buildStage');
  const buildBurger = $('#buildBurger');
  const buildLayers = makeBurger(buildBurger, { tags: true });
  const buildPanel = $('.build-panel');
  const bIndex = $('#buildIndex'), bName = $('#buildName'), bDesc = $('#buildDesc'), bMeta = $('#buildMeta');
  const bDone = $('#buildDone'), bBar = $('#buildBar'), bHalo = $('.build-halo');
  const stepsEl = $('#buildSteps');
  stepsEl.innerHTML = LAYERS.map(() => '<li></li>').join('');
  const steps = $$('li', stepsEl);
  const B = { p: 0, target: 0, gap: 60, active: -2 };

  function measureBuild() {
    const r = buildStage.getBoundingClientRect();
    const mobile = window.innerWidth <= 900;
    // proporción alto/ancho de la burger montada
    buildBurger.style.setProperty('--bw', '400px');
    const ratio = buildBurger.offsetHeight / 400;
    const spread = mobile ? 0.62 : 0.95;           // hueco total entre capas, relativo al ancho
    const availH = r.height * (mobile ? 0.86 : 0.84);
    const maxW = mobile ? r.width * 0.78 : Math.min(r.width * 0.56, 440);
    const w = Math.max(160, Math.min(maxW, availH / (ratio + spread)));
    buildBurger.style.setProperty('--bw', w + 'px');
    B.gap = (w * spread) / (LAYERS.length - 1);
  }

  function setPanel(idx) {
    if (idx === B.active) return;
    B.active = idx;
    buildPanel.classList.remove('swap');
    void buildPanel.offsetWidth;
    buildPanel.classList.add('swap');
    if (idx < 0) {
      bIndex.textContent = '00 / 07';
      bName.textContent = 'Haz scroll';
      bDesc.textContent = 'Desmonta la burger capa a capa y descubre qué hay dentro de cada erupción.';
      bMeta.textContent = '';
    } else if (idx >= LAYERS.length) {
      bIndex.textContent = '07 / 07';
      bName.textContent = 'Todo junto';
      bDesc.textContent = 'Siete capas, un bocado. Así suena una smash bien hecha: crac, y después lava.';
      bMeta.textContent = 'Lista en menos de 4 minutos';
    } else {
      const l = LAYERS[idx];
      bIndex.textContent = `${String(idx + 1).padStart(2, '0')} / 07`;
      bName.textContent = l.name;
      bDesc.textContent = l.desc;
      bMeta.textContent = l.meta;
    }
    steps.forEach((s, i) => s.classList.toggle('on', i <= idx));
    buildLayers.forEach((l, i) => {
      l.classList.toggle('is-active', i === idx);
      l.classList.toggle('is-shown', i <= idx && idx < LAYERS.length);
    });
    bDone.classList.toggle('on', idx >= LAYERS.length);
  }

  function readBuildTarget() {
    const r = build.getBoundingClientRect();
    const total = build.offsetHeight - window.innerHeight;
    B.target = clamp(-r.top / total);
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function updateBuild() {
    B.p = reduced ? B.target : lerp(B.p, B.target, 0.14);
    if (Math.abs(B.p - B.target) < 0.0005) B.p = B.target;
    const p = B.p;
    const e = smooth(0.03, 0.16, p) * (1 - smooth(0.86, 0.95, p));
    const n = LAYERS.length;
    const stepStart = 0.12, stepLen = 0.105;
    const idx = p < stepStart ? -1 : Math.min(n, Math.floor((p - stepStart) / stepLen));
    setPanel(idx);
    buildBurger.classList.toggle('is-exploded', e > 0.5 && idx >= 0 && idx < n);

    buildLayers.forEach((l, i) => {
      const y = (i - (n - 1) / 2) * B.gap * e;
      const rot = (i % 2 ? 1 : -1) * 2.5 * e;
      const act = i === idx ? 1 : 0;
      const x = act * (i % 2 ? -1 : 1) * 14 * e;
      l.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${1 + act * 0.05})`;
    });
    // al final, pequeño "smash" de la burger montada
    const land = smooth(0.93, 0.97, p);
    buildBurger.style.transform = `rotate(${(1 - e) * -2 + e * 2}deg) scale(${1 + land * 0.04})`;
    bHalo.style.transform = `scale(${0.9 + e * 0.35})`;
    bBar.style.transform = `scaleX(${p})`;
    return B.p !== B.target;
  }

  /* ---------------------------------------------------------
     BUCLE DE SCROLL (un solo rAF)
     --------------------------------------------------------- */
  let ticking = false;
  function requestTick() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  function frame() {
    ticking = false;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);
    const menuOpen = nav.classList.contains('open');
    header.classList.toggle('is-hidden', !menuOpen && y > 500 && y > lastY + 4);
    if (y < lastY - 4 || y < 500) header.classList.remove('is-hidden');
    lastY = y;

    let again = false;
    if (y < heroSection.offsetHeight * 1.1) again = updateHero() || again;
    if (readBuildTarget() || B.p !== B.target) again = updateBuild() || again;
    if (again) requestTick();
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', () => { measureBuild(); requestTick(); });
  measureBuild();
  readBuildTarget(); B.p = B.target;
  updateBuild();
  requestTick();
  if (document.fonts?.ready) document.fonts.ready.then(() => { measureBuild(); requestTick(); });

  /* ---------------------------------------------------------
     CARTA
     --------------------------------------------------------- */
  const flameSVG = (on) => `<svg viewBox="0 0 24 24" class="${on ? 'on' : ''}"><use href="#i-flame"/></svg>`;
  const flames = (n) => `<span class="flames" aria-label="Picante ${n} de 5">${[1, 2, 3, 4, 5].map((i) => flameSVG(i <= n)).join('')}</span>`;
  const visualFor = (m) => m.icon
    ? `<svg viewBox="0 0 200 200" aria-hidden="true"><use href="#${m.icon}"/></svg>`
    : burgerMarkup(m.variant, m.extra);

  const grid = $('#menuGrid');
  function renderMenu(cat) {
    const items = MENU.filter((m) => m.cat === cat);
    grid.innerHTML = items.map((m, i) => `
      <article class="card" style="--i:${i}">
        <div class="card-visual">
          ${m.badge ? `<span class="card-badge${m.hot ? ' hot' : ''}">${m.badge}</span>` : ''}
          ${visualFor(m)}
        </div>
        <div class="card-body">
          <div class="card-top"><h3>${m.name}</h3><span class="price">${euro(m.price)}</span></div>
          <p>${m.desc}</p>
          <div class="card-foot">
            ${m.heat ? flames(m.heat) : '<span></span>'}
            <button class="add-btn" data-add="${m.id}" type="button" aria-label="Añadir ${m.name} al pedido">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
              <span>Añadir</span>
            </button>
          </div>
        </div>
      </article>`).join('');
  }

  const tabs = $$('.menu-tabs [role="tab"]');
  const indicator = $('.tab-indicator');
  function moveIndicator() {
    const sel = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    indicator.style.width = sel.offsetWidth + 'px';
    indicator.style.transform = `translateX(${sel.offsetLeft}px)`;
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      tabs.forEach((x) => { x.setAttribute('aria-selected', String(x === t)); x.tabIndex = x === t ? 0 : -1; });
      moveIndicator();
      renderMenu(t.dataset.filter);
    });
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus(); next.click();
    });
    t.tabIndex = i === 0 ? 0 : -1;
  });
  renderMenu('burgers');
  moveIndicator();
  window.addEventListener('resize', moveIndicator);
  document.fonts?.ready.then(moveIndicator);

  grid.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    cart.add(btn.dataset.add);
    btn.classList.add('added');
    const label = btn.querySelector('span');
    if (label) {
      label.textContent = '¡Dentro!';
      setTimeout(() => { btn.classList.remove('added'); label.textContent = 'Añadir'; }, 1200);
    }
  });

  /* ---------------------------------------------------------
     TERMÓMETRO
     --------------------------------------------------------- */
  const heatRange = $('#heatRange');
  const heatCard = $('#heatCard');
  const heatScale = $$('.heat-scale span');
  function setHeat(v, animate = true) {
    const h = HEAT[v - 1];
    const m = byId[h.id];
    const f = (v - 1) / 4;
    $('.heat').style.setProperty('--heat', (0.15 + f * 0.85).toFixed(2));
    heatRange.style.setProperty('--heat', f.toFixed(2));
    $('#heatLevel').textContent = `Nivel ${v} · ${h.level}`;
    $('#heatTemp').textContent = h.temp;
    $('#heatBurger').textContent = m.name;
    $('#heatDesc').textContent = h.desc;
    $('#heatAdd').dataset.add = m.id;
    heatRange.setAttribute('aria-valuetext', `Nivel ${v}, ${h.level}: ${m.name}`);
    heatScale.forEach((s, i) => s.classList.toggle('on', i === v - 1));
    if (animate) { heatCard.classList.remove('swap'); void heatCard.offsetWidth; heatCard.classList.add('swap'); }
  }
  heatRange.addEventListener('input', () => setHeat(+heatRange.value));
  setHeat(+heatRange.value, false);

  /* ---------------------------------------------------------
     SOCIAL / LOCALES
     --------------------------------------------------------- */
  const GRAM = [
    { g: 'linear-gradient(135deg,#e0261b,#ff7a1a)', v: burgerMarkup('', 0), t: '#ElCráter' },
    { g: 'linear-gradient(135deg,#1c1715,#3a302b)', v: burgerMarkup('v-black', 0), t: '#CenizaNegra' },
    { g: 'linear-gradient(135deg,#ffb627,#ff4d1a)', v: '<svg viewBox="0 0 200 200"><use href="#i-fries"/></svg>', t: '#LavaFries' },
    { g: 'linear-gradient(135deg,#7a1a10,#e0261b)', v: burgerMarkup('v-hot', 1), t: '#ErupciónTotal' },
    { g: 'linear-gradient(135deg,#2b2420,#6a2a12)', v: '<svg viewBox="0 0 200 200"><use href="#i-shake"/></svg>', t: '#ShakeMagma' },
    { g: 'linear-gradient(135deg,#ff7a1a,#ffd166)', v: burgerMarkup('', 0), t: '#VolcánSmash' }
  ];
  $('#gram').innerHTML = GRAM.map((x, i) =>
    `<a href="#" class="reveal" style="--g:${x.g};--rd:${i * 0.06}s" aria-label="Publicación de Instagram ${x.t}">${x.v}<span>${x.t}</span></a>`).join('');

  function madridNow() {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t)?.value;
      const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[get('weekday')], min: +get('hour') * 60 + +get('minute') };
    } catch (_) {
      const d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function isOpen(s) {
    const { day, min } = madridNow();
    const check = (d, m) => {
      if (s.closed?.includes(d)) return false;
      const w = (d === 5 || d === 6 || d === 0) ? s.weekend : s.weekday;
      return w.some(([a, b]) => m >= a && m < b);
    };
    // franjas que cruzan medianoche cuentan para el día anterior
    return check(day, min) || check((day + 6) % 7, min + 1440);
  }
  $('#placesGrid').innerHTML = PLACES.map((p, i) => {
    const open = isOpen(p.sched);
    const q = encodeURIComponent(`${p.addr}, ${p.city}`);
    return `<article class="place reveal" style="--rd:${i * 0.1}s">
      <span class="place-city">${p.city}</span>
      <h3>${p.name}</h3>
      <span class="status ${open ? 'open' : 'closed'}">${open ? 'Abierto ahora' : 'Cerrado ahora'}</span>
      <address>${p.addr}<br>${p.city}</address>
      <p class="place-hours">${p.hours}</p>
      <a class="place-link" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Cómo llegar
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
    </article>`;
  }).join('');

  /* ---------------------------------------------------------
     REVEALS + CONTADORES
     --------------------------------------------------------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  $$('.reveal').forEach((el) => revealIO.observe(el));

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target;
      const to = +el.dataset.count;
      if (reduced || to === 0) { el.textContent = to; return; }
      const t0 = performance.now();
      const dur = 1600;
      const step = (t) => {
        const k = clamp((t - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------------------------------------------------------
     CARRITO
     --------------------------------------------------------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('volcan-cart')) || {}; } catch (_) { return {}; } },
    set(v) { try { localStorage.setItem('volcan-cart', JSON.stringify(v)); } catch (_) { /* sin almacenamiento */ } }
  };
  const drawer = $('#cartDrawer');
  const backdrop = $('#drawerBackdrop');
  const body = $('#cartBody');
  const foot = $('#cartFoot');
  const fab = $('.cart-fab');
  const toast = $('#toast');
  const DELIVERY = 2.5;
  let lastFocus = null;
  let toastTimer;

  const cart = {
    items: Object.fromEntries(Object.entries(store.get()).filter(([id, q]) => byId[id] && q > 0)),
    mode: 'pickup',
    count() { return Object.values(this.items).reduce((a, b) => a + b, 0); },
    subtotal() { return Object.entries(this.items).reduce((a, [id, q]) => a + byId[id].price * q, 0); },
    add(id) {
      this.items[id] = (this.items[id] || 0) + 1;
      this.save();
      showToast(`🔥 ${byId[id].name} añadida al pedido`);
      $$('[data-cart-count]').forEach((c) => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
    },
    change(id, d) {
      this.items[id] = (this.items[id] || 0) + d;
      if (this.items[id] <= 0) delete this.items[id];
      this.save();
    },
    save() { store.set(this.items); renderCart(); }
  };

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('on'), 2200);
  }

  function renderCart() {
    const n = cart.count();
    $$('[data-cart-count]').forEach((c) => { c.textContent = n; c.hidden = n === 0; });
    fab.hidden = n === 0;
    foot.hidden = n === 0;
    if (!n) {
      body.innerHTML = `<div class="cart-empty">
        <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><use href="#i-flame"/></svg>
        <strong>El cráter está vacío</strong>
        <p>Añade alguna burger de la carta y empezamos a calentar la plancha.</p>
        <a href="#carta" class="btn btn-outline btn-sm" data-close-cart>Ver la carta</a>
      </div>`;
      $('.cart-empty svg').style.fill = 'var(--fire)';
    } else {
      body.innerHTML = Object.entries(cart.items).map(([id, q]) => {
        const m = byId[id];
        return `<div class="cart-item">
          <div class="cart-thumb">${visualFor(m)}</div>
          <div><h4>${m.name}</h4><small>${euro(m.price * q)}</small></div>
          <div class="qty">
            <button type="button" data-qty="${id}" data-d="-1" aria-label="Quitar una ${m.name}">−</button>
            <span aria-live="polite">${q}</span>
            <button type="button" data-qty="${id}" data-d="1" aria-label="Añadir una ${m.name}">+</button>
          </div>
        </div>`;
      }).join('');
    }
    const sub = cart.subtotal();
    const del = cart.mode === 'delivery' ? DELIVERY : 0;
    $('#cartSubtotal').textContent = euro(sub);
    $('#cartTotal').textContent = euro(sub + del);
    $('.delivery-row').hidden = cart.mode !== 'delivery';
  }

  body.addEventListener('click', (e) => {
    const b = e.target.closest('[data-qty]');
    if (b) cart.change(b.dataset.qty, +b.dataset.d);
    if (e.target.closest('[data-close-cart]')) closeCart();
  });

  $$('.mode-toggle [role="radio"]').forEach((b) => b.addEventListener('click', () => {
    cart.mode = b.dataset.mode;
    $$('.mode-toggle [role="radio"]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    renderCart();
  }));

  function openCart() {
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('on'));
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    setTimeout(() => $('#cartClose').focus(), 60);
  }
  function closeCart() {
    backdrop.classList.remove('on');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { backdrop.hidden = true; if (!cart.count()) renderCart(); }, 400);
    lastFocus?.focus?.();
  }
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open-cart]');
    if (!o) return;
    e.preventDefault();
    openCart();
  });
  $('#cartClose').addEventListener('click', closeCart);
  backdrop.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') closeCart();
    if (e.key === 'Tab') {
      const f = $$('button, a[href], input', drawer).filter((x) => !x.closest('[hidden]') && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  $('#checkoutBtn').addEventListener('click', () => {
    if (!cart.count()) return;
    const code = 'VS-' + Math.floor(1000 + Math.random() * 9000);
    const eta = cart.mode === 'delivery' ? '30–40 min' : '12–15 min';
    const where = cart.mode === 'delivery' ? 'Te lo llevamos a casa' : 'Recógelo en tu volcán más cercano';
    cart.items = {};
    store.set({});
    $$('[data-cart-count]').forEach((c) => { c.textContent = 0; c.hidden = true; });
    fab.hidden = true;
    foot.hidden = true;
    body.innerHTML = `<div class="order-done">
      <div class="ring"><svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <h3>¡Pedido en la plancha!</h3>
      <p>${where}. Tiempo estimado: <strong>${eta}</strong>.</p>
      <span class="code">${code}</span>
      <p style="font-size:13px">Demo: aquí se conectaría la pasarela de pago y el TPV del local.</p>
      <button class="btn btn-outline btn-sm" type="button" data-close-cart>Seguir mirando</button>
    </div>`;
    $('.order-done [data-close-cart]').focus();
  });

  renderCart();

  /* ---------------------------------------------------------
     CLUB MAGMA
     --------------------------------------------------------- */
  $('#clubForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#clubEmail');
    const msg = $('#clubMsg');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    msg.classList.toggle('err', !ok);
    if (!ok) { msg.textContent = 'Ese email no parece válido. Revísalo.'; input.focus(); return; }
    msg.textContent = '¡Bienvenido al cráter! Revisa tu bandeja: tu primer secreto está en camino.';
    input.value = '';
    clubEmbers?.burst(70);
  });

  $('#year').textContent = new Date().getFullYear();
})();
