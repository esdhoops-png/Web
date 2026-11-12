// STORIES ANIMADAS del plan (estilo del vídeo real «story-esta-semana-12-14-nov.mp4»).
// Cada vídeo se renderiza con app/studio/story-motion.js y se publica junto a la app en media/stories/<archivo>.mp4.
// Al ejecutar el plan, la app lo descarga de ahí, lo guarda en Storage como diseño (vídeo) de la publicación y lo deja
// «Pendiente de aprobación». Solo programación CONFIRMADA. El sábado 21 nov no lleva vídeo hasta que se confirme quién toca.
import { BRAND } from '../lib/brand.js';
const WA = `WHATSAPP ${BRAND.whatsapp}`;
const iso = (d, t) => `2026-${d}T${t}:00Z`;
const CTA = { t1: 'RESERVA', t2: 'TU MESA', pill: WA };
const noche = (dia, artista, dj) => ({ dia, kicker: 'MÚSICA EN DIRECTO + DJ', rows: [['22:30', artista], ['00:00', dj]] });
const hoy = (rango, dia) => ({ mode: 'hoy', rango, intro: { t1: 'HOY', sub: 'EN 5MENTARIOS', tags: dia }, cta: CTA });

// Publicaciones nuevas: story animada «Esta semana» (miércoles 13:00, como la del 11 nov)
export const VIDEO_POSTS = [
  ['p3-1125-semana', '11-25', '26–29 nov'], ['p3-1202-semana', '12-02', '3–7 dic'], ['p3-1209-semana', '12-09', '11–12 dic'],
  ['p3-1216-semana', '12-16', '18–19 dic'], ['p3-1222-semana', '12-22', '24–26 dic']
].map(([key, d, label]) => ({ key, kind: 'story', title: `Story animada · Esta semana en 5mentarios (${label})`, starts_at: iso(d, '13:00'), format: 'Story animada 9:16',
  platforms: ['instagram', 'whatsapp'], status: 'in_design', objective: 'Programación de la semana en una story animada.',
  material: 'Vídeo generado en el Estudio con el estilo de la story animada del 11 nov (rayos verdes, escena por día, «Reserva tu mesa», logo).',
  copy: 'Story animada con la programación + sticker de enlace a WhatsApp.', cta: `Reservas ${WA}`, hashtags: '', info: 'C' }));

export const STORY_VIDEOS = [
  // ---------- «Esta semana» ----------
  { key: 'p3-1125-semana', file: 'semana-26-29-nov.mp4', spec: { mode: 'semana', rango: '26 – 29 NOV', intro: { t1: 'ESTA', t2: 'SEMANA', sub: 'EN 5MENTARIOS', tags: 'HUMOR · DIRECTO · TARDEO' }, cta: CTA, days: [
    { dia: 'JUE 26', kicker: 'MONÓLOGOS · KIKE PÉREZ', big: 'SOLD OUT', rows: [] },
    noche('VIE 27', 'ALBERTO DÉNIZ', 'DJ AKE'), noche('SÁB 28', 'SAVIA NUEVA', 'DJ ASPED'),
    { dia: 'DOM 29', band: 'TARDEO PRE NAVIDAD', title: '4º ANIVERSARIO', desde: 'DESDE LAS 17:00', rows: [['17:00', 'CREMITA DE COCO'], ['19:00', 'YET GARBEY']] }] } },
  { key: 'p3-1202-semana', file: 'semana-3-7-dic.mp4', spec: { mode: 'semana', rango: '3 – 7 DIC', intro: { t1: 'ESTA', t2: 'SEMANA', sub: 'EN 5MENTARIOS', tags: 'HUMOR · DIRECTO · PUENTE' }, cta: CTA, days: [
    { dia: 'JUE 3', kicker: 'MONÓLOGOS · NUEVA FECHA', big: 'KIKE PÉREZ', rows: [] },
    noche('VIE 4', 'APOLO', 'DJ RUVEN'), noche('SÁB 5', 'SON ALDEA', 'DJ ASPED'), noche('LUN 7', 'WILLY FLORES', 'DJ ASPED')] } },
  { key: 'p3-1209-semana', file: 'finde-11-12-dic.mp4', spec: { mode: 'semana', rango: '11 – 12 DIC', intro: { t1: 'ESTE', t2: 'FINDE', sub: 'EN 5MENTARIOS', tags: 'MÚSICA EN DIRECTO + DJ' }, cta: CTA, days: [
    noche('VIE 11', 'YET GARBEY', 'DJ AKE'), noche('SÁB 12', 'SON KARIBE', 'DJ ASPED')] } },
  { key: 'p3-1216-semana', file: 'finde-18-19-dic.mp4', spec: { mode: 'semana', rango: '18 – 19 DIC', intro: { t1: 'ESTE', t2: 'FINDE', sub: 'EN 5MENTARIOS', tags: 'MÚSICA EN DIRECTO + DJ' }, cta: CTA, days: [
    noche('VIE 18', 'PEDRO AFONSO', 'DJ AKE'), noche('SÁB 19', 'CAFÉ DE LUNA', 'DJ ASPED')] } },
  { key: 'p3-1222-semana', file: 'navidad-24-26-dic.mp4', spec: { mode: 'semana', rango: '24 – 26 DIC', intro: { t1: 'ESTA', t2: 'NAVIDAD', sub: 'EN 5MENTARIOS', tags: 'TARDEO · DJ · DIRECTO' }, cta: CTA, days: [
    { dia: 'JUE 24', band: 'TARDEO DE NAVIDAD', desde: 'AL AIRE LIBRE · DESDE LAS 16:30', rows: [['16:30', 'SON ALDEA'], ['18:30', 'KILIAN VIERA'], ['00:00', 'DJ AKE · EXTERIOR'], ['00:00', 'DJ RUVEN · INTERIOR']] },
    { dia: 'VIE 25', kicker: 'DESDE LAS 23:00', rows: [['23:00', 'DJ ASPED']] }, noche('SÁB 26', 'SAVIA NUEVA', 'DJ RUVEN')] } },
  // ---------- «Hoy» (una por noche, en las publicaciones de stories del día) ----------
  ...[
    ['p2-1120-stories', 'hoy-20-nov.mp4', '20 NOV', 'VIERNES 20 DE NOVIEMBRE', noche('VIE 20', 'APOLO', 'DJ ASPED')],
    ['p2-1127-stories', 'hoy-27-nov.mp4', '27 NOV', 'VIERNES 27 DE NOVIEMBRE', noche('VIE 27', 'ALBERTO DÉNIZ', 'DJ AKE')],
    ['p2-1128-stories', 'hoy-28-nov.mp4', '28 NOV', 'SÁBADO 28 DE NOVIEMBRE', noche('SÁB 28', 'SAVIA NUEVA', 'DJ ASPED')],
    ['p3-1129-hoy', 'hoy-29-nov.mp4', '29 NOV', 'DOMINGO 29 DE NOVIEMBRE', { dia: 'DOM 29', band: 'TARDEO PRE NAVIDAD', title: '4º ANIVERSARIO', desde: 'DESDE LAS 17:00', rows: [['17:00', 'CREMITA DE COCO'], ['19:00', 'YET GARBEY']] }],
    ['p2-1204-stories', 'hoy-4-dic.mp4', '4 DIC', 'VIERNES 4 DE DICIEMBRE', noche('VIE 4', 'APOLO', 'DJ RUVEN')],
    ['p2-1205-stories', 'hoy-5-dic.mp4', '5 DIC', 'SÁBADO 5 DE DICIEMBRE', noche('SÁB 5', 'SON ALDEA', 'DJ ASPED')],
    ['p3-1207-hoy', 'hoy-7-dic.mp4', '7 DIC', 'LUNES 7 DE DICIEMBRE', noche('LUN 7', 'WILLY FLORES', 'DJ ASPED')],
    ['p2-1211-stories', 'hoy-11-dic.mp4', '11 DIC', 'VIERNES 11 DE DICIEMBRE', noche('VIE 11', 'YET GARBEY', 'DJ AKE')],
    ['p2-1212-stories', 'hoy-12-dic.mp4', '12 DIC', 'SÁBADO 12 DE DICIEMBRE', noche('SÁB 12', 'SON KARIBE', 'DJ ASPED')],
    ['p2-1218-stories', 'hoy-18-dic.mp4', '18 DIC', 'VIERNES 18 DE DICIEMBRE', noche('VIE 18', 'PEDRO AFONSO', 'DJ AKE')],
    ['p2-1219-stories', 'hoy-19-dic.mp4', '19 DIC', 'SÁBADO 19 DE DICIEMBRE', noche('SÁB 19', 'CAFÉ DE LUNA', 'DJ ASPED')],
    ['p3-1224-hoy', 'hoy-24-dic.mp4', '24 DIC', 'NOCHEBUENA', { dia: 'JUE 24', band: 'TARDEO DE NAVIDAD', desde: 'AL AIRE LIBRE · DESDE LAS 16:30', rows: [['16:30', 'SON ALDEA'], ['18:30', 'KILIAN VIERA'], ['00:00', 'DJ AKE · EXTERIOR'], ['00:00', 'DJ RUVEN · INTERIOR']] }],
    ['p3-1225-hoy', 'hoy-25-dic.mp4', '25 DIC', 'NAVIDAD', { dia: 'VIE 25', kicker: 'DESDE LAS 23:00', rows: [['23:00', 'DJ ASPED']] }],
    ['p2-1226-stories', 'hoy-26-dic.mp4', '26 DIC', 'SÁBADO 26 DE DICIEMBRE', noche('SÁB 26', 'SAVIA NUEVA', 'DJ RUVEN')],
    ['p2-1231-stories', 'hoy-31-dic.mp4', '31 DIC', 'NOCHEVIEJA', { dia: 'JUE 31', band: 'TARDEO DE FIN DE AÑO', desde: 'AL AIRE LIBRE · DESDE LAS 16:30', rows: [['16:30', 'APOLO'], ['18:30', 'CREMITA DE COCO'], ['00:00', 'DJ AKE · EXTERIOR'], ['00:00', 'DJ ASPED · INTERIOR']] }]
  ].map(([key, file, rango, dia, day]) => ({ key, file, spec: { ...hoy(rango, dia), days: [day] } }))
];
export const PENDING_VIDEOS = [{ key: 'p2-1121-stories', why: 'Sábado 21 nov: falta confirmar si toca Son Aldea, Son Diferente o «Directo».' }];
