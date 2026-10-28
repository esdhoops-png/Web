/* ==========================================================================
   Cuor di Pizza · Interacción y movimiento
   Sin dependencias. Partes:
   1. Contenido: pinta pizzas, carta, footer y enlaces desde config.js
   2. Navegación: estado al hacer scroll, menú móvil, sección activa
   3. Revelado: IntersectionObserver añade .is-in una sola vez
   4. Motor de scroll: un único requestAnimationFrame para parallax,
      recorrido horizontal, imagen inmersiva, CTA y marquesina
   ========================================================================== */
(() => {
  'use strict';

  const C = window.CUOR || {};
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqDesktop = matchMedia('(min-width: 1024px)');
  const mqTablet = matchMedia('(min-width: 768px)');

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const placeholder = (text) => `<span class="is-placeholder" title="Dato pendiente: complétalo en assets/js/config.js">${esc(text)}</span>`;
  const formatPrice = (n) => (typeof n === 'number'
    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0 }).format(n)
    : '');

  /* ------------------------------------------------------------------ */
  /* 1. Contenido                                                       */
  /* ------------------------------------------------------------------ */
  const links = C.links || {};
  const contact = C.contact || {};
  const addr = contact.address || {};
  const menuUrl = links.menu || 'carta.html';
  const mapsUrl = links.maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([C.name || 'Cuor di Pizza', addr.street, addr.locality, addr.region || C.region].filter(Boolean).join(' '))}`;

  function renderLinks() {
    $$('[data-link="menu"]').forEach((a) => { a.href = menuUrl; });
    $$('[data-link="maps"]').forEach((a) => { a.href = mapsUrl; a.target = '_blank'; a.rel = 'noopener'; });

    // Botones que solo existen si el servicio existe de verdad.
    const ctaActions = $('#cta-actions');
    const extra = [
      [links.reservation, 'Reservar mesa'],
      [links.delivery, 'Pedir a domicilio'],
    ].filter(([url]) => url);
    if (ctaActions) {
      extra.forEach(([url, label]) => {
        ctaActions.insertAdjacentHTML('beforeend',
          `<a class="btn btn--outline-light" href="${esc(url)}" target="_blank" rel="noopener"><span class="btn__label">${esc(label)}</span></a>`);
      });
    }
    // Si hay pedidos online, el botón de la barra pasa a «Pedir ahora».
    const navCta = $('.nav__cta');
    if (navCta && links.delivery && navCta.dataset.link === 'menu') {
      navCta.href = links.delivery; navCta.target = '_blank'; navCta.rel = 'noopener';
      navCta.removeAttribute('data-link');
      $('.btn__label', navCta).textContent = 'Pedir ahora';
    }
  }

  // Las pizzas destacadas usan recortes cuadrados (base-500.webp / base-900.webp).
  const imgSet = (base, alt, sizes) =>
    `<img class="pcard__img" src="${esc(base)}-900.webp" srcset="${esc(base)}-500.webp 500w, ${esc(base)}-900.webp 900w" sizes="${sizes}" alt="${esc(alt)}" loading="lazy" decoding="async" width="900" height="900">`;

  function renderFeatured() {
    const list = $('#pizzas');
    if (!list || !Array.isArray(C.featured)) return;
    list.innerHTML = C.featured.map((p, i) => {
      const price = formatPrice(p.price);
      return `
      <li class="pcard" data-reveal="up" style="--d:${i % 2}">
        <a class="pcard__link" href="${esc(menuUrl)}#${esc(p.id)}">
          <span class="pcard__num">N.º ${String(i + 1).padStart(2, '0')}</span>
          ${price ? `<span class="pcard__price">${price}</span>` : ''}
          <div class="pcard__plate">
            <div class="pcard__spin" data-spin="${i % 2 ? -0.04 : 0.04}">
              ${imgSet(p.image, p.alt || p.name, '(min-width: 960px) 30vw, 70vw')}
            </div>
          </div>
          <h3 class="pcard__name">${esc(p.name)}</h3>
          <p class="pcard__desc">${esc(p.description)}</p>
          ${(p.ingredients || []).length ? `<ul class="pcard__ing" aria-label="Ingredientes">${p.ingredients.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          <span class="pcard__more">Descúbrela en la carta</span>
        </a>
      </li>`;
    }).join('');
  }

  function renderMenuPage() {
    const wrap = $('#menu-list');
    if (!wrap || !Array.isArray(C.menu)) return;
    const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cats = $('#menu-cats');
    if (cats) cats.innerHTML = C.menu.map((c) => `<a href="#${slug(c.title)}">${esc(c.title)}</a>`).join('');
    wrap.innerHTML = C.menu.map((cat) => `
      <section class="menu-cat" id="${slug(cat.title)}" aria-labelledby="t-${slug(cat.title)}">
        <header data-reveal="up">
          <h2 class="menu-cat__title" id="t-${slug(cat.title)}" lang="it">${esc(cat.title)}</h2>
          ${cat.note ? `<p class="menu-cat__note">${esc(cat.note)}</p>` : ''}
        </header>
        <ul class="menu-items">
          ${(cat.items || []).map((it, i) => `
            <li class="menu-item" id="${esc(it.id || slug(it.name))}" data-reveal="up" style="--d:${Math.min(i, 3)}">
              <div class="menu-item__row">
                <h3 class="menu-item__name">${esc(it.name)}</h3>
                <span class="menu-item__leader" aria-hidden="true"></span>
                ${formatPrice(it.price) ? `<span class="menu-item__price">${formatPrice(it.price)}</span>` : ''}
              </div>
              ${it.description ? `<p class="menu-item__desc">${esc(it.description)}</p>` : ''}
            </li>`).join('')}
        </ul>
      </section>`).join('');

    const pdf = $('#menu-pdf');
    if (pdf && links.menuPdf) { pdf.href = links.menuPdf; pdf.hidden = false; }
  }

  function renderFooter() {
    const fill = (k, html) => $$(`[data-fill="${k}"]`).forEach((el) => { el.innerHTML = html; });

    const line1 = addr.street ? esc(addr.street) : placeholder('Dirección por confirmar');
    const line2 = [addr.postalCode, addr.locality].filter(Boolean).map(esc).join(' ');
    fill('address', [line1, line2, esc(addr.region || C.region || '')].filter(Boolean).join('<br>'));

    const hours = Array.isArray(C.hours) ? C.hours : [];
    fill('hours', hours.length
      ? hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('')
      : `<div><dt>${placeholder('Horario por confirmar')}</dt></div>`);

    const items = [];
    items.push(contact.phone
      ? `<li><a href="tel:${esc(contact.phone.replace(/[^\d+]/g, ''))}">${esc(contact.phone)}</a></li>`
      : `<li>${placeholder('Teléfono por confirmar')}</li>`);
    if (contact.whatsapp) items.push(`<li><a href="https://wa.me/${esc(contact.whatsapp.replace(/\D/g, ''))}" target="_blank" rel="noopener">WhatsApp</a></li>`);
    items.push(contact.email
      ? `<li><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>`
      : `<li>${placeholder('Email por confirmar')}</li>`);
    fill('contact', items.join(''));

    fill('social', (C.social || []).map((s) => (s.url
      ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`
      : `<li>${esc(s.name)} · ${placeholder('enlace pendiente')}</li>`)).join(''));

    fill('legal', [
      [links.legalNotice, 'Aviso legal'],
      [links.privacy, 'Privacidad'],
      [links.cookies, 'Cookies'],
    ].map(([url, label]) => (url ? `<li><a href="${esc(url)}">${label}</a></li>` : `<li>${placeholder(`${label} (pendiente)`)}</li>`)).join(''));

    fill('year', String(new Date().getFullYear()));

    if (C.demoMenu) $$('[data-demo-note]').forEach((el) => { el.hidden = false; });
  }

  // Datos estructurados para SEO local: solo se publican los campos reales.
  function renderSchema() {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: C.name || 'Cuor di Pizza',
      servesCuisine: ['Pizza', 'Italiana'],
      image: new URL('assets/img/og-cuor-di-pizza.jpg', location.href).href,
      menu: new URL(menuUrl, location.href).href,
      address: {
        '@type': 'PostalAddress',
        streetAddress: addr.street || undefined,
        postalCode: addr.postalCode || undefined,
        addressLocality: addr.locality || undefined,
        addressRegion: addr.region || C.region || undefined,
        addressCountry: addr.country || 'ES',
      },
      telephone: contact.phone || undefined,
      email: contact.email || undefined,
      url: C.url || undefined,
      openingHours: (C.hours || []).map((h) => h.schema).filter(Boolean),
      sameAs: (C.social || []).map((s) => s.url).filter(Boolean),
      parentOrganization: C.group ? { '@type': 'Organization', name: C.group } : undefined,
    };
    if (links.reservation) data.acceptsReservations = links.reservation;
    if (!data.openingHours.length) delete data.openingHours;
    if (!data.sameAs.length) delete data.sameAs;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  // Duplica la etiqueta de los botones para el efecto de texto que rueda.
  function enhanceButtons() {
    $$('.btn__label').forEach((label) => {
      if (label.querySelector('.btn__roll')) return;
      const t = esc(label.textContent.trim());
      label.innerHTML = `<span class="btn__roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. Navegación                                                      */
  /* ------------------------------------------------------------------ */
  function initNav() {
    const nav = $('#nav');
    if (!nav) return;
    const setScrolled = () => nav.classList.toggle('is-scrolled', scrollY > 24);
    setScrolled();
    addEventListener('scroll', setScrolled, { passive: true });

    // Menú móvil
    const toggle = $('.nav__toggle');
    const menu = $('#menu');
    if (toggle && menu) {
      let lastFocus = null;
      const focusables = () => [toggle, ...$$('a, button', menu)];
      const open = () => {
        lastFocus = document.activeElement;
        menu.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Cerrar menú');
        root.style.overflow = 'hidden';
        nav.classList.add('is-scrolled');
        $('a', menu)?.focus({ preventScroll: true });
      };
      const close = (restoreFocus = true) => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        root.style.overflow = '';
        setScrolled();
        setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 450);
        if (restoreFocus) (lastFocus || toggle).focus({ preventScroll: true });
      };
      toggle.addEventListener('click', () => (menu.classList.contains('is-open') ? close() : open()));
      menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
      document.addEventListener('keydown', (e) => {
        if (!menu.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'Tab') {
          const f = focusables();
          const i = f.indexOf(document.activeElement);
          if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
      });
      mqDesktop.addEventListener?.('change', () => { if (menu.classList.contains('is-open')) close(false); });
    }

    // Enlace activo según la sección visible
    const navLinks = $$('[data-nav]');
    if (!navLinks.length) return;
    const map = { inicio: 'inicio', esencia: 'esencia', elaboracion: 'esencia', carta: 'carta', experiencia: 'carta', visitanos: 'contacto', contacto: 'contacto' };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const key = map[e.target.id];
        navLinks.forEach((a) => {
          const on = a.dataset.nav === key;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 3. Revelado al entrar en pantalla (una sola vez)                    */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    const els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || mqReduce.matches) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    // Una máscara cerrada (clip-path al 100 %) no "intersecta" nunca, así que
    // se observa su contenedor y se le añade la clase a ella.
    const targets = new Map();
    els.forEach((el) => {
      const t = el.dataset.reveal === 'mask' ? el.parentElement : el;
      targets.set(t, [...(targets.get(t) || []), el]);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        targets.get(e.target).forEach((el) => el.classList.add('is-in'));
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((_, t) => io.observe(t));
  }

  function initHeroIntro() {
    const img = $('.hero__img');
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const decoded = img && img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    const timeout = new Promise((r) => setTimeout(r, 1400));
    Promise.race([Promise.all([fonts, decoded]), timeout]).then(() => {
      requestAnimationFrame(() => root.classList.add('is-ready'));
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Motor de scroll                                                  */
  /* ------------------------------------------------------------------ */
  const effects = [];
  const visible = new WeakMap();
  const watcher = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => visible.set(e.target, e.isIntersecting)), { rootMargin: '30% 0px 30% 0px' })
    : null;

  function addEffect(el, fx) {
    if (!el) return;
    fx.el = el;
    effects.push(fx);
    visible.set(el, true);
    watcher?.observe(el);
  }

  let ticking = false;
  const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  function frame() {
    ticking = false;
    const vh = innerHeight, vw = innerWidth;
    // Primero todas las lecturas, después todas las escrituras.
    const batch = [];
    for (const fx of effects) {
      if (!fx.enabled()) { if (!fx.off) { fx.reset?.(); fx.off = true; } continue; }
      fx.off = false;
      if (visible.get(fx.el)) batch.push([fx, fx.el.getBoundingClientRect()]);
    }
    for (const [fx, rect] of batch) fx.update(rect, vh, vw);
  }

  const motionOK = () => !mqReduce.matches;

  // Parallax sutil: [data-speed] se desplaza unos píxeles respecto al scroll.
  function initParallax() {
    $$('[data-speed]').forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0;
      const state = { y: 0 };
      addEffect(el, {
        enabled: () => motionOK() && mqTablet.matches,
        update(r, vh) {
          const top = r.top - state.y; // posición sin el desplazamiento actual
          const center = top + r.height / 2 - vh / 2;
          state.y = clamp(-center * speed, -110, 110);
          el.style.transform = `translate3d(0, ${state.y.toFixed(1)}px, 0)`;
        },
        reset() { state.y = 0; el.style.transform = ''; },
      });
    });
  }

  // Elaboración: recorrido horizontal en escritorio, vertical en el resto.
  function initProcess() {
    const section = $('.process');
    if (!section) return;
    const sticky = $('.process__sticky', section);
    const track = $('.process__track', section);
    const steps = $$('.step', section);
    const labels = $$('.process__progress span', section);
    const bar = $('.process__bar', section);
    const from = [30, 74, 44];    // --basil
    const to = [26, 14, 9];       // --oven
    let dist = 0, data = [];

    const horizontal = () => motionOK() && mqDesktop.matches;

    function layout() {
      if (horizontal()) {
        section.classList.add('is-h');
        track.style.transform = 'translate3d(0,0,0)';
        dist = Math.max(0, track.scrollWidth - innerWidth);
        section.style.height = `${dist + innerHeight}px`;
        // .step__media es relativa y su offsetParent es el track.
        data = steps.map((s) => {
          const media = $('.step__media', s);
          return { img: $('.step__img', s), center: media.offsetLeft + media.offsetWidth / 2 };
        });
      } else {
        section.classList.remove('is-h', 'is-dark');
        section.style.height = '';
        track.style.transform = '';
        sticky.style.backgroundColor = '';
        steps.forEach((s) => { const img = $('.step__img', s); if (img) img.style.removeProperty('--px'); });
      }
      requestFrame();
    }

    addEffect(section, {
      enabled: horizontal,
      update(r, vh, vw) {
        if (!section.classList.contains('is-h')) return;
        const p = dist ? clamp(-r.top / dist) : 0;
        const x = -p * dist;
        track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
        bar?.style.setProperty('--p', p.toFixed(4));

        // Cada foto se mueve dentro de su marco (parallax horizontal).
        let active = 0, best = Infinity;
        const offs = data.map((d, i) => {
          const off = (d.center + x - vw / 2) / vw;
          if (Math.abs(off) < best) { best = Math.abs(off); active = i; }
          d.img?.style.setProperty('--px', `${(-6.9 - clamp(off, -1, 1) * 5.5).toFixed(2)}%`);
          return off;
        });
        labels.forEach((l, i) => l.classList.toggle('is-active', i === active));

        // Cambio progresivo de fondo: harina → espresso a medida que el
        // horno llega al centro de la pantalla.
        const fire = offs[offs.length - 1] ?? 1;
        const k = clamp((0.32 - fire) / 0.32);
        const t = k * k * (3 - 2 * k);
        sticky.style.backgroundColor = `rgb(${from.map((c, i) => Math.round(lerp(c, to[i], t))).join(',')})`;
        section.classList.toggle('is-dark', t > 0.5);
      },
    });

    let rt;
    const relayout = () => { clearTimeout(rt); rt = setTimeout(layout, 120); };
    addEventListener('resize', relayout);
    mqDesktop.addEventListener?.('change', layout);
    mqReduce.addEventListener?.('change', layout);
    addEventListener('load', layout);
    layout();
  }

  // Sección inmersiva: el recorte se abre y la imagen se acerca suavemente.
  function initImmersive() {
    const section = $('.immersive');
    if (!section) return;
    const frameEl = $('.immersive__frame', section);
    const img = $('.immersive__img', section);
    addEffect(section, {
      enabled: motionOK,
      update(r, vh) {
        const enter = easeOut(clamp((vh - r.top) / vh));
        const through = clamp(-r.top / Math.max(1, r.height - vh));
        const desktop = mqDesktop.matches;
        const ix = lerp(desktop ? 7 : 4, 0, enter);
        const iy = lerp(desktop ? 9 : 4, 0, enter);
        const rad = lerp(desktop ? 28 : 18, 0, enter);
        frameEl.style.clipPath = `inset(${iy.toFixed(2)}% ${ix.toFixed(2)}% round ${rad.toFixed(1)}px)`;
        img.style.transform = `scale(${(1.16 - 0.16 * enter + (desktop ? 0.06 * through : 0)).toFixed(4)})`;
      },
      reset() { frameEl.style.clipPath = ''; img.style.transform = ''; },
    });
  }

  // CTA: el bloque rojo se ensancha hasta ocupar todo el ancho.
  function initCta() {
    const panel = $('.cta__panel');
    if (!panel) return;
    addEffect(panel, {
      enabled: motionOK,
      update(r, vh) {
        const t = easeOut(clamp((vh - r.top) / (vh * 0.85)));
        const ix = lerp(mqTablet.matches ? 5 : 3, 0, t);
        const rad = lerp(40, 0, t);
        panel.style.clipPath = `inset(0 ${ix.toFixed(2)}% round ${rad.toFixed(1)}px ${rad.toFixed(1)}px 0 0)`;
      },
      reset() { panel.style.clipPath = ''; },
    });
  }

  // Cintas que solo se mueven con el scroll (nunca solas): [data-marquee="k"].
  function initMarquee() {
    $$('[data-marquee]').forEach((track) => {
      const k = parseFloat(track.dataset.marquee) || 0.3;
      addEffect(track.parentElement, {
        enabled: motionOK,
        update(r, vh) {
          const x = (r.top - vh) * -k - track.scrollWidth * 0.08;
          track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
        },
        reset() { track.style.transform = ''; },
      });
    });
  }

  // Giro ligado al scroll: pizzas y sello. [data-spin="grados por píxel"].
  function initSpin() {
    $$('[data-spin]').forEach((el) => {
      const k = parseFloat(el.dataset.spin) || 0;
      addEffect(el, {
        enabled: motionOK,
        update(r, vh) {
          const deg = (vh / 2 - (r.top + r.height / 2)) * k;
          el.style.transform = `rotate(${deg.toFixed(2)}deg)`;
        },
        reset() { el.style.transform = ''; },
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Arranque                                                            */
  /* ------------------------------------------------------------------ */
  renderLinks();
  renderFeatured();
  renderMenuPage();
  renderFooter();
  renderSchema();
  enhanceButtons();
  initNav();
  initReveal();
  initHeroIntro();
  initParallax();
  initProcess();
  initImmersive();
  initCta();
  initMarquee();
  initSpin();

  addEventListener('scroll', requestFrame, { passive: true });
  addEventListener('resize', requestFrame);
  mqReduce.addEventListener?.('change', () => { if (mqReduce.matches) $$('[data-reveal]').forEach((el) => el.classList.add('is-in')); requestFrame(); });
  requestFrame();
})();
