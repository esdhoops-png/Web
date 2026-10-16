/* Balón con costuras en 3D (mismo dibujo que la web) y pistas concéntricas */
const SEAMS = (() => {
  const curves = [];
  const circle = (fn) => {
    const pts = [];
    for (let i = 0; i <= 120; i++) pts.push(fn((i / 120) * Math.PI * 2));
    curves.push(pts);
  };
  circle((t) => [Math.cos(t), Math.sin(t), 0]);
  circle((t) => [0, Math.cos(t), Math.sin(t)]);
  [-1, 1].forEach((s) => circle((t) => {
    const v = [s * 0.74, Math.cos(t) * 0.67, Math.sin(t) * 0.67];
    const l = Math.hypot(...v);
    return v.map((c) => c / l);
  }));
  return curves;
})();

window.addEventListener('load', () => document.querySelectorAll('.ball').forEach((el) => {
  const canvas = document.createElement('canvas');
  el.append(canvas);
  const size = el.clientWidth;
  canvas.width = size * 2;
  canvas.height = size * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  const R = size / 2;
  const ay = parseFloat(el.dataset.angle || '0.6');
  const [ax, az] = [0.42, 0.32];
  const [cy, sy, cx, sx, cz, sz] = [Math.cos(ay), Math.sin(ay), Math.cos(ax), Math.sin(ax), Math.cos(az), Math.sin(az)];
  ctx.lineCap = 'round';
  SEAMS.forEach((pts) => {
    let prev = null;
    pts.forEach(([x, y, z]) => {
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      const y1 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      const p = [R + (x1 * cz - y1 * sz) * R * 0.985, R + (x1 * sz + y1 * cz) * R * 0.985, z2];
      if (prev && prev[2] > -0.05 && p[2] > -0.05) {
        const d = (prev[2] + p[2]) / 2;
        ctx.strokeStyle = `rgba(70, 58, 50, ${0.45 + d * 0.5})`;
        ctx.lineWidth = Math.max(1.5, size * 0.016) * (0.55 + d * 0.45);
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(p[0], p[1]);
        ctx.stroke();
      }
      prev = p;
    });
  });
}));

document.querySelectorAll('svg.arches').forEach((svg) => {
  const tones = ['#d7cfc7', '#e3ddd7', '#cfc6bd'];
  svg.setAttribute('viewBox', '0 0 1000 1000');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  let html = '';
  for (let k = 0; k < 7; k++) {
    const r = 150 + k * 46;
    html += `<path stroke="${tones[k % 3]}" stroke-width="22" d="M${500 - r} 0V${430 - r * 0.25}A${r} ${r} 0 0 0 ${500 + r} ${430 - r * 0.25}V0"/>`;
    html += `<path stroke="${tones[k % 3]}" stroke-width="22" d="M${500 - r} 1000V${570 + r * 0.25}A${r} ${r} 0 0 1 ${500 + r} ${570 + r * 0.25}V1000"/>`;
  }
  svg.innerHTML = html;
});
