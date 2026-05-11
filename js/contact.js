// Contact form validation and submission
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successMsg = document.getElementById('formSuccess');

  function showError(input, message) {
    input.classList.add('kontakt-form__input--error');
    input.setAttribute('aria-invalid', 'true');
    if (message) input.setAttribute('title', message);
  }

  function clearError(input) {
    input.classList.remove('kontakt-form__input--error');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('title');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    const firstname = form.querySelector('[name="firstname"]');
    const lastname = form.querySelector('[name="lastname"]');
    const email = form.querySelector('[name="email"]');
    const message = form.querySelector('[name="message"]');

    [firstname, lastname, email, message].forEach(clearError);

    if (firstname && !firstname.value.trim()) {
      showError(firstname, 'Bitte geben Sie Ihren Vornamen ein.');
      valid = false;
    }

    if (lastname && !lastname.value.trim()) {
      showError(lastname, 'Bitte geben Sie Ihren Nachnamen ein.');
      valid = false;
    }

    if (!email.value.trim()) {
      showError(email, 'Bitte geben Sie Ihre E-Mail-Adresse ein.');
      valid = false;
    } else if (!validateEmail(email.value)) {
      showError(email, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      valid = false;
    }

    if (!message.value.trim()) {
      showError(message, 'Bitte geben Sie eine Nachricht ein.');
      valid = false;
    }

    if (!valid) return;

    // Try Formspree submission
    const formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (response.ok) {
          form.style.display = 'none';
          if (successMsg) successMsg.style.display = 'block';
        } else {
          // Fallback: open mailto
          const subject = encodeURIComponent('Anfrage Überbauung Maienholz');
          const body = encodeURIComponent(
            'Name: ' + (firstname?.value || '') + ' ' + (lastname?.value || '') +
              '\nE-Mail: ' + email.value +
              '\nTelefon: ' + (form.querySelector('[name="phone"]')?.value || '') +
              '\nObjekt: ' + (form.querySelector('[name="objekt"]')?.value || '') +
              '\nBezugstermin: ' + (form.querySelector('[name="bezug"]')?.value || '') +
              '\n\n' + message.value
          );
          window.location.href = 'mailto:info@hamero.ch?subject=' + subject + '&body=' + body;
        }
      })
      .catch(() => {
        // Fallback: open mailto
        const subject = encodeURIComponent('Anfrage Überbauung Maienholz');
        const body = encodeURIComponent(
          'Name: ' + name.value + '\nE-Mail: ' + email.value + '\nTelefon: ' + (form.querySelector('[name="phone"]')?.value || '') + '\n\n' + message.value
        );
        window.location.href = 'mailto:info@hamero.ch?subject=' + subject + '&body=' + body;
      });
  });

  // Clear errors on input
  form.querySelectorAll('input, textarea, select').forEach((input) => {
    input.addEventListener('input', () => clearError(input));
  });

  // Multi-select object dropdown: update trigger label with count
  const objektDropdown = document.getElementById('objektDropdown');
  if (objektDropdown) {
    const placeholder = objektDropdown.querySelector('.kontakt-form__multiselect-placeholder');
    const defaultText = placeholder.getAttribute('data-default') || placeholder.textContent;
    const checkboxes = objektDropdown.querySelectorAll('input[type="checkbox"]');

    function updateLabel() {
      const selected = Array.from(checkboxes).filter((c) => c.checked);
      if (selected.length === 0) {
        placeholder.textContent = defaultText;
        placeholder.classList.remove('has-selection');
      } else if (selected.length === 1) {
        placeholder.textContent = selected[0].value;
        placeholder.classList.add('has-selection');
      } else {
        placeholder.textContent = selected.length + ' Objekte ausgewählt';
        placeholder.classList.add('has-selection');
      }
    }

    checkboxes.forEach((cb) => cb.addEventListener('change', updateLabel));

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (objektDropdown.open && !objektDropdown.contains(e.target)) {
        objektDropdown.open = false;
      }
    });
  }
})();
