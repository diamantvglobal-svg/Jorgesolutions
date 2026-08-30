/* =========================================================================
   publicaciones.js — feed público de publicaciones.

   Chips por sección (/api/pub-sections), buscador y detalle en ventana
   emergente. El filtrado lo hace el servidor en /api/publications.
   ========================================================================= */
(function () {
  'use strict';

  var state = { seccion: '', q: '', sections: [], items: [] };

  var grid = document.getElementById('feed-grid');
  var empty = document.getElementById('feed-empty');
  var chipScroll = document.getElementById('pub-chip-scroll');
  var searchForm = document.getElementById('pub-search-form');
  var searchInput = document.getElementById('pub-search-input');

  var modal = document.getElementById('pub-modal');
  var modalMedia = document.getElementById('pub-modal-media');
  var modalInfo = document.getElementById('pub-modal-info');
  var modalClose = document.getElementById('pub-modal-close');

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtDate(value) {
    try {
      return new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function waLink(message) {
    if (typeof window.SJ_WHATSAPP_LINK === 'function') return window.SJ_WHATSAPP_LINK(message);
    var num = (window.SJ_CONFIG && window.SJ_CONFIG.whatsappNumber) || '';
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(message);
  }

  function sectionOf(slug) {
    for (var i = 0; i < state.sections.length; i++) if (state.sections[i].slug === slug) return state.sections[i];
    return null;
  }

  async function getJSON(url) {
    var res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' en ' + url);
    return res.json();
  }

  function renderChips() {
    if (!chipScroll) return;
    var html = '<button class="chip' + (state.seccion ? '' : ' active') + '" data-seccion="">Todas</button>';
    html += state.sections.map(function (s) {
      return '<button class="chip' + (state.seccion === s.slug ? ' active' : '') + '" data-seccion="' + esc(s.slug) + '">' + esc(s.icon || '') + ' ' + esc(s.name) + '</button>';
    }).join('');
    chipScroll.innerHTML = html;
    chipScroll.querySelectorAll('.chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.seccion = btn.getAttribute('data-seccion') || '';
        renderChips();
        load();
      });
    });
  }

  function cardHTML(p) {
    var sec = sectionOf(p.section) || {};
    var media = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy">'
      : esc(sec.icon || '📰');
    var date = fmtDate(p.createdAt);
    var label = sec.name ? esc(sec.name) + (date ? ' · ' + date : '') : date;
    return '<article class="blog-card" data-id="' + esc(p.id) + '" style="cursor:pointer">' +
             '<div class="blog-card-media">' + media + '</div>' +
             '<div class="blog-card-body">' +
               '<span class="blog-date">' + label + '</span>' +
               '<h3>' + esc(p.title) + '</h3>' +
               '<p>' + esc(p.summary || '') + '</p>' +
               '<span class="blog-readmore">Leer más →</span>' +
             '</div>' +
           '</article>';
  }

  function render() {
    if (!grid) return;
    if (!state.items.length) {
      grid.innerHTML = '';
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    grid.innerHTML = state.items.map(cardHTML).join('');
    grid.querySelectorAll('.blog-card').forEach(function (card) {
      card.addEventListener('click', function () { openModal(card.getAttribute('data-id')); });
    });
  }

  function openModal(id) {
    var p = null;
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) p = state.items[i];
    if (!p || !modal) return;
    var sec = sectionOf(p.section) || {};

    if (modalMedia) {
      modalMedia.innerHTML = p.image
        ? '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '">'
        : '<span style="font-size:64px;opacity:.3">' + esc(sec.icon || '📰') + '</span>';
    }
    if (modalInfo) {
      modalInfo.innerHTML =
        '<span class="blog-date">' + (sec.name ? esc(sec.name) + ' · ' : '') + fmtDate(p.createdAt) + '</span>' +
        '<h3>' + esc(p.title) + '</h3>' +
        (p.summary ? '<p><strong>' + esc(p.summary) + '</strong></p>' : '') +
        (p.content ? '<p>' + esc(p.content).replace(/\n/g, '<br>') + '</p>' : '') +
        '<div class="modal-actions">' +
          '<a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="' + esc(waLink('Hola, vi la publicación "' + p.title + '" en la página web y quisiera más información.')) + '">Preguntar por WhatsApp</a>' +
        '</div>';
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function (ev) { if (ev.target === modal) closeModal(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeModal(); });

  async function load() {
    var params = new URLSearchParams();
    if (state.seccion) params.set('seccion', state.seccion);
    if (state.q) params.set('q', state.q);
    try {
      state.items = await getJSON('/api/publications?' + params.toString());
      if (!Array.isArray(state.items)) state.items = [];
    } catch (err) {
      console.error('No se pudieron cargar las publicaciones:', err);
      state.items = [];
    }
    render();
  }

  async function init() {
    try {
      var url = new URLSearchParams(window.location.search);
      state.seccion = url.get('seccion') || '';
      state.q = url.get('q') || '';
      if (state.q && searchInput) searchInput.value = state.q;
    } catch (e) { /* sin filtros iniciales */ }

    try {
      state.sections = await getJSON('/api/pub-sections');
      if (!Array.isArray(state.sections)) state.sections = [];
    } catch (e) { state.sections = []; }

    renderChips();
    await load();
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      state.q = searchInput ? searchInput.value.trim() : '';
      load();
    });
  }
  if (searchInput) {
    searchInput.addEventListener('search', function () {
      if (!searchInput.value.trim() && state.q) { state.q = ''; load(); }
    });
  }

  init();
})();
