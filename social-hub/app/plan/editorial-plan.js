// Calendario editorial de Heineken 5mentarios · 11 de noviembre – 31 de diciembre de 2026.
//
// Criterios:
// - Ritmo que ya usabais (plan oct–nov): jueves cartel del finde, viernes y sábado stories del día,
//   lunes carrusel con las fotos del finde ("cada lunes subimos las mejores" — web del bar).
// - Fútbol: solo partidos grandes llevan post/reel; Champions va en stories (plantillas ya diseñadas).
// - Se reutiliza el material que hay en Drive (IDs reales). Lo que no está en Drive se marca.
// - NO se inventan artistas, horarios, partidos, promociones ni aperturas especiales:
//   todo eso va en `pending_info` («Pendiente de confirmar»).
// - Horas de publicación = propuesta de cuándo publicar (no horarios de eventos).
// Canarias en noviembre/diciembre = UTC+0, por eso las fechas van con "Z".

const HT = '#Heineken5mentarios #5mentarios #Arucas #GranCanaria #TardeoGranCanaria #ArucasDeNoche #PlanesGranCanaria';
const HT_FUT = '#5mentarios #Arucas #ChampionsLeague #FútbolEnArucas #GranCanaria';
const HT_NAV = '#Heineken5mentarios #5mentarios #Arucas #NavidadEnArucas #GranCanaria #PlanesGranCanaria';

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
const MES = { '11': 'nov', '12': 'dic' };
const dm = (d) => `${Number(d.split('-')[1])} ${MES[d.split('-')[0]]}`; // '11-20' → '20 nov'
const rango = (a, b) => (a.split('-')[0] === b.split('-')[0] ? `${Number(a.split('-')[1])}–${dm(b)}` : `${dm(a)} – ${dm(b)}`);

// Cartel semanal del finde (jueves). Programación siempre pendiente de confirmar.
function cartelFinde(key, jueves, vie, sab, extra = {}) {
  add({
    key, kind: 'weekly_poster', title: `Cartel del finde · ${rango(vie, sab)}`, starts_at: iso(jueves, '13:00'), deadline: `2026-${jueves}`,
    format: 'Post 4:5 + story', platforms: ['instagram', 'whatsapp'], status: 'pending_prep',
    objective: 'Que la gente sepa quién toca y venga el viernes y el sábado.',
    material: 'Plantilla del cartel semanal (subir el diseño de esta semana) + sello 5mentarios',
    copy: `🎶 Este finde en 5mentarios\n\nViernes ${dm(vie)}: [ARTISTA] (directo) + [DJ]\nSábado ${dm(sab)}: [ARTISTA] (directo) + [DJ]\n\nY si te entra hambre, pide tu smash burger de Volcán o tu pizza de Cuor desde la mesa: te la llevamos 🍔🍕\n\n¿Con quién vienes? Etiquétalo 👇`,
    cta: 'Etiqueta a con quién vienes · Únete al canal de WhatsApp para la programación',
    hashtags: HT,
    pending_info: `Artistas, DJs y horarios del viernes ${dm(vie)} y sábado ${dm(sab)}.`,
    description: 'Versión corta para el canal de WhatsApp: «Este finde en 5mentarios 🎶 Vie: [artista + DJ] · Sáb: [artista + DJ] · Comida de Volcán y Cuor a la mesa.»',
    ...extra
  });
}
function storiesDia(key, d, label) {
  add({
    key, kind: 'story', title: `Stories del día · ${label}`, starts_at: iso(d, '12:30'), format: 'Stories (secuencia)', status: 'idea', requires_approval: false,
    objective: 'Recordar el plan de hoy y enseñar el ambiente en directo.',
    material: 'Cartel del día (recorte del cartel semanal) + vídeos grabados en el momento',
    copy: 'Pantalla 1 (mañana): «HOY en 5mentarios» + cartel del día · sticker de ubicación\nPantalla 2 (tarde): prueba de sonido / barra preparada\nPantalla 3 (noche): directo + comida llegando a las mesas · repost de quien os etiquete',
    cta: 'Sticker de ubicación y mención a los artistas', pending_info: 'Artista y horario de hoy (sale del cartel semanal).'
  });
}
function carruselFotos(key, d, finde) {
  add({
    key, kind: 'carousel', title: `Carrusel fotos del finde · ${finde}`, starts_at: iso(d, '19:00'), format: 'Carrusel', status: 'pending_prep',
    objective: 'Comunidad: que la gente se vea, se etiquete y comparta.',
    material: `Fotos de la gente del finde ${finde} (subir a Drive el domingo). Edición natural y limpia, formato original sin recortar.`,
    copy: `Así se vivió el finde en 5mentarios ✨\n\nGracias a todos los que vinisteis. ¿Te encuentras? Etiquétate y etiqueta a tu gente 👀\n\nCada lunes subimos las mejores fotos de la semana.`,
    cta: 'Etiquétate en las fotos', hashtags: HT,
    pending_info: `Fotos del finde ${finde} (aún no están en Drive).`
  });
}

// ===================== NOVIEMBRE =====================
add({ key: 'plan-2026-1112-halloween-carrusel', kind: 'carousel', title: 'Carrusel · Así fue el tardeo de Halloween', starts_at: iso('11-12', '19:00'), format: 'Carrusel (10 fotos)',
  status: 'in_design', objective: 'Aprovechar las fotos del 31 de octubre: comunidad y recuerdo del evento grande del mes.',
  material: '71 fotos del 31 de octubre en Drive (DSC08395–DSC08465). Elegir 10, edición natural, formato original.',
  copy: 'Lo del 31 de octubre no se nos olvida 🎃\n\nDisfraces, música en directo y un tardeo de los que se recuerdan. Gracias a todos los que lo hicisteis posible.\n\n¿Sales en alguna? Etiquétate 👇',
  cta: 'Etiquétate y comparte con quien vino contigo', hashtags: HT + ' #HalloweenArucas',
  pending_info: 'Comprobar que estas fotos son del tardeo de Halloween y si ya se publicó un carrusel el 1-2 nov (si es así, usar solo las fotos no publicadas).',
  attachments: HALLOWEEN.slice(0, 10) });
add({ key: 'plan-2026-1112-reel-ambiente', kind: 'reel', title: 'Reel · Ambiente 5mentarios (tardeo)', starts_at: iso('11-12', '20:30'), format: 'Reel 9:16 (12–15 s)',
  status: 'in_design', objective: 'Alcance: enseñar el ambiente del bar a quien aún no lo conoce.',
  material: 'Vídeos C0611 y C0618 (carpeta Heineken de Drive)',
  copy: 'Tardeo, música y los tuyos. Así se está en 5mentarios 🍻\n\nTe esperamos este finde en Arucas.',
  cta: 'Guárdalo para el finde', hashtags: HT,
  description: 'Montaje: 4–5 cortes rápidos al ritmo (barra, gente, música), texto en pantalla «Tardeo · Música · Los tuyos». Audio: tendencia animada sin letra explícita.',
  attachments: [F.vC0611, F.vC0618] });
cartelFinde('plan-2026-1112-cartel', '11-12', '11-13', '11-14');
storiesDia('plan-2026-1113-stories', '11-13', 'viernes 13 nov');
storiesDia('plan-2026-1114-stories', '11-14', 'sábado 14 nov');
carruselFotos('plan-2026-1116-fotos', '11-16', '13–14 nov');
add({ key: 'plan-2026-1117-tipos', kind: 'carousel', title: 'Carrusel · Tipos de personas en 5mentarios', starts_at: iso('11-17', '19:30'), format: 'Carrusel',
  status: 'in_review', objective: 'Comunidad y alcance: contenido para etiquetar a amigos.',
  material: 'Carrusel ya diseñado: carpeta «carrusel-tipos-de-personas» (1, 2, 6, 7.jpg) y ZIP completo en Drive.',
  copy: '¿Cuál eres tú? 👀\n\nEn 5mentarios hay de todo: el que llega el primero, el que no se va nunca, el que pide «la última»…\n\nEtiqueta a cada uno de tus amigos en su slide 😂',
  cta: 'Etiqueta a tus amigos en su slide', hashtags: HT,
  pending_info: 'Comprobar si este carrusel ya se publicó en octubre. Si ya salió, sustituir por el carrusel de «reglas».',
  attachments: [F.tipos1, F.tipos2, F.tipos6, F.tipos7, F.tiposZip] });
cartelFinde('plan-2026-1119-cartel', '11-19', '11-20', '11-21');
storiesDia('plan-2026-1120-stories', '11-20', 'viernes 20 nov');
storiesDia('plan-2026-1121-stories', '11-21', 'sábado 21 nov');
add({ key: 'plan-2026-1122-volcan-mesa', kind: 'post', title: 'Post · Del volcán a tu mesa (comida de Volcán y Cuor en 5mentarios)', starts_at: iso('11-22', '13:30'), format: 'Post 4:5',
  status: 'idea', objective: 'Recordar que se puede pedir comida de Volcán y Cuor sin moverse de la mesa.',
  material: 'Foto de una smash burger de Volcán en una mesa de 5mentarios (carpeta Volcan de Drive) — elegir',
  copy: 'Tú sigues con el concierto, el partido o la ronda. La cena llega sola 🍔\n\n1. Pides en la barra\n2. Volcán la hace al momento\n3. Te la llevamos a la mesa, aún humeando\n\nTambién las pizzas de Cuor di Pizza 🍕',
  cta: 'Pide en barra la próxima vez que vengas', hashtags: HT + ' #SmashBurger',
  pending_info: 'Elegir foto de la carpeta de Volcán y valorar publicarlo en colaboración con @volcansmashburger.' });
carruselFotos('plan-2026-1123-fotos', '11-23', '20–21 nov');
// Champions League · Jornada 5 (24 y 25 de noviembre, calendario oficial UEFA)
add({ key: 'plan-2026-1123-ucl-previa', kind: 'champions', title: 'Story · Esta semana vuelve la Champions (J5)', starts_at: iso('11-23', '18:00'), format: 'Story 9:16',
  status: 'in_design', requires_approval: true, objective: 'Que la gente sepa que la Champions se ve en 5mentarios.',
  material: 'Plantilla de portada Champions (champions-01-portada-jugadores.png / .psd)',
  copy: 'Pantalla: «Martes y miércoles, CHAMPIONS en 5mentarios» + partidos que pondremos + sticker de recordatorio',
  cta: 'Sticker «Recordarme»', hashtags: HT_FUT,
  pending_info: 'Qué partidos de la J5 se pondrán en pantalla y a qué hora.', attachments: [F.champPortada, F.champPortadaPsd] });
add({ key: 'plan-2026-1124-ucl', kind: 'champions', title: 'Stories Champions · Martes 24 nov (J5)', starts_at: iso('11-24', '17:00'), format: 'Stories (secuencia)',
  status: 'in_design', objective: 'Llenar la noche de Champions.', material: 'Plantilla de partido (champions-02 .png/.psd) a actualizar con los partidos del día',
  copy: 'Pantalla 1: partido(s) de hoy + hora (hora canaria)\nPantalla 2: pantalla grande y mesas · pide Volcán o Cuor desde la mesa\nPantalla 3: reacciones en directo / goles',
  cta: 'Ven a verlo con tu gente', hashtags: HT_FUT, pending_info: 'Partidos y horarios de la jornada 5 que se emiten en el bar.',
  attachments: [F.champPartido, F.champPartidoPsd] });
add({ key: 'plan-2026-1125-ucl', kind: 'champions', title: 'Stories Champions · Miércoles 25 nov (J5)', starts_at: iso('11-25', '17:00'), format: 'Stories (secuencia)',
  status: 'in_design', objective: 'Llenar la noche de Champions.', material: 'Plantilla de partido (champions-04 .png) a actualizar',
  copy: 'Pantalla 1: partido(s) de hoy + hora\nPantalla 2: encuesta «¿Quién gana?»\nPantalla 3: ambiente durante el partido',
  cta: 'Encuesta y ubicación', hashtags: HT_FUT, pending_info: 'Partidos y horarios de la jornada 5 que se emiten en el bar.', attachments: [F.champPartido2] });
cartelFinde('plan-2026-1126-cartel', '11-26', '11-27', '11-28');
add({ key: 'plan-2026-1127-blackfriday', kind: 'special_date', title: 'Black Friday (solo si hay promoción)', starts_at: iso('11-27', '10:00'), all_day: true, requires_approval: false, status: 'idea',
  objective: 'Decidir si se hace algo. Si no hay promoción, no se publica nada.', pending_info: '¿Hay alguna promoción para el Black Friday? Si no, eliminar este elemento.', assignee: 'owner' });
storiesDia('plan-2026-1127-stories', '11-27', 'viernes 27 nov');
storiesDia('plan-2026-1128-stories', '11-28', 'sábado 28 nov');
carruselFotos('plan-2026-1130-fotos', '11-30', '27–28 nov');

// ===================== DICIEMBRE =====================
add({ key: 'plan-2026-1201-carrusel-diciembre', kind: 'carousel', title: 'Carrusel · Programación de diciembre (fijar en el perfil)', starts_at: iso('12-01', '13:00'), deadline: '2026-11-27',
  format: 'Carrusel · fijado', platforms: ['instagram', 'whatsapp'], status: 'in_design',
  objective: 'Que todo el mes esté a la vista: fines de semana, Champions, Navidad y fin de año.',
  material: 'Carrusel de diciembre ya diseñado (según el equipo). NO se ha encontrado en la carpeta de Drive revisada: subirlo como versión 1.',
  copy: 'Diciembre en 5mentarios 🎄\n\nDesliza y apunta: fines de semana con música, Champions y las fechas grandes del mes.\n\nGuárdalo para tenerlo a mano 📌',
  cta: 'Guarda el post y comparte con tu grupo', hashtags: HT_NAV,
  pending_info: 'Subir el diseño del carrusel de diciembre y confirmar todas las fechas que aparecen en él.' });
add({ key: 'plan-2026-1202-reel-ambiente', kind: 'reel', title: 'Reel · Una noche en 5mentarios', starts_at: iso('12-02', '20:30'), format: 'Reel 9:16 (10–15 s)', status: 'pending_prep',
  objective: 'Alcance y ganas de venir el finde.', material: 'Vídeos C0572 y C0573 (carpeta Heineken de Drive)',
  copy: 'Lo mejor de la noche siempre empieza con un «¿vamos a 5mentarios?» 🍻', cta: 'Envíaselo a quien te lo diría', hashtags: HT,
  description: 'Cortes rápidos de barra, ambiente y música. Texto final: «Este finde, en Arucas».', attachments: [F.vC0572, F.vC0573] });
cartelFinde('plan-2026-1203-cartel', '12-03', '12-04', '12-05', { pending_info: 'Artistas y horarios del 4 y 5 dic. Puente (6 y 8 dic): ¿horario especial?' });
storiesDia('plan-2026-1204-stories', '12-04', 'viernes 4 dic');
storiesDia('plan-2026-1205-stories', '12-05', 'sábado 5 dic');
add({ key: 'plan-2026-1206-constitucion', kind: 'special_date', title: 'Día de la Constitución (festivo)', starts_at: iso('12-06', '10:00'), all_day: true, requires_approval: false, status: 'idea',
  objective: 'Fecha a tener en cuenta en el puente.', pending_info: 'Horario de apertura en el puente.', assignee: 'owner' });
carruselFotos('plan-2026-1207-fotos', '12-07', '4–5 dic');
add({ key: 'plan-2026-1208-inmaculada', kind: 'special_date', title: 'Inmaculada Concepción (festivo)', starts_at: iso('12-08', '10:00'), all_day: true, requires_approval: false, status: 'idea',
  objective: 'Festivo nacional: coincide con la Champions (J6).', pending_info: 'Horario de apertura.', assignee: 'owner' });
add({ key: 'plan-2026-1208-ucl', kind: 'champions', title: 'Stories Champions · Martes 8 dic (J6)', starts_at: iso('12-08', '17:00'), format: 'Stories (secuencia)', status: 'in_design',
  objective: 'Noche de Champions en festivo.', material: 'Plantilla de partido Champions a actualizar', copy: 'Pantalla 1: festivo + Champions en 5mentarios\nPantalla 2: partido(s) y hora\nPantalla 3: ambiente',
  cta: 'Ven con tu gente', hashtags: HT_FUT, pending_info: 'Partidos y horarios de la jornada 6 que se emiten.', attachments: [F.champPartido, F.champPartidoPsd] });
add({ key: 'plan-2026-1209-ucl', kind: 'champions', title: 'Stories Champions · Miércoles 9 dic (J6)', starts_at: iso('12-09', '17:00'), format: 'Stories (secuencia)', status: 'in_design',
  objective: 'Última noche de Champions del año.', material: 'Plantilla de partido Champions a actualizar', copy: 'Pantalla 1: «Última Champions del año»\nPantalla 2: partido(s) y hora\nPantalla 3: encuesta «¿Quién pasa?»',
  cta: 'Encuesta', hashtags: HT_FUT, pending_info: 'Partidos y horarios de la jornada 6 que se emiten.', attachments: [F.champPartido2] });
cartelFinde('plan-2026-1210-cartel', '12-10', '12-11', '12-12');
storiesDia('plan-2026-1211-stories', '12-11', 'viernes 11 dic');
storiesDia('plan-2026-1212-stories', '12-12', 'sábado 12 dic');
carruselFotos('plan-2026-1214-fotos', '12-14', '11–12 dic');
add({ key: 'plan-2026-1215-celebraciones', kind: 'post', title: 'Post · Tu quedada de Navidad en 5mentarios', starts_at: iso('12-15', '13:00'), format: 'Post 4:5 o carrusel', status: 'idea',
  objective: 'Captar grupos: cenas de empresa, quedadas y despedidas (ya se ofrece en la web: «Escríbenos por Instagram»).',
  material: 'Foto de grupo en el bar (DSC01927 / DSC01834 / DSC01847 / DSC01852 — elegir) + sello',
  copy: '¿Cena de empresa, quedada de amigos o despedida estas fiestas? 🎄\n\nEn 5mentarios tienes música, buen ambiente y la comida de Volcán y Cuor llegando a la mesa.\n\nEscríbenos por privado y lo organizamos.',
  cta: 'Escríbenos por DM para reservar', hashtags: HT_NAV,
  pending_info: '¿Hay condiciones especiales para grupos (reserva, menú, horario)? Si no, publicarlo tal cual sin precios.',
  attachments: [F.fDSC01927, F.fDSC01834, F.fDSC01847, F.fDSC01852] });
cartelFinde('plan-2026-1217-cartel', '12-17', '12-18', '12-19');
storiesDia('plan-2026-1218-stories', '12-18', 'viernes 18 dic');
storiesDia('plan-2026-1219-stories', '12-19', 'sábado 19 dic');
add({ key: 'plan-2026-1220-reel-navidad', kind: 'reel', title: 'Reel · 5mentarios se viste de Navidad', starts_at: iso('12-20', '20:00'), format: 'Reel 9:16', status: 'idea',
  objective: 'Ambiente navideño del local para animar a venir en fiestas.', material: 'Hay que grabarlo: decoración navideña del local (ver tarea).',
  copy: 'Ya huele a Navidad en Arucas 🎄✨\n\nNos vemos estas fiestas en 5mentarios.', cta: 'Comparte con tu grupo de las fiestas', hashtags: HT_NAV,
  pending_info: 'Grabar la decoración navideña cuando esté montada.' });
carruselFotos('plan-2026-1221-fotos', '12-21', '18–19 dic');
add({ key: 'plan-2026-1222-horarios-navidad', kind: 'story', title: 'Story fijada · Horarios de Navidad y fin de año', starts_at: iso('12-22', '12:00'), format: 'Story 9:16 + destacado', platforms: ['instagram', 'whatsapp'], status: 'idea',
  objective: 'Que nadie se quede en la puerta: horarios del 24, 25, 31 y 1.', copy: 'Pantalla: «Horarios de fiestas» 24 · 25 · 31 · 1 con apertura y cierre. Guardar en destacados.',
  cta: 'Guardar en destacados', pending_info: 'Horarios del 24, 25 y 31 de diciembre y 1 de enero.', assignee: 'marketing' });
cartelFinde('plan-2026-1223-cartel', '12-23', '12-25', '12-26', { title: 'Cartel de Navidad · 25–26 dic', pending_info: '¿Abre el 24 y el 25? Artistas/DJs y horarios del 25 y 26 dic.' });
add({ key: 'plan-2026-1224-nochebuena', kind: 'post', title: 'Post · Feliz Navidad de 5mentarios', starts_at: iso('12-24', '12:00'), format: 'Post 4:5', status: 'idea',
  objective: 'Felicitación y cercanía con la comunidad.', material: 'Diseño de felicitación con el sello 5mentarios (verde, negro y blanco)',
  copy: 'Desde 2002 brindando con vosotros 🍻🎄\n\nGracias por otro año de tardeos, conciertos y partidos. Feliz Navidad de parte de todo el equipo de 5mentarios.',
  cta: 'Comparte la felicitación', hashtags: HT_NAV, attachments: [F.sello] });
add({ key: 'plan-2026-1224-nochebuena-fecha', kind: 'special_date', title: 'Nochebuena', starts_at: iso('12-24', '10:00'), all_day: true, requires_approval: false, status: 'idea', assignee: 'owner', pending_info: 'Horario.' });
add({ key: 'plan-2026-1225-navidad-fecha', kind: 'special_date', title: 'Navidad', starts_at: iso('12-25', '10:00'), all_day: true, requires_approval: false, status: 'idea', assignee: 'owner', pending_info: 'Horario.' });
storiesDia('plan-2026-1226-stories', '12-26', 'sábado 26 dic');
carruselFotos('plan-2026-1228-fotos', '12-28', '25–26 dic');
add({ key: 'plan-2026-1229-reel-2026', kind: 'reel', title: 'Reel · Nuestro 2026 en 5mentarios', starts_at: iso('12-29', '20:00'), format: 'Reel 9:16 (20–30 s)', status: 'pending_prep',
  objective: 'Resumen del año: comunidad y orgullo de marca.', material: 'Vídeos C0611, C0618, C0572, C0573 + fotos de Halloween + fotos de los carruseles del finde',
  copy: 'Nuestro 2026 en 5mentarios 🎶⚽🎃🎄\n\nGracias por cada tardeo, cada concierto y cada gol cantado. Lo mejor está por venir.',
  cta: 'Etiqueta a quien ha estado contigo este año', hashtags: HT,
  description: 'Montaje cronológico, 1–2 s por plano, texto con los momentos del año. Cerrar con el sello y «Desde 2002».',
  attachments: [F.vC0611, F.vC0618, F.vC0572, F.vC0573, ...HALLOWEEN.slice(10, 14)] });
add({ key: 'plan-2026-1230-nochevieja-cartel', kind: 'weekly_poster', title: 'Cartel · Nochevieja / fin de año en 5mentarios', starts_at: iso('12-30', '13:00'), format: 'Post 4:5 + story', platforms: ['instagram', 'whatsapp'], status: 'idea',
  objective: 'Informar del plan de fin de año (solo si hay apertura especial).',
  copy: 'Despedimos el 2026 en 5mentarios 🥂\n\n[PLAN DE NOCHEVIEJA: horario, música, entradas si las hay]\n\nNos vemos para brindar.',
  cta: 'Escríbenos por DM para más info', hashtags: HT_NAV,
  pending_info: '¿Abre en Nochevieja / madrugada del 1? Horario, música y si hay entrada o reserva. Si no hay plan, cambiar por story de horarios.', assignee: 'marketing' });
add({ key: 'plan-2026-1231-nochevieja', kind: 'story', title: 'Stories · Último día del año', starts_at: iso('12-31', '12:00'), format: 'Stories (secuencia)', status: 'idea', requires_approval: false,
  objective: 'Acompañar el último día del año y felicitar el 2027.', copy: 'Pantalla 1: horario de hoy\nPantalla 2: ambiente\nPantalla 3 (00:00): «¡Feliz 2027! Gracias por este año» con el sello',
  pending_info: 'Horario del 31.' });
add({ key: 'plan-2026-1231-fecha', kind: 'special_date', title: 'Nochevieja', starts_at: iso('12-31', '10:00'), all_day: true, requires_approval: false, status: 'idea', assignee: 'owner', pending_info: 'Plan y horario.' });

// ---------- Tareas ----------
const T = (o) => ({ priority: 'medium', assignee: 'marketing', ...o });
const TASKS = [
  T({ title: 'Confirmar artistas y horarios del finde 13–14 nov', assignee: 'owner', priority: 'urgent', due_date: '2026-11-12', post: 'plan-2026-1112-cartel' }),
  T({ title: 'Confirmar artistas y horarios del finde 20–21 nov', assignee: 'owner', priority: 'high', due_date: '2026-11-17', post: 'plan-2026-1119-cartel' }),
  T({ title: 'Confirmar artistas y horarios del finde 27–28 nov', assignee: 'owner', priority: 'high', due_date: '2026-11-24', post: 'plan-2026-1126-cartel' }),
  T({ title: 'Confirmar artistas y horarios del finde 4–5 dic (y horario del puente)', assignee: 'owner', priority: 'high', due_date: '2026-12-01', post: 'plan-2026-1203-cartel' }),
  T({ title: 'Confirmar artistas y horarios del finde 11–12 dic', assignee: 'owner', priority: 'high', due_date: '2026-12-08', post: 'plan-2026-1210-cartel' }),
  T({ title: 'Confirmar artistas y horarios del finde 18–19 dic', assignee: 'owner', priority: 'high', due_date: '2026-12-15', post: 'plan-2026-1217-cartel' }),
  T({ title: 'Confirmar horarios de Navidad y fin de año (24, 25, 31 y 1)', assignee: 'owner', priority: 'high', due_date: '2026-12-15', post: 'plan-2026-1222-horarios-navidad' }),
  T({ title: 'Decidir si hay plan de Nochevieja', assignee: 'owner', priority: 'high', due_date: '2026-12-18', post: 'plan-2026-1230-nochevieja-cartel' }),
  T({ title: 'Decidir si hay promoción de Black Friday', assignee: 'owner', priority: 'low', due_date: '2026-11-20', post: 'plan-2026-1127-blackfriday' }),
  T({ title: 'Elegir 10 fotos del tardeo de Halloween y comprobar que no se publicaron', priority: 'urgent', due_date: '2026-11-12', post: 'plan-2026-1112-halloween-carrusel' }),
  T({ title: 'Montar reel de ambiente con C0611 y C0618', priority: 'high', due_date: '2026-11-12', post: 'plan-2026-1112-reel-ambiente' }),
  T({ title: 'Comprobar si «Tipos de personas» y «Reglas» ya se publicaron', priority: 'medium', due_date: '2026-11-16', post: 'plan-2026-1117-tipos' }),
  T({ title: 'Subir a Drive y a la app el carrusel de diciembre', priority: 'urgent', due_date: '2026-11-27', post: 'plan-2026-1201-carrusel-diciembre',
    description: 'No aparece en las carpetas de Drive revisadas. Subirlo como versión 1 de la publicación para que el propietario lo apruebe.' }),
  T({ title: 'Subir a Drive los carteles semanales de noviembre y diciembre', priority: 'high', due_date: '2026-11-18',
    description: 'No se han encontrado en Drive. Guardarlos en la categoría «Carteles semanales» de la biblioteca.' }),
  T({ title: 'Actualizar plantilla Champions con los partidos de la J5 (24–25 nov)', priority: 'high', due_date: '2026-11-22', post: 'plan-2026-1124-ucl' }),
  T({ title: 'Actualizar plantilla Champions con los partidos de la J6 (8–9 dic)', priority: 'high', due_date: '2026-12-06', post: 'plan-2026-1208-ucl' }),
  T({ title: 'Revisar si hay partidos grandes de Liga (Clásico, derbis) en nov–dic', priority: 'medium', due_date: '2026-11-16',
    description: 'Solo los partidos grandes llevan post o reel. Si hay alguno, añadirlo al calendario con su fecha oficial.' }),
  T({ title: 'Elegir foto de Volcán en mesa de 5mentarios', priority: 'low', due_date: '2026-11-20', post: 'plan-2026-1122-volcan-mesa' }),
  T({ title: 'Grabar la decoración navideña del local', priority: 'medium', due_date: '2026-12-18', post: 'plan-2026-1220-reel-navidad' }),
  T({ title: 'Montar el reel resumen «Nuestro 2026»', priority: 'medium', due_date: '2026-12-27', post: 'plan-2026-1229-reel-2026' }),
  T({ title: 'Compartir la carpeta de Drive con la cuenta de Google del propietario', priority: 'high', due_date: '2026-11-13',
    description: 'Para que el propietario vea fotos y vídeos dentro de la app, la carpeta «Grupo 5mentarios» debe estar compartida con su cuenta de Google.' })
];

// ---------- Biblioteca inicial (referencias a Drive, sin copiar archivos) ----------
const L = (f, category, notes) => ({ ...f, category, notes });
const LIBRARY = [
  ...HALLOWEEN.map((f) => L(f, 'eventos', 'Fotos del 31 oct (tardeo de Halloween, verificar)')),
  L(F.fDSC01927, 'fotografias', 'Carpeta Heineken'), L(F.fDSC01834, 'fotografias'), L(F.fDSC01847, 'fotografias'), L(F.fDSC01852, 'fotografias'),
  L(F.vC0611, 'videos', 'Ambiente del bar'), L(F.vC0618, 'videos', 'Ambiente del bar'), L(F.vC0572, 'videos', 'Ambiente del bar'), L(F.vC0573, 'videos', 'Ambiente del bar'),
  L(F.champPortada, 'champions', 'Plantilla portada'), L(F.champPortadaPsd, 'champions', 'PSD editable'), L(F.champPartido, 'champions', 'Plantilla partido'),
  L(F.champPartidoPsd, 'champions', 'PSD editable'), L(F.champPartido2, 'champions', 'Plantilla partido'),
  L(F.tipos1, 'carruseles', 'Tipos de personas'), L(F.tipos2, 'carruseles', 'Tipos de personas'), L(F.tipos6, 'carruseles', 'Tipos de personas'), L(F.tipos7, 'carruseles', 'Tipos de personas'),
  L(F.tiposZip, 'carruseles', 'Carrusel completo'), L(F.reglasZip, 'carruseles', 'Carrusel «reglas» completo'),
  L(F.sello, 'disenos', 'Logo sello (blanco)'), L(F.selloNegro, 'disenos', 'Logo sello (negro)'),
  L(F.cartelHalloween, 'anteriores', 'Cartel Halloween 31 oct')
];

export { PLAN, TASKS, LIBRARY };
