/* Policía Academy — Captación de leads con Klaviyo (client-side, sin backend)
   ──────────────────────────────────────────────────────────────────────────
   El sitio es estático (GitHub Pages), así que usamos el endpoint client-side
   de Klaviyo, que solo necesita la PUBLIC KEY (segura en el navegador) y un
   LIST ID. Suscribe el perfil a una LISTA (no sirve un segmento).

   Cualquier <form class="klaviyo-form"> de la página se conecta solo.
   Campos esperados por name: "nombre" (opcional), "email" (obligatorio),
   "telefono" (opcional). Un elemento .klaviyo-status muestra el resultado. */
(function () {
  'use strict';

  var PUBLIC_KEY = 'VLhDyE';           // Company ID (Public API Key) — seguro en cliente
  var LIST_ID    = 'V93kUA';           // Lista de Klaviyo (leads web policia.academy)
  var REVISION   = '2024-10-15';
  var ENDPOINT   = 'https://a.klaviyo.com/client/subscriptions/?company_id=' + PUBLIC_KEY;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Normaliza un teléfono español a formato E.164 (+34…). Devuelve null si vacío.
  function toE164(raw) {
    if (!raw) return null;
    var p = ('' + raw).replace(/[^\d+]/g, '');
    if (!p) return null;
    if (p.charAt(0) === '+') return p;
    if (p.length === 9) return '+34' + p;      // móvil español sin prefijo
    if (p.length === 11 && p.slice(0, 2) === '34') return '+' + p;
    return '+' + p;
  }

  function setStatus(form, msg, kind) {
    var el = form.querySelector('.klaviyo-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'klaviyo-status' + (kind ? ' is-' + kind : '');
  }

  function subscribe(form) {
    var g = function (n) { var f = form.querySelector('[name="' + n + '"]'); return f ? f.value.trim() : ''; };
    var email = g('email'), name = g('nombre'), phone = g('telefono');

    // Anti-spam: honeypot. Un humano nunca ve ni rellena "empresa".
    // Si viene relleno, fingimos éxito y no llamamos a la API.
    if (g('empresa')) {
      form.classList.add('is-done');
      var doneHp = form.querySelector('.klaviyo-done');
      if (doneHp) { doneHp.hidden = false; }
      var fieldsHp = form.querySelector('.klaviyo-fields');
      if (fieldsHp) { fieldsHp.hidden = true; }
      return;
    }

    if (!EMAIL_RE.test(email)) { setStatus(form, 'Introduce un email válido.', 'error'); return; }

    var attrs = { email: email };
    if (name)  attrs.first_name = name;
    var e164 = toE164(phone);
    if (e164)  attrs.phone_number = e164;

    var body = {
      data: {
        type: 'subscription',
        attributes: {
          custom_source: 'Web policia.academy',
          profile: { data: { type: 'profile', attributes: attrs } }
        },
        relationships: { list: { data: { type: 'list', id: LIST_ID } } }
      }
    };

    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Enviando…'; }
    setStatus(form, '', '');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', revision: REVISION },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (res.status === 202 || res.ok) {
        form.classList.add('is-done');
        var done = form.querySelector('.klaviyo-done');
        if (done) { done.hidden = false; }
        var fields = form.querySelector('.klaviyo-fields');
        if (fields) { fields.hidden = true; }
        setStatus(form, '', '');
      } else {
        return res.json().catch(function () { return null; }).then(function () {
          setStatus(form, 'No hemos podido apuntarte. Inténtalo de nuevo en un momento.', 'error');
        });
      }
    }).catch(function () {
      setStatus(form, 'Sin conexión. Revisa tu internet e inténtalo otra vez.', 'error');
    }).then(function () {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Apuntarme'; }
    });
  }

  document.querySelectorAll('form.klaviyo-form').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); subscribe(form); });
  });
})();
