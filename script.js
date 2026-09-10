/* ═══════════════════════════════════════════════════════════════════════════
   NIKK PORTFOLIO V3 — script.js
   ═══════════════════════════════════════════════════════════════════════════ */

// ── EMAILJS INIT ─────────────────────────────────────────────────────────────
const EMAILJS_PUBLIC_KEY = 'Z2iOJ714x2lALCzbb';
const EMAILJS_SERVICE_ID = 'service_c0letke';
const EMAILJS_TEMPLATE_ID = 'template_p0m3bzc';

if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
const prog = document.getElementById('prog');
const burger = document.getElementById('bg');
const mob = document.getElementById('mob');
const themeToggle = document.getElementById('theme-toggle');
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const toast = document.getElementById('toast');


// ── AUTO YEAR LABEL ───────────────────────────────────────────────────────────
// Batch started July 2024 (4-year B.Tech, 2024-2028)
// Jul-Jun academic calendar:
//   Jul 2024-Jun 2025  =>  1st Year Undergraduate
//   Jul 2025-Jun 2026  =>  2nd Year Undergraduate
//   Jul 2026-Jun 2027  =>  Pre-Final Year Undergraduate
//   Jul 2027-Jun 2028  =>  Final Year Undergraduate
function getAcademicYear() {
  const BATCH_START_YEAR  = 2024;
  const BATCH_START_MONTH = 7; // July (1-indexed)
  const labels = [
    '1st Year Undergraduate',
    '2nd Year Undergraduate',
    'Pre-Final Year Undergraduate',
    'Final Year Undergraduate'
  ];
  const now   = new Date();
  const yr    = now.getFullYear();
  const mo    = now.getMonth() + 1; // 1-indexed
  const academicYearStart = (mo >= BATCH_START_MONTH) ? yr : yr - 1;
  const idx = academicYearStart - BATCH_START_YEAR; // 0-based
  return labels[Math.max(0, Math.min(idx, labels.length - 1))];
}

function applyAcademicYear() {
  const label = getAcademicYear();
  document.querySelectorAll('.js-year').forEach(el => {
    el.textContent = label;
  });
}

// ── THEME TOGGLE ──────────────────────────────────────────────────────────────
const THEME_KEY = 'nikk-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

themeToggle.addEventListener('click', toggleTheme);

// ── SCROLL PROGRESS & NAV STICKY ─────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  prog.style.width = (max ? (h.scrollTop / max) * 100 : 0) + '%';
  nav.classList.toggle('stuck', window.scrollY > 40);

  // Active nav link
  let cur = '';
  document.querySelectorAll('section[id]').forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) cur = s.id;
  });
  document.querySelectorAll('.n-links a[data-s]').forEach(a => {
    a.classList.toggle('active', a.dataset.s === cur);
  });
}, { passive: true });

// ── MOBILE MENU ───────────────────────────────────────────────────────────────
const setMob = (open) => {
  mob.classList.toggle('on', open);
  burger.classList.toggle('on', open);
  document.body.style.overflow = open ? 'hidden' : '';
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mob.setAttribute('aria-hidden', String(!open));
};

const closeMob = () => setMob(false);

burger.addEventListener('click', () => setMob(!mob.classList.contains('on')));
document.querySelectorAll('.mm').forEach(a => a.addEventListener('click', closeMob));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mob.classList.contains('on')) closeMob();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024 && mob.classList.contains('on')) closeMob();
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth' });
    closeMob();
  });
});

// ── ROLE FLIP (slot-machine) ──────────────────────────────────────────────────
// Cycles role titles by translating the track element upward.
// Each step moves up by 1 item height (1.4em per item).
(function initRoleFlip() {
  const track = document.getElementById('role-track');
  if (!track) return;

  const items = track.querySelectorAll('.role-flip-item');
  const total = items.length;
  if (total < 2) return;

  let current = 0;

  function flipNext() {
    current = (current + 1) % total;
    // Move track up: each item is 1.4em tall
    track.style.transform = `translateY(calc(-${current} * 1.4em))`;
  }

  // First flip after 2.5s, then every 2.8s
  setTimeout(() => {
    flipNext();
    setInterval(flipNext, 2800);
  }, 2500);
})();

// ── INTERSECTION OBSERVER (scroll reveal) ─────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('vis');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.r, .tli').forEach(el => obs.observe(el));

// ── EMAILJS CONTACT FORM ──────────────────────────────────────────────────────
function showToast(type, msg) {
  toast.textContent = msg;
  toast.className = 'toast ' + type;
  // Auto-hide after 6s
  setTimeout(() => { toast.className = 'toast'; }, 6000);
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.textContent = loading ? 'Sending…' : 'Send message';
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(el => {
    el.classList.remove('error');
    const val = el.value.trim();
    if (!val) {
      el.classList.add('error');
      valid = false;
    } else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      el.classList.add('error');
      valid = false;
    }
  });
  return valid;
}

if (contactForm) {
  // Remove error class on input
  contactForm.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validateForm(contactForm)) {
      showToast('error', '⚠ Please fill in all required fields correctly.');
      return;
    }

    // Check if EmailJS is configured
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY' || !EMAILJS_PUBLIC_KEY) {
      showToast('error', '⚙ EmailJS not configured yet. See script.js for setup instructions.');
      return;
    }

    setLoading(true);
    toast.className = 'toast'; // hide previous toast

    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm);
      showToast('success', '✓ Message sent! I\'ll get back to you soon.');
      contactForm.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      showToast('error', '✕ Something went wrong. Please email me directly.');
    } finally {
      setLoading(false);
    }
  });
}

// ── GITHUB CONTRIBUTION GRAPH ──────────────────────────────────────────────────
// Real data, no auth, CORS-enabled. Falls back to an image, then a link.
const GH_USER = 'CyberAkhil';

async function renderContribGraph() {
  const graph = document.getElementById('gh-graph');
  const countEl = document.getElementById('gh-count');
  if (!graph) return;

  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const days = Array.isArray(data.contributions) ? data.contributions : [];
    if (!days.length) throw new Error('no contribution data');

    const total = (data.total && (data.total.lastYear ?? Object.values(data.total)[0]))
      ?? days.reduce((sum, d) => sum + (d.count || 0), 0);

    graph.innerHTML = '';
    const frag = document.createDocumentFragment();

    // Pad leading cells so the first column lines up with the correct weekday.
    const firstWeekday = new Date(days[0].date).getDay(); // 0 = Sunday
    for (let i = 0; i < firstWeekday; i++) {
      const pad = document.createElement('i');
      pad.className = 'gh-cell gh-pad';
      frag.appendChild(pad);
    }

    days.forEach(d => {
      const cell = document.createElement('i');
      cell.className = 'gh-cell';
      cell.dataset.lvl = String(d.level ?? 0);
      const n = d.count || 0;
      cell.title = `${n} contribution${n === 1 ? '' : 's'} on ${d.date}`;
      frag.appendChild(cell);
    });

    graph.appendChild(frag);
    if (countEl) countEl.textContent = Number(total).toLocaleString();
  } catch (err) {
    console.warn('Contribution API unavailable — using fallback image:', err);
    graphFallback(graph);
  }
}

function graphFallback(graph) {
  const card = graph.closest('.gh-card');
  if (card) card.classList.add('gh-fallback-mode');
  graph.innerHTML = '';

  const img = new Image();
  img.className = 'gh-fallback-img';
  img.alt = `${GH_USER}'s GitHub contribution graph`;
  img.loading = 'lazy';
  img.onerror = () => {
    graph.innerHTML = `<a class="gh-fallback-link" href="https://github.com/${GH_USER}" target="_blank" rel="noopener">View my contributions on GitHub →</a>`;
  };
  // Accent-green heatmap image; renders fine on any background.
  img.src = `https://ghchart.rshah.org/2f9e6e/${GH_USER}`;
  graph.appendChild(img);
}

// ── VIEW COUNTER ────────────────────────────────────────────────────────────────
// Free, no-auth hit counter. Updates both hero chip and contact line.
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

async function bumpViews() {
  const heroCount   = document.getElementById('view-count');
  const heroOrdinal = document.getElementById('view-ordinal');
  const ctaCount    = document.getElementById('view-count-contact');
  const ctaOrdinal  = document.getElementById('view-ordinal-contact');
  const chip        = heroCount?.closest('.views-card');

  try {
    const res = await fetch('https://abacus.jasoncameron.dev/hit/nikk-portfolio-v3/home');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const n = data.value ?? data.count;
    if (typeof n !== 'number') throw new Error('bad payload');

    const formatted = n.toLocaleString();
    const ord = ordinal(n);

    if (heroCount)   heroCount.textContent  = formatted;
    if (heroOrdinal) heroOrdinal.textContent = ord;
    if (ctaCount)    ctaCount.textContent   = formatted;
    if (ctaOrdinal)  ctaOrdinal.textContent  = ord;

  } catch (err) {
    console.warn('View counter unavailable:', err);
    if (chip) chip.style.display = 'none';
    const ctaLine = ctaCount?.closest('.visitor-line');
    if (ctaLine) ctaLine.style.display = 'none';
  }
}

// Apply dynamic year label on page load
applyAcademicYear();

// Kick off async widgets after first paint.
renderContribGraph();
bumpViews();
// ── LEARNING CARD WORD REVEAL re-trigger on scroll ────────────────────────────
// Words animate in on first visibility. Intersection observer re-arms after 8s.
(function initLearnReveal() {
  const card = document.querySelector('.card-learning');
  if (!card) return;
  const words = card.querySelectorAll('.lw, .lw-sep');

  function rearm() {
    words.forEach(w => {
      w.style.animation = 'none';
      w.offsetHeight; // reflow
      w.style.animation = '';
    });
  }

  // Re-trigger every time the hero scrolls into view
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) rearm(); });
  }, { threshold: 0.8 });
  io.observe(card);
})();

// Apply dynamic year label on page load
applyAcademicYear();
