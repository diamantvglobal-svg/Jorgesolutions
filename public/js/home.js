/* =========================================================================
   home.js — contenido dinámico de la página de inicio.

   Rellena tres bloques a partir de la API pública:
     · #brands-grid       -> /api/brands
     · #categories-grid   -> /api/categories
     · #home-pub-grid     -> /api/publications  (las 3 más recientes)

   Si alguna llamada falla, el bloque correspondiente se oculta en lugar de
   dejar un hueco roto o de tumbar el resto de la página.
   ========================================================================= */
(function () {
  'use strict';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function refreshReveal() {
    if (typeof window.SJRevealScan === 'function') window.SJRevealScan(document);
  }

  async function getJSON(url) {
    var res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' en ' + url);
    return res.json();
  }

  /* -------------------------- Marcas -------------------------- */
  async function loadBrands() {
    var grid = document.getElementById('brands-grid');
    if (!grid) return;
    try {
      var brands = await getJSON('/api/brands');
      if (!Array.isArray(brands) || !brands.length) { grid.innerHTML = ''; return; }

      grid.innerHTML = brands.map(function (b) {
        var count = (b.models && b.models.length) || 0;
        var sub = count
          ? count + (count === 1 ? ' modelo disponible' : ' modelos disponibles')
          : 'Consulta las piezas disponibles';
        return '<a class="section-card reveal" href="/catalogo.html?brand=' + encodeURIComponent(b.slug) + '">' +
                 '<div class="icon">🚗</div>' +
                 '<h3>' + esc(b.name) + '</h3>' +
                 '<p>' + esc(sub) + '</p>' +
                 '<span class="go">Ver piezas ' + ARROW + '</span>' +
               '</a>';
      }).join('');
      refreshReveal();
    } catch (err) {
      console.error('No se pudieron cargar las marcas:', err);
      grid.innerHTML = '';
    }
  }

  /* ------------------------ Categorías ------------------------ */
  async function loadCategories() {
    var grid = document.getElementById('categories-grid');
    if (!grid) return;
    try {
      var cats = await getJSON('/api/categories');
      if (!Array.isArray(cats) || !cats.length) { grid.innerHTML = ''; return; }

      grid.innerHTML = cats.map(function (c) {
        return '<a class="section-card reveal" href="/catalogo.html?category=' + encodeURIComponent(c.slug) + '">' +
                 '<div class="icon">' + esc(c.icon || '🔧') + '</div>' +
                 '<h3>' + esc(c.name) + '</h3>' +
                 '<p>Piezas de ' + esc((c.name || '').toLowerCase()) + ' para todas las marcas.</p>' +
                 '<span class="go">Ver categoría ' + ARROW + '</span>' +
               '</a>';
      }).join('');
      refreshReveal();
    } catch (err) {
      console.error('No se pudieron cargar las categorías:', err);
      grid.innerHTML = '';
    }
  }

  /* --------------------- Últimas publicaciones --------------------- */
  async function loadPublications() {
    var grid = document.getElementById('home-pub-grid');
    var section = document.getElementById('publicaciones-preview');
    if (!grid) return;
    try {
      var results = await Promise.all([
        getJSON('/api/publications'),
        getJSON('/api/pub-sections').catch(function () { return []; })
      ]);
      var pubs = Array.isArray(results[0]) ? results[0] : [];
      var sections = Array.isArray(results[1]) ? results[1] : [];

      if (!pubs.length) {
        grid.innerHTML = '';
        if (section) section.style.display = 'none';
        return;
      }
      if (section) section.style.display = '';

      var byslug = {};
      sections.forEach(function (s) { byslug[s.slug] = s; });

      grid.innerHTML = pubs.slice(0, 3).map(function (p) {
        var sec = byslug[p.section] || {};
        var media = p.image
          ? '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy">'
          : esc(sec.icon || '📰');
        var date = '';
        try { date = new Date(p.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { date = ''; }
        var label = sec.name ? esc(sec.name) + (date ? ' · ' + date : '') : date;
        return '<a class="blog-card reveal" href="/publicaciones.html">' +
                 '<div class="blog-card-media">' + media + '</div>' +
                 '<div class="blog-card-body">' +
                   '<span class="blog-date">' + label + '</span>' +
                   '<h3>' + esc(p.title) + '</h3>' +
                   '<p>' + esc(p.summary || '') + '</p>' +
                   '<span class="blog-readmore">Leer más →</span>' +
                 '</div>' +
               '</a>';
      }).join('');
      refreshReveal();
    } catch (err) {
      console.error('No se pudieron cargar las publicaciones:', err);
      grid.innerHTML = '';
      if (section) section.style.display = 'none';
    }
  }

  loadBrands();
  loadCategories();
  loadPublications();
})();
