/* Policía Academy — Captación de leads con Klaviyo
   ──────────────────────────────────────────────────────────────────────────
   El alta la hace /api/klaviyo, una función de SERVIDOR (Vercel), no el navegador:
   la API pública de cliente de Klaviyo (/client/subscriptions/) contesta 202 y luego
   no crea nada en la cuenta. La de servidor sí es fiable, pero usa la clave privada,
   que no puede vivir en el navegador. Esta misma lógica es la de atco.academy.

   Formularios propios (con el diseño del sitio):
     <form class="klaviyo-form" data-kl="origen"> con inputs name="nombre|email|telefono"
     y un honeypot name="pa_hp". El teléfono es obligatorio.
   Además: pop-up del temario que se abre a los 35 s o al 55 % de scroll, una vez por
   visita, y con cualquier elemento [data-temario]. */
(function () {
  'use strict';

  var APP_URL = 'https://alumno.policia.academy/?ref=web';
  var here = (location.pathname.split('/').pop() || 'home').replace('.html', '') || 'home';

  // ── De dónde llega el visitante (UTM + referrer) ────────────────────────
  // Se guarda al entrar: tras navegar dos páginas el referente ya es la propia web
  // y las UTM han desaparecido de la barra. La ubicación la resuelve el servidor.
  var ORIGEN = (function () {
    var g = {};
    try { g = JSON.parse(sessionStorage.getItem('pa_origen') || 'null') || {}; } catch (_) {}
    if (!g.guardado) {
      var q = new URLSearchParams(location.search); g = { guardado: 1 };
      if (document.referrer && document.referrer.indexOf(location.host) === -1) g.referrer = document.referrer;
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { if (q.get(k)) g[k] = q.get(k); });
      try { sessionStorage.setItem('pa_origen', JSON.stringify(g)); } catch (_) {}
    }
    return g;
  })();

  function klSubscribe(data, origen) {
    var tel = (data.phone || '').replace(/[^\d+]/g, '');
    if (tel && tel[0] !== '+') tel = '+34' + tel.replace(/^0+/, '');
    var carga = { email: data.email, name: data.name || '', phone: tel, origen: origen, pagina: location.pathname };
    for (var k in ORIGEN) if (k !== 'guardado') carga[k] = ORIGEN[k];
    return fetch('/api/klaviyo', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(carga)
    }).then(function (r) {
      if (r.ok) return r;
      return r.text().then(function (t) { throw new Error(r.status + ' ' + t.slice(0, 200)); });
    });
  }

  var KO_HTML = 'No hemos podido apuntarte ahora mismo. Escríbenos a <a href="mailto:hola@policia.academy" style="text-decoration:underline">hola@policia.academy</a> y te enviamos el plan a mano.';

  // Muestra el éxito. Si el form tiene .klaviyo-done (los inline), lo revela.
  // Si no (el popup), pinta un mensaje.
  function showSuccess(fm, msg) {
    try { localStorage.setItem('pa_lead', '1'); } catch (_) {}
    var done = fm.querySelector('.klaviyo-done');
    var fields = fm.querySelector('.klaviyo-fields');
    if (done) {
      fm.classList.add('is-done');
      done.hidden = false;
      if (fields) fields.hidden = true;
      return;
    }
    fm.style.display = 'none';
    if (msg) {
      msg.style.color = 'var(--gold)';
      msg.innerHTML = 'Hecho. Revisa tu correo (mira también en promociones). <a href="' + APP_URL + '" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:underline">Mientras llega, abre la app y empieza</a>.';
    }
  }

  function setStatus(el, text, kind) {
    if (!el) return;
    el.textContent = text || '';
    el.style.color = kind === 'error' ? '#ff8a8a' : (kind === 'ok' ? 'var(--gold)' : '');
  }

  function wire(fm, origen) {
    // Honeypot: si no existe en el HTML, se añade.
    if (!fm.querySelector('input[name=pa_hp]')) {
      var miel = document.createElement('input');
      miel.name = 'pa_hp'; miel.tabIndex = -1; miel.autocomplete = 'off'; miel.setAttribute('aria-hidden', 'true');
      miel.setAttribute('data-lpignore', 'true'); miel.setAttribute('data-1p-ignore', ''); miel.setAttribute('data-form-type', 'other');
      miel.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
      fm.appendChild(miel);
    }
    // Mensaje: reutiliza .klaviyo-status si existe; si no, crea uno tras el form.
    var msg = fm.querySelector('.klaviyo-status');
    if (!msg) { msg = document.createElement('p'); msg.className = 'fmsg'; msg.setAttribute('aria-live', 'polite'); fm.insertAdjacentElement('afterend', msg); }

    fm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Trampa de miel: un campo que una persona no ve y un robot sí rellena.
      var trampa = fm.querySelector('input[name=pa_hp]');
      if (trampa && trampa.value) { showSuccess(fm, msg); return; }

      var em = fm.querySelector('input[type=email], input[name=email]');
      var nm = fm.querySelector('input[name=nombre], input[name=first_name]');
      var ph = fm.querySelector('input[type=tel], input[name=telefono], input[name=phone]');
      var bt = fm.querySelector('button[type=submit]');
      var email = ((em && em.value) || '').trim().toLowerCase();

      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus(msg, 'Revisa el correo: parece que falta algo.', 'error'); em && em.focus(); return; }
      // Teléfono obligatorio (validado aquí porque el form lleva novalidate).
      var tel = ph ? (ph.value || '').replace(/[^\d+]/g, '') : '';
      if (ph && tel.replace(/\D/g, '').length < 9) { setStatus(msg, 'Nos falta tu móvil: son nueve cifras.', 'error'); ph.focus(); return; }

      bt.disabled = true; var old = bt.innerHTML; bt.textContent = 'Enviando…'; setStatus(msg, '', '');
      klSubscribe({ email: email, name: nm && nm.value.trim(), phone: ph && ph.value.trim() }, origen)
        .then(function () { showSuccess(fm, msg); })
        .catch(function (err) { bt.disabled = false; bt.innerHTML = old; msg.style.color = '#ff8a8a'; msg.innerHTML = KO_HTML; console.error('Klaviyo', err); });
    });
  }

  // Cablea todos los formularios propios.
  document.querySelectorAll('form.klaviyo-form').forEach(function (fm) { wire(fm, fm.dataset.kl || here); });

  // ── Pop-up del temario ──────────────────────────────────────────────────
  var md = document.createElement('div');
  md.className = 'pa-modal'; md.setAttribute('role', 'dialog'); md.setAttribute('aria-modal', 'true'); md.setAttribute('aria-label', 'Recibir el temario de Policía Nacional');
  md.innerHTML =
    '<div class="pa-modal-bg" data-close></div>' +
    '<div class="pa-modal-box">' +
      '<button class="pa-modal-x" data-close aria-label="Cerrar">×</button>' +
      '<span class="pa-modal-tag">Gratis · Temario ordenado</span>' +
      '<h3>Te envío el temario de Policía Nacional</h3>' +
      '<p>Los temas de la Escala Básica del CNP, ordenados y con un plan de estudio de 12 semanas. Gratis, directo a tu correo.</p>' +
      '<form class="klaviyo-form pa-modal-form" data-kl="popup-temario" novalidate>' +
        '<input type="text" name="nombre" placeholder="Tu nombre" autocomplete="given-name" />' +
        '<input type="email" name="email" placeholder="Tu email" autocomplete="email" required />' +
        '<input type="tel" name="telefono" placeholder="Tu móvil" autocomplete="tel" required />' +
        '<button type="submit" class="btn btn-primary btn-block">Enviarme el temario →</button>' +
        '<p class="klaviyo-status" role="status" aria-live="polite"></p>' +
      '</form>' +
      '<small>Solo para enviarte el temario y avisos útiles. Baja con un clic. <a href="/privacidad.html">Privacidad</a>.</small>' +
    '</div>';
  document.body.appendChild(md);
  wire(md.querySelector('form'), 'popup-temario');

  var isLead = function () { try { return localStorage.getItem('pa_lead') || sessionStorage.getItem('pa_pop'); } catch (_) { return null; } };
  function openModal(manual) {
    if (!manual && isLead()) return;
    try { sessionStorage.setItem('pa_pop', '1'); } catch (_) {}
    md.classList.add('on');
    setTimeout(function () { var f = md.querySelector('input'); f && f.focus(); }, 80);
  }
  md.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) md.classList.remove('on'); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') md.classList.remove('on'); });
  document.querySelectorAll('[data-temario]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); openModal(true); });
  });

  // Auto-apertura: a los 35 s o al 55 % de scroll, una vez por visita. Nunca en páginas legales.
  var legal = /privacidad|cookies|aviso-legal|borrar-cuenta|404/.test(here);
  if (!legal && !isLead()) {
    var opened = false;
    var fire = function () { if (!opened) { opened = true; openModal(false); } };
    setTimeout(fire, 35000);
    addEventListener('scroll', function () {
      var st = window.scrollY || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && st / h > 0.55) fire();
    }, { passive: true });
  }
})();
