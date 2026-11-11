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
    basedOn: { kind: 'guia', files: ['story-hoy-sabado-07.mp4 (no disponible aquí)'], note: 'Versión estática (fotograma resumen) de la story animada descrita en la guía. La animación se hace en el módulo de vídeo.' },
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
        ...rows.flatMap((r, i) => { const m = r.match(/^(\d{1,2}[:.]\d{2})\s+(.*)$/); const y = 880 * s + i * 170 * s; return [
          text({ name: `Hora ${i + 1}`, bind: `filas:${i}:hora`, x: 90 * s, y, w: 300 * s, h: 130 * s, text: m ? m[1] : '', size: Math.round(110 * s), color: 'transparent', strokeColor: C.verde, strokeWidth: 4 * s }),
          text({ name: `Artista ${i + 1}`, bind: `filas:${i}:nombre`, x: 420 * s, y: y + 20 * s, w: W - 510 * s, h: 100 * s, text: m ? m[2] : r, size: Math.round(70 * s), fit: true, uppercase: true })]; }),
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
    basedOn: { kind: 'guia', files: ['NAV / NAVB / NAVC (lienzo de diseño, no disponible aquí)'], note: 'Contenido de los menús de la guía. Precios y bebida [POR CONFIRMAR].' },
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
      const cover = page([
        L('image', { name: 'Foto', bind: 'img:foto', x: 0, y: 0, w: W, h: H, brightness: 0.4, placeholder: false }),
        L('glow', { name: 'Brillo', x: 0, y: H * 0.2, w: W, h: H * 0.5, color: C.verde, strength: 0.4 }),
        logo(W / 2 - 80 * s, 80 * s, 160 * s),
        text({ name: 'Título', bind: 'portada', x: 60 * s, y: H * 0.38, w: W - 120 * s, h: 320 * s, text: d.portada, size: Math.round(150 * s), align: 'center', fit: true, glowColor: C.verde, glowBlur: 40 * s }),
        text({ name: 'Para grupos', x: 60 * s, y: H * 0.65, w: W - 120 * s, h: 50 * s, text: 'CENAS DE GRUPO · HEINEKEN 5MENTARIOS', font: 'Barlow Condensed', weight: 600, size: Math.round(32 * s), letterSpacing: 6 * s, color: C.verde, align: 'center', fit: true }),
        ...footer(W, H, { swipe: true })
      ]);
      const menu = (n) => page([
        logo(36 * s, 30 * s, 100 * s),
        text({ name: 'Menú', bind: `m${n}`, x: 60 * s, y: H * 0.15, w: W - 120 * s, h: 130 * s, text: d[`m${n}`], size: Math.round(100 * s), color: C.verde, fit: true }),
        L('line', { name: 'Línea', x: 60 * s, y: H * 0.15 + 140 * s, w: W - 120 * s, h: 4, width: 2, color: 'rgba(242,239,232,.3)' }),
        text({ name: 'Platos', bind: `m${n}p`, x: 60 * s, y: H * 0.15 + 175 * s, w: W - 120 * s, h: H * 0.5, text: d[`m${n}p`], font: 'Barlow Condensed', weight: 600, size: Math.round(52 * s), lineHeight: 1.35, color: C.blanco, fit: true }),
        text({ name: 'Reserva', bind: 'reserva', x: 60 * s, y: H * 0.86, w: W - 120 * s, h: 40 * s, text: d.reserva, font: 'Barlow Condensed', weight: 900, size: Math.round(34 * s), letterSpacing: 6 * s, color: C.verde }),
        ...footer(W, H, { swipe: n < 3, counter: `${n + 1}/4` })
      ]);
      return [cover, menu(1), menu(2), menu(3)];
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
