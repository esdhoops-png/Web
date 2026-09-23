/* =============================================================
   HEINEKEN 5MENTARIOS — interacciones
   El contenido sale de js/data.js (window.SITE).
   ============================================================= */
(() => {
  'use strict';

  const SITE = window.SITE || {};
  const CFG = SITE.config || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, size = 20) => `<svg width="${size}" height="${size}" aria-hidden="true"><use href="#${id}"/></svg>`;

  /** Un valor está sin configurar si falta o sigue siendo un placeholder "[...]" */
  const isPH = (v) => !v || /^\s*\[.*\]\s*$/.test(String(v));

  /* ---------------- fechas ---------------- */
  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const toDate = (d, t = '00:00') => {
    const [y, m, day] = d.split('-').map(Number);
    const [hh, mm] = t.split(':').map(Number);
    return new Date(y, m - 1, day, hh, mm);
  };
  const fmtLong = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()}`;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const TYPE = {
    tardeo: { label: 'Tardeo', icon: 'i-beer', reserve: 'Tardeo' },
    futbol: { label: 'Fútbol', icon: 'i-ball', reserve: 'Partido' },
    live: { label: 'Música en directo', icon: 'i-music', reserve: 'Música en directo' },
    dj: { label: 'DJ set', icon: 'i-headphones', reserve: 'DJ / Noche' },
    fiesta: { label: 'Fiesta', icon: 'i-moon', reserve: 'DJ / Noche' }
  };

  /* ---------------- toast ---------------- */
  const toastEl = $('#toast');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('on'), 3200);
  }

  /* ---------------- datos del local ---------------- */
  $$('[data-cfg]').forEach((el) => {
    const v = CFG[el.dataset.cfg];
    el.textContent = v || '';
    el.classList.toggle('is-placeholder', isPH(v));
  });
  $$('[data-instagram]').forEach((a) => {
    if (!isPH(CFG.instagramUrl)) { a.href = CFG.instagramUrl; a.target = '_blank'; a.rel = 'noopener'; }
    else a.addEventListener('click', (e) => { e.preventDefault(); toast('Añade la URL de Instagram en js/data.js (instagramUrl).'); });
  });
  const phoneLink = $('#phoneLink');
  if (!isPH(CFG.phone)) phoneLink.href = 'tel:' + CFG.phone.replace(/[^\d+]/g, '');
  else phoneLink.addEventListener('click', (e) => { e.preventDefault(); toast('Añade el teléfono en js/data.js (phone).'); });
  const mapsBtn = $('#mapsBtn');
  if (!isPH(CFG.mapsUrl)) { mapsBtn.href = CFG.mapsUrl; mapsBtn.target = '_blank'; mapsBtn.rel = 'noopener'; }
  else if (!isPH(CFG.address)) { mapsBtn.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CFG.address); mapsBtn.target = '_blank'; mapsBtn.rel = 'noopener'; }
  else mapsBtn.addEventListener('click', (e) => { e.preventDefault(); toast('Añade la dirección o el enlace de Google Maps en js/data.js.'); });
  $('#year').textContent = new Date().getFullYear();

  /* ---------------- loader ---------------- */
  const loader = $('#loader');
  const t0 = performance.now();
  let ready = false;
  function enter() {
    if (ready) return;
    ready = true;
    loader.classList.add('out');
    document.documentElement.classList.add('is-ready');
    setTimeout(() => loader.remove(), 600);
  }
  const minShow = reduced ? 0 : 1000;
  window.addEventListener('load', () => setTimeout(enter, Math.max(0, minShow - (performance.now() - t0))));
  setTimeout(enter, reduced ? 200 : 1500); // nunca más de 1,5 s
  $('#loaderSkip').addEventListener('click', enter);
  loader.addEventListener('click', enter);
  window.addEventListener('keydown', enter, { once: true });

  /* ---------------- hero ---------------- */
  if (CFG.heroVideo) {
    const media = $('#heroMedia');
    const v = document.createElement('video');
    Object.assign(v, { src: CFG.heroVideo, muted: true, loop: true, playsInline: true, autoplay: !reduced, poster: 'img/hero.jpg' });
    v.setAttribute('aria-hidden', 'true');
    media.innerHTML = '';
    media.appendChild(v);
  }
  const todayItems = (SITE.today && SITE.today.items) || [];
  $('#heroToday').innerHTML = todayItems.map((it) =>
    `<li>${icon((TYPE[it.type] || TYPE.fiesta).icon, 18)}<span>${esc(it.title)}</span><time>${esc(it.time)}</time></li>`).join('');

  // sonido: solo al pulsar y solo si hay archivo configurado
  const soundBtn = $('#soundBtn');
  let audio = null;
  soundBtn.addEventListener('click', () => {
    if (!CFG.sound) { toast('Audio pendiente: añade un archivo en js/data.js (sound).'); return; }
    if (!audio) { audio = new Audio(CFG.sound); audio.loop = true; audio.volume = .6; }
    const on = soundBtn.getAttribute('aria-pressed') !== 'true';
    soundBtn.setAttribute('aria-pressed', String(on));
    $('.sound-label', soundBtn).textContent = on ? 'Sound on' : 'Play sound';
    if (on) audio.play().catch(() => toast('No se pudo reproducir el audio.')); else audio.pause();
  });

  /* ---------------- navegación ---------------- */
  const nav = $('#nav');
  const burger = $('#burger');
  const menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('locked', open);
    nav.classList.remove('hide');
    if (open) setTimeout(() => $('a', menu).focus(), 250);
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  const sections = $$('main section[id]');
  const navLinks = $$('.nav-links a');
  function navObserverFactory() {
    return new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = ['hoy', 'experiencia'].includes(e.target.id) ? 'inicio' : e.target.id === 'noche' ? 'musica' : e.target.id;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
  }
  const navObserver = navObserverFactory();

  /* ---------------- scroll (un solo rAF) ---------------- */
  const hero = $('.hero');
  const expFlow = $('#expFlow');
  const expItems = $$('li', expFlow);
  const badge = $('.exp-badge');
  const night = $('#noche');
  const nightClock = $('#nightClock');
  const nightSteps = $$('#nightSteps li');
  const mobileCta = $('.mobile-cta');
  const booking = $('#reservas');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    if (!menu.classList.contains('open')) nav.classList.toggle('hide', y > vh * .8 && y > lastY + 6);
    if (y < lastY - 6) nav.classList.remove('hide');
    lastY = y;

    // hero
    if (!reduced && y < hero.offsetHeight) hero.style.setProperty('--hp', clamp(y / hero.offsetHeight).toFixed(3));

    // experiencia: los conceptos se encienden al pasar por el centro
    let lit = 0;
    expItems.forEach((li) => { const on = li.getBoundingClientRect().top < vh * .62; li.classList.toggle('on', on); if (on) lit++; });
    expFlow.style.setProperty('--flow', expItems.length > 1 ? clamp((lit - 1) / (expItems.length - 1)) : 0);
    if (badge && !reduced) badge.style.setProperty('--rot', (y * .04).toFixed(1));

    // tarde → noche
    const r = night.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) {
      const p = clamp(-r.top / (night.offsetHeight - vh));
      night.style.setProperty('--np', smooth(.12, .78, p).toFixed(3));
      const mins = 17 * 60 + Math.round(p * 9 * 60); // 17:00 → 02:00
      const h = Math.floor(mins / 60) % 24;
      nightClock.textContent = p > .93 ? 'Hasta última hora' : `${String(h).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      const idx = Math.min(nightSteps.length - 1, Math.floor(p * nightSteps.length));
      nightSteps.forEach((li, i) => { li.classList.toggle('on', i <= idx); li.classList.toggle('now', i === idx); });
    }

    // CTA fija en móvil: aparece tras el hero y se esconde en reservas
    const b = booking.getBoundingClientRect();
    mobileCta.classList.toggle('show', y > vh * .9 && !(b.top < vh && b.bottom > 0) && !menu.classList.contains('open'));
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------------- reveals ---------------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .15 });
  const watch = (root = document) => $$('.reveal, .timeline, .chain', root).forEach((el) => revealIO.observe(el));

  /* ---------------- ¿qué pasa hoy? ---------------- */
  $('#todayLabel').textContent = (SITE.today && SITE.today.label) || '';
  $('#todayTimeline').innerHTML = todayItems.map((it, i) => `
    <li style="--i:${i}">
      <a href="${esc(it.target || '#eventos')}">
        <span class="tl-time">${esc(it.time)}</span>
        <span class="tl-title">${esc(it.title)}</span>
        <span class="tl-icon">${icon((TYPE[it.type] || TYPE.fiesta).icon, 20)}</span>
      </a>
    </li>`).join('');

  /* ---------------- partidos ---------------- */
  const matchStatus = (m) => {
    if (m.status) return m.status;
    const start = toDate(m.date, m.time).getTime(), now = Date.now();
    if (now < start) return 'proximo';
    if (now < start + 2 * 60 * 60 * 1000) return 'directo';
    return 'finalizado';
  };
  const STATUS_LABEL = { proximo: 'Próximo', directo: 'En directo', finalizado: 'Finalizado' };
  function crest(team, size) {
    if (team.crest) return `<img class="crest" src="${esc(team.crest)}" alt="Escudo de ${esc(team.name)}" width="${size}" height="${size}">`;
    let h = 0; for (const c of team.name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const hue = [140, 0, 210, 45, 280, 170][h % 6];
    const initials = (team.short || team.name).slice(0, 3).toUpperCase();
    return `<svg class="crest" viewBox="0 0 100 116" width="${size}" height="${Math.round(size * 1.16)}" role="img" aria-label="Escudo genérico de ${esc(team.name)}">
      <path d="M50 4 94 18v38c0 28-19 46-44 56C25 102 6 84 6 56V18Z" fill="hsl(${hue} 12% 13%)" stroke="hsl(${hue} 18% 58%)" stroke-width="4"/>
      <path d="M50 16 82 26v28c0 20-13 33-32 41-19-8-32-21-32-41V26Z" fill="none" stroke="rgba(245,247,245,.18)" stroke-width="2"/>
      <text x="50" y="66" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="30" fill="#f5f7f5">${esc(initials)}</text></svg>`;
  }

  let MATCHES = [];
  const matchById = (id) => MATCHES.find((m) => m.id === id);
  async function loadMatches() {
    // Preparado para una API: debe devolver un array con la misma forma que SITE.matches
    if (CFG.matchesApiUrl) {
      try {
        const res = await fetch(CFG.matchesApiUrl);
        if (res.ok) return await res.json();
      } catch (_) { /* si falla, usamos los datos locales */ }
    }
    return SITE.matches || [];
  }
  function renderMatches() {
    const withStatus = MATCHES.map((m) => ({ ...m, st: matchStatus(m), when: toDate(m.date, m.time) }));
    const live = withStatus.filter((m) => m.st === 'directo').sort((a, b) => a.when - b.when);
    const upcoming = withStatus.filter((m) => m.st === 'proximo').sort((a, b) => a.when - b.when);
    const done = withStatus.filter((m) => m.st === 'finalizado').sort((a, b) => b.when - a.when).slice(0, 1);
    const featured = live[0] || upcoming[0] || done[0];
    const featuredBox = $('#matchFeatured');
    if (!featured) { featuredBox.innerHTML = '<p class="empty">No hay partidos programados.</p>'; return; }
    featuredBox.innerHTML = `
      <div class="md-head"><span class="md-label">Matchday</span><span class="status ${featured.st}">${STATUS_LABEL[featured.st]}</span></div>
      <p class="md-comp">${esc(featured.competition)}</p>
      <div class="md-teams">
        <div class="team">${crest(featured.home, 110)}<span class="team-name">${esc(featured.home.name)}</span></div>
        <span class="vs">VS</span>
        <div class="team">${crest(featured.away, 110)}<span class="team-name">${esc(featured.away.name)}</span></div>
      </div>
      <p class="md-time">${esc(featured.time)}</p>
      <p class="md-day">${esc(fmtLong(featured.when))}</p>
      <div class="md-actions">
        ${featured.st === 'finalizado' ? '' : `<button class="btn btn-green" type="button" data-match-reserve="${esc(featured.id)}">Reservar mesa</button>`}
        <button class="btn btn-ghost" type="button" data-match-view="${esc(featured.id)}">Ver partido</button>
      </div>`;
    const rest = [...live.slice(1), ...upcoming.filter((m) => m !== featured), ...done.filter((m) => m !== featured)];
    $('#matchList').innerHTML = rest.map((m) => `
      <li class="match-row${m.st === 'finalizado' ? ' is-finished' : ''}">
        <div class="mr-when"><strong>${esc(m.time)}</strong><span>${esc(fmtLong(m.when))} · ${esc(m.competition)}</span></div>
        <div class="mr-teams">${crest(m.home, 30)}${esc(m.home.name)} <em>vs</em> ${crest(m.away, 30)}${esc(m.away.name)}</div>
        <div class="mr-actions">
          <span class="status ${m.st}">${STATUS_LABEL[m.st]}</span>
          ${m.st === 'finalizado' ? '' : `<button class="btn btn-green btn-sm" type="button" data-match-reserve="${esc(m.id)}">Reservar</button>`}
          <button class="btn btn-ghost btn-sm" type="button" data-match-view="${esc(m.id)}">Ver partido</button>
        </div>
      </li>`).join('');
  }
  $$('#chain li').forEach((li, i) => li.style.setProperty('--i', i));

  /* ---------------- eventos ---------------- */
  const EVENTS = (SITE.events || [])
    .map((e) => ({ ...e, when: toDate(e.date, e.time) }))
    .filter((e) => { const end = toDate(e.date, '23:59'); end.setHours(end.getHours() + 6); return end.getTime() > Date.now(); }) // oculta los pasados
    .sort((a, b) => a.when - b.when);
  const eventById = (id) => (SITE.events || []).map((e) => ({ ...e, when: toDate(e.date, e.time) })).find((e) => e.id === id);
  const grid = $('#eventGrid');
  function renderEvents(filter) {
    const list = EVENTS.filter((e) => filter === 'all' || e.type === filter);
    if (!list.length) { grid.innerHTML = '<p class="empty">No hay eventos de este tipo en las próximas fechas. Vuelve pronto.</p>'; return; }
    grid.innerHTML = list.map((e, i) => {
      const t = TYPE[e.type] || TYPE.fiesta;
      return `<article class="poster" style="--i:${i}" data-id="${esc(e.id)}">
        <div class="poster-img"><img src="${esc(e.image)}" alt="Imagen de ejemplo para ${esc(e.name)}" loading="lazy"></div>
        <div class="poster-top"><span class="tag${e.type === 'futbol' ? ' is-green' : ''}">${icon(t.icon, 14)}${esc(t.label)}</span><span class="poster-time">${esc(e.time)}</span></div>
        <div class="poster-date"><strong>${e.when.getDate()}</strong><span>${MONTHS[e.when.getMonth()]}</span></div>
        <div class="poster-body">
          <p class="poster-day">${DAYS[e.when.getDay()]}</p>
          <h3>${esc(e.name)}</h3>
          <p class="poster-artist">${esc(e.artist)}</p>
          <div class="poster-actions">
            <button class="btn btn-ghost" type="button" data-event-view="${esc(e.id)}">Ver evento</button>
            <button class="btn btn-green" type="button" data-event-reserve="${esc(e.id)}">Reservar</button>
          </div>
        </div>
      </article>`;
    }).join('');
  }
  const filterBtns = $$('#eventFilters button');
  filterBtns.forEach((b, i) => {
    b.addEventListener('click', () => {
      filterBtns.forEach((x) => { x.setAttribute('aria-selected', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
      renderEvents(b.dataset.filter);
    });
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = filterBtns[(i + (e.key === 'ArrowRight' ? 1 : filterBtns.length - 1)) % filterBtns.length];
      n.focus(); n.click();
    });
    b.tabIndex = i === 0 ? 0 : -1;
  });
  renderEvents('all');

  // inclinación sutil de los carteles con el ratón
  if (finePointer && !reduced) {
    grid.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.poster'); if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--tilt-y', ((e.clientX - r.left) / r.width - .5) * 6 + 'deg');
      card.style.setProperty('--tilt-x', -((e.clientY - r.top) / r.height - .5) * 6 + 'deg');
    });
    grid.addEventListener('pointerout', (e) => {
      const card = e.target.closest('.poster'); if (card && !card.contains(e.relatedTarget)) { card.style.setProperty('--tilt-x', '0deg'); card.style.setProperty('--tilt-y', '0deg'); }
    });
  }

  /* ---------------- tardeo ---------------- */
  const TD = SITE.tardeo || {};
  const facts = [
    ['i-clock', 'Hora', TD.time],
    ['i-sun', 'Ambiente', 'Luz de tarde y buen rollo'],
    ['i-music', 'Música', 'DJ y directos'],
    ['i-beer', 'Bebidas', 'Cerveza bien fría y copas'],
    ['i-users', 'Amigos', 'Planes de grupo'],
    ['i-food', 'Comida', TD.food]
  ].filter((f) => f[2] !== '');
  $('#tardeoFacts').innerHTML = facts.map(([ic, k, v], i) =>
    `<li class="reveal" style="--rd:${i * .06}s">${icon(ic, 22)}<strong>${k}</strong><span class="${isPH(v) ? 'ph' : ''}">${esc(v)}</span></li>`).join('');
  const tdPhotos = TD.photos || [];
  const tdLabels = ['#TARDEO', '#AMIGOS', '#COPAS', '#MÚSICA'];
  $('#tardeoGallery').innerHTML = tdPhotos.map((p, i) =>
    `<button class="tg-item reveal" style="--rd:${i * .08}s" type="button" data-label="${tdLabels[i % tdLabels.length]}" data-tardeo="${i}" aria-label="Ampliar: ${esc(p.alt)}"><img src="${esc(p.image)}" alt="${esc(p.alt)}" loading="lazy"></button>`).join('');

  /* ---------------- música ---------------- */
  $('#artistGrid').innerHTML = (SITE.artists || []).map((a, i) => {
    const ev = eventById(a.eventId);
    return `<article class="artist reveal" style="--rd:${i * .08}s">
      <div class="artist-photo"><img src="${esc(a.image)}" alt="Imagen de ejemplo del artista ${esc(a.name)}" loading="lazy"><span class="tag artist-genre">${esc(a.genre)}</span></div>
      <h3>${esc(a.name)}</h3>
      ${ev ? `<p class="artist-when">${icon('i-calendar', 16)}${esc(fmtLong(ev.when))} · <strong>${esc(ev.time)}</strong></p>` : ''}
      ${ev ? `<button class="btn btn-ghost btn-sm" type="button" data-event-view="${esc(ev.id)}">Ver fecha</button>` : ''}
    </article>`;
  }).join('');

  const player = $('#player');
  const playerBtn = $('#playerBtn');
  let playRaf, playStart;
  playerBtn.addEventListener('click', () => {
    const on = !player.classList.contains('playing');
    player.classList.toggle('playing', on);
    playerBtn.setAttribute('aria-pressed', String(on));
    playerBtn.setAttribute('aria-label', on ? 'Pausar vista previa' : 'Reproducir vista previa');
    $('use', playerBtn).setAttribute('href', on ? '#i-pause' : '#i-play');
    $('#playerNote').textContent = on ? 'Reproducción simulada: todavía no hay audio.' : 'Sin audio todavía: se añadirá cuando haya archivos.';
    cancelAnimationFrame(playRaf);
    if (on) {
      playStart = performance.now() - (parseFloat(player.style.getPropertyValue('--prog') || 0) * 30000);
      const step = (t) => { player.style.setProperty('--prog', (((t - playStart) / 30000) % 1).toFixed(4)); playRaf = requestAnimationFrame(step); };
      playRaf = requestAnimationFrame(step);
    }
  });

  /* ---------------- galería + lightbox ---------------- */
  const GAL = SITE.gallery || [];
  $('#galleryGrid').innerHTML = GAL.map((g, i) =>
    `<button class="tile ${esc(g.size || 'square')} reveal" style="--rd:${(i % 4) * .06}s" type="button" data-gallery="${i}" aria-label="Ampliar imagen: ${esc(g.alt)}">
      <img src="${esc(g.image)}" alt="${esc(g.alt)}" loading="lazy"><span class="tag">${esc(g.tag)}</span></button>`).join('');

  const lb = $('#lightbox'), lbImg = $('#lbImg');
  let lbSet = [], lbIdx = 0, lbReturn = null;
  function lbShow(i) {
    lbIdx = (i + lbSet.length) % lbSet.length;
    const it = lbSet[lbIdx];
    lbImg.src = it.image; lbImg.alt = it.alt;
    $('#lbTag').textContent = it.tag || '';
    $('#lbCount').textContent = `${lbIdx + 1} / ${lbSet.length}`;
  }
  function lbOpen(set, i) {
    lbSet = set; lbReturn = document.activeElement;
    lb.hidden = false; document.body.classList.add('locked');
    lbShow(i); $('.lb-close', lb).focus();
  }
  function lbClose() { lb.hidden = true; document.body.classList.remove('locked'); lbReturn?.focus?.(); }
  lb.addEventListener('click', (e) => {
    const a = e.target.closest('[data-lb]')?.dataset.lb;
    if (a === 'close' || e.target === lb) lbClose();
    if (a === 'prev') lbShow(lbIdx - 1);
    if (a === 'next') lbShow(lbIdx + 1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 50) lbShow(lbIdx + (dx < 0 ? 1 : -1));
  });

  /* ---------------- instagram ---------------- */
  $('#instaGrid').innerHTML = (SITE.instagram || []).map((p, i) => {
    const url = p.url || (!isPH(CFG.instagramUrl) ? CFG.instagramUrl : '');
    return `<a class="reveal" style="--rd:${i * .05}s" href="${url ? esc(url) : '#'}" ${url ? 'target="_blank" rel="noopener"' : 'data-no-ig'} aria-label="Ver publicación en Instagram"><img src="${esc(p.image)}" alt="${esc(p.alt)}" loading="lazy"></a>`;
  }).join('');
  $$('[data-no-ig]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); toast('Añade la URL de Instagram en js/data.js (instagramUrl).'); }));

  /* ---------------- modal de evento / partido ---------------- */
  const modal = $('#modal');
  let modalCtx = null, modalReturn = null;
  function openModal(ctx) {
    modalCtx = ctx; modalReturn = document.activeElement;
    $('#modalImg').src = ctx.image; $('#modalImg').alt = ctx.imageAlt;
    $('#modalType').textContent = ctx.typeLabel;
    $('#modalTitle').textContent = ctx.title;
    $('#modalArtist').textContent = ctx.subtitle || '';
    $('#modalMeta').innerHTML = [
      `${icon('i-calendar', 16)}${esc(fmtLong(ctx.when))}`,
      `${icon('i-clock', 16)}${esc(ctx.time)}`,
      ctx.status ? `${icon('i-screen', 16)}${esc(STATUS_LABEL[ctx.status])}` : ''
    ].filter(Boolean).map((x) => `<li>${x}</li>`).join('');
    $('#modalDesc').textContent = ctx.description || '';
    const rb = $('#modalReserve');
    rb.hidden = ctx.status === 'finalizado';
    rb.textContent = ctx.kind === 'match' ? 'Reservar mesa' : 'Reservar';
    modal.hidden = false; document.body.classList.add('locked');
    $('.modal-close', modal).focus();
  }
  function closeModal() { modal.hidden = true; document.body.classList.remove('locked'); modalReturn?.focus?.(); }
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  $('#modalReserve').addEventListener('click', () => { const c = modalCtx; closeModal(); openReservation(c); });
  $('#modalCal').addEventListener('click', () => {
    const c = modalCtx; if (!c) return;
    const start = c.when, end = new Date(start.getTime() + 3 * 3600000);
    const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//5mentarios//web//ES', 'BEGIN:VEVENT',
      `UID:${Date.now()}@5mentarios`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
      `SUMMARY:${c.title} · Heineken 5mentarios`, `LOCATION:${isPH(CFG.address) ? 'Heineken 5mentarios' : CFG.address}`,
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = `${c.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Evento descargado para tu calendario.');
  });

  const eventCtx = (e) => {
    const m = e.matchId ? matchById(e.matchId) : null;
    if (m) return matchCtx(m);
    return {
      kind: 'event', id: e.id, title: e.name, subtitle: e.artist, when: e.when, date: e.date, time: e.time,
      typeLabel: (TYPE[e.type] || TYPE.fiesta).label, reserveType: (TYPE[e.type] || TYPE.fiesta).reserve,
      image: e.image, imageAlt: 'Imagen de ejemplo para ' + e.name, description: e.description, reserveUrl: e.reserveUrl
    };
  };
  function matchCtx(m) {
    const ev = (SITE.events || []).find((e) => e.matchId === m.id);
    return {
      kind: 'match', id: m.id, title: `${m.home.name} vs ${m.away.name}`, subtitle: m.competition,
      when: toDate(m.date, m.time), date: m.date, time: m.time, status: matchStatus(m),
      typeLabel: 'Fútbol · Matchday', reserveType: 'Partido',
      image: ev ? ev.image : 'img/futbol.jpg', imageAlt: 'Imagen de ejemplo de fútbol en pantalla',
      description: 'Partido en pantalla grande. Reserva mesa y llega con tiempo: después del pitido final, la noche sigue.',
      reserveUrl: ev ? ev.reserveUrl : ''
    };
  }

  /* ---------------- reservas ---------------- */
  const form = $('#bookingForm');
  const ctxBox = $('#bookingContext');
  const fName = $('#fName'), fPhone = $('#fPhone'), fDate = $('#fDate'), fTime = $('#fTime'), fPeople = $('#fPeople'), fType = $('#fType');
  const submitBtn = $('#submitBtn');
  const errorEl = $('#formError');
  let bookingCtx = null;
  fDate.min = iso(new Date());

  function setType(t) { if (t && [...fType.options].some((o) => o.value === t)) fType.value = t; }
  function openReservation(ctx, presetType) {
    if (ctx && ctx.reserveUrl) { window.open(ctx.reserveUrl, '_blank', 'noopener'); return; }
    bookingCtx = ctx || null;
    $('#bookingDone').hidden = true;
    if (ctx) {
      $('#ctxKicker').textContent = ctx.kind === 'match' ? 'Reserva para el partido' : 'Reserva para el evento';
      $('#ctxName').textContent = ctx.title;
      $('#ctxMeta').textContent = `${fmtLong(ctx.when)} · ${ctx.time}${ctx.kind === 'match' ? ' · ' + ctx.subtitle : ''}`;
      ctxBox.hidden = false;
      fDate.value = ctx.date; fTime.value = ctx.time;
      setType(ctx.reserveType);
      submitBtn.textContent = ctx.kind === 'match' ? 'Reservar mesa' : 'Quiero reservar';
    } else {
      ctxBox.hidden = true;
      submitBtn.textContent = 'Quiero reservar';
      setType(presetType);
    }
    booking.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => fName.focus({ preventScroll: true }), reduced ? 0 : 700);
  }
  $('#ctxClear').addEventListener('click', () => { bookingCtx = null; ctxBox.hidden = true; submitBtn.textContent = 'Quiero reservar'; });

  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-reserve]');
    if (r) { e.preventDefault(); if (menu.classList.contains('open')) setMenu(false); openReservation(null, r.dataset.reserveType); return; }
    const ev = e.target.closest('[data-event-view]');
    if (ev) { const x = eventById(ev.dataset.eventView); if (x) openModal(eventCtx(x)); return; }
    const er = e.target.closest('[data-event-reserve]');
    if (er) { const x = eventById(er.dataset.eventReserve); if (x) openReservation(eventCtx(x)); return; }
    const mv = e.target.closest('[data-match-view]');
    if (mv) { const m = matchById(mv.dataset.matchView); if (m) openModal(matchCtx(m)); return; }
    const mr = e.target.closest('[data-match-reserve]');
    if (mr) { const m = matchById(mr.dataset.matchReserve); if (m) openReservation(matchCtx(m)); return; }
    const gi = e.target.closest('[data-gallery]');
    if (gi) { lbOpen(GAL, +gi.dataset.gallery); return; }
    const ti = e.target.closest('[data-tardeo]');
    if (ti) {
      if (!finePointer && !ti.classList.contains('active')) { $$('.tg-item').forEach((x) => x.classList.toggle('active', x === ti)); return; } // 1.er toque: efecto; 2.º: ampliar
      lbOpen(tdPhotos.map((p, i) => ({ ...p, tag: tdLabels[i % tdLabels.length] })), +ti.dataset.tardeo);
    }
  });

  $$('.stepper button').forEach((b) => b.addEventListener('click', () => {
    fPeople.value = clamp((parseInt(fPeople.value, 10) || 1) + +b.dataset.step, 1, 30);
  }));

  function validate() {
    const errs = [];
    const mark = (el, bad) => el.setAttribute('aria-invalid', String(bad));
    const nameOk = fName.value.trim().length >= 2; mark(fName, !nameOk); if (!nameOk) errs.push('tu nombre');
    const phoneOk = fPhone.value.replace(/\D/g, '').length >= 9; mark(fPhone, !phoneOk); if (!phoneOk) errs.push('un teléfono válido');
    const dateOk = !!fDate.value && fDate.value >= fDate.min; mark(fDate, !dateOk); if (!dateOk) errs.push('una fecha (hoy o posterior)');
    const timeOk = !!fTime.value; mark(fTime, !timeOk); if (!timeOk) errs.push('la hora');
    const n = parseInt(fPeople.value, 10); const pOk = n >= 1 && n <= 30; mark(fPeople, !pOk); if (!pOk) errs.push('entre 1 y 30 personas');
    errorEl.textContent = errs.length ? `Revisa: ${errs.join(', ')}.` : '';
    return errs.length === 0;
  }
  const payload = () => ({
    name: fName.value.trim(), phone: fPhone.value.trim(), date: fDate.value, time: fTime.value,
    people: parseInt(fPeople.value, 10), type: fType.value,
    context: bookingCtx ? { kind: bookingCtx.kind, id: bookingCtx.id, title: bookingCtx.title } : null
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
    const data = payload();
    submitBtn.disabled = true;
    if (CFG.reservationEndpoint) {
      try {
        const res = await fetch(CFG.reservationEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
      } catch (_) {
        submitBtn.disabled = false;
        errorEl.textContent = 'No se ha podido enviar la reserva. Prueba por WhatsApp o llámanos.';
        return;
      }
    }
    submitBtn.disabled = false;
    const d = toDate(data.date, data.time);
    $('#doneText').textContent = `${data.name}, hemos recibido tu solicitud para ${data.people} ${data.people === 1 ? 'persona' : 'personas'} el ${fmtLong(d).toLowerCase()} a las ${data.time}${data.context ? ` (${data.context.title})` : ''}. Te confirmaremos la reserva muy pronto.`;
    $('#bookingDone').hidden = false;
    $('#bookingDone').focus();
  });
  $('#doneReset').addEventListener('click', () => {
    form.reset(); fPeople.value = 4; bookingCtx = null; ctxBox.hidden = true; submitBtn.textContent = 'Quiero reservar';
    $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
    $('#bookingDone').hidden = true; fName.focus();
  });

  $('#waBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const d = payload();
    const lines = ['Hola, quiero reservar en Heineken 5mentarios.'];
    if (d.context) lines.push(`${d.context.kind === 'match' ? 'Partido' : 'Evento'}: ${d.context.title}`);
    if (d.date) lines.push(`Fecha: ${d.date}${d.time ? ' a las ' + d.time : ''}`);
    lines.push(`Personas: ${d.people || '-'}`);
    lines.push(`Tipo: ${d.type}`);
    if (d.name) lines.push(`Nombre: ${d.name}`);
    const number = isPH(CFG.whatsapp) ? '' : String(CFG.whatsapp).replace(/\D/g, '');
    if (!number) toast('WhatsApp del local pendiente: elige el contacto en WhatsApp.');
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });

  /* ---------------- teclado global ---------------- */
  document.addEventListener('keydown', (e) => {
    if (!lb.hidden) {
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
      if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
      return;
    }
    if (!modal.hidden) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab') {
        const f = $$('button:not([hidden]), a[href]', $('.modal-card', modal)).filter((x) => x.offsetParent !== null);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (menu.classList.contains('open') && e.key === 'Escape') { setMenu(false); burger.focus(); }
  });

  /* ---------------- cursor ---------------- */
  if (finePointer && !reduced) {
    document.documentElement.classList.add('has-cursor');
    const cur = $('.cursor');
    let x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', (e) => cur.classList.toggle('hover', !!e.target.closest('a, button, .tile, .poster, input, select')));
    const loop = () => { cx += (x - cx) * .2; cy += (y - cy) * .2; cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(loop); };
    loop();
  }

  /* ---------------- arranque ---------------- */
  loadMatches().then((list) => { MATCHES = list; renderMatches(); watch($('#futbol')); });
  sections.forEach((s) => navObserver.observe(s));
  watch();
})();
