const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let width = 0;
let height = 0;
let ratio = Math.min(window.devicePixelRatio || 1, 2);
let particles = [];
let mouse = { x: -9999, y: -9999 };

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(20, Math.min(55, Math.floor(width / 28)));
  particles = Array.from({ length: count }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.12,
    r: i % 11 === 0 ? 1.35 : 0.8,
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(244, 239, 233, .25)';

  for (const p of particles) {
    if (!reducedMotion) {
      p.x += p.vx;
      p.y += p.vy;
    }

    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;

    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.hypot(dx, dy);
    const radius = dist < 120 ? p.r * 1.8 : p.r;

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 105) {
        ctx.strokeStyle = `rgba(191, 87, 0, ${0.055 * (1 - d / 105)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  if (!reducedMotion) requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});
window.addEventListener('pointerleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

resize();
draw();

document.getElementById('year').textContent = new Date().getFullYear();

const cards = document.querySelectorAll('.research-card, .person-card');
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.animate(
          [
            { opacity: 0, transform: 'translateY(16px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' }
        );
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  cards.forEach((card) => observer.observe(card));
}
