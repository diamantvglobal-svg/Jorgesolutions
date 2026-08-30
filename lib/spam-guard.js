// Protección simple contra spam para formularios públicos (citas, solicitud
// de piezas): honeypot + límite de envíos por IP. Sin dependencias externas,
// sin servicios como reCAPTCHA (no hacen falta claves ni conexión externa).

// Límite: máximo N envíos por IP cada X minutos, por tipo de formulario.
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_SUBMISSIONS = 8;
const hits = new Map(); // clave: `${ip}:${formName}` -> [timestamps]

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress || 'desconocida';
}

function isRateLimited(req, formName) {
  const ip = getClientIp(req);
  const key = `${ip}:${formName}`;
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(key, list);
  return list.length > MAX_SUBMISSIONS;
}

// Un campo oculto (honeypot) que un humano nunca llena; si viene con
// contenido, casi seguro es un bot.
function isHoneypotTripped(fields, fieldName) {
  fieldName = fieldName || 'website';
  return !!(fields && fields[fieldName] && String(fields[fieldName]).trim());
}

module.exports = { isRateLimited, isHoneypotTripped, getClientIp };
