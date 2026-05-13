// Wohnungen page — axonometry image overlay + card hover interaction
(function () {
  const cards = document.querySelectorAll('.ucard[data-unit-id]');
  const overlays = document.querySelectorAll('.axo__img--overlay[data-unit-id]');
  if (!cards.length || !overlays.length) return;

  // Build lookup: unit-id -> overlay image
  const overlayMap = {};
  overlays.forEach((img) => {
    overlayMap[img.getAttribute('data-unit-id')] = img;
  });

  // Show overlay for a specific unit
  function showOverlay(unitId) {
    overlays.forEach((img) => img.classList.remove('is-visible'));
    if (overlayMap[unitId]) {
      overlayMap[unitId].classList.add('is-visible');
    }
  }

  // Clear all overlays
  function clearOverlays() {
    overlays.forEach((img) => img.classList.remove('is-visible'));
  }

  // Highlight card
  function highlightCard(unitId) {
    cards.forEach((card) => {
      card.classList.toggle('is-active', card.getAttribute('data-unit-id') === unitId);
    });
  }

  // Clear card highlights
  function clearCards() {
    cards.forEach((card) => card.classList.remove('is-active'));
  }

  // Card hover → show matching overlay in axonometry
  cards.forEach((card) => {
    const unitId = card.getAttribute('data-unit-id');

    card.addEventListener('mouseenter', () => {
      card.classList.add('is-active');
      showOverlay(unitId);
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-active');
      clearOverlays();
    });

    // Touch support
    card.addEventListener('touchstart', () => {
      clearCards();
      clearOverlays();
      card.classList.add('is-active');
      showOverlay(unitId);
    }, { passive: true });
  });

  // Preload all overlay images for smooth transitions
  overlays.forEach((img) => {
    const preload = new Image();
    preload.src = img.src;
  });

  // Mobile axonometry modal — clicking the position tile shows the colored unit
  const modal = document.getElementById('axoModal');
  const modalOverlay = document.getElementById('axoModalOverlay');
  const modalUnit = document.getElementById('axoModalUnit');

  function openAxoModal(card) {
    if (!modal || !modalOverlay) return;
    const unitId = card.getAttribute('data-unit-id');
    const nameEl = card.querySelector('.ucard__name');
    modalOverlay.src = `images/axo-${unitId}.png`;
    modalOverlay.alt = nameEl ? `Position ${nameEl.textContent}` : '';
    if (modalUnit) modalUnit.textContent = nameEl ? nameEl.textContent : '';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('axo-modal-open');
  }

  function closeAxoModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('axo-modal-open');
  }

  document.querySelectorAll('.ucard__axo-tile').forEach((tile) => {
    tile.addEventListener('click', (e) => {
      const card = tile.closest('.ucard');
      if (!card) return;
      e.preventDefault();
      openAxoModal(card);
    });
  });

  if (modal) {
    modal.querySelectorAll('[data-axo-close]').forEach((el) => {
      el.addEventListener('click', closeAxoModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeAxoModal();
    });
  }
})();
