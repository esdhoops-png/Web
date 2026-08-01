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

/* Hero basketball: a physics-driven bouncing ball drawn on canvas */
const canvas = document.getElementById('ballCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  const ball = {
    x: 0,
    y: 0,
    vx: 2.4,
    vy: 0,
    radius: 0,
    rotation: 0,
    squashX: 1,
    squashY: 1,
  };

  const GRAVITY = 0.55;
  const BOUNCE_DAMPING = 0.72;
  const WALL_DAMPING = 0.85;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ball.radius = Math.max(28, Math.min(width, height) * 0.16);
    if (ball.x === 0) {
      ball.x = width * 0.5;
      ball.y = height * 0.25;
    }
  }

  function drawCourtFloor() {
    const floorY = height - ball.radius * 0.6;
    ctx.save();
    ctx.strokeStyle = 'rgba(217, 196, 176, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY + ball.radius * 0.6);
    ctx.lineTo(width, floorY + ball.radius * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  function drawShadow() {
    const floorY = height - ball.radius * 0.6;
    const heightRatio = Math.max(0, 1 - (floorY - ball.y) / (height * 0.7));
    const shadowScale = 0.6 + heightRatio * 0.5;
    ctx.save();
    ctx.translate(ball.x, floorY);
    ctx.scale(shadowScale, 1);
    ctx.beginPath();
    ctx.ellipse(0, 0, ball.radius * 0.9, ball.radius * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(13, 30, 44, ${0.35 * shadowScale})`;
    ctx.fill();
    ctx.restore();
  }

  let pebblePattern = null;
  function buildPebbleTexture() {
    const tile = document.createElement('canvas');
    const size = 22;
    tile.width = size;
    tile.height = size;
    const tctx = tile.getContext('2d');
    tctx.fillStyle = 'rgba(0,0,0,0)';
    tctx.fillRect(0, 0, size, size);
    const dots = [[4,4],[13,3],[8,10],[17,12],[3,15],[12,18],[19,19]];
    dots.forEach(([px, py]) => {
      tctx.beginPath();
      tctx.arc(px, py, 1.15, 0, Math.PI * 2);
      tctx.fillStyle = 'rgba(0,0,0,0.35)';
      tctx.fill();
      tctx.beginPath();
      tctx.arc(px - 0.4, py - 0.4, 0.5, 0, Math.PI * 2);
      tctx.fillStyle = 'rgba(255,190,150,0.25)';
      tctx.fill();
    });
    pebblePattern = ctx.createPattern(tile, 'repeat');
  }

  function drawBall() {
    if (!pebblePattern) buildPebbleTexture();

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.scale(ball.squashX, ball.squashY);
    ctx.rotate(ball.rotation);

    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.clip();

    const gradient = ctx.createRadialGradient(
      -ball.radius * 0.4, -ball.radius * 0.45, ball.radius * 0.08,
      ball.radius * 0.1, ball.radius * 0.2, ball.radius * 1.25
    );
    gradient.addColorStop(0, '#ff9d5c');
    gradient.addColorStop(0.4, '#e2672b');
    gradient.addColorStop(0.78, '#a8481a');
    gradient.addColorStop(1, '#6e2f10');
    ctx.fillStyle = gradient;
    ctx.fillRect(-ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);

    ctx.fillStyle = pebblePattern;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(-ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(15, 15, 15, 0.82)';
    ctx.lineWidth = Math.max(1.8, ball.radius * 0.05);

    ctx.beginPath();
    ctx.moveTo(0, -ball.radius);
    ctx.lineTo(0, ball.radius);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-ball.radius, 0);
    ctx.lineTo(ball.radius, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-ball.radius * 0.55, 0, ball.radius * 0.85, -Math.PI * 0.32, Math.PI * 0.32);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ball.radius * 0.55, 0, ball.radius * 0.85, Math.PI - Math.PI * 0.32, Math.PI + Math.PI * 0.32);
    ctx.stroke();

    const sheen = ctx.createRadialGradient(
      -ball.radius * 0.4, -ball.radius * 0.45, 0,
      -ball.radius * 0.4, -ball.radius * 0.45, ball.radius * 0.55
    );
    sheen.addColorStop(0, 'rgba(255,255,255,0.35)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.arc(-ball.radius * 0.4, -ball.radius * 0.45, ball.radius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function step() {
    const floorY = height - ball.radius * 0.6;

    ball.vy += GRAVITY;
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.rotation += ball.vx * 0.035;

    if (ball.y + ball.radius > floorY) {
      ball.y = floorY - ball.radius;
      ball.vy = -ball.vy * BOUNCE_DAMPING;
      ball.vx *= 0.98;
      ball.squashX = 1.22;
      ball.squashY = 0.8;
      if (Math.abs(ball.vy) < 3) {
        ball.vy = -9 - Math.random() * 2;
        ball.vx += (Math.random() - 0.5) * 2.2;
      }
    }

    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = Math.abs(ball.vx) * WALL_DAMPING;
    } else if (ball.x + ball.radius > width) {
      ball.x = width - ball.radius;
      ball.vx = -Math.abs(ball.vx) * WALL_DAMPING;
    }

    ball.squashX += (1 - ball.squashX) * 0.18;
    ball.squashY += (1 - ball.squashY) * 0.18;

    ctx.clearRect(0, 0, width, height);
    drawCourtFloor();
    drawShadow();
    drawBall();
  }

  function drawStatic() {
    ball.x = width * 0.5;
    ball.y = height - ball.radius * 0.6 - ball.radius;
    ctx.clearRect(0, 0, width, height);
    drawCourtFloor();
    drawShadow();
    drawBall();
  }

  function kick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const dx = px - ball.x;
    ball.vx = dx * 0.06 + (Math.random() - 0.5) * 2;
    ball.vy = -14 - Math.random() * 3;
  }

  canvas.addEventListener('pointerdown', (event) => {
    kick(event.clientX, event.clientY);
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
