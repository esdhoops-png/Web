// Generador de contenido con las plantillas y reglas de la guía de marca de Heineken 5mentarios.
// No inventa datos: lo que falta sale como [POR CONFIRMAR] y se avisa antes de crear la publicación.
import { html, useState, Icon, toast, fromLocalInput } from '../lib/ui.js';
import { go } from '../lib/store.js';
import { openPostForm } from './posts.js';
import { BRAND, RULES, DONTS, WORKSTYLE, COLORS, FONTS, LOGO, STYLES, FORMATS, PHRASES, CTAS, HASHTAGS, WEEKLY, WEEKLY_GOALS, PILLARS, PEOPLE, RAFFLE_LEGAL, PHOTO_RULES, PENDING } from '../lib/brand.js';

const PC = '[POR CONFIRMAR]';
const v = (x) => (x && String(x).trim()) || PC;
const fecha = (d) => (d ? new Date(d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : PC);
const fechaCorta = (d) => (d ? new Date(d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }).replace('.', '') : PC);
const ddmm = (d) => (d ? `${d.slice(8)}/${d.slice(5, 7)}` : PC);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const rowsOf = (txt) => (txt || '').split('\n').map((l) => l.trim()).filter(Boolean);
const LOGO_END = 'Cierre con la animación del logo (@heineken5mentarios). Sin música: el audio lo pone el responsable.';

// Cada plantilla: campos + función que genera las piezas
const TEMPLATES = {
  programacion: {
    label: 'Programación del finde', icon: 'poster', kind: 'weekly_poster', format: 'Post 4:5 + canal de WhatsApp', platforms: ['instagram', 'whatsapp'],
    fields: [
      { k: 'vie', label: 'Viernes (fecha)', type: 'date' }, { k: 'vieHora', label: 'Viernes · hora', ph: '22:30' }, { k: 'vieQuien', label: 'Viernes · artista / DJ', ph: 'Son Diferente + DJ Ruven', list: true },
      { k: 'sab', label: 'Sábado (fecha)', type: 'date' }, { k: 'sabHora', label: 'Sábado · hora', ph: '22:30' }, { k: 'sabQuien', label: 'Sábado · artista / DJ', list: true },
      { k: 'dom', label: 'Domingo tardeo (fecha, opcional)', type: 'date', optional: true }, { k: 'domHora', label: 'Domingo · hora', optional: true }
    ],
    gen(f) {
      const filas = [[f.vie, f.vieHora, f.vieQuien], [f.sab, f.sabHora, f.sabQuien]];
      if (f.dom) filas.push([f.dom, f.domHora, 'tardeo']);
      const post = `Este finde en 5mentarios 🍻\n\n${filas.map(([d, h, q]) => `${cap(fecha(d))} · ${v(h)} · ${v(q)}`).join('\n')}\n\nY si te entra el hambre, pide tu Volcán o tu Cuor di Pizza y te la llevamos a la mesa 🍔🍕\n\n¿Con quién vienes? Etiquétalo 👇`;
      const wa = `🍻 FINDE EN 5MENTARIOS\n${filas.map(([d, h, q]) => `${cap(fechaCorta(d))} ${v(h)} · ${v(q)}`).join('\n')}\nComida de Volcán y Cuor di Pizza a la mesa 🍔🍕`;
      return {
        title: `Programación · finde ${ddmm(f.vie)}–${ddmm(f.sab)}`, copy: post, hashtags: HASHTAGS.finde,
        cta: `¿Con quién vienes? Etiquétalo 👇 · Reservas por WhatsApp ${BRAND.whatsapp}`,
        extra: [['Canal de WhatsApp', wa]],
        brief: ['1080×1350 (4:5). Estilo cartel de noche: fondo negro, brillo verde, titulares en Anton blanco, horas en verde #2BB061.',
          'Logo arriba a la izquierda (~100–110 px). Pie «HEINEKEN 5MENTARIOS · ARUCAS».', 'Publicar el miércoles a las 12:00 y actualizar la web (EVENTOS / PROGRAMA).',
          'Entregar PNG + PSD con cada texto en su capa.']
      };
    }
  },
  hoy: {
    label: 'Story «Hoy en 5mentarios»', icon: 'phone', kind: 'story', format: 'Story animada 9:16 (11–17 s)',
    fields: [{ k: 'fecha', label: 'Fecha', type: 'date' }, { k: 'filas', label: 'Programa de hoy (una línea por artista: «22:30 Son Diferente»)', type: 'textarea', ph: '22:30 Son Diferente\n00:00 DJ Ruven' }],
    gen(f) {
      const filas = rowsOf(f.filas);
      const escenas = ['Escena 1 · «HOY» + pastilla de fecha verde arriba a la derecha (' + v(ddmm(f.fecha)) + ')',
        ...(filas.length ? filas : [PC]).map((r, i) => `Escena ${i + 2} · hora gigante en contorno verde + nombre que entra de golpe: ${r}`),
        `Escena ${(filas.length || 1) + 2} · resumen con las filas + «RESERVA TU MESA · WHATSAPP ${BRAND.whatsapp}»`, 'Cierre · animación del logo'];
      return { title: `Story Hoy · ${ddmm(f.fecha)}`, copy: escenas.join('\n'), cta: 'Stickers: ubicación, mención del artista, enlace a WhatsApp', hashtags: '',
        extra: [['En directo esa noche', '3–5 stories en directo mencionando al artista. Repostear todas las menciones.']],
        brief: ['1080×1920, 30 fps, 11–17 s. Fondo negro verdoso con rayos verdes girando.', 'Texto importante entre y≈250 y y≈1700.', LOGO_END] };
    }
  },
  monologos: {
    label: 'Monólogos', icon: 'music', kind: 'post', format: 'Post 1080×1350 + story',
    fields: [{ k: 'humorista', label: 'Humorista', list: true, opts: PEOPLE.comedians }, { k: 'fecha', label: 'Fecha', type: 'date' }, { k: 'hora', label: 'Hora', ph: '21:00' },
      { k: 'soldout', label: 'SOLD OUT', type: 'check', optional: true }, { k: 'nueva', label: 'Nueva fecha (si está agotado)', type: 'date', optional: true }],
    gen(f) {
      const copy = f.soldout
        ? `¡Agotado! 🎤 ${v(f.humorista)} llena el ${fecha(f.fecha)}.\n\n${f.nueva ? `¿Te has quedado fuera? Hay nueva fecha: ${fecha(f.nueva)} en 5mentarios.\n\n` : ''}El aforo es limitado, así que reserva en el ${BRAND.whatsapp} 😉`
        : `¡Este jueves nos echamos unas risas en 5mentarios! 🎤\n${v(f.humorista)} viene con su monólogo para que te olvides de la semana a carcajadas. Tú te traes las ganas de reír y nosotros las Heineken bien fresquitas 🍻\n📅 ${cap(fecha(f.fecha))} · 🕘 ${v(f.hora)} · 📍 Heineken 5mentarios · Arucas\nSi te entra hambre, pide de Volcán o de Cuor di Pizza y te lo llevamos a la mesa.\nEl aforo es limitado, así que reserva en el ${BRAND.whatsapp} 😉`;
      return { title: `Monólogos · ${v(f.humorista)} · ${ddmm(f.fecha)}${f.soldout ? ' (SOLD OUT)' : ''}`, copy, hashtags: HASHTAGS.monologos, cta: `Reserva en el ${BRAND.whatsapp}`,
        extra: [['Story', `HOY · ${v(f.hora)} · ${v(f.humorista)} · AFORO LIMITADO · RESERVAS ${BRAND.whatsapp}`]],
        brief: ['Estilo «Monólogos» aprobado: fondo negro liso, logo arriba izquierda, fecha «' + ddmm(f.fecha) + '» en verde arriba derecha.',
          '«MONÓLOGOS» gigante en Barlow Condensed 900 blanco roto; subtítulo verde muy espaciado con día · fecha · hora.',
          'Foto del humorista recortada con resplandor verde; «' + (f.fecha ? fechaCorta(f.fecha).toUpperCase() : PC) + '» en verde sobre el nombre en mayúsculas.',
          'Línea fina y pie: «AFORO LIMITADO» a la izquierda, «RESERVAS 627 304 115» a la derecha.' + (f.soldout ? ' Etiqueta «SOLD OUT» en rojo #E0312E.' : ''), 'PNG + PSD con capas.'] };
    }
  },
  tardeo: {
    label: 'Tardeo', icon: 'music', kind: 'event', format: 'Cartel 1080×1350 + carrusel line-up + cuenta atrás',
    fields: [{ k: 'nombre', label: 'Nombre del tardeo', ph: 'Tardeo Exterior' }, { k: 'fecha', label: 'Fecha', type: 'date' }, { k: 'desde', label: 'Desde las', ph: '16:00' },
      { k: 'lugar', label: 'Interior o exterior', type: 'select', opts: ['exterior', 'interior'] },
      { k: 'lineup', label: 'Line-up (una línea por artista: «16:00 DJ Ruven»)', type: 'textarea' },
      { k: 'organiza', label: 'Organiza / colaboran (opcional)', optional: true, ph: 'Organiza el Ayto. de Arucas; colaboran 5mentarios y COA' }],
    gen(f) {
      const lu = rowsOf(f.lineup);
      const copy = `${v(f.nombre).toUpperCase()} 🍻\n\n${cap(fecha(f.fecha))}, desde las ${v(f.desde)}:\n${(lu.length ? lu : [PC]).join('\n')}\n\n${f.organiza ? f.organiza + '\n\n' : ''}¿Con quién vienes? Etiquétalo 👇`;
      return { title: `${v(f.nombre)} · ${ddmm(f.fecha)}`, copy, hashtags: HASHTAGS.base, cta: '¿Con quién vienes? Etiquétalo 👇',
        extra: [['Cuenta atrás (stories)', 'Faltan 3 días → Faltan 2 días → Mañana → Hoy (sticker de cuenta atrás)'],
          ['Carrusel line-up', `Portada (cartel) + una slide por artista: polaroid girada con cinta verde, hora en verde, nombre en blanco, banda «TARDEO ${(f.lugar || 'exterior').toUpperCase()} · ${ddmm(f.fecha)}», contador «2/${lu.length + 1}».`]],
        brief: ['Estilo «Halloween / Tardeo» aprobado: pared con textura, degradado a negro, título en Anton con halo verde, fecha en Permanent Marker verde neón.',
          'Rejilla de columnas hora (verde) + artista (blanco). Banda inclinada −3° verde con borde negro «TARDEO ' + (f.lugar || 'EXTERIOR').toUpperCase() + ' · DESDE LAS ' + v(f.desde) + '».',
          'Logos de colaboradores abajo SIN panel blanco (solo el del Ayuntamiento con cajita blanca pequeña). Nunca recolorear logos.',
          'Sin fotos de artistas en el cartel del tardeo. PNG + PSD con capas.'] };
    }
  },
  fotos: {
    label: 'Carrusel de fotos de la noche', icon: 'image', kind: 'carousel', format: 'Carrusel (formato original)',
    fields: [{ k: 'cuando', label: 'Cuándo', ph: 'anoche / el finde / el tardeo del sábado' }, { k: 'artista', label: 'Artista (opcional)', optional: true, list: true }],
    gen(f) {
      return { title: `Carrusel de fotos · ${v(f.cuando)}`, hashtags: HASHTAGS.fotos, cta: 'Búscate en las fotos y etiquétate 📸',
        copy: `Así sonó ${f.cuando || 'anoche'} el 5mentarios 🎶 Gracias a todos los que vinisteis${f.artista ? ` y a ${f.artista} por esa noche` : ''}. Búscate en las fotos y etiquétate 📸`,
        brief: ['Edición natural y limpia, formato original sin recortar.', 'Sin flash directo, luz cálida, sin menores en fotos de barra o bebidas, sin marcas ajenas en primer plano.', 'Publicar el lunes a las 13:00.'] };
    }
  },
  partido: {
    label: 'Partido grande / Champions', icon: 'trophy', kind: 'champions', format: 'Carrusel/post + stories',
    fields: [{ k: 'local', label: 'Equipo local' }, { k: 'visitante', label: 'Equipo visitante' }, { k: 'comp', label: 'Competición', type: 'select', opts: ['Champions League', 'El Clásico', 'Otro'] },
      { k: 'grande', label: '¿Es partido grande? (Clásico o Champions importante)', type: 'check', optional: true }, { k: 'fecha', label: 'Fecha', type: 'date' }, { k: 'hora', label: 'Hora (Canarias)', ph: '20:00' }],
    gen(f) {
      const vs = `${v(f.local)} vs ${v(f.visitante)}`;
      const stories = `Story 1: «Hoy · ${v(f.hora)} · pantalla grande» — ${vs}\nStory 2: encuesta «¿Quién gana?»\nStory 3: «Todavía estás a tiempo» + cena con Volcán\nNo grabar la imagen de la tele (Instagram puede silenciar el vídeo).`;
      return { title: `${f.comp || 'Partido'} · ${vs} · ${ddmm(f.fecha)}`, hashtags: HASHTAGS.base, cta: `Reserva tu mesa: WhatsApp ${BRAND.whatsapp}`,
        copy: f.grande ? `PARTIDAZO ⚽ ${vs}\n\n${cap(fecha(f.fecha))} · ${v(f.hora)} · pantalla grande en 5mentarios.\n\nTú pones los gritos, nosotros las cañas 🍻 Y la cena, de Volcán o Cuor di Pizza, te la llevamos a la mesa.\n\n¿Con quién lo ves? Etiquétalo 👇` : stories,
        extra: f.grande ? [['Stories', stories]] : [['Regla de la casa', 'No es partido grande: solo stories (sin post ni reel).']],
        brief: ['Pantalla partida negro / verde #0B8A3E con foto de cada equipo, círculo blanco «VS», etiqueta «PARTIDAZO» girada.',
          `Pastillas «${v(f.hora)} H», «PANTALLA GRANDE», «VOLCÁN · CUOR DI PIZZA · TE LO LLEVAMOS A LA MESA». Pie «HEINEKEN 5MENTARIOS · ARUCAS — DESLIZA →».`,
          'Fotos de jugadores y escudos: solo las que proporcione el responsable.'] };
    }
  },
  sorteo: {
    label: 'Sorteo', icon: 'star', kind: 'promo', format: 'Post 1080×1350',
    fields: [{ k: 'premio', label: 'Premio' }, { k: 'mecanica', label: 'Mecánica', ph: 'Seguir + like + mencionar a 2 amigos; +1 papeleta por compartir en stories' },
      { k: 'ganador', label: 'Fecha del ganador', type: 'date' }, { k: 'alcohol', label: 'El premio lleva alcohol', type: 'check', optional: true }],
    gen(f) {
      return { title: `Sorteo · ${v(f.premio)}`, hashtags: HASHTAGS.base, cta: 'Participa siguiendo los pasos',
        copy: `🎁 SORTEO en 5mentarios\n\nPremio: ${v(f.premio)}\n\nPara participar:\n${v(f.mecanica)}\n\nEl ganador se anuncia el ${fecha(f.ganador)}.\n\n${RAFFLE_LEGAL}`,
        brief: ['Incluir siempre: ' + RAFFLE_LEGAL, f.alcohol ? 'El premio lleva alcohol: comprobar la edad del ganador.' : 'Comprobar condiciones antes de publicar.'] };
    }
  },
  reel: {
    label: 'Guion de reel', icon: 'video', kind: 'reel', format: 'Reel 9:16',
    fields: [{ k: 'tipo', label: 'Tipo', type: 'select', opts: ['Así fue la noche', 'Lo que se viene este finde', 'POV la pides en el 5mentarios', 'Tardeo en directo'] },
      { k: 'detalle', label: 'Detalle (fecha, artista, plan…)', optional: true }],
    gen(f) {
      const t = f.tipo || 'Así fue la noche';
      const guiones = {
        'Así fue la noche': 'Plano 1 (0–1 s): gancho — gente cantando / brindis\nPlanos 2–8: planos generales del ambiente, < 2 s cada uno\nTexto: «Así fue la noche en 5mentarios»\nFinal: animación del logo',
        'Lo que se viene este finde': 'Dos personas del equipo en la barra hablando a cámara (≈35 s)\nPlano 1: gancho en el primer segundo\nPresentan viernes y sábado con artista y hora\nFinal: «Reserva por WhatsApp 627 304 115» + animación del logo',
        'POV la pides en el 5mentarios': 'POV: pides en la barra → Volcán la hace al momento → te la llevan a la mesa\nPlanos < 2 s, ubicación Arucas\nFinal: animación del logo',
        'Tardeo en directo': 'Planos generales del tardeo en directo, < 2 s\nTexto: «Tardeo, música y los tuyos»\nFinal: animación del logo'
      };
      return { title: `Reel · ${t}${f.detalle ? ' · ' + f.detalle : ''}`, hashtags: HASHTAGS.base, cta: '¿Con quién vienes? Etiquétalo 👇',
        copy: { 'Así fue la noche': 'Así fue la noche en 5mentarios 🎶 ¿Te la perdiste? Esta semana hay más.', 'Lo que se viene este finde': 'Lo que se viene este finde en 5mentarios 👀', 'POV la pides en el 5mentarios': 'POV: la pides en el 5mentarios y te la llevamos a la mesa 🍔', 'Tardeo en directo': 'Tardeo, música y los tuyos 🍻' }[t] + (f.detalle ? `\n\n${f.detalle}` : ''),
        extra: [['Guion', guiones[t]]],
        brief: ['1080×1920, 30 fps. Planos de menos de 2 s, gancho en el primer segundo, audio en tendencia (lo pone el responsable).', LOGO_END, 'H.264 main 4.0, yuv420p, ~6 Mbps, AAC 44,1 kHz, faststart.'] };
    }
  }
};

function Field({ f, val, set }) {
  const id = 'g-' + f.k;
  const common = { id, value: val || '', onInput: (e) => set(e.target.value) };
  let input;
  if (f.type === 'textarea') input = html`<textarea class="input" placeholder=${f.ph || ''} ...${common}></textarea>`;
  else if (f.type === 'select') input = html`<select class="input" ...${common} onChange=${(e) => set(e.target.value)}><option value="">Elegir…</option>${f.opts.map((o) => html`<option value=${o}>${o}</option>`)}</select>`;
  else if (f.type === 'check') return html`<label class="row small"><input type="checkbox" checked=${!!val} onChange=${(e) => set(e.target.checked)} />${f.label}</label>`;
  else input = html`<input class="input" type=${f.type || 'text'} placeholder=${f.ph || ''} list=${f.list ? 'g-people' : null} ...${common} />`;
  return html`<label class="field" for=${id}><span>${f.label}${f.optional ? '' : ' *'}</span>${input}</label>`;
}

function Generator() {
  const [tpl, setTpl] = useState('programacion');
  const [vals, setVals] = useState({});
  const T = TEMPLATES[tpl];
  const f = vals[tpl] || {};
  const set = (k) => (x) => setVals({ ...vals, [tpl]: { ...f, [k]: x } });
  const missing = T.fields.filter((x) => !x.optional && !(f[x.k] && String(f[x.k]).trim())).map((x) => x.label);
  const out = T.gen(f);
  const copyAll = [out.copy, out.cta, out.hashtags].filter(Boolean).join('\n\n');
  const cp = (t) => navigator.clipboard.writeText(t).then(() => toast('Copiado'));
  const dateField = T.fields.find((x) => x.type === 'date' && f[x.k]);
  function create() {
    openPostForm({
      kind: T.kind, title: out.title.replace(/\s*\[POR CONFIRMAR\]\s*/g, ' ').trim(), copy: out.copy, hashtags: out.hashtags || '', cta: out.cta || '', format: T.format,
      platforms: T.platforms || ['instagram'], status: 'idea', requires_approval: T.kind !== 'event',
      starts_at: dateField ? fromLocalInput(f[dateField.k] + 'T' + (/^\d{1,2}:\d{2}$/.test(f.hora || f.vieHora || f.desde || '') ? (f.hora || f.vieHora || f.desde).padStart(5, '0') : '12:00')) : null,
      description: [...(out.extra || []).map(([t, x]) => `${t}:\n${x}`), 'Brief de diseño:\n- ' + out.brief.join('\n- ')].join('\n\n'),
      pending_info: missing.length ? 'Falta: ' + missing.join(', ') : ''
    });
  }
  return html`
    <datalist id="g-people">${[...PEOPLE.bands, ...PEOPLE.djs, ...PEOPLE.comedians].map((p) => html`<option value=${p} />`)}</datalist>
    <div class="chips" style="margin-bottom:14px">${Object.entries(TEMPLATES).map(([k, t]) => html`<button class=${'chip' + (tpl === k ? ' on' : '')} onClick=${() => setTpl(k)}><${Icon} name=${t.icon} size=${13} /> ${t.label}</button>`)}</div>
    <div class="post-grid">
      <section class="card stack"><h2>Datos</h2>
        ${T.fields.map((x) => html`<${Field} key=${tpl + x.k} f=${x} val=${f[x.k]} set=${set(x.k)} />`)}
        ${missing.length ? html`<p class="small" style="margin:0;color:var(--ambar)">⚠ Sin estos datos saldrá ${PC}: ${missing.join(', ')}. No se inventa nada.</p>` : html`<p class="small" style="margin:0;color:var(--verde)">✓ Datos completos.</p>`}
        <p class="xs muted" style="margin:0">Artistas y DJs que han tocado (sugerencias): ${[...PEOPLE.bands, ...PEOPLE.djs].join(', ')}.</p>
      </section>
      <div class="stack" style="gap:16px">
        <section class="card stack"><h2 class="card-title">Caption<button class="btn sm" style="margin-left:auto" onClick=${() => cp(copyAll)}><${Icon} name="copy" size=${14} />Copiar todo</button></h2>
          <div class="copybox">${out.copy}</div>
          ${out.cta ? html`<div class="small"><b>CTA:</b> ${out.cta}</div>` : null}
          ${out.hashtags ? html`<div class="small muted">${out.hashtags}</div>` : null}
          ${(out.extra || []).map(([t, x]) => html`<div><b class="small">${t}</b><div class="copybox" style="margin-top:6px">${x}<button class="btn sm" onClick=${() => cp(x)}><${Icon} name="copy" size=${13} /></button></div></div>`)}
        </section>
        <section class="card"><h2>Brief de diseño</h2><ul class="small" style="margin:0;padding-left:18px;line-height:1.7">${out.brief.map((b) => html`<li>${b}</li>`)}</ul></section>
        <button class="btn primary" onClick=${create}><${Icon} name="calendar" />Crear en el calendario</button>
      </div>
    </div>`;
}

function BrandGuide() {
  return html`<div class="stack" style="gap:16px">
    <section class="card stack"><h2>Las 10 reglas</h2><ol class="small" style="margin:0;padding-left:20px;line-height:1.8">${RULES.map((r) => html`<li>${r}</li>`)}</ol></section>
    <div class="grid cols-2">
      <section class="card"><h2>Colores</h2><div class="stack" style="gap:8px">${COLORS.map((c) => html`<div class="row nowrap"><span style=${{ width: '38px', height: '38px', borderRadius: '9px', background: c.hex, border: '1px solid var(--line2)', flex: 'none' }}></span>
        <div class="small"><b>${c.name}</b> <code>${c.hex}</code><div class="muted xs">${c.use}${c.pending ? ' · [POR CONFIRMAR] ' + c.pending : ''}</div></div></div>`)}</div></section>
      <section class="card"><h2>Tipografías</h2><div class="stack">${FONTS.map((t) => html`<div><div style=${{ fontFamily: t.css, fontSize: '26px', lineHeight: 1.1 }}>5MENTARIOS 21:00</div><div class="small"><b>${t.name}</b> · <span class="muted">${t.use}</span></div></div>`)}</div>
        <h2 style="margin-top:16px">Logo</h2><ul class="small" style="margin:0;padding-left:18px">${LOGO.map((l) => html`<li>${l}</li>`)}</ul></section>
    </div>
    <section class="card"><h2>Estilos aprobados</h2><div class="stack">${STYLES.map((s) => html`<div class="small"><b>${s.name}.</b> <span class="muted">${s.desc}</span></div>`)}</div></section>
    <div class="grid cols-2">
      <section class="card"><h2>Lo que NO quiere el responsable</h2><ul class="small" style="margin:0;padding-left:18px;line-height:1.7">${DONTS.map((d) => html`<li>${d}</li>`)}</ul>
        <h2 style="margin-top:14px">Cómo trabajar</h2><ul class="small" style="margin:0;padding-left:18px">${WORKSTYLE.map((d) => html`<li>${d}</li>`)}</ul></section>
      <section class="card"><h2>Tono y frases de la casa</h2><p class="small" style="margin-top:0">Español de Canarias, cercano, de colegas, con gracia pero sin chiste fácil. Frases cortas. Primera persona del plural.</p>
        <ul class="small" style="margin:0;padding-left:18px">${PHRASES.map((d) => html`<li>«${d}»</li>`)}</ul>
        <h2 style="margin-top:14px">CTAs</h2><ul class="small" style="margin:0;padding-left:18px">${CTAS.map((d) => html`<li>${d}</li>`)}</ul>
        <h2 style="margin-top:14px">Hashtags</h2><p class="small muted" style="margin:0">${HASHTAGS.base}<br />Monólogos: + #Monólogos #Humor</p></section>
    </div>
    <div class="grid cols-2">
      <section class="card"><h2>Formatos</h2>${FORMATS.map((x) => html`<div class="small" style="padding:6px 0;border-top:1px solid var(--line)"><b>${x.piece}</b> · ${x.size}<div class="muted xs">${x.notes}</div></div>`)}</section>
      <section class="card"><h2>Plan semanal fijo</h2>${WEEKLY.map((w) => html`<div class="small" style="padding:6px 0;border-top:1px solid var(--line)"><b>${w.day} ${w.time !== '—' ? w.time : ''}</b> · ${w.what}</div>`)}
        <p class="xs muted">${WEEKLY_GOALS}</p><h2 style="margin-top:10px">Pilares</h2><ul class="small" style="margin:0;padding-left:18px">${PILLARS.map((p) => html`<li>${p}</li>`)}</ul></section>
    </div>
    <div class="grid cols-2">
      <section class="card small"><h2>El local</h2><div>${BRAND.name} · ${BRAND.place} · ${BRAND.since}</div><div>${BRAND.space}</div><div>Instagram ${BRAND.instagram} · Reservas WhatsApp ${BRAND.whatsapp} · ${BRAND.web}</div><div class="muted">${BRAND.group}</div>
        <h2 style="margin-top:12px">Fotos de personas</h2><ul style="margin:0;padding-left:18px">${PHOTO_RULES.map((p) => html`<li>${p}</li>`)}</ul></section>
      <section class="card small"><h2>Pendiente de confirmar</h2><ul style="margin:0;padding-left:18px">${PENDING.map((p) => html`<li>${p}</li>`)}</ul></section>
    </div>
  </div>`;
}

export function GeneratorView({ query }) {
  const [tab, setTab] = useState(query.get('tab') === 'marca' ? 'marca' : 'gen');
  return html`<div class="page-head"><div><h1>${tab === 'gen' ? 'Generador de contenido' : 'Guía de marca'}</h1>
      <p>${tab === 'gen' ? 'Plantillas de la casa: rellenas los datos reales y sale el caption, la versión de WhatsApp y el brief de diseño.' : 'Heineken 5mentarios · fuente: guía de transferencia de marca (11 nov 2026).'}</p></div>
    <div class="actions"><div class="seg"><button class=${tab === 'gen' ? 'on' : ''} onClick=${() => setTab('gen')}>Generador</button><button class=${tab === 'marca' ? 'on' : ''} onClick=${() => setTab('marca')}>Guía de marca</button></div>
      <button class="btn ghost" onClick=${() => go('#/calendario')}><${Icon} name="calendar" />Calendario</button></div></div>
    ${tab === 'gen' ? html`<${Generator} />` : html`<${BrandGuide} />`}`;
}
