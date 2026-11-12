// Calendario editorial de Heineken 5mentarios · 11 de noviembre – 31 de diciembre de 2026 (versión 2).
//
// Fuentes:
// - «00_TRANSFERENCIA_HEINEKEN_5MENTARIOS.md» (11 nov 2026): programación de noviembre, diseños entregados,
//   plan semanal fijo del planificador «Centro de control», captions modelo, hashtags y reglas de marca.
// - Material real de Google Drive (IDs reales).
// - Calendario oficial UEFA: Champions J5 24–25 nov y J6 8–9 dic.
//
// Ritmo semanal (planificador): lunes 13:00 carrusel de fotos · miércoles 12:00 programación (post + canal de
// WhatsApp) y reel de programación · jueves 19:00 reel colab Volcán o ambiente · viernes y sábado stories de
// cuenta atrás y en directo · domingo 17:00 reel de tardeo en directo (solo si hay tardeo).
//
// No se inventan artistas, horarios, partidos, precios ni promociones: lo que el documento marca como
// [POR CONFIRMAR] o lo que no aparece va en `pending_info`. Horas = hora de Canarias (UTC+0 en nov/dic).

import { HASHTAGS, BRAND } from '../lib/brand.js';
const HT = HASHTAGS.base;
const HT_FINDE = HASHTAGS.finde;
const HT_MONO = HASHTAGS.monologos;
const HT_FOTOS = HASHTAGS.fotos;
const WA = BRAND.whatsapp;
const DELIV = (f) => `Diseño ENTREGADO en el paquete de transferencia: 02_disenos_entregados/${f} (PNG + PSD). Subirlo como versión 1.`;
const LOGO_END = 'Cierre con la animación del logo (@heineken5mentarios). Sin música: el audio en tendencia lo pone el responsable.';

// ---------- Material existente en Google Drive ----------
const F = {
  champPortada: { id: '1eT6Eu3OqCR2knBRFykqtS7xy4hiE33r7', name: 'champions-01-portada-jugadores.png', mime_type: 'image/png' },
  champPortadaPsd: { id: '1B0xFdhZO5C3UNkPgBPO8zlM64Z-OsjRH', name: 'champions-01-portada.psd', mime_type: 'image/vnd.adobe.photoshop' },
  champPartido: { id: '1zjQWObxstWji8VFfTVOhrSTvKUhMvusH', name: 'champions-02-galatasaray-barca.png', mime_type: 'image/png' },
  champPartidoPsd: { id: '1xZh3coP9eDpSb8uG4ui2cSR46TeBTfPq', name: 'champions-02-galatasaray-barca.psd', mime_type: 'image/vnd.adobe.photoshop' },
  champPartido2: { id: '1PrD55GQboG1XlpK44vGrjgnfC-AiHl2H', name: 'champions-04-roma-madrid.png', mime_type: 'image/png' },
  vC0611: { id: '1MIfpguuqRg2tJooKpH4Qyew6fK9PPTHq', name: 'C0611.MP4', mime_type: 'video/mp4' },
  vC0618: { id: '1BPPbqgb7ZHB1o6CYOTk0LsfsmqN3GrJt', name: 'C0618.MP4', mime_type: 'video/mp4' },
  vC0572: { id: '15FqRTVccoGLb1NCyD8hw19eB-3XUhYmm', name: 'C0572.MP4', mime_type: 'video/mp4' },
  vC0573: { id: '1LNlFa3ztTj2zBqpl1WaSHazGxoj29sK3', name: 'C0573.MP4', mime_type: 'video/mp4' },
  fDSC01927: { id: '1N-Ttg-TI8hbzJwSea_SrCjIjXS7YgXoC', name: 'DSC01927.JPG', mime_type: 'image/jpeg' },
  fDSC01834: { id: '1oe7RsfcAavg0C1yLkh5J0rRqepLUjw-E', name: 'DSC01834.JPG', mime_type: 'image/jpeg' },
  fDSC01847: { id: '1MftJtUx9Yabmvqorw00HdhO9uvA8QZQC', name: 'DSC01847.JPG', mime_type: 'image/jpeg' },
  fDSC01852: { id: '1qmhFEsq5kNYx4ZUhtC1gw5OunnnFghWm', name: 'DSC01852.JPG', mime_type: 'image/jpeg' },
  tipos1: { id: '16kAkuraNorIV0FDM-grBRWNEh8AQ99cU', name: 'tipos-de-personas 1.jpg', mime_type: 'image/jpeg' },
  tipos2: { id: '1JV5sYRMTSCLq_PvQDZkDt4pAQBbPFPu-', name: 'tipos-de-personas 2.jpg', mime_type: 'image/jpeg' },
  tipos6: { id: '1wH79LJhc2igfTIBhmu-NdGauIQXXo3pa', name: 'tipos-de-personas 6.jpg', mime_type: 'image/jpeg' },
  tipos7: { id: '1O_ObPYIPrHlSLrk-99rUNskwU1e4LN94', name: 'tipos-de-personas 7.jpg', mime_type: 'image/jpeg' },
  tiposZip: { id: '1AYTdLfB1ek1zJ7_09SBFODAbpRUsb1O-', name: 'carrusel-tipos-de-personas.zip', mime_type: 'application/zip' },
  reglasZip: { id: '1RRUdDzdpVnfcMWyHpWeA90_RiY0tIkfs', name: 'carrusel-reglas.zip', mime_type: 'application/zip' },
  sello: { id: '1YH_hltwSN3lAN9L9PnhUQenIltcDsKuH', name: '5mentarios-sello.svg', mime_type: 'image/svg+xml' },
  selloNegro: { id: '1vfdqLuDgxL80qWBHF6c7pFgOiIAa-psZ', name: '5mentarios-negro.svg', mime_type: 'image/svg+xml' },
  cartelHalloween: { id: '1nQTe04L54ckDgysS0rhuxwlQdbaN3IBK', name: 'cartel-halloween-31-octubre.png', mime_type: 'image/png' }
};
// Fotos del 31 de octubre (DSC08395 → DSC08465), previsiblemente del tardeo de Halloween
const HALLOWEEN_IDS = ['1v2-0mKyu2v1Nz8YU0YM39KMVTYKX4IiH', '1-drZ7roNJqnZ_qIIg-qSyQVoFoaTNN4M', '15Y4vYurskpvYoKtjb96BMZhGulaYf5HO', '1o-XMty-oYQKS1jHn6OgfJ2MK7E4C3eVT',
  '1KlM_syweDhdhuKKztshbdoqlV8-LvdkZ', '1ffG9JcylePTEYPBLNE8aAciwpwflp02_', '156cQsAChBpAGqPSzirPipfDnSsLyZpOO', '1qgnwTQ00N9C7BOltbDd5o9YMczLcf5k2', '17VdF5NIY_QSlpur5YqF455VbGzG8ifSH',
  '18z0uHsF2p7NchFjH8-jhW9EB1y362x55', '1lf4OiiiRPdmteXD84pai-VP4OgX-08_2', '1dNaaRZ-mIAFHRdr7q2Ro0GkrrQ2-_B8e', '1jI_wBOugTCVRNEu58PV-b4awqsEM69sq', '1t41BnDT5ROcNHFKL42HA6jqElKrodrTg',
  '1JV2is934Ln2WjnFycWsNZvSa9P7bkhr3', '1xHY6sawU705jYby6EvFpMGl06e38Kgi0', '13aUqFg0L_f2nutAW2GzgUSFEsYL2t0AQ', '1pWV7NSIiTmxxX2grYpJeEnzbfQD8VFtY', '161_AlNLgSbuOU6ZCTSWWDH5lGyFio1f9',
  '1fpTx63hEIrAVFV1fsXuF47UZt5UcDeK0', '1HErVKu8BwfOdV3KlA5r72aw3WmcWGn1Y', '174AY_9IaYPSKSNDgw2r1cYbDK9ATp9FS', '1I1JKAMan01I6BVGjvGEgSN2y-n-Fz3l9', '1ydLAajreNe2lfEIKrJizMCUes3NJWwrW',
  '1H3hliEndiL_P85gZWyJVnZYyp3Uiadvj', '13LWMNtfWSCdZDuSnu2lVxJrjdXtWcqR5', '1oV9uP-UdbRS8JVttpAk1u9eeGfTbv5CX', '1G9s-_5djj1eMIbm92cZHvUx7qc_4Y5fl', '1o3LFHkif97pgJz5bv5faHMaZrQuLjdqT',
  '1J-wnAjCMGzvzWnmrxRIOujSzpw6p_4ni', '1tBmMeUpiyaLlAmd_6ZjVKGarG2mR4PGk', '1ZtpkrqVIe1snITigqyYuMIpKc6RRpnmo', '1d4rRxw25Gpy3KSR7Rz_JQyimbqPXLfKf', '1SqWQf45wuOdf4bZ2_rFvLZee2hY336_b',
  '1m45sp5pCqW9x53z9sbGOa35ldV9cPKhf', '1J8plgjBY1JwpqgZ_QjZUMSaHrjAic2My', '1tr-xOhmL3nLrrwDqRqFXBqSgIL_d93F2', '1IIltNwRxQ8DM63W7tfqI8JWZkgGnw2cD', '1eAMoF842yD1UHEiXzk-JNtnUAZw8S_Fe',
  '1RE3YUh4gYDAhTsHxuHbjWtgYHoCuegJx', '1-ldikKXM21HTDW7K4GOBzlEVkZOVagnn', '1v6YtFkrVmp_tWOH8VbgXxOKYlTVk7-rt', '1lKjOJktyETLJtdCvKNckhH5JOF3UA1F_', '1SkHXNartMmgD9luAbvUWt05Qj-9eLJUc',
  '1Ha86sTpsm4ydluid3QW4mU3eKWH4sbXu', '1TZD006whCcE6ZJvOdAVqJUOY-kvivK92', '1ETS0xa4S6s_g-Wq3DufTwTByJMo1hPP3', '1O4nY6rKmPpNvOeFjwH4-e87itHMmLyxq', '1A6F8YWwSxkk9KmEavXAcOIViRE4d5w6U',
  '1aJw796AH4SdKvCrPgl6VJKHgvM70JTqt', '1jj7sEcqsX08b67ZvJV8IspoBMmGJPMPJ', '1pIziyFBOm5oSMSG0HPhjZhiLdO_Mhy9i', '156KPlP2ky66v9bo1OQKvE0tYi7mcrpXF', '1BH3ZVlSIUQr1HJHrDxi6OHnlmdmkl7Ua',
  '1JYZajgC4Cru5dFzfB9wgsX_AwWS_iJtR', '1lx8UvvTBZfCOP78IIPdJ83_VQT30AZgT', '1bYvDTcFpcMv09JRehZxlDDyyuu6cWfii', '1bv097TRGHvqhANPlxBZfFWq0mIrY2Ia_', '1Uz1JWvY6Rr9GWre7UhF5iBe4XtfiTKPE',
  '1eqVTn2jf0uTyfZP1mkE6dPfLCAYs68i9', '1V0YLwNiKYhV2Y8f_RPuwhcNapE9vPALV', '175tAKCTQl3BZ5XIFkj9vjaOsFa6b43Pe', '11364ggvYgG0nErYzr7D4eIpY7aafrNG1', '1wIvj9o--Igndm2YVlH-zOlglUINstIxJ',
  '1ECNb3iRnNPHKlJKtocOkPHmWMa1PdLvD', '1yOWWjG-uh5K_IHn5sRhTxI2SM9FsOXSQ', '1nTchoBBl-U_eAh_gr0Mu9Y5B6fNknGZX', '1hdgyxgUdEZKK-5hxjEQkycgQo0adORvp', '1dXNaf6EUi8taArR3AWiZTAngvrV11gj2',
  '1IRDF1tLgEhId3bokEoq0zBrDdGnEa9nF', '1dYPnLdC-ajskQIaroi2lNdLhYBvWu52u'];
const HALLOWEEN = HALLOWEEN_IDS.map((id, i) => ({ id, name: `DSC0${8395 + i}.JPG`, mime_type: 'image/jpeg' }));


// ---------- Bloques reutilizables ----------
const PLAN = [];
const add = (o) => PLAN.push({ platforms: ['instagram'], assignee: 'marketing', ...o });
const iso = (d, t) => `2026-${d}T${t}:00Z`;

// Miércoles 12:00 · programación en post + canal de WhatsApp (caption modelo del documento)
function programacion(key, d, titulo, filas, extra = {}) {
  const lineas = filas.map((f) => `${f.dia} · ${f.hora || '[hora]'} · ${f.quien || '[artista / DJ]'}`).join('\n');
  const wa = filas.map((f) => `${f.diaCorto} ${f.hora || '[hora]'} · ${f.quien || '[artista]'}`).join('\n');
  add({
    key, kind: 'weekly_poster', title: `Programación · ${titulo}`, starts_at: iso(d, '12:00'), deadline: `2026-${d}`,
    format: 'Post 4:5 + canal de WhatsApp', platforms: ['instagram', 'whatsapp'], status: 'pending_prep',
    objective: 'Que la gente sepa el plan de la semana y reserve mesa.',
    material: 'Estilo de cartel de noche aprobado (Anton + horas en verde), logo arriba a la izquierda, pie «HEINEKEN 5MENTARIOS · ARUCAS».',
    copy: `${filas.length > 2 ? 'Esta semana' : 'Este finde'} en 5mentarios 🍻\n\n${lineas}\n\nY si te entra el hambre, pide tu Volcán o tu Cuor di Pizza y te la llevamos a la mesa 🍔🍕\n\n¿Con quién vienes? Etiquétalo 👇`,
    cta: `¿Con quién vienes? Etiquétalo 👇 · Reservas por WhatsApp ${WA}`, hashtags: HT_FINDE,
    description: `Versión para el canal de WhatsApp:\n🍻 FINDE EN 5MENTARIOS\n${wa}\nComida de Volcán y Cuor di Pizza a la mesa 🍔🍕\n\nActualizar también la programación de la web (EVENTOS y PROGRAMA en index.html del repositorio heineken5mentarios).`,
    ...extra
  });
}
// Miércoles · reel semanal de programación con personas hablando a cámara
function reelProgramacion(key, d, titulo, extra = {}) {
  add({ key, kind: 'reel', title: `Reel de programación · ${titulo}`, starts_at: iso(d, '19:30'), format: 'Reel 9:16', status: 'idea',
    objective: 'Contar el plan de la semana con personas del equipo hablando a cámara.',
    material: 'Hay que grabarlo (dos personas del equipo en la barra, como el guion «Lo que se viene este finde», 35 s).',
    copy: 'Lo que se viene esta semana en 5mentarios 👀\n\n¿Con quién vienes? Etiquétalo 👇', cta: `Reserva tu mesa por WhatsApp: ${WA}`, hashtags: HT,
    description: `Planos de menos de 2 s, gancho en el primer segundo, ubicación Arucas. ${LOGO_END}`, ...extra });
}
// Lunes 13:00 · carrusel de fotos de la noche
function fotosLunes(key, d, label, artista, extra = {}) {
  add({ key, kind: 'carousel', title: `Carrusel de fotos · ${label}`, starts_at: iso(d, '13:00'), format: 'Carrusel (formato original)', status: 'pending_prep',
    objective: 'Comunidad: que la gente se vea, se etiquete y comparta.',
    material: `Fotos de ${label} (subirlas a Drive). Edición natural y limpia, formato original sin recortar. Sin flash directo, sin menores en fotos de barra o bebidas.`,
    copy: `Así sonó ${artista ? 'el finde' : 'el finde'} en 5mentarios 🎶 Gracias a todos los que vinisteis${artista ? ` y a ${artista} por esa noche` : ''}. Búscate en las fotos y etiquétate 📸`,
    cta: 'Búscate en las fotos y etiquétate 📸', hashtags: HT_FOTOS,
    pending_info: `Fotos de ${label} (aún no están en Drive).`, ...extra });
}
// Jueves 19:00 · reel colab Volcán o ambiente
function reelJueves(key, d, tipo, extra = {}) {
  const volcan = tipo === 'volcan';
  add({ key, kind: 'reel', title: volcan ? 'Reel colab con Volcán · la pides en el 5mentarios' : 'Reel de ambiente', starts_at: iso(d, '19:00'),
    format: 'Reel 9:16', status: volcan ? 'idea' : 'pending_prep',
    platforms: ['instagram'], objective: volcan ? 'Recordar que la comida de Volcán y Cuor di Pizza llega a la mesa.' : 'Alcance: enseñar el ambiente del bar.',
    material: volcan ? 'Grabar POV «la pides en el 5mentarios» (burger llegando a la mesa). Publicar en colaboración con @volcansmashburger.' : 'Vídeos del bar en Drive (carpeta Heineken): C0572, C0573, C0611, C0618.',
    copy: volcan ? 'Tú sigues con la ronda, la cena llega sola 🍔\n\nPide Volcán o Cuor di Pizza y te lo llevamos a la mesa.' : 'Tardeo, música y los tuyos 🍻\n\nLo mejor de la noche siempre empieza con un «¿vamos a 5mentarios?»',
    cta: `Reserva tu mesa: WhatsApp ${WA}`, hashtags: HT,
    description: `Planos de menos de 2 s, gancho en el primer segundo. ${LOGO_END}`, ...extra });
}
// Viernes / sábado · stories del día (cuenta atrás + directo)
function storiesNoche(key, d, label, filas, extra = {}) {
  const prog = filas.map((f) => `${f.hora || '[hora]'} ${f.quien || '[artista]'}`).join(' · ');
  add({ key, kind: 'story', title: `Stories · ${label}`, starts_at: iso(d, '12:30'), format: 'Story animada «Hoy en 5mentarios» + 3–5 stories en directo',
    status: 'idea', requires_approval: false, objective: 'Recordar el plan de hoy y enseñar el ambiente en directo.',
    material: 'Plantilla de story animada «Hoy en 5mentarios» (11–17 s). Texto entre y≈250 y y≈1700.',
    copy: `Story animada: «HOY» → ${prog} → «RESERVA TU MESA · WHATSAPP ${WA}» → logo.\nNoche: 3–5 stories en directo mencionando al artista. Repostear todas las menciones.`,
    cta: 'Stickers: ubicación, mención del artista, enlace a WhatsApp', ...extra });
}

// ===================== NOVIEMBRE · semana 9–15 =====================
add({ key: 'p2-1111-cuenta3', kind: 'story', title: 'Story · Tardeo Exterior: faltan 3 días', starts_at: iso('11-11', '12:00'), format: 'Story 9:16',
  status: 'in_review', objective: 'Cuenta atrás al Tardeo Exterior Halloween del sábado 14.', material: DELIV('stories/story-tardeo-faltan-3-dias'),
  copy: 'Sticker de cuenta atrás al sábado 14 · 16:00.', cta: 'Sticker «Recordarme»' });
add({ key: 'p2-1111-semana', kind: 'story', title: 'Story animada · Esta semana en 5mentarios (12–14 nov)', starts_at: iso('11-11', '13:00'), format: 'Story animada 17 s',
  status: 'in_review', platforms: ['instagram', 'whatsapp'], objective: 'Programación de la semana.', material: 'Vídeo ENTREGADO: 02_disenos_entregados/videos/story-esta-semana-12-14-nov.mp4 (17 s). Subirlo como versión 1.',
  copy: 'Jue 12 · 21:00 · Monólogos con Juan Antonio Cabrera\nVie 13 · 22:30 · Son Diferente + 00:00 DJ Ruven\nSáb 14 · desde las 16:00 · Tardeo Exterior Halloween',
  cta: `Reserva por WhatsApp: ${WA}`,
  description: `Canal de WhatsApp:\n🍻 ESTA SEMANA EN 5MENTARIOS\nJue 21:00 · Monólogos con Juan Antonio Cabrera\nVie 22:30 · Son Diferente + DJ Ruven\nSáb desde las 16:00 · Tardeo Exterior Halloween\nComida de Volcán y Cuor di Pizza a la mesa 🍔🍕` });
add({ key: 'p2-1112-monologos', kind: 'event', title: 'Monólogos · Juan Antonio Cabrera', starts_at: iso('11-12', '21:00'), format: 'Evento', requires_approval: false, status: 'scheduled',
  objective: 'Mes del humor.', description: 'Jueves 12/11 a las 21:00. Aforo limitado. Reservas 627 304 115.' });
add({ key: 'p2-1112-monologos-story', kind: 'story', title: 'Story · Hoy monólogos con Juan Antonio Cabrera', starts_at: iso('11-12', '12:00'), format: 'Story 9:16',
  status: 'in_review', objective: 'Llenar el aforo de esta noche.', material: DELIV('stories/story-monologos-* (Juan Antonio Cabrera)'),
  copy: 'HOY · 21:00 · Juan Antonio Cabrera · AFORO LIMITADO · RESERVAS 627 304 115', cta: 'Enlace a WhatsApp' });
add({ key: 'p2-1112-cuenta2', kind: 'story', title: 'Story · Tardeo Exterior: faltan 2 días', starts_at: iso('11-12', '13:00'), format: 'Story 9:16',
  status: 'in_review', material: DELIV('stories/story-tardeo-faltan-2-dias'), copy: 'Sticker de cuenta atrás al sábado 14 · 16:00.', cta: 'Sticker «Recordarme»' });
add({ key: 'p2-1112-reel-halloween', kind: 'reel', title: 'Reel · Así fue Halloween → ¿te vas a perder el Tardeo Exterior?', starts_at: iso('11-12', '19:00'), format: 'Reel 9:16 · 27 s',
  status: 'in_review', objective: 'Usar el éxito de Halloween para llenar el Tardeo Exterior del sábado.',
  material: 'Vídeo ENTREGADO: 02_disenos_entregados/videos/reel-halloween-tardeo-exterior.mp4 (sin música).',
  copy: 'Así fue Halloween en 5mentarios 🎃\n\n¿Y ahora te vas a perder… EL TARDEO EXTERIOR? 👀\n\nSábado 14 desde las 16:00: DJ Ruven, Apolo, Son Aldea y Pedro Afonso.\n\n¿Con quién vienes? Etiquétalo 👇',
  cta: '¿Con quién vienes? Etiquétalo 👇', hashtags: HT, description: 'Organiza el Ayuntamiento de Arucas; colaboran 5mentarios y COA. El responsable pone el audio en tendencia.' });
add({ key: 'p2-1112-carrusel-lineup', kind: 'carousel', title: 'Carrusel line-up · Tardeo Exterior Halloween (sáb 14)', starts_at: iso('11-12', '13:30'), format: 'Carrusel 5 × 1080×1350',
  status: 'in_review', objective: 'Presentar el line-up del tardeo.', material: DELIV('carrusel_tardeo_14/carrusel-tardeo-1…5 (portada + DJ Ruven, Apolo, Son Aldea, Pedro Afonso)'),
  copy: 'TARDEO EXTERIOR · HALLOWEEN 🎃\n\nSábado 14 de noviembre, desde las 16:00:\n16:00 · DJ Ruven\n17:30 · Apolo\n19:30 · Son Aldea\n21:30 · Pedro Afonso\n\nOrganiza el Ayuntamiento de Arucas; colaboran 5mentarios y COA.\n\n¿Con quién vienes? Etiquétalo 👇',
  cta: '¿Con quién vienes? Etiquétalo 👇', hashtags: HT, pending_info: 'Comprobar si el carrusel line-up y el cartel ya se publicaron.' });
add({ key: 'p2-1113-noche', kind: 'event', title: 'Son Diferente 22:30 + DJ Ruven 00:00', starts_at: iso('11-13', '22:30'), requires_approval: false, status: 'scheduled', format: 'Evento' });
add({ key: 'p2-1113-manana', kind: 'story', title: 'Story · Tardeo Exterior: mañana', starts_at: iso('11-13', '12:00'), format: 'Story 9:16', status: 'in_review',
  material: DELIV('stories/story-tardeo-manana'), copy: 'Mañana · desde las 16:00 · Tardeo Exterior Halloween', cta: 'Sticker «Recordarme»' });
storiesNoche('p2-1113-stories', '11-13', 'viernes 13 · Son Diferente + DJ Ruven', [{ hora: '22:30', quien: 'Son Diferente' }, { hora: '00:00', quien: 'DJ Ruven' }],
  { status: 'pending_prep', material: 'Story animada «Hoy en 5mentarios» por preparar (como la del sáb 7: story-hoy-sabado-07.mp4).' });
add({ key: 'p2-1114-tardeo', kind: 'event', title: 'Tardeo Exterior Halloween · desde las 16:00', starts_at: iso('11-14', '16:00'), requires_approval: false, status: 'scheduled', format: 'Evento',
  description: 'DJ Ruven 16:00 · Apolo 17:30 · Son Aldea 19:30 · Pedro Afonso 21:30. Sustituye al sábado de noche previsto. Organiza el Ayto. de Arucas; colaboran 5mentarios y COA.' });
add({ key: 'p2-1114-hoy', kind: 'story', title: 'Stories · Hoy Tardeo Exterior (cuenta atrás + animada + directo)', starts_at: iso('11-14', '11:00'), format: 'Story «hoy» + story animada 16 s + directo',
  status: 'in_review', requires_approval: true, material: `${DELIV('stories/story-tardeo-hoy')} Story animada ENTREGADA: videos/story-tardeo-exterior-halloween-14.mp4.`,
  copy: 'HOY · desde las 16:00 · Tardeo Exterior Halloween\nDirecto: una story al empezar cada artista (16:00 DJ Ruven, 17:30 Apolo, 19:30 Son Aldea, 21:30 Pedro Afonso), mencionándolos. Repostear todas las menciones.',
  cta: 'Ubicación + mención de artistas' });
fotosLunes('p2-1116-fotos', '11-16', 'el Tardeo Exterior del sábado 14', null, {
  copy: 'Así se vivió el Tardeo Exterior en 5mentarios 🎶 Gracias a todos los que vinisteis y a DJ Ruven, Apolo, Son Aldea y Pedro Afonso. Búscate en las fotos y etiquétate 📸',
  description: 'Etiquetar al Ayuntamiento de Arucas y a COA como colaboradores.' });

// ===================== semana 16–22 =====================
add({ key: 'p2-1117-saul', kind: 'post', title: 'Post · Monólogos con Saúl Romero (jue 19)', starts_at: iso('11-17', '13:00'), format: 'Post 1080×1350', status: 'in_review',
  objective: 'Llenar el aforo del jueves 19.', material: DELIV('carteles_y_posts/post-monologos-saul-romero-19'),
  copy: `¡Este jueves nos echamos unas risas en 5mentarios! 🎤\nSaúl Romero viene con su monólogo para que te olvides de la semana a carcajadas. Tú te traes las ganas de reír y nosotros las Heineken bien fresquitas 🍻\n📅 Jueves 19 de noviembre · 🕘 21:00 · 📍 Heineken 5mentarios · Arucas\nSi te entra hambre, pide de Volcán o de Cuor di Pizza y te lo llevamos a la mesa.\nEl aforo es limitado, así que reserva en el ${WA} 😉`,
  cta: `Reserva en el ${WA}`, hashtags: HT_MONO });
programacion('p2-1118-prog', '11-18', 'semana 19–21 nov', [
  { dia: 'JUEVES 19', diaCorto: 'Jue', hora: '21:00', quien: 'Monólogos con Saúl Romero' },
  { dia: 'VIERNES 20', diaCorto: 'Vie', hora: null, quien: 'Apolo + DJ Asped' },
  { dia: 'SÁBADO 21', diaCorto: 'Sáb', hora: null, quien: 'Son Diferente + DJ Ake' }],
  { pending_info: 'Vie 20 (Apolo + DJ Asped) y sáb 21 (Son Diferente + DJ Ake) están [POR CONFIRMAR] (así salieron en el carrusel de noviembre). Faltan las horas.' });
reelProgramacion('p2-1118-reel', '11-18', 'semana 19–21 nov');
add({ key: 'p2-1119-saul-evento', kind: 'event', title: 'Monólogos · Saúl Romero', starts_at: iso('11-19', '21:00'), requires_approval: false, status: 'scheduled', format: 'Evento', description: 'Aforo limitado. Reservas 627 304 115.' });
add({ key: 'p2-1119-saul-story', kind: 'story', title: 'Story · Hoy monólogos con Saúl Romero', starts_at: iso('11-19', '12:00'), format: 'Story 9:16', status: 'in_review',
  material: DELIV('stories/story-monologos-* (Saúl Romero)'), copy: `HOY · 21:00 · Saúl Romero · AFORO LIMITADO · RESERVAS ${WA}`, cta: 'Enlace a WhatsApp' });
reelJueves('p2-1119-reel', '11-19', 'ambiente', { attachments: [F.vC0611, F.vC0618] });
storiesNoche('p2-1120-stories', '11-20', 'viernes 20', [{ hora: null, quien: 'Apolo' }, { hora: null, quien: 'DJ Asped' }], { pending_info: 'Apolo + DJ Asped [POR CONFIRMAR] y horas.' });
storiesNoche('p2-1121-stories', '11-21', 'sábado 21', [{ hora: null, quien: 'Son Diferente' }, { hora: null, quien: 'DJ Ake' }], { pending_info: 'Son Diferente + DJ Ake [POR CONFIRMAR] y horas.' });
fotosLunes('p2-1123-fotos', '11-23', 'el finde 20–21 nov');

// ===================== semana 23–29 (Champions J5 + aniversario) =====================
add({ key: 'p2-1123-kike', kind: 'post', title: 'Post · Kike Pérez: 26/11 SOLD OUT + nueva fecha jue 03/12', starts_at: iso('11-23', '19:00'), format: 'Post 1080×1350', status: 'in_review',
  objective: 'Avisar del sold out y vender la nueva fecha.', material: DELIV('carteles_y_posts/post-monologos-kike-perez-03-12'),
  copy: `¡Agotado! 🎤 Kike Pérez y sus «20 años de Komedia» llenan el 26 de noviembre.\n\n¿Te has quedado fuera? Hay nueva fecha: jueves 3 de diciembre en 5mentarios.\n\nEl aforo es limitado, así que reserva en el ${WA} 😉`,
  cta: `Reserva en el ${WA}`, hashtags: HT_MONO, pending_info: 'Precio de la entrada (15 € según el planificador [POR CONFIRMAR]) y hora del 03/12. No poner precio hasta confirmarlo.' });
add({ key: 'p2-1123-ucl', kind: 'champions', title: 'Story · Esta semana, Champions en 5mentarios (J5)', starts_at: iso('11-23', '18:00'), format: 'Story 9:16', status: 'pending_prep',
  objective: 'Que se sepa que la Champions se ve en pantalla grande.', material: 'Plantillas Champions de octubre (Drive y lienzo de diseño de octubre).',
  copy: 'Martes 24 y miércoles 25 · CHAMPIONS · PANTALLA GRANDE · Volcán · Cuor di Pizza · te lo llevamos a la mesa', cta: 'Sticker «Recordarme»', hashtags: HT,
  pending_info: 'Qué partidos de la J5 se ponen y a qué hora (según el carrusel de noviembre hay partidos el 24 y el 25; comprobar antes de publicar).', attachments: [F.champPortada, F.champPortadaPsd] });
for (const [k, d, lbl] of [['p2-1124-ucl', '11-24', 'martes 24'], ['p2-1125-ucl', '11-25', 'miércoles 25']]) {
  add({ key: k, kind: 'champions', title: `Stories Champions · ${lbl} (J5)`, starts_at: iso(d, '17:00'), format: 'Stories (secuencia)', status: 'pending_prep',
    objective: 'Llenar la noche de Champions.', material: 'Plantilla de partido (pantalla partida negro/verde, «VS», «PARTIDAZO»).',
    copy: 'Story 1: «Hoy · [hora] · pantalla grande»\nStory 2: encuesta «¿Quién gana?»\nStory 3: «Todavía estás a tiempo» + cena con Volcán\nNo grabar la imagen de la tele.',
    cta: 'Encuesta + ubicación', hashtags: HT, pending_info: 'Partido(s) y hora.', attachments: [F.champPartido, F.champPartidoPsd] });
}
programacion('p2-1125-prog', '11-25', 'semana 26–29 nov', [
  { dia: 'JUEVES 26', diaCorto: 'Jue', hora: '—', quien: 'Kike Pérez · SOLD OUT (nueva fecha 03/12)' },
  { dia: 'VIERNES 27', diaCorto: 'Vie', hora: null, quien: 'Alberto Déniz + DJ Ake' },
  { dia: 'SÁBADO 28', diaCorto: 'Sáb', hora: null, quien: 'Savia Nueva + DJ Asped' },
  { dia: 'DOMINGO 29', diaCorto: 'Dom', hora: null, quien: 'Tardeo del 4º aniversario' }],
  { pending_info: 'Vie 27 (Alberto Déniz + DJ Ake) y sáb 28 (Savia Nueva + DJ Asped) [POR CONFIRMAR]. Horas del finde y del tardeo del aniversario.' });
reelProgramacion('p2-1125-reel', '11-25', 'semana 26–29 nov');
add({ key: 'p2-1126-kike-evento', kind: 'event', title: 'Monólogos · Kike Pérez (SOLD OUT)', starts_at: iso('11-26', '21:00'), requires_approval: false, status: 'scheduled', format: 'Evento',
  pending_info: 'Hora: los monólogos han sido a las 21:00; confirmar para esta fecha.' });
reelJueves('p2-1126-reel', '11-26', 'volcan');
add({ key: 'p2-1127-aniversario', kind: 'post', title: 'Post · 4 años de tardeos (domingo 29)', starts_at: iso('11-27', '13:00'), format: 'Post 1080×1350', status: 'pending_prep',
  objective: 'Convocar el tardeo del 4º aniversario.', material: 'Pieza «aniversario» del carrusel de noviembre (N1–N8, lienzo de diseño).',
  copy: '4 años de tardeos 🍻\n\nEl domingo 29 lo celebramos como sabemos: tardeo, música y los tuyos.\n\n¿Con quién vienes? Etiquétalo 👇', cta: `Reserva tu mesa: WhatsApp ${WA}`, hashtags: HT,
  pending_info: 'Hora de inicio y quién toca en el tardeo del aniversario.' });
storiesNoche('p2-1127-stories', '11-27', 'viernes 27', [{ hora: null, quien: 'Alberto Déniz' }, { hora: null, quien: 'DJ Ake' }], { pending_info: 'Alberto Déniz + DJ Ake [POR CONFIRMAR] y horas.' });
storiesNoche('p2-1128-stories', '11-28', 'sábado 28', [{ hora: null, quien: 'Savia Nueva' }, { hora: null, quien: 'DJ Asped' }], { pending_info: 'Savia Nueva + DJ Asped [POR CONFIRMAR] y horas.' });
add({ key: 'p2-1129-aniversario-evento', kind: 'event', title: 'Tardeo del 4º aniversario', starts_at: iso('11-29', '17:00'), requires_approval: false, status: 'scheduled', format: 'Evento',
  pending_info: 'Hora de inicio (17:00 es solo la hora del reel del domingo).' });
add({ key: 'p2-1129-reel', kind: 'reel', title: 'Reel · Tardeo del aniversario en directo', starts_at: iso('11-29', '17:00'), format: 'Reel 9:16', status: 'idea',
  objective: 'Reel de tardeo en directo del domingo.', material: 'Grabar en el momento: planos generales del ambiente.', copy: '4 años de tardeos y los que nos quedan 🍻 Gracias, Arucas.',
  cta: '¿Con quién viniste? Etiquétalo 👇', hashtags: HT, description: LOGO_END });
fotosLunes('p2-1130-fotos', '11-30', 'el finde del aniversario');

// ===================== DICIEMBRE =====================
add({ key: 'p2-1201-diciembre', kind: 'carousel', title: 'Carrusel · Programación de diciembre (fijar en el perfil)', starts_at: iso('12-01', '13:00'), deadline: '2026-11-27',
  format: 'Carrusel · fijado', platforms: ['instagram', 'whatsapp'], status: 'in_design', objective: 'Todo el mes a la vista.',
  material: 'Mismo formato que el calendario y carrusel de noviembre (N1–N8). El diseño de diciembre no está ni en Drive ni en el paquete de transferencia: subirlo como versión 1.',
  copy: 'Diciembre en 5mentarios 🎄\n\nDesliza y apunta: monólogos, fines de semana con música, Champions y las fechas grandes del mes.\n\nGuárdalo para tenerlo a mano 📌', cta: 'Guarda el post', hashtags: HT,
  pending_info: 'Programación completa de diciembre.' });
programacion('p2-1202-prog', '12-02', 'semana 3–7 dic', [
  { dia: 'JUEVES 3', diaCorto: 'Jue', hora: null, quien: 'Monólogos con Kike Pérez (nueva fecha)' },
  { dia: 'VIERNES 4', diaCorto: 'Vie', hora: '22:30', quien: 'Apolo + 00:00 DJ Ruven' },
  { dia: 'SÁBADO 5', diaCorto: 'Sáb', hora: '22:30', quien: 'Son Aldea + 00:00 DJ Asped' },
  { dia: 'LUNES 7 (víspera de festivo)', diaCorto: 'Lun', hora: '22:30', quien: 'Willy Flores + 00:00 DJ Asped' }],
  { pending_info: 'Hora del monólogo de Kike Pérez del 03/12.' });
reelProgramacion('p2-1202-reel', '12-02', 'semana 3–6 dic');
add({ key: 'p2-1203-kike-evento', kind: 'event', title: 'Monólogos · Kike Pérez (nueva fecha)', starts_at: iso('12-03', '21:00'), requires_approval: false, status: 'scheduled', format: 'Evento',
  pending_info: 'Hora: los monólogos han sido a las 21:00; confirmar. Entrada 15 € [POR CONFIRMAR].' });
add({ key: 'p2-1203-kike-story', kind: 'story', title: 'Story · Hoy Kike Pérez', starts_at: iso('12-03', '12:00'), format: 'Story 9:16', status: 'in_review',
  material: DELIV('stories/story-monologos-* (Kike Pérez)'), copy: `HOY · Kike Pérez · AFORO LIMITADO · RESERVAS ${WA}`, cta: 'Enlace a WhatsApp' });
reelJueves('p2-1203-reel', '12-03', 'ambiente', { attachments: [F.vC0572, F.vC0573] });
add({ key: 'p2-1204-navidad-menus', kind: 'carousel', title: 'Carrusel · Menús de Navidad para grupos', starts_at: iso('12-04', '13:00'), format: 'Carrusel 1080×1350', status: 'in_review',
  objective: 'Reservas de cenas de grupo en Navidad.', material: 'Diseño de Navidad en el lienzo de octubre–noviembre: tres variantes NAV, NAVB y NAVC. Elegir una y exportar PNG + PSD.',
  copy: `Esta Navidad, la cena del grupo es en 5mentarios 🎄\n\nMenú 1 · 25 €/persona\nMenú 2 · 30 €/persona\nMenú 3 · 38 €/persona\n\nDesliza para ver qué lleva cada uno 👉\nReservas en el ${WA}`,
  cta: `Reservas en el ${WA}`, hashtags: HT,
  description: 'Menú 1: papas arrugadas con mojo rojo, berenjenas crujientes con miel de palma, croquetas de queso roquefort con guayaba, salteado de pollo con verduras, tacos de pescado con mojo verde.\nMenú 2: tabla de quesos canarios, surtido ibérico, langostinos crujientes con salsa agripicante, volovanes (salmón con queso, ensaladilla de batata, cochino negro con crujiente de parmesano), solomillo de cerdo a la pimienta.\nMenú 3: jamón ibérico de bellota, montadito de arroz frito con atún fresco, ensalada de salmón con canónigos, merluza en salsa verde con papas panaderas, carrilleras de cerdo con parmentier.',
  pending_info: 'Qué bebida incluye cada menú y si estos precios son los definitivos [POR CONFIRMAR]. No publicar hasta que el propietario lo apruebe.' });
storiesNoche('p2-1204-stories', '12-04', 'viernes 4 · Apolo + DJ Ruven', [{ hora: '22:30', quien: 'Apolo' }, { hora: '00:00', quien: 'DJ Ruven' }], { status: 'pending_prep' });
storiesNoche('p2-1205-stories', '12-05', 'sábado 5 · Son Aldea + DJ Asped', [{ hora: '22:30', quien: 'Son Aldea' }, { hora: '00:00', quien: 'DJ Asped' }], { status: 'pending_prep' });
add({ key: 'p2-1206-constitucion', kind: 'special_date', title: 'Día de la Constitución (festivo)', starts_at: iso('12-06', '10:00'), all_day: true, requires_approval: false, status: 'idea', assignee: 'owner', pending_info: 'Horario del puente.' });
fotosLunes('p2-1207-fotos', '12-07', 'el finde 4–5 dic');
add({ key: 'p2-1208-inmaculada', kind: 'special_date', title: 'Inmaculada Concepción (festivo)', starts_at: iso('12-08', '10:00'), all_day: true, requires_approval: false, status: 'idea', assignee: 'owner', pending_info: 'Horario.' });
for (const [k, d, lbl] of [['p2-1208-ucl', '12-08', 'martes 8'], ['p2-1209-ucl', '12-09', 'miércoles 9']]) {
  add({ key: k, kind: 'champions', title: `Stories Champions · ${lbl} (J6)`, starts_at: iso(d, '17:00'), format: 'Stories (secuencia)', status: 'pending_prep',
    objective: 'Noche de Champions.', material: 'Plantilla de partido Champions.',
    copy: 'Story 1: «Hoy · [hora] · pantalla grande»\nStory 2: encuesta «¿Quién gana?»\nStory 3: «Todavía estás a tiempo» + cena con Volcán\nNo grabar la imagen de la tele.',
    cta: 'Encuesta + ubicación', hashtags: HT, pending_info: 'Partido(s) y hora de la J6.', attachments: [F.champPartido2] });
}
programacion('p2-1209-prog', '12-09', 'finde 11–12 dic', [{ dia: 'VIERNES 11', diaCorto: 'Vie', hora: '22:30', quien: 'Yet Garbey + 00:00 DJ Ake' }, { dia: 'SÁBADO 12', diaCorto: 'Sáb', hora: '22:30', quien: 'Son Karibe + 00:00 DJ Asped' }]);
reelProgramacion('p2-1209-reel', '12-09', 'finde 11–12 dic');
reelJueves('p2-1210-reel', '12-10', 'volcan');
storiesNoche('p2-1211-stories', '12-11', 'viernes 11 · Yet Garbey + DJ Ake', [{ hora: '22:30', quien: 'Yet Garbey' }, { hora: '00:00', quien: 'DJ Ake' }], { status: 'pending_prep' });
storiesNoche('p2-1212-stories', '12-12', 'sábado 12 · Son Karibe + DJ Asped', [{ hora: '22:30', quien: 'Son Karibe' }, { hora: '00:00', quien: 'DJ Asped' }], { status: 'pending_prep' });
fotosLunes('p2-1214-fotos', '12-14', 'el finde 11–12 dic');
programacion('p2-1216-prog', '12-16', 'finde 18–19 dic', [{ dia: 'VIERNES 18', diaCorto: 'Vie', hora: '22:30', quien: 'Pedro Afonso + 00:00 DJ Ake' }, { dia: 'SÁBADO 19', diaCorto: 'Sáb', hora: '22:30', quien: 'Café de Luna + 00:00 DJ Asped' }]);
reelProgramacion('p2-1216-reel', '12-16', 'finde 18–19 dic');
reelJueves('p2-1217-reel', '12-17', 'ambiente', { title: 'Reel · 5mentarios en Navidad (ambiente)', material: 'Grabar el local con la decoración navideña (si la hay) y ambiente.', status: 'idea' });
storiesNoche('p2-1218-stories', '12-18', 'viernes 18 · Pedro Afonso + DJ Ake', [{ hora: '22:30', quien: 'Pedro Afonso' }, { hora: '00:00', quien: 'DJ Ake' }], { status: 'pending_prep' });
storiesNoche('p2-1219-stories', '12-19', 'sábado 19 · Café de Luna + DJ Asped', [{ hora: '22:30', quien: 'Café de Luna' }, { hora: '00:00', quien: 'DJ Asped' }], { status: 'pending_prep' });
fotosLunes('p2-1221-fotos', '12-21', 'el finde 18–19 dic');
add({ key: 'p2-1222-horarios', kind: 'story', title: 'Story fijada · Horarios de Navidad y fin de año', starts_at: iso('12-22', '12:00'), format: 'Story 9:16 + destacado', platforms: ['instagram', 'whatsapp'],
  status: 'pending_prep', objective: 'Que nadie se encuentre cerrado.', copy: '24 DIC · desde las 16:30 · Tardeo de Navidad (exterior) · DJs hasta las 04:00 (exterior) y las 06:00 (interior)\n25 DIC · desde las 23:00 · DJ Asped\n31 DIC · desde las 16:30 · Tardeo de Fin de Año (exterior) · DJs hasta las 04:00 (exterior) y las 06:00 (interior)\nGuardar en destacados.', cta: 'Guardar en destacados',
  pending_info: 'Horario del 1 de enero (si se quiere añadir).' });
programacion('p2-1223-prog', '12-23', 'Navidad (24–26 dic)', [
  { dia: 'JUEVES 24', diaCorto: 'Jue', hora: '16:30', quien: 'Tardeo de Navidad (exterior): Son Aldea 16:30 · Kilian Viera 18:30 · DJ Ake 00:00–04:00 (exterior) · DJ Ruven 00:00–06:00 (interior)' },
  { dia: 'VIERNES 25', diaCorto: 'Vie', hora: '23:00', quien: 'DJ Asped' },
  { dia: 'SÁBADO 26', diaCorto: 'Sáb', hora: '22:30', quien: 'Savia Nueva + 00:00 DJ Ruven' }]);
add({ key: 'p2-1224-feliz', kind: 'post', title: 'Post · Feliz Navidad de 5mentarios', starts_at: iso('12-24', '12:00'), format: 'Post 1080×1350', status: 'idea',
  objective: 'Felicitación a la comunidad.', material: 'Sello 5mentarios sobre negro con brillo verde (estilo cartel de noche).',
  copy: 'Desde 2002 siendo el punto de encuentro de Arucas 🍻🎄\n\nGracias por otro año de tardeos, conciertos, monólogos y partidos. Feliz Navidad de parte de todo el equipo de 5mentarios.',
  cta: 'Comparte con los tuyos', hashtags: HT, attachments: [F.sello] });
add({ key: 'p2-1224-fecha', kind: 'special_date', title: 'Nochebuena', starts_at: iso('12-24', '10:00'), all_day: true, requires_approval: false, status: 'idea', assignee: 'owner', description: 'Tardeo de Navidad desde las 16:30 (ver evento).' });
add({ key: 'p2-1225-fecha', kind: 'special_date', title: 'Navidad', starts_at: iso('12-25', '10:00'), all_day: true, requires_approval: false, status: 'idea', assignee: 'owner', description: 'Abre desde las 23:00 con DJ Asped.' });
storiesNoche('p2-1226-stories', '12-26', 'sábado 26 · Savia Nueva + DJ Ruven', [{ hora: '22:30', quien: 'Savia Nueva' }, { hora: '00:00', quien: 'DJ Ruven' }], { status: 'pending_prep' });
fotosLunes('p2-1228-fotos', '12-28', 'el finde de Navidad');
add({ key: 'p2-1229-reel-2026', kind: 'reel', title: 'Reel · Nuestro 2026 en 5mentarios', starts_at: iso('12-29', '19:00'), format: 'Reel 9:16 (20–27 s)', status: 'pending_prep',
  objective: 'Resumen del año.', material: 'Vídeos del bar (C0572, C0573, C0611, C0618), fotogramas de Halloween, tardeo exterior, monólogos y aniversario.',
  copy: 'Nuestro 2026 en 5mentarios 🎶🎤🎃🎄\n\nGracias por cada tardeo, cada concierto, cada risa y cada gol cantado. Nos vemos en 2027.',
  cta: 'Etiqueta a quien ha estado contigo este año', hashtags: HT, description: `Planos generales, 1–2 s por plano. ${LOGO_END}`,
  attachments: [F.vC0611, F.vC0618, F.vC0572, F.vC0573] });
programacion('p2-1230-prog', '12-30', 'fin de año', [
  { dia: 'JUEVES 31', diaCorto: 'Jue', hora: '16:30', quien: 'Tardeo de Fin de Año (exterior): Apolo 16:30 · Cremita de Coco 18:30 · DJ Ake 00:00–04:00 (exterior) · DJ Asped 00:00–06:00 (interior)' }],
  { title: 'Programación · Tardeo de Fin de Año' });
add({ key: 'p2-1231-fecha', kind: 'special_date', title: 'Nochevieja', starts_at: iso('12-31', '10:00'), all_day: true, requires_approval: false, status: 'idea', assignee: 'owner', description: 'Tardeo de Fin de Año desde las 16:30 (ver evento).' });
add({ key: 'p2-1231-stories', kind: 'story', title: 'Stories · Hoy Tardeo de Fin de Año', starts_at: iso('12-31', '11:00'), format: 'Story «Hoy» + directo', status: 'pending_prep', requires_approval: true,
  copy: 'HOY · 16:30 Apolo · 18:30 Cremita de Coco · 00:00 DJ Ake (exterior, hasta las 04:00) · 00:00 DJ Asped (interior, hasta las 06:00). A las 00:00: «¡Feliz 2027!» con el sello.', cta: 'Ubicación + mención de artistas' });

// ---------- Eventos de diciembre CONFIRMADOS por el propietario (mensaje del 12 nov 2026) ----------
const EV = (key, d, t, title, description) => add({ key, kind: 'event', title, starts_at: iso(d, t), requires_approval: false, status: 'scheduled', format: 'Evento', description });
EV('p2e-1204', '12-04', '22:30', 'Apolo 22:30 + DJ Ruven 00:00');
EV('p2e-1205', '12-05', '22:30', 'Son Aldea 22:30 + DJ Asped 00:00');
EV('p2e-1207', '12-07', '22:30', 'Willy Flores 22:30 + DJ Asped 00:00', 'Lunes víspera del festivo del 8.');
EV('p2e-1211', '12-11', '22:30', 'Yet Garbey 22:30 + DJ Ake 00:00');
EV('p2e-1212', '12-12', '22:30', 'Son Karibe 22:30 + DJ Asped 00:00');
EV('p2e-1218', '12-18', '22:30', 'Pedro Afonso 22:30 + DJ Ake 00:00');
EV('p2e-1219', '12-19', '22:30', 'Café de Luna 22:30 + DJ Asped 00:00');
EV('p2e-1224', '12-24', '16:30', 'Tardeo de Navidad 🎄 (exterior)', '16:30 Son Aldea · 18:30 Kilian Viera · de 00:00 a 04:00 DJ Ake (exterior) · de 00:00 a 06:00 DJ Ruven (interior).');
EV('p2e-1225', '12-25', '23:00', 'DJ Asped desde las 23:00');
EV('p2e-1226', '12-26', '22:30', 'Savia Nueva 22:30 + DJ Ruven 00:00');
EV('p2e-1231', '12-31', '16:30', 'Tardeo de Fin de Año 🍇 (exterior)', '16:30 Apolo · 18:30 Cremita de Coco · de 00:00 a 04:00 DJ Ake (exterior) · de 00:00 a 06:00 DJ Asped (interior).');

// ---------- Tareas ----------
const T = (o) => ({ priority: 'medium', assignee: 'marketing', ...o });
const confirmar = (rango, martes, post) => T({ title: `Confirmar artistas, DJs y horas · ${rango}`, assignee: 'owner', priority: 'high', due_date: martes, post,
  description: 'El planificador pide tenerlos confirmados antes del martes de cada semana.' });
const web = (fecha, post) => T({ title: `Actualizar la web con la programación (${fecha.slice(8)}/${fecha.slice(5, 7)})`, priority: 'medium', due_date: fecha, post,
  description: 'EVENTOS y PROGRAMA en index.html del repositorio heineken5mentarios (grupo5mentarios.com).' });
const TASKS = [
  T({ title: 'Subir a Drive el paquete de transferencia (diseños, PSD, vídeos, fotos y logos)', priority: 'urgent', due_date: '2026-11-12',
    description: 'Carpeta «Grupo 5mentarios → Heineken». Así se pueden adjuntar a cada publicación desde la app.' }),
  T({ title: 'Story animada «Hoy» del viernes 13 (Son Diferente + DJ Ruven)', priority: 'high', due_date: '2026-11-13', post: 'p2-1113-stories' }),
  confirmar('finde 20–21 nov', '2026-11-17', 'p2-1118-prog'),
  confirmar('finde 27–29 nov (y tardeo del aniversario)', '2026-11-24', 'p2-1125-prog'),
  T({ title: 'Confirmar la hora del monólogo de Kike Pérez (jue 3 dic)', assignee: 'owner', priority: 'high', due_date: '2026-11-30', post: 'p2-1202-prog' }),
  T({ title: 'Confirmar precio de la entrada de Kike Pérez (15 € según el planificador)', assignee: 'owner', priority: 'medium', due_date: '2026-11-20', post: 'p2-1123-kike' }),
  T({ title: 'Confirmar bebida incluida y precios definitivos de los menús de Navidad', assignee: 'owner', priority: 'high', due_date: '2026-12-02', post: 'p2-1204-navidad-menus' }),
  T({ title: 'Confirmar si se abre el 1 de enero (horario)', assignee: 'owner', priority: 'low', due_date: '2026-12-18', post: 'p2-1222-horarios' }),
  T({ title: 'Diseñar el carrusel de diciembre (formato del de noviembre)', priority: 'urgent', due_date: '2026-11-27', post: 'p2-1201-diciembre' }),
  T({ title: 'Partidos y horas de la Champions J5 (24–25 nov) que se ponen', priority: 'high', due_date: '2026-11-22', post: 'p2-1124-ucl' }),
  T({ title: 'Partidos y horas de la Champions J6 (8–9 dic) que se ponen', priority: 'high', due_date: '2026-12-06', post: 'p2-1208-ucl' }),
  T({ title: 'Revisar si hay Clásico u otro partido grande en nov–dic', priority: 'medium', due_date: '2026-11-16',
    description: 'Solo el Clásico y las Champions importantes llevan post o reel; el resto, stories.' }),
  web('2026-11-11', null), web('2026-11-18', 'p2-1118-prog'), web('2026-11-25', 'p2-1125-prog'), web('2026-12-02', 'p2-1202-prog'),
  web('2026-12-09', 'p2-1209-prog'), web('2026-12-16', 'p2-1216-prog'), web('2026-12-23', 'p2-1223-prog'),
  T({ title: 'Grabar los reels de programación de los miércoles (personas a cámara)', priority: 'medium', due_date: '2026-11-18', post: 'p2-1118-reel' }),
  T({ title: 'Grabar el POV «la pides en el 5mentarios» con Volcán', priority: 'medium', due_date: '2026-11-25', post: 'p2-1126-reel' }),
  T({ title: 'Compartir la carpeta de Drive con la cuenta de Google del propietario', priority: 'high', due_date: '2026-11-13' })
];

// ---------- Biblioteca inicial (referencias a Drive, sin copiar archivos) ----------
const L = (f, category, notes) => ({ ...f, category, notes });
const LIBRARY = [
  ...HALLOWEEN.map((f) => L(f, 'eventos', 'Fotos del 31 oct (Halloween)')),
  L(F.fDSC01927, 'fotografias', 'Carpeta Heineken'), L(F.fDSC01834, 'fotografias'), L(F.fDSC01847, 'fotografias'), L(F.fDSC01852, 'fotografias'),
  L(F.vC0611, 'videos', 'Ambiente del bar'), L(F.vC0618, 'videos', 'Ambiente del bar'), L(F.vC0572, 'videos', 'Ambiente del bar'), L(F.vC0573, 'videos', 'Ambiente del bar'),
  L(F.champPortada, 'champions', 'Plantilla portada'), L(F.champPortadaPsd, 'champions', 'PSD editable'), L(F.champPartido, 'champions', 'Plantilla partido'),
  L(F.champPartidoPsd, 'champions', 'PSD editable'), L(F.champPartido2, 'champions', 'Plantilla partido'),
  // «Tipos de personas» es un carrusel de VOLCÁN (verificado al ver el diseño): no va en la biblioteca de 5mentarios.
  // «carrusel-reglas.zip» no se ha podido verificar: no se incluye.
  L(F.sello, 'disenos', 'Logo sello (blanco)'), L(F.selloNegro, 'disenos', 'Logo sello (negro)'),
  L(F.cartelHalloween, 'anteriores', 'Cartel Halloween 31 oct')
];

// Claves del plan anterior (v1) que la versión 2 sustituye si no se han tocado
const OLD_PREFIX = 'plan-2026-';
const OLD_TASK_TITLES = [
  'Subir a Drive los carteles semanales de noviembre y diciembre', 'Revisar si hay partidos grandes de Liga (Clásico, derbis) en nov–dic',
  'Compartir la carpeta de Drive con la cuenta de Google del propietario'
];

// Publicaciones actualizadas con la programación de diciembre: si ya se importaron y nadie las ha tocado, se actualizan
const SYNC_KEYS = ['p2-1202-prog', 'p2-1204-stories', 'p2-1205-stories', 'p2-1209-prog', 'p2-1211-stories', 'p2-1212-stories', 'p2-1216-prog', 'p2-1218-stories',
  'p2-1219-stories', 'p2-1222-horarios', 'p2-1223-prog', 'p2-1224-fecha', 'p2-1225-fecha', 'p2-1226-stories', 'p2-1230-prog', 'p2-1231-fecha', 'p2-1231-stories'];
const OBSOLETE_TASKS = ['Confirmar artistas, DJs y horas · 3–6 dic (hora de Kike Pérez y horario del puente)', 'Confirmar artistas, DJs y horas · finde 11–12 dic',
  'Confirmar artistas, DJs y horas · finde 18–19 dic', 'Confirmar artistas, DJs y horas · Navidad (24–26 dic)', 'Confirmar horarios de Navidad y fin de año (24, 25, 31 y 1)', 'Decidir si hay plan de Nochevieja'];

export { PLAN, TASKS, LIBRARY, OLD_PREFIX, OLD_TASK_TITLES, SYNC_KEYS, OBSOLETE_TASKS };
