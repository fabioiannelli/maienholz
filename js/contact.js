// Contact form validation and submission (Web3Forms)
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successMsg = document.getElementById('formSuccess');
  const FALLBACK_EMAIL = 'fi@hamero.ch';

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

  function collectObjekte() {
    return Array.from(form.querySelectorAll('input[name="objekt[]"]:checked'))
      .map((c) => c.value);
  }

  function buildMailtoBody() {
    const get = (n) => form.querySelector('[name="' + n + '"]')?.value?.trim() || '—';
    const objekte = collectObjekte();
    return (
      'Vorname: ' + get('firstname') +
      '\nNachname: ' + get('lastname') +
      '\nE-Mail: ' + get('email') +
      '\nTelefon: ' + get('phone') +
      '\nBetreff: ' + get('betreff') +
      '\nInteressierte Objekte: ' + (objekte.length ? objekte.join(', ') : '—') +
      '\n\nNachricht:\n' + get('message')
    );
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    const firstname = form.querySelector('[name="firstname"]');
    const lastname = form.querySelector('[name="lastname"]');
    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    const betreff = form.querySelector('[name="betreff"]');
    const message = form.querySelector('[name="message"]');

    [firstname, lastname, email, phone, betreff, message].forEach(clearError);

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
    if (phone && !phone.value.trim()) {
      showError(phone, 'Bitte geben Sie Ihre Telefonnummer ein.');
      valid = false;
    }
    if (betreff && !betreff.value) {
      showError(betreff, 'Bitte wählen Sie einen Betreff.');
      valid = false;
    }
    if (!message.value.trim()) {
      showError(message, 'Bitte geben Sie eine Nachricht ein.');
      valid = false;
    }

    if (!valid) return;

    // Build payload for Web3Forms
    const formData = new FormData(form);

    // Use the visitor's email as reply-to so user can reply directly to interested party
    formData.append('replyto', email.value.trim());

    // Flatten selected Objekte into a single readable string in addition to objekt[]
    const objekte = collectObjekte();
    formData.append('Objekte (gewählt)', objekte.length ? objekte.join(', ') : '—');

    // Compose a nicer email subject including the betreff
    const subjectBase = 'Maienholz Anfrage';
    const betreffVal = betreff?.value || '';
    formData.set('subject', betreffVal ? subjectBase + ': ' + betreffVal : subjectBase);

    const submitBtns = form.querySelectorAll('button[type="submit"]');
    submitBtns.forEach((b) => (b.disabled = true));

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    })
      .then((response) => response.json().catch(() => ({})).then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (ok && (data.success === true || data.success === undefined)) {
          form.style.display = 'none';
          if (successMsg) successMsg.style.display = 'block';
        } else {
          // Fallback: open mailto with all fields prefilled
          const subject = encodeURIComponent(subjectBase + (betreffVal ? ': ' + betreffVal : ''));
          const body = encodeURIComponent(buildMailtoBody());
          window.location.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + subject + '&body=' + body;
        }
      })
      .catch(() => {
        const subject = encodeURIComponent(subjectBase + (betreffVal ? ': ' + betreffVal : ''));
        const body = encodeURIComponent(buildMailtoBody());
        window.location.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + subject + '&body=' + body;
      })
      .finally(() => {
        submitBtns.forEach((b) => (b.disabled = false));
      });
  });

  // Clear errors on input
  form.querySelectorAll('input, textarea, select').forEach((input) => {
    input.addEventListener('input', () => clearError(input));
    input.addEventListener('change', () => clearError(input));
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

    document.addEventListener('click', (e) => {
      if (objektDropdown.open && !objektDropdown.contains(e.target)) {
        objektDropdown.open = false;
      }
    });
  }
})();
