// PRODUCCIÓN DE DISEÑOS del plan de marketing (12 nov – 31 dic 2026).
// Cada entrada dice qué plantilla usar, con qué datos y si la información está COMPLETA.
//  - complete: true  → se genera el archivo final (PNG), se vincula a la publicación y se deja «Pendiente de aprobación».
//  - complete: false → se guarda el diseño editable como BORRADOR con los huecos [POR CONFIRMAR] (no se exporta ni se da por hecho).
//  - delivered       → ya existe un diseño entregado en el paquete de transferencia: no se rehace (hay que subirlo).
//  - video           → es un vídeo que hay que grabar: no se genera imagen.
// Clasificación de cada dato: C = confirmado (guía/UEFA), P = pendiente de confirmación, M = propuesta de marketing.
import { BRAND } from '../lib/brand.js';
const WA = BRAND.whatsapp;
const iso = (d, t) => `2026-${d}T${t}:00Z`;
const HT = '#Arucas #GranCanaria #TardeoGranCanaria #5mentarios #ArucasDeNoche #Heineken5mentarios #PlanesGranCanaria';

// ---------- Publicaciones nuevas de apoyo (propuestas de marketing) ----------
export const PLAN_EXTRA = [
  { key: 'p3-1126-soldout', kind: 'story', title: 'Story · Hoy Kike Pérez: SOLD OUT (y nueva fecha 03/12)', starts_at: iso('11-26', '12:00'), format: 'Story 9:16', status: 'in_design',
    objective: 'Agradecer el lleno y llevar a la gente a la nueva fecha.', copy: 'Story con sticker de enlace a WhatsApp para la nueva fecha.', cta: `Reserva la nueva fecha: WhatsApp ${WA}`, hashtags: '', info: 'M' },
  { key: 'p3-1207-ucl', kind: 'champions', title: 'Story · Esta semana, Champions en 5mentarios (J6)', starts_at: iso('12-07', '18:00'), format: 'Story 9:16', status: 'in_design',
    objective: 'Avisar de las noches de Champions de la semana.', copy: 'Martes 8 y miércoles 9 · CHAMPIONS · PANTALLA GRANDE · Volcán · Cuor di Pizza · te lo llevamos a la mesa', cta: 'Sticker «Recordarme»', hashtags: HT,
    pending_info: 'Qué partidos de la J6 se ponen y a qué hora (para las stories de cada día).', info: 'C' },
  { key: 'p3-1128-aniversario', kind: 'story', title: 'Story · Mañana, Tardeo pre Navidad (4º aniversario)', starts_at: iso('11-28', '12:00'), format: 'Story 9:16', status: 'in_design',
    objective: 'Recordatorio del aniversario.', copy: 'Sticker de cuenta atrás al domingo 29 a las 17:00.', cta: 'Sticker «Recordarme»', hashtags: '', info: 'C' },
  { key: 'p3-1129-hoy', kind: 'story', title: 'Stories · Hoy Tardeo pre Navidad · 4º aniversario', starts_at: iso('11-29', '11:00'), format: 'Story «Hoy» + directo', status: 'pending_prep',
    objective: 'Recordatorio del día y directo.', copy: 'HOY · 17:00 Cremita de Coco · 19:00 Yet Garbey.', cta: 'Ubicación + mención', hashtags: '', info: 'C' },
  { key: 'p3-1204-menus', kind: 'story', title: 'Story · Menús de Navidad para grupos', starts_at: iso('12-04', '13:30'), format: 'Story 9:16', status: 'in_design',
    objective: 'Apoyo al carrusel de menús.', copy: 'Story con enlace al carrusel y a WhatsApp.', cta: `Reservas ${WA}`, hashtags: '',
    pending_info: 'Precios y bebida de los menús [POR CONFIRMAR]: el propietario debe confirmarlos al aprobar.', info: 'P' },
  { key: 'p3-1215-celebraciones', kind: 'post', title: 'Post · Tu cena de grupo en 5mentarios', starts_at: iso('12-15', '13:00'), format: 'Post 1080×1350', status: 'in_design',
    objective: 'Captar grupos (cenas de empresa, amigos, despedidas). La web ya ofrece «escríbenos» para celebraciones.',
    copy: '¿Cena de empresa, quedada de amigos o despedida estas fiestas? 🎄\n\nEn 5mentarios tienes música, buen ambiente y la comida de Volcán y Cuor di Pizza llegando a la mesa.\n\nEscríbenos por WhatsApp y lo organizamos.',
    cta: `Reservas por WhatsApp ${WA}`, hashtags: HT + ' #NavidadEnArucas', info: 'M' },
  { key: 'p3-1216-quedada', kind: 'story', title: 'Story · Tu cena de grupo en 5mentarios', starts_at: iso('12-16', '12:30'), format: 'Story 9:16', status: 'in_design',
    objective: 'Apoyo al post de celebraciones.', copy: 'Story con sticker de enlace a WhatsApp.', cta: `Reservas ${WA}`, hashtags: '', info: 'M' },
  { key: 'p3-1225-feliz', kind: 'story', title: 'Story · Feliz Navidad', starts_at: iso('12-25', '11:00'), format: 'Story 9:16', status: 'in_design',
    objective: 'Felicitación en stories.', copy: 'Felicitación con el sello.', cta: '', hashtags: '', info: 'M' },
  { key: 'p3-1207-hoy', kind: 'story', title: 'Stories · lunes 7 · Willy Flores + DJ Asped', starts_at: iso('12-07', '12:30'), format: 'Story «Hoy» + directo', status: 'pending_prep',
    objective: 'Víspera del festivo: recordar el plan de esta noche.', copy: 'HOY · 22:30 Willy Flores · 00:00 DJ Asped. Directo mencionando al artista.', cta: 'Ubicación + mención', hashtags: '', info: 'C' },
  { key: 'p3-1220-tardeo-navidad', kind: 'weekly_poster', title: 'Cartel · Tardeo de Navidad (jueves 24)', starts_at: iso('12-20', '13:00'), format: 'Post 4:5 + story', platforms: ['instagram', 'whatsapp'], status: 'in_design',
    objective: 'Llenar el tardeo de Nochebuena.', copy: 'TARDEO DE NAVIDAD 🎄 en el exterior de 5mentarios\n\nJueves 24 de diciembre:\n16:30 · Son Aldea\n18:30 · Kilian Viera\n00:00 · DJ Ake (exterior, hasta las 04:00)\n00:00 · DJ Ruven (interior, hasta las 06:00)\n\n¿Con quién vienes? Etiquétalo 👇',
    cta: `Reservas por WhatsApp ${WA}`, hashtags: HT + ' #NavidadEnArucas', description: 'Canal de WhatsApp: 🎄 TARDEO DE NAVIDAD · Jue 24 · 16:30 Son Aldea · 18:30 Kilian Viera · 00:00 DJ Ake (ext.) · 00:00 DJ Ruven (int.)', info: 'C' },
  { key: 'p3-1224-hoy', kind: 'story', title: 'Stories · Hoy Tardeo de Navidad', starts_at: iso('12-24', '11:00'), format: 'Story «Hoy» + directo', status: 'pending_prep',
    objective: 'Recordatorio del día y directo.', copy: 'HOY · 16:30 Son Aldea · 18:30 Kilian Viera · 00:00 DJ Ake (exterior) · 00:00 DJ Ruven (interior).', cta: 'Ubicación + mención', hashtags: '', info: 'C' },
  { key: 'p3-1225-hoy', kind: 'story', title: 'Stories · Hoy DJ Asped desde las 23:00', starts_at: iso('12-25', '13:00'), format: 'Story «Hoy»', status: 'pending_prep',
    objective: 'Noche de Navidad.', copy: 'HOY · desde las 23:00 · DJ Asped.', cta: 'Ubicación + mención', hashtags: '', info: 'C' },
  { key: 'p3-1228-findeano', kind: 'weekly_poster', title: 'Cartel · Tardeo de Fin de Año (jueves 31)', starts_at: iso('12-28', '19:00'), format: 'Post 4:5 + story', platforms: ['instagram', 'whatsapp'], status: 'in_design',
    objective: 'Llenar el tardeo de fin de año.', copy: 'TARDEO DE FIN DE AÑO 🍇🎆 en el exterior de 5mentarios\n\nJueves 31 de diciembre:\n16:30 · Apolo\n18:30 · Cremita de Coco\n00:00 · DJ Ake (exterior, hasta las 04:00)\n00:00 · DJ Asped (interior, hasta las 06:00)\n\nDespedimos el 2026 juntos. ¿Con quién vienes? Etiquétalo 👇',
    cta: `Reservas por WhatsApp ${WA}`, hashtags: HT, description: 'Canal de WhatsApp: 🍇 TARDEO DE FIN DE AÑO · Jue 31 · 16:30 Apolo · 18:30 Cremita de Coco · 00:00 DJ Ake (ext.) · 00:00 DJ Asped (int.)', info: 'C' },
  { key: 'p3-1231-gracias', kind: 'post', title: 'Post · Gracias por este 2026', starts_at: iso('12-31', '13:00'), format: 'Post 1080×1350', status: 'in_design',
    objective: 'Cerrar el año con la comunidad.', copy: 'Gracias por cada tardeo, cada concierto, cada risa y cada gol cantado en 2026 🍻\n\nNos vemos en 2027 en 5mentarios, el punto de encuentro de Arucas desde 2002.',
    cta: 'Etiqueta a quien ha estado contigo este año 👇', hashtags: HT, info: 'M' }
];

const PC = '[POR CONFIRMAR]';
// ---------- Diseños por publicación ----------
export const DESIGNS = {
  // Completos (información confirmada) → archivo final
  'p2-1113-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'VIE 13.11', filas: '22:30 SON DIFERENTE\n00:00 DJ RUVEN' }, source: 'Guía §5.3: Vie 13 · Son Diferente 22:30 + DJ Ruven 00:00' },
  'p2-1123-ucl': { template: 'anuncio', format: 'story', complete: true, data: { kicker: 'CHAMPIONS LEAGUE', titulo: 'CHAMPIONS EN 5MENTARIOS', fecha: 'Martes 24 y miércoles 25', cuerpo: 'PANTALLA GRANDE\nVOLCÁN · CUOR DI PIZZA · TE LO LLEVAMOS A LA MESA', pill: 'RESERVA TU MESA', cta: `WHATSAPP ${WA}` }, source: 'UEFA J5 24–25 nov + guía (Champions 24 y 25 en el carrusel de noviembre)' },
  'p3-1207-ucl': { template: 'anuncio', format: 'story', complete: true, data: { kicker: 'CHAMPIONS LEAGUE', titulo: 'CHAMPIONS EN 5MENTARIOS', fecha: 'Martes 8 y miércoles 9', cuerpo: 'PANTALLA GRANDE\nVOLCÁN · CUOR DI PIZZA · TE LO LLEVAMOS A LA MESA', pill: 'RESERVA TU MESA', cta: `WHATSAPP ${WA}` }, source: 'UEFA J6 8–9 dic' },
  'p3-1126-soldout': { template: 'anuncio', format: 'story', complete: true, data: { kicker: 'MONÓLOGOS · KIKE PÉREZ', titulo: 'SOLD OUT', etiqueta: 'GRACIAS', fecha: 'Jueves 26 de noviembre', cuerpo: '¿TE HAS QUEDADO FUERA?\nNUEVA FECHA: JUEVES 3 DE DICIEMBRE', pill: 'RESERVA YA', cta: `RESERVAS ${WA}` }, source: 'Guía: 26/11 sold out, nueva fecha 03/12' },
  'p2-1127-aniversario': { template: 'anuncio', format: 'post', complete: true, data: { kicker: '4º ANIVERSARIO · 4 AÑOS DE TARDEOS', titulo: 'TARDEO PRE NAVIDAD', fecha: 'Domingo 29 de noviembre', cuerpo: '17:00 · CREMITA DE COCO\n19:00 · YET GARBEY', pill: 'DESDE LAS 17:00', cta: `RESERVAS ${WA}` }, source: 'Programación de noviembre confirmada por el propietario (12 nov)' },
  'p3-1128-aniversario': { template: 'anuncio', format: 'story', complete: true, data: { kicker: 'MAÑANA · 4º ANIVERSARIO', titulo: 'TARDEO PRE NAVIDAD', fecha: 'Domingo 29 de noviembre', cuerpo: '17:00 · CREMITA DE COCO\n19:00 · YET GARBEY', pill: 'DESDE LAS 17:00', cta: `RESERVAS ${WA}` }, source: 'Programación de noviembre confirmada por el propietario (12 nov)' },
  'p2-1204-navidad-menus': { template: 'navidad-menus', format: 'post', complete: true, data: {}, source: 'Guía §5.4 (precios y bebida [POR CONFIRMAR]: se confirman al aprobar)' },
  'p3-1204-menus': { template: 'anuncio', format: 'story', complete: true, data: { kicker: 'NAVIDAD EN GRUPO', titulo: 'MENÚS DE NAVIDAD', fecha: 'Cenas de grupo', cuerpo: 'MENÚ 1 · 25 €/PERSONA\nMENÚ 2 · 30 €/PERSONA\nMENÚ 3 · 38 €/PERSONA', pill: 'DESLIZA EN EL POST', cta: `RESERVAS ${WA}` }, source: 'Guía §5.4 (precios [POR CONFIRMAR])' },
  'p3-1215-celebraciones': { template: 'anuncio', format: 'post', complete: true, data: { kicker: 'NAVIDAD EN GRUPO', titulo: 'TU CENA DE GRUPO EN 5MENTARIOS', fecha: 'Esta Navidad', cuerpo: 'CENAS DE EMPRESA · AMIGOS · DESPEDIDAS\nVOLCÁN Y CUOR DI PIZZA A LA MESA', pill: 'ESCRÍBENOS POR WHATSAPP', cta: `RESERVAS ${WA}` }, source: 'Web del bar (celebraciones) + reservas por WhatsApp' },
  'p3-1216-quedada': { template: 'anuncio', format: 'story', complete: true, data: { kicker: 'NAVIDAD EN GRUPO', titulo: 'TU CENA DE GRUPO EN 5MENTARIOS', fecha: 'Esta Navidad', cuerpo: 'EMPRESA · AMIGOS · DESPEDIDAS', pill: 'ESCRÍBENOS', cta: `WHATSAPP ${WA}` }, source: 'Propuesta (apoyo al post)' },
  'p2-1224-feliz': { template: 'marca', format: 'post', complete: true, data: { titulo: 'FELIZ NAVIDAD', sub: 'DESDE 2002 · EL PUNTO DE ENCUENTRO DE ARUCAS' }, source: 'Propuesta de marketing (sin datos variables)' },
  'p3-1225-feliz': { template: 'marca', format: 'story', complete: true, data: { titulo: 'FELIZ NAVIDAD', sub: 'DE PARTE DE TODO EL EQUIPO DE 5MENTARIOS' }, source: 'Propuesta' },
  'p3-1231-gracias': { template: 'marca', format: 'post', complete: true, data: { titulo: 'GRACIAS POR ESTE 2026', sub: 'NOS VEMOS EN 2027 · HEINEKEN 5MENTARIOS' }, source: 'Propuesta' },

  'p3-1220-tardeo-navidad': { template: 'anuncio', format: 'post', complete: true, data: { kicker: 'JUEVES 24 · EXTERIOR', titulo: 'TARDEO DE NAVIDAD', fecha: 'Nochebuena en 5mentarios', cuerpo: '16:30 · SON ALDEA\n18:30 · KILIAN VIERA\n00:00–04:00 · DJ AKE (EXTERIOR)\n00:00–06:00 · DJ RUVEN (INTERIOR)', pill: 'DESDE LAS 16:30', cta: `RESERVAS ${WA}` }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p3-1228-findeano': { template: 'anuncio', format: 'story', complete: true, data: { kicker: 'JUEVES 31 · EXTERIOR', titulo: 'TARDEO DE FIN DE AÑO', fecha: 'Despedimos el 2026', cuerpo: '16:30 · APOLO\n18:30 · CREMITA DE COCO\n00:00–04:00 · DJ AKE (EXTERIOR)\n00:00–06:00 · DJ ASPED (INTERIOR)', pill: 'DESDE LAS 16:30', cta: `RESERVAS ${WA}` }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1204-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'VIE 04.12', filas: '22:30 APOLO\n00:00 DJ RUVEN' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1205-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'SÁB 05.12', filas: '22:30 SON ALDEA\n00:00 DJ ASPED' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p3-1207-hoy': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'LUN 07.12', filas: '22:30 WILLY FLORES\n00:00 DJ ASPED' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1211-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'VIE 11.12', filas: '22:30 YET GARBEY\n00:00 DJ AKE' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1212-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'SÁB 12.12', filas: '22:30 SON KARIBE\n00:00 DJ ASPED' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1218-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'VIE 18.12', filas: '22:30 PEDRO AFONSO\n00:00 DJ AKE' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1219-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'SÁB 19.12', filas: '22:30 CAFÉ DE LUNA\n00:00 DJ ASPED' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p3-1224-hoy': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'JUE 24.12', filas: '16:30 SON ALDEA\n18:30 KILIAN VIERA\n00:00 DJ AKE · EXTERIOR\n00:00 DJ RUVEN · INTERIOR' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p3-1225-hoy': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'VIE 25.12', filas: '23:00 DJ ASPED' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1226-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'SÁB 26.12', filas: '22:30 SAVIA NUEVA\n00:00 DJ RUVEN' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1231-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'JUE 31.12', filas: '16:30 APOLO\n18:30 CREMITA DE COCO\n00:00 DJ AKE · EXTERIOR\n00:00 DJ ASPED · INTERIOR' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1120-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'VIE 20.11', filas: '22:30 APOLO\n00:00 DJ ASPED' }, source: 'Programación de noviembre confirmada por el propietario (12 nov)' },
  'p2-1121-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'SÁB 21.11', filas: '22:30 SON ALDEA\n00:00 DJ AKE' }, source: 'Programación de noviembre confirmada por el propietario (12 nov)' },
  'p2-1127-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'VIE 27.11', filas: '22:30 ALBERTO DÉNIZ\n00:00 DJ AKE' }, source: 'Programación de noviembre confirmada por el propietario (12 nov)' },
  'p2-1128-stories': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'SÁB 28.11', filas: '22:30 SAVIA NUEVA\n00:00 DJ ASPED' }, source: 'Programación de noviembre confirmada por el propietario (12 nov)' },
  'p3-1129-hoy': { template: 'story-hoy', format: 'story', complete: true, data: { fecha: 'DOM 29.11', filas: '17:00 CREMITA DE COCO\n19:00 YET GARBEY' }, source: 'Programación de noviembre confirmada por el propietario (12 nov)' },
  // Incompletos → borrador editable con huecos (falta información)
  'p2-1118-prog': { template: 'programacion', format: 'post', complete: true, data: { titulo: 'ESTA SEMANA', filas: 'JUE 19 · 21:00 · MONÓLOGOS: SAÚL ROMERO\nVIE 20 · 22:30 · APOLO · 00:00 DJ ASPED\nSÁB 21 · 22:30 · SON ALDEA · 00:00 DJ AKE' }, source: 'Programación de noviembre confirmada por el propietario (12 nov)' },
  'p2-1125-prog': { template: 'programacion', format: 'post', complete: true, data: { titulo: 'ESTA SEMANA', filas: 'JUE 26 · SOLD OUT · KIKE PÉREZ\nVIE 27 · 22:30 · ALBERTO DÉNIZ · 00:00 DJ AKE\nSÁB 28 · 22:30 · SAVIA NUEVA · 00:00 DJ ASPED\nDOM 29 · 17:00 · TARDEO PRE NAVIDAD · 4º ANIVERSARIO' }, source: 'Programación de noviembre confirmada por el propietario (12 nov)' },
  'p2-1202-prog': { template: 'programacion', format: 'post', complete: true, data: { titulo: 'ESTA SEMANA', filas: 'JUE 3 · MONÓLOGOS · KIKE PÉREZ\nVIE 4 · 22:30 · APOLO · 00:00 DJ RUVEN\nSÁB 5 · 22:30 · SON ALDEA · 00:00 DJ ASPED\nLUN 7 · 22:30 · WILLY FLORES · 00:00 DJ ASPED' }, source: 'Programación de diciembre confirmada por el propietario (12 nov) (hora del monólogo sin confirmar: no se incluye)' },
  'p2-1209-prog': { template: 'programacion', format: 'post', complete: true, data: { titulo: 'ESTE FINDE', filas: 'VIE 11 · 22:30 · YET GARBEY · 00:00 DJ AKE\nSÁB 12 · 22:30 · SON KARIBE · 00:00 DJ ASPED' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1216-prog': { template: 'programacion', format: 'post', complete: true, data: { titulo: 'ESTE FINDE', filas: 'VIE 18 · 22:30 · PEDRO AFONSO · 00:00 DJ AKE\nSÁB 19 · 22:30 · CAFÉ DE LUNA · 00:00 DJ ASPED' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1223-prog': { template: 'programacion', format: 'post', complete: true, data: { titulo: 'NAVIDAD EN 5MENTARIOS', filas: 'JUE 24 · 16:30 · TARDEO DE NAVIDAD (EXTERIOR)\nVIE 25 · 23:00 · DJ ASPED\nSÁB 26 · 22:30 · SAVIA NUEVA · 00:00 DJ RUVEN' }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1230-prog': { template: 'anuncio', format: 'post', complete: true, data: { kicker: 'JUEVES 31 · EXTERIOR', titulo: 'TARDEO DE FIN DE AÑO', fecha: 'Despedimos el 2026', cuerpo: '16:30 · APOLO\n18:30 · CREMITA DE COCO\n00:00–04:00 · DJ AKE (EXTERIOR)\n00:00–06:00 · DJ ASPED (INTERIOR)', pill: 'DESDE LAS 16:30', cta: `RESERVAS ${WA}` }, source: 'Programación de diciembre confirmada por el propietario (12 nov)' },
  'p2-1222-horarios': { template: 'anuncio', format: 'story', complete: true, data: { kicker: 'FIESTAS EN 5MENTARIOS', titulo: 'HORARIOS DE FIESTAS', fecha: 'Guárdalo', cuerpo: '24 DIC · DESDE LAS 16:30 · TARDEO DE NAVIDAD\n25 DIC · DESDE LAS 23:00 · DJ ASPED\n31 DIC · DESDE LAS 16:30 · TARDEO DE FIN DE AÑO', pill: 'HASTA LAS 06:00 EN EL INTERIOR', cta: 'GUÁRDALO EN DESTACADOS' }, source: 'Programación de diciembre confirmada por el propietario (12 nov) (1 de enero sin confirmar: no se incluye)' },
  'p2-1201-diciembre': { template: 'anuncio', format: 'post', complete: false, missing: 'Programación completa de diciembre (y diseño del carrusel)', data: { kicker: 'PROGRAMACIÓN', titulo: 'DICIEMBRE EN 5MENTARIOS', fecha: 'Desliza y apunta', cuerpo: '[PROGRAMACIÓN POR CONFIRMAR]', pill: 'DESLIZA →', cta: 'GUÁRDALO PARA TENERLO A MANO' } },
  'p2-1124-ucl': { template: 'champions-partido', format: 'story', complete: false, missing: 'Partido, equipos y hora', data: { fecha: 'MARTES 24.11', local: '[EQUIPO LOCAL]', visitante: '[EQUIPO VISITANTE]', hora: '[HORA] H' } },
  'p2-1125-ucl': { template: 'champions-partido', format: 'story', complete: false, missing: 'Partido, equipos y hora', data: { fecha: 'MIÉRCOLES 25.11', local: '[EQUIPO LOCAL]', visitante: '[EQUIPO VISITANTE]', hora: '[HORA] H' } },
  'p2-1208-ucl': { template: 'champions-partido', format: 'story', complete: false, missing: 'Partido, equipos y hora', data: { fecha: 'MARTES 08.12', local: '[EQUIPO LOCAL]', visitante: '[EQUIPO VISITANTE]', hora: '[HORA] H' } },
  'p2-1209-ucl': { template: 'champions-partido', format: 'story', complete: false, missing: 'Partido, equipos y hora', data: { fecha: 'MIÉRCOLES 09.12', local: '[EQUIPO LOCAL]', visitante: '[EQUIPO VISITANTE]', hora: '[HORA] H' } },
  'p2-1116-fotos': { template: 'fotos-portada', format: 'post', complete: false, missing: 'Fotos del Tardeo Exterior del 14', data: { titulo: 'Así fue…', sub: 'EL TARDEO EXTERIOR EN 5MENTARIOS' } },
  'p2-1123-fotos': { template: 'fotos-portada', format: 'post', complete: false, missing: 'Fotos del finde 20–21', data: { titulo: 'Así fue…', sub: 'EL FINDE EN 5MENTARIOS' } },
  'p2-1130-fotos': { template: 'fotos-portada', format: 'post', complete: false, missing: 'Fotos del aniversario', data: { titulo: 'Así fue…', sub: '4 AÑOS DE TARDEOS' } },
  'p2-1207-fotos': { template: 'fotos-portada', format: 'post', complete: false, missing: 'Fotos del finde 4–5', data: { titulo: 'Así fue…', sub: 'EL FINDE EN 5MENTARIOS' } },
  'p2-1214-fotos': { template: 'fotos-portada', format: 'post', complete: false, missing: 'Fotos del finde 11–12', data: { titulo: 'Así fue…', sub: 'EL FINDE EN 5MENTARIOS' } },
  'p2-1221-fotos': { template: 'fotos-portada', format: 'post', complete: false, missing: 'Fotos del finde 18–19', data: { titulo: 'Así fue…', sub: 'EL FINDE EN 5MENTARIOS' } },
  'p2-1228-fotos': { template: 'fotos-portada', format: 'post', complete: false, missing: 'Fotos del finde de Navidad', data: { titulo: 'Así fue…', sub: 'LA NAVIDAD EN 5MENTARIOS' } }
};
// Diseños ya ENTREGADOS en el paquete (no se rehacen; hay que subirlos como versión 1)
export const DELIVERED = ['p2-1112-monologos-story', 'p2-1112-cuenta2', 'p2-1112-reel-halloween', 'p2-1112-carrusel-lineup', 'p2-1113-manana', 'p2-1114-hoy', 'p2-1117-saul', 'p2-1119-saul-story', 'p2-1123-kike', 'p2-1203-kike-story'];
