document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
});

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealItems.forEach((item) => observer.observe(item));

/* Scoreboard scroll rail: a small ball that travels down a rail as the page scrolls */
const railBall = document.getElementById('railBall');
const rail = document.getElementById('scoreboardRail');
if (railBall && rail) {
  const updateRail = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    const railHeight = rail.clientHeight;
    railBall.style.top = `${progress * railHeight}px`;
  };
  window.addEventListener('scroll', updateRail, { passive: true });
  window.addEventListener('resize', updateRail);
  updateRail();
}

/* Hero basketball: a studio-style basketball, dropped in and settled into a smooth idle dribble */
const canvas = document.getElementById('ballCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let floorY = 0;
  let t = 0;

  const ball = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    rotation: 0,
    tilt: 0,
    squashX: 1,
    squashY: 1,
  };

  const GRAVITY = 0.62;
  const BOUNCE_DAMPING = 0.66;
  let mode = 'drop'; /* 'drop' -> physics fall/bounce, 'idle' -> settled sine dribble */
  let idlePhase = 0;
  const IDLE_PERIOD = 62; /* frames per dribble cycle */
  let idleAmplitude = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ball.radius = Math.max(30, Math.min(width, height) * 0.19);
    floorY = height - ball.radius * 0.5;
    idleAmplitude = ball.radius * 1.7;
    if (ball.x === 0) {
      ball.x = width * 0.5;
      ball.y = -ball.radius;
    }
  }

  function drawGlow() {
    const glow = ctx.createRadialGradient(
      width * 0.5, floorY - ball.radius * 1.4, 0,
      width * 0.5, floorY - ball.radius * 1.4, ball.radius * 3.6
    );
    glow.addColorStop(0, 'rgba(217, 196, 176, 0.14)');
    glow.addColorStop(1, 'rgba(217, 196, 176, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  function drawFloorLine() {
    ctx.save();
    ctx.strokeStyle = 'rgba(217, 196, 176, 0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY + ball.radius * 0.5);
    ctx.lineTo(width, floorY + ball.radius * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  function drawShadow() {
    const heightAboveFloor = Math.max(0, floorY - ball.y);
    const heightRatio = Math.min(1, heightAboveFloor / (ball.radius * 3.2));
    const shadowScale = 1 - heightRatio * 0.4;
    const shadowAlpha = 0.4 - heightRatio * 0.22;
    ctx.save();
    ctx.filter = 'blur(3px)';
    ctx.translate(ball.x, floorY + ball.radius * 0.5);
    ctx.scale(shadowScale, 1);
    ctx.beginPath();
    ctx.ellipse(0, 0, ball.radius * 0.85, ball.radius * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(8, 16, 24, ${shadowAlpha})`;
    ctx.fill();
    ctx.restore();
  }

  let pebblePattern = null;
  function buildPebbleTexture() {
    const tile = document.createElement('canvas');
    const size = 26;
    tile.width = size;
    tile.height = size;
    const tctx = tile.getContext('2d');
    const dots = [
      [3, 4, 0.9], [10, 2, 0.7], [18, 4, 0.85], [24, 9, 0.7],
      [6, 10, 0.8], [14, 9, 0.75], [21, 15, 0.9], [2, 16, 0.7],
      [9, 17, 0.85], [17, 21, 0.75], [24, 22, 0.8], [4, 23, 0.65],
    ];
    dots.forEach(([px, py, a]) => {
      tctx.beginPath();
      tctx.arc(px, py, 0.9, 0, Math.PI * 2);
      tctx.fillStyle = `rgba(20, 10, 4, ${0.32 * a})`;
      tctx.fill();
      tctx.beginPath();
      tctx.arc(px - 0.5, py - 0.5, 0.45, 0, Math.PI * 2);
      tctx.fillStyle = `rgba(255, 205, 165, ${0.28 * a})`;
      tctx.fill();
    });
    pebblePattern = ctx.createPattern(tile, 'repeat');
  }

  function seamStroke(draw, width1, color1, width2, color2, offset) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = color1;
    ctx.lineWidth = width1;
    draw(0);
    ctx.strokeStyle = color2;
    ctx.lineWidth = width2;
    draw(offset);
  }

  function drawBall() {
    if (!pebblePattern) buildPebbleTexture();
    const r = ball.radius;

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.tilt);
    ctx.scale(ball.squashX, ball.squashY);
    ctx.rotate(ball.rotation);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    /* base leather color with a soft key light, ambient fill and dark rim */
    const gradient = ctx.createRadialGradient(
      -r * 0.38, -r * 0.42, r * 0.05,
      r * 0.05, r * 0.1, r * 1.3
    );
    gradient.addColorStop(0, '#ffb26e');
    gradient.addColorStop(0.32, '#f0813f');
    gradient.addColorStop(0.62, '#d5601f');
    gradient.addColorStop(0.85, '#9c4416');
    gradient.addColorStop(1, '#5f2a0e');
    ctx.fillStyle = gradient;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = pebblePattern;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.globalAlpha = 1;

    const seamDark = 'rgba(30, 14, 6, 0.88)';
    const seamLight = 'rgba(255, 190, 140, 0.18)';
    const w1 = Math.max(2, r * 0.055);
    const w2 = Math.max(1, r * 0.02);

    seamStroke(() => {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r);
      ctx.stroke();
    }, w1, seamDark, w2, seamLight, 1.4);

    seamStroke(() => {
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();
    }, w1, seamDark, w2, seamLight, 1.4);

    seamStroke(() => {
      ctx.beginPath();
      ctx.arc(-r * 0.62, 0, r * 0.86, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.stroke();
    }, w1, seamDark, w2, seamLight, 1.4);

    seamStroke(() => {
      ctx.beginPath();
      ctx.arc(r * 0.62, 0, r * 0.86, Math.PI - Math.PI * 0.3, Math.PI + Math.PI * 0.3);
      ctx.stroke();
    }, w1, seamDark, w2, seamLight, 1.4);

    /* specular highlight */
    const sheen = ctx.createRadialGradient(
      -r * 0.4, -r * 0.45, 0,
      -r * 0.4, -r * 0.45, r * 0.5
    );
    sheen.addColorStop(0, 'rgba(255,255,255,0.4)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.45, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    /* ambient occlusion rim */
    const rim = ctx.createRadialGradient(0, 0, r * 0.72, 0, 0, r);
    rim.addColorStop(0, 'rgba(20, 8, 2, 0)');
    rim.addColorStop(1, 'rgba(20, 8, 2, 0.35)');
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    drawGlow();
    drawFloorLine();
    drawShadow();
    drawBall();
  }

  function step() {
    t += 1;

    if (mode === 'drop') {
      ball.vy += GRAVITY;
      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.rotation += ball.vx * 0.03;
      ball.vx *= 0.995;

      if (ball.y + ball.radius > floorY) {
        ball.y = floorY - ball.radius;
        ball.vy = -ball.vy * BOUNCE_DAMPING;
        ball.squashX = 1.2;
        ball.squashY = 0.82;
        if (Math.abs(ball.vy) < 5.5) {
          mode = 'idle';
          idlePhase = 0;
        }
      }
    } else {
      idlePhase += 1;
      const cycle = (idlePhase % IDLE_PERIOD) / IDLE_PERIOD;
      const bounce = Math.abs(Math.sin(cycle * Math.PI));
      ball.y = floorY - ball.radius - bounce * idleAmplitude;
      ball.tilt = Math.sin(idlePhase * 0.045) * 0.05;
      if (cycle < 0.06 && idlePhase % IDLE_PERIOD < 3) {
        ball.squashX = 1.14;
        ball.squashY = 0.86;
      }
    }

    ball.squashX += (1 - ball.squashX) * 0.16;
    ball.squashY += (1 - ball.squashY) * 0.16;

    render();
  }

  function drawStatic() {
    mode = 'idle';
    ball.x = width * 0.5;
    ball.y = floorY - ball.radius;
    render();
  }

  function kick(clientX) {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const dx = px - ball.x;
    mode = 'drop';
    ball.vx = dx * 0.05 + (Math.random() - 0.5) * 1.5;
    ball.vy = -15 - Math.random() * 2;
  }

  canvas.addEventListener('pointerdown', (event) => {
    kick(event.clientX);
  });

  window.addEventListener('resize', () => {
    resize();
    if (prefersReducedMotion) drawStatic();
  });

  resize();

  if (prefersReducedMotion) {
    drawStatic();
  } else {
    (function loop() {
      step();
      requestAnimationFrame(loop);
    })();
  }
}
