/* ==========================================================================
   TechMind — Hero "Connected Ring" network
   A calm, interactive canvas: nodes orbit the TechMind ring (teal ring,
   gold core) while ambient nodes drift and link up nearby. Moving the
   pointer draws gold connections and gently pulls the network toward it.

   Built to stay light on a static site:
   - ~70 nodes on desktop, ~34 on phones, capped device-pixel-ratio
   - pauses when the hero is off-screen or the tab is hidden
   - honours prefers-reduced-motion (draws one still frame, no loop)
   - pointer is read from the hero, so links/buttons stay clickable
   ========================================================================== */

(function () {
  const canvas = document.getElementById('hero-particles');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero') || canvas.parentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Brand colours ---- */
  const TEAL = '27,152,164';
  const GOLD = '247,183,49';
  const WHITE = '255,255,255';

  /* ---- Tunables ---- */
  const LINK_DIST = 120;      // px — ambient links
  const POINTER_DIST = 170;   // px — pointer links
  const POINTER_PULL = 0.018; // how strongly nodes lean toward the pointer

  let W = 0, H = 0, dpr = 1;
  let ring = { x: 0, y: 0, r: 0 };
  let ringNodes = [], ambient = [];
  let pointer = { x: 0, y: 0, active: false };
  let alpha = 1;
  let running = false, onScreen = true, rafId = 0, t = 0;

  /* ---- Layout: ring sits to the right on wide screens, top-right on phones ---- */
  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const wide = W >= 900;
    alpha = wide ? 1 : 0.5;  // keep text readable where the ring sits behind it
    ring.r = wide ? Math.min(H * 0.3, 230) : Math.min(W * 0.32, 130);
    ring.x = wide ? Math.min(W * 0.74, (W + 1180) / 2 - ring.r * 0.6) : W - ring.r * 0.55;
    ring.y = wide ? H * 0.5 : ring.r * 0.9 + 20;

    const ringCount = wide ? 56 : 30;
    const ambientCount = wide ? 30 : 10;

    ringNodes = [];
    for (let i = 0; i < ringCount; i++) {
      ringNodes.push({
        a: (i / ringCount) * Math.PI * 2,
        band: (Math.random() - 0.5) * (wide ? 34 : 20),           // thickness of the ring
        speed: 0.0011 + Math.random() * 0.0006,
        r: 1.4 + Math.random() * 1.6,
        x: 0, y: 0, ox: 0, oy: 0
      });
    }
    ambient = [];
    for (let i = 0; i < ambientCount; i++) {
      ambient.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1 + Math.random() * 1.4,
        gold: Math.random() < 0.12
      });
    }
    place(0);
  }

  /* ---- Simulation ---- */
  function place(dt) {
    const breathe = 1 + Math.sin(t * 0.0009) * 0.025;
    for (const n of ringNodes) {
      n.a += n.speed * dt;
      const rr = ring.r * breathe + n.band;
      let x = ring.x + Math.cos(n.a) * rr;
      let y = ring.y + Math.sin(n.a) * rr;
      if (pointer.active) {
        const dx = pointer.x - x, dy = pointer.y - y;
        const d = Math.hypot(dx, dy);
        if (d < POINTER_DIST * 1.4) {
          const k = (1 - d / (POINTER_DIST * 1.4)) * 26;
          n.ox += ((dx / (d || 1)) * k - n.ox) * 0.08;
          n.oy += ((dy / (d || 1)) * k - n.oy) * 0.08;
        } else { n.ox *= 0.92; n.oy *= 0.92; }
      } else { n.ox *= 0.92; n.oy *= 0.92; }
      n.x = x + n.ox;
      n.y = y + n.oy;
    }
    for (const p of ambient) {
      p.x += p.vx * dt * 0.06;
      p.y += p.vy * dt * 0.06;
      if (pointer.active) {
        p.x += (pointer.x - p.x) * POINTER_PULL * 0.15;
        p.y += (pointer.y - p.y) * POINTER_PULL * 0.15;
      }
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
    }
  }

  function link(a, b, max, rgb, strength) {
    const dx = a.x - b.x, dy = a.y - b.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > max * max) return;
    const o = (1 - Math.sqrt(d2) / max) * strength;
    ctx.strokeStyle = 'rgba(' + rgb + ',' + o.toFixed(3) + ')';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 0.7;

    /* Soft halo behind the ring */
    const g = ctx.createRadialGradient(ring.x, ring.y, ring.r * 0.2, ring.x, ring.y, ring.r * 1.5);
    g.addColorStop(0, 'rgba(' + TEAL + ',0.10)');
    g.addColorStop(1, 'rgba(' + TEAL + ',0)');
    ctx.fillStyle = g;
    ctx.fillRect(ring.x - ring.r * 1.6, ring.y - ring.r * 1.6, ring.r * 3.2, ring.r * 3.2);

    /* Faint guide circle — echoes the logo ring */
    ctx.strokeStyle = 'rgba(' + TEAL + ',0.16)';
    ctx.lineWidth = Math.max(6, ring.r * 0.09);
    ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 0.7;

    /* Ring: link neighbours around the circle + a few chords */
    const n = ringNodes.length;
    for (let i = 0; i < n; i++) {
      const a = ringNodes[i];
      link(a, ringNodes[(i + 1) % n], ring.r, TEAL, 0.55);
      link(a, ringNodes[(i + 2) % n], ring.r, TEAL, 0.25);
      if (i % 6 === 0) link(a, ringNodes[(i + Math.floor(n / 3)) % n], ring.r * 2.2, TEAL, 0.07);
    }

    /* Faint spokes from the core: knowledge reaching out */
    ctx.lineWidth = 0.6;
    for (let i = 0; i < n; i += 5) link(ring, ringNodes[i], ring.r * 1.4, GOLD, 0.2);
    ctx.lineWidth = 0.7;

    /* Ambient links (to each other and to the ring) */
    for (let i = 0; i < ambient.length; i++) {
      const a = ambient[i];
      for (let j = i + 1; j < ambient.length; j++) link(a, ambient[j], LINK_DIST, TEAL, 0.18);
      for (let k = 0; k < n; k += 3) link(a, ringNodes[k], LINK_DIST, TEAL, 0.14);
    }

    /* Pointer links */
    if (pointer.active) {
      ctx.lineWidth = 0.8;
      for (const p of ambient) link(pointer, p, POINTER_DIST, GOLD, 0.6);
      for (const p of ringNodes) link(pointer, p, POINTER_DIST, GOLD, 0.5);
      const pg = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 60);
      pg.addColorStop(0, 'rgba(' + GOLD + ',0.14)');
      pg.addColorStop(1, 'rgba(' + GOLD + ',0)');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 60, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(' + GOLD + ',0.9)';
      ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    /* Nodes */
    for (const p of ambient) {
      ctx.fillStyle = 'rgba(' + (p.gold ? GOLD : WHITE) + ',' + (p.gold ? 0.7 : 0.35) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(' + TEAL + ',0.95)';
    for (const p of ringNodes) {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }

    /* Gold core — the "dot" of the logo, breathing slowly */
    const pulse = 1 + Math.sin(t * 0.0018) * 0.06;
    const core = ring.r * 0.13 * pulse;
    const cg = ctx.createRadialGradient(ring.x, ring.y, core * 0.6, ring.x, ring.y, core * 2.2);
    cg.addColorStop(0, 'rgba(' + GOLD + ',0.16)');
    cg.addColorStop(1, 'rgba(' + GOLD + ',0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(ring.x, ring.y, core * 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(' + GOLD + ',0.92)';
    ctx.beginPath(); ctx.arc(ring.x, ring.y, core, 0, Math.PI * 2); ctx.fill();
  }

  /* ---- Loop control ---- */
  let last = 0;
  function frame(now) {
    const dt = Math.min(now - (last || now), 48);
    last = now;
    t += dt;
    place(dt);
    draw();
    rafId = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduceMotion.matches || !onScreen || document.hidden) return;
    running = true; last = 0;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }
  function still() { stop(); place(0); draw(); }

  /* ---- Pointer (read from the hero so content stays interactive) ---- */
  function setPointer(x, y) {
    const r = canvas.getBoundingClientRect();
    pointer.x = x - r.left; pointer.y = y - r.top; pointer.active = true;
  }
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') setPointer(e.clientX, e.clientY);
  }, { passive: true });
  hero.addEventListener('pointerleave', function () { pointer.active = false; });
  hero.addEventListener('touchmove', function (e) {
    if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  hero.addEventListener('touchend', function () { pointer.active = false; }, { passive: true });

  /* ---- Visibility & settings ---- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      onScreen ? start() : stop();
    }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  reduceMotion.addEventListener && reduceMotion.addEventListener('change', function () {
    reduceMotion.matches ? still() : start();
  });

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { layout(); if (!running) draw(); }, 150);
  });

  layout();
  draw();
  start();
})();
