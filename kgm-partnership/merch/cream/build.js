// Generates mockup.html and print-back.html (logo paths are read verbatim from Logos.tsx)
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../../src/components/ui/Logos.tsx'), 'utf8');
const [esdSrc, kgmSrc] = [src.slice(src.indexOf('function EsdMark'), src.indexOf('function KgmWordmark')), src.slice(src.indexOf('function KgmWordmark'))];
const ds = s => [...s.matchAll(/<path[^>]*?\sd="([^"]+)"/g)].map(m => m[1]);
const e = ds(esdSrc), k = ds(kgmSrc).slice(0, 3);
if (e.length !== 8 || k.length !== 3) throw new Error('logo paths ' + e.length + ' ' + k.length);
const IMG = '../../public/images/';
const NAVY = '#0d1e2c', NAVY2 = '#172b48', CREAM = '#f2e9df', SAND = '#d9c4b0', CLAY = '#b97a4e';

// logo symbols (exact paths)
const symbols = `
<symbol id="esd" viewBox="290 150 520 770">
  <g fill="currentColor"><path d="${e[0]}"/><path d="${e[1]}"/><path fill-rule="evenodd" d="${e[2]}"/></g>
  <g fill="none" stroke="currentColor" stroke-width="25"><path stroke-linejoin="round" d="${e[3]}"/><path d="${e[4]}"/><path d="${e[5]}"/><path d="${e[6]}"/><path d="${e[7]}"/></g>
</symbol>
<symbol id="kgm" viewBox="48 168 961 162"><g fill="currentColor"><path d="${k[0]}"/><path d="${k[1]}"/><path d="${k[2]}"/></g></symbol>`;

const artDefs = `
<filter id="duo" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
  <feColorMatrix type="matrix" values="0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0"/>
  <feComponentTransfer>
    <feFuncR type="table" tableValues="0.051 0.07 0.20 0.62 0.90 0.95"/>
    <feFuncG type="table" tableValues="0.118 0.14 0.27 0.62 0.86 0.914"/>
    <feFuncB type="table" tableValues="0.173 0.21 0.36 0.64 0.82 0.875"/>
  </feComponentTransfer>
</filter>
<linearGradient id="pn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NAVY2}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient>
<clipPath id="cL"><rect x="330" y="440" width="740" height="1580"/></clipPath>
<clipPath id="cM"><rect x="1130" y="300" width="740" height="1860"/></clipPath>
<clipPath id="cR"><rect x="1930" y="440" width="740" height="1580"/></clipPath>
<radialGradient id="gsh" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${NAVY}" stop-opacity=".55"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0"/></radialGradient>`;

// court-line motif (cream hairlines) for car panels
const court = (x, y, w, h) => {
  const cx = x + w / 2;
  return `<g fill="none" stroke="${CREAM}" stroke-opacity=".2" stroke-width="5">
    <rect x="${x + 44}" y="${y + 44}" width="${w - 88}" height="${h - 88}"/>
    <path d="M${cx - 150},${y + 44} V${y + 420} H${cx + 150} V${y + 44}"/>
    <path d="M${cx - 150},${y + 420} A150,150 0 0 0 ${cx + 150},${y + 420}"/>
    <path d="M${x + 44},${y + 300} C${x + 60},${y + 900} ${x + w - 60},${y + 900} ${x + w - 44},${y + 300}"/>
  </g>`;
};

// BACK ARTWORK, 3000 x 3600
const art = `
<g font-family="Michroma, sans-serif" fill="${NAVY}">
  <!-- brand line -->
  <g color="${NAVY}">
    <use href="#esd" x="1156" y="52" width="108" height="160"/>
    <text x="1400" y="150" font-size="50" text-anchor="middle" font-family="Inter, sans-serif" font-weight="500">×</text>
    <use href="#kgm" x="1524" y="105" width="320" height="54"/>
  </g>
  <line x1="330" y1="132" x2="1040" y2="132" stroke="${NAVY}" stroke-width="5"/>
  <line x1="1960" y1="132" x2="2670" y2="132" stroke="${NAVY}" stroke-width="5"/>
  <text x="330" y="100" font-size="34" letter-spacing="10">ESD HOOPS X KGM</text>
  <text x="2670" y="100" font-size="34" letter-spacing="10" text-anchor="end">DRIVEN BY AMBITION</text>

  <!-- left panel: Musso EV (white) -->
  <rect x="330" y="440" width="740" height="1580" fill="url(#pn)"/>
  <g clip-path="url(#cL)">
    ${court(330, 440, 740, 1580)}
    <image href="${IMG}kgm-musso-ev-white.webp" x="250" y="760" width="1850" height="977.3"/>
  </g>
  <text x="394" y="540" font-size="34" letter-spacing="9" fill="${CREAM}">MUSSO EV</text>
  <text x="1006" y="540" font-size="34" letter-spacing="9" fill="${SAND}" text-anchor="end">KGM</text>

  <!-- middle panel: player, duotone navy on cream -->
  <rect x="1130" y="300" width="740" height="1860" fill="${CREAM}"/>
  <g clip-path="url(#cM)">
    <image href="${IMG}esd-614.webp" x="820" y="300" width="1488" height="1860" filter="url(#duo)" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <rect x="1136" y="306" width="728" height="1848" fill="none" stroke="${NAVY}" stroke-width="12"/>
  <text x="1194" y="400" font-size="34" letter-spacing="9">ESD HOOPS</text>
  <text x="1806" y="400" font-size="34" letter-spacing="9" text-anchor="end">3X3</text>

  <!-- right panel: Torres EVX (white) -->
  <rect x="1930" y="440" width="740" height="1580" fill="url(#pn)"/>
  <g clip-path="url(#cR)">
    ${court(1930, 440, 740, 1580)}
    <image href="${IMG}kgm-torres-evx-white.webp" x="760" y="740" width="1950" height="1014.7"/>
  </g>
  <text x="1994" y="540" font-size="34" letter-spacing="9" fill="${CREAM}">TORRES EVX</text>
  <text x="2606" y="540" font-size="34" letter-spacing="9" fill="${SAND}" text-anchor="end">KGM</text>

  <!-- hero: Musso EV green -->
  <ellipse cx="1500" cy="3010" rx="1250" ry="70" fill="url(#gsh)"/>
  <image href="${IMG}kgm-musso-ev-green.webp" x="210" y="1680" width="2580" height="1370.3"/>

  <!-- model name -->
  <text x="1500" y="3318" font-size="236" text-anchor="middle" textLength="2340" lengthAdjust="spacing">MUSSO EV</text>
  <!-- technical row -->
  <line x1="330" y1="3382" x2="2670" y2="3382" stroke="${NAVY}" stroke-width="5"/>
  <g font-size="33" letter-spacing="8">
    <text x="330" y="3452">3X3</text>
    <text x="520" y="3452">5X5</text>
    <text x="710" y="3452">PLAYER DEVELOPMENT</text>
    <text x="2670" y="3452" text-anchor="end">OFFICIAL PARTNER CONCEPT</text>
  </g>
  <text x="1500" y="3572" font-family="'Instrument Serif', serif" font-style="italic" font-size="106" text-anchor="middle" letter-spacing="2">Two worlds. One vision.</text>
</g>`;

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Michroma&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`;

fs.writeFileSync(path.join(__dirname, 'print-back.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ESD HOOPS x KGM - back print (cream garment / navy print)</title>
${fonts}
<style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="3600" viewBox="0 0 3000 3600">
<defs>${symbols}${artDefs}</defs>${art}
</svg></body></html>`);

// ---------- MOCKUP ----------
const G = '#f2e9df';
// geometry
const sleeveL = 'M560,500 C470,540 405,630 372,760 L207,1692 L393,1728 L590,960 L640,700 Z';
const cuffL = 'M216,1690 C270,1694 330,1706 386,1724 L364,1836 Q300,1838 196,1802 Z';
const bodyP = 'M1000,372 L870,395 C760,430 620,470 530,520 C562,650 578,800 590,960 L572,1760 L1428,1760 L1410,960 C1422,800 1438,650 1470,520 C1380,470 1240,430 1130,395 Z';
const hemP = 'M572,1756 L1428,1756 C1432,1790 1428,1830 1420,1856 Q1000,1872 580,1856 C572,1830 568,1790 572,1756 Z';
const hoodP = 'M846,402 C880,326 1120,326 1154,402 C1218,432 1248,502 1234,584 C1212,694 1100,784 1000,804 C900,784 788,694 766,584 C752,502 782,432 846,402 Z';
const mir = inner => `<g transform="translate(2000,0) scale(-1,1)">${inner}</g>`;
const ribs = (x0, x1, y0, y1, step, skew = 0) => { let s = ''; for (let x = x0; x <= x1; x += step) s += `M${x},${y0} L${x + skew},${y1} `; return s; };

const sleeveShade = `
  <path d="${sleeveL}" fill="url(#slG)"/>
  <g filter="url(#b8)" fill="none" stroke-linecap="round">
    <path d="M352,1010 C400,1040 450,1050 520,1030" stroke="#5b4a3a" stroke-opacity=".20" stroke-width="16"/>
    <path d="M330,1090 C390,1130 440,1140 500,1128" stroke="#5b4a3a" stroke-opacity=".16" stroke-width="14"/>
    <path d="M340,1060 C400,1088 450,1094 510,1080" stroke="#fff" stroke-opacity=".5" stroke-width="12"/>
    <path d="M262,1500 C310,1530 360,1540 420,1532" stroke="#5b4a3a" stroke-opacity=".18" stroke-width="14"/>
    <path d="M246,1590 C300,1622 350,1632 404,1630" stroke="#5b4a3a" stroke-opacity=".2" stroke-width="14"/>
    <path d="M254,1548 C310,1578 360,1586 412,1582" stroke="#fff" stroke-opacity=".5" stroke-width="10"/>
    <path d="M420,700 C440,800 470,880 560,940" stroke="#5b4a3a" stroke-opacity=".13" stroke-width="22"/>
  </g>`;
const sleeveBlock = print => `
  <path d="${sleeveL}" fill="${G}"/>
  ${print}
  <g clip-path="url(#clSl)">${sleeveShade}</g>
  <path d="${cuffL}" fill="${G}"/>
  <g clip-path="url(#clCf)">
    <path d="${ribs(190, 400, 1680, 1850, 9, -24)}" stroke="#6b5a48" stroke-opacity=".22" stroke-width="2.2" fill="none"/>
    <path d="${cuffL}" fill="url(#cfG)"/>
    <path d="M210,1690 C270,1694 330,1706 390,1726" stroke="#5b4a3a" stroke-opacity=".4" stroke-width="7" fill="none" filter="url(#b3)"/>
  </g>`;

const mock = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ESD HOOPS x KGM - hoodie mockup (cream / navy print)</title>
${fonts}
<style>html,body{margin:0;width:2000px;height:2000px;overflow:hidden;background:#6f757c}svg{display:block}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000" viewBox="0 0 2000 2000">
<defs>${symbols}${artDefs}
  <radialGradient id="bg" cx="0.5" cy="0.42" r="0.75"><stop offset="0" stop-color="#9aa0a6"/><stop offset=".6" stop-color="#7b8188"/><stop offset="1" stop-color="#555a61"/></radialGradient>
  <filter id="conc" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.12  0.9 0 0 0 -0.32"/></filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0.9 -0.36"/></filter>
  <filter id="weave" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="3" seed="11"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.18  0 0 0 0.75 -0.3"/></filter>
  <filter id="b3"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="b8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="b20" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="20"/></filter>
  <filter id="b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="42"/></filter>
  <filter id="ink" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
  <linearGradient id="slG" gradientUnits="userSpaceOnUse" x1="300" y1="1150" x2="505" y2="1195">
    <stop offset="0" stop-color="#5b4a3a" stop-opacity=".30"/><stop offset=".22" stop-color="#5b4a3a" stop-opacity=".04"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset=".8" stop-color="#5b4a3a" stop-opacity=".08"/><stop offset="1" stop-color="#5b4a3a" stop-opacity=".36"/></linearGradient>
  <linearGradient id="cfG" gradientUnits="userSpaceOnUse" x1="200" y1="1750" x2="380" y2="1785">
    <stop offset="0" stop-color="#5b4a3a" stop-opacity=".32"/><stop offset=".4" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#5b4a3a" stop-opacity=".38"/></linearGradient>
  <linearGradient id="bdG" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#5b4a3a" stop-opacity=".30"/><stop offset=".1" stop-color="#5b4a3a" stop-opacity=".07"/><stop offset=".5" stop-color="#fff" stop-opacity=".10"/><stop offset=".9" stop-color="#5b4a3a" stop-opacity=".07"/><stop offset="1" stop-color="#5b4a3a" stop-opacity=".30"/></linearGradient>
  <linearGradient id="bdV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b4a3a" stop-opacity=".0"/><stop offset=".8" stop-color="#5b4a3a" stop-opacity="0"/><stop offset="1" stop-color="#5b4a3a" stop-opacity=".2"/></linearGradient>
  <radialGradient id="hdG" cx="0.5" cy="0.38" r="0.62"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#5b4a3a" stop-opacity=".34"/></radialGradient>
  <linearGradient id="hmG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b4a3a" stop-opacity=".30"/><stop offset=".25" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#5b4a3a" stop-opacity=".30"/></linearGradient>
  <clipPath id="clSl"><path d="${sleeveL}"/></clipPath>
  <clipPath id="clCf"><path d="${cuffL}"/></clipPath>
  <clipPath id="clBd"><path d="${bodyP}"/></clipPath>
  <clipPath id="clHm"><path d="${hemP}"/></clipPath>
  <clipPath id="clHd"><path d="${hoodP}"/></clipPath>
  <clipPath id="clAll"><path d="${sleeveL}"/><path d="${cuffL}"/><path d="${bodyP}"/><path d="${hemP}"/><path d="${hoodP}"/>
    <path transform="translate(2000,0) scale(-1,1)" d="${sleeveL}"/><path transform="translate(2000,0) scale(-1,1)" d="${cuffL}"/></clipPath>
</defs>

<!-- studio -->
<rect width="2000" height="2000" fill="url(#bg)"/>
<rect width="2000" height="2000" filter="url(#conc)" opacity=".5"/>
<rect width="2000" height="2000" filter="url(#grain)" opacity=".35"/>

<g transform="translate(0,-66)">
<!-- cast shadow -->
<g filter="url(#b40)" fill="#14181d" opacity=".55" transform="translate(26,40)">
  <path d="${sleeveL}"/><path d="${cuffL}"/><path d="${bodyP}"/><path d="${hemP}"/><path d="${hoodP}"/>${mir(`<path d="${sleeveL}"/><path d="${cuffL}"/>`)}
</g>
<g filter="url(#b8)" fill="#14181d" opacity=".5" transform="translate(6,10)">
  <path d="${sleeveL}"/><path d="${cuffL}"/><path d="${bodyP}"/><path d="${hemP}"/><path d="${hoodP}"/>${mir(`<path d="${sleeveL}"/><path d="${cuffL}"/>`)}
</g>

<!-- sleeves -->
${sleeveBlock(`<text transform="translate(392,1272) rotate(-79.6)" font-family="Michroma, sans-serif" font-size="80" fill="${NAVY}" text-anchor="middle" textLength="740" lengthAdjust="spacing" stroke="${NAVY}" stroke-width="5.5" stroke-linejoin="round">ESD HOOPS</text>`)}
<!-- right sleeve: mirrored garment shape, print placed un-mirrored -->
${mir(`<path d="${sleeveL}" fill="${G}"/>`)}
<g transform="translate(1569,1280) rotate(79.6)" color="${NAVY}"><use href="#kgm" x="-330" y="-56" width="660" height="111.3"/></g>
${mir(`<g clip-path="url(#clSl)">${sleeveShade}</g>
  <path d="${cuffL}" fill="${G}"/>
  <g clip-path="url(#clCf)">
    <path d="${ribs(190, 400, 1680, 1850, 9, -24)}" stroke="#6b5a48" stroke-opacity=".22" stroke-width="2.2" fill="none"/>
    <path d="${cuffL}" fill="url(#cfG)"/>
    <path d="M210,1690 C270,1694 330,1706 390,1726" stroke="#5b4a3a" stroke-opacity=".4" stroke-width="7" fill="none" filter="url(#b3)"/>
  </g>`)}

<!-- body -->
<path d="${bodyP}" fill="#3b3229" opacity=".35" filter="url(#b8)" />
<path d="${bodyP}" fill="${G}"/>
<svg x="640" y="842" width="720" height="864" viewBox="0 0 3000 3600">${art}</svg>
<g clip-path="url(#clBd)">
  <rect x="520" y="370" width="960" height="1400" fill="url(#bdG)"/>
  <rect x="520" y="370" width="960" height="1400" fill="url(#bdV)"/>
  <g filter="url(#b20)" fill="none" stroke-linecap="round">
    <path d="M600,960 C640,1180 650,1420 610,1740" stroke="#5b4a3a" stroke-opacity=".22" stroke-width="34"/>
    <path d="M1400,960 C1360,1180 1350,1420 1390,1740" stroke="#5b4a3a" stroke-opacity=".22" stroke-width="34"/>
    <path d="M660,1000 C700,1250 700,1500 668,1750" stroke="#fff" stroke-opacity=".5" stroke-width="26"/>
    <path d="M1340,1000 C1300,1250 1300,1500 1332,1750" stroke="#fff" stroke-opacity=".5" stroke-width="26"/>
    <path d="M600,930 C700,900 760,860 800,800" stroke="#5b4a3a" stroke-opacity=".2" stroke-width="30"/>
    <path d="M1400,930 C1300,900 1240,860 1200,800" stroke="#5b4a3a" stroke-opacity=".2" stroke-width="30"/>
    <path d="M820,1560 C830,1640 826,1700 815,1760" stroke="#5b4a3a" stroke-opacity=".14" stroke-width="26"/>
    <path d="M1180,1540 C1172,1640 1176,1700 1188,1760" stroke="#5b4a3a" stroke-opacity=".14" stroke-width="26"/>
    <path d="M1000,1600 C1004,1660 1002,1710 998,1760" stroke="#fff" stroke-opacity=".35" stroke-width="30"/>
  </g>
  <!-- drop-shoulder seams -->
  <path d="M530,520 C562,650 578,800 590,960" stroke="#5b4a3a" stroke-opacity=".5" stroke-width="12" fill="none" filter="url(#b3)"/>
  <path d="M1470,520 C1438,650 1422,800 1410,960" stroke="#5b4a3a" stroke-opacity=".5" stroke-width="12" fill="none" filter="url(#b3)"/>
  <path d="M548,528 C578,650 592,800 603,950" stroke="#7a6856" stroke-opacity=".5" stroke-width="1.6" stroke-dasharray="7 5" fill="none"/>
  <path d="M1452,528 C1422,650 1408,800 1397,950" stroke="#7a6856" stroke-opacity=".5" stroke-width="1.6" stroke-dasharray="7 5" fill="none"/>
  <!-- hood shadow on the back -->
  <path d="${hoodP}" fill="#3b2f24" opacity=".55" filter="url(#b20)" transform="translate(0,26)"/>
</g>

<!-- hem rib -->
<path d="${hemP}" fill="${G}"/>
<g clip-path="url(#clHm)">
  <path d="${ribs(566, 1436, 1756, 1870, 9)}" stroke="#6b5a48" stroke-opacity=".22" stroke-width="2.2" fill="none"/>
  <rect x="560" y="1756" width="880" height="110" fill="url(#hmG)"/>
  <rect x="560" y="1756" width="880" height="110" fill="url(#bdG)"/>
  <path d="M572,1757 H1428" stroke="#5b4a3a" stroke-opacity=".45" stroke-width="8" filter="url(#b3)"/>
</g>

<!-- hood -->
<path d="${hoodP}" fill="${G}"/>
<g color="${NAVY}"><use href="#esd" x="934" y="424" width="132" height="195.5"/></g>
<g clip-path="url(#clHd)">
  <path d="${hoodP}" fill="url(#hdG)"/>
  <g filter="url(#b8)" fill="none" stroke-linecap="round">
    <path d="M800,470 C900,410 1100,410 1200,470" stroke="#5b4a3a" stroke-opacity=".30" stroke-width="20"/>
    <path d="M830,430 C910,378 1090,378 1170,430" stroke="#fff" stroke-opacity=".6" stroke-width="18"/>
    <path d="M880,380 C940,350 1060,350 1120,380" stroke="#5b4a3a" stroke-opacity=".22" stroke-width="14"/>
    <path d="M812,520 C830,640 900,720 990,770" stroke="#5b4a3a" stroke-opacity=".16" stroke-width="22"/>
    <path d="M1188,520 C1170,640 1100,720 1010,770" stroke="#5b4a3a" stroke-opacity=".16" stroke-width="22"/>
  </g>
  <!-- centre seam -->
  <path d="M1000,330 V416" stroke="#5b4a3a" stroke-opacity=".4" stroke-width="5" filter="url(#b3)"/>
  <path d="M1000,622 V804" stroke="#5b4a3a" stroke-opacity=".4" stroke-width="5" filter="url(#b3)"/>
  <path d="M1004,332 V414 M1004,624 V800" stroke="#7a6856" stroke-opacity=".5" stroke-width="1.4" stroke-dasharray="7 5"/>
  <path d="${hoodP}" fill="none" stroke="#5b4a3a" stroke-opacity=".35" stroke-width="10" filter="url(#b3)"/>
</g>

<!-- fabric texture over the whole garment -->
<g clip-path="url(#clAll)" style="mix-blend-mode:multiply">
  <rect x="150" y="250" width="1700" height="1650" filter="url(#weave)" opacity=".28"/>
  <rect x="150" y="250" width="1700" height="1650" filter="url(#grain)" opacity=".55"/>
</g>
</g>
</svg></body></html>`;
fs.writeFileSync(path.join(__dirname, 'mockup.html'), mock);
console.log('built');
