/* Policía Academy — JS mínimo
   ─────────────────────────────────────────────────────────────
   1. Año dinámico en el footer
   2. Banner de cookies (LSSI-CE compliant)
   3. Smooth scroll para anchors (fallback si CSS no aplica)
*/

(function () {
  'use strict';

  // ── 1. Año dinámico ─────────────────────────────────────
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ── 2. Banner cookies ───────────────────────────────────
  // Storage key: pa_consent → 'all' | 'necessary' | null
  const STORAGE_KEY = 'pa_consent';
  const banner = document.getElementById('cookieBanner');

  if (banner) {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Pequeño retraso para no chocar con el LCP
      setTimeout(() => banner.classList.add('is-visible'), 600);
    }

    const acceptBtn = document.getElementById('cookieAccept');
    const rejectBtn = document.getElementById('cookieReject');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, 'all');
        banner.classList.remove('is-visible');
        // Aquí cargarías scripts analíticos si los hubiera
        // loadAnalytics();
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, 'necessary');
        banner.classList.remove('is-visible');
      });
    }
  }

  // ── 3. Smooth scroll fallback ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
