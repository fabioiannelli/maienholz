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
})();
