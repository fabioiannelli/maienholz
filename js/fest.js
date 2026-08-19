// Anmeldung Einweihungsfeier — Validierung und Versand (Web3Forms)
// Wird von fest.html und fest-2.html genutzt. Felder, die auf einer Seite
// fehlen (z. B. Anzahl Personen auf fest-2), werden übersprungen.
(function () {
  const form = document.getElementById('festForm');
  if (!form) return;

  const successMsg = document.getElementById('festSuccess');
  const FALLBACK_EMAIL = 'fi@hamero.ch';
  const SUBJECT_BASE = 'Anmeldung Einweihungsfeier Maienholz';

  const field = (name) => form.querySelector('[name="' + name + '"]');

  const personen = field('personen');
  const kinder = field('kinder');

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

  function get(name) {
    const el = field(name);
    if (!el) return null;
    return el.value.trim() || '—';
  }

  function buildMailtoBody() {
    const zeilen = [
      ['Vorname', get('firstname')],
      ['Nachname', get('lastname')],
      ['E-Mail', get('email')],
      ['Telefon', get('phone')],
      ['Anzahl Personen', get('personen')],
      ['davon Kinder', get('kinder')],
      ['Begleitpersonen', get('begleitung')],
    ];
    const kopf = zeilen
      .filter(([, wert]) => wert !== null)
      .map(([bez, wert]) => bez + ': ' + wert)
      .join('\n');
    return kopf + '\n\nBemerkungen:\n' + (get('message') || '—');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    const firstname = field('firstname');
    const lastname = field('lastname');
    const email = field('email');

    [firstname, lastname, email, personen, kinder].forEach((el) => {
      if (el) clearError(el);
    });

    if (!firstname.value.trim()) {
      showError(firstname, 'Bitte geben Sie Ihren Vornamen ein.');
      valid = false;
    }
    if (!lastname.value.trim()) {
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

    // Personenzahl nur prüfen, wenn die Seite das Feld überhaupt hat
    let anzahl = null;
    if (personen) {
      anzahl = parseInt(personen.value, 10);
      if (!anzahl || anzahl < 1) {
        showError(personen, 'Bitte geben Sie die Anzahl Personen an.');
        valid = false;
      } else if (kinder && (parseInt(kinder.value, 10) || 0) > anzahl) {
        showError(kinder, 'Nicht mehr Kinder als Personen insgesamt.');
        valid = false;
      }
    }

    if (!valid) return;

    const formData = new FormData(form);
    formData.append('replyto', email.value.trim());

    // Betreff mit Name (und Personenzahl, wo erfasst) — erleichtert das Zählen im Postfach
    const name = firstname.value.trim() + ' ' + lastname.value.trim();
    formData.set(
      'subject',
      anzahl ? SUBJECT_BASE + ': ' + name + ' (' + anzahl + ' Pers.)' : SUBJECT_BASE + ': ' + name
    );

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
          if (successMsg) {
            successMsg.style.display = 'block';
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          fallbackMailto();
        }
      })
      .catch(fallbackMailto)
      .finally(() => {
        submitBtns.forEach((b) => (b.disabled = false));
      });

    function fallbackMailto() {
      const betreff = encodeURIComponent(SUBJECT_BASE);
      const body = encodeURIComponent(buildMailtoBody());
      window.location.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + betreff + '&body=' + body;
    }
  });

  // Fehlermarkierung bei Eingabe zurücksetzen
  form.querySelectorAll('input, textarea, select').forEach((input) => {
    input.addEventListener('input', () => clearError(input));
    input.addEventListener('change', () => clearError(input));
  });
})();
