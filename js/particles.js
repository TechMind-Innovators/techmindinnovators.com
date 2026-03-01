/* ==========================================================================
   TechMind — Particle Network Background
   Interactive connected-dot canvas for the hero section.
   Particles drift gently; mouse/touch repels them.
   ========================================================================== */

(function () {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;

  /* ---- Tunables ---- */
  const DESKTOP_COUNT = 80;
  const MOBILE_COUNT = 35;
  const CONNECT_DIST = 140;        // px — max distance to draw a line
  const MOUSE_RADIUS = 160;        // px — repulsion zone
  const MOUSE_STRENGTH = 0.08;     // how hard particles push away
  const DRIFT_SPEED = 0.3;         // base drift velocity
  const LEASH_RADIUS = 60;         // px — max wander distance from home
  const LEASH_STRENGTH = 0.003;    // how firmly the leash pulls back

  /* ---- Brand colours (translucent) ---- */
  const DOT_TEAL = 'rgba(27, 152, 164, ';      // + alpha)
  const DOT_GOLD = 'rgba(247, 183, 49, ';
  const LINE_COLOR = 'rgba(27, 152, 164, ';

  /* ---- State ---- */
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let W, H, dpr, particleCount;

  /* ---- Resize ---- */
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- Create particles ---- */
  function init() {
    resize();
    particleCount = W < 768 ? MOBILE_COUNT : DESKTOP_COUNT;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
  }

  function createParticle() {
    const isGold = Math.random() < 0.15;   // ~15 % gold dots
    const radius = isGold ? 2 + Math.random() * 1.5 : 1.2 + Math.random() * 1.8;
    const alpha = 0.25 + Math.random() * 0.35;
    const x = Math.random() * W;
    const y = Math.random() * H;
    return {
      x: x,
      y: y,
      homeX: x,
      homeY: y,
      vx: (Math.random() - 0.5) * DRIFT_SPEED,
      vy: (Math.random() - 0.5) * DRIFT_SPEED,
      r: radius,
      color: isGold ? DOT_GOLD : DOT_TEAL,
      alpha: alpha,
    };
  }

  /* ---- Animation loop ---- */
  function tick() {
    ctx.clearRect(0, 0, W, H);

    /* Move & draw particles */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /* Drift */
      p.x += p.vx;
      p.y += p.vy;

      /* Mouse repulsion */
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_STRENGTH;
          p.vx += (dx / dist) * force * 4;
          p.vy += (dy / dist) * force * 4;
        }
      }

      /* Damping — keep speeds reasonable */
      p.vx *= 0.98;
      p.vy *= 0.98;

      /* Home-anchor leash — pull back toward spawn point,
         stronger the further it drifts from home */
      const hx = p.homeX - p.x;
      const hy = p.homeY - p.y;
      const homeDist = Math.sqrt(hx * hx + hy * hy);
      if (homeDist > 0) {
        /* Ramp up pull once past the leash radius */
        const pull = homeDist > LEASH_RADIUS
          ? LEASH_STRENGTH * (homeDist / LEASH_RADIUS)
          : LEASH_STRENGTH * 0.3;
        p.vx += (hx / homeDist) * pull * homeDist;
        p.vy += (hy / homeDist) * pull * homeDist;
      }

      /* Soft clamp — keep within canvas bounds */
      if (p.x < 0) p.x = 0;
      if (p.x > W) p.x = W;
      if (p.y < 0) p.y = 0;
      if (p.y > H) p.y = H;

      /* Draw dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    }

    /* Draw lines between nearby particles */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const opacity = (1 - dist / CONNECT_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = LINE_COLOR + opacity + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    /* Draw lines from mouse to nearby particles */
    if (mouse.active) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const opacity = (1 - dist / MOUSE_RADIUS) * 0.2;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = DOT_GOLD + opacity + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(tick);
  }

  /* ---- Events ---- */
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    }
  }

  function onTouchEnd() {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  }

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);

  /* Debounced resize */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });

  /* Go */
  init();
  requestAnimationFrame(tick);
})();
