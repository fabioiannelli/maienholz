// Homepage intro splash
(function () {
  const intro = document.getElementById('intro');
  if (!intro) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    intro.remove();
    return;
  }

  const html = document.documentElement;
  const body = document.body;
  const prevHtmlOverflow = html.style.overflow;
  const prevBodyOverflow = body.style.overflow;
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';

  const HOLD = 2600;
  const FADE = 800;

  setTimeout(() => {
    intro.classList.add('is-fading');
    setTimeout(() => {
      intro.remove();
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    }, FADE);
  }, HOLD);
})();

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

  // Close menu when an actual link (not the dropdown toggle button) is clicked
  overlay.querySelectorAll('a.nav__link, a.nav__dropdown-link').forEach((link) => {
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

// Scroll-revealed text — word by word, linked to scroll position.
// The wrap is taller than the viewport; its inner content sticks while the
// user scrolls through it. Reveal happens during the first 60% of that
// scroll distance; the remaining 40% leaves the fully-revealed text on
// screen so the reader has time to take it in.
(function () {
  const blocks = document.querySelectorAll('[data-scroll-reveal]');
  if (!blocks.length) return;

  // Split each target's text into individual word spans (once)
  blocks.forEach((block) => {
    const target = block.querySelector('.scroll-reveal__text');
    if (!target || target.dataset.split === '1') return;
    const words = target.textContent.trim().split(/\s+/);
    target.innerHTML = words
      .map((w) => '<span class="reveal-word">' + w + '</span>')
      .join(' ');
    target.dataset.split = '1';
  });

  // Fraction of the wrap scroll distance over which the reveal happens.
  // The remainder keeps the text in view as a reading pause.
  const REVEAL_FRACTION = 0.6;

  let ticking = false;

  function update() {
    blocks.forEach((block) => {
      const target = block.querySelector('.scroll-reveal__text');
      if (!target) return;
      const words = target.querySelectorAll('.reveal-word');
      if (!words.length) return;

      const rect = block.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = rect.height - vh;
      if (scrollable <= 0) return;

      // How far we've scrolled into the wrap (0 when its top hits viewport top).
      const scrolled = -rect.top;
      let wrapProgress = scrolled / scrollable;
      wrapProgress = Math.max(0, Math.min(1, wrapProgress));

      // Map [0, REVEAL_FRACTION] of wrapProgress to [0, 1] of revealProgress.
      let revealProgress = wrapProgress / REVEAL_FRACTION;
      revealProgress = Math.max(0, Math.min(1, revealProgress));

      // Smoothstep easing
      const eased = revealProgress * revealProgress * (3 - 2 * revealProgress);
      const visibleCount = Math.floor(eased * words.length);

      words.forEach((word, i) => {
        word.classList.toggle('is-visible', i < visibleCount);
      });
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();

// Active nav link
(function () {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href) link.classList.toggle('nav__link--active', href === currentPage);
  });

  // Dropdown sub-link active + parent trigger active
  const dropdownChildPages = ['wohnungen.html', 'reihenhaeuser.html'];
  document.querySelectorAll('.nav__dropdown-link').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('nav__dropdown-link--active', href === currentPage);
  });
  if (dropdownChildPages.includes(currentPage)) {
    document.querySelectorAll('.nav__link--dropdown').forEach((trigger) => {
      trigger.classList.add('nav__link--dropdown-active');
    });
  }
})();

// Dropdown nav (desktop: hover + click; mobile: click toggles inline expansion)
(function () {
  const dropdowns = document.querySelectorAll('.nav__item--dropdown');
  if (!dropdowns.length) return;

  const desktopMQ = window.matchMedia('(min-width: 1024px)');

  function openDropdown(dd) {
    dd.classList.add('is-open');
    const trigger = dd.querySelector('.nav__link--dropdown');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown(dd) {
    dd.classList.remove('is-open');
    const trigger = dd.querySelector('.nav__link--dropdown');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  dropdowns.forEach((dd) => {
    const trigger = dd.querySelector('.nav__link--dropdown');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (dd.classList.contains('is-open')) closeDropdown(dd);
      else openDropdown(dd);
    });

    dd.addEventListener('mouseenter', () => {
      if (desktopMQ.matches) openDropdown(dd);
    });
    dd.addEventListener('mouseleave', () => {
      if (desktopMQ.matches) closeDropdown(dd);
    });
  });

  // Outside click closes all open dropdowns (desktop only — on mobile the overlay handles its own dismissal)
  document.addEventListener('click', (e) => {
    if (!desktopMQ.matches) return;
    dropdowns.forEach((dd) => {
      if (!dd.contains(e.target)) closeDropdown(dd);
    });
  });

  // Esc closes dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    dropdowns.forEach((dd) => closeDropdown(dd));
  });
})();

// Mobile collapse for unit cards (ucard) — adds a toggle that reveals
// details/actions/axo-tile. Also injects an availability status pill.
// Toggle is only visible on small screens via CSS. Status defaults to
// "available"; set data-status="rented" on a .ucard to flip it.
(function () {
  const cards = document.querySelectorAll('.ucard');
  if (!cards.length) return;

  cards.forEach((card) => {
    const isRented = card.dataset.status === 'rented';
    const status = document.createElement('span');
    status.className = 'ucard__status ucard__status--' + (isRented ? 'rented' : 'available');
    status.textContent = isRented ? 'Vermietet' : 'Verfügbar';
    card.prepend(status);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ucard__toggle';
    toggle.setAttribute('aria-label', 'Details anzeigen');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML =
      '<svg viewBox="0 0 12 8" aria-hidden="true">' +
      '<path d="M1 1.5L6 6.5L11 1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = card.classList.toggle('ucard--open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Details ausblenden' : 'Details anzeigen');
    });
    card.appendChild(toggle);
  });
})();

// Smooth-scroll hero — clip-path window expands as the user scrolls through
// the section. Mirrors the framer-motion useScroll/useTransform behaviour but
// uses plain rAF + getBoundingClientRect for performance.
(function () {
  const heroes = document.querySelectorAll('[data-impression-hero]');
  if (!heroes.length) return;

  const SCROLL_HEIGHT = 1500;
  const INITIAL_CLIP = 25;
  const FINAL_CLIP = 75;
  const INITIAL_BG = 170;
  const FINAL_BG = 100;

  let ticking = false;

  const update = () => {
    heroes.forEach((hero) => {
      const sticky = hero.querySelector('[data-impression-hero-bg]');
      if (!sticky) return;

      const rect = hero.getBoundingClientRect();
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / SCROLL_HEIGHT));
      const bgProgress = Math.max(0, Math.min(1, scrolled / (SCROLL_HEIGHT + 500)));

      const clipStart = INITIAL_CLIP * (1 - progress);
      const clipEnd = FINAL_CLIP + (100 - FINAL_CLIP) * progress;
      const bgSize = INITIAL_BG - (INITIAL_BG - FINAL_BG) * bgProgress;

      sticky.style.clipPath =
        'polygon(' + clipStart + '% ' + clipStart + '%, ' +
        clipEnd + '% ' + clipStart + '%, ' +
        clipEnd + '% ' + clipEnd + '%, ' +
        clipStart + '% ' + clipEnd + '%)';
      sticky.style.backgroundSize = bgSize + '%';
    });
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
})();
