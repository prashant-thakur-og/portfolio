/* ═══════════════════════════════════════════════════════════════════════════
   NIKK PORTFOLIO V3 — script.js
   ═══════════════════════════════════════════════════════════════════════════ */

const EMAILJS_PUBLIC_KEY = 'Z2iOJ714x2lALCzbb';
const EMAILJS_SERVICE_ID = 'service_c0letke';
const EMAILJS_TEMPLATE_ID = 'template_p0m3bzc';

if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

const nav = document.getElementById('nav');
const prog = document.getElementById('prog');
const burger = document.getElementById('bg');
const mob = document.getElementById('mob');
const themeToggle = document.getElementById('theme-toggle');
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const toast = document.getElementById('toast');


function getAcademicYear() {
  const BATCH_START_YEAR  = 2024;
  const BATCH_START_MONTH = 7;
  const labels = [
    '1st Year Undergraduate',
    '2nd Year Undergraduate',
    'Pre-Final Year Undergraduate',
    'Final Year Undergraduate'
  ];
  const now   = new Date();
  const yr    = now.getFullYear();
  const mo    = now.getMonth() + 1;
  const academicYearStart = (mo >= BATCH_START_MONTH) ? yr : yr - 1;
  const idx = academicYearStart - BATCH_START_YEAR;
  return labels[Math.max(0, Math.min(idx, labels.length - 1))];
}

function applyAcademicYear() {
  const label = getAcademicYear();
  document.querySelectorAll('.js-year').forEach(el => {
    el.textContent = label;
  });
}

const THEME_KEY = 'nikk-theme-v2';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

let themeWaveTimer;
let themeApplyTimer;

function toggleTheme({ x, y, duration = 1350, animation = 'cubic-bezier(.16, 1, .3, 1)' } = {}) {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    applyTheme(next);
    return;
  }

  const toggleBounds = themeToggle.getBoundingClientRect();
  const waveX = Number.isFinite(x) && x > 0 ? x : toggleBounds.left + toggleBounds.width / 2;
  const waveY = Number.isFinite(y) && y > 0 ? y : toggleBounds.top + toggleBounds.height / 2;
  root.style.setProperty('--wave-duration', `${duration}ms`);
  root.style.setProperty('--wave-easing', animation);

  let wave = document.querySelector('.theme-wave-overlay');
  if (!wave) {
    wave = document.createElement('div');
    wave.className = 'theme-wave-overlay';
    document.body.appendChild(wave);
  }

  const waveSize = Math.hypot(window.innerWidth, window.innerHeight) * 2;
  wave.style.left = `${waveX}px`;
  wave.style.top = `${waveY}px`;
  wave.style.width = `${waveSize}px`;
  wave.style.height = `${waveSize}px`;
  wave.style.background = next === 'dark' ? '#08080a' : '#f3eee5';
  wave.classList.remove('is-active');
  void wave.offsetWidth;
  wave.classList.add('is-active');

  clearTimeout(themeApplyTimer);
  clearTimeout(themeWaveTimer);
  themeApplyTimer = setTimeout(() => applyTheme(next), duration * .53);
  themeWaveTimer = setTimeout(() => wave.classList.remove('is-active'), duration);
}

const handleClick = event => {
  toggleTheme({
    x: event.clientX,
    y: event.clientY,
    duration: 400,
    animation: 'ease-out'
  });
};

themeToggle.addEventListener('click', handleClick);

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  prog.style.width = (max ? (h.scrollTop / max) * 100 : 0) + '%';
  nav.classList.toggle('stuck', window.scrollY > 40);

  let cur = '';
  document.querySelectorAll('section[id]').forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) cur = s.id;
  });
  document.querySelectorAll('.n-links a[data-s]').forEach(a => {
    a.classList.toggle('active', a.dataset.s === cur);
  });
}, { passive: true });

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

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth' });
    closeMob();
  });
});

const projectCards = document.querySelectorAll('.proj-card[data-categories]');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectModal = document.getElementById('project-modal');
const modalTitle = document.getElementById('project-modal-title');
const modalImpact = document.getElementById('project-modal-impact');
const modalDescription = document.getElementById('project-modal-description');
const modalTags = document.getElementById('project-modal-tags');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    projectCards.forEach(card => {
      const visible = filter === 'all' || card.dataset.categories.split(' ').includes(filter);
      card.hidden = !visible;
    });
  });
});

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.hidden = true;
  document.body.style.overflow = '';
}

document.querySelectorAll('.project-details-btn').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.proj-card');
    modalTitle.textContent = card.querySelector('h3').textContent;
    modalImpact.textContent = card.querySelector('.proj-impact').textContent;
    modalDescription.textContent = card.querySelector('p:not(.proj-kicker):not(.proj-impact)').textContent;
    modalTags.innerHTML = card.querySelector('.tags').innerHTML;
    projectModal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
});

document.querySelectorAll('[data-modal-close]').forEach(element => {
  element.addEventListener('click', closeProjectModal);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeProjectModal();
});

(function initRoleFlip() {
  const track = document.getElementById('role-track');
  if (!track) return;

  const items = track.querySelectorAll('.role-flip-item');
  const total = items.length;
  if (total < 2) return;

  let current = 0;

  function flipNext() {
    current = (current + 1) % total;
    track.style.transform = `translateY(calc(-${current} * 1.4em))`;
  }

  setTimeout(() => {
    flipNext();
    setInterval(flipNext, 2800);
  }, 2500);
})();

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('vis');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.r, .tli').forEach(el => obs.observe(el));

function showToast(type, msg) {
  toast.textContent = msg;
  toast.className = 'toast ' + type;
  setTimeout(() => { toast.className = 'toast'; }, 6000);
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.textContent = loading ? 'Sending…' : 'Send message';
}

function isValidEmail(value) {
  if (value.length > 254 || /\.\.|^\.|\.$/.test(value)) return false;
  const match = value.match(/^[^\s@]+@([^\s@]+)$/);
  if (!match) return false;

  const domain = match[1];
  return domain.split('.').every(label => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label))
    && domain.includes('.')
    && domain.split('.').at(-1).length >= 2;
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(el => {
    el.classList.remove('error');
    const val = el.value.trim();
    if (!val) {
      el.classList.add('error');
      valid = false;
    } else if (el.type === 'email' && !isValidEmail(val)) {
      el.classList.add('error');
      valid = false;
    }
  });
  return valid;
}

if (contactForm) {
  contactForm.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validateForm(contactForm)) {
      showToast('error', '⚠ Please fill in all required fields correctly.');
      return;
    }

    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY' || !EMAILJS_PUBLIC_KEY) {
      showToast('error', '⚙ EmailJS not configured yet. See script.js for setup instructions.');
      return;
    }

    setLoading(true);
    toast.className = 'toast';

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

    const firstWeekday = new Date(days[0].date).getDay();
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
  img.src = `https://ghchart.rshah.org/2f9e6e/${GH_USER}`;
  graph.appendChild(img);
}

const VIEW_COUNT_KEY = 'nikk-portfolio-view-count';
const VIEW_COUNTED_KEY = 'nikk-portfolio-view-counted';
const VIEW_CONSENT_KEY = 'nikk-portfolio-view-consent';

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function renderViewCount(n) {
  const heroCount   = document.getElementById('view-count');
  const heroOrdinal = document.getElementById('view-ordinal');
  const ctaCount    = document.getElementById('view-count-contact');
  const ctaOrdinal  = document.getElementById('view-ordinal-contact');
  const formatted = n.toLocaleString();
  const ord = ordinal(n);

  if (heroCount)   heroCount.textContent  = formatted;
  if (heroOrdinal) heroOrdinal.textContent = ord;
  if (ctaCount)    ctaCount.textContent   = formatted;
  if (ctaOrdinal)  ctaOrdinal.textContent = ord;
}

async function bumpViews() {
  const heroCount   = document.getElementById('view-count');
  const ctaCount    = document.getElementById('view-count-contact');
  const chip        = heroCount?.closest('.views-card');
  const allowButton = document.getElementById('visitor-allow');
  const consentNote = document.getElementById('visitor-consent-note');

  if (localStorage.getItem(VIEW_CONSENT_KEY) !== '1') {
    if (allowButton) {
      allowButton.hidden = false;
      allowButton.addEventListener('click', () => {
        localStorage.setItem(VIEW_CONSENT_KEY, '1');
        allowButton.hidden = true;
        if (consentNote) consentNote.textContent = 'Thanks — this browser will count only once.';
        bumpViews();
      }, { once: true });
    }
    return;
  }

  if (allowButton) allowButton.hidden = true;
  try {
    const savedCount = Number(localStorage.getItem(VIEW_COUNT_KEY));
    const alreadyCounted = localStorage.getItem(VIEW_COUNTED_KEY) === '1';
    if (alreadyCounted && Number.isFinite(savedCount) && savedCount > 0) {
      renderViewCount(savedCount);
      return;
    }

    localStorage.setItem(VIEW_COUNTED_KEY, '1');
    const res = await fetch('https://abacus.jasoncameron.dev/hit/nikk-portfolio-v3/home');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const n = data.value ?? data.count;
    if (typeof n !== 'number') throw new Error('bad payload');

    localStorage.setItem(VIEW_COUNT_KEY, String(n));
    renderViewCount(n);

  } catch (err) {
    localStorage.removeItem(VIEW_COUNTED_KEY);
    console.warn('View counter unavailable:', err);
    if (chip) chip.style.display = 'none';
    const ctaLine = ctaCount?.closest('.visitor-line');
    if (ctaLine) ctaLine.style.display = 'none';
  }
}

applyAcademicYear();

renderContribGraph();
bumpViews();
(function initLearnReveal() {
  const card = document.querySelector('.card-learning');
  if (!card) return;
  const words = card.querySelectorAll('.lw, .lw-sep');

  function rearm() {
    words.forEach(w => {
      w.style.animation = 'none';
      w.offsetHeight;
      w.style.animation = '';
    });
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) rearm(); });
  }, { threshold: 0.8 });
  io.observe(card);
})();

applyAcademicYear();
