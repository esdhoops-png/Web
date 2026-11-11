// Generates mockup.html and print-back.html (both self-contained) from one artwork definition.
const fs = require('fs');
const path = require('path');
const IMG = '../../public/images/';
const NAVY = '#0d1e2c', NAVY2 = '#142a3d', SAND = '#d9c4b0', CREAM = '#f2e9df', CLAY = '#b97a4e';

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Michroma&family=Orbitron:wght@800;900&family=Instrument+Serif:ital@0;1&family=Inter:wght@500;600;700&display=swap" rel="stylesheet">`;

// ---- Logos: paths copied verbatim from src/components/ui/Logos.tsx ----
const ESD_MARK = (color) => `<g fill="${color}">
<path d="M305,160 L448,250 V334 L398,304 V282 L356,256 V322 L432,372 L394,404 L356,380 V494 H398 V449 L448,415 V548 H305 Z"/>
<path d="M481,255 L622,160 V326 L573,305 V257 L530,285 V336 L622,372 V548 H481 V418 L530,439 V494 H573 V407 L481,372 Z"/>
<path fill-rule="evenodd" d="M657,160 L795,303 L797,548 H657 Z M708,290 L748,326 V495 H708 Z"/></g>
<g fill="none" stroke="${color}" stroke-width="25">
<path stroke-linejoin="round" d="M318,592 H784 V598 Q776,822 551,902 Q326,822 318,598 Z"/>
<path d="M551,592 V902"/>
<path d="M376,744 Q470,640 551,670 Q632,640 726,744"/>
<path d="M463,592 Q500,645 489,690 Q476,760 432,812"/>
<path d="M639,592 Q602,645 613,690 Q626,760 670,812"/></g>`;
const logosSrc = fs.readFileSync(path.join(__dirname, '../../src/components/ui/Logos.tsx'), 'utf8');
const kgmBlock = logosSrc.slice(logosSrc.indexOf('export function KgmWordmark'));
const KGM_PATHS = [...kgmBlock.matchAll(/<path d="([^"]+)"/g)].slice(0, 3).map(m => m[1]);
if (KGM_PATHS.length !== 3) throw new Error('KGM paths not found');
const KGM_MARK = (color) => `<g fill="${color}">${KGM_PATHS.map(d => `<path d="${d}"/>`).join('')}</g>`;
// helpers: place a logo by height at x,y (top-left)
const esdAt = (x, y, h, color) => { const s = h / 770; return `<g transform="translate(${x},${y}) scale(${s}) translate(-290,-150)">${ESD_MARK(color)}</g>`; };
const kgmAt = (x, y, h, color) => { const s = h / 162; return `<g transform="translate(${x},${y}) scale(${s}) translate(-48,-168)">${KGM_MARK(color)}</g>`; };

// ---- Back artwork, 3000 x 3600 user units ----
function artwork() {
  const P = { l: [330, 560, 720, 1600], m: [1140, 400, 720, 1860], r: [1950, 560, 720, 1600] };
  const rect = (a, extra = '') => `<rect x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}" ${extra}/>`;
  const kgmH = 78, kgmW = kgmH * 961 / 162, esdH = 210, esdW = esdH * 520 / 770, gap = 150;
  const lockW = esdW + gap + kgmW, lx = 1500 - lockW / 2;
  return `
<defs>
  <filter id="duoCar" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values=".3 .59 .11 0 0  .3 .59 .11 0 0  .3 .59 .11 0 0  0 0 0 1 0"/>
    <feComponentTransfer><feFuncR type="table" tableValues="0.04 0.30 0.93"/><feFuncG type="table" tableValues="0.09 0.40 0.87"/><feFuncB type="table" tableValues="0.14 0.50 0.80"/></feComponentTransfer>
  </filter>
  <filter id="duoPhoto" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values=".3 .59 .11 0 0  .3 .59 .11 0 0  .3 .59 .11 0 0  0 0 0 1 0"/>
    <feComponentTransfer><feFuncR type="table" tableValues="0.03 0.10 0.22 0.42"/><feFuncG type="table" tableValues="0.07 0.20 0.36 0.54"/><feFuncB type="table" tableValues="0.12 0.30 0.48 0.64"/></feComponentTransfer>
  </filter>
  <filter id="carShadow" filterUnits="userSpaceOnUse" x="0" y="2600" width="3000" height="600"><feGaussianBlur stdDeviation="38"/></filter>
  <clipPath id="cpL">${rect(P.l)}</clipPath><clipPath id="cpM">${rect(P.m)}</clipPath><clipPath id="cpR">${rect(P.r)}</clipPath>
  <linearGradient id="panelFade" gradientUnits="userSpaceOnUse" x1="0" y1="400" x2="0" y2="1660"><stop offset="0" stop-color="${NAVY}" stop-opacity=".6"/><stop offset=".3" stop-color="${NAVY}" stop-opacity="0"/><stop offset=".72" stop-color="${NAVY}" stop-opacity="0"/><stop offset="1" stop-color="${NAVY2}" stop-opacity="1"/></linearGradient>
  <pattern id="scan" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="3" fill="${NAVY}" opacity=".28"/></pattern>
</defs>

<!-- brand line -->
${esdAt(lx, 60, esdH, NAVY)}
<g stroke="${CLAY}" stroke-width="13" stroke-linecap="round"><path d="M${lx + esdW + gap / 2 - 26},${165 - 26} l52,52 M${lx + esdW + gap / 2 + 26},${165 - 26} l-52,52"/></g>
${kgmAt(lx + esdW + gap, 165 - kgmH / 2, kgmH, NAVY)}

<!-- side captions above panels -->
<g font-family="Inter, sans-serif" font-weight="600" font-size="44" letter-spacing="9" fill="${NAVY}">
  <text x="330" y="515">3X3 · 5X5</text>
  <text x="2670" y="515" text-anchor="end">DRIVEN BY AMBITION</text>
</g>
<rect x="330" y="436" width="46" height="12" fill="${CLAY}"/><rect x="2624" y="436" width="46" height="12" fill="${CLAY}"/>

<!-- three panels -->
${rect(P.l, `fill="${NAVY2}"`)}${rect(P.m, `fill="${NAVY2}"`)}${rect(P.r, `fill="${NAVY2}"`)}
<g clip-path="url(#cpL)"><image href="${IMG}kgm-torres-evx-white.webp" x="-1905" y="80" width="${761 * 4.3}" height="${396 * 4.3}" filter="url(#duoCar)"/></g>
<g clip-path="url(#cpM)"><image href="${IMG}esd-614.webp" x="805" y="290" width="${1440 * 1.06}" height="${1800 * 1.06}" filter="url(#duoPhoto)"/></g>
<g clip-path="url(#cpR)"><image href="${IMG}kgm-torres-evx-vx-white.webp" x="1795" y="-60" width="${772 * 4.6}" height="${406 * 4.6}" filter="url(#duoCar)"/></g>
${rect(P.l, 'fill="url(#scan)"')}${rect(P.m, 'fill="url(#scan)"')}${rect(P.r, 'fill="url(#scan)"')}
${rect(P.l, 'fill="url(#panelFade)"')}${rect(P.m, 'fill="url(#panelFade)"')}${rect(P.r, 'fill="url(#panelFade)"')}
<g font-family="Inter, sans-serif" font-weight="600" font-size="34" letter-spacing="8" fill="${CREAM}">
  <text x="372" y="640">TORRES EVX</text><text x="1182" y="480">ESD HOOPS</text><text x="1992" y="640">KGM</text>
</g>
<g fill="${CLAY}"><rect x="972" y="612" width="36" height="36"/><rect x="1782" y="452" width="36" height="36"/><rect x="2592" y="612" width="36" height="36"/></g>

<!-- hero car -->
<ellipse cx="1500" cy="2905" rx="1180" ry="46" fill="${NAVY}" opacity=".55" filter="url(#carShadow)"/>
<image href="${IMG}kgm-torres-evx-white.webp" x="190" y="1608" width="2620" height="${(2620 * 396 / 761).toFixed(1)}"/>

<!-- model name -->
<text x="1500" y="3262" text-anchor="middle" font-family="Michroma, sans-serif" font-size="268" fill="${NAVY}" stroke="${NAVY}" stroke-width="7" stroke-linejoin="round" textLength="2600" lengthAdjust="spacing">TORRES EVX</text>

<!-- technical row -->
<rect x="200" y="3326" width="2600" height="5" fill="${NAVY}"/>
<g font-family="Inter, sans-serif" font-weight="600" font-size="38" letter-spacing="7" fill="${NAVY}">
  <text x="200" y="3404">ESD HOOPS × KGM</text>
  <text x="1440" y="3404" text-anchor="middle">3X3 · 5X5 · PLAYER DEVELOPMENT</text>
  <text x="2800" y="3404" text-anchor="end">OFFICIAL PARTNER CONCEPT</text>
</g>
<text x="1500" y="3548" text-anchor="middle" font-family="'Instrument Serif', serif" font-style="italic" font-size="120" fill="${CLAY}">Two worlds. One vision.</text>
`;
}

// ---- print-back.html ----
const printHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ESD HOOPS x KGM - back print (sand)</title>
${FONTS}
<style>html,body{margin:0;padding:0;background:transparent}body{width:3000px;height:3600px;overflow:hidden}svg{display:block}</style></head>
<body><svg xmlns="http://www.w3.org/2000/svg" width="3000" height="3600" viewBox="0 0 3000 3600">${artwork()}</svg></body></html>`;
fs.writeFileSync(path.join(__dirname, 'print-back.html'), printHtml);

// ---- mockup.html ----
const SH = '#7d6450';   // shadow tone (multiply)
const sleevePath = (s) => `M ${-100 * s},-46 C ${-125 * s},-35 ${-139 * s},-5 ${-138 * s},45 C ${-132 * s},330 ${-116 * s},640 ${-106 * s},902 L ${106 * s},902 C ${114 * s},700 ${126 * s},480 ${138 * s},300 L ${150 * s},-46 Z`;
const cuffPath = `M -106,898 C -99,906 -95,916 -93,930 L -90,1002 Q 0,1014 90,1002 L 93,930 C 95,916 99,906 106,898 Z`;
const BODY = `M 868,452 C 760,480 560,548 440,586 C 462,720 515,860 588,965 C 572,1180 558,1430 556,1600 Q 556,1625 562,1642 L 1438,1642 Q 1444,1625 1444,1600 C 1442,1430 1428,1180 1412,965 C 1485,860 1538,720 1560,586 C 1440,548 1240,480 1132,452 Q 1000,500 868,452 Z`;
const HEM = `M 562,1638 C 565,1680 571,1722 578,1750 Q 1000,1766 1422,1750 C 1429,1722 1435,1680 1438,1638 Z`;
const HOOD = `M 768,522 C 712,430 704,268 802,188 C 884,122 1116,122 1198,188 C 1296,268 1288,430 1232,522 Q 1000,590 768,522 Z`;

function sleeve(side) {
  const s = side === 'L' ? 1 : -1;
  const tf = side === 'L' ? 'translate(530,650) rotate(12)' : 'translate(1470,650) rotate(-12)';
  const printEl = side === 'L'
    ? `<text transform="rotate(-90)" x="-505" y="30" text-anchor="middle" font-family="Orbitron, sans-serif" font-weight="900" font-size="100" fill="${NAVY}" textLength="650" lengthAdjust="spacingAndGlyphs" opacity=".96">ESD HOOPS</text>`
    : `<g transform="translate(-8,505) rotate(90) scale(${580 / 961}) translate(-528.5,-249)" opacity=".96">${KGM_MARK(NAVY)}</g>`;
  return `<g transform="${tf}">
  <path d="${sleevePath(s)}" fill="${SAND}"/>
  <path d="${cuffPath}" fill="#d3bda8"/>
  ${printEl}
  <g clip-path="url(#cpSleeve${side})" style="mix-blend-mode:multiply">
    <rect x="-160" y="-60" width="320" height="1000" fill="url(#sleeveShade${side})" mask="url(#sleeveFade)"/>
    <g fill="none" stroke="${SH}" stroke-linecap="round" filter="url(#blur9)" opacity=".5">
      <path d="M ${-120 * s},330 Q ${-20 * s},372 ${95 * s},352" stroke-width="16"/>
      <path d="M ${-112 * s},420 Q ${-30 * s},440 ${60 * s},470" stroke-width="12"/>
      <path d="M ${120 * s},520 Q ${40 * s},575 ${-70 * s},585" stroke-width="13"/>
      <path d="M ${-104 * s},800 Q ${-10 * s},832 ${100 * s},806" stroke-width="18"/>
      <path d="M ${-100 * s},852 Q 0,884 ${102 * s},858" stroke-width="18"/>
      <path d="M ${132 * s},330 C ${80 * s},250 ${30 * s},160 ${-20 * s},60" stroke-width="20" opacity=".7"/>
    </g>
  </g>
  <g clip-path="url(#cpSleeve${side})" style="mix-blend-mode:soft-light" fill="none" stroke="#fff" stroke-linecap="round" filter="url(#blur9)" opacity=".55">
      <path d="M ${-118 * s},310 Q ${-20 * s},350 ${95 * s},332" stroke-width="12"/>
      <path d="M ${-102 * s},780 Q ${-10 * s},812 ${100 * s},786" stroke-width="14"/>
      <path d="M ${-60 * s},60 L ${-40 * s},760" stroke-width="40" opacity=".5"/>
  </g>
  <g clip-path="url(#cpCuff)">
    <rect x="-110" y="895" width="220" height="125" fill="url(#ribV)"/>
    <rect x="-110" y="895" width="220" height="125" fill="url(#cuffShade)" style="mix-blend-mode:multiply"/>
    <rect x="-110" y="893" width="220" height="16" fill="${SH}" opacity=".45" filter="url(#blur5)" style="mix-blend-mode:multiply"/>
  </g>
  <g clip-path="url(#cpSleeve${side})" opacity=".55"><rect x="-160" y="-60" width="320" height="980" filter="url(#grain)"/></g>
</g>`;
}

const mockHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ESD HOOPS x KGM - hoodie mockup (sand)</title>
${FONTS}
<style>html,body{margin:0;padding:0;background:#9a9d9f}body{width:2000px;height:2000px;overflow:hidden}svg{display:block}</style></head>
<body><svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000" viewBox="0 0 2000 2000">
<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b4b7b8"/><stop offset=".55" stop-color="#a3a6a8"/><stop offset="1" stop-color="#8d9092"/></linearGradient>
  <radialGradient id="spot" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".6" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f8284"/><stop offset="1" stop-color="#9c9fa1"/></linearGradient>
  <filter id="concrete" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="4" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 -.16"/></filter>
  <filter id="grain" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .27  0 0 0 0 .2  0 0 0 .9 -.34"/></filter>
  <filter id="blur5" filterUnits="userSpaceOnUse" x="-300" y="-300" width="2600" height="2600"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="blur9" filterUnits="userSpaceOnUse" x="-300" y="-300" width="2600" height="2600"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="blur18" filterUnits="userSpaceOnUse" x="-300" y="-300" width="2600" height="2600"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="blur40" filterUnits="userSpaceOnUse" x="-300" y="-300" width="2600" height="2600"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="drop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="34" stdDeviation="34" flood-color="#1a1d20" flood-opacity=".42"/></filter>
  <filter id="inkSoft"><feGaussianBlur stdDeviation=".35"/></filter>

  <clipPath id="cpSleeveL"><path d="${sleevePath(1)}"/></clipPath>
  <clipPath id="cpSleeveR"><path d="${sleevePath(-1)}"/></clipPath>
  <clipPath id="cpCuff"><path d="${cuffPath}"/></clipPath>
  <clipPath id="cpBody"><path d="${BODY}"/></clipPath>
  <clipPath id="cpHem"><path d="${HEM}"/></clipPath>
  <clipPath id="cpHood"><path d="${HOOD}"/></clipPath>

  <linearGradient id="sleeveShadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${SH}" stop-opacity=".55"/><stop offset=".2" stop-color="${SH}" stop-opacity=".08"/><stop offset=".6" stop-color="${SH}" stop-opacity="0"/><stop offset="1" stop-color="${SH}" stop-opacity=".6"/></linearGradient>
  <linearGradient id="sleeveShadeR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${SH}" stop-opacity=".55"/><stop offset=".2" stop-color="${SH}" stop-opacity=".08"/><stop offset=".6" stop-color="${SH}" stop-opacity="0"/><stop offset="1" stop-color="${SH}" stop-opacity=".6"/></linearGradient>
  <linearGradient id="cuffShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${SH}" stop-opacity=".6"/><stop offset=".3" stop-color="${SH}" stop-opacity=".05"/><stop offset=".7" stop-color="${SH}" stop-opacity=".05"/><stop offset="1" stop-color="${SH}" stop-opacity=".6"/></linearGradient>
  <linearGradient id="bodyShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${SH}" stop-opacity=".5"/><stop offset=".12" stop-color="${SH}" stop-opacity=".1"/><stop offset=".5" stop-color="${SH}" stop-opacity="0"/><stop offset=".88" stop-color="${SH}" stop-opacity=".1"/><stop offset="1" stop-color="${SH}" stop-opacity=".5"/></linearGradient>
  <linearGradient id="bodyShadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SH}" stop-opacity="0"/><stop offset=".8" stop-color="${SH}" stop-opacity="0"/><stop offset="1" stop-color="${SH}" stop-opacity=".32"/></linearGradient>
  <radialGradient id="hoodShade" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="${SH}" stop-opacity="0"/><stop offset=".62" stop-color="${SH}" stop-opacity=".08"/><stop offset="1" stop-color="${SH}" stop-opacity=".62"/></radialGradient>
  <linearGradient id="sfg" gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="0" y2="420"><stop offset="0" stop-color="#555"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="sleeveFade" maskUnits="userSpaceOnUse" x="-200" y="-100" width="400" height="1100"><rect x="-200" y="-100" width="400" height="1100" fill="url(#sfg)"/></mask>
  <pattern id="ribV" width="7" height="10" patternUnits="userSpaceOnUse"><rect width="7" height="10" fill="#d6c0ab"/><rect x="0" width="2.4" height="10" fill="#b39a84"/><rect x="2.4" width="1.4" height="10" fill="#e6d5c4"/></pattern>
</defs>

<!-- studio -->
<rect width="2000" height="2000" fill="url(#wall)"/>
<rect width="2000" height="2000" filter="url(#concrete)" opacity=".5"/>
<rect width="2000" height="2000" fill="url(#spot)"/>
<rect y="1868" width="2000" height="132" fill="url(#floor)"/>
<rect y="1862" width="2000" height="14" fill="#5d6062" opacity=".35" filter="url(#blur5)"/>
<ellipse cx="1000" cy="1880" rx="560" ry="26" fill="#222" opacity=".32" filter="url(#blur18)"/>

<!-- wall shadow -->
<g transform="translate(0,36)" fill="#15181b" opacity=".4" filter="url(#blur40)">
  <path transform="translate(530,650) rotate(12)" d="${sleevePath(1)}"/><path transform="translate(530,650) rotate(12)" d="${cuffPath}"/>
  <path transform="translate(1470,650) rotate(-12)" d="${sleevePath(-1)}"/><path transform="translate(1470,650) rotate(-12)" d="${cuffPath}"/>
  <path d="${BODY}"/><path d="${HEM}"/><path d="${HOOD}"/>
</g>
<g>
  ${sleeve('L')}
  ${sleeve('R')}
  <!-- body shadow onto sleeves -->
  <g transform="translate(0,10)" fill="#3a2a1e" opacity=".38" filter="url(#blur9)"><path d="${BODY}"/><path d="${HEM}"/></g>

  <!-- body -->
  <path d="${HEM}" fill="#d3bda8"/>
  <g clip-path="url(#cpHem)">
    <rect x="550" y="1630" width="900" height="140" fill="url(#ribV)"/>
    <rect x="550" y="1630" width="900" height="140" fill="url(#bodyShade)" style="mix-blend-mode:multiply"/>
    <rect x="550" y="1632" width="900" height="20" fill="${SH}" opacity=".55" filter="url(#blur5)" style="mix-blend-mode:multiply"/>
    <rect x="550" y="1735" width="900" height="30" fill="${SH}" opacity=".3" filter="url(#blur9)" style="mix-blend-mode:multiply"/>
  </g>
  <path d="${BODY}" fill="${SAND}"/>

  <!-- back print -->
  <svg x="680" y="672" width="640" height="768" viewBox="0 0 3000 3600" opacity=".97">${artwork()}</svg>

  <!-- body shading over print -->
  <g clip-path="url(#cpBody)">
    <g style="mix-blend-mode:multiply">
      <rect x="430" y="440" width="1140" height="1210" fill="url(#bodyShade)"/>
      <rect x="430" y="440" width="1140" height="1210" fill="url(#bodyShadeV)"/>
      <g fill="none" stroke="${SH}" stroke-linecap="round" filter="url(#blur18)" opacity=".5">
        <path d="M 590,960 C 640,1100 660,1250 640,1420" stroke-width="34"/>
        <path d="M 1410,960 C 1360,1100 1340,1250 1360,1420" stroke-width="34"/>
        <path d="M 470,640 C 520,800 560,900 600,975" stroke-width="30"/>
        <path d="M 1530,640 C 1480,800 1440,900 1400,975" stroke-width="30"/>
      </g>
      <g fill="none" stroke="${SH}" stroke-linecap="round" filter="url(#blur9)" opacity=".42">
        <path d="M 640,1500 Q 652,1570 646,1640" stroke-width="16"/>
        <path d="M 760,1530 Q 752,1590 762,1640" stroke-width="13"/>
        <path d="M 905,1545 Q 912,1600 904,1640" stroke-width="12"/>
        <path d="M 1060,1540 Q 1052,1600 1062,1640" stroke-width="12"/>
        <path d="M 1215,1530 Q 1224,1590 1214,1640" stroke-width="13"/>
        <path d="M 1350,1500 Q 1340,1570 1348,1640" stroke-width="16"/>
        <path d="M 600,1100 Q 760,1180 700,1330" stroke-width="12" opacity=".5"/>
        <path d="M 1400,1100 Q 1240,1180 1300,1330" stroke-width="12" opacity=".5"/>
      </g>
      <!-- shadow cast by hood -->
      <path d="M 735,510 Q 1000,668 1265,510 L 1265,430 L 735,430 Z" fill="${SH}" opacity=".62" filter="url(#blur18)"/>
    </g>
    <g style="mix-blend-mode:soft-light" fill="none" stroke="#fff" stroke-linecap="round" filter="url(#blur18)" opacity=".5">
      <path d="M 520,585 C 640,548 760,512 850,488" stroke-width="30"/>
      <path d="M 1480,585 C 1360,548 1240,512 1150,488" stroke-width="30"/>
      <path d="M 690,980 C 720,1150 720,1300 700,1480" stroke-width="40" opacity=".6"/>
      <path d="M 1310,980 C 1280,1150 1280,1300 1300,1480" stroke-width="40" opacity=".6"/>
    </g>
  </g>
  <!-- seams -->
  <g fill="none" stroke="#9c846f" stroke-linecap="round">
    <path d="M 440,586 C 462,720 515,860 588,965" stroke-width="2.2" opacity=".8"/>
    <path d="M 1560,586 C 1538,720 1485,860 1412,965" stroke-width="2.2" opacity=".8"/>
    <path d="M 452,588 C 474,718 525,852 596,955" stroke-width="1.4" stroke-dasharray="6 5" opacity=".65"/>
    <path d="M 1548,588 C 1526,718 1475,852 1404,955" stroke-width="1.4" stroke-dasharray="6 5" opacity=".65"/>
    <path d="M 566,1628 L 1434,1628" stroke-width="1.4" stroke-dasharray="6 5" opacity=".6"/>
  </g>

  <!-- hood -->
  <path d="${HOOD}" fill="${SAND}"/>
  ${esdAt(1000 - 60.8, 248, 180, NAVY)}
  <g clip-path="url(#cpHood)">
    <rect x="690" y="110" width="620" height="490" fill="url(#hoodShade)" style="mix-blend-mode:multiply"/>
    <g style="mix-blend-mode:multiply" fill="none" stroke="${SH}" stroke-linecap="round" filter="url(#blur9)" opacity=".5">
      <path d="M 780,486 Q 1000,566 1220,486" stroke-width="26"/>
      <path d="M 760,410 Q 790,300 860,225" stroke-width="16"/>
      <path d="M 1240,410 Q 1210,300 1140,225" stroke-width="16"/>
      <path d="M 840,505 Q 870,470 880,430" stroke-width="12"/>
      <path d="M 1160,505 Q 1130,470 1120,430" stroke-width="12"/>
    </g>
    <g style="mix-blend-mode:soft-light" fill="none" stroke="#fff" stroke-linecap="round" filter="url(#blur18)" opacity=".6">
      <path d="M 900,190 Q 1000,160 1100,190" stroke-width="40"/>
    </g>
  </g>
  <g fill="none" stroke="#9c846f" stroke-linecap="round">
    <path d="M 900,146 C 874,280 878,430 898,560" stroke-width="2" opacity=".85"/>
    <path d="M 1100,146 C 1126,280 1122,430 1102,560" stroke-width="2" opacity=".85"/>
    <path d="M 909,145 C 884,280 888,430 907,562" stroke-width="1.3" stroke-dasharray="6 5" opacity=".6"/>
    <path d="M 1091,145 C 1116,280 1112,430 1093,562" stroke-width="1.3" stroke-dasharray="6 5" opacity=".6"/>
    <path d="M 768,522 Q 1000,590 1232,522" stroke-width="2.4" opacity=".7"/>
  </g>

  <!-- fabric grain over everything -->
  <g style="mix-blend-mode:multiply" opacity=".55">
    <g clip-path="url(#cpBody)"><rect x="430" y="440" width="1140" height="1210" filter="url(#grain)"/></g>
    <g clip-path="url(#cpHood)"><rect x="690" y="110" width="620" height="490" filter="url(#grain)"/></g>
  </g>
</g>
</svg></body></html>`;
fs.writeFileSync(path.join(__dirname, 'mockup.html'), mockHtml);
console.log('built');
