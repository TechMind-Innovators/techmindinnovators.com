/* ==========================================================================
   TechMind Innovators — Shared JavaScript
   ========================================================================== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll reveal (content is visible by default; this only adds a gentle fade)
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const rObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), Math.min(i, 4) * 60);
        rObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => rObs.observe(el));
} else {
  reveals.forEach(el => el.classList.add('visible'));
}

// Nav shadow on scroll
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Desktop dropdowns — open on hover (CSS), click/tap and keyboard (here)
const dropdowns = document.querySelectorAll('.nav-dd');
function closeDropdowns(except) {
  dropdowns.forEach(dd => {
    if (dd === except) return;
    dd.classList.remove('open');
    const b = dd.querySelector('.nav-dd-toggle');
    if (b) b.setAttribute('aria-expanded', 'false');
  });
}
dropdowns.forEach(dd => {
  const btn = dd.querySelector('.nav-dd-toggle');
  const menu = dd.querySelector('.nav-dd-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = !dd.classList.contains('open');
    closeDropdowns(dd);
    dd.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      closeDropdowns(dd);
      dd.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      const first = menu.querySelector('a');
      if (first) requestAnimationFrame(() => first.focus());
    }
  });
  menu.addEventListener('keydown', (e) => {
    const links = [...menu.querySelectorAll('a')];
    const i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
  });
  dd.addEventListener('focusout', (e) => {
    if (!dd.contains(e.relatedTarget)) { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const openDd = document.querySelector('.nav-dd.open');
  if (openDd) { closeDropdowns(); openDd.querySelector('.nav-dd-toggle').focus(); }
});
document.addEventListener('click', (e) => { if (!e.target.closest('.nav-dd')) closeDropdowns(); });

// Impact counters — the final numbers are in the HTML; we only animate up to them
const counters = document.querySelectorAll('.impact-num[data-target]');
if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
  const cObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const finalText = el.textContent;
      const start = performance.now();
      const dur = 1100;
      el.setAttribute('aria-hidden', 'true');           // screen readers get the label below
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else { el.textContent = finalText; el.removeAttribute('aria-hidden'); }
      };
      requestAnimationFrame(tick);
      cObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => cObs.observe(c));
}

// Mobile menu toggle
const mobileBtn = document.querySelector('.nav-mobile');
const mobileMenu = document.getElementById('nav-mobile-menu');
if (mobileBtn && mobileMenu) {
  const setOpen = (open) => {
    mobileBtn.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    mobileBtn.setAttribute('aria-expanded', String(open));
    mobileBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  mobileBtn.addEventListener('click', () => setOpen(!mobileMenu.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { setOpen(false); mobileBtn.focus(); }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 1080) setOpen(false); });
}
