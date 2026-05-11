// Header contrast switching — dark on hero, light on white sections
(function () {
  const header = document.getElementById('header');
  const hero = document.querySelector('.hero');
  if (!header) return;

  // If no hero exists on this page, start in light mode
  if (!hero) {
    header.classList.add('header--light');
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('header--light', !entry.isIntersecting);
    },
    { threshold: 0.05 }
  );
  observer.observe(hero);
})();

// Mobile navigation
(function () {
  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !overlay) return;

  // Move overlay to body level (avoids backdrop-filter containing block issue
  // from .header__inner which would constrain position:fixed to the header pill)
  if (overlay.parentElement !== document.body) {
    document.body.appendChild(overlay);
  }

  // Inject footer (email) into overlay if not present
  if (!overlay.querySelector('.nav__overlay__footer')) {
    const footer = document.createElement('div');
    footer.className = 'nav__overlay__footer';
    footer.innerHTML = '<a href="mailto:info@hamero.ch" class="nav__overlay__email">info@hamero.ch</a>';
    overlay.appendChild(footer);
  }

  function closeMenu() {
    overlay.classList.remove('is-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-label', 'Menü öffnen');
    document.body.classList.remove('nav-open');
    document.body.style.overflow = '';
  }

  function openMenu() {
    overlay.classList.add('is-open');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-label', 'Menü schliessen');
    document.body.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', () => {
    if (overlay.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  overlay.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
  });
})();

// Scroll reveal animations
(function () {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
})();

// Active nav link
(function () {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('nav__link--active', href === currentPage);
  });
})();
