// Parser mínimo de multipart/form-data, sin dependencias externas.
// Soporta campos de texto y un archivo (imagen) por solicitud, suficiente
// para el formulario de "agregar/editar pieza" del panel de administración.

function parseMultipart(buffer, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  const boundary = match ? (match[1] || match[2]) : null;
  if (!boundary) throw new Error('No se encontró el boundary de multipart');

  const boundaryBuf = Buffer.from(`--${boundary}`);
  const parts = [];
  let start = buffer.indexOf(boundaryBuf);
  if (start === -1) return { fields: {}, files: {} };
  start += boundaryBuf.length;

  while (true) {
    const nextBoundary = buffer.indexOf(boundaryBuf, start);
    if (nextBoundary === -1) break;
    let chunk = buffer.slice(start, nextBoundary);
    // quitar CRLF inicial y final
    if (chunk.slice(0, 2).toString() === '\r\n') chunk = chunk.slice(2);
    if (chunk.slice(-2).toString() === '\r\n') chunk = chunk.slice(0, -2);
    if (chunk.length) parts.push(chunk);
    start = nextBoundary + boundaryBuf.length;
    // fin de stream: "--" tras el boundary
    if (buffer.slice(start, start + 2).toString() === '--') break;
  }

  const fields = {};
  const files = {};

  for (const part of parts) {
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const headerStr = part.slice(0, headerEnd).toString('utf8');
    const body = part.slice(headerEnd + 4);

    const nameMatch = /name="([^"]+)"/i.exec(headerStr);
    if (!nameMatch) continue;
    const fieldName = nameMatch[1];

    const filenameMatch = /filename="([^"]*)"/i.exec(headerStr);
    if (filenameMatch) {
      if (!filenameMatch[1]) continue; // input file vacío
      const typeMatch = /Content-Type:\s*([^\r\n]+)/i.exec(headerStr);
      files[fieldName] = {
        filename: filenameMatch[1],
        contentType: typeMatch ? typeMatch[1].trim() : 'application/octet-stream',
        data: body
      };
    } else {
      fields[fieldName] = body.toString('utf8');
    }
  }

  return { fields, files };
}

module.exports = { parseMultipart };
