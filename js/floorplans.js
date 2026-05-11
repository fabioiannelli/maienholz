// Tabs and floor plan display
(function () {
  // Tab switching
  document.querySelectorAll('.tabs__nav').forEach((nav) => {
    const buttons = nav.querySelectorAll('.tabs__btn');
    const panels = nav.parentElement.querySelectorAll('.tabs__panel');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');

        buttons.forEach((b) => {
          b.classList.remove('tabs__btn--active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('tabs__btn--active');
        btn.setAttribute('aria-selected', 'true');

        panels.forEach((panel) => {
          panel.classList.toggle('tabs__panel--active', panel.id === target);
        });
      });
    });
  });

  // Floor plan buttons
  const isDesktop = window.innerWidth >= 1024;

  document.querySelectorAll('.unit-card__floor-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const pdfUrl = btn.getAttribute('data-pdf');
      const card = btn.closest('.unit-card');
      const embed = card.querySelector('.unit-card__pdf-embed');

      if (isDesktop && embed) {
        e.preventDefault();
        if (embed.style.display === 'block' && embed.getAttribute('data-current') === pdfUrl) {
          embed.style.display = 'none';
          embed.innerHTML = '';
          return;
        }
        embed.setAttribute('data-current', pdfUrl);
        embed.style.display = 'block';
        embed.innerHTML =
          '<object data="' + pdfUrl + '" type="application/pdf" width="100%" height="600">' +
          '<p>PDF kann nicht angezeigt werden. <a href="' + pdfUrl + '" target="_blank">Grundriss herunterladen</a></p>' +
          '</object>';
      } else {
        window.open(pdfUrl, '_blank');
      }
    });
  });
})();
