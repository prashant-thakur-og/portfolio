const nav = document.getElementById('nav');
const prog = document.getElementById('prog');
const burger = document.getElementById('bg');
const mob = document.getElementById('mob');
const themeToggle = document.getElementById('theme-toggle');


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

function initQuoteRotator() {
  const text = document.getElementById('quote-text');
  if (!text) return;

  const quoteSets = {
    Technology: [
      'The best technology removes friction and gives people more room to think.',
      'Build tools that make difficult work feel possible.',
      'Good systems are quiet: they solve the problem and stay out of the way.'
    ],
    Money: [
      'Money follows useful skills, clear thinking, and consistent execution.',
      'Build assets that keep creating value after the work is done.',
      'The strongest investment is becoming difficult to replace.'
    ],
    Motivation: [
      'Small progress is still proof that the direction is working.',
      'Discipline makes ordinary effort compound into uncommon results.',
      'Start before you feel ready; clarity usually arrives after motion.'
    ],
    Sigma: [
      'Move quietly. Let the work become impossible to ignore.',
      'Do not chase the crowd when you are building your own standard.',
      'Focus is choosing your path before the noise chooses it for you.'
    ]
  };
  const cacheKey = 'nikk-daily-quote-v2';
  const today = new Date().toISOString().slice(0, 10);
  let cached;

  try {
    cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
  } catch {
    cached = null;
  }

  function render(quote) {
    text.textContent = quote;
  }

  if (cached?.date === today && cached.category && cached.quote) {
    render(cached.quote);
    return;
  }

  const categories = Object.keys(quoteSets);
  const previousCategory = cached?.category;
  const availableCategories = categories.filter(category => category !== previousCategory);
  const category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
  const quotes = quoteSets[category];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const next = { date: today, category, quote };

  localStorage.setItem(cacheKey, JSON.stringify(next));
  render(quote);
}

const THEME_KEY = 'nikk-theme-v2';

function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  return localStorage.getItem(THEME_KEY) || getSystemTheme();
}

function applyTheme(theme, persist = true) {
  document.documentElement.setAttribute('data-theme', theme);
  if (persist) {
    localStorage.setItem(THEME_KEY, theme);
  }
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
systemThemeMedia.addEventListener?.('change', event => {
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(event.matches ? 'dark' : 'light', false);
  }
});

let themeWaveTimer;
let themeApplyTimer;

function toggleTheme({ x, y, duration = 1350, animation = 'cubic-bezier(.16, 1, .3, 1)' } = {}) {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
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

applyAcademicYear();
initQuoteRotator();

renderContribGraph();
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
