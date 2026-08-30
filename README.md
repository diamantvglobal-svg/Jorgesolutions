# Soluciones Jorge — Sitio web y panel de administración

Sitio web para la tienda y taller de piezas automotrices **Soluciones Jorge** (Playa, La Habana), enfocada en Geely y en expansión hacia Kia, Hyundai y Toyota.

- Página de inicio con marcas, categorías, botones de acción rápida (catálogo, WhatsApp, cómo llegar, solicitar pieza) y buscador.
- **Catálogo** filtrable por marca, modelo, categoría, disponibilidad y precio.
- **Taller** con lista de servicios, datos de contacto/ubicación y formulario para solicitar una cita.
- **Solicitar pieza**: formulario para piezas que no están en el catálogo (con fotos opcionales).
- **Nosotros**, **Testimonios** y **Blog** (con SEO: título y meta descripción por artículo).
- **Publicaciones**: un feed de novedades cortas (ofertas, piezas recién llegadas, avisos), organizado por secciones, filtrable y con buscador — pensado para actualizarse seguido, a diferencia del Blog que es para artículos largos de SEO.
- Páginas legales: Privacidad, Términos y Garantía (son plantillas — revísalas con alguien con conocimientos legales antes de considerarlas definitivas).
- Panel de administración privado (`/admin`), con acceso **exclusivo para un solo usuario ("jorge")**, para gestionar piezas, marcas y modelos, categorías, citas del taller, solicitudes de piezas, testimonios, artículos del blog y publicaciones del feed — todo con fotos.
- **Sin dependencias externas**: hecho con Node.js puro (no necesita `npm install`, no se rompe por paquetes desactualizados).

Lee **`GUIA_DESPLIEGUE.md`** para poner esto en internet paso a paso, incluso si nunca lo has hecho antes.

## Probarlo en tu computadora (opcional)

Necesitas tener [Node.js](https://nodejs.org) instalado (versión 18 o más nueva).

```bash
node server.js
```

Abre `http://localhost:3000` en tu navegador. El panel de administración está en `http://localhost:3000/admin` (usuario `jorge`) — la primera vez que entres ahí, el sitio te va a pedir que elijas tu contraseña directamente en el navegador, sin necesidad de usar la terminal. (También puedes definirla por terminal con `node scripts/set-admin-password.js "tu-contraseña"` si lo prefieres, o para restablecerla si la olvidas.)

## Estructura del proyecto

```
server.js                 → el servidor (todo el sitio corre desde aquí)
lib/                       → lógica interna
  store.js                   → lectura/escritura de los archivos de datos (data/*.json)
  seed-data.js                → marcas/modelos y categorías por defecto (primer arranque)
  auth.js                     → contraseña y sesión del panel
  multipart.js                → subida de fotos sin paquetes externos
  spam-guard.js                → protección anti-spam de los formularios públicos
  render.js                    → motor simple de plantillas para el blog (SEO)
scripts/                   → utilidades de línea de comandos (contraseña del admin)
views/                      → plantillas HTML del blog (no se sirven directo, solo vía /blog)
data/                       → toda la información del sitio, en archivos JSON:
  products.json                 → catálogo de piezas
  brands.json                    → marcas y sus modelos
  categories.json                 → categorías del catálogo
  testimonials.json                → testimonios de clientes
  posts.json                        → artículos del blog
  appointments.json                  → citas solicitadas desde /taller.html
  part-requests.json                  → solicitudes de piezas desde /solicitar-pieza.html
  publications.json                    → publicaciones del feed de novedades
  pub-sections.json                     → secciones del feed de publicaciones (Ofertas, Nuevos ingresos, etc.)
  admin.json                           → usuario y contraseña del panel (se genera con el script, no lo edites a mano)
uploads/                    → fotos subidas desde el panel (piezas, testimonios, blog) y desde los formularios públicos
public/                     → el sitio web (HTML, CSS, JS) y el logo
  admin/                        → todas las páginas del panel de administración
```

## Cambiar datos de contacto, colores o textos

- **WhatsApp / redes sociales / dirección de la tienda y del taller:** edita `public/js/config.js`. Ahí también están (vacíos, listos para completar cuando los tengas) los enlaces de YouTube, Canal de WhatsApp, Grupo de Facebook y Linktree — mientras estén vacíos, esos botones se ocultan solos en el sitio en vez de mostrarse rotos.
- **Colores de la marca:** edita las variables al inicio de `public/css/styles.css` (sección `:root`).
- **Categorías y marcas/modelos del catálogo:** ya no se editan a mano en un archivo — se gestionan desde el panel, en `/admin/categorias.html` y `/admin/marcas.html`.
- **Logo:** reemplaza `public/img/logo.png` (y opcionalmente `logo-180.png` / `favicon-32.png`) por una nueva versión con el mismo nombre de archivo.
- **Google Analytics / Google Search Console:** cuando tengas tu ID de Analytics o el código de verificación de Search Console, colócalos en `public/js/config.js` (`gaId`, `gscVerification`). Mientras estén vacíos, esas integraciones simplemente no se activan — no rompen nada.

## Sobre el panel de administración

- El panel tiene un único usuario posible: **jorge**. No hay forma de crear más administradores desde el sitio — es intencional, tal como se pidió.
- **La primera vez** que se entra a `/admin` (antes de que exista una contraseña guardada), el sitio muestra automáticamente un formulario de bienvenida para elegirla ahí mismo — no requiere terminal. Una vez configurada, se puede cambiar cuando se quiera desde "Mi cuenta" dentro del panel, pidiendo la contraseña actual. La terminal (`node scripts/set-admin-password.js "..."`) solo hace falta como respaldo si se olvida la contraseña y no se puede iniciar sesión.
- Páginas del panel: Piezas, Marcas y modelos, Categorías, Citas del taller, Solicitudes de piezas, Testimonios, Blog, Publicaciones, Secciones de publicaciones, Mi cuenta.
- Los **testimonios** se dejaron vacíos a propósito — no se inventó ningún testimonio falso. Publica solo comentarios reales de clientes reales, con su permiso.
- Las **solicitudes de piezas** y **citas del taller** que llegan por los formularios públicos aparecen en el panel (no se envían automáticamente por correo, ver más abajo). Desde ahí, cada una tiene un enlace directo para continuar la conversación por WhatsApp.

## Sobre las Publicaciones (el feed de novedades)

Es la forma más rápida de mantener el sitio actualizado: desde `/admin/publicaciones.html` escribes un título, un resumen corto, eliges una sección (Ofertas, Nuevos ingresos, Noticias del taller, Consejos, Avisos — o las que tú crees) y opcionalmente una foto y un texto más largo. Al guardar, aparece de inmediato en `/publicaciones.html` y en la vista previa de la página de inicio ("Últimas publicaciones"), la cual se oculta sola mientras no haya ninguna publicación. Los clientes pueden filtrar el feed por sección o buscar, y al tocar una publicación se abre con el contenido completo.

Las secciones del feed se administran aparte, en `/admin/secciones-publicaciones.html` — se puede agregar, y no se puede borrar una sección mientras tenga publicaciones asignadas (para evitar dejar publicaciones huérfanas).

La diferencia con el **Blog** es de propósito: el Blog es para artículos largos pensados para aparecer en buscadores como Google (por eso tiene meta descripción y una página propia por artículo). Publicaciones es para avisos cortos y frecuentes, tipo feed — no está indexado para SEO artículo por artículo, es más parecido a una cartelera de novedades del negocio.

## Sobre el envío de solicitudes por correo

El cliente pidió que las solicitudes de piezas lleguen "al correo o WhatsApp del negocio". Configurar el envío automático por correo (SMTP) requiere una cuenta de correo con credenciales reales, que no estaban disponibles al construir este sitio. Por ahora, todas las solicitudes quedan guardadas en `/admin/solicitudes.html` apenas se envían, con un botón para continuar por WhatsApp de inmediato. Si más adelante quieres que además lleguen por correo automáticamente, dímelo y lo conecto (necesitaré una cuenta de correo o un servicio como Resend/SendGrid).

## Sobre el botón "Pagar online"

Por ahora ese botón aparece marcado como **"Próximamente"** a propósito: los procesadores de pago internacionales (Stripe, PayPal) no operan con comercios ubicados en Cuba, y desde junio de 2026 Visa/Mastercard tampoco procesan pagos allí por las sanciones vigentes. El flujo funcional de pedidos hoy es **WhatsApp** (el botón "Pedir" arma el mensaje automáticamente). Más detalles y alternativas en `GUIA_DESPLIEGUE.md`.

## Cosas que quedaron como "preparadas para el futuro" (no construidas todavía)

Según lo que pidió el cliente, esto se dejó explícitamente para más adelante y no se implementó ahora: cuentas de cliente, pedidos y pagos completamente online, sección mayorista, precios especiales para TCP/MIPYME, y operación internacional. La estructura de datos (marcas, modelos, categorías) ya está lista para crecer sin rehacer el sitio cuando llegue el momento.

---

## Notas técnicas (agosto 2026)

Repaso de seguridad y robustez aplicado sobre la versión inicial:

- **Cookie de sesión con `Secure`.** La cookie del panel se marca como `Secure` automáticamente cuando la visita llega por HTTPS (se detecta con la cabecera `x-forwarded-proto` que envía Render). En `http://localhost` no se marca, para poder seguir probando en local.
- **Validación real de las fotos subidas.** Ya no se confía en el nombre ni en la extensión del archivo: se leen los primeros bytes para comprobar que sea de verdad un JPG, PNG, GIF o WEBP, y la extensión con la que se guarda la decide el servidor. Así no se puede colar una página o un script disfrazado de foto. Límite de **5 MB por imagen**, con mensaje claro si se pasa.
- **`/admin` ya no da 404.** Redirige al panel si hay sesión abierta, o al login si no la hay.
- **Respaldo completo en un clic.** Botón "⬇ Respaldo completo" en la pantalla de Piezas (`/api/admin/export/all`): descarga todo el contenido del sitio en un solo archivo JSON.
- **Datos y fotos en disco permanente.** Las variables de entorno `DATA_DIR` y `UPLOADS_DIR` permiten guardar los datos y las imágenes fuera del proyecto (por ejemplo, en el disco persistente de Render). La primera vez que arrancan contra una carpeta vacía, el catálogo inicial se copia solo, para que el sitio nunca aparezca en blanco. El archivo `render.yaml` ya trae esta configuración lista.
- **Tabla del panel utilizable desde el teléfono.** La tabla de piezas se arrastra de lado en pantallas estrechas en vez de quedar cortada.

### Límites conocidos (por diseño)

- Un solo administrador (`jorge`). No hay usuarios múltiples ni roles.
- Almacenamiento en archivos JSON, sin base de datos. Suficiente para un catálogo de cientos de piezas; si el negocio crece mucho, conviene migrar a una base de datos real.
- El respaldo es manual (botón de descarga), no automático.
- `gaId` y `gscVerification` en `public/js/config.js` están vacíos a propósito: se rellenan cuando existan las cuentas de Google Analytics y Search Console.
- Las redes que aún no existen (`youtubeUrl`, `whatsappChannelUrl`, `facebookGroupUrl`, `linktreeUrl`) se dejan vacías y sus enlaces **se ocultan solos** hasta que se rellenen.
