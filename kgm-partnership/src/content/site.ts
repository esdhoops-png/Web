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

  // Basketball atmosphere — Unsplash (see credits), used where no ESD HOOPS photo exists (training, night court, details).
  courtNight: { src: "/images/court-night.jpg", alt: "Urban basketball court at night under a bridge", position: "50% 60%" },
  netDark: { src: "/images/net-dark.jpg", alt: "Basketball dropping through the net against a dark background", position: "50% 40%" },
  ballMacro: { src: "/images/ball-macro.jpg", alt: "Close-up texture of a basketball", position: "50% 50%" },
  trainingRopes: { src: "/images/training-ropes.jpg", alt: "Athlete training with battle ropes", position: "60% 50%" },
  trainingPartner: { src: "/images/training-partner.jpg", alt: "Coach and athlete during a strength session", position: "50% 50%" },
} satisfies Record<string, Img>;

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
  { id: "activation", label: "Activation" },
  { id: "synergy", label: "Shared Values" },
  { id: "value", label: "What KGM Gets" },
  { id: "contact", label: "Contact" },
];

export const hero = {
  eyebrow: "Strategic Partnership Proposal",
  titleA: "Two Worlds.",
  titleB: "One Vision.",
  subtitle: "Connecting mobility, sport and the next generation.",
};

export const vision = {
  label: "01 — The Vision",
  title: "More than a partnership.",
  body: [
    "Some partnerships go beyond visibility. They create experiences, build communities and connect brands with people in meaningful ways.",
    "ESD HOOPS and KGM share an opportunity to bring together two worlds driven by ambition, performance, innovation and passion.",
  ],
  closing: "Together, we can create something bigger than a traditional sponsorship.",
  statement: "We don't just want to put two brands together. We want to create something that moves people.",
};

export const whoWeAre = {
  label: "02 — Who We Are",
  title: "We build more than players.",
  intro:
    "ESD HOOPS is a basketball company focused on player development, international player representation and the organisation of basketball events — a platform that connects players, opportunities and communities.",
  pillars: [
    {
      n: "01",
      title: "Player Development",
      body: "Individual training and development for amateur and professional players.",
      points: ["Technical improvement", "Individual skill development", "Physical preparation", "Athletic performance", "Player growth and evolution"],
      image: images.trainingPartner,
      image2: images.esdShooterAlt,
    },
    {
      n: "02",
      title: "International Player Representation",
      body: "Representing and connecting players from different parts of the world. Our work has an international perspective, with talent from the United States, Europe, Asia and other international markets.",
      points: ["United States", "Europe", "Asia", "Other international markets"],
      footnote: "We connect players, opportunities and people within the global basketball ecosystem.",
      image: images.esdPlayer,
      image2: images.esdProfile,
    },
    {
      n: "03",
      title: "Basketball Events",
      body: "Organisation of basketball events and competitions across different formats.",
      formats: [
        { name: "3x3 Basketball", text: "Events and competitions linked to the FIBA 3x3 ecosystem." },
        { name: "5x5 Basketball", text: "Summer leagues, tournaments and competitions for players and basketball communities." },
      ],
      image: images.esdCourt,
      image2: images.esdOneOnOne,
    },
  ],
};

export const globalReach = {
  label: "03 — The Global Reach",
  title: "One sport. A global community.",
  body: "Basketball is a universal language — one that connects cultures, generations and communities. ESD HOOPS works with an international perspective, built on connections with players from different regions.",
  quote: "From local courts to international opportunities, ESD HOOPS connects talent, communities and the global basketball ecosystem.",
  regions: [
    { key: "northAmerica", name: "North America" },
    { key: "europe", name: "Europe" },
    { key: "asia", name: "Asia" },
  ] as const,
  community: "International Basketball Community",
};

export const whyKgm = {
  label: "04 — Why KGM?",
  title: "Why KGM?",
  subtitle: "An opportunity to connect with a new generation through sport, experiences and community.",
  reasons: [
    {
      n: "01",
      title: "Connect with the next generation",
      body: "Basketball connects with young people, athletes, families and new generations of consumers. KGM can reach this audience through real experiences, sporting activities and communities built around shared interests.",
      image: images.esdContest,
    },
    {
      n: "02",
      title: "Brand experience",
      body: "This is not just about placing a logo on a jersey. The partnership opens the door to experiences where KGM is present at events, tournaments, training sessions and sporting activities — moments the audience remembers.",
      image: images.kgmShowroomFront,
    },
    {
      n: "03",
      title: "International visibility",
      body: "ESD HOOPS has connections with players from the United States, Europe, Asia and other international markets — an opportunity to connect KGM with sporting communities and profiles from different backgrounds.",
      image: images.esdDuel,
    },
    {
      n: "04",
      title: "Content & digital exposure",
      body: "Audiovisual and digital campaigns built around valuable content.",
      list: ["Promotional videos", "Player campaigns", "Reels & social content", "Event coverage", "Professional photography", "Lifestyle content", "Automotive × basketball campaigns"],
      image: images.kgmNight,
    },
    {
      n: "05",
      title: "Community & brand positioning",
      body: "KGM can strengthen its image as a dynamic, approachable and innovative brand committed to new generations. Sport builds deeper relationships with people and communities.",
      image: images.esdCommunity,
    },
  ],
  closing: ["Don't just advertise to a community.", "Become part of it."],
};

export const concepts = {
  label: "05 — Creative Concepts",
  title: "What if we connected both worlds?",
  disclaimer: "Creative concepts for discussion. They do not depict existing events, activations or agreements.",
  items: [
    {
      n: "01",
      kicker: "KGM × Basketball Lifestyle",
      message: "Driven by passion. Connected through basketball.",
      body: "A KGM SUV parked courtside at an urban court at golden hour. Players training, cinematic light, the language of an automotive campaign.",
      images: [images.courtNight, images.kgmBlack, images.esdReleaseAlt],
    },
    {
      n: "02",
      kicker: "KGM × ESD HOOPS Events",
      message: "More than an event. A brand experience.",
      body: "A 3x3 event with a custom KGM court, vehicles on display, an activation zone, players and crowd — KGM as a protagonist of the event.",
      images: [images.esdOneOnOneAlt, images.kgmShowroomRear, images.esdCrowd],
    },
    {
      n: "03",
      kicker: "KGM × Player Campaigns",
      message: "Driven by ambition.",
      body: "Players posing alongside a KGM vehicle in dramatic, editorial light — ambassadors of shared values.",
      values: ["Ambition", "Performance", "Discipline", "Determination"],
      images: [images.esdShooter, images.kgmNight, images.esdFocus],
    },
    {
      n: "04",
      kicker: "KGM × Brand Experience",
      message: "Experience KGM beyond the road.",
      body: "A KGM showcase space inside a basketball event, where attendees discover the vehicles, interact with the brand and live the experience.",
      images: [images.kgmShowroomFront, images.kgmInterior, images.esdFlight],
    },
  ],
};

export const activation = {
  label: "06 — Activation Strategy",
  title: "Let's make it real.",
  intro: "Four lines of activation that turn ideas into concrete collaboration opportunities.",
  items: [
    {
      n: "01",
      title: "KGM × ESD HOOPS Events",
      short: "Events",
      summary: "KGM presence at 3x3 events and 5x5 summer leagues.",
      options: ["Tournament naming rights", "Court branding", "KGM vehicles on display", "Experience zones", "Player activations", "Award ceremonies", "Branding on promotional material", "Presence in digital communication"],
      benefit: "Direct visibility, connection with the audience and memorable brand experiences.",
      image: images.esdOneOnOneAlt,
    },
    {
      n: "02",
      title: "KGM × Player Development",
      short: "Player Development",
      summary: "Integrating KGM into ESD HOOPS' training programmes and sporting activities.",
      options: ["KGM-branded training apparel", "Player campaigns", "Videos on discipline and self-improvement", "Special activities", "Experiences for players and families"],
      benefit: "Associating the brand with positive values and connecting with athletes and families.",
      image: images.trainingRopes,
    },
    {
      n: "03",
      title: "KGM × International Basketball",
      short: "International",
      summary: "Using ESD HOOPS' international perspective to create campaigns and experiences with players from different backgrounds.",
      options: ["Campaigns with international players", "Multicultural audiovisual content", "Promotional actions", "Collaborations with sporting profiles", "Connections between communities"],
      benefit: "Building an international image and connecting with different markets.",
      image: images.esdPlayerAlt,
    },
    {
      n: "04",
      title: "KGM × Digital Content",
      short: "Digital Content",
      summary: "A professional line of audiovisual content.",
      options: ["Video campaigns", "Reels", "Advertising photography", "Player storytelling", "Event videos", "Lifestyle campaigns", "Joint social media content"],
      benefit: "Reusable content for KGM's own communication channels and a stronger digital presence.",
      image: images.kgmNight,
    },
  ],
};

export const synergy = {
  label: "07 — Brand Synergy",
  title: ["Different industries.", "Shared values."],
  values: ["Performance", "Ambition", "Innovation", "Movement", "Community", "Global Vision"],
  inline: [images.esdRelease, images.kgmInterior, images.netDark, images.kgmNight, images.esdCommunity, images.ballMacro],
  body: [
    "Whether it's on the road or on the court, progress comes from ambition, discipline and the desire to go further.",
    "Different industries. One shared mindset.",
  ],
};

export const value = {
  label: "08 — The Value for KGM",
  title: "What KGM gets.",
  note: "Potential opportunities and benefits — not guaranteed results.",
  items: [
    { title: "Direct connection with younger audiences", body: "Presence where young players, fans and families spend their time: on and around the court." },
    { title: "Brand visibility through sports events", body: "A visible role across 3x3 events, 5x5 competitions and their communication." },
    { title: "Authentic community engagement", body: "Being part of a basketball community rather than speaking to it from the outside." },
    { title: "International basketball connections", body: "Access to ESD HOOPS' network of players and profiles from different regions." },
    { title: "Professional audiovisual content", body: "Campaign-grade photography and video that KGM can use across its own channels." },
    { title: "Memorable brand experiences", body: "Product discovery and activations people live first-hand, not just see." },
  ],
};

export const future = {
  label: "09 — The Future",
  title: "This is just the beginning.",
  body: [
    "We believe the strongest partnerships are built through shared vision, meaningful experiences and long-term commitment.",
    "ESD HOOPS is ready to explore how we can bring KGM closer to the world of basketball, creating opportunities that generate value for both brands.",
  ],
  closing: "Let's build something that moves people.",
};

export const contactSection = {
  label: "10 — Contact",
  title: "Let's build something bigger.",
  subtitle: "ESD HOOPS × KGM — Strategic Partnership Proposal",
  cta: "Let's talk",
  signoff: "A partnership with potential.",
};

export const credits = [
  { label: "KGM Torres (showroom, front & rear)", author: "Alexander-93", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:KGM_Torres_Auto_Zuerich_2023_1X7A1045.jpg" },
  { label: "KGM Torres (showroom, rear)", author: "Alexander-93", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:KGM_Torres_Auto_Zuerich_2023_1X7A1294.jpg" },
  { label: "KGM Torres (black)", author: "Alexander-93", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:SsangYong_Torres_Automesse_Ludwigsburg_2024_IMG_1442.jpg" },
  { label: "KGM Torres EVX (dusk)", author: "Damian B Oh", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:KGM_Torres_EVX_U100_Space_Black_(2).jpg" },
  { label: "KGM Torres EVX (interior)", author: "Damian B Oh", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:KGM_Torres_EVX_U100_Black_(1).jpg" },
];
