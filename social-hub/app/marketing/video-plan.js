// STORIES ANIMADAS del plan (estilo del vídeo real «story-esta-semana-12-14-nov.mp4»).
// Cada vídeo se renderiza con app/studio/story-motion.js y se publica junto a la app en media/stories/<archivo>.mp4.
// Al ejecutar el plan, la app lo descarga de ahí, lo guarda en Storage como diseño (vídeo) de la publicación y lo deja
// «Pendiente de aprobación». Solo programación CONFIRMADA. El sábado 21 nov no lleva vídeo hasta que se confirme quién toca.
import { BRAND } from '../lib/brand.js';
const WA = `WHATSAPP ${BRAND.whatsapp}`;
const iso = (d, t) => `2026-${d}T${t}:00Z`;
const CTA = { t1: 'RESERVA', t2: 'TU MESA', pill: WA };
const noche = (dia, artista, dj) => ({ dia, kicker: 'MÚSICA EN DIRECTO + DJ', rows: [['22:30', artista], ['00:00', dj]] });
// Fotos: recortes sin fondo sacados de los PSD de noviembre (solo artistas identificados en el propio PSD). Sin foto → solo nombre.
const PHOTOS = { 'APOLO': 'apolo.png', 'ALBERTO DÉNIZ': 'alberto-deniz.png', 'CREMITA DE COCO': 'cremita-de-coco.png', 'KILIAN VIERA': 'kilian-viera.png',
  'SON ALDEA': 'son-aldea.png', 'PEDRO AFONSO': 'pedro-afonso.png', 'KIKE PÉREZ': 'kike-perez.png', 'SON DIFERENTE': 'son-diferente.png' };
const A = (hora, name, kicker = 'EN DIRECTO') => ({ hora, name, kicker, photo: PHOTOS[name] || null });
const DJ = (hora, name, kicker = 'HASTA EL CIERRE') => ({ hora, name, kicker, photo: PHOTOS[name] || null });

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
  // ---------- «Hoy» (estilo de story-hoy-sabado-31.mp4: una escena por actuación) ----------
  ...[
    ['p2-1120-stories', 'hoy-20-nov.mp4', 'VIERNES 20', 'VIERNES', [A('22:30', 'APOLO'), DJ('00:00', 'DJ ASPED')]],
    ['p2-1127-stories', 'hoy-27-nov.mp4', 'VIERNES 27', 'VIERNES', [A('22:30', 'ALBERTO DÉNIZ'), DJ('00:00', 'DJ AKE')]],
    ['p2-1128-stories', 'hoy-28-nov.mp4', 'SÁBADO 28', 'SÁBADO', [A('22:30', 'SAVIA NUEVA'), DJ('00:00', 'DJ ASPED')]],
    ['p3-1129-hoy', 'hoy-29-nov.mp4', 'DOMINGO 29', 'DOMINGO', [A('17:00', 'CREMITA DE COCO', 'ABRE'), A('19:00', 'YET GARBEY')], { tags: 'TARDEO PRE NAVIDAD · 4º ANIVERSARIO' }],
    ['p2-1204-stories', 'hoy-4-dic.mp4', 'VIERNES 4', 'VIERNES', [A('22:30', 'APOLO'), DJ('00:00', 'DJ RUVEN')]],
    ['p2-1205-stories', 'hoy-5-dic.mp4', 'SÁBADO 5', 'SÁBADO', [A('22:30', 'SON ALDEA'), DJ('00:00', 'DJ ASPED')]],
    ['p3-1207-hoy', 'hoy-7-dic.mp4', 'LUNES 7', 'LUNES', [A('22:30', 'WILLY FLORES'), DJ('00:00', 'DJ ASPED')], { tags: 'VÍSPERA DE FESTIVO · DESDE LAS 22:30' }],
    ['p2-1211-stories', 'hoy-11-dic.mp4', 'VIERNES 11', 'VIERNES', [A('22:30', 'YET GARBEY'), DJ('00:00', 'DJ AKE')]],
    ['p2-1212-stories', 'hoy-12-dic.mp4', 'SÁBADO 12', 'SÁBADO', [A('22:30', 'SON KARIBE'), DJ('00:00', 'DJ ASPED')]],
    ['p2-1218-stories', 'hoy-18-dic.mp4', 'VIERNES 18', 'VIERNES', [A('22:30', 'PEDRO AFONSO'), DJ('00:00', 'DJ AKE')]],
    ['p2-1219-stories', 'hoy-19-dic.mp4', 'SÁBADO 19', 'SÁBADO', [A('22:30', 'CAFÉ DE LUNA'), DJ('00:00', 'DJ ASPED')]],
    ['p3-1224-hoy', 'hoy-24-dic.mp4', 'NOCHEBUENA', 'NOCHEBUENA', [A('16:30', 'SON ALDEA', 'ABRE'), A('18:30', 'KILIAN VIERA'), DJ('00:00', 'DJ AKE', 'EXTERIOR · HASTA LAS 04:00'), DJ('00:00', 'DJ RUVEN', 'INTERIOR · HASTA LAS 06:00')], { tags: 'TARDEO DE NAVIDAD · AL AIRE LIBRE' }],
    ['p3-1225-hoy', 'hoy-25-dic.mp4', 'NAVIDAD', 'NAVIDAD', [DJ('23:00', 'DJ ASPED', 'DESDE LAS 23:00')], { tags: 'NOCHE DE NAVIDAD · DESDE LAS 23:00' }],
    ['p2-1226-stories', 'hoy-26-dic.mp4', 'SÁBADO 26', 'SÁBADO', [A('22:30', 'SAVIA NUEVA'), DJ('00:00', 'DJ RUVEN')]],
    ['p2-1231-stories', 'hoy-31-dic.mp4', 'NOCHEVIEJA', 'NOCHEVIEJA', [A('16:30', 'APOLO', 'ABRE'), A('18:30', 'CREMITA DE COCO'), DJ('00:00', 'DJ AKE', 'EXTERIOR · HASTA LAS 04:00'), DJ('00:00', 'DJ ASPED', 'INTERIOR · HASTA LAS 06:00')], { tags: 'TARDEO DE FIN DE AÑO · AL AIRE LIBRE' }]
  ].map(([key, file, rango, dia, acts, o = {}]) => ({ key, file, spec: { mode: 'hoy', rango, intro: { sub: 'EN 5MENTARIOS', tags: o.tags || `${acts.length === 1 ? '1 DIRECTO' : acts.length + ' DIRECTOS'} · DESDE LAS ${acts[0].hora}`.replace('1 DIRECTO', 'DJ') },
    acts, resumen: { t1: ['NOCHEBUENA', 'NAVIDAD', 'NOCHEVIEJA'].includes(dia) ? 'ESTA' : 'ESTE', t2: dia }, cta: { pill: WA } } })),
  // ---------- Champions · día de partido (estilo de las stories del 3 y 4 nov) ----------
  { key: 'p2-1124-ucl', file: 'champions-24-nov.mp4', spec: { mode: 'partido', rango: 'CHAMPIONS', local: 'R. MADRID', visitante: 'PSV', hora: '20:00', photo: null } },
  { key: 'p2-1125-ucl', file: 'champions-25-nov.mp4', spec: { mode: 'partido', rango: 'CHAMPIONS', local: 'BARÇA', visitante: 'SABAH', hora: '17:45', photo: null } }
];
export const PENDING_VIDEOS = [{ key: 'p2-1121-stories', why: 'Sábado 21 nov: falta confirmar si toca Son Aldea, Son Diferente o «Directo».' }];
