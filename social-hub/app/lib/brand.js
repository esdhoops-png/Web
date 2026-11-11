// Guía de marca de Heineken 5mentarios para el Social Hub.
// Fuente única: «00_TRANSFERENCIA_HEINEKEN_5MENTARIOS.md» (11 nov 2026). No se añade nada que no esté ahí.
// Lo que el documento marca como [POR CONFIRMAR] se mantiene así.

export const BRAND = {
  name: 'Heineken 5mentarios',
  instagram: '@heineken5mentarios',
  place: 'Arucas (Gran Canaria)',
  since: 'Desde 2002 (en el logo: EST. 2002)',
  claim: 'El punto de encuentro de Arucas.',
  whatsapp: '627 304 115',
  whatsappUrl: 'https://wa.me/34627304115',
  web: 'grupo5mentarios.com',
  group: '«Grupo 5mentarios» es la empresa de los tres locales (Heineken 5mentarios, Cuor di Pizza y Volcán Smash Burger), no el bar.',
  space: 'No tiene escenario; tiene balcón y terraza. Los tardeos son «en el interior» o «en el exterior» según la fecha.',
  audience: 'Gente de Arucas y del norte de Gran Canaria que sale de tardeo y de noche.',
  goal: 'Llenar el bar en tardeos, conciertos y partidos, y que la gente se vea en las fotos y las comparta.'
};

export const RULES = [
  'Colores: verde, negro y blanco. El logo de 5mentarios aparece siempre.',
  'Cada diseño se entrega como PNG + PSD con capas (cada texto en su propia capa).',
  'Los logos del Ayuntamiento de Arucas y COA nunca se recolorean: siempre en sus colores originales.',
  'No se usan personajes de terceros (películas, marcas…).',
  'Se escribe «Cuor di Pizza», nunca «Cuore».',
  'No se inventan precios, horarios ni artistas. Si falta un dato, se pregunta en una línea.',
  'Todas las horas son de Canarias.',
  'Español de Canarias, cercano y local. Emojis con moderación (2–4 por caption).',
  'Nada «infantil» ni «falso»: diseños con fuerza, de cartel de noche, y entregas rápidas.',
  'Todos los vídeos llevan al final la animación del logo, que cierra con @heineken5mentarios.'
];

export const DONTS = [
  'Diseños con aspecto «infantil» o «falso» (rechazados: tardeo exterior con focos verdes y estilo «Viva Club» de recortes).',
  'Fondos o paneles blancos detrás de los logos de colaboradores (solo el del Ayuntamiento lleva cajita blanca pequeña).',
  'Fotos de artistas en el cartel del tardeo del 14.',
  'Etiquetas temporales que ya no aplican (p. ej. «RETRASADO»).',
  'Personajes de terceros y logos recoloreados.',
  'Grabar la imagen de la tele en los partidos (Instagram puede silenciar el vídeo).'
];

export const WORKSTYLE = [
  'Entregar rápido y enseñar el resultado.',
  'Si algo no gusta, ajustar a partir de lo aprobado (p. ej. reutilizar el cartel de Halloween) en vez de proponer estilos nuevos.',
  'Cuando pida un cambio puntual, cambiar solo eso.'
];

export const COLORS = [
  { name: 'Verde principal (acento)', hex: '#2BB061', use: 'Horas, etiquetas, bandas «TARDEO EXTERIOR», pastillas' },
  { name: 'Verde oscuro (bloques)', hex: '#0B8A3E', use: 'Mitades de carteles de Champions, portadas de carrusel' },
  { name: 'Verde Heineken (referencia)', hex: '#00843D', use: 'Ficha de marca del planificador', pending: '¿Coincide con el verde del logo oficial?' },
  { name: 'Verde neón / rotulador', hex: '#7CFFB0', use: 'Fechas manuscritas, etiquetas ORGANIZA / COLABORAN' },
  { name: 'Verde web', hex: '#34C26B', use: 'Acento de la web grupo5mentarios.com' },
  { name: 'Negro', hex: '#0B0B0B', use: 'Fondos (también #050806 y #0A0F0C, negro verdoso)' },
  { name: 'Blanco roto', hex: '#F2EFE8', use: 'Titulares sobre negro (también #F1F0ED)' },
  { name: 'Gris', hex: '#9A9A9A', use: 'Pie «HEINEKEN 5MENTARIOS · ARUCAS»' },
  { name: 'Rojo (solo avisos)', hex: '#E0312E', use: 'Etiqueta «SOLD OUT»' },
  { name: 'Ámbar (solo web)', hex: '#F2A541', use: 'Escena de tardeo / sol en la web' }
];

export const FONTS = [
  { name: 'Anton', css: "'Anton', Impact, sans-serif", use: 'Titulares grandes en mayúsculas: MONÓLOGOS, HALLOWEEN, artistas, horas' },
  { name: 'Barlow Condensed (600–900)', css: "'Barlow Condensed', 'Arial Narrow', sans-serif", use: 'Subtítulos, fechas muy espaciadas (letter-spacing 4–12 px), pies, pastillas' },
  { name: 'Permanent Marker', css: "'Permanent Marker', cursive", use: 'Toques manuscritos: «Sábado 14 · Noviembre», pies de polaroid, «Así fue…»' },
  { name: 'Special Elite', css: "'Special Elite', monospace", use: 'Etiquetas pequeñas tipo máquina de escribir: ORGANIZA / COLABORAN' },
  { name: 'DM Sans + Fraunces (cursiva)', css: "'DM Sans', sans-serif", use: 'Solo en la web' }
];

export const LOGO = [
  'Sello circular «5MENTARIOS · Heineken · EST. 2002», en blanco y negro.',
  'Posts: arriba a la izquierda, ~100–110 px de ancho sobre lienzo de 1080.',
  'Stories: arriba y centrado, ~110–120 px.',
  'Vídeos: al cierre, grande y centrado con brillo verde.',
  'Sobre fondos oscuros, sombra suave (drop-shadow).'
];

export const STYLES = [
  { name: 'Cartel de noche', desc: 'Fondo negro o pared texturizada, brillo radial verde detrás del protagonista, titular enorme en Anton blanco con halo verde y horas en verde.' },
  { name: 'Monólogos (aprobado)', desc: 'Fondo negro liso, logo arriba izquierda, fecha «12/11» en verde arriba derecha, «MONÓLOGOS» gigante en Barlow Condensed 900 blanco roto, subtítulo verde muy espaciado («ESTE JUEVES · 12 DE NOVIEMBRE · 21:00»), foto del humorista recortada con resplandor verde, «JUE 12.11» en verde sobre el nombre, línea fina y pie «AFORO LIMITADO» / «RESERVAS 627 304 115».' },
  { name: 'Halloween / Tardeo (aprobado)', desc: 'Pared de textura con tira de polaroids arriba, degradado a negro, título en Anton con textura rugosa y halo verde, fecha en Permanent Marker verde neón, rejilla de 4 columnas hora (verde) + artista (blanco), banda inclinada −3° verde con borde negro («TARDEO EXTERIOR · DESDE LAS 16:00»), logos de colaboradores abajo sin panel blanco.' },
  { name: 'Carrusel line-up', desc: 'Polaroid girada con la foto del artista y cinta verde arriba; debajo hora en verde, nombre en blanco y banda «TARDEO EXTERIOR · …»; contador «2/5» arriba a la derecha.' },
  { name: 'Champions / partido', desc: 'Pantalla partida negro/verde con foto de cada equipo, círculo blanco «VS», etiqueta «PARTIDAZO» girada y pastillas «20:00 H», «PANTALLA GRANDE», «VOLCÁN · CUOR DI PIZZA · TE LO LLEVAMOS A LA MESA». Pie: «HEINEKEN 5MENTARIOS · ARUCAS — DESLIZA →».' },
  { name: 'Story animada «Hoy en 5mentarios»', desc: 'Fondo negro verdoso con rayos verdes girando y pastilla de fecha verde arriba derecha; escena «HOY», una escena por artista (hora gigante en contorno verde + nombre que entra de golpe), resumen con filas y «RESERVA TU MESA · WHATSAPP 627 304 115», cierre con la animación del logo. 11–17 s.' }
];

export const FORMATS = [
  { piece: 'Post / cartel', size: '1080×1350 (4:5)', notes: 'Logo arriba a la izquierda; pie «HEINEKEN 5MENTARIOS · ARUCAS»; «DESLIZA →» si es carrusel.' },
  { piece: 'Story', size: '1080×1920 (9:16)', notes: 'Texto importante entre y≈250 y y≈1700. Stickers: ubicación, mención del artista, cuenta atrás, encuesta, enlace a WhatsApp.' },
  { piece: 'Story animada / reel', size: '1080×1920, 30 fps, 11–27 s', notes: 'Cierre siempre con la animación del logo; sin música (el responsable pone el audio en tendencia). H.264 main 4.0, yuv420p, ~6 Mbps, AAC 44,1 kHz, faststart.' },
  { piece: 'Carrusel de fotos de la gente', size: 'Formato original', notes: 'Edición natural y limpia, sin recortar; pedir que se etiqueten.' }
];

export const PHRASES = [
  'Tardeo, música y los tuyos.',
  'Lo mejor de la noche siempre empieza con un «¿vamos a 5mentarios?»',
  'Tú pones los gritos, nosotros las cañas.',
  'Pide Volcán o Cuor y te lo llevamos a la mesa.',
  'Reserva tu mesa',
  '¿Con quién vienes? Etiquétalo 👇'
];

export const CTAS = [
  `Reserva por WhatsApp en el 627 304 115`,
  '¿Con quién vienes? Etiquétalo 👇',
  'Búscate en las fotos y etiquétate 📸'
];

export const HASHTAGS = {
  base: '#Arucas #GranCanaria #TardeoGranCanaria #5mentarios #ArucasDeNoche #Heineken5mentarios #MúsicaEnDirecto #PlanesGranCanaria #OcioGranCanaria',
  monologos: '#Arucas #GranCanaria #Monólogos #Humor #PlanesGranCanaria #JuevesDeRisas #Heineken5mentarios',
  fotos: '#Arucas #GranCanaria #MúsicaEnDirecto #NocheGranCanaria #Heineken5mentarios',
  finde: '#Arucas #GranCanaria #TardeoGranCanaria #5mentarios #ArucasDeNoche'
};

export const WEEKLY = [
  { day: 'Lunes', time: '13:00', what: 'Carrusel de fotos del finde (pedir que se etiqueten).' },
  { day: 'Miércoles', time: '12:00', what: 'Programación en post y en el canal de WhatsApp. Reel semanal de programación con personas hablando a cámara.' },
  { day: 'Jueves', time: '19:00', what: 'Reel colab con Volcán o reel de ambiente.' },
  { day: 'Viernes y sábado', time: '—', what: 'Stories de cuenta atrás y en directo con el artista mencionado (3–5 stories por noche).' },
  { day: 'Domingo', time: '17:00', what: 'Reel de tardeo en directo.' },
  { day: 'Siempre', time: '—', what: 'Repostear todas las menciones.' }
];
export const WEEKLY_GOALS = '4 piezas de feed, 2 reels y 5 días con stories. Artistas/DJs, días y horas confirmados antes del martes.';
export const PILLARS = [
  'Programación semanal (conciertos y DJs).',
  'Carruseles de fotos de la gente en el bar (edición natural, formato original).',
  'Tardeo.',
  'Partidos grandes: solo el Clásico y las Champions importantes llevan post o reel; el resto, solo stories.',
  'Comida a la mesa de Volcán Smash Burger y Cuor di Pizza.'
];

export const PEOPLE = {
  bands: ['Son Aldea', 'Café de Luna', 'Kilian Viera', 'Pedro Afonso', 'Havana 500', 'Apolo', 'Son Diferente', 'Cremita de Coco', 'Savia Nueva', 'Alberto Déniz', 'Son Karibe', 'Grupo Jaira'],
  djs: ['DJ Ake', 'DJ Asped', 'DJ Ruven'],
  comedians: ['Juan Antonio Cabrera', 'Saúl Romero', 'Kike Pérez']
};

export const RAFFLE_LEGAL = 'Solo mayores de 18 · Bebe con moderación · Instagram no patrocina ni administra este sorteo.';

export const PHOTO_RULES = [
  'Sin flash directo; luz cálida del local.',
  'Gente que quiera salir.',
  'Sin menores en fotos de barra o bebidas.',
  'Sin marcas ajenas en primer plano.'
];

export const PENDING = [
  'Horario de apertura habitual y dirección exacta.',
  'Precios de copas o entradas (salvo los menús de Navidad, también por confirmar).',
  'Si el verde oficial es #00843D o el #2BB061 de los carteles.',
  'Entrada de Kike Pérez (15 € según el planificador).',
  'Bebida incluida en los menús de Navidad y si los precios son definitivos.'
];
