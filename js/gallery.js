// Slideshow gallery
(function () {
  const slideshow = document.querySelector('.slideshow');
  if (!slideshow) return;

  const slides = Array.from(slideshow.querySelectorAll('.slideshow__slide'));
  const prevBtn = slideshow.querySelector('.slideshow__nav--prev');
  const nextBtn = slideshow.querySelector('.slideshow__nav--next');
  const dotsContainer = slideshow.querySelector('.slideshow__dots');
  const caption = slideshow.querySelector('.slideshow__caption');
  const counterCurrent = slideshow.querySelector('.slideshow__counter-current');
  const counterTotal = slideshow.querySelector('.slideshow__counter-total');

  let current = 0;
  const total = slides.length;

  if (counterTotal) counterTotal.textContent = total;

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slideshow__dot';
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Bild ${i + 1} von ${total}`);
    dot.addEventListener('click', () => show(i));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function show(index) {
    current = (index + total) % total;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    const img = slides[current].querySelector('img');
    if (caption && img) caption.textContent = img.alt;
    if (counterCurrent) counterCurrent.textContent = current + 1;
  }

  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));

  document.addEventListener('keydown', (e) => {
    const rect = slideshow.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Touch swipe
  let touchStartX = 0;
  let touchEndX = 0;
  const track = slideshow.querySelector('.slideshow__track');
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) show(current + 1);
      else show(current - 1);
    }
  }, { passive: true });

  show(0);
})();
