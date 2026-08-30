/* =========================================================================
   admin.js — panel de piezas (pantalla principal del administrador).

   Incluye el medidor de inventario, la tabla de piezas con filtros y el
   panel lateral para agregar / editar / eliminar piezas, con foto, precio
   y cantidad en stock.
   ========================================================================= */
(function () {
  'use strict';

  var state = { products: [], brands: [], categories: [], filter: { brand: '', category: '', q: '' } };

  var el = {
    statRow: document.getElementById('stat-row'),
    tbody: document.getElementById('admin-tbody'),
    brandFilter: document.getElementById('admin-brand-filter'),
    categoryFilter: document.getElementById('admin-category-filter'),
    search: document.getElementById('admin-search'),
    openAdd: document.getElementById('open-add-btn'),

    overlay: document.getElementById('drawer-overlay'),
    title: document.getElementById('drawer-title'),
    error: document.getElementById('form-error'),
    form: document.getElementById('product-form'),
    id: document.getElementById('product-id'),

    preview: document.getElementById('image-preview'),
    imageFile: document.getElementById('image-file'),
    imageUrl: document.getElementById('image-url'),

    name: document.getElementById('p-name'),
    brand: document.getElementById('p-brand'),
    model: document.getElementById('p-model'),
    category: document.getElementById('p-category'),
    sku: document.getElementById('p-sku'),
    price: document.getElementById('p-price'),
    stock: document.getElementById('p-stock'),
    desc: document.getElementById('p-desc'),
    inStock: document.getElementById('p-instock'),
    available: document.getElementById('p-available'),

    cancel: document.getElementById('drawer-cancel'),
    save: document.getElementById('save-btn')
  };

  var esc = (window.SJAdmin && window.SJAdmin.escapeHtml) || function (v) { return String(v == null ? '' : v); };

  function money(p) {
    if (p === null || p === undefined || p === '') return null;
    var n = Number(p);
    if (!isFinite(n)) return null;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  async function getJSON(url) {
    var res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' en ' + url);
    return res.json();
  }

  function brandOf(slug) {
    for (var i = 0; i < state.brands.length; i++) if (state.brands[i].slug === slug) return state.brands[i];
    return null;
  }
  function nameOfBrand(slug) { var b = brandOf(slug); return b ? b.name : (slug || ''); }
  function nameOfCategory(slug) {
    for (var i = 0; i < state.categories.length; i++) if (state.categories[i].slug === slug) return state.categories[i].name;
    return slug || '';
  }
  function nameOfModel(brandSlug, modelSlug) {
    var b = brandOf(brandSlug);
    if (!b || !b.models) return modelSlug || '';
    for (var i = 0; i < b.models.length; i++) if (b.models[i].slug === modelSlug) return b.models[i].name;
    return modelSlug || '';
  }

  /* ------------------------ Medidor de inventario ------------------------
     Cuenta las unidades reales del inventario. Si una pieza lleva conteo
     exacto (campo "stock"), se suman sus unidades; si no lleva conteo, se
     cuenta como 1 unidad mientras esté disponible.
     ---------------------------------------------------------------------*/
  function inventoryTotals() {
    var units = 0, tracked = 0;
    state.products.forEach(function (p) {
      var hasStock = typeof p.stock === 'number' && isFinite(p.stock);
      var qty = hasStock ? p.stock : (p.inStock !== false ? 1 : 0);
      if (hasStock) tracked++;
      units += qty;
    });
    return { units: units, tracked: tracked };
  }

  function renderStats() {
    if (!el.statRow) return;
    var total = state.products.length;
    var visible = state.products.filter(function (p) { return p.available !== false; }).length;
    var inStock = state.products.filter(function (p) { return p.inStock !== false; }).length;
    var units = inventoryTotals().units;

    el.statRow.innerHTML =
      '<div class="stat-box"><strong>' + total + '</strong><span>Piezas totales</span></div>' +
      '<div class="stat-box"><strong>' + units + '</strong><span>Unidades en inventario</span></div>' +
      '<div class="stat-box"><strong>' + visible + '</strong><span>Visibles al público</span></div>' +
      '<div class="stat-box"><strong>' + inStock + '</strong><span>En stock</span></div>' +
      '<div class="stat-box"><strong>' + state.brands.length + '</strong><span>Marcas activas</span></div>';
  }

  /* ---------------------------- Filtros ---------------------------- */
  function renderFilters() {
    if (el.brandFilter) {
      el.brandFilter.innerHTML = '<option value="">Todas las marcas</option>' + state.brands.map(function (b) {
        return '<option value="' + esc(b.slug) + '"' + (state.filter.brand === b.slug ? ' selected' : '') + '>' + esc(b.name) + '</option>';
      }).join('');
    }
    if (el.categoryFilter) {
      el.categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + state.categories.map(function (c) {
        return '<option value="' + esc(c.slug) + '"' + (state.filter.category === c.slug ? ' selected' : '') + '>' + esc(c.name) + '</option>';
      }).join('');
    }
  }

  function visibleProducts() {
    var q = state.filter.q.trim().toLowerCase();
    return state.products.filter(function (p) {
      if (state.filter.brand && p.brand !== state.filter.brand) return false;
      if (state.filter.category && p.category !== state.filter.category) return false;
      if (q) {
        var hay = ((p.name || '') + ' ' + (p.sku || '') + ' ' + (p.description || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* ----------------------------- Tabla ----------------------------- */
  function renderTable() {
    if (!el.tbody) return;
    var list = visibleProducts();
    if (!list.length) {
      el.tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#79808c">No hay piezas que coincidan con el filtro.</td></tr>';
      return;
    }

    el.tbody.innerHTML = list.map(function (p) {
      var thumb = p.image
        ? '<img src="' + esc(p.image) + '" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:8px">'
        : '<div style="width:44px;height:44px;border-radius:8px;background:#eef1f5;display:flex;align-items:center;justify-content:center">🔧</div>';
      var price = money(p.price);
      var estado = p.available === false
        ? '<span class="badge badge-off">Oculta</span>'
        : (p.inStock === false ? '<span class="badge badge-off">Agotada</span>' : '<span class="badge badge-on">Visible</span>');

      return '<tr>' +
        '<td>' + thumb + '</td>' +
        '<td><strong>' + esc(p.name) + '</strong>' + (p.sku ? '<div style="font-size:11.5px;color:#79808c">' + esc(p.sku) + '</div>' : '') + '</td>' +
        '<td>' + esc(nameOfBrand(p.brand)) + (p.model ? ' ' + esc(nameOfModel(p.brand, p.model)) : '') + '</td>' +
        '<td>' + esc(nameOfCategory(p.category)) + '</td>' +
        '<td>' + (price || '<span style="color:#c3c9d1">A consultar</span>') + '</td>' +
        '<td>' + (typeof p.stock === 'number' ? p.stock : '<span style="color:#c3c9d1">—</span>') + '</td>' +
        '<td>' + estado + '</td>' +
        '<td><div class="row-actions">' +
          '<button type="button" data-action="edit" data-id="' + esc(p.id) + '" title="Editar">✏️</button>' +
          '<button type="button" data-action="delete" data-id="' + esc(p.id) + '" title="Eliminar">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4h6v3m-9 0l1 13h10l1-13" stroke="#e60012" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');

    el.tbody.querySelectorAll('[data-action="edit"]').forEach(function (btn) {
      btn.addEventListener('click', function () { openDrawer(btn.getAttribute('data-id')); });
    });
    el.tbody.querySelectorAll('[data-action="delete"]').forEach(function (btn) {
      btn.addEventListener('click', function () { removeProduct(btn.getAttribute('data-id')); });
    });
  }

  function renderAll() {
    renderStats();
    renderTable();
  }

  /* --------------------------- Panel lateral --------------------------- */
  function fillSelect(select, items, selected, placeholder) {
    if (!select) return;
    var html = placeholder ? '<option value="">' + esc(placeholder) + '</option>' : '';
    html += items.map(function (i) {
      return '<option value="' + esc(i.slug) + '"' + (selected === i.slug ? ' selected' : '') + '>' + esc(i.name) + '</option>';
    }).join('');
    select.innerHTML = html;
  }

  function refreshModelOptions(brandSlug, selectedModel) {
    var b = brandOf(brandSlug);
    var models = (b && b.models) || [];
    fillSelect(el.model, models, selectedModel || '', 'Todos los modelos de la marca');
    if (el.model) el.model.disabled = !models.length;
  }

  function setPreview(src) {
    if (!el.preview) return;
    el.preview.innerHTML = src
      ? '<img src="' + esc(src) + '" alt="Vista previa">'
      : '<span style="color:#c3c9d1;font-size:13px">Sin imagen</span>';
  }

  function showError(message) {
    if (!el.error) return;
    if (message) { el.error.textContent = message; el.error.classList.add('show'); }
    else { el.error.textContent = ''; el.error.classList.remove('show'); }
  }

  function openDrawer(id) {
    showError('');
    var p = null;
    if (id) for (var i = 0; i < state.products.length; i++) if (state.products[i].id === id) p = state.products[i];

    if (el.title) el.title.textContent = p ? 'Editar pieza' : 'Agregar pieza';
    if (el.id) el.id.value = p ? p.id : '';
    if (el.name) el.name.value = p ? (p.name || '') : '';

    fillSelect(el.brand, state.brands, p ? p.brand : (state.brands[0] && state.brands[0].slug), null);
    refreshModelOptions(el.brand ? el.brand.value : '', p ? p.model : '');
    fillSelect(el.category, state.categories, p ? p.category : (state.categories[0] && state.categories[0].slug), null);

    if (el.sku) el.sku.value = p ? (p.sku || '') : '';
    if (el.price) el.price.value = p && p.price !== null && p.price !== undefined ? p.price : '';
    if (el.stock) el.stock.value = p && typeof p.stock === 'number' ? p.stock : '';
    if (el.desc) el.desc.value = p ? (p.description || '') : '';
    if (el.inStock) el.inStock.checked = p ? p.inStock !== false : true;
    if (el.available) el.available.checked = p ? p.available !== false : true;
    if (el.imageUrl) el.imageUrl.value = '';
    if (el.imageFile) el.imageFile.value = '';
    setPreview(p ? p.image : '');

    if (el.overlay) el.overlay.classList.add('open');
  }

  function closeDrawer() {
    if (el.overlay) el.overlay.classList.remove('open');
    showError('');
  }

  async function submitForm(ev) {
    ev.preventDefault();
    showError('');
    if (el.save) { el.save.disabled = true; el.save.textContent = 'Guardando…'; }

    try {
      var id = el.id ? el.id.value : '';
      var fd = new FormData();
      fd.set('name', el.name ? el.name.value.trim() : '');
      fd.set('brand', el.brand ? el.brand.value : '');
      fd.set('model', el.model && !el.model.disabled ? el.model.value : '');
      fd.set('category', el.category ? el.category.value : '');
      fd.set('sku', el.sku ? el.sku.value.trim() : '');
      fd.set('price', el.price ? el.price.value.trim() : '');
      fd.set('stock', el.stock ? el.stock.value.trim() : '');
      fd.set('description', el.desc ? el.desc.value.trim() : '');
      fd.set('imageUrl', el.imageUrl ? el.imageUrl.value.trim() : '');
      fd.set('available', el.available && el.available.checked ? 'true' : 'false');
      fd.set('inStock', el.inStock && el.inStock.checked ? 'true' : 'false');
      if (el.imageFile && el.imageFile.files && el.imageFile.files[0]) {
        fd.set('image', el.imageFile.files[0]);
      }

      var url = id ? '/api/admin/products/' + encodeURIComponent(id) : '/api/admin/products';
      var res = await fetch(url, { method: id ? 'PUT' : 'POST', body: fd });
      var data = await res.json().catch(function () { return {}; });

      if (!res.ok) {
        showError(data.error || 'No se pudo guardar la pieza. Revisa los datos e inténtalo de nuevo.');
        return;
      }
      closeDrawer();
      await loadProducts();
      renderAll();
    } catch (err) {
      console.error('Error al guardar la pieza:', err);
      showError('Hubo un problema de conexión al guardar. Revisa tu internet e inténtalo otra vez.');
    } finally {
      if (el.save) { el.save.disabled = false; el.save.textContent = 'Guardar'; }
    }
  }

  async function removeProduct(id) {
    var p = null;
    for (var i = 0; i < state.products.length; i++) if (state.products[i].id === id) p = state.products[i];
    var label = p ? '"' + p.name + '"' : 'esta pieza';
    if (!confirm('¿Eliminar ' + label + ' del catálogo? Esta acción no se puede deshacer.')) return;
    try {
      var res = await fetch('/api/admin/products/' + encodeURIComponent(id), { method: 'DELETE' });
      if (!res.ok) { alert('No se pudo eliminar la pieza.'); return; }
      await loadProducts();
      renderAll();
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Hubo un problema de conexión al eliminar la pieza.');
    }
  }

  /* ----------------------------- Carga ----------------------------- */
  async function loadProducts() {
    state.products = await getJSON('/api/admin/products');
    if (!Array.isArray(state.products)) state.products = [];
  }

  async function init() {
    if (window.SJAdmin && typeof window.SJAdmin.requireSession === 'function') {
      var ok = await window.SJAdmin.requireSession();
      if (!ok) return;
    }
    try {
      var res = await Promise.all([
        getJSON('/api/admin/brands').catch(function () { return []; }),
        getJSON('/api/admin/categories').catch(function () { return []; })
      ]);
      state.brands = Array.isArray(res[0]) ? res[0] : [];
      state.categories = Array.isArray(res[1]) ? res[1] : [];
      await loadProducts();
    } catch (err) {
      console.error('No se pudo cargar el panel:', err);
      if (el.tbody) el.tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#c0392b">No se pudieron cargar las piezas. Recarga la página.</td></tr>';
      return;
    }
    renderFilters();
    renderAll();
  }

  /* ---------------------------- Eventos ---------------------------- */
  if (el.openAdd) el.openAdd.addEventListener('click', function () { openDrawer(null); });
  if (el.cancel) el.cancel.addEventListener('click', closeDrawer);
  if (el.overlay) el.overlay.addEventListener('click', function (ev) { if (ev.target === el.overlay) closeDrawer(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeDrawer(); });
  if (el.form) el.form.addEventListener('submit', submitForm);

  if (el.brand) el.brand.addEventListener('change', function () { refreshModelOptions(el.brand.value, ''); });
  if (el.imageFile) {
    el.imageFile.addEventListener('change', function () {
      var file = el.imageFile.files && el.imageFile.files[0];
      if (!file) { setPreview(el.imageUrl ? el.imageUrl.value : ''); return; }
      var reader = new FileReader();
      reader.onload = function (e) { setPreview(e.target.result); };
      reader.readAsDataURL(file);
    });
  }
  if (el.imageUrl) {
    el.imageUrl.addEventListener('input', function () {
      if (el.imageFile && el.imageFile.files && el.imageFile.files[0]) return;
      setPreview(el.imageUrl.value.trim());
    });
  }

  if (el.brandFilter) el.brandFilter.addEventListener('change', function () { state.filter.brand = el.brandFilter.value; renderTable(); });
  if (el.categoryFilter) el.categoryFilter.addEventListener('change', function () { state.filter.category = el.categoryFilter.value; renderTable(); });
  if (el.search) el.search.addEventListener('input', function () { state.filter.q = el.search.value; renderTable(); });

  init();
})();
