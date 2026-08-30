// Datos "de fábrica" con los que arranca el sitio la primera vez.
// A partir de ahí, todo esto se vuelve editable desde /admin (se guarda en
// data/*.json) — este archivo NUNCA se vuelve a leer una vez que existen
// esos archivos, así que es seguro tocarlo solo para el arranque inicial.

const DEFAULT_CATEGORIES = [
  { slug: 'motor', name: 'Motor', icon: '⚙️' },
  { slug: 'suspension', name: 'Suspensión', icon: '🎯' },
  { slug: 'frenos', name: 'Frenos', icon: '🛑' },
  { slug: 'direccion', name: 'Dirección', icon: '🎡' },
  { slug: 'embrague', name: 'Embrague', icon: '🔩' },
  { slug: 'electrico', name: 'Sistema eléctrico', icon: '⚡' },
  { slug: 'enfriamiento', name: 'Enfriamiento', icon: '❄️' },
  { slug: 'distribucion', name: 'Distribución', icon: '⏱️' },
  { slug: 'filtros', name: 'Filtros', icon: '🛢️' },
  { slug: 'rodamientos', name: 'Rodamientos', icon: '🔵' },
  { slug: 'carroceria', name: 'Carrocería', icon: '💡' },
  { slug: 'accesorios', name: 'Accesorios', icon: '🧰' }
];

const DEFAULT_BRANDS = [
  {
    slug: 'geely',
    name: 'Geely',
    models: [
      { slug: 'ck', name: 'CK' },
      { slug: 'mk', name: 'MK' },
      { slug: 'gc6', name: 'GC6' },
      { slug: 'fc', name: 'FC' },
      { slug: 'emgrand-718', name: 'Emgrand 718' },
      { slug: 'coolray', name: 'Coolray' },
      { slug: 'x3-pro', name: 'X3 Pro' },
      { slug: 'starray', name: 'Starray' },
      { slug: 'okavango', name: 'Okavango' },
      { slug: 'monjaro', name: 'Monjaro' }
    ]
  },
  { slug: 'kia', name: 'Kia', models: [] },
  { slug: 'hyundai', name: 'Hyundai', models: [] },
  { slug: 'toyota', name: 'Toyota', models: [] }
];

// Secciones para las Publicaciones (el "feed" de novedades del negocio).
// Es un catálogo separado del de piezas — pensado para anuncios cortos:
// ofertas, piezas recién llegadas, noticias del taller, consejos, avisos.
// Igual que las categorías del catálogo, esto se puede editar después desde
// /admin/secciones-publicaciones.html — estos son solo los valores iniciales.
const DEFAULT_PUB_SECTIONS = [
  { slug: 'ofertas', name: 'Ofertas y promociones', icon: '🔥' },
  { slug: 'nuevos-ingresos', name: 'Nuevos ingresos', icon: '📦' },
  { slug: 'noticias-taller', name: 'Noticias del taller', icon: '🔧' },
  { slug: 'consejos', name: 'Consejos y mantenimiento', icon: '💡' },
  { slug: 'avisos', name: 'Avisos y anuncios', icon: '📢' }
];

module.exports = { DEFAULT_CATEGORIES, DEFAULT_BRANDS, DEFAULT_PUB_SECTIONS };
