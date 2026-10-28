/* =========================================================
   CUOR DI PIZZA — interacciones
   1. Datos y enlaces (desde config.js)
   2. Pizzas ilustradas (SVG generado por plato)
   3. Preloader, brasas, cabecera y hero
   4. Anatomía: la pizza se separa en capas con el scroll
   5. Carta con pestañas + «Tu mesa»
   6. Revelados, footer, carta completa y SEO
   ========================================================= */
(() => {
  'use strict';

  const C = window.CUOR || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const euro = (n) => (typeof n === 'number' ? n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : '');
  const placeholder = (t) => `<span class="is-placeholder" title="Dato pendiente: complétalo en assets/js/config.js">${esc(t)}</span>`;

  /* ---------------------------------------------------------
     1. DATOS Y ENLACES
     --------------------------------------------------------- */
  const links = C.links || {};
  const contact = C.contact || {};
  const addr = contact.address || {};
  const phone = (contact.phone || '').trim();
  const whatsapp = (contact.whatsapp || '').replace(/\D/g, '');
  const menuUrl = links.menu || 'carta.html';
  const mapsUrl = links.maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([C.name || 'Cuor di Pizza', addr.street, addr.locality, addr.region || C.region].filter(Boolean).join(' '))}`;
  const MENU = Array.isArray(C.menu) ? C.menu : [];
  const byId = {};
  MENU.forEach((cat) => (cat.items || []).forEach((it) => { byId[it.id] = { ...it, cat: cat.title }; }));

  $$('[data-link="menu"]').forEach((a) => { a.href = menuUrl; });
  $$('[data-link="maps"]').forEach((a) => { a.href = mapsUrl; a.target = '_blank'; a.rel = 'noopener'; });
  if (C.demoMenu) $$('[data-demo-note]').forEach((el) => { el.hidden = false; });

  /* ---------------------------------------------------------
     2. PIZZAS ILUSTRADAS
     --------------------------------------------------------- */
  // Aleatorio con semilla: cada plato se dibuja siempre igual.
  const rng = (str) => {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  };

  function scatter(r, n, maxR, minD) {
    const pts = [];
    for (let tries = 0; pts.length < n && tries < n * 40; tries++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * maxR;
      const p = { x: +(100 + Math.cos(a) * d).toFixed(1), y: +(100 + Math.sin(a) * d).toFixed(1), a: Math.round(r() * 360) };
      if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > minD)) pts.push(p);
    }
    return pts;
  }

  const TOPPING = {
    cheese: (p) => `<ellipse cx="${p.x}" cy="${p.y}" rx="${10 + (p.a % 6)}" ry="${8 + (p.a % 5)}" transform="rotate(${p.a} ${p.x} ${p.y})" fill="url(#g-mozz)"/>`,
    basil: (p) => `<use href="#leaf" x="${p.x - 15}" y="${p.y - 7.5}" width="30" height="15" transform="rotate(${p.a} ${p.x} ${p.y})"/>`,
    spinach: (p) => `<path d="M${p.x - 13} ${p.y}c6-9 20-9 26 0-6 9-20 9-26 0Z" fill="#2F6B2A" stroke="#4E8C3A" stroke-width="1" transform="rotate(${p.a} ${p.x} ${p.y})"/>`,
    salami: (p) => `<g><circle cx="${p.x}" cy="${p.y}" r="10.5" fill="#A92B22"/><circle cx="${p.x}" cy="${p.y}" r="8.5" fill="#C23B2E"/><circle cx="${p.x - 3}" cy="${p.y - 2}" r="1.4" fill="#F0A58E"/><circle cx="${p.x + 3}" cy="${p.y + 2}" r="1.2" fill="#F0A58E"/><circle cx="${p.x + 2}" cy="${p.y - 4}" r="1" fill="#F0A58E"/></g>`,
    olive: (p) => `<circle cx="${p.x}" cy="${p.y}" r="4.6" fill="none" stroke="#1E1612" stroke-width="3.4"/>`,
    ricotta: (p) => `<g fill="#FFFDF6" stroke="#EADFC8" stroke-width=".8"><circle cx="${p.x}" cy="${p.y}" r="6.5"/><circle cx="${p.x + 6}" cy="${p.y + 2}" r="5"/><circle cx="${p.x - 4}" cy="${p.y + 5}" r="4.5"/></g>`,
    onion: (p) => `<path d="M${p.x - 9} ${p.y}a9 6 0 0 1 18 0" fill="none" stroke="#9B4FB3" stroke-width="2.6" stroke-linecap="round" transform="rotate(${p.a} ${p.x} ${p.y})"/>`,
    mushroom: (p) => `<path d="M${p.x - 9} ${p.y + 1}c0-8 18-8 18 0h-6v7h-6v-7Z" fill="#E6D0AC" stroke="#A88A62" stroke-width="1.2" transform="rotate(${p.a} ${p.x} ${p.y})"/>`,
    ham: (p) => `<path d="M${p.x - 10} ${p.y - 4}c6-6 18-4 20 2s-6 10-12 9-12-5-8-11Z" fill="#E8A3A0" stroke="#C97C78" stroke-width="1" transform="rotate(${p.a} ${p.x} ${p.y})"/>`,
    artichoke: (p) => `<path d="M${p.x} ${p.y - 9}l7 14H${p.x - 7}Z" fill="#9DB35A" stroke="#6E8436" stroke-width="1.2" stroke-linejoin="round" transform="rotate(${p.a} ${p.x} ${p.y})"/>`,
  };
  const COUNT = { cheese: 7, basil: 5, spinach: 7, salami: 7, olive: 8, ricotta: 5, onion: 7, mushroom: 6, ham: 6, artichoke: 5 };

  function pizzaSVG(seed, art = {}) {
    const r = rng(String(seed));
    const white = art.sauce === 'white';
    let char = '';
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2, d = 86 + r() * 5;
      char += `<ellipse cx="${(100 + Math.cos(a) * d).toFixed(1)}" cy="${(100 + Math.sin(a) * d).toFixed(1)}" rx="${(2 + r() * 3).toFixed(1)}" ry="${(1.5 + r() * 1.5).toFixed(1)}" fill="#5A2C12" opacity=".55"/>`;
    }
    let sauce = '';
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2, d = 76 + r() * 4;
      sauce += `${i ? 'L' : 'M'}${(100 + Math.cos(a) * d).toFixed(1)} ${(100 + Math.sin(a) * d).toFixed(1)}`;
    }
    const tops = (art.toppings || []).map((t) => (TOPPING[t]
      ? scatter(r, COUNT[t] || 5, t === 'cheese' ? 58 : 62, t === 'cheese' ? 20 : 16).map(TOPPING[t]).join('') : '')).join('');
    const cuts = [0, 45, 90, 135].map((a) => `<line x1="100" y1="12" x2="100" y2="188" transform="rotate(${a} 100 100)"/>`).join('');
    return `<svg viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="103" r="95" fill="#000" opacity=".25"/>
      <circle cx="100" cy="100" r="94" fill="url(#g-dough)"/>${char}
      <path d="${sauce}Z" fill="${white ? '#F8ECD2' : 'url(#g-sauce)'}" stroke="${white ? '#EAD7B0' : '#B42A16'}" stroke-width="2" stroke-linejoin="round"/>
      ${tops}
      <g stroke="#6B3A15" stroke-opacity=".22" stroke-width="1.6">${cuts}</g>
      <ellipse cx="72" cy="64" rx="34" ry="12" transform="rotate(-30 72 64)" fill="#fff" opacity=".08"/>
    </svg>`;
  }

  const DISH = {
    focaccia: `<svg viewBox="0 0 200 200" aria-hidden="true" class="is-dish"><ellipse cx="100" cy="150" rx="84" ry="16" fill="#000" opacity=".3"/><rect x="22" y="58" width="156" height="88" rx="30" fill="#C98A3E"/><rect x="22" y="52" width="156" height="86" rx="30" fill="url(#g-dough)"/>
      <g fill="#C98A3E" opacity=".75"><circle cx="54" cy="80" r="5"/><circle cx="88" cy="74" r="5"/><circle cx="124" cy="82" r="5"/><circle cx="152" cy="76" r="5"/><circle cx="66" cy="110" r="5"/><circle cx="104" cy="104" r="5"/><circle cx="140" cy="112" r="5"/></g>
      <g stroke="#3F7A2E" stroke-width="3" stroke-linecap="round"><path d="M70 96l26-14M76 92l-3-7M84 88l-2-8M90 85l1-7M78 94l6 3M86 90l6 2"/><path d="M118 118l28-10M124 116l-2-7M132 113l0-7M140 110l2-6M126 116l5 4M134 113l6 2"/></g>
      <g fill="#fff" opacity=".85"><circle cx="64" cy="70" r="1.6"/><circle cx="112" cy="92" r="1.6"/><circle cx="150" cy="96" r="1.6"/><circle cx="92" cy="120" r="1.6"/></g></svg>`,
    bruschetta: `<svg viewBox="0 0 200 200" aria-hidden="true" class="is-dish"><ellipse cx="100" cy="158" rx="84" ry="14" fill="#000" opacity=".3"/>
      <g transform="rotate(-12 70 110)"><rect x="18" y="80" width="104" height="58" rx="22" fill="#B87430"/><rect x="22" y="76" width="96" height="52" rx="20" fill="#E8BC7A"/>
        <g fill="#D63D22" stroke="#A72814" stroke-width="1"><rect x="34" y="86" width="12" height="11" rx="3"/><rect x="52" y="92" width="13" height="11" rx="3"/><rect x="72" y="84" width="12" height="12" rx="3"/><rect x="92" y="94" width="12" height="11" rx="3"/><rect x="44" y="106" width="12" height="11" rx="3"/><rect x="80" y="108" width="12" height="10" rx="3"/></g>
        <use href="#leaf" x="56" y="98" width="30" height="15" transform="rotate(-20 71 105)"/></g>
      <g transform="rotate(10 140 120)"><rect x="92" y="96" width="98" height="56" rx="22" fill="#B87430"/><rect x="96" y="92" width="90" height="50" rx="20" fill="#E8BC7A"/>
        <g fill="#D63D22" stroke="#A72814" stroke-width="1"><rect x="106" y="102" width="12" height="11" rx="3"/><rect x="126" y="106" width="12" height="11" rx="3"/><rect x="148" y="100" width="12" height="12" rx="3"/><rect x="118" y="122" width="12" height="10" rx="3"/><rect x="160" y="120" width="11" height="10" rx="3"/></g>
        <use href="#leaf" x="132" y="116" width="30" height="15" transform="rotate(30 147 123)"/></g></svg>`,
    tiramisu: `<svg viewBox="0 0 200 200" aria-hidden="true" class="is-dish"><ellipse cx="100" cy="166" rx="74" ry="12" fill="#000" opacity=".3"/>
      <path d="M40 60h120v96a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8Z" fill="#F6EBDD" opacity=".14" stroke="#F6EBDD" stroke-opacity=".35" stroke-width="2"/>
      <rect x="44" y="132" width="112" height="28" rx="4" fill="#6B3A1E"/><rect x="44" y="114" width="112" height="18" fill="#FBF0D8"/><rect x="44" y="96" width="112" height="18" fill="#7A4424"/><rect x="44" y="76" width="112" height="20" fill="#FBF0D8"/>
      <rect x="44" y="68" width="112" height="10" rx="3" fill="#5A2E14"/>
      <g fill="#3A1C0C" opacity=".7"><circle cx="60" cy="72" r="1.6"/><circle cx="84" cy="70" r="1.4"/><circle cx="108" cy="73" r="1.6"/><circle cx="132" cy="70" r="1.4"/><circle cx="148" cy="73" r="1.6"/></g>
      <path d="M108 44c6-6 16-6 20 2-6 2-12 4-20-2Z" fill="#6FA35A"/><circle cx="100" cy="56" r="7" fill="#E2452B"/></svg>`,
    pannacotta: `<svg viewBox="0 0 200 200" aria-hidden="true" class="is-dish"><ellipse cx="100" cy="150" rx="86" ry="22" fill="#F6EBDD" opacity=".9"/><ellipse cx="100" cy="146" rx="70" ry="16" fill="#EADBC4"/>
      <path d="M58 140c0-40 14-74 42-74s42 34 42 74Z" fill="#FFF9EE"/><path d="M58 140c0-40 14-74 42-74 6 0 11 2 15 5-22 4-34 34-34 69Z" fill="#fff" opacity=".7"/>
      <path d="M68 86c10-12 54-12 64 0-4 14-12 10-14 22-4-8-8-4-12 4-4-10-10-6-14 2-4-12-12-10-14-14-4-6-8-6-10-14Z" fill="#C81E3A"/>
      <path d="M50 144c14 10 86 10 100 0" stroke="#C81E3A" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
      <circle cx="132" cy="134" r="6" fill="#8E1530"/><circle cx="70" cy="136" r="5" fill="#C81E3A"/></svg>`,
  };

  const visualFor = (it) => (it.dish && DISH[it.dish]) || pizzaSVG(it.id || it.name, it.art || { sauce: 'tomato', toppings: ['cheese', 'basil'] });

  /* ---------------------------------------------------------
     3. PRELOADER, BRASAS, CABECERA Y HERO
     --------------------------------------------------------- */
  class Embers {
    constructor(canvas, { density = 1, origin = null } = {}) {
      this.c = canvas; this.ctx = canvas.getContext('2d'); this.density = density; this.origin = origin;
      this.p = []; this.running = false; this.visible = true;
      this.resize = this.resize.bind(this); this.tick = this.tick.bind(this);
      this.resize();
      addEventListener('resize', this.resize);
      new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.play(); }).observe(canvas);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.play(); });
    }
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      const r = this.c.getBoundingClientRect();
      this.w = r.width; this.h = r.height;
      this.c.width = r.width * dpr; this.c.height = r.height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.max = Math.round(clamp(this.w * this.h / 15000, 22, 85) * this.density);
    }
    spawn(burst = false) {
      const o = this.origin ? this.origin() : null;
      const fromO = o && (burst || Math.random() < 0.4);
      const speed = burst ? 2.5 + Math.random() * 5 : 0.4 + Math.random() * 1.2;
      this.p.push({
        x: fromO ? o.x + (Math.random() - 0.5) * o.w : Math.random() * this.w,
        y: fromO ? o.y : this.h + 10,
        vx: (Math.random() - 0.5) * (burst ? 5 : 0.6), vy: -speed, life: 0,
        max: 90 + Math.random() * (burst ? 60 : 160), s: 0.8 + Math.random() * (burst ? 2.4 : 2),
        hue: 14 + Math.random() * 26, wob: Math.random() * Math.PI * 2,
      });
    }
    burst(n = 60) { if (reduced) return; for (let i = 0; i < n; i++) this.spawn(true); this.play(); }
    play() { if (reduced || this.running || !this.visible || document.hidden) return; this.running = true; requestAnimationFrame(this.tick); }
    tick() {
      if (!this.visible || document.hidden) { this.running = false; return; }
      const { ctx } = this;
      ctx.clearRect(0, 0, this.w, this.h);
      if (this.p.length < this.max && Math.random() < 0.6) this.spawn();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = this.p.length - 1; i >= 0; i--) {
        const p = this.p[i];
        p.life++; p.wob += 0.05; p.vx += Math.sin(p.wob) * 0.03; p.vy *= 0.992; p.vx *= 0.985; p.vy -= 0.004;
        p.x += p.vx; p.y += p.vy;
        const t = p.life / p.max;
        if (t >= 1 || p.y < -20) { this.p.splice(i, 1); continue; }
        const a = (t < 0.1 ? t / 0.1 : 1 - (t - 0.1) / 0.9) * (0.6 + 0.4 * Math.sin(p.life * 0.3));
        ctx.fillStyle = `hsla(${p.hue},85%,55%,${a * 0.12})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsla(${p.hue + 10},90%,${66 + p.s * 5}%,${a * 0.8})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(this.tick);
    }
  }

  const heroSection = $('.hero');
  const heroVisual = $('#heroVisual');
  const heroEmbers = !reduced && $('#heroEmbers') ? new Embers($('#heroEmbers'), {
    origin: () => {
      const hs = heroSection.getBoundingClientRect(), r = heroVisual.getBoundingClientRect();
      return { x: r.left - hs.left + r.width / 2, y: r.bottom - hs.top - r.height * 0.2, w: r.width * 0.5 };
    },
  }) : null;
  heroEmbers?.play();
  const clubEmbers = !reduced && $('#clubEmbers') ? new Embers($('#clubEmbers'), { density: 0.8 }) : null;
  clubEmbers?.play();

  // Preloader
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    $('#preloader')?.classList.add('is-done');
    root.classList.add('is-loaded');
    if (!reduced) { setTimeout(() => heroEmbers?.burst(45), 500); setTimeout(() => heroEmbers?.burst(70), 1300); }
  };
  const minDelay = reduced ? 0 : 900;
  const t0 = performance.now();
  const onReady = () => setTimeout(start, Math.max(0, minDelay - (performance.now() - t0)));
  if (document.readyState === 'complete') onReady(); else addEventListener('load', onReady);
  setTimeout(start, 3500);

  // Cabecera y menú móvil
  const header = $('#header');
  const toggle = $('.nav-toggle');
  const menu = $('#menu');
  let lastY = scrollY;
  if (toggle && menu) {
    let lastFocus = null;
    const open = () => {
      lastFocus = document.activeElement;
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Cerrar menú');
      document.body.classList.add('no-scroll');
      $('a', menu)?.focus({ preventScroll: true });
    };
    const close = (restore = true) => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú');
      document.body.classList.remove('no-scroll');
      setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 400);
      if (restore) (lastFocus || toggle).focus({ preventScroll: true });
    };
    toggle.addEventListener('click', () => (menu.classList.contains('is-open') ? close() : open()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = [toggle, ...$$('a', menu)], i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }
  const navLinks = $$('.nav a');
  if (navLinks.length) {
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  // Hero: inclinación 3D con el ratón + reacción al scroll
  const tilt = $('#heroTilt');
  const heroPizza = $('#heroPizza');
  const floaters = $$('.floater');
  const mouse = { x: 0, y: 0, cx: 0, cy: 0 };
  if (heroSection && !reduced && matchMedia('(pointer: fine)').matches) {
    heroSection.addEventListener('pointermove', (e) => {
      const r = heroSection.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width - 0.5;
      mouse.y = (e.clientY - r.top) / r.height - 0.5;
      requestTick();
    });
    heroSection.addEventListener('pointerleave', () => { mouse.x = 0; mouse.y = 0; requestTick(); });
  }
  function updateHero() {
    if (!tilt || reduced) return false;
    const p = clamp(scrollY / (heroSection.offsetHeight * 0.9));
    mouse.cx = lerp(mouse.cx, mouse.x, 0.08);
    mouse.cy = lerp(mouse.cy, mouse.y, 0.08);
    tilt.style.transform = `translate3d(${mouse.cx * 16}px, ${p * 80}px, 0) rotateX(${-mouse.cy * 14}deg) rotateY(${mouse.cx * 16}deg) scale(${1 - p * 0.08})`;
    heroPizza.style.transform = `rotate(${scrollY * 0.12 + mouse.cx * 20}deg)`;
    floaters.forEach((f) => {
      const d = parseFloat(f.dataset.depth) || 1;
      f.style.transform = `translate3d(${mouse.cx * d * 26}px, ${mouse.cy * d * 22 - p * d * 60}px, 0) rotate(calc(var(--r) + ${scrollY * 0.05 * d}deg))`;
    });
    return Math.abs(mouse.cx - mouse.x) > 0.001 || Math.abs(mouse.cy - mouse.y) > 0.001;
  }

  /* ---------------------------------------------------------
     4. ANATOMÍA: la pizza se separa en capas con el scroll
     --------------------------------------------------------- */
  const LAYERS = [
    { key: 'masa', name: 'La masa', desc: 'Harina, agua y paciencia. La base que lo sostiene todo, con un borde que pide ser mordido.', meta: 'La base · Sin prisa' },
    { key: 'tomate', name: 'El tomate', desc: 'Una capa de tomate que aporta color, frescura y ese punto ácido que despierta todo lo demás.', meta: 'Rojo · Fresco' },
    { key: 'mozzarella', name: 'La mozzarella', desc: 'Se funde, se estira y se dora. El momento más fotografiado de cualquier pizza.', meta: 'Fundida · Elástica' },
    { key: 'aceite', name: 'Aceite de oliva', desc: 'Un hilo de aceite para dar brillo y sabor. Poco, pero se nota.', meta: 'Brillo · Aroma' },
    { key: 'albahaca', name: 'La albahaca', desc: 'Unas hojas frescas al final. Verdes, aromáticas e irremplazables.', meta: 'Fresca · Aromática' },
  ];
  const build = $('#anatomia');
  let updateBuild = () => false, readBuild = () => false, buildMoving = false;
  if (build) {
    const stage = $('#buildStage');
    const pz = $('#pizza3d');
    const n = LAYERS.length;
    pz.innerHTML = LAYERS.map((l, i) => `<div class="p-layer" data-layer="${l.key}" style="z-index:${i + 1}"><svg viewBox="0 0 400 190" aria-hidden="true"><use href="#l-${l.key}"/></svg><span class="p-tag"><b>${String(i + 1).padStart(2, '0')}</b>${l.name}</span></div>`).join('') + '<div class="p-shadow"></div>';
    const layers = $$('.p-layer', pz);
    const panel = $('.build__panel');
    const bIndex = $('#buildIndex'), bName = $('#buildName'), bDesc = $('#buildDesc'), bMeta = $('#buildMeta');
    const bDone = $('#buildDone'), bBar = $('#buildBar'), halo = $('.build__halo');
    $('#buildSteps').innerHTML = LAYERS.map(() => '<li></li>').join('');
    const steps = $$('#buildSteps li');
    const B = { p: 0, target: 0, gap: 50, active: -2 };

    const measure = () => {
      const r = stage.getBoundingClientRect();
      const mobile = innerWidth <= 900;
      const availH = r.height * 0.92;
      const w = Math.max(240, Math.min(mobile ? r.width * 0.92 : r.width * 0.9, 680, availH / 0.475 / 1.45));
      pz.style.setProperty('--pw', w + 'px');
      B.gap = clamp((availH - w * 0.475) / (n - 1), 22, w * 0.26);
    };

    const setPanel = (idx) => {
      if (idx === B.active) return;
      B.active = idx;
      panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
      if (idx < 0) {
        bIndex.textContent = '00 / 05'; bName.textContent = 'Haz scroll';
        bDesc.textContent = 'Desmonta la pizza capa a capa y descubre qué hay dentro de cada porción.'; bMeta.textContent = '';
      } else if (idx >= n) {
        bIndex.textContent = '05 / 05'; bName.textContent = 'Todo junto, al horno';
        bDesc.textContent = 'Unos minutos de calor y todo se une: el borde se dora y el queso burbujea. Lista para compartir.';
        bMeta.textContent = 'Recién salida del horno';
      } else {
        const l = LAYERS[idx];
        bIndex.textContent = `${String(idx + 1).padStart(2, '0')} / 05`; bName.textContent = l.name; bDesc.textContent = l.desc; bMeta.textContent = l.meta;
      }
      steps.forEach((s, i) => s.classList.toggle('on', i <= idx));
      layers.forEach((l, i) => { l.classList.toggle('is-active', i === idx); l.classList.toggle('is-shown', i <= idx && idx < n); });
      bDone.classList.toggle('on', idx >= n);
      pz.classList.toggle('is-baked', idx >= n);
    };

    readBuild = () => {
      const r = build.getBoundingClientRect();
      B.target = clamp(-r.top / (build.offsetHeight - innerHeight));
      return r.bottom > 0 && r.top < innerHeight;
    };

    updateBuild = () => {
      B.p = reduced ? B.target : lerp(B.p, B.target, 0.14);
      if (Math.abs(B.p - B.target) < 0.0005) B.p = B.target;
      const p = B.p;
      const e = smooth(0.03, 0.13, p) * (1 - smooth(0.8, 0.88, p));
      const stepStart = 0.12, stepLen = 0.135;
      const idx = p < stepStart ? -1 : Math.min(n, Math.floor((p - stepStart) / stepLen));
      setPanel(idx);
      pz.classList.toggle('is-exploded', e > 0.5 && idx >= 0 && idx < n);
      layers.forEach((l, i) => {
        const y = ((n - 1) / 2 - i) * B.gap * e;
        const act = i === idx ? 1 : 0;
        const x = act * (i % 2 ? -1 : 1) * 16 * e;
        l.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${(i % 2 ? 1 : -1) * 2 * e}deg) scale(${1 + act * 0.04})`;
      });
      const land = smooth(0.9, 0.96, p);
      pz.style.transform = `rotate(${-3 + e * 3}deg) scale(${1 + land * 0.06})`;
      halo.style.transform = `scale(${0.9 + e * 0.3 + land * 0.2})`;
      bBar.style.transform = `scaleX(${p})`;
      return B.p !== B.target;
    };

    addEventListener('resize', () => { measure(); requestTick(); });
    document.fonts?.ready.then(() => { measure(); requestTick(); });
    measure();
    readBuild(); B.p = B.target; updateBuild();
  }

  /* ---------------------------------------------------------
     ENTRADA: la cámara se acerca a la puerta y entramos
     --------------------------------------------------------- */
  const intro = $('#entrada');
  let updateIntro = () => {};
  if (intro) {
    const scene = $('#introScene'), facade = $('#facade'), door = $('#door'), flash = $('#introFlash'), hint = $('#introHint');
    const fit = () => {
      // En vertical se muestra la fachada completa (meet) y el cielo rellena el resto
      const portrait = innerWidth / innerHeight < 0.95;
      facade.setAttribute('viewBox', portrait ? '440 60 720 940' : '0 0 1600 1000');
      facade.setAttribute('preserveAspectRatio', portrait ? 'xMidYMid meet' : 'xMidYMax slice');
      scene.style.transform = 'none';
      const sr = scene.getBoundingClientRect(), dr = door.getBoundingClientRect();
      scene.style.setProperty('--ox', `${((dr.left + dr.width / 2 - sr.left) / sr.width) * 100}%`);
      scene.style.setProperty('--oy', `${((dr.top + dr.height * 0.45 - sr.top) / sr.height) * 100}%`);
    };
    updateIntro = () => {
      if (reduced) return;
      const r = intro.getBoundingClientRect();
      if (r.bottom < 0) return;
      const p = clamp(-r.top / (intro.offsetHeight - innerHeight));
      const z = Math.pow(smooth(0.04, 0.92, p), 2.1);
      scene.style.transform = `scale(${(1 + z * 12).toFixed(4)})`;
      door.style.transform = `scaleX(${(1 - smooth(0.22, 0.58, p) * 0.88).toFixed(3)})`;
      flash.style.opacity = smooth(0.58, 0.95, p).toFixed(3);
      hint.style.opacity = (1 - smooth(0.02, 0.14, p)).toFixed(3);
    };
    fit();
    addEventListener('resize', () => { fit(); updateIntro(); });
    document.fonts?.ready.then(fit);
  }

  /* ---------------------------------------------------------
     Sección inmersiva: el recorte se abre al entrar
     --------------------------------------------------------- */
  const imm = $('.immersive');
  const immFrame = $('.immersive__frame');
  const immImg = $('.immersive__img');
  function updateImmersive() {
    if (!imm || reduced) return;
    const r = imm.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -100 || r.top > vh + 100) return;
    const enter = 1 - Math.pow(1 - clamp((vh - r.top) / vh), 3);
    const through = clamp(-r.top / Math.max(1, r.height - vh));
    const desk = innerWidth >= 1024;
    const ix = lerp(desk ? 7 : 4, 0, enter), iy = lerp(desk ? 9 : 4, 0, enter), rad = lerp(desk ? 30 : 18, 0, enter);
    immFrame.style.clipPath = `inset(${iy.toFixed(2)}% ${ix.toFixed(2)}% round ${rad.toFixed(1)}px)`;
    immImg.style.transform = `scale(${(1.16 - 0.16 * enter + (desk ? 0.06 * through : 0)).toFixed(4)})`;
  }

  /* ---------------------------------------------------------
     Bucle de scroll (un solo requestAnimationFrame)
     --------------------------------------------------------- */
  let ticking = false;
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function frame() {
    ticking = false;
    const y = scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 30);
      const menuOpen = menu?.classList.contains('is-open');
      if (!menuOpen && y > 500 && y > lastY + 4) header.classList.add('is-hidden');
      if (y < lastY - 4 || y < 500) header.classList.remove('is-hidden');
    }
    lastY = y;
    let again = false;
    if (heroSection && y < heroSection.offsetHeight * 1.1) again = updateHero() || again;
    if (build && (readBuild() || buildMoving)) { buildMoving = updateBuild(); again = buildMoving || again; }
    updateIntro();
    updateImmersive();
    if (again) requestTick();
  }
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', requestTick);
  requestTick();

  /* ---------------------------------------------------------
     5. CARTA CON PESTAÑAS + TU MESA
     --------------------------------------------------------- */
  const plus = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
  const cardsEl = $('#cards');
  const tabsEl = $('#tabs');
  if (cardsEl && tabsEl && MENU.length) {
    const render = (ci) => {
      cardsEl.innerHTML = (MENU[ci].items || []).map((it, i) => `
        <article class="card" style="--i:${i}">
          <div class="card__visual">
            ${it.badge ? `<span class="card__badge${it.hot ? ' hot' : ''}">${esc(it.badge)}</span>` : ''}
            ${visualFor(it)}
          </div>
          <div class="card__body">
            ${it.tag ? `<p class="card__tag">${esc(it.tag)}</p>` : ''}
            <div class="card__top"><h3>${esc(it.name)}</h3>${euro(it.price) ? `<span class="price">${euro(it.price)}</span>` : ''}</div>
            <p>${esc(it.description)}</p>
            <div class="card__foot"><button class="add-btn" type="button" data-add="${esc(it.id)}" aria-label="Añadir ${esc(it.name)} a tu mesa">${plus}<span>Añadir</span></button></div>
          </div>
        </article>`).join('');
    };
    tabsEl.innerHTML = MENU.map((c, i) => `<button role="tab" type="button" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.title)}</button>`).join('') + '<span class="tab-indicator" aria-hidden="true"></span>';
    const tabs = $$('[role="tab"]', tabsEl);
    const indicator = $('.tab-indicator', tabsEl);
    const moveIndicator = () => {
      const sel = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
      indicator.style.width = sel.offsetWidth + 'px';
      indicator.style.transform = `translateX(${sel.offsetLeft}px)`;
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        tabs.forEach((x) => { x.setAttribute('aria-selected', String(x === t)); x.tabIndex = x === t ? 0 : -1; });
        moveIndicator(); render(i);
      });
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next.focus(); next.click();
      });
    });
    render(0); moveIndicator();
    addEventListener('resize', moveIndicator);
    document.fonts?.ready.then(moveIndicator);
    cardsEl.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.card'); if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`); card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  // Tu mesa: lista para pedir en el local o por teléfono (no es un pedido online)
  const drawer = $('#cartDrawer');
  if (drawer) {
    const store = {
      get() { try { return JSON.parse(localStorage.getItem('cuor-mesa')) || {}; } catch (_) { return {}; } },
      set(v) { try { localStorage.setItem('cuor-mesa', JSON.stringify(v)); } catch (_) { /* sin almacenamiento */ } },
    };
    const backdrop = $('#drawerBackdrop'), body = $('#cartBody'), foot = $('#cartFoot'), fab = $('.cart-fab'), toast = $('#toast');
    let lastFocus = null, toastTimer;
    const showToast = (msg) => { toast.textContent = msg; toast.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('on'), 2200); };
    const cart = {
      items: Object.fromEntries(Object.entries(store.get()).filter(([id, q]) => byId[id] && q > 0)),
      count() { return Object.values(this.items).reduce((a, b) => a + b, 0); },
      total() { return Object.entries(this.items).reduce((a, [id, q]) => a + (byId[id].price || 0) * q, 0); },
      add(id) {
        if (!byId[id]) return;
        this.items[id] = (this.items[id] || 0) + 1; this.save();
        showToast(`${byId[id].name}, a tu mesa`);
        $$('[data-cart-count]').forEach((c) => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
      },
      change(id, d) { this.items[id] = (this.items[id] || 0) + d; if (this.items[id] <= 0) delete this.items[id]; this.save(); },
      save() { store.set(this.items); renderCart(); },
    };
    const summary = () => Object.entries(cart.items).map(([id, q]) => `${q} × ${byId[id].name}`).join('\n');

    function renderCart() {
      const nItems = cart.count();
      $$('[data-cart-count]').forEach((c) => { c.textContent = nItems; c.hidden = nItems === 0; });
      if (fab) fab.hidden = nItems === 0;
      foot.hidden = nItems === 0;
      if (!nItems) {
        body.innerHTML = `<div class="cart-empty"><svg aria-hidden="true"><use href="#heart"/></svg><strong>Tu mesa está vacía</strong>
          <p>Añade lo que te apetezca de la carta y llévate la lista preparada para pedir.</p>
          <a href="#carta" class="btn btn--outline btn--sm" data-close-cart>Ver la carta</a></div>`;
        return;
      }
      body.innerHTML = Object.entries(cart.items).map(([id, q]) => {
        const m = byId[id];
        return `<div class="cart-item"><div class="cart-thumb">${visualFor(m)}</div>
          <div><h4>${esc(m.name)}</h4><small>${euro((m.price || 0) * q)}</small></div>
          <div class="qty"><button type="button" data-qty="${esc(id)}" data-d="-1" aria-label="Quitar una ${esc(m.name)}">−</button><span aria-live="polite">${q}</span><button type="button" data-qty="${esc(id)}" data-d="1" aria-label="Añadir una ${esc(m.name)}">+</button></div></div>`;
      }).join('');
      $('#cartTotal').textContent = euro(cart.total());
      const actions = [];
      if (phone) actions.push(`<a class="btn btn--fire btn--block" href="tel:${esc(phone.replace(/[^\d+]/g, ''))}">Llamar y pedir · ${esc(phone)}</a>`);
      if (whatsapp) actions.push(`<a class="btn btn--outline btn--block" target="_blank" rel="noopener" href="https://wa.me/${whatsapp}?text=${encodeURIComponent('¡Hola! Me gustaría pedir:\n' + summary())}">Enviar por WhatsApp</a>`);
      if (links.delivery) actions.push(`<a class="btn btn--outline btn--block" target="_blank" rel="noopener" href="${esc(links.delivery)}">Pedir a domicilio</a>`);
      if (!actions.length) actions.push(`<a class="btn btn--fire btn--block" target="_blank" rel="noopener" href="${esc(mapsUrl)}">Cómo llegar al local</a>`);
      $('#cartActions').innerHTML = actions.join('');
    }

    const openCart = () => {
      lastFocus = document.activeElement;
      backdrop.hidden = false; requestAnimationFrame(() => backdrop.classList.add('on'));
      drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      setTimeout(() => $('#cartClose').focus(), 60);
    };
    const closeCart = () => {
      backdrop.classList.remove('on'); drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      setTimeout(() => { backdrop.hidden = true; }, 400);
      lastFocus?.focus?.();
    };
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) {
        cart.add(add.dataset.add);
        add.classList.add('added');
        const label = $('span', add); if (label) label.textContent = '¡Dentro!';
        setTimeout(() => { add.classList.remove('added'); if (label) label.textContent = 'Añadir'; }, 1200);
      }
      if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openCart(); }
      const q = e.target.closest('[data-qty]');
      if (q) cart.change(q.dataset.qty, +q.dataset.d);
      if (e.target.closest('[data-close-cart]')) closeCart();
    });
    $('#cartClose').addEventListener('click', closeCart);
    backdrop.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => {
      if (!drawer.classList.contains('open')) return;
      if (e.key === 'Escape') closeCart();
      if (e.key === 'Tab') {
        const f = $$('button, a[href]', drawer).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    renderCart();
  }

  /* ---------------------------------------------------------
     6. REVELADOS, FOOTER, CARTA COMPLETA Y SEO
     --------------------------------------------------------- */
  const revealIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); revealIO.unobserve(e.target);
  }), { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  const observe = (el) => (reduced ? el.classList.add('in') : revealIO.observe(el));

  const fill = (k, html) => $$(`[data-fill="${k}"]`).forEach((el) => { el.innerHTML = html; });
  fill('city', esc([addr.locality, addr.region || C.region].filter(Boolean).join(' · ')));
  fill('address', [addr.street ? esc(addr.street) : placeholder('Dirección por confirmar'), [addr.postalCode, addr.locality].filter(Boolean).map(esc).join(' '), esc(addr.region || C.region || '')].filter(Boolean).join('<br>'));
  const hours = Array.isArray(C.hours) ? C.hours : [];
  fill('hours', hours.length ? hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('') : `<div><dt>${placeholder('Horario por confirmar')}</dt></div>`);
  fill('contact', [
    phone ? `<li><a href="tel:${esc(phone.replace(/[^\d+]/g, ''))}">${esc(phone)}</a></li>` : `<li>${placeholder('Teléfono por confirmar')}</li>`,
    whatsapp ? `<li><a href="https://wa.me/${whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>` : '',
    contact.email ? `<li><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>` : `<li>${placeholder('Email por confirmar')}</li>`,
  ].join(''));
  fill('social', (C.social || []).map((s) => (s.url ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>` : `<li>${esc(s.name)} · ${placeholder('pendiente')}</li>`)).join(''));
  fill('legal', [[links.legalNotice, 'Aviso legal'], [links.privacy, 'Privacidad'], [links.cookies, 'Cookies']]
    .map(([u, l]) => (u ? `<li><a href="${esc(u)}">${l}</a></li>` : `<li>${placeholder(l + ' (pendiente)')}</li>`)).join(''));
  fill('year', String(new Date().getFullYear()));

  // Botones que solo existen si el servicio existe de verdad
  const extra = [];
  if (phone) extra.push(`<a class="btn btn--outline" href="tel:${esc(phone.replace(/[^\d+]/g, ''))}">Llamar</a>`);
  if (links.reservation) extra.push(`<a class="btn btn--outline" href="${esc(links.reservation)}" target="_blank" rel="noopener">Reservar mesa</a>`);
  if (links.delivery) extra.push(`<a class="btn btn--outline" href="${esc(links.delivery)}" target="_blank" rel="noopener">Pedir a domicilio</a>`);
  ['#place-actions', '#cta-actions'].forEach((s) => $(s)?.insertAdjacentHTML('beforeend', extra.join('')));

  // Carta completa (carta.html)
  const list = $('#menu-list');
  if (list) {
    const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cats = $('#menu-cats');
    if (cats) cats.innerHTML = MENU.map((c) => `<a href="#${slug(c.title)}">${esc(c.title)}</a>`).join('');
    list.innerHTML = MENU.map((cat) => `
      <section class="menu-cat" id="${slug(cat.title)}" aria-labelledby="t-${slug(cat.title)}">
        <header class="reveal"><h2 class="menu-cat__title" id="t-${slug(cat.title)}" lang="it">${esc(cat.title)}</h2>${cat.note ? `<p class="menu-cat__note">${esc(cat.note)}</p>` : ''}</header>
        <ul class="menu-items">${(cat.items || []).map((it) => `
          <li class="menu-item reveal" id="${esc(it.id)}"><div class="menu-item__row"><h3 class="menu-item__name">${esc(it.name)}</h3><span class="menu-item__leader" aria-hidden="true"></span>${euro(it.price) ? `<span class="menu-item__price">${euro(it.price)}</span>` : ''}</div>
          ${it.description ? `<p class="menu-item__desc">${esc(it.description)}</p>` : ''}</li>`).join('')}</ul>
      </section>`).join('');
    const pdf = $('#menu-pdf');
    if (pdf && links.menuPdf) { pdf.href = links.menuPdf; pdf.hidden = false; }
  }
  $$('.reveal').forEach(observe);

  // Datos estructurados: solo los campos reales
  const data = {
    '@context': 'https://schema.org', '@type': 'Restaurant', name: C.name || 'Cuor di Pizza', servesCuisine: ['Pizza', 'Italiana'],
    image: new URL('assets/img/og-cuor-di-pizza.jpg', location.href).href, menu: new URL(menuUrl, location.href).href,
    address: { '@type': 'PostalAddress', streetAddress: addr.street || undefined, postalCode: addr.postalCode || undefined, addressLocality: addr.locality || undefined, addressRegion: addr.region || C.region || undefined, addressCountry: addr.country || 'ES' },
    telephone: phone || undefined, email: contact.email || undefined, url: C.url || undefined,
    parentOrganization: C.group ? { '@type': 'Organization', name: C.group } : undefined,
  };
  const oh = hours.map((h) => h.schema).filter(Boolean); if (oh.length) data.openingHours = oh;
  const sameAs = (C.social || []).map((s) => s.url).filter(Boolean); if (sameAs.length) data.sameAs = sameAs;
  if (links.reservation) data.acceptsReservations = links.reservation;
  const ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.textContent = JSON.stringify(data); document.head.appendChild(ld);
})();
