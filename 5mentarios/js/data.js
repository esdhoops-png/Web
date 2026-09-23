/* =============================================================
   HEINEKEN 5MENTARIOS — CONTENIDO EDITABLE
   -------------------------------------------------------------
   Todo lo que cambia a menudo está aquí: datos del local,
   programación de hoy, eventos, partidos, artistas, galería e
   Instagram. No hace falta tocar el HTML ni el CSS.

   · Los valores entre corchetes, como "[DIRECCIÓN]", son
     PLACEHOLDERS: la web los detecta y muestra un aviso en lugar
     de un enlace roto. Sustitúyelos por los datos reales.
   · Fechas en formato "AAAA-MM-DD" y horas en "HH:MM" (24 h).
   · Imágenes: rutas relativas a /img. Para cambiar una foto,
     sustituye el archivo manteniendo el mismo nombre.
   ============================================================= */

window.SITE = {

  /* ---------- DATOS DEL LOCAL ---------- */
  config: {
    name: 'Heineken 5mentarios',
    address: '[DIRECCIÓN]',            // ej.: 'Calle Mayor, 5 · 35000 Ciudad'
    hours: '[HORARIO]',                // ej.: 'Jue–Dom · 17:00 – 04:00'
    phone: '[TELÉFONO]',               // ej.: '+34 600 000 000'
    whatsapp: '[WHATSAPP]',            // solo números con prefijo: '34600000000'
    instagramHandle: '[INSTAGRAM]',    // ej.: '@5mentarios'
    instagramUrl: '[URL INSTAGRAM]',   // ej.: 'https://www.instagram.com/5mentarios/'
    mapsUrl: '[URL GOOGLE MAPS]',      // enlace "Cómo llegar" de Google Maps

    heroVideo: null,                   // ej.: 'img/hero.mp4' (vídeo sin sonido en bucle). null = usa hero.jpg
    sound: null,                       // ej.: 'audio/ambiente.mp3'. null = el botón PLAY SOUND avisa de que no hay audio

    /* Integraciones preparadas (dejar en null hasta tenerlas) */
    reservationEndpoint: null,         // URL que recibe el formulario en POST (JSON). null = solo confirmación en pantalla
    matchesApiUrl: null                // URL de una API de partidos. null = usa la lista "matches" de abajo
  },

  /* ---------- ¿QUÉ PASA HOY? (programación de ejemplo) ---------- */
  today: {
    label: 'Programación de ejemplo',
    items: [
      { time: '17:00', title: 'Tardeo',     type: 'tardeo', target: '#tardeo' },
      { time: '20:00', title: 'Fútbol',     type: 'futbol', target: '#futbol' },
      { time: '22:30', title: 'Live music', type: 'live',   target: '#musica' },
      { time: '00:00', title: 'DJ set',     type: 'dj',     target: '#eventos' }
    ]
  },

  /* ---------- EVENTOS ----------
     type: 'tardeo' | 'futbol' | 'live' | 'dj' | 'fiesta'
     matchId: solo en eventos de fútbol, enlaza con un partido de "matches"
     reserveUrl: enlace externo de reserva (opcional). Si falta, abre el formulario de la web. */
  events: [
    { id: 'friday-night', date: '2026-09-25', time: '23:30', name: 'Friday Night', artist: 'DJ [NOMBRE]',
      type: 'dj', image: 'img/evento-01.jpg',
      description: 'Arranca el fin de semana. Sesión de DJ hasta el cierre.', reserveUrl: '' },
    { id: 'live-session', date: '2026-09-26', time: '21:00', name: 'Live Session', artist: '[ARTISTA / BANDA]',
      type: 'live', image: 'img/evento-02.jpg',
      description: 'Música en directo para empezar la noche del sábado.', reserveUrl: '' },
    { id: 'tardeo-domingo', date: '2026-09-27', time: '17:00', name: 'Tardeo 5mentarios', artist: 'DJ residente [NOMBRE]',
      type: 'tardeo', image: 'img/evento-03.jpg',
      description: 'La tarde del domingo con música, copas y amigos.', reserveUrl: '' },
    { id: 'matchday-1', date: '2026-09-30', time: '21:00', name: 'Matchday', artist: 'Equipo A vs Equipo B',
      type: 'futbol', matchId: 'm2', image: 'img/evento-04.jpg',
      description: 'Partido en pantalla grande. Llega antes y coge buen sitio.', reserveUrl: '' },
    { id: 'noche-5mentarios', date: '2026-10-02', time: '00:00', name: 'Noche 5mentarios', artist: 'DJs [NOMBRES]',
      type: 'fiesta', image: 'img/evento-05.jpg',
      description: 'La fiesta de la casa. Hasta última hora.', reserveUrl: '' },
    { id: 'matchday-2', date: '2026-10-03', time: '16:15', name: 'Matchday + Tardeo', artist: 'Equipo C vs Equipo D',
      type: 'futbol', matchId: 'm3', image: 'img/evento-06.jpg',
      description: 'Partido de tarde y, al pitido final, arranca el tardeo.', reserveUrl: '' },
    { id: 'tardeo-acustico', date: '2026-10-04', time: '17:30', name: 'Tardeo acústico', artist: '[ARTISTA]',
      type: 'tardeo', image: 'img/evento-07.jpg',
      description: 'Tardeo con música en directo en formato acústico.', reserveUrl: '' },
    { id: 'closing-set', date: '2026-10-09', time: '01:00', name: 'Late Set', artist: 'DJ [NOMBRE]',
      type: 'dj', image: 'img/evento-08.jpg',
      description: 'Para los que no se quieren ir.', reserveUrl: '' }
  ],

  /* ---------- PARTIDOS (datos de ejemplo, no son partidos reales) ----------
     El estado (PRÓXIMO / EN DIRECTO / FINALIZADO) se calcula solo con la fecha y la hora.
     Puedes forzarlo con status: 'proximo' | 'directo' | 'finalizado'.
     crest: ruta a la imagen del escudo (opcional). Si falta, se dibuja un escudo con las iniciales. */
  matches: [
    { id: 'm1', competition: 'Liga', date: '2026-09-23', time: '21:00',
      home: { name: 'Equipo A', short: 'EQA', crest: '' }, away: { name: 'Equipo B', short: 'EQB', crest: '' } },
    { id: 'm2', competition: 'Champions League', date: '2026-09-30', time: '21:00',
      home: { name: 'Equipo A', short: 'EQA', crest: '' }, away: { name: 'Equipo B', short: 'EQB', crest: '' } },
    { id: 'm3', competition: 'Liga', date: '2026-10-03', time: '16:15',
      home: { name: 'Equipo C', short: 'EQC', crest: '' }, away: { name: 'Equipo D', short: 'EQD', crest: '' } },
    { id: 'm4', competition: 'Copa', date: '2026-10-07', time: '19:00',
      home: { name: 'Equipo E', short: 'EQE', crest: '' }, away: { name: 'Equipo F', short: 'EQF', crest: '' } },
    { id: 'm0', competition: 'Liga', date: '2026-09-20', time: '18:30',
      home: { name: 'Equipo G', short: 'EQG', crest: '' }, away: { name: 'Equipo H', short: 'EQH', crest: '' } }
  ],

  /* ---------- MÚSICA EN DIRECTO ---------- */
  artists: [
    { name: '[ARTISTA 01]', genre: '[Género]', eventId: 'live-session',    image: 'img/artista-01.jpg' },
    { name: '[DJ 01]',      genre: '[Género]', eventId: 'friday-night',    image: 'img/artista-02.jpg' },
    { name: '[ARTISTA 02]', genre: '[Género]', eventId: 'tardeo-acustico', image: 'img/artista-03.jpg' },
    { name: '[DJ 02]',      genre: '[Género]', eventId: 'closing-set',     image: 'img/artista-04.jpg' }
  ],

  /* ---------- GALERÍA ----------
     size: 'tall' (vertical) | 'wide' (horizontal) | 'square' | 'big' */
  gallery: [
    { image: 'img/gallery-01.jpg', tag: '#NIGHT',       size: 'big',    alt: 'Imagen de ejemplo de la noche en el local' },
    { image: 'img/gallery-02.jpg', tag: '#TARDEO',      size: 'wide',   alt: 'Imagen de ejemplo de un tardeo' },
    { image: 'img/gallery-03.jpg', tag: '#LIVE',        size: 'square', alt: 'Imagen de ejemplo de música en directo' },
    { image: 'img/gallery-04.jpg', tag: '#5MENTARIOS',  size: 'tall',   alt: 'Imagen de ejemplo de una sesión de DJ' },
    { image: 'img/gallery-05.jpg', tag: '#FÚTBOL',      size: 'wide',   alt: 'Imagen de ejemplo de un partido en pantalla' },
    { image: 'img/gallery-06.jpg', tag: '#TARDEO',      size: 'square', alt: 'Imagen de ejemplo de amigos en el tardeo' },
    { image: 'img/gallery-07.jpg', tag: '#NIGHT',       size: 'tall',   alt: 'Imagen de ejemplo de la pista de noche' },
    { image: 'img/gallery-08.jpg', tag: '#LIVE',        size: 'wide',   alt: 'Imagen de ejemplo de un concierto' },
    { image: 'img/gallery-09.jpg', tag: '#5MENTARIOS',  size: 'square', alt: 'Imagen de ejemplo del ambiente' },
    { image: 'img/gallery-10.jpg', tag: '#FÚTBOL',      size: 'tall',   alt: 'Imagen de ejemplo viendo el fútbol' }
  ],

  /* ---------- TARDEO ---------- */
  tardeo: {
    time: '[HORARIO TARDEO]',          // ej.: 'Sábados y domingos desde las 17:00'
    food: '[COMIDA: indicar si hay]',  // ej.: 'Tapas y raciones' — déjalo vacío ('') para ocultarlo
    photos: [
      { image: 'img/tardeo-01.jpg', alt: 'Imagen de ejemplo del tardeo' },
      { image: 'img/tardeo-02.jpg', alt: 'Imagen de ejemplo de copas al atardecer' },
      { image: 'img/tardeo-03.jpg', alt: 'Imagen de ejemplo de amigos en el tardeo' },
      { image: 'img/tardeo-04.jpg', alt: 'Imagen de ejemplo de música en el tardeo' }
    ]
  },

  /* ---------- INSTAGRAM (sustituir por publicaciones reales) ---------- */
  instagram: [
    { image: 'img/insta-01.jpg', alt: 'Publicación de ejemplo de Instagram', url: '' },
    { image: 'img/insta-02.jpg', alt: 'Publicación de ejemplo de Instagram', url: '' },
    { image: 'img/insta-03.jpg', alt: 'Publicación de ejemplo de Instagram', url: '' },
    { image: 'img/insta-04.jpg', alt: 'Publicación de ejemplo de Instagram', url: '' },
    { image: 'img/insta-05.jpg', alt: 'Publicación de ejemplo de Instagram', url: '' },
    { image: 'img/insta-06.jpg', alt: 'Publicación de ejemplo de Instagram', url: '' }
  ]
};
