// Almacenamiento simple basado en archivos JSON. Sin base de datos externa.
const fs = require('fs');
const path = require('path');
const { DEFAULT_CATEGORIES, DEFAULT_BRANDS, DEFAULT_PUB_SECTIONS } = require('./seed-data');

// Carpeta donde viven los datos.
//
// Por defecto es la carpeta "data" del propio proyecto, que es lo correcto
// para trabajar en la computadora y para el plan gratuito.
//
// En un servidor con disco permanente (plan de pago), se apunta con la
// variable de entorno DATA_DIR a la carpeta del disco. La primera vez que
// arranque así, los datos que vienen en el proyecto se copian al disco
// (ver copiarSemillaSiHaceFalta más abajo), de modo que el catálogo NO
// aparece vacío y a partir de ahí todo lo que cargue Jorge se conserva
// aunque el servidor se reinicie.
const BUNDLED_DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_DIR = process.env.DATA_DIR || BUNDLED_DATA_DIR;
const FILES = {
  products: path.join(DATA_DIR, 'products.json'),
  admin: path.join(DATA_DIR, 'admin.json'),
  categories: path.join(DATA_DIR, 'categories.json'),
  brands: path.join(DATA_DIR, 'brands.json'),
  testimonials: path.join(DATA_DIR, 'testimonials.json'),
  posts: path.join(DATA_DIR, 'posts.json'),
  appointments: path.join(DATA_DIR, 'appointments.json'),
  partRequests: path.join(DATA_DIR, 'part-requests.json'),
  publications: path.join(DATA_DIR, 'publications.json'),
  pubSections: path.join(DATA_DIR, 'pub-sections.json')
};

function ensureFile(file, defaultContent) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultContent, null, 2));
  }
}

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

/**
 * Copia los datos que vienen dentro del proyecto al disco permanente, pero
 * SOLO la primera vez (si el archivo todavía no existe allí). Nunca pisa
 * nada que Jorge ya haya guardado.
 *
 * Sin esto, al estrenar un disco vacío el sitio arrancaría sin piezas ni
 * publicaciones, como si se hubiera borrado todo.
 */
function copiarSemillaSiHaceFalta() {
  if (DATA_DIR === BUNDLED_DATA_DIR) return; // no hay disco aparte, no hay nada que copiar
  if (!fs.existsSync(BUNDLED_DATA_DIR)) return;
  for (const nombre of fs.readdirSync(BUNDLED_DATA_DIR)) {
    if (!nombre.endsWith('.json')) continue;
    if (nombre === 'admin.json') continue; // la contraseña nunca se copia
    const destino = path.join(DATA_DIR, nombre);
    if (fs.existsSync(destino)) continue;
    try {
      fs.copyFileSync(path.join(BUNDLED_DATA_DIR, nombre), destino);
    } catch (err) {
      console.error('No se pudo copiar el archivo inicial ' + nombre + ':', err.message);
    }
  }
}
copiarSemillaSiHaceFalta();

ensureFile(FILES.products, []);
ensureFile(FILES.admin, null); // se crea con scripts/set-admin-password.js
ensureFile(FILES.categories, DEFAULT_CATEGORIES);
ensureFile(FILES.brands, DEFAULT_BRANDS);
ensureFile(FILES.testimonials, []);
ensureFile(FILES.posts, []);
ensureFile(FILES.appointments, []);
ensureFile(FILES.partRequests, []);
ensureFile(FILES.publications, []);
ensureFile(FILES.pubSections, DEFAULT_PUB_SECTIONS);

function readJSON(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return raw.trim() ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function writeJSON(file, data) {
  // Escritura atómica: escribe a un archivo temporal y luego renombra.
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function makeCollection(file, fallback) {
  return {
    get() { return readJSON(file) || fallback; },
    save(data) { writeJSON(file, data); }
  };
}

const products = makeCollection(FILES.products, []);
const categoriesCol = makeCollection(FILES.categories, DEFAULT_CATEGORIES);
const brandsCol = makeCollection(FILES.brands, DEFAULT_BRANDS);
const testimonials = makeCollection(FILES.testimonials, []);
const posts = makeCollection(FILES.posts, []);
const appointments = makeCollection(FILES.appointments, []);
const partRequests = makeCollection(FILES.partRequests, []);
const publications = makeCollection(FILES.publications, []);
const pubSectionsCol = makeCollection(FILES.pubSections, DEFAULT_PUB_SECTIONS);

const store = {
  // Productos
  getProducts: products.get,
  saveProducts: products.save,

  // Admin
  getAdmin() { return readJSON(FILES.admin); },
  saveAdmin(admin) { writeJSON(FILES.admin, admin); },

  // Categorías (antes "secciones")
  getCategories: categoriesCol.get,
  saveCategories: categoriesCol.save,

  // Marcas y modelos
  getBrands: brandsCol.get,
  saveBrands: brandsCol.save,

  // Testimonios
  getTestimonials: testimonials.get,
  saveTestimonials: testimonials.save,

  // Blog
  getPosts: posts.get,
  savePosts: posts.save,

  // Citas del taller
  getAppointments: appointments.get,
  saveAppointments: appointments.save,

  // Solicitudes de piezas no publicadas
  getPartRequests: partRequests.get,
  savePartRequests: partRequests.save,

  // Publicaciones (feed de novedades) y sus secciones
  getPublications: publications.get,
  savePublications: publications.save,
  getPubSections: pubSectionsCol.get,
  savePubSections: pubSectionsCol.save,

  DATA_DIR,
  FILES
};

module.exports = store;
