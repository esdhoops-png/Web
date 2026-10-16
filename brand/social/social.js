/* Dibuja las líneas de media cancha FIBA en cada <svg class="court"> */
const COURT = `
  <rect x="2" y="2" width="496" height="466"/>
  <rect x="170" y="2" width="160" height="192"/>
  <circle cx="250" cy="194" r="60"/>
  <path d="M30 2V100A225 225 0 0 0 470 100V2"/>
  <path d="M208 52A42 42 0 0 0 292 52"/>
  <path d="M220 40H280"/>
  <circle cx="250" cy="52" r="8"/>
  <path d="M190 468A60 60 0 0 1 310 468"/>`;

document.querySelectorAll('svg.court').forEach((svg) => {
  svg.setAttribute('viewBox', '0 0 500 470');
  svg.innerHTML = COURT;
});
