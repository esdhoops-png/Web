// Plantillas editables RECREADAS a partir de los diseños reales de Heineken 5mentarios.
// - «original»: recreada mirando el archivo original de Drive (que se conserva intacto).
// - «guía»: recreada desde la descripción de la guía de transferencia (el archivo original no está disponible aquí).
// Ninguna es el archivo original: son reconstrucciones editables con la misma composición, colores y tipografías.
import { uid } from './engine.js';

const C = { verde: '#2BB061', verdeOsc: '#0B8A3E', neon: '#7CFFB0', negro: '#0B0B0B', negroV: '#050806', blanco: '#F2EFE8', gris: '#9A9A9A', rojo: '#E0312E' };
const LOGO_W = { kind: 'asset', path: 'icons/5mentarios-sello.svg' };
const LOGO_B = { kind: 'asset', path: 'icons/5mentarios-negro.svg' };
export const BRAND_COLORS = [C.verde, C.verdeOsc, C.neon, '#00843D', '#34C26B', C.negro, C.negroV, C.blanco, C.gris, C.rojo, '#FFFFFF', '#000000'];

const L = (type, o) => ({ id: uid(), type, visible: true, opacity: 1, rotation: 0, ...o });
const text = (o) => L('text', { font: 'Anton', weight: 400, color: C.blanco, align: 'left', valign: 'top', lineHeight: 1.02, ...o });
const logo = (x, y, w, ref = LOGO_W, name = 'Logo 5mentarios') => L('image', { name, x, y, w, h: w * (1082 / 1176), ref, fit: 'contain', placeholder: false, bind: 'logo' });
function footer(W, H, { swipe = false, counter = '' } = {}) {
  const h = Math.round(H * 0.06), y = H - h, s = W / 1080;
  return [
    L('rect', { name: 'Pie', x: 0, y, w: W, h, fill: '#000000' }),
    text({ name: 'Pie · texto', x: 40 * s, y: y + h * 0.32, w: W * 0.6, h: h * 0.4, text: 'HEINEKEN 5MENTARIOS · ARUCAS', font: 'Barlow Condensed', weight: 600, size: Math.round(22 * s), letterSpacing: 4 * s, color: C.gris }),
    ...(swipe ? [text({ name: 'Desliza', x: W * 0.6, y: y + h * 0.32, w: W * 0.4 - 40 * s, h: h * 0.4, text: 'DESLIZA →', font: 'Barlow Condensed', weight: 600, size: Math.round(22 * s), letterSpacing: 4 * s, color: C.verde, align: 'right' })] : []),
    ...(counter ? [text({ name: 'Contador', x: W - 150 * s, y: 30 * s, w: 120 * s, h: 30 * s, text: counter, font: 'Barlow Condensed', weight: 600, size: Math.round(24 * s), color: C.blanco, align: 'right', opacity: 0.8 })] : [])
  ];
}
const page = (layers, bg = C.negro) => ({ id: uid(), bg, layers });
const rowsOf = (t) => String(t || '').split('\n').map((x) => x.trim()).filter(Boolean);

export const TEMPLATES = [
  // ---------------------------------------------------------------- Champions · partido
  {
    key: 'champions-partido', name: 'Champions · Partido (pantalla partida VS)', category: 'futbol',
    basedOn: { kind: 'original', files: ['champions-02-galatasaray-barca.png', 'champions-04-roma-madrid.png'], note: 'Recreada a partir de los carteles de Champions de octubre.' },
    formats: ['post', 'story', 'square', 'landscape'], defaultFormat: 'post',
    fields: [
      { k: 'fecha', label: 'Día y fecha', def: 'MIÉRCOLES 25.11' }, { k: 'local', label: 'Equipo local', def: 'EQUIPO LOCAL' },
      { k: 'visitante', label: 'Equipo visitante', def: 'EQUIPO VISITANTE' }, { k: 'hora', label: 'Hora', def: '[HORA] H' },
      { k: 'competicion', label: 'Competición', def: 'CHAMPIONS' }, { k: 'etiqueta', label: 'Etiqueta', def: 'PARTIDAZO' }, { k: 'contador', label: 'Contador (carrusel)', def: '' }
    ],
    images: [{ k: 'fotoLocal', label: 'Foto equipo local' }, { k: 'fotoVisitante', label: 'Foto equipo visitante' }],
    build({ W, H, d }) {
      const s = W / 1080, wide = W > H, half = W / 2, fh = H * 0.94;
      const nameSize = Math.round((wide ? 120 : 120) * s), nameY = fh * (wide ? 0.6 : 0.66);
      return [page([
        L('image', { name: 'Foto local', x: 0, y: 0, w: half, h: fh, bind: 'img:fotoLocal', placeholder: 'FOTO LOCAL', brightness: 0.85 }),
        L('rect', { name: 'Degradado local', x: 0, y: fh * 0.45, w: half, h: fh * 0.55, gradient: { angle: 90, stops: [[0, 'rgba(11,11,11,0)'], [0.45, C.negro], [1, C.negro]] } }),
        L('image', { name: 'Foto visitante', x: half, y: 0, w: half, h: fh, bind: 'img:fotoVisitante', placeholder: 'FOTO VISITANTE', brightness: 0.85 }),
        L('rect', { name: 'Degradado visitante', x: half, y: fh * 0.45, w: half, h: fh * 0.55, gradient: { angle: 90, stops: [[0, 'rgba(11,138,62,0)'], [0.45, C.verdeOsc], [1, C.verdeOsc]] } }),
        logo(36 * s, 30 * s, 110 * s),
        L('circle', { name: 'Círculo VS', x: half - 60 * s, y: fh * 0.27, w: 120 * s, h: 120 * s, fill: '#FFFFFF' }),
        text({ name: 'VS', x: half - 60 * s, y: fh * 0.27, w: 120 * s, h: 120 * s, text: 'VS', size: Math.round(54 * s), color: '#000', align: 'center', valign: 'middle' }),
        L('pill', { name: 'Etiqueta', bind: 'etiqueta', x: W - 330 * s, y: 70 * s, w: 230 * s, h: 64 * s, rotation: -6, fill: '#000', radius: 4 * s, text: d.etiqueta, font: 'Anton', size: Math.round(38 * s), color: '#FFF' }),
        text({ name: 'Fecha', bind: 'fecha', x: 50 * s, y: nameY - 70 * s, w: half - 80 * s, h: 40 * s, text: d.fecha, font: 'Barlow Condensed', weight: 600, size: Math.round(30 * s), letterSpacing: 4 * s, color: C.verde }),
        text({ name: 'Equipo local', bind: 'local', x: 50 * s, y: nameY, w: half - 80 * s, h: nameSize * 2.1, text: d.local, size: nameSize, fit: true, uppercase: true }),
        L('pill', { name: 'Hora', bind: 'hora', x: 50 * s, y: nameY + nameSize * 2.2, w: 190 * s, h: 64 * s, fill: C.verde, text: d.hora, font: 'Anton', size: Math.round(30 * s), color: '#000' }),
        text({ name: 'Competición', bind: 'competicion', x: half + 50 * s, y: nameY - 70 * s, w: half - 80 * s, h: 40 * s, text: d.competicion, font: 'Barlow Condensed', weight: 600, size: Math.round(30 * s), letterSpacing: 4 * s, color: '#000' }),
        text({ name: 'Equipo visitante', bind: 'visitante', x: half + 50 * s, y: nameY, w: half - 80 * s, h: nameSize * 2.1, text: d.visitante, size: nameSize, fit: true, uppercase: true, color: '#000' }),
        ...footer(W, H, { swipe: true, counter: d.contador })
      ])];
    }
  },
  // ---------------------------------------------------------------- Champions · portada
  {
    key: 'champions-portada', name: 'Champions · Portada (texto repetido)', category: 'futbol',
    basedOn: { kind: 'original', files: ['champions-01-portada-jugadores.png'], note: 'Recreada a partir de la portada del carrusel «Vuelve la Champions» (octubre).' },
    formats: ['post', 'story', 'square', 'landscape'], defaultFormat: 'post',
    fields: [{ k: 'palabra', label: 'Palabra repetida', def: 'CHAMPIONS' }, { k: 'contador', label: 'Contador', def: '01/06' }],
    images: [{ k: 'foto', label: 'Foto recortada (PNG sin fondo de quien proporcione el responsable)' }],
    build({ W, H, d }) {
      const s = W / 1080, fh = H * 0.94, size = Math.round(190 * s);
      return [page([
        L('repeat', { name: 'Texto repetido', bind: 'palabra', x: -20 * s, y: 0, w: W + 40 * s, h: fh, text: d.palabra, font: 'Anton', size, rows: Math.ceil(fh / (size * 0.95)), gap: 0.95, color: C.verde, altColor: '#000', outlineEvery: 2, strokeColor: '#000' }),
        L('image', { name: 'Foto recortada', bind: 'img:foto', x: W * 0.05, y: fh * 0.3, w: W * 0.9, h: fh * 0.7, fit: 'contain', placeholder: 'FOTO RECORTADA' }),
        logo(36 * s, 30 * s, 110 * s, LOGO_B),
        ...footer(W, H, { swipe: true, counter: d.contador })
      ], '#FFFFFF')];
    }
  },
  // ---------------------------------------------------------------- Tardeo / Halloween
  {
    key: 'tardeo', name: 'Tardeo · Cartel de noche (estilo Halloween)', category: 'eventos',
    basedOn: { kind: 'original', files: ['cartel-halloween-31-octubre.png'], note: 'Recreada a partir del cartel del Tardeo XL de Halloween. El payaso y la tira de polaroids son del diseño original y NO se reutilizan (personajes): el hueco superior es para una foto propia.' },
    formats: ['post', 'story', 'square'], defaultFormat: 'post',
    fields: [
      { k: 'etiqueta', label: 'Etiqueta', def: 'TARDEO EXTERIOR' }, { k: 'desde', label: 'Desde las', def: 'DESDE LAS [HORA]' }, { k: 'titulo', label: 'Título', def: 'TARDEO' },
      { k: 'fecha', label: 'Fecha (manuscrita)', def: 'Sábado [día] · [mes]' }, { k: 'lineup', label: 'Line-up (una línea por artista: «16:00 DJ Ruven»)', def: '[HORA] [ARTISTA]\n[HORA] [ARTISTA]\n[HORA] [ARTISTA]\n[HORA] [ARTISTA]', multiline: true },
      { k: 'extra', label: 'Línea final', def: '…Y MÁS SORPRESAS · BARRAS EN EL EXTERIOR' }, { k: 'organiza', label: 'Organiza / colaboran', def: '' }
    ],
    images: [{ k: 'foto', label: 'Foto principal (parte superior)' }],
    build({ W, H, d }) {
      const s = W / 1080, k = H / 1350;
      const rows = rowsOf(d.lineup).slice(0, 6); const n = Math.max(rows.length, 1); const colW = (W - 80 * s) / n;
      const gridY = H * 0.74;
      return [page([
        L('image', { name: 'Foto principal', bind: 'img:foto', x: 0, y: 0, w: W, h: H * 0.62, placeholder: 'FOTO DEL LOCAL / AMBIENTE', brightness: 0.7 }),
        L('rect', { name: 'Degradado', x: 0, y: H * 0.3, w: W, h: H * 0.7, gradient: { angle: 90, stops: [[0, 'rgba(4,9,7,0)'], [0.45, '#040907'], [1, '#040907']] } }),
        L('grain', { name: 'Textura', x: 0, y: 0, w: W, h: H, amount: 0.5 }),
        logo(30 * s, 26 * s, 100 * s),
        L('glow', { name: 'Brillo verde', x: W * 0.1, y: H * 0.42, w: W * 0.8, h: H * 0.25, color: C.verde, strength: 0.35 }),
        L('pill', { name: 'Etiqueta', bind: 'etiqueta', x: W * 0.18, y: H * 0.47, w: 330 * s, h: 70 * s, fill: C.verde, radius: 6 * s, rotation: -3, text: d.etiqueta, font: 'Anton', size: Math.round(40 * s), color: '#000' }),
        text({ name: 'Desde', bind: 'desde', x: W * 0.52, y: H * 0.47, w: 320 * s, h: 70 * s, text: d.desde, size: Math.round(30 * s), color: C.blanco, lineHeight: 1 }),
        text({ name: 'Título', bind: 'titulo', x: 40 * s, y: H * 0.53, w: W - 80 * s, h: 150 * k, text: d.titulo, size: Math.round(150 * s), align: 'center', fit: true, glowColor: C.verde, glowBlur: 40 * s, uppercase: true }),
        text({ name: 'Fecha manuscrita', bind: 'fecha', x: 40 * s, y: H * 0.655, w: W - 80 * s, h: 60 * s, text: d.fecha, font: 'Permanent Marker', size: Math.round(46 * s), color: C.neon, align: 'center' }),
        L('line', { name: 'Línea', x: 40 * s, y: gridY - 14 * s, w: W - 80 * s, h: 4, width: 2, color: 'rgba(242,239,232,.25)' }),
        ...rows.flatMap((r, i) => { const m = r.match(/^(\d{1,2}[:.]\d{2})\s+(.*)$/); return [
          text({ name: `Hora ${i + 1}`, bind: `lineup:${i}:hora`, x: 40 * s + i * colW, y: gridY, w: colW - 10 * s, h: 40 * s, text: m ? m[1] : '', size: Math.round(30 * s), color: C.verde, align: 'center' }),
          text({ name: `Artista ${i + 1}`, bind: `lineup:${i}:nombre`, x: 40 * s + i * colW, y: gridY + 44 * s, w: colW - 10 * s, h: 110 * s, text: m ? m[2] : r, size: Math.round(40 * s), fit: true, align: 'center', uppercase: true })]; }),
        text({ name: 'Línea final', bind: 'extra', x: 40 * s, y: H * 0.86, w: W - 80 * s, h: 40 * s, text: d.extra, font: 'Barlow Condensed', weight: 600, size: Math.round(28 * s), letterSpacing: 3 * s, color: C.neon, align: 'center' }),
        text({ name: 'Organiza / colaboran', bind: 'organiza', x: 40 * s, y: H * 0.91, w: W - 80 * s, h: 36 * s, text: d.organiza, font: 'Special Elite', size: Math.round(22 * s), color: C.neon, align: 'center' })
      ], '#040907')];
    }
  },
  // ---------------------------------------------------------------- Monólogos
  {
    key: 'monologos', name: 'Monólogos (estilo aprobado)', category: 'eventos',
    basedOn: { kind: 'guia', files: ['post-monologos-12-noviembre (no disponible aquí)'], note: 'Recreada desde la descripción del estilo «Monólogos» aprobado en la guía de transferencia.' },
    formats: ['post', 'story', 'square'], defaultFormat: 'post',
    fields: [
      { k: 'fechaCorta', label: 'Fecha corta (arriba derecha)', def: '[DD/MM]' }, { k: 'titulo', label: 'Título', def: 'MONÓLOGOS' },
      { k: 'subtitulo', label: 'Subtítulo', def: 'ESTE JUEVES · [DÍA] DE [MES] · [HORA]' }, { k: 'dia', label: 'Día sobre el nombre', def: 'JUE [DD.MM]' },
      { k: 'nombre', label: 'Humorista', def: '[NOMBRE DEL HUMORISTA]' }, { k: 'pieIzq', label: 'Pie izquierda', def: 'AFORO LIMITADO' }, { k: 'pieDer', label: 'Pie derecha', def: 'RESERVAS 627 304 115' },
      { k: 'soldout', label: 'Etiqueta SOLD OUT (vacío = sin etiqueta)', def: '' }
    ],
    images: [{ k: 'foto', label: 'Foto del humorista (recortada)' }],
    build({ W, H, d }) {
      const s = W / 1080, k = H / 1350;
      return [page([
        logo(40 * s, 36 * s, 105 * s),
        text({ name: 'Fecha corta', bind: 'fechaCorta', x: W - 300 * s, y: 50 * s, w: 260 * s, h: 60 * s, text: d.fechaCorta, size: Math.round(50 * s), color: C.verde, align: 'right' }),
        text({ name: 'Título', bind: 'titulo', x: 40 * s, y: 170 * k, w: W - 80 * s, h: 220 * s, text: d.titulo, font: 'Barlow Condensed', weight: 900, size: Math.round(210 * s), color: C.blanco, align: 'center', fit: true, uppercase: true }),
        text({ name: 'Subtítulo', bind: 'subtitulo', x: 40 * s, y: 170 * k + 215 * s, w: W - 80 * s, h: 40 * s, text: d.subtitulo, font: 'Barlow Condensed', weight: 600, size: Math.round(28 * s), letterSpacing: 8 * s, color: C.verde, align: 'center', fit: true }),
        L('glow', { name: 'Resplandor', x: W * 0.15, y: H * 0.38, w: W * 0.7, h: H * 0.45, color: C.verde, strength: 0.5 }),
        L('image', { name: 'Foto humorista', bind: 'img:foto', x: W * 0.2, y: H * 0.36, w: W * 0.6, h: H * 0.42, fit: 'contain', placeholder: 'FOTO DEL HUMORISTA' }),
        text({ name: 'Día', bind: 'dia', x: 40 * s, y: H * 0.79, w: W - 80 * s, h: 50 * s, text: d.dia, size: Math.round(44 * s), color: C.verde, align: 'center' }),
        text({ name: 'Nombre', bind: 'nombre', x: 40 * s, y: H * 0.79 + 52 * s, w: W - 80 * s, h: 110 * s, text: d.nombre, size: Math.round(96 * s), align: 'center', fit: true, uppercase: true }),
        L('line', { name: 'Línea fina', x: 40 * s, y: H * 0.93, w: W - 80 * s, h: 4, width: 2, color: 'rgba(242,239,232,.4)' }),
        text({ name: 'Pie izquierda', bind: 'pieIzq', x: 40 * s, y: H * 0.945, w: W / 2 - 40 * s, h: 34 * s, text: d.pieIzq, font: 'Barlow Condensed', weight: 600, size: Math.round(26 * s), letterSpacing: 4 * s, color: C.blanco }),
        text({ name: 'Pie derecha', bind: 'pieDer', x: W / 2, y: H * 0.945, w: W / 2 - 40 * s, h: 34 * s, text: d.pieDer, font: 'Barlow Condensed', weight: 600, size: Math.round(26 * s), letterSpacing: 4 * s, color: C.blanco, align: 'right' }),
        ...(d.soldout ? [L('pill', { name: 'Sold out', bind: 'soldout', x: W - 360 * s, y: H * 0.36, w: 300 * s, h: 80 * s, rotation: -8, fill: C.rojo, radius: 6 * s, text: d.soldout, font: 'Anton', size: Math.round(46 * s), color: '#FFF' })] : [])
      ], C.negro)];
    }
  },
  // ---------------------------------------------------------------- Story «Hoy en 5mentarios»
  {
    key: 'story-hoy', name: 'Story «Hoy en 5mentarios»', category: 'stories',
    basedOn: { kind: 'original', files: ['story-esta-semana-12-14-nov.mp4', 'story «Faltan 2 días» del Tardeo Exterior'], note: 'Recreada a partir de las stories reales enviadas el 12 nov (rayos verdes, pastilla de fecha, filas hora verde / nombre a la derecha con líneas finas). Versión estática; la animación se hace en el módulo de vídeo.' },
    formats: ['story'], defaultFormat: 'story',
    fields: [{ k: 'fecha', label: 'Fecha (pastilla)', def: '[DÍA] [DD.MM]' }, { k: 'filas', label: 'Programa (una línea: «22:30 Son Diferente»)', def: '[HORA] [ARTISTA]\n[HORA] [DJ]', multiline: true }, { k: 'reserva', label: 'Llamada final', def: 'RESERVA TU MESA · WHATSAPP 627 304 115' }],
    images: [],
    build({ W, H, d }) {
      const s = W / 1080; const rows = rowsOf(d.filas).slice(0, 5);
      return [page([
        L('rays', { name: 'Rayos', x: -W * 0.5, y: H * 0.05, w: W * 2, h: W * 2, color: C.verde, count: 18, strength: 0.08 }),
        L('glow', { name: 'Brillo', x: -W * 0.2, y: H * 0.15, w: W * 1.4, h: W * 1.4, color: C.verde, strength: 0.25 }),
        logo(W / 2 - 60 * s, 250 * s, 120 * s),
        L('pill', { name: 'Fecha', bind: 'fecha', x: W - 330 * s, y: 270 * s, w: 260 * s, h: 64 * s, fill: C.verde, text: d.fecha, font: 'Anton', size: Math.round(30 * s), color: '#000' }),
        text({ name: 'HOY', x: 60 * s, y: 430 * s, w: W - 120 * s, h: 300 * s, text: 'HOY', size: Math.round(300 * s), align: 'center', glowColor: C.verde, glowBlur: 50 * s }),
        text({ name: 'en 5mentarios', x: 60 * s, y: 740 * s, w: W - 120 * s, h: 60 * s, text: 'EN 5MENTARIOS', font: 'Barlow Condensed', weight: 600, size: Math.round(44 * s), letterSpacing: 12 * s, color: C.blanco, align: 'center' }),
        ...rows.flatMap((r, i) => { const m = r.match(/^(\d{1,2}[:.]\d{2})\s+(.*)$/); const n = Math.max(rows.length, 1);
          const rh = Math.min(170, 640 / n) * s; const y0 = 900 * s + (640 * s - rh * n) / 2; const y = y0 + i * rh; const fs = Math.min(84, rh / s * 0.55) * s;
          return [
          ...(i === 0 ? [L('line', { name: 'Línea superior', x: 100 * s, y: y - 3 * s, w: W - 200 * s, h: 6 * s, width: 2 * s, color: 'rgba(43,176,97,.45)' })] : []),
          text({ name: `Hora ${i + 1}`, bind: `filas:${i}:hora`, x: 100 * s, y: y + (rh - fs) / 2, w: 300 * s, h: fs * 1.1, text: m ? m[1] : '', size: Math.round(fs), color: C.verde }),
          text({ name: `Artista ${i + 1}`, bind: `filas:${i}:nombre`, x: 400 * s, y: y + (rh - fs) / 2, w: W - 500 * s, h: fs * 1.1, text: m ? m[2] : r, size: Math.round(fs), fit: true, uppercase: true, align: 'right' }),
          L('line', { name: `Separador ${i + 1}`, x: 100 * s, y: y + rh - 3 * s, w: W - 200 * s, h: 6 * s, width: 2 * s, color: 'rgba(43,176,97,.45)' })]; }),
        text({ name: 'Reserva', bind: 'reserva', x: 60 * s, y: 1620 * s, w: W - 120 * s, h: 60 * s, text: d.reserva, font: 'Barlow Condensed', weight: 900, size: Math.round(40 * s), letterSpacing: 3 * s, color: C.verde, align: 'center', fit: true })
      ], C.negroV)];
    }
  },
  // ---------------------------------------------------------------- Carrusel line-up (polaroid)
  {
    key: 'lineup', name: 'Carrusel line-up (polaroid)', category: 'carruseles',
    basedOn: { kind: 'guia', files: ['carrusel-tardeo-1…5 (no disponible aquí)'], note: 'Recreada desde la descripción del carrusel line-up del tardeo del 14.' },
    formats: ['post', 'square'], defaultFormat: 'post', multiPage: true,
    fields: [{ k: 'banda', label: 'Banda', def: 'TARDEO EXTERIOR · [FECHA]' }, { k: 'artistas', label: 'Artistas (una línea: «17:30 Apolo»)', def: '[HORA] [ARTISTA]\n[HORA] [ARTISTA]', multiline: true }],
    images: [{ k: 'foto0', label: 'Foto artista 1' }, { k: 'foto1', label: 'Foto artista 2' }, { k: 'foto2', label: 'Foto artista 3' }, { k: 'foto3', label: 'Foto artista 4' }],
    build({ W, H, d }) {
      const s = W / 1080; const rows = rowsOf(d.artistas).slice(0, 8); const total = rows.length || 1;
      return (rows.length ? rows : ['[HORA] [ARTISTA]']).map((r, i) => { const m = r.match(/^(\d{1,2}[:.]\d{2})\s+(.*)$/); return page([
        L('grain', { name: 'Textura', x: 0, y: 0, w: W, h: H, amount: 0.4 }),
        logo(36 * s, 30 * s, 100 * s),
        text({ name: 'Contador', x: W - 180 * s, y: 46 * s, w: 140 * s, h: 40 * s, text: `${i + 2}/${total + 1}`, font: 'Barlow Condensed', weight: 600, size: Math.round(30 * s), color: C.blanco, align: 'right' }),
        L('image', { name: 'Polaroid', bind: `img:foto${i}`, x: W * 0.17, y: H * 0.13, w: W * 0.66, h: W * 0.66 + 70 * s, rotation: -4, frame: 22 * s, frameBottom: 50 * s, frameColor: '#F2EFE8', shadow: true, placeholder: 'FOTO DEL ARTISTA' }),
        L('rect', { name: 'Cinta', x: W * 0.42, y: H * 0.11, w: 190 * s, h: 50 * s, rotation: 4, fill: C.verde, opacity: 0.85 }),
        text({ name: 'Hora', bind: `artistas:${i}:hora`, x: 40 * s, y: H * 0.72, w: W - 80 * s, h: 80 * s, text: m ? m[1] : '[HORA]', size: Math.round(72 * s), color: C.verde, align: 'center' }),
        text({ name: 'Artista', bind: `artistas:${i}:nombre`, x: 40 * s, y: H * 0.72 + 80 * s, w: W - 80 * s, h: 120 * s, text: m ? m[2] : r, size: Math.round(110 * s), align: 'center', fit: true, uppercase: true }),
        L('pill', { name: 'Banda', bind: 'banda', x: -20 * s, y: H * 0.9, w: W + 40 * s, h: 70 * s, rotation: -3, fill: C.verde, radius: 0, text: d.banda, font: 'Anton', size: Math.round(36 * s), color: '#000' })
      ], C.negroV); });
    }
  },
  // ---------------------------------------------------------------- Programación del finde
  {
    key: 'programacion', name: 'Programación del finde (cartel de noche)', category: 'carteles',
    basedOn: { kind: 'guia', files: [], note: 'Estilo «cartel de noche» de la guía: fondo negro, brillo verde, Anton blanco, horas en verde.' },
    formats: ['post', 'story', 'square', 'landscape'], defaultFormat: 'post',
    fields: [{ k: 'titulo', label: 'Título', def: 'ESTE FINDE' }, { k: 'filas', label: 'Filas (una línea: «VIE 20 · 22:30 · Apolo + DJ Asped»)', def: 'VIE [DD] · [HORA] · [ARTISTA]\nSÁB [DD] · [HORA] · [ARTISTA]', multiline: true },
      { k: 'pie', label: 'Línea de comida', def: 'VOLCÁN · CUOR DI PIZZA · TE LO LLEVAMOS A LA MESA' }, { k: 'reserva', label: 'Reserva', def: 'RESERVAS 627 304 115' }],
    images: [{ k: 'fondo', label: 'Foto de fondo (opcional)' }],
    build({ W, H, d }) {
      const s = W / 1080; const rows = rowsOf(d.filas).slice(0, 5); const top = H * 0.36; const rh = Math.min(170 * s, (H * 0.42) / Math.max(rows.length, 1));
      return [page([
        L('image', { name: 'Foto de fondo', bind: 'img:fondo', x: 0, y: 0, w: W, h: H, brightness: 0.35, placeholder: false }),
        L('glow', { name: 'Brillo verde', x: -W * 0.1, y: H * 0.05, w: W * 1.2, h: H * 0.5, color: C.verde, strength: 0.35 }),
        logo(36 * s, 30 * s, 110 * s),
        text({ name: 'Título', bind: 'titulo', x: 40 * s, y: H * 0.13, w: W - 80 * s, h: H * 0.18, text: d.titulo, size: Math.round(170 * s), align: 'center', fit: true, glowColor: C.verde, glowBlur: 40 * s, uppercase: true }),
        ...rows.flatMap((r, i) => { const parts = r.split('·').map((x) => x.trim()); const y = top + i * rh; return [
          text({ name: `Día ${i + 1}`, bind: `filas:${i}:0`, x: 60 * s, y, w: 260 * s, h: rh * 0.45, text: parts[0] || '', font: 'Barlow Condensed', weight: 900, size: Math.round(40 * s), letterSpacing: 4 * s, color: C.blanco }),
          text({ name: `Hora ${i + 1}`, bind: `filas:${i}:1`, x: 60 * s, y: y + rh * 0.42, w: 260 * s, h: rh * 0.45, text: parts[1] || '', size: Math.round(54 * s), color: C.verde }),
          text({ name: `Artista ${i + 1}`, bind: `filas:${i}:2`, x: 330 * s, y: y + rh * 0.12, w: W - 390 * s, h: rh * 0.8, text: parts.slice(2).join(' · ') || '', size: Math.round(70 * s), fit: true, uppercase: true, valign: 'middle' }),
          L('line', { name: `Separador ${i + 1}`, x: 60 * s, y: y + rh - 6 * s, w: W - 120 * s, h: 4, width: 1.5, color: 'rgba(242,239,232,.18)' })]; }),
        L('pill', { name: 'Comida', bind: 'pie', x: 60 * s, y: H * 0.84, w: W - 120 * s, h: 60 * s, fill: C.verde, text: d.pie, font: 'Barlow Condensed', weight: 900, size: Math.round(28 * s), letterSpacing: 2 * s, color: '#000' }),
        text({ name: 'Reserva', bind: 'reserva', x: 60 * s, y: H * 0.89, w: W - 120 * s, h: 36 * s, text: d.reserva, font: 'Barlow Condensed', weight: 600, size: Math.round(28 * s), letterSpacing: 6 * s, color: C.blanco, align: 'center' }),
        ...footer(W, H)
      ], C.negro)];
    }
  },
  // ================================================================ ESTILO PSD (carrusel de noviembre)
  // Colores medidos en los PSD: verde #0B8A3E, verde vivo #2BB061, negro #0B0B0B, claro #F3F3F1, gris #8A8A86.
  // ---------------------------------------------------------------- Artista / plan del día
  {
    key: 'artista', name: 'Artista del día (estilo PSD)', category: 'carteles',
    basedOn: { kind: 'original', files: ['slide 07/09 (Alberto Déniz)', 'slide 02/07', 'nov-05-13-y-14.psd'], note: 'Una sola actuación a página completa: foto recortada a la derecha, día en verde espaciado, nombre gigante en Anton, pastilla rellena y pastilla de contorno.' },
    formats: ['post', 'story', 'square'], defaultFormat: 'post',
    fields: [
      { k: 'estilo', label: 'Estilo (B = negro · A = verde)', def: 'B' }, { k: 'contador', label: 'Contador (opcional)', def: '' }, { k: 'kicker', label: 'Etiqueta superior (opcional, p. ej. HOY)', def: '' },
      { k: 'dia', label: 'Día (p. ej. VIERNES 27.11)', def: 'VIERNES [DD.MM]' }, { k: 'nombre', label: 'Artista / evento', def: '[ARTISTA]' },
      { k: 'pill1', label: 'Pastilla rellena', def: 'LIVE · 22:30' }, { k: 'pill2', label: 'Pastilla de contorno (opcional)', def: 'DJ [NOMBRE] · 00:00' },
      { k: 'nota', label: 'Línea final (opcional)', def: '' }, { k: 'cta', label: 'Llamada del pie', def: '¡TE ESPERAMOS!' }
    ],
    images: [{ k: 'foto', label: 'Foto recortada del artista (sin fondo)' }],
    build({ W, H, d }) {
      const s = W / 1080, B = String(d.estilo || 'B').trim().toUpperCase() !== 'A', story = H > W * 1.5;
      const c = B ? { bg: '#0B0B0B', day: '#2BB061', name: '#FFFFFF', f1: '#2BB061', t1: '#0B0B0B', o: '#FFFFFF', ft: '#8A8A86', cta: '#2BB061' }
        : { bg: '#0B8A3E', day: '#0B0B0B', name: '#FFFFFF', f1: '#0B0B0B', t1: '#FFFFFF', o: '#0B0B0B', ft: '#0B0B0B', cta: '#0B0B0B' };
      const pw = (t) => Math.min(520 * s, (String(t || '').length * 18 + 72) * s);
      const top = story ? H * 0.40 : H * 0.29, k = story ? 1.25 : 1, num = (String(d.dia || '').match(/\b(\d{1,2})[.\/]/) || [])[1] || '';
      return [page([
        ...(num ? [text({ name: 'Número del día', x: W * 0.5, y: story ? H * 0.1 : H * 0.06, w: W * 0.5 - 40 * s, h: story ? 760 * s : 560 * s, text: num, size: Math.round((story ? 700 : 520) * s), lineHeight: 0.9, align: 'right', color: 'transparent', strokeColor: B ? 'rgba(43,176,97,.55)' : 'rgba(11,11,11,.5)', strokeWidth: 3 * s })] : []),
        L('image', { name: 'Foto del artista', bind: 'img:foto', x: W * 0.38, y: story ? H * 0.12 : 0, w: W * 0.62, h: story ? H * 0.78 : H * 0.78, fit: 'contain', focusY: 1, placeholder: false }),
        L('rect', { name: 'Degradado bajo la foto', x: 0, y: (story ? H * 0.78 : H * 0.62), w: W, h: H * 0.2, gradient: { angle: 90, stops: [[0, B ? 'rgba(11,11,11,0)' : 'rgba(11,138,62,0)'], [1, c.bg]] } }),
        logo(69 * s, 54 * s, 103 * s, LOGO_W),
        ...(d.contador ? [text({ name: 'Contador', bind: 'contador', x: 200 * s, y: 92 * s, w: 160 * s, h: 28 * s, text: d.contador, font: 'Barlow Condensed', weight: 900, size: Math.round(26 * s), letterSpacing: 3 * s, color: c.day })] : []),
        ...(d.kicker ? [L('pill', { name: 'Etiqueta', bind: 'kicker', x: 64 * s, y: top - 110 * s, w: pw(d.kicker), h: 58 * s, fill: c.f1, text: d.kicker, font: 'Barlow Condensed', weight: 900, size: Math.round(28 * s), letterSpacing: 4 * s, color: c.t1 })] : []),
        text({ name: 'Día', bind: 'dia', x: 64 * s, y: top, w: W * 0.7, h: 44 * s, text: d.dia, font: 'Barlow Condensed', weight: 900, size: Math.round(40 * k * s), letterSpacing: 10 * s, color: c.day, uppercase: true }),
        text({ name: 'Nombre', bind: 'nombre', x: 60 * s, y: top + 84 * k * s, w: W * (story ? 0.8 : 0.56), h: 316 * k * s, text: d.nombre, size: Math.round(170 * k * s), lineHeight: 0.92, fit: true, uppercase: true, color: c.name, valign: 'middle' }),
        L('pill', { name: 'Pastilla rellena', bind: 'pill1', x: 64 * s, y: top + 420 * k * s, w: pw(d.pill1) * k, h: 66 * k * s, fill: c.f1, text: d.pill1, font: 'Barlow Condensed', weight: 900, size: Math.round(32 * k * s), letterSpacing: 2 * s, color: c.t1 }),
        ...(d.pill2 ? [L('pill', { name: 'Pastilla de contorno', bind: 'pill2', x: 64 * s, y: top + (420 + 82) * k * s, w: pw(d.pill2) * k, h: 66 * k * s, fill: 'rgba(0,0,0,0)', stroke: c.o, strokeWidth: 3 * s, text: d.pill2, font: 'Barlow Condensed', weight: 900, size: Math.round(32 * k * s), letterSpacing: 2 * s, color: c.o })] : []),
        ...(d.nota ? [text({ name: 'Nota', bind: 'nota', x: 64 * s, y: top + (d.pill2 ? 600 : 520) * k * s, w: W * 0.6, h: 70 * s, text: d.nota, font: 'Barlow Condensed', weight: 600, size: Math.round(30 * s), lineHeight: 1.15, color: c.name, fit: true })] : []),
        text({ name: 'Pie · texto', x: 64 * s, y: H - 74 * s, w: W * 0.6, h: 26 * s, text: 'HEINEKEN 5MENTARIOS · ARUCAS', font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: c.ft }),
        text({ name: 'Llamada', bind: 'cta', x: W * 0.55, y: H - 74 * s, w: W * 0.45 - 70 * s, h: 26 * s, text: d.cta, font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: c.cta, align: 'right' })
      ], c.bg)];
    }
  },
  // ---------------------------------------------------------------- Lista (fondo claro: «Champions en noviembre»)
  {
    key: 'lista', name: 'Lista con titular (estilo PSD «Champions en noviembre»)', category: 'carteles',
    basedOn: { kind: 'original', files: ['slide 07/07 «Champions en noviembre» (Sin título-1.psd)'], note: 'Fondo claro, pastilla negra, titular en dos líneas (negro + verde), filas separadas por líneas negras con fecha en verde, hora grande y texto en Anton.' },
    formats: ['post', 'story', 'square'], defaultFormat: 'post',
    fields: [
      { k: 'contador', label: 'Contador (opcional)', def: '' }, { k: 'kicker', label: 'Pastilla', def: 'FÚTBOL EN PANTALLA GRANDE' },
      { k: 'titulo1', label: 'Titular · línea negra', def: 'CHAMPIONS' }, { k: 'titulo2', label: 'Titular · línea verde', def: 'EN [MES]' },
      { k: 'filas', label: 'Filas (una línea: «MAR 24.11 · 20:00 · R. MADRID vs PSV · detalle opcional»)', def: '[DÍA DD.MM] · [HORA] · [TEXTO]', multiline: true },
      { k: 'nota', label: 'Frase final', def: 'Pide Volcán Smash Burger y te lo llevamos a la mesa.' }, { k: 'cta', label: 'Llamada del pie', def: '¡TE ESPERAMOS!' }
    ],
    images: [],
    build({ W, H, d }) {
      const s = W / 1080, CL = '#F3F3F1', N = '#0B0B0B', V = '#0B8A3E', G = '#8A8A86';
      const rows = rowsOf(d.filas).slice(0, 7), story = H > W * 1.5, sq = H <= W;
      const t0 = !rows.length ? H * 0.2 : story ? 330 * s : sq ? 150 * s : 213 * s, ts = sq ? 120 : story ? 190 : 165;
      const titleH = (ts * 0.92) * s, y1 = t0 + 74 * s, y2 = y1 + titleH, listTop = y2 + titleH + 32 * s;
      const listEnd = H - (story ? 300 : 150) * s, step = rows.length ? Math.min((story ? 185 : 135) * s, (listEnd - listTop) / rows.length) : 0;
      const team = (t) => (/BAR[CÇ]A|MADRID|5MENTARIOS/i.test(t) ? N : G);
      const row = (r, i) => {
        const p = r.split('·').map((x) => x.trim()), y = listTop + i * step, main = p[2] || '', sub = p.slice(3).join(' · ');
        const ms = Math.min((story ? 86 : 72) * s, step * 0.5), mx = 270 * s, mw = W - mx - 77 * s, my = y + (step - ms * (sub ? 1.5 : 1)) / 2;
        const out = [L('line', { name: `Línea ${i + 1}`, x: 51 * s, y, w: W - 128 * s, h: 4, width: 3 * s, color: N }),
          text({ name: `Fecha ${i + 1}`, bind: `filas:${i}:0`, x: 52 * s, y: y + step * 0.2, w: 200 * s, h: 28 * s, text: p[0] || '', font: 'Barlow Condensed', weight: 900, size: Math.round(Math.min(26 * s, step * 0.2)), letterSpacing: 3 * s, color: V }),
          text({ name: `Hora ${i + 1}`, bind: `filas:${i}:1`, x: 52 * s, y: y + step * 0.2 + Math.min(30 * s, step * 0.23), w: 200 * s, h: Math.min(56 * s, step * 0.42), text: p[1] || '', size: Math.round(Math.min(54 * s, step * 0.4)), color: N, fit: true })];
        const vs = main.split(/\s+vs\.?\s+/i);
        if (vs.length === 2) {
          const w1 = Math.min(mw * 0.48, vs[0].length * ms * 0.46);
          out.push(text({ name: `Equipo A ${i + 1}`, x: mx, y: my, w: w1, h: ms * 1.05, text: vs[0], size: Math.round(ms), color: team(vs[0]), uppercase: true, fit: true }),
            text({ name: `vs ${i + 1}`, x: mx + w1 + 12 * s, y: my + ms * 0.3, w: 44 * s, h: ms * 0.7, text: 'vs', size: Math.round(ms * 0.6), color: V }),
            text({ name: `Equipo B ${i + 1}`, x: mx + w1 + 60 * s, y: my, w: mw - w1 - 60 * s, h: ms * 1.05, text: vs[1], size: Math.round(ms), color: team(vs[1]), uppercase: true, fit: true }));
        } else out.push(text({ name: `Texto ${i + 1}`, bind: `filas:${i}:2`, x: mx, y: my, w: mw, h: ms * 1.05, text: main, size: Math.round(ms), color: N, uppercase: true, fit: true }));
        if (sub) out.push(text({ name: `Detalle ${i + 1}`, x: mx, y: my + ms * 1.08, w: mw, h: ms * 0.45, text: sub, font: 'Barlow Condensed', weight: 900, size: Math.round(ms * 0.36), letterSpacing: 3 * s, color: G, uppercase: true, fit: true }));
        return out;
      };
      return [page([
        logo(56 * s, 54 * s, 103 * s, LOGO_B),
        ...(d.contador ? [text({ name: 'Contador', bind: 'contador', x: W - 230 * s, y: 92 * s, w: 150 * s, h: 28 * s, text: d.contador, font: 'Barlow Condensed', weight: 900, size: Math.round(26 * s), letterSpacing: 3 * s, color: V, align: 'right' })] : []),
        L('pill', { name: 'Pastilla', bind: 'kicker', x: 51 * s, y: t0, w: Math.min(W - 102 * s, (String(d.kicker).length * 17 + 80) * s), h: 58 * s, fill: N, text: d.kicker, font: 'Barlow Condensed', weight: 900, size: Math.round(27 * s), letterSpacing: 4 * s, color: '#FFFFFF' }),
        text({ name: 'Titular negro', bind: 'titulo1', x: 50 * s, y: y1, w: W - 100 * s, h: titleH, text: d.titulo1, size: Math.round(ts * s), lineHeight: 0.92, fit: true, uppercase: true, color: N }),
        text({ name: 'Titular verde', bind: 'titulo2', x: 50 * s, y: y2, w: W - 100 * s, h: titleH, text: d.titulo2, size: Math.round(ts * s), lineHeight: 0.92, fit: true, uppercase: true, color: V }),
        ...rows.flatMap(row),
        ...(!rows.length ? [logo(W / 2 - 190 * s, y2 + titleH + (H - y2 - titleH - 160 * s) / 2 - 175 * s, 380 * s, LOGO_B, 'Sello')] : []),
        ...(rows.length ? [L('line', { name: 'Línea final', x: 51 * s, y: listTop + rows.length * step, w: W - 128 * s, h: 4, width: 3 * s, color: N })] : []),
        ...(d.nota ? [text({ name: 'Frase final', bind: 'nota', x: 52 * s, y: H - 126 * s, w: W - 104 * s, h: 34 * s, text: d.nota, font: 'Barlow Condensed', weight: 600, size: Math.round(28 * s), color: '#333333', fit: true })] : []),
        text({ name: 'Pie · texto', x: 52 * s, y: H - 75 * s, w: W * 0.6, h: 26 * s, text: 'HEINEKEN 5MENTARIOS · ARUCAS', font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: '#6E6E6A' }),
        text({ name: 'Llamada', bind: 'cta', x: W * 0.55, y: H - 75 * s, w: W * 0.45 - 80 * s, h: 26 * s, text: d.cta, font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: V, align: 'right' })
      ], CL)];
    }
  },
  // ---------------------------------------------------------------- Tardeo (palabra repetida + banda)
  {
    key: 'tardeo-xl', name: 'Tardeo · palabra repetida (estilo PSD)', category: 'eventos',
    basedOn: { kind: 'original', files: ['slide del tardeo del domingo 08.11 (Sin título-1.psd)'], note: 'Banda negra superior con horas en verde y artistas en blanco, «TARDEO» repetido en filas (verde, contorno, negro) y banda verde con la fecha.' },
    formats: ['post', 'story', 'square'], defaultFormat: 'post',
    fields: [
      { k: 'filas', label: 'Programa (una línea: «16:30 · SON KARIBE»)', def: '[HORA] · [ARTISTA]\n[HORA] · [ARTISTA]', multiline: true },
      { k: 'palabra', label: 'Palabra repetida', def: 'TARDEO' }, { k: 'banda', label: 'Banda verde', def: '[DÍA DD.MM] · AL AIRE LIBRE' },
      { k: 'cta', label: 'Llamada de la banda negra', def: 'DESLIZA →' }
    ],
    images: [],
    build({ W, H, d }) {
      const s = W / 1080, N = '#0B0B0B', V = '#0B8A3E', CL = '#F3F3F1';
      const story = H > W * 1.5, rows = rowsOf(d.filas).slice(0, 5), rh = (rows.length > 3 ? 64 : 86) * (story ? 1.35 : 1) * s, rs = (rows.length > 3 ? 60 : 78) * (story ? 1.3 : 1);
      const bandH = (story ? 160 : 43) * s + rows.length * rh + 90 * s, word = String(d.palabra || 'TARDEO').toUpperCase(), line = `${word} ${word} ${word} ${word}`;
      const fs = Math.round(196 * s), lh = 164 * s, styles = [{ color: V }, { color: 'transparent', strokeColor: N, strokeWidth: 2.5 * s }, { color: N }];
      const bandY = bandH + 3 * lh + 20 * s, after = bandY + 143 * s + 20 * s;
      const nAfter = Math.max(1, Math.ceil((H - after) / lh));
      const wordRow = (i, y, k) => text({ name: `${word} ${k}`, x: -((i * 137) % 420) * s - 60 * s, y, w: 3200 * s, h: lh * 1.05, text: line, size: fs, lineHeight: 0.85, ...styles[i % 3] });
      return [page([
        ...[0, 1, 2].map((i) => wordRow(i, bandH + 18 * s + i * lh, i + 1)),
        L('rect', { name: 'Banda verde', x: 0, y: bandY, w: W, h: 143 * s, fill: V }),
        text({ name: 'Banda · texto', bind: 'banda', x: 28 * s, y: bandY + 20 * s, w: W - 56 * s, h: 110 * s, text: d.banda, size: Math.round(96 * s), fit: true, uppercase: true, color: '#FFFFFF', valign: 'middle', align: 'center' }),
        ...Array.from({ length: nAfter }, (_, j) => wordRow(j + 1, after + j * lh, j + 4)),
        L('rect', { name: 'Banda negra', x: 0, y: 0, w: W, h: bandH, fill: N }),
        ...rows.flatMap((r, i) => { const p = r.split('·').map((x) => x.trim()); const y = (story ? 160 : 43) * s + i * rh; return [
          text({ name: `Hora ${i + 1}`, bind: `filas:${i}:0`, x: 64 * s, y: y + rh * 0.3, w: 110 * s, h: rh * 0.62, text: p[0] || '', size: Math.round(rs * 0.55 * s), color: '#2BB061', fit: true }),
          text({ name: `Artista ${i + 1}`, bind: `filas:${i}:1`, x: 180 * s, y, w: W * 0.66, h: rh, text: p.slice(1).join(' · '), size: Math.round(rs * s), color: '#FFFFFF', uppercase: true, fit: true })]; }),
        logo(W - 225 * s, (story ? 150 : 46) * s, 160 * s, LOGO_W),
        text({ name: 'Pie · texto', x: 64 * s, y: bandH - 63 * s, w: W * 0.6, h: 26 * s, text: 'HEINEKEN 5MENTARIOS · ARUCAS', font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: '#BDBDBA' }),
        text({ name: 'Llamada', bind: 'cta', x: W * 0.55, y: bandH - 63 * s, w: W * 0.45 - 70 * s, h: 26 * s, text: d.cta, font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: '#2BB061', align: 'right' })
      ], CL)];
    }
  },
  // ---------------------------------------------------------------- Calendario del mes (portada del carrusel mensual)
  {
    key: 'mes', name: 'Calendario del mes (portada del carrusel)', category: 'carruseles',
    basedOn: { kind: 'original', files: ['nov-01-portada.psd'], note: 'Recreada a partir de la portada del carrusel de noviembre (fondo verde, rejilla LUN–DOM, casillas negras para eventos y claras para noches con música).' },
    formats: ['post', 'story', 'square'], defaultFormat: 'post',
    fields: [
      { k: 'mes', label: 'Mes', def: 'DICIEMBRE' }, { k: 'anio', label: 'Año', def: '2026' }, { k: 'mesNum', label: 'Nº de mes (1–12)', def: '12' },
      { k: 'dias', label: 'Días (una línea: «4 · APOLO · + DJ RUVEN» = noche · «24 · TARDEO · NAVIDAD · E» = evento en negro)', def: '[DÍA] · [ARTISTA] · + DJ [NOMBRE]', multiline: true },
      { k: 'pie', label: 'Llamada del pie', def: 'DESLIZA →' }
    ],
    images: [{ k: 'fotos', label: 'Fotos recortadas de artistas (opcional, parte baja)' }],
    build({ W, H, d }) {
      const s = W / 1080, CV = '#0B8A3E', CO = '#0A7535', CN = '#0B0B0B', CC = '#F3F3F1';
      const y0 = H > 1500 ? 180 * s : 0, fh = 70 * s;
      const year = +d.anio || 2026, mon = Math.min(12, Math.max(1, +d.mesNum || 12)) - 1;
      const first = (new Date(Date.UTC(year, mon, 1)).getUTCDay() + 6) % 7, days = new Date(Date.UTC(year, mon + 1, 0)).getUTCDate();
      const info = {}; for (const r of rowsOf(d.dias)) { const p = r.split('·').map((x) => x.trim()); const n = parseInt(p[0], 10); if (n >= 1 && n <= 31) { const ev = (p[p.length - 1] || '').toUpperCase() === 'E'; info[n] = { t: p[1] || '', sub: (ev ? p.slice(2, -1) : p.slice(2)).join(' · '), ev }; } }
      const cw = 129 * s, step = 138.5 * s, rh = 102 * s, ch = 92 * s, gx = 60 * s;
      const titleRow = first >= 4; const rowY = (r) => y0 + (titleRow ? 226 * s : 328 * s) + r * rh;
      const cells = [];
      for (let n = 1; n <= days; n++) {
        const idx = first + n - 1, col = idx % 7, row = Math.floor(idx / 7), x = gx + col * step, y = rowY(row), it = info[n];
        const bg = !it ? CO : it.ev ? CN : CC, fg = it && !it.ev ? CN : '#FFFFFF';
        cells.push(L('rect', { name: `Casilla ${n}`, x, y, w: cw, h: ch, fill: bg }));
        if (it) {
          cells.push(text({ name: `Día ${n} · título`, bind: `dias:${n}:t`, x: x + 9 * s, y: y + 9 * s, w: cw - 18 * s, h: 46 * s, text: it.t, size: Math.round(23 * s), lineHeight: 0.98, fit: true, uppercase: true, color: it.ev ? '#2BB061' : CN }));
          cells.push(text({ name: `Día ${n} · detalle`, x: x + 9 * s, y: y + 60 * s, w: cw - 48 * s, h: 26 * s, text: it.sub, font: 'Barlow Condensed', weight: 600, size: Math.round(14 * s), lineHeight: 1, fit: true, uppercase: true, color: fg }));
        }
        cells.push(text({ name: `Número ${n}`, x: x + cw - 46 * s, y: y + ch - 34 * s, w: 38 * s, h: 28 * s, text: String(n), size: Math.round(24 * s), align: 'right', color: it ? fg : 'rgba(0,0,0,.35)' }));
      }
      const wd = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
      return [page([
        logo(W / 2 - 71 * s, y0 + 22 * s, 142 * s, LOGO_W),
        ...wd.map((t, i) => text({ name: `Cabecera ${t}`, x: gx + i * step, y: y0 + 188 * s, w: cw, h: 28 * s, text: t, font: 'Barlow Condensed', weight: 600, size: Math.round(24 * s), align: 'center' })),
        text({ name: 'Mes', bind: 'mes', x: 60 * s, y: y0 + 232 * s, w: (titleRow ? first * step - 12 * s : W - 120 * s), h: 88 * s, text: d.mes, size: Math.round(108 * s), fit: true, uppercase: true, lineHeight: 0.9 }),
        ...cells,
        L('image', { name: 'Fotos de artistas', bind: 'img:fotos', x: 0, y: H * 0.56, w: W, h: H * 0.44 - fh, fit: 'contain', placeholder: false }),
        L('rect', { name: 'Pie', x: 0, y: H - fh, w: W, h: fh, fill: CC }),
        text({ name: 'Pie · texto', x: 60 * s, y: H - fh + 24 * s, w: W * 0.6, h: 26 * s, text: 'HEINEKEN 5MENTARIOS · ARUCAS', font: 'Barlow Condensed', weight: 900, size: Math.round(24 * s), letterSpacing: 4 * s, color: CN }),
        text({ name: 'Desliza', bind: 'pie', x: W * 0.55, y: H - fh + 24 * s, w: W * 0.45 - 60 * s, h: 26 * s, text: d.pie, font: 'Barlow Condensed', weight: 900, size: Math.round(24 * s), letterSpacing: 4 * s, color: CV, align: 'right' })
      ], CV)];
    }
  },
  // ---------------------------------------------------------------- Fin de semana · dos días (slide del carrusel)
  {
    key: 'finde', name: 'Fin de semana · dos días (slide del carrusel)', category: 'carruseles',
    basedOn: { kind: 'original', files: ['nov-06-20-y-21.psd', 'nov-05-13-y-14.psd', 'slide 07/09 (27–28 nov)', 'slide 02/07 (6–7 nov)'], note: 'Recreada a partir de las slides de noviembre: dos mitades (verde/clara o negra/verde), día espaciado, nombre en Anton, pastilla LIVE rellena y pastilla DJ de contorno.' },
    formats: ['post', 'story'], defaultFormat: 'post',
    fields: [
      { k: 'estilo', label: 'Estilo (A = verde arriba y claro abajo · B = negro arriba y verde abajo)', def: 'B' }, { k: 'contador', label: 'Contador (p. ej. 06/09)', def: '' },
      { k: 'dia1', label: 'Día 1 (p. ej. VIERNES 20.11)', def: 'VIERNES [DD.MM]' }, { k: 'artista1', label: 'Artista día 1', def: '[ARTISTA]' }, { k: 'live1', label: 'Pastilla 1 · día 1', def: 'LIVE · 22:30' }, { k: 'dj1', label: 'Pastilla 2 · día 1', def: 'DJ [NOMBRE] · 00:00' },
      { k: 'dia2', label: 'Día 2', def: 'SÁBADO [DD.MM]' }, { k: 'artista2', label: 'Artista día 2', def: '[ARTISTA]' }, { k: 'live2', label: 'Pastilla 1 · día 2', def: 'LIVE · 22:30' }, { k: 'dj2', label: 'Pastilla 2 · día 2', def: 'DJ [NOMBRE] · 00:00' }
    ],
    images: [{ k: 'foto1', label: 'Foto recortada · artista día 1' }, { k: 'foto2', label: 'Foto recortada · artista día 2' }],
    build({ W, H, d }) {
      const s = W / 1080, B = String(d.estilo || 'B').trim().toUpperCase() !== 'A', hh = H / 2;
      const P = B ? [{ bg: '#0B0B0B', day: '#2BB061', name: '#FFFFFF', f1: '#2BB061', t1: '#0B0B0B', o: '#FFFFFF' }, { bg: '#0B8A3E', day: '#0B0B0B', name: '#FFFFFF', f1: '#0B0B0B', t1: '#FFFFFF', o: '#0B0B0B' }]
        : [{ bg: '#0B8A3E', day: '#0B0B0B', name: '#0B0B0B', f1: '#0B0B0B', t1: '#FFFFFF', o: '#0B0B0B' }, { bg: '#F3F3F1', day: '#0B8A3E', name: '#0B0B0B', f1: '#0B8A3E', t1: '#FFFFFF', o: '#0B0B0B' }];
      const pw = (t) => Math.min(420 * s, (String(t || '').length * 17 + 70) * s);
      const half = (i) => {
        const c = P[i], y0 = i * hh, n = i + 1, a = d[`artista${n}`], base = y0 + (hh - 675 * s) / 2 + (i === 0 ? 300 : 70) * s;
        return [
          L('rect', { name: `Bloque día ${n}`, x: 0, y: y0, w: W, h: hh, fill: c.bg }),
          L('image', { name: `Foto día ${n}`, bind: `img:foto${n}`, x: W * 0.42, y: y0, w: W * 0.58, h: hh, fit: 'contain', placeholder: false }),
          text({ name: `Día ${n}`, bind: `dia${n}`, x: 64 * s, y: base, w: W * 0.6, h: 40 * s, text: d[`dia${n}`], font: 'Barlow Condensed', weight: 900, size: Math.round(36 * s), letterSpacing: 9 * s, color: c.day, uppercase: true }),
          text({ name: `Artista ${n}`, bind: `artista${n}`, x: 62 * s, y: base + 50 * s, w: W * 0.56, h: 190 * s, text: a, size: Math.round(150 * s), lineHeight: 0.92, fit: true, uppercase: true, color: c.name, valign: 'middle' }),
          L('pill', { name: `Pastilla LIVE ${n}`, bind: `live${n}`, x: 64 * s, y: base + 256 * s, w: pw(d[`live${n}`]), h: 62 * s, fill: c.f1, text: d[`live${n}`], font: 'Barlow Condensed', weight: 900, size: Math.round(30 * s), letterSpacing: 2 * s, color: c.t1 }),
          L('pill', { name: `Pastilla DJ ${n}`, bind: `dj${n}`, x: 64 * s + pw(d[`live${n}`]) + 16 * s, y: base + 256 * s, w: pw(d[`dj${n}`]), h: 62 * s, fill: 'rgba(0,0,0,0)', stroke: c.o, strokeWidth: 3 * s, text: d[`dj${n}`], font: 'Barlow Condensed', weight: 900, size: Math.round(30 * s), letterSpacing: 2 * s, color: c.o })
        ];
      };
      const ft = P[1].day;
      return [page([
        ...half(0), ...half(1),
        logo(69 * s, 54 * s, 103 * s, LOGO_W),
        ...(d.contador ? [text({ name: 'Contador', bind: 'contador', x: 200 * s, y: 92 * s, w: 140 * s, h: 28 * s, text: d.contador, font: 'Barlow Condensed', weight: 900, size: Math.round(26 * s), letterSpacing: 3 * s, color: P[0].day })] : []),
        text({ name: 'Pie · texto', x: 64 * s, y: H - 74 * s, w: W * 0.6, h: 26 * s, text: 'HEINEKEN 5MENTARIOS · ARUCAS', font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: B ? '#0B0B0B' : '#6B6B6B', opacity: B ? 0.75 : 1 }),
        text({ name: 'Desliza', x: W * 0.6, y: H - 74 * s, w: W * 0.4 - 70 * s, h: 26 * s, text: 'DESLIZA →', font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: B ? '#0B0B0B' : '#0B8A3E', align: 'right' })
      ], P[0].bg)];
    }
  },
  // ---------------------------------------------------------------- Portada carrusel de fotos
  {
    key: 'fotos-portada', name: 'Portada «Así fue…» (carrusel de fotos)', category: 'carruseles',
    basedOn: { kind: 'guia', files: [], note: 'Toque manuscrito en Permanent Marker («Así fue…») sobre foto de la noche, como indica la guía.' },
    formats: ['post', 'square', 'story'], defaultFormat: 'post',
    fields: [{ k: 'titulo', label: 'Texto manuscrito', def: 'Así fue…' }, { k: 'sub', label: 'Subtítulo', def: '[EL FINDE] EN 5MENTARIOS' }, { k: 'cta', label: 'Llamada', def: 'BÚSCATE EN LAS FOTOS Y ETIQUÉTATE' }],
    images: [{ k: 'foto', label: 'Foto de la noche' }],
    build({ W, H, d }) {
      const s = W / 1080;
      return [page([
        L('image', { name: 'Foto', bind: 'img:foto', x: 0, y: 0, w: W, h: H, placeholder: 'FOTO DE LA NOCHE' }),
        L('rect', { name: 'Degradado', x: 0, y: H * 0.45, w: W, h: H * 0.55, gradient: { angle: 90, stops: [[0, 'rgba(5,8,6,0)'], [1, 'rgba(5,8,6,.92)']] } }),
        logo(36 * s, 30 * s, 105 * s),
        text({ name: 'Manuscrito', bind: 'titulo', x: 50 * s, y: H * 0.66, w: W - 100 * s, h: 150 * s, text: d.titulo, font: 'Permanent Marker', size: Math.round(120 * s), color: C.neon, fit: true }),
        text({ name: 'Subtítulo', bind: 'sub', x: 50 * s, y: H * 0.66 + 150 * s, w: W - 100 * s, h: 90 * s, text: d.sub, size: Math.round(70 * s), fit: true, uppercase: true }),
        text({ name: 'Llamada', bind: 'cta', x: 50 * s, y: H * 0.66 + 250 * s, w: W - 100 * s, h: 40 * s, text: d.cta, font: 'Barlow Condensed', weight: 600, size: Math.round(28 * s), letterSpacing: 5 * s, color: C.verde }),
        ...footer(W, H, { swipe: true })
      ])];
    }
  },
  // ---------------------------------------------------------------- Menús de Navidad
  {
    key: 'navidad-menus', name: 'Menús de Navidad (carrusel)', category: 'promociones',
    basedOn: { kind: 'original', files: ['Estilo de la slide «Champions en noviembre» (Sin título-1.psd)'], note: 'Contenido de los menús de la guía con el estilo claro de los PSD. Precios y bebida [POR CONFIRMAR].' },
    formats: ['post', 'square'], defaultFormat: 'post', multiPage: true,
    fields: [
      { k: 'portada', label: 'Título portada', def: 'MENÚS DE NAVIDAD' },
      { k: 'm1', label: 'Menú 1 (título · precio)', def: 'MENÚ 1 · 25 €/PERSONA' }, { k: 'm1p', label: 'Menú 1 platos', multiline: true, def: 'Papas arrugadas con mojo rojo\nBerenjenas crujientes con miel de palma\nCroquetas de queso roquefort con guayaba\nSalteado de pollo con verduras\nTacos de pescado con mojo verde' },
      { k: 'm2', label: 'Menú 2', def: 'MENÚ 2 · 30 €/PERSONA' }, { k: 'm2p', label: 'Menú 2 platos', multiline: true, def: 'Tabla de quesos canarios\nSurtido ibérico\nLangostinos crujientes con salsa agripicante\nVolovanes variados\nSolomillo de cerdo a la pimienta' },
      { k: 'm3', label: 'Menú 3', def: 'MENÚ 3 · 38 €/PERSONA' }, { k: 'm3p', label: 'Menú 3 platos', multiline: true, def: 'Jamón ibérico de bellota\nMontadito de arroz frito con atún fresco\nEnsalada de salmón con canónigos\nMerluza en salsa verde con papas panaderas\nCarrilleras de cerdo con parmentier' },
      { k: 'reserva', label: 'Reserva', def: 'RESERVAS 627 304 115' }
    ],
    images: [{ k: 'foto', label: 'Foto de portada (opcional)' }],
    build({ W, H, d }) {
      const s = W / 1080;
      const N = '#0B0B0B', V = '#0B8A3E', CL = '#F3F3F1';
      const foot = (cta) => [text({ name: 'Pie · texto', x: 52 * s, y: H - 75 * s, w: W * 0.6, h: 26 * s, text: 'HEINEKEN 5MENTARIOS · ARUCAS', font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: '#6E6E6A' }),
        text({ name: 'Llamada', x: W * 0.55, y: H - 75 * s, w: W * 0.45 - 80 * s, h: 26 * s, text: cta, font: 'Barlow Condensed', weight: 900, size: Math.round(22 * s), letterSpacing: 4 * s, color: V, align: 'right' })];
      const words = String(d.portada || '').trim().split(/\s+/), half = Math.ceil(words.length / 2);
      const cover = page([
        L('image', { name: 'Foto', bind: 'img:foto', x: 0, y: H * 0.55, w: W, h: H * 0.38, fit: 'contain', focusY: 1, placeholder: false }),
        logo(56 * s, 54 * s, 103 * s, LOGO_B),
        text({ name: 'Contador', x: W - 230 * s, y: 92 * s, w: 150 * s, h: 28 * s, text: '01/04', font: 'Barlow Condensed', weight: 900, size: Math.round(26 * s), letterSpacing: 3 * s, color: V, align: 'right' }),
        L('pill', { name: 'Pastilla', x: 51 * s, y: 200 * s, w: 470 * s, h: 58 * s, fill: N, text: 'CENAS DE GRUPO', font: 'Barlow Condensed', weight: 900, size: Math.round(27 * s), letterSpacing: 4 * s, color: '#FFFFFF' }),
        text({ name: 'Titular negro', bind: 'portada', x: 50 * s, y: 287 * s, w: W - 100 * s, h: 152 * s, text: words.slice(0, half).join(' '), size: Math.round(165 * s), lineHeight: 0.92, fit: true, uppercase: true, color: N }),
        text({ name: 'Titular verde', x: 50 * s, y: 437 * s, w: W - 100 * s, h: 152 * s, text: words.slice(half).join(' '), size: Math.round(165 * s), lineHeight: 0.92, fit: true, uppercase: true, color: V }),
        ...foot('DESLIZA →')
      ], CL);
      const menu = (n) => { const [tt, pr] = String(d[`m${n}`] || '').split('·').map((x) => x.trim()); const platos = rowsOf(d[`m${n}p`]).slice(0, 9); const st = Math.min(78 * s, (H * 0.5) / Math.max(platos.length, 1)); return page([
        logo(56 * s, 54 * s, 103 * s, LOGO_B),
        text({ name: 'Contador', x: W - 230 * s, y: 92 * s, w: 150 * s, h: 28 * s, text: `0${n + 1}/04`, font: 'Barlow Condensed', weight: 900, size: Math.round(26 * s), letterSpacing: 3 * s, color: V, align: 'right' }),
        L('pill', { name: 'Pastilla', x: 51 * s, y: 190 * s, w: 260 * s, h: 58 * s, fill: N, text: tt || `MENÚ ${n}`, font: 'Barlow Condensed', weight: 900, size: Math.round(27 * s), letterSpacing: 4 * s, color: '#FFFFFF' }),
        text({ name: 'Precio', bind: `m${n}`, x: 50 * s, y: 262 * s, w: W - 100 * s, h: 150 * s, text: pr || '', size: Math.round(150 * s), lineHeight: 0.92, fit: true, uppercase: true, color: V }),
        ...platos.flatMap((pl, i) => [L('line', { name: `Línea ${i + 1}`, x: 51 * s, y: 450 * s + i * st, w: W - 128 * s, h: 4, width: 2 * s, color: N }),
          text({ name: `Plato ${i + 1}`, x: 52 * s, y: 450 * s + i * st + st * 0.2, w: W - 130 * s, h: st * 0.66, text: pl, size: Math.round(Math.min(46 * s, st * 0.56)), color: N, uppercase: true, fit: true })]),
        text({ name: 'Reserva', bind: 'reserva', x: 52 * s, y: H - 126 * s, w: W - 104 * s, h: 34 * s, text: d.reserva, font: 'Barlow Condensed', weight: 900, size: Math.round(28 * s), letterSpacing: 3 * s, color: N }),
        ...foot(n < 3 ? 'DESLIZA →' : '¡TE ESPERAMOS!')
      ], CL); };
      return [cover, menu(1), menu(2), menu(3)];
    }
  },
  // ---------------------------------------------------------------- Anuncio (cartel de noche sin foto)
  {
    key: 'anuncio', name: 'Anuncio · cartel de noche (sin foto)', category: 'carteles',
    basedOn: { kind: 'guia', files: [], note: 'Estilo «cartel de noche» de la guía (fondo negro, brillo verde, titular Anton con halo, fecha manuscrita en verde neón, pastilla verde). Para avisos que no necesitan foto.' },
    formats: ['post', 'story', 'square', 'landscape'], defaultFormat: 'post',
    fields: [
      { k: 'kicker', label: 'Antetítulo', def: 'HEINEKEN 5MENTARIOS' }, { k: 'titulo', label: 'Titular', def: 'TITULAR' },
      { k: 'fecha', label: 'Fecha (manuscrita)', def: '' }, { k: 'cuerpo', label: 'Líneas (una por línea)', def: '', multiline: true },
      { k: 'pill', label: 'Pastilla', def: '' }, { k: 'cta', label: 'Llamada final', def: 'RESERVAS 627 304 115' }, { k: 'etiqueta', label: 'Etiqueta girada (opcional)', def: '' }
    ],
    images: [{ k: 'fondo', label: 'Foto de fondo (opcional)' }],
    build({ W, H, d }) {
      const s = Math.min(W, H) / 1080, tall = H / W > 1.5, cx = 60 * s;
      const lines = rowsOf(d.cuerpo);
      const lh = (tall ? 74 : 66) * s, bs = Math.round((tall ? 56 : 50) * s);
      const titleH = H * (tall ? 0.2 : 0.25);
      const blockH = 70 * s + titleH + (d.fecha ? 100 * s : 30 * s) + lines.length * lh + (d.pill ? 110 * s : 0);
      const top = tall ? 430 * s : 150 * s, bottom = H * 0.84;
      const titleY = Math.max(top + 70 * s, top + (bottom - top - blockH) / 2 + 70 * s);
      let y = titleY + titleH + (d.fecha ? 100 * s : 30 * s);
      const body = lines.map((t, i) => text({ name: `Línea ${i + 1}`, bind: `cuerpo:${i}`, x: cx, y: y + i * lh, w: W - 2 * cx, h: lh * 0.9, text: t, font: 'Barlow Condensed', weight: 900, size: bs, letterSpacing: 3 * s, color: C.blanco, align: 'center', fit: true }));
      y += lines.length * lh + 30 * s;
      return [page([
        L('image', { name: 'Foto de fondo', bind: 'img:fondo', x: 0, y: 0, w: W, h: H, brightness: 0.35, placeholder: false }),
        L('grain', { name: 'Textura', x: 0, y: 0, w: W, h: H, amount: 0.35 }),
        L('glow', { name: 'Brillo verde', x: -W * 0.15, y: titleY - H * 0.1, w: W * 1.3, h: titleH + H * 0.25, color: C.verde, strength: 0.4 }),
        logo(tall ? W / 2 - 60 * s : 36 * s, tall ? 250 * s : 30 * s, tall ? 120 * s : 110 * s),
        ...(d.etiqueta ? [L('pill', { name: 'Etiqueta', bind: 'etiqueta', x: W - 330 * s, y: tall ? 400 * s : 70 * s, w: 260 * s, h: 66 * s, rotation: -6, fill: '#000', radius: 4 * s, text: d.etiqueta, font: 'Anton', size: Math.round(34 * s), color: '#FFF' })] : []),
        text({ name: 'Antetítulo', bind: 'kicker', x: cx, y: titleY - 70 * s, w: W - 2 * cx, h: 50 * s, text: d.kicker, font: 'Barlow Condensed', weight: 600, size: Math.round(34 * s), letterSpacing: 10 * s, color: C.verde, align: 'center', fit: true }),
        text({ name: 'Titular', bind: 'titulo', x: cx, y: titleY, w: W - 2 * cx, h: titleH, text: d.titulo, size: Math.round(170 * s), align: 'center', valign: 'middle', fit: true, glowColor: C.verde, glowBlur: 40 * s, uppercase: true, lineHeight: 0.98 }),
        ...(d.fecha ? [text({ name: 'Fecha manuscrita', bind: 'fecha', x: cx, y: titleY + titleH + 14 * s, w: W - 2 * cx, h: 76 * s, text: d.fecha, font: 'Permanent Marker', size: Math.round(58 * s), color: C.neon, align: 'center', fit: true })] : []),
        ...body,
        ...(d.pill ? [L('pill', { name: 'Pastilla', bind: 'pill', x: W / 2 - 300 * s, y, w: 600 * s, h: 76 * s, fill: C.verde, text: d.pill, font: 'Anton', size: Math.round(38 * s), color: '#000' })] : []),
        text({ name: 'Llamada final', bind: 'cta', x: cx, y: H * (tall ? 0.86 : 0.86), w: W - 2 * cx, h: 44 * s, text: d.cta, font: 'Barlow Condensed', weight: 600, size: Math.round(30 * s), letterSpacing: 6 * s, color: C.blanco, align: 'center', fit: true }),
        ...(tall ? [] : footer(W, H))
      ], C.negroV)];
    }
  },
  // ---------------------------------------------------------------- Felicitación / marca
  {
    key: 'marca', name: 'Pieza de marca (sello + mensaje)', category: 'marca',
    basedOn: { kind: 'guia', files: ['5mentarios-sello.svg', '5mentarios-negro.svg'], note: 'Sello oficial sobre negro con brillo verde (logo grande y centrado, como en los cierres).' },
    formats: ['post', 'story', 'square', 'landscape'], defaultFormat: 'post',
    fields: [{ k: 'titulo', label: 'Mensaje', def: 'FELIZ NAVIDAD' }, { k: 'sub', label: 'Subtítulo', def: 'DESDE 2002 · EL PUNTO DE ENCUENTRO DE ARUCAS' }],
    images: [],
    build({ W, H, d }) {
      const s = Math.min(W, H) / 1080;
      return [page([
        L('glow', { name: 'Brillo', x: W / 2 - 500 * s, y: H * 0.18, w: 1000 * s, h: 1000 * s, color: C.verde, strength: 0.45 }),
        logo(W / 2 - 260 * s, H * 0.18, 520 * s),
        text({ name: 'Mensaje', bind: 'titulo', x: 60 * s, y: H * 0.18 + 520 * s, w: W - 120 * s, h: 160 * s, text: d.titulo, size: Math.round(130 * s), align: 'center', fit: true, uppercase: true }),
        text({ name: 'Subtítulo', bind: 'sub', x: 60 * s, y: H * 0.18 + 690 * s, w: W - 120 * s, h: 50 * s, text: d.sub, font: 'Barlow Condensed', weight: 600, size: Math.round(30 * s), letterSpacing: 6 * s, color: C.verde, align: 'center', fit: true })
      ], C.negroV)];
    }
  },
  // ---------------------------------------------------------------- Desde cero
  {
    key: 'blanco', name: 'Desde cero (fondo de marca + logo)', category: 'posts',
    basedOn: { kind: 'guia', files: [], note: 'Lienzo vacío con los colores y el logo de la marca.' },
    formats: ['post', 'story', 'square', 'landscape'], defaultFormat: 'post', fields: [], images: [],
    build({ W, H }) { const s = W / 1080; return [page([logo(36 * s, 30 * s, 110 * s)], C.negro)]; }
  }
];

export const CATEGORIES = [
  ['carteles', 'Carteles promocionales'], ['futbol', 'Champions League y fútbol'], ['stories', 'Stories'], ['posts', 'Publicaciones de Instagram'],
  ['carruseles', 'Carruseles'], ['eventos', 'Eventos'], ['promociones', 'Promociones'], ['marca', 'Diseños de marca'], ['video', 'Vídeos y reels']
];
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES);
export const templateByKey = (k) => TEMPLATES.find((t) => t.key === k);

export function defaults(t) { return Object.fromEntries((t.fields || []).map((f) => [f.k, f.def ?? ''])); }

// Construye un documento a partir de una plantilla, unos datos y unas imágenes {clave: ref}
export function buildDoc(t, format, data = {}, images = {}) {
  const fm = { post: [1080, 1350], story: [1080, 1920], square: [1080, 1080], landscape: [1920, 1080] }[format] || [1080, 1350];
  const d = { ...defaults(t), ...data };
  const pages = t.build({ W: fm[0], H: fm[1], d });
  for (const p of pages) for (const l of p.layers) if (l.bind && l.bind.startsWith('img:') && images[l.bind.slice(4)]) l.ref = images[l.bind.slice(4)];
  return { v: 1, width: fm[0], height: fm[1], template: t.key, format, data: d, images, pages };
}
