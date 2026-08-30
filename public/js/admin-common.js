/* =========================================================================
   admin-common.js — utilidades compartidas por TODAS las páginas del panel.

   Expone el objeto global SJAdmin con lo mínimo que necesitan las páginas:
     · SJAdmin.escapeHtml(texto)   -> evita romper el HTML con datos del cliente
     · SJAdmin.requireSession()    -> true si hay sesión; si no, manda al login

   Además se encarga, en todas las páginas del panel, de:
     · el botón "Cerrar sesión"
     · marcar en el menú la página en la que estás
   ========================================================================= */
(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Comprueba que haya sesión iniciada antes de mostrar datos.
   * Si no la hay, redirige al login y devuelve false para que la página
   * detenga su carga.
   */
  async function requireSession() {
    try {
      var res = await fetch('/api/admin/session', { headers: { Accept: 'application/json' } });
      var data = await res.json();
      if (data && data.authenticated) return true;
    } catch (err) {
      console.error('No se pudo verificar la sesión:', err);
    }
    window.location.href = '/admin/login.html';
    return false;
  }

  async function logout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    window.location.href = '/admin/login.html';
  }

  /** Formato de fecha corto y legible en español. */
  function formatDate(value) {
    try {
      return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  window.SJAdmin = {
    escapeHtml: escapeHtml,
    requireSession: requireSession,
    logout: logout,
    formatDate: formatDate
  };

  /* ------------------- Botón de cerrar sesión ------------------- */
  function wireLogout() {
    var btn = document.getElementById('logout-btn');
    if (!btn || btn.dataset.sjWired) return;
    btn.dataset.sjWired = '1';
    btn.addEventListener('click', function () {
      if (confirm('¿Cerrar sesión del panel?')) logout();
    });
  }

  /* --------------- Marcar la página activa en el menú --------------- */
  function markActiveNav() {
    try {
      var current = window.location.pathname.replace(/\/$/, '');
      if (current === '/admin') current = '/admin/index.html';
      document.querySelectorAll('.admin-nav a').forEach(function (a) {
        var href = (a.getAttribute('href') || '').replace(/\/$/, '');
        if (href === current) a.classList.add('active');
      });
    } catch (e) { /* cosmético */ }
  }

  function boot() {
    wireLogout();
    markActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
