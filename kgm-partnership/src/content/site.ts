/**
 * All copy, imagery and contact settings for the proposal live here.
 * Swap any image path below for ESD HOOPS' own photography (place files in /public/images).
 */

export type Img = { src: string; alt: string; position?: string };

export const images = {
  // KGM vehicles — Wikimedia Commons, CC BY-SA 4.0 (see credits)
  kgmShowroomFront: { src: "/images/kgm-torres-showroom-front.jpg", alt: "KGM Torres SUV in black under showroom lighting", position: "50% 55%" },
  kgmShowroomRear: { src: "/images/kgm-torres-showroom-rear.jpg", alt: "Rear view of a black KGM Torres with illuminated tail lights", position: "50% 55%" },
  kgmBlack: { src: "/images/kgm-torres-black.jpg", alt: "Black KGM Torres SUV, front three-quarter view", position: "50% 60%" },
  kgmNight: { src: "/images/kgm-torres-night.jpg", alt: "KGM Torres at dusk with its light bar on", position: "50% 62%" },
  kgmInterior: { src: "/images/kgm-torres-interior.jpg", alt: "KGM Torres interior and dashboard", position: "50% 50%" },

  // ESD HOOPS — own photography from the latest ESD HOOPS 3x3 tournament
  esdShooter: { src: "/images/esd-717.jpg", alt: "ESD HOOPS 3x3 player lining up a shot", position: "50% 30%" },
  esdShooterAlt: { src: "/images/esd-718.jpg", alt: "ESD HOOPS 3x3 player releasing a jump shot", position: "50% 30%" },
  esdRelease: { src: "/images/esd-614.jpg", alt: "Player shooting against the sky at an ESD HOOPS 3x3 tournament", position: "50% 30%" },
  esdReleaseAlt: { src: "/images/esd-615.jpg", alt: "Jump shot at an ESD HOOPS 3x3 tournament", position: "50% 30%" },
  esdPortrait: { src: "/images/esd-530.jpg", alt: "Player holding the ball at an ESD HOOPS 3x3 tournament", position: "50% 30%" },
  esdFocus: { src: "/images/esd-528.jpg", alt: "Player focused before a game at an ESD HOOPS 3x3 tournament", position: "50% 35%" },
  esdProfile: { src: "/images/esd-680.jpg", alt: "Player in profile at an ESD HOOPS 3x3 tournament", position: "50% 40%" },
  esdProfileAlt: { src: "/images/esd-681.jpg", alt: "Player looking across the court at an ESD HOOPS 3x3 tournament", position: "50% 40%" },
  esdDuel: { src: "/images/esd-647.jpg", alt: "Two players face to face during an ESD HOOPS 3x3 game", position: "50% 70%" },
  esdIntensity: { src: "/images/esd-648.jpg", alt: "Close contest between players at an ESD HOOPS 3x3 tournament", position: "50% 45%" },
  esdLayup: { src: "/images/esd-521.jpg", alt: "Player finishing at the rim during an ESD HOOPS 3x3 game", position: "50% 35%" },
  esdDrive: { src: "/images/esd-513.jpg", alt: "Player driving to the basket at an ESD HOOPS 3x3 tournament", position: "50% 35%" },
  esdOneOnOne: { src: "/images/esd-671.jpg", alt: "One-on-one action with spectators at an ESD HOOPS 3x3 tournament", position: "50% 60%" },
  esdOneOnOneAlt: { src: "/images/esd-672.jpg", alt: "Defender and attacker at an ESD HOOPS 3x3 tournament", position: "50% 60%" },
  esdPlayer: { src: "/images/esd-669.jpg", alt: "Player between games at an ESD HOOPS 3x3 tournament", position: "50% 30%" },
  esdPlayerAlt: { src: "/images/esd-674.jpg", alt: "Player with the ball at an ESD HOOPS 3x3 tournament", position: "50% 35%" },
  esdContest: { src: "/images/esd-564.jpg", alt: "Contested shot at an ESD HOOPS 3x3 tournament", position: "50% 30%" },
  esdCourt: { src: "/images/esd-505.jpg", alt: "ESD HOOPS 3x3 court with a player on the ball", position: "50% 55%" },
  esdFlight: { src: "/images/esd-689.jpg", alt: "Player in the air at an ESD HOOPS 3x3 tournament", position: "50% 35%" },
  esdCrowd: { src: "/images/esd-738.jpg", alt: "Game action and spectators at an ESD HOOPS 3x3 tournament", position: "50% 55%" },
  esdCommunity: { src: "/images/esd-741.jpg", alt: "Players and spectators around the court at an ESD HOOPS 3x3 tournament", position: "50% 55%" },

  // ESD HOOPS — training sessions
  esdCoach: { src: "/images/esd-train-254.jpg", alt: "ESD HOOPS coach encouraging players during a training session", position: "50% 30%" },
  esdCoachLaugh: { src: "/images/esd-train-387.jpg", alt: "Coach sharing a laugh with young players at an ESD HOOPS training", position: "45% 40%" },
  esdShirt: { src: "/images/esd-train-125.jpg", alt: "Player wearing an ESD HOOPS shirt at training", position: "50% 30%" },
  esdCamp: { src: "/images/esd-train-400.jpg", alt: "Group photo of players and coaches at an ESD HOOPS training camp", position: "50% 60%" },
  esdDribble: { src: "/images/esd-train-271.jpg", alt: "Young player dribbling during an ESD HOOPS training drill", position: "50% 50%" },

  // Basketball atmosphere — Unsplash (see credits): night court and details.
  courtNight: { src: "/images/court-night.jpg", alt: "Urban basketball court at night under a bridge", position: "50% 60%" },
  netDark: { src: "/images/net-dark.jpg", alt: "Basketball dropping through the net against a dark background", position: "50% 40%" },
  ballMacro: { src: "/images/ball-macro.jpg", alt: "Close-up texture of a basketball", position: "50% 50%" },
} satisfies Record<string, Img>;

export type Vehicle = { id: string; name: string; img: Img; width: number; height: number; faces: "left" | "right" };

/** Official KGM studio images (transparent background), supplied for this proposal. */
export const vehicles = {
  mussoGreen: { id: "musso-ev", name: "Musso EV", img: { src: "/images/kgm-musso-ev-green.webp", alt: "KGM Musso EV pick-up in green" }, width: 723, height: 384, faces: "left" },
  mussoWhite: { id: "musso-ev-white", name: "Musso EV", img: { src: "/images/kgm-musso-ev-white.webp", alt: "KGM Musso EV pick-up in white" }, width: 725, height: 383, faces: "right" },
  torresEvx: { id: "torres-evx", name: "Torres EVX", img: { src: "/images/kgm-torres-evx-white.webp", alt: "KGM Torres EVX SUV in white" }, width: 761, height: 396, faces: "right" },
  torresEvxVx: { id: "torres-evx-vx", name: "Torres EVX", img: { src: "/images/kgm-torres-evx-vx-white.webp", alt: "KGM Torres EVX SUV in white with silver wheels" }, width: 772, height: 406, faces: "right" },
  actyon: { id: "actyon-hybrid", name: "Actyon Hybrid", img: { src: "/images/kgm-actyon-hybrid-green.webp", alt: "KGM Actyon Hybrid SUV in green" }, width: 703, height: 396, faces: "left" },
} satisfies Record<string, Vehicle>;

export const fleet = {
  label: "06 — The Fleet",
  title: "The KGM range, on court.",
  intro: "Cómo podría participar la gama de KGM en la colaboración: desde la pista del evento hasta las campañas con jugadores.",
  disclaimer: "Papeles propuestos para debatir. Modelos y disponibilidad a acordar con KGM.",
  items: [
    {
      vehicle: vehicles.mussoGreen,
      role: "Event logistics & courtside display",
      body: "El pick-up que llega con la pista: transporta el material de los eventos 3x3 y ancla la zona de exposición de KGM junto a la acción.",
    },
    {
      vehicle: vehicles.torresEvx,
      role: "Experience zone & test drives",
      body: "La pieza central de la zona de experiencia de KGM en los torneos, donde jugadores y familias descubren el vehículo de cerca.",
    },
    {
      vehicle: vehicles.actyon,
      role: "Player campaigns",
      body: "El vehículo protagonista de las campañas editoriales con jugadores de ESD HOOPS, construidas en torno a la ambición, el rendimiento y la determinación.",
    },
  ],
};

export const contact = {
  /** Fill in with official ESD HOOPS details. Empty values are not rendered. */
  email: "",
  phone: "",
  website: "",
  instagram: "",
  location: "",
  /** Formspree-compatible endpoint. Configure via NEXT_PUBLIC_CONTACT_FORM_ENDPOINT. */
  formEndpoint: process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? "",
};

export const nav = [
  { id: "vision", label: "The Vision" },
  { id: "who-we-are", label: "Who We Are" },
  { id: "global-reach", label: "Global Reach" },
  { id: "why-kgm", label: "Why KGM" },
  { id: "concepts", label: "Concepts" },
  { id: "fleet", label: "The Fleet" },
  { id: "activation", label: "Activation" },
  { id: "synergy", label: "Shared Values" },
  { id: "value", label: "What KGM Gets" },
  { id: "contact", label: "Contact" },
];

export const hero = {
  eyebrow: "Strategic Partnership Proposal",
  titleA: "Two Worlds.",
  titleB: "One Vision.",
  subtitle: "Conectando movilidad, deporte y la nueva generación.",
};

export const vision = {
  label: "01 — The Vision",
  title: "More than a partnership.",
  body: [
    "Hay alianzas que van más allá de la visibilidad. Crean experiencias, construyen comunidades y conectan marcas con personas de forma significativa.",
    "ESD HOOPS y KGM comparten la oportunidad de unir dos mundos impulsados por la ambición, el rendimiento, la innovación y la pasión.",
  ],
  closing: "Juntos podemos crear algo más grande que un patrocinio tradicional.",
  statement: "We don't just want to put two brands together. We want to create something that moves people.",
};

export const whoWeAre = {
  label: "02 — Who We Are",
  title: "We build more than players.",
  intro:
    "ESD HOOPS es una empresa de baloncesto centrada en el desarrollo de jugadores, la representación internacional y la organización de eventos de baloncesto: una plataforma que conecta jugadores, oportunidades y comunidades.",
  pillars: [
    {
      n: "01",
      title: "Player Development",
      body: "Entrenamiento y desarrollo individual de jugadores amateurs y profesionales.",
      points: ["Mejora técnica", "Desarrollo de habilidades individuales", "Preparación física", "Rendimiento deportivo", "Evolución y crecimiento del jugador"],
      image: images.esdCoach,
      image2: images.esdCoachLaugh,
    },
    {
      n: "02",
      title: "International Player Representation",
      body: "Representación y conexión de jugadores de diferentes partes del mundo. Nuestro trabajo tiene una perspectiva internacional, con talento de Estados Unidos, Europa, Asia y otros mercados internacionales.",
      points: ["Estados Unidos", "Europa", "Asia", "Otros mercados internacionales"],
      footnote: "Conectamos jugadores, oportunidades y personas dentro del ecosistema global del baloncesto.",
      image: images.esdPlayer,
      image2: images.esdProfile,
    },
    {
      n: "03",
      title: "Basketball Events",
      body: "Organización de eventos y competiciones de baloncesto en diferentes formatos.",
      formats: [
        { name: "3x3 Baloncesto", text: "Eventos y competiciones vinculados al ecosistema FIBA 3x3." },
        { name: "5x5 Baloncesto", text: "Ligas de verano, torneos y competiciones para jugadores y comunidades de baloncesto." },
      ],
      image: images.esdCourt,
      image2: images.esdOneOnOne,
    },
  ],
};

export const globalReach = {
  label: "03 — The Global Reach",
  title: "One sport. A global community.",
  body: "El baloncesto es un lenguaje universal que conecta culturas, generaciones y comunidades. ESD HOOPS trabaja con una perspectiva internacional, construida a partir de sus conexiones con jugadores de diferentes regiones.",
  quote: "De las canchas locales a las oportunidades internacionales, ESD HOOPS conecta talento, comunidades y el ecosistema global del baloncesto.",
  regions: [
    { key: "northAmerica", name: "Norteamérica" },
    { key: "europe", name: "Europa" },
    { key: "asia", name: "Asia" },
  ] as const,
  community: "Comunidad internacional del baloncesto",
};

export const whyKgm = {
  label: "04 — Why KGM?",
  title: "Why KGM?",
  subtitle: "Una oportunidad para conectar con una nueva generación a través del deporte, las experiencias y la comunidad.",
  reasons: [
    {
      n: "01",
      title: "Connect with the next generation",
      body: "El baloncesto conecta con jóvenes, deportistas, familias y nuevas generaciones de consumidores. KGM puede acercarse a este público a través de experiencias reales, actividades deportivas y comunidades con intereses compartidos.",
      image: images.esdDribble,
    },
    {
      n: "02",
      title: "Brand experience",
      body: "No se trata solo de poner un logotipo en una camiseta. La colaboración abre la puerta a experiencias en las que KGM está presente en eventos, torneos, entrenamientos y actividades deportivas: momentos que el público recuerda.",
      image: images.kgmShowroomFront,
    },
    {
      n: "03",
      title: "International visibility",
      body: "ESD HOOPS tiene conexiones con jugadores de Estados Unidos, Europa, Asia y otros mercados internacionales: una oportunidad para conectar KGM con comunidades y perfiles deportivos de distintas procedencias.",
      image: images.esdDuel,
    },
    {
      n: "04",
      title: "Content & digital exposure",
      body: "Campañas audiovisuales y digitales construidas con contenido de valor.",
      list: ["Vídeos promocionales", "Campañas con jugadores", "Reels y contenido para redes", "Cobertura de eventos", "Fotografía profesional", "Contenido lifestyle", "Campañas automoción × baloncesto"],
      image: images.kgmNight,
    },
    {
      n: "05",
      title: "Community & brand positioning",
      body: "KGM puede reforzar su imagen como marca dinámica, cercana e innovadora, comprometida con las nuevas generaciones. El deporte construye relaciones más profundas con las personas y las comunidades.",
      image: images.esdCommunity,
    },
  ],
  closing: ["Don't just advertise to a community.", "Become part of it."],
};

export const concepts = {
  label: "05 — Creative Concepts",
  title: "What if we connected both worlds?",
  disclaimer: "Conceptos creativos para debatir. No representan eventos, activaciones ni acuerdos existentes.",
  items: [
    {
      n: "01",
      kicker: "KGM × Basketball Lifestyle",
      message: "Driven by passion. Connected through basketball.",
      body: "Un vehículo KGM junto a una cancha urbana al atardecer. Jugadores entrenando, luz cinematográfica y el lenguaje de una campaña de automoción.",
      images: [images.courtNight, images.esdCourt, images.esdReleaseAlt],
      montage: { vehicle: vehicles.mussoGreen, on: 0 },
    },
    {
      n: "02",
      kicker: "KGM × ESD HOOPS Events",
      message: "More than an event. A brand experience.",
      body: "Un evento 3x3 con pista personalizada de KGM, vehículos expuestos, zona de activación, jugadores y público: KGM como protagonista del evento.",
      images: [images.esdOneOnOneAlt, images.kgmShowroomRear, images.esdCrowd],
    },
    {
      n: "03",
      kicker: "KGM × Player Campaigns",
      message: "Driven by ambition.",
      body: "Jugadores posando junto a un vehículo KGM con iluminación dramática y editorial: embajadores de valores compartidos.",
      values: ["Ambition", "Performance", "Discipline", "Determination"],
      images: [images.esdShooter, images.esdProfile, images.esdFocus],
      montage: { vehicle: vehicles.actyon, on: 1 },
    },
    {
      n: "04",
      kicker: "KGM × Brand Experience",
      message: "Experience KGM beyond the road.",
      body: "Un espacio de exposición de KGM dentro de un evento de baloncesto, donde los asistentes descubren los vehículos, interactúan con la marca y viven la experiencia.",
      images: [images.esdCommunity, images.kgmInterior, images.esdFlight],
      montage: { vehicle: vehicles.torresEvxVx, on: 0 },
    },
  ],
};

export const activation = {
  label: "07 — Activation Strategy",
  title: "Let's make it real.",
  intro: "Cuatro líneas de activación que convierten las ideas en oportunidades concretas de colaboración.",
  items: [
    {
      n: "01",
      title: "KGM × ESD HOOPS Events",
      short: "Events",
      summary: "Presencia de KGM en eventos 3x3 y ligas de verano 5x5.",
      options: ["Naming de torneos", "Branding en pistas", "Vehículos KGM expuestos", "Zonas de experiencia", "Activaciones con jugadores", "Entrega de premios", "Branding en material promocional", "Presencia en la comunicación digital"],
      benefit: "Visibilidad directa, conexión con el público y experiencias de marca memorables.",
      image: images.esdOneOnOneAlt,
    },
    {
      n: "02",
      title: "KGM × Player Development",
      short: "Player Development",
      summary: "Integrar KGM en los programas de entrenamiento y las actividades deportivas de ESD HOOPS.",
      options: ["Ropa de entrenamiento con branding KGM", "Campañas con jugadores", "Vídeos sobre disciplina y superación", "Actividades especiales", "Experiencias para jugadores y familias"],
      benefit: "Asociar la marca a valores positivos y conectar con deportistas y familias.",
      image: images.esdShirt,
    },
    {
      n: "03",
      title: "KGM × International Basketball",
      short: "International",
      summary: "Aprovechar la perspectiva internacional de ESD HOOPS para crear campañas y experiencias con jugadores de distintas procedencias.",
      options: ["Campañas con jugadores internacionales", "Contenido audiovisual multicultural", "Acciones promocionales", "Colaboraciones con perfiles deportivos", "Conexiones entre comunidades"],
      benefit: "Construir una imagen internacional y conectar con diferentes mercados.",
      image: images.esdPlayerAlt,
    },
    {
      n: "04",
      title: "KGM × Digital Content",
      short: "Digital Content",
      summary: "Una línea profesional de contenido audiovisual.",
      options: ["Campañas de vídeo", "Reels", "Fotografía publicitaria", "Storytelling con jugadores", "Vídeos de eventos", "Campañas lifestyle", "Contenido conjunto para redes sociales"],
      benefit: "Contenido reutilizable en los canales de comunicación de KGM y mayor presencia digital.",
      image: images.kgmNight,
    },
  ],
};

export const synergy = {
  label: "08 — Brand Synergy",
  title: ["Different industries.", "Shared values."],
  values: ["Performance", "Ambition", "Innovation", "Movement", "Community", "Global Vision"],
  inline: [images.esdRelease, images.kgmInterior, images.netDark, images.kgmNight, images.esdCommunity, images.ballMacro],
  body: [
    "Ya sea en la carretera o en la pista, el progreso nace de la ambición, la disciplina y las ganas de ir más lejos.",
    "Different industries. One shared mindset.",
  ],
};

export const value = {
  label: "09 — The Value for KGM",
  title: "What KGM gets.",
  note: "Oportunidades y beneficios potenciales, no resultados garantizados.",
  items: [
    { title: "Direct connection with younger audiences", body: "Presencia donde pasan su tiempo los jóvenes jugadores, aficionados y familias: en la pista y a su alrededor." },
    { title: "Brand visibility through sports events", body: "Un papel visible en los eventos 3x3, las competiciones 5x5 y su comunicación." },
    { title: "Authentic community engagement", body: "Formar parte de una comunidad de baloncesto en lugar de hablarle desde fuera." },
    { title: "International basketball connections", body: "Acceso a la red de jugadores y perfiles de diferentes regiones de ESD HOOPS." },
    { title: "Professional audiovisual content", body: "Fotografía y vídeo con calidad de campaña que KGM puede usar en sus propios canales." },
    { title: "Memorable brand experiences", body: "Descubrimiento de producto y activaciones que la gente vive en primera persona, no solo ve." },
  ],
};

export const future = {
  label: "10 — The Future",
  title: "This is just the beginning.",
  body: [
    "Creemos que las alianzas más sólidas se construyen con una visión compartida, experiencias con sentido y compromiso a largo plazo.",
    "ESD HOOPS está preparada para explorar cómo acercar KGM al mundo del baloncesto, creando oportunidades que generen valor para ambas marcas.",
  ],
  closing: "Let's build something that moves people.",
};

export const contactSection = {
  label: "11 — Contact",
  title: "Let's build something bigger.",
  subtitle: "ESD HOOPS × KGM — Propuesta de colaboración estratégica",
  cta: "Hablemos",
  signoff: "A partnership with potential.",
};

export const credits = [
  { label: "KGM Musso EV, Torres EVX y Actyon Hybrid (imágenes de estudio)", author: "KGM", license: "imágenes oficiales de KGM", url: "" },
  { label: "KGM Torres (showroom, front & rear)", author: "Alexander-93", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:KGM_Torres_Auto_Zuerich_2023_1X7A1045.jpg" },
  { label: "KGM Torres (showroom, rear)", author: "Alexander-93", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:KGM_Torres_Auto_Zuerich_2023_1X7A1294.jpg" },
  { label: "KGM Torres (black)", author: "Alexander-93", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:SsangYong_Torres_Automesse_Ludwigsburg_2024_IMG_1442.jpg" },
  { label: "KGM Torres EVX (dusk)", author: "Damian B Oh", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:KGM_Torres_EVX_U100_Space_Black_(2).jpg" },
  { label: "KGM Torres EVX (interior)", author: "Damian B Oh", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:KGM_Torres_EVX_U100_Black_(1).jpg" },
];
