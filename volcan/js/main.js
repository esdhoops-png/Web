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
    { key: 'bun-top', h: 170, name: 'Pan superior', desc: 'Pan brioche tostado en la plancha. Tierno por dentro, dorado por fuera y listo para aguantar la erupción.', meta: 'Brioche · Tostado' },
    { key: 'patty', h: 86, name: 'Carne smash', desc: 'Carne premium aplastada contra la plancha a fuego alto. Bordes finos y costra crujiente: así nace una smash.', meta: 'Carne premium · Fuego alto' },
    { key: 'cheese', h: 96, name: 'Queso fundido', desc: 'Queso fundido directamente sobre la carne caliente, hasta que se derrama por los lados como lava.', meta: 'Fundido al momento' },
    { key: 'sauce', h: 56, name: 'Salsa Volcán', desc: 'Nuestra salsa artesana de la casa, con el toque picante justo. Hay cuatro, pero esta lleva nuestro nombre.', meta: 'Salsa artesana · Toque picante' },
    { key: 'pickles', h: 60, name: 'Pepinillos', desc: 'El golpe ácido que equilibra la grasa y el queso. Pequeños, crujientes y absolutamente necesarios.', meta: 'Ácido · Crujiente' },
    { key: 'onion', h: 52, name: 'Cebolla', desc: 'Cebolla en aros finos, fresca y crujiente, para cortar tanta intensidad.', meta: 'Fresca · Corte fino' },
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
  // Carta real del local (C. Gourié, 5 · Arucas)
  const MENU = [
    { id: 'volcanica', cat: 'burgers', name: 'La volcánica', tag: 'La burger que nos ha hecho famosos', price: 11.95, badge: '🔥 Con fuego en local', hot: true, variant: 'v-hot',
      desc: '160 g de carne premium, bacon crujiente, cebolla asada lentamente, queso Monterey y barbacoa ahumada, todo coronado con una explosión de cheddar fundido.' },
    { id: 'mojo', cat: 'burgers', name: 'Échale mojo', tag: 'La auténtica Canarias entre dos panes', price: 11.9, badge: 'Sabor canario', variant: 'v-mojo',
      desc: 'Doble smash burger, queso ahumado, mojo verde casero, cremosa salsa de gofio, bacon crujiente y huevo frito.' },
    { id: 'cochina', cat: 'burgers', name: 'La cochina', tag: 'Para los que nunca tienen suficiente carne', price: 12.5, extra: 1,
      desc: 'Doble smash burger con costilla desmenuzada a baja temperatura, bacon, cheddar, cebolla roja y nuestra inconfundible salsa Pecado.' },
    { id: 'trufada', cat: 'burgers', name: 'La trufada', tag: 'El lujo convertido en hamburguesa', price: 13.95, badge: 'Premium', variant: 'v-truffle',
      desc: 'Mantequilla de trufa, champiñones al ajillo, provolone fundido, cebolla caramelizada y mayonesa trufada sobre una carne increíblemente jugosa.' },
    { id: 'campurria', cat: 'burgers', name: 'La campurria', tag: 'La favorita de los amantes del queso', price: 11.9,
      desc: 'Carne premium, rulo de cabra fundido, mermelada de bacon, cebolla crispy, rúcula fresca y alioli de ajo asado.' },
    { id: 'piopio', cat: 'burgers', name: 'Pio pio', tag: 'Crujiente por fuera, brutal por dentro', price: 12.5, badge: 'Pollo', variant: 'v-chicken',
      desc: 'Pollo crujiente, mozzarella fundida, pimiento rojo asado, coleslaw casera y el toque picante de nuestra salsa Volcán.' },
    { id: 'teide', cat: 'burgers', name: 'Teide', tag: 'La clásica perfecta', price: 10.9, badge: 'La clásica',
      desc: 'Carne smash recién hecha, queso gouda fundido, tomate fresco, cebolla, lechuga y nuestra salsa especial de pepinillos.' },
    { id: 'graciosa', cat: 'burgers', name: 'La graciosa', tag: 'La vegetariana que sorprende incluso a los carnívoros', price: 11.9, badge: 'Vegetariana', variant: 'v-veggie',
      desc: 'Medallón vegetal, queso fundido, cebolla caramelizada, rúcula fresca y nuestro cremoso alioli.' },
    { id: 'peques', cat: 'burgers', name: 'Para los peques', tag: 'Hasta los grandes la quieren', price: 5.5, badge: 'Menú infantil', variant: 'v-kids',
      desc: 'Pan brioche, carne de 80 g, queso, alioli y huevo. Acompañada de papas.' },

    { id: 'teq-chistorra', cat: 'starters', name: 'Tequeños de chistorra', tag: 'El picoteo que nunca falla', icon: 'i-tequenos',
      options: [{ id: 'teq-chistorra-3', label: '3 uds', price: 5.5 }, { id: 'teq-chistorra-6', label: '6 uds', price: 9.5 }],
      desc: 'Doraditos y extra crujientes, rellenos de chistorra. Súmales salsa Pecado por +0,30 €.' },
    { id: 'teq-queso', cat: 'starters', name: 'Tequeños de queso', tag: 'El picoteo que nunca falla', icon: 'i-tequenos',
      options: [{ id: 'teq-queso-3', label: '3 uds', price: 5.5 }, { id: 'teq-queso-6', label: '6 uds', price: 9.5 }],
      desc: 'Doraditos y extra crujientes, rellenos de queso fundido. Súmales salsa Pecado por +0,30 €.' },
    { id: 'teq-mixtos', cat: 'starters', name: 'Tequeños mixtos', tag: 'Chistorra y queso', price: 9.5, icon: 'i-tequenos',
      desc: 'Lo mejor de los dos mundos en una sola ración. Súmales salsa Pecado, rosa de naranja con un pelín de picante, por +0,30 €.' },
    { id: 'batata', cat: 'starters', name: 'Batata frita', tag: 'Dulce y crujiente', price: 5.5, icon: 'i-fries', variant: 'v-batata',
      desc: 'Bastones de batata súper crujientes con ese toque dulce brutal, listos para mojar en nuestro alioli de trufa casero.' },
    { id: 'bravas', cat: 'starters', name: 'Papas bravas', tag: 'Con un giro', price: 6.5, icon: 'i-bravas',
      desc: 'Papas doradas cubiertas con salsa brava, alioli casero y rematadas con cacahuetes caramelizados.' },
    { id: 'nachos-volcan', cat: 'starters', name: 'Nachos Volcán', tag: 'Cargados hasta arriba', price: 8.9, badge: 'De la casa', hot: true, icon: 'i-nachos',
      desc: 'Nachos cargados con carne molida jugosa, guacamole casero, hilos de queso, salsa de yogur y rodajas de jalapeño.' },
    { id: 'nachos-mex', cat: 'starters', name: 'Nachos Mexicanos', tag: 'Baño de cheddar', price: 8.5, icon: 'i-nachos',
      desc: 'Nachos crocantes en un baño de salsa cheddar fundida, guacamole fresco y pico de gallo.' },
    { id: 'tiras', cat: 'starters', name: 'Tiras de pollo', tag: 'Crocantes y jugosas', price: 10.9, icon: 'i-strips',
      desc: 'Tiras de pollo súper crocantes por fuera y jugosas por dentro, con nuestra clásica salsa de miel y mostaza.' },

    { id: 'side', cat: 'extras', name: 'Papas o batata', tag: 'Para acompañar tu burger', icon: 'i-fries', badge: 'El 80% las pide',
      options: [{ id: 'side-papas', label: 'Papas', name: 'Ración de papas', price: 2 }, { id: 'side-batata', label: 'Batata', name: 'Ración de batata', price: 2 }],
      desc: 'Añade a tu hamburguesa una ración de papas o de batata frita por solo 2,00 €.' },
    { id: 'salsa-trufa', cat: 'extras', name: 'Alioli de trufa', tag: 'Salsa artesana', price: 0.8, icon: 'i-sauce', color: '#e9dcb8',
      desc: 'Cremoso, casero y con todo el aroma de la trufa.' },
    { id: 'salsa-miel', cat: 'extras', name: 'Miel y mostaza', tag: 'Salsa artesana', price: 0.8, icon: 'i-sauce', color: '#e8b830',
      desc: 'Dulce y suave. La pareja perfecta de las tiras de pollo.' },
    { id: 'salsa-pecado', cat: 'extras', name: 'Salsa Pecado', tag: 'Salsa artesana', price: 0.8, icon: 'i-sauce', color: '#f08a6a',
      desc: 'Adictiva salsa rosa de naranja con un pelín de picante que te va a volver loco.' },
    { id: 'salsa-volcan', cat: 'extras', name: 'Salsa Volcán', tag: 'Salsa artesana', price: 0.8, icon: 'i-sauce', color: '#e0261b', hot: true,
      desc: 'La salsa que lleva nuestro nombre. Con el toque picante de la casa.' }
  ];
  // cada opción (3 uds / 6 uds, papas / batata) es un artículo propio del pedido
  const byId = {};
  MENU.forEach((m) => {
    if (m.options) m.options.forEach((o) => { byId[o.id] = { ...m, id: o.id, name: o.name || `${m.name} · ${o.label}`, price: o.price }; });
    else byId[m.id] = m;
  });

  const HEAT = [
    { level: 'Humo', temp: '1/5', id: 'teide', desc: 'La clásica perfecta: carne smash, gouda, tomate, lechuga y salsa de pepinillos. Cuando algo es bueno, no necesita más.' },
    { level: 'Brasa', temp: '2/5', id: 'campurria', desc: 'Queso de cabra fundido y mermelada de bacon. Dulce, salada y cremosa en cada mordisco.' },
    { level: 'Fumarola', temp: '3/5', id: 'mojo', desc: 'Mojo verde casero, salsa de gofio y huevo frito. Canarias entre dos panes.' },
    { level: 'Magma', temp: '4/5', id: 'piopio', desc: 'Pollo crujiente con el toque picante de nuestra salsa Volcán. Imposible comer solo una vez.' },
    { level: 'Erupción', temp: '5/5', id: 'volcanica', desc: '160 g de carne y una explosión de cheddar. Y en el local, te llega a la mesa con fuego.' }
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
  const plus = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
  const visualFor = (m) => m.icon
    ? `<svg viewBox="0 0 200 200" aria-hidden="true" class="${m.variant || ''}"${m.color ? ` style="color:${m.color}"` : ''}><use href="#${m.icon}"/></svg>`
    : burgerMarkup(m.variant, m.extra);
  const priceOf = (m) => m.options ? m.options.map((o) => euro(o.price)).join(' / ') : euro(m.price);
  const addButtons = (m) => (m.options || [{ id: m.id, label: 'Añadir' }]).map((o) =>
    `<button class="add-btn" data-add="${o.id}" data-label="${o.label}" type="button" aria-label="Añadir ${byId[o.id].name} a tu selección">${plus}<span>${o.label}</span></button>`).join('');

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
          <p class="card-tag">${m.tag}</p>
          <div class="card-top"><h3>${m.name}</h3><span class="price">${priceOf(m)}</span></div>
          <p>${m.desc}</p>
          <div class="card-foot">${addButtons(m)}</div>
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
    if (label && btn.dataset.label) {
      label.textContent = '¡Dentro!';
      setTimeout(() => { btn.classList.remove('added'); label.textContent = btn.dataset.label; }, 1200);
    } else {
      setTimeout(() => btn.classList.remove('added'), 1200);
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
    { g: 'linear-gradient(135deg,#e0261b,#ff7a1a)', v: burgerMarkup('v-hot', 0), t: 'La volcánica' },
    { g: 'linear-gradient(135deg,#1c1715,#3a302b)', v: burgerMarkup('v-mojo', 0), t: 'Échale mojo' },
    { g: 'linear-gradient(135deg,#ffb627,#ff4d1a)', v: '<svg viewBox="0 0 200 200"><use href="#i-nachos"/></svg>', t: 'Nachos Volcán' },
    { g: 'linear-gradient(135deg,#7a1a10,#e0261b)', v: burgerMarkup('', 1), t: 'La cochina' },
    { g: 'linear-gradient(135deg,#2b2420,#6a2a12)', v: '<svg viewBox="0 0 200 200"><use href="#i-tequenos"/></svg>', t: 'Tequeños' },
    { g: 'linear-gradient(135deg,#ff7a1a,#ffd166)', v: burgerMarkup('v-truffle', 0), t: 'La trufada' }
  ];
  $('#gram').innerHTML = GRAM.map((x, i) =>
    `<a href="#carta" class="reveal" style="--g:${x.g};--rd:${i * 0.06}s" aria-label="${x.t}, ver en la carta">${x.v}<span>${x.t}</span></a>`).join('');

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
  const PHONE = '+34928424823';
  let lastFocus = null;
  let toastTimer;

  const cart = {
    items: Object.fromEntries(Object.entries(store.get()).filter(([id, q]) => byId[id] && q > 0)),
    count() { return Object.values(this.items).reduce((a, b) => a + b, 0); },
    subtotal() { return Object.entries(this.items).reduce((a, [id, q]) => a + byId[id].price * q, 0); },
    add(id) {
      this.items[id] = (this.items[id] || 0) + 1;
      this.save();
      showToast(`🔥 ${byId[id].name} añadido a tu selección`);
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
        <p>Añade lo que te apetezca de la carta y te preparamos el resumen para pedirlo por teléfono.</p>
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
    $('#cartSubtotal').textContent = euro(sub);
    $('#cartTotal').textContent = euro(sub);
    // sugerencia: burger sin papas ni batata
    const ids = Object.keys(cart.items);
    const hasBurger = ids.some((id) => byId[id].cat === 'burgers' && id !== 'peques');
    const hasSide = ids.some((id) => id.startsWith('side-') || id === 'batata' || id === 'bravas');
    $('#upsell').hidden = !(hasBurger && !hasSide);
  }

  body.addEventListener('click', (e) => {
    const b = e.target.closest('[data-qty]');
    if (b) cart.change(b.dataset.qty, +b.dataset.d);
    if (e.target.closest('[data-close-cart]')) closeCart();
  });

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
    setTimeout(() => { backdrop.hidden = true; renderCart(); }, 400);
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
    const lines = Object.entries(cart.items).map(([id, q]) => `<li><span>${q} × ${byId[id].name}</span><span>${euro(byId[id].price * q)}</span></li>`).join('');
    foot.hidden = true;
    body.innerHTML = `<div class="order-done">
      <div class="ring"><svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z" fill="currentColor"/></svg></div>
      <h3>Llama y pide</h3>
      <p>Llama al local y dicta este resumen. Así no se te olvida nada.</p>
      <ul class="order-summary">${lines}<li class="sum"><span>Total</span><span>${euro(cart.subtotal())}</span></li></ul>
      <a class="btn btn-fire btn-block" href="tel:${PHONE}">Llamar al 928 42 48 23</a>
      <button class="btn btn-outline btn-sm" type="button" data-back-cart>Volver a mi selección</button>
    </div>`;
    $('.order-done a').focus();
  });
  body.addEventListener('click', (e) => { if (e.target.closest('[data-back-cart]')) renderCart(); });

  renderCart();

  $('#year').textContent = new Date().getFullYear();
})();
