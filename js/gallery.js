// Lightbox gallery
(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const img = lightbox.querySelector('.lightbox__img');
  const caption = lightbox.querySelector('.lightbox__caption');
  const items = document.querySelectorAll('.gallery__item');
  let current = 0;

  const images = Array.from(items).map((item) => ({
    src: item.querySelector('img').src,
    alt: item.querySelector('img').alt,
  }));

  function show(index) {
    current = (index + images.length) % images.length;
    img.src = images[current].src;
    img.alt = images[current].alt;
    if (caption) caption.textContent = images[current].alt;
  }

  function open(index) {
    show(index);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
  });

  lightbox.querySelector('.lightbox__close').addEventListener('click', close);
  lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('.lightbox__nav--next').addEventListener('click', () => show(current + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
