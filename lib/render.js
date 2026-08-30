// Motor de plantillas minimalista: reemplaza {{marcadores}} en un archivo
// HTML por valores. Suficiente para renderizar el blog en el servidor con
// título y meta-descripción distintos por artículo (bueno para SEO), sin
// necesitar un framework.
const fs = require('fs');
const path = require('path');

const cache = new Map();

function loadTemplate(relativePath) {
  const fullPath = path.join(__dirname, '..', 'views', relativePath);
  if (cache.has(fullPath)) return cache.get(fullPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  cache.set(fullPath, content);
  return content;
}

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// values: objeto plano { CLAVE: 'texto' }. Los valores NO se escapan
// automáticamente (para poder inyectar HTML ya armado, como el listado de
// artículos); usa escapeHtml() explícitamente para texto libre del usuario.
function render(relativePath, values) {
  let html = loadTemplate(relativePath);
  Object.keys(values).forEach((key) => {
    const token = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(token, values[key] == null ? '' : String(values[key]));
  });
  return html;
}

module.exports = { render, escapeHtml };
