// ESTRATEGIA DE MARKETING · Heineken 5mentarios · 12 nov – 31 dic 2026
// Fuentes: guía de transferencia de marca (11 nov 2026), web del bar, planificador «Centro de control»
// y calendario oficial UEFA. No se inventan datos de audiencia, resultados ni presupuesto.

export const PERIOD = { from: '2026-11-12', to: '2026-12-31' };

export const STRATEGY = {
  objetivosMarketing: [
    'Llenar el bar en las fechas fuertes ya confirmadas: monólogos (19/11 y 03/12), tardeo del 4º aniversario (29/11), noches de Champions (24–25/11 y 8–9/12), Tardeo de Navidad (24/12) y Tardeo de Fin de Año (31/12).',
    'Convertir la intención en reservas por WhatsApp (627 304 115), que es el canal de reserva de la casa.',
    'Captar grupos para Navidad (cenas de empresa, amigos, despedidas) con los menús de Navidad, una vez confirmados precios y bebida.',
    'Reforzar «Heineken 5mentarios» como el punto de encuentro de Arucas desde 2002, y la comida de Volcán y Cuor di Pizza servida en la mesa.'
  ],
  objetivosRedes: [
    'Cumplir el ritmo del planificador: 4 piezas de feed y 2 reels por semana, stories 5 días a la semana.',
    'Publicar la programación todos los miércoles (post + canal de WhatsApp) con artistas y horas confirmados antes del martes.',
    'Aumentar etiquetas y menciones con el carrusel de fotos de los lunes («búscate en las fotos y etiquétate») y repostear todas las menciones.',
    'Usar la Champions y el Clásico solo con piezas grandes cuando el partido lo merece; el resto, stories.'
  ],
  posicionamiento: 'Bar de copas, tardeo, conciertos y DJs en Arucas desde 2002. «El punto de encuentro de Arucas». Se viene a ver música en directo, partidos grandes y a celebrar con los tuyos; la cena de Volcán o Cuor di Pizza llega a la mesa.',
  personalidad: 'Cercano, de colegas, local (español de Canarias), con gracia pero sin chiste fácil. Estética de cartel de noche: negro, verde y blanco, con fuerza; nada infantil ni falso.',
  publico: 'Gente de Arucas y del norte de Gran Canaria que sale de tardeo y de noche (según la guía). Grupos de amigos y empresas en Navidad. Sin datos de audiencia disponibles: no se estiman edades ni volúmenes.',
  pilares: [
    'Programación semanal (conciertos y DJs).', 'Monólogos (mes del humor).', 'Tardeo.', 'Partidos grandes: Champions y Clásico.',
    'Fotos de la gente (comunidad).', 'Comida a la mesa: Volcán Smash Burger y Cuor di Pizza.', 'Navidad y fin de año.'
  ],
  tono: 'Frases cortas, primera persona del plural («te lo llevamos a la mesa»), 2–4 emojis por caption, CTA claro (reservar por WhatsApp, etiquetar, búscate en las fotos). Frases de la casa: «Tardeo, música y los tuyos», «Tú pones los gritos, nosotros las cañas».',
  frecuencia: [
    ['Lunes 13:00', 'Carrusel de fotos del finde'], ['Miércoles 12:00', 'Programación (post + canal de WhatsApp) y reel de programación'],
    ['Jueves 19:00', 'Reel colab con Volcán o de ambiente'], ['Viernes y sábado', 'Story «Hoy en 5mentarios» + 3–5 stories en directo'],
    ['Domingo 17:00', 'Reel de tardeo en directo (solo si hay tardeo)'], ['Siempre', 'Repostear menciones']
  ],
  horas: 'Las horas de publicación son las del planificador de la casa (no hay métricas de mejor hora disponibles en la app). Cuando haya estadísticas de Instagram se ajustarán.',
  stories: 'Cada pieza de feed lleva su story de apoyo. Días de evento: story «Hoy» por la mañana + directo por la noche mencionando al artista + repost de menciones. Cuenta atrás con sticker en eventos grandes. Texto entre y≈250 y y≈1700.',
  reels: 'Dos por semana: programación con personas del equipo a cámara (miércoles) y colab Volcán o ambiente (jueves). Planos de menos de 2 s, gancho en el primer segundo, sin música (el audio en tendencia lo pone el responsable) y cierre con la animación del logo.',
  carruseles: 'Fotos de la gente cada lunes (formato original, edición natural), carrusel mensual fijado (programación de diciembre) y menús de Navidad. Portada con estilo de cartel de noche y «DESLIZA →».',
  carteles: 'Programación semanal y avisos (Champions, aniversario, sold out, Navidad) con la plantilla «cartel de noche»: fondo negro, brillo verde, Anton con halo, fecha manuscrita en verde neón. Promociones solo cuando el propietario las aprueba.',
  deportes: 'Champions J5 (24–25 nov) y J6 (8–9 dic) según UEFA: story de aviso esa semana + stories el día del partido («Hoy · hora · pantalla grande», encuesta «¿Quién gana?», «Todavía estás a tiempo + cena con Volcán»). Los partidos que se emiten y sus horas se confirman antes de diseñarlos. No grabar la imagen de la tele.',
  navidad: 'Del 1 al 23 de diciembre: grupos (menús de Navidad y quedadas). Del 20 al 31: Tardeo de Navidad (jue 24, exterior, desde las 16:30) y Tardeo de Fin de Año (jue 31, exterior, desde las 16:30) con cartel, story de horarios y stories «Hoy»; DJ Asped el 25 desde las 23:00; felicitación y resumen del año. Nada se publica sin aprobación del propietario.',
  interaccion: [
    'Pedir siempre que etiqueten a con quién vienen y que se busquen en las fotos.', 'Encuestas en stories los días de partido.',
    'Story de cuenta atrás con «Recordarme» en los eventos grandes.', 'Repostear todas las menciones (comunidad).',
    'Publicar en colaboración con Volcán, Cuor di Pizza y los artistas para llegar a sus seguidores.', 'Canal de WhatsApp con la programación cada miércoles.'
  ]
};

// Campañas. `keys` = publicaciones del plan que pertenecen a cada campaña (prefijos de import_key).
export const CAMPAIGNS = [
  { id: 'humor', name: 'Mes del humor', from: '2026-11-12', to: '2026-12-03',
    objetivo: 'Llenar el aforo de los monólogos y vender la nueva fecha de Kike Pérez.', mensaje: 'Este jueves nos echamos unas risas en 5mentarios.',
    publico: 'Seguidores y público local que busca plan de jueves.', canales: ['Instagram (post + stories)', 'Canal de WhatsApp'],
    piezas: ['Post y story por humorista (entregados)', 'Story «Sold out» del 26/11', 'Stories «Hoy»'],
    kpis: ['Reservas por WhatsApp recibidas para cada monólogo', 'Aforo completo (sí/no)', 'Respuestas y menciones en stories'],
    keys: ['p2-1112-monologos', 'p2-1117-saul', 'p2-1119-saul', 'p2-1123-kike', 'p2-1126-kike', 'p3-1126-soldout', 'p2-1203-kike'] },
  { id: 'tardeo-exterior', name: 'Tardeo Exterior Halloween (cierre)', from: '2026-11-12', to: '2026-11-16',
    objetivo: 'Último empujón al tardeo del sábado 14 y aprovechar sus fotos.', mensaje: '¿Y ahora te vas a perder el Tardeo Exterior?',
    publico: 'Público de Halloween y de Arucas.', canales: ['Instagram (reel, carrusel, stories)', 'Canal de WhatsApp'],
    piezas: ['Reel Halloween → tardeo (entregado)', 'Carrusel line-up (entregado)', 'Cuenta atrás (entregada)', 'Carrusel de fotos del lunes 16'],
    kpis: ['Asistencia el sábado 14 (registro del local)', 'Etiquetas en el carrusel de fotos', 'Reproducciones del reel'],
    keys: ['p2-1112-reel-halloween', 'p2-1112-carrusel-lineup', 'p2-1112-cuenta2', 'p2-1113-manana', 'p2-1114', 'p2-1116-fotos'] },
  { id: 'finde', name: 'Finde en 5mentarios (siempre activa)', from: '2026-11-12', to: '2026-12-31',
    objetivo: 'Que cada semana se sepa quién toca y se reserve mesa.', mensaje: 'Este finde en 5mentarios 🍻',
    publico: 'Gente que sale de tardeo y de noche en Arucas y el norte.', canales: ['Instagram', 'Canal de WhatsApp', 'Web grupo5mentarios.com'],
    piezas: ['Programación de los miércoles', 'Stories «Hoy» viernes y sábado', 'Carrusel de fotos de los lunes', 'Reel de programación'],
    kpis: ['Publicaciones de programación hechas a tiempo (miércoles)', 'Mensajes de reserva por WhatsApp', 'Etiquetas en carruseles de fotos'],
    keys: ['p2-1113-noche', 'p2-1113-stories', 'p3-1207-hoy', 'p2e-1204', 'p2e-1205', 'p2e-1207', 'p2e-1211', 'p2e-1212', 'p2e-1218', 'p2e-1219', 'p2e-1226', 'p2-1118', 'p2-1120', 'p2-1121', 'p2-1123-fotos', 'p2-1125-prog', 'p2-1125-reel', 'p2-1127-stories', 'p2-1128-stories', 'p2-1130', 'p2-1202', 'p2-1204-stories', 'p2-1205', 'p2-1207', 'p2-1209-prog', 'p2-1209-reel', 'p2-1211', 'p2-1212', 'p2-1214', 'p2-1216', 'p2-1218', 'p2-1219', 'p2-1221', 'p2-1226', 'p2-1228'] },
  { id: 'champions', name: 'Champions en pantalla grande', from: '2026-11-23', to: '2026-12-09',
    objetivo: 'Llenar las noches de Champions con cena de Volcán y Cuor di Pizza en la mesa.', mensaje: 'Champions en 5mentarios · pantalla grande.',
    publico: 'Aficionados al fútbol de Arucas y alrededores.', canales: ['Instagram stories', 'Canal de WhatsApp'],
    piezas: ['Story de aviso J5 y J6', 'Stories de partido (cuando se confirmen partidos y horas)'],
    kpis: ['Mesas ocupadas en las noches de partido (registro del local)', 'Votos en la encuesta «¿Quién gana?»'],
    keys: ['p2-1123-ucl', 'p2-1124-ucl', 'p2-1125-ucl', 'p3-1207-ucl', 'p2-1208-ucl', 'p2-1209-ucl'] },
  { id: 'aniversario', name: '4 años de tardeos', from: '2026-11-25', to: '2026-11-30',
    objetivo: 'Convertir el aniversario en el tardeo más lleno del mes.', mensaje: '4 años de tardeos: tardeo, música y los tuyos.',
    publico: 'Comunidad del tardeo y clientes habituales.', canales: ['Instagram (post, stories, reel)', 'Canal de WhatsApp'],
    piezas: ['Post «save the date»', 'Story de apoyo', 'Reel en directo', 'Carrusel de fotos del lunes 30'],
    kpis: ['Asistencia el domingo 29', 'Etiquetas y menciones del día'],
    keys: ['p2-1127-aniversario', 'p3-1128-aniversario', 'p2-1129', 'p2-1130-fotos'] },
  { id: 'navidad-grupos', name: 'Navidad en grupo', from: '2026-12-01', to: '2026-12-23',
    objetivo: 'Reservas de cenas de grupo con los menús de Navidad.', mensaje: 'Esta Navidad, la cena del grupo es en 5mentarios.',
    publico: 'Empresas, grupos de amigos y despedidas de Arucas y el norte.', canales: ['Instagram (carrusel fijado, post, stories)', 'Canal de WhatsApp'],
    piezas: ['Carrusel de diciembre fijado', 'Carrusel de menús (4 diapositivas)', 'Story de menús', 'Post y story «Tu cena de grupo»'],
    kpis: ['Reservas de grupo por WhatsApp', 'Guardados del carrusel de menús'],
    keys: ['p2-1201-diciembre', 'p2-1204-navidad', 'p3-1204-menus', 'p3-1215-celebraciones', 'p3-1216-quedada'] },
  { id: 'fiestas', name: 'Fiestas y fin de año', from: '2026-12-20', to: '2026-12-31',
    objetivo: 'Llenar el Tardeo de Navidad (24) y el Tardeo de Fin de Año (31), informar de horarios y cerrar el año con la comunidad.', mensaje: 'Navidad y fin de año, en el exterior de 5mentarios.',
    publico: 'Toda la comunidad.', canales: ['Instagram', 'Canal de WhatsApp'],
    piezas: ['Cartel del Tardeo de Navidad (24)', 'Cartel del Tardeo de Fin de Año (31)', 'Story fijada de horarios', 'Stories «Hoy» del 24, 25 y 31', 'Post y story de Feliz Navidad', 'Reel «Nuestro 2026»', 'Post «Gracias por este 2026»'],
    kpis: ['Interacciones en la felicitación', 'Reproducciones del reel resumen'],
    keys: ['p2-1222', 'p2-1223', 'p2-1224', 'p3-1225', 'p2-1225', 'p2-1229', 'p2-1230', 'p2-1231', 'p3-1231', 'p3-1220', 'p3-1224', 'p3-1228', 'p2e-1224', 'p2e-1225', 'p2e-1231'] },
  { id: 'mesa', name: 'Volcán y Cuor di Pizza a la mesa', from: '2026-11-12', to: '2026-12-31',
    objetivo: 'Recordar que la cena llega a la mesa (más gasto por visita).', mensaje: 'Pide Volcán o Cuor di Pizza y te lo llevamos a la mesa.',
    publico: 'Clientes del bar en partidos, conciertos y tardeos.', canales: ['Reels en colaboración con @volcansmashburger'],
    piezas: ['Reels de los jueves (POV «la pides en el 5mentarios»)'],
    kpis: ['Pedidos de Volcán/Cuor servidos en el bar (registro del local)', 'Alcance de los reels colab'],
    keys: ['p2-1119-reel', 'p2-1126-reel', 'p2-1203-reel', 'p2-1210-reel', 'p2-1217-reel', 'p2-1112-reel-ambiente'] }
];
export const campaignOf = (key) => (key ? CAMPAIGNS.find((c) => c.keys.some((k) => key.startsWith(k))) : null);
