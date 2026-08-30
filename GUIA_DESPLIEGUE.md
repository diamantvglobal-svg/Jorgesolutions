# Guía para publicar la web de Soluciones Jorge en internet

Esta guía está escrita para alguien que **nunca ha publicado una página web**. Sigue los pasos en orden. Te tomará entre 15 y 25 minutos.

---

## Paso 0: ¿Qué vas a necesitar?

- Un correo electrónico (para crear las cuentas gratuitas).
- Los archivos de este proyecto (la carpeta `soluciones-jorge` que te entregué).
- Una tarjeta o cuenta para pagar **~5-7 USD al mes** — *solo si quieres que las piezas que agregues desde el panel de administración no se borren nunca*. Más abajo te explico por qué y cuál es la alternativa 100% gratis.

---

## Paso 1: Sube el proyecto a GitHub (gratis)

GitHub es donde vive el código para que el servicio de hosting pueda tomarlo.

1. Entra a [github.com](https://github.com) y crea una cuenta gratuita (si no tienes una).
2. Haz clic en **"New repository"** (Nuevo repositorio).
3. Ponle de nombre `soluciones-jorge`, déjalo en **Private** (privado) o Public, como prefieras, y crea el repositorio.
4. En la página del repositorio nuevo, usa la opción **"uploading an existing file"** (subir archivos existentes) y arrastra ahí *todos* los archivos y carpetas del proyecto que te entregué.
5. Haz clic en **"Commit changes"** para guardar.

> Si en algún momento te pierdes, dile a alguien que use GitHub que te ayude con este paso puntual — es el único que involucra "código" directamente.

---

## Paso 2: Publica el sitio en Render (gratis para empezar)

[Render](https://render.com) es un servicio para poner aplicaciones como esta en internet.

1. Entra a [render.com](https://render.com) y crea una cuenta gratuita (puedes usar tu cuenta de GitHub para entrar más rápido).
2. Haz clic en **"New +"** → **"Web Service"**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio `soluciones-jorge`.
4. Configura así:
   - **Name:** `soluciones-jorge` (o el que prefieras)
   - **Region:** la más cercana (por ejemplo, Ohio/US East)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** déjalo vacío (no hace falta, el proyecto no usa paquetes externos)
   - **Start Command:** `node server.js`
   - **Instance Type:** empieza con **Free** para probar
5. En la sección **Environment Variables**, agrega:
   - Key: `SESSION_SECRET` — Value: cualquier texto largo y aleatorio (por ejemplo, mezcla de letras y números que solo tú conozcas). Esto mantiene tu sesión del panel segura.
   - Key: `SITE_URL` — Value: la dirección final de tu sitio, por ejemplo `https://solucionesjorge.onrender.com` (o tu dominio propio si ya lo tienes, ver Paso 4). Esto se usa para que el mapa del sitio (`sitemap.xml`) y los enlaces del blog para Google funcionen correctamente. Si no lo agregas ahora, puedes agregarlo después cuando tengas la dirección definitiva.
6. Haz clic en **"Create Web Service"**. Render instalará y arrancará tu sitio automáticamente. En unos minutos te dará una dirección como:
   `https://soluciones-jorge.onrender.com`

**¡Esa ya es tu página funcionando en internet!** Compártela con quien quieras.

### Configura tu contraseña del panel de administración (sin usar la terminal)

Entra a `https://tu-sitio.onrender.com/admin` — como es la primera vez, el sitio se da cuenta de que todavía no hay contraseña configurada y te muestra directamente una pantalla de bienvenida para que elijas tu contraseña ahí mismo, escribiéndola dos veces. No hace falta tocar la terminal ni saber de código para este paso.

El usuario del panel siempre es **jorge** (no se puede cambiar ni crear otros administradores — así se pidió). Ese formulario de bienvenida solo aparece una vez: en cuanto guardas tu contraseña, la próxima vez que entres a `/admin` te va a pedir usuario y contraseña normalmente. Una vez dentro, puedes cambiar la contraseña cuando quieras desde **"Mi cuenta"** en el menú del panel — tampoco requiere terminal.

Si alguna vez olvidas la contraseña y no puedes entrar, esa es la única situación donde sí hace falta la terminal, como respaldo: en Render, entra a tu servicio → pestaña **"Shell"** → escribe (cambia la contraseña por una tuya):

```
node scripts/set-admin-password.js "tu-contraseña-nueva"
```

Eso reemplaza la contraseña guardada, sin importar cuál tenías antes.

---

## Paso 3 (recomendado): que las piezas no se borren nunca

⚠️ **Importante:** en el plan gratuito de Render, cada vez que el servicio se reinicia (lo cual pasa automáticamente de vez en cuando, y siempre que actualices el código), **se borra todo lo que hayas agregado desde el panel** — piezas, marcas y modelos nuevos, categorías, testimonios, artículos del blog, citas y solicitudes recibidas, y las fotos — porque el plan gratis no guarda archivos de forma permanente.

Para evitar esto, tienes dos caminos:

**Opción A — la más simple (recomendada): actualiza a un plan pagado con "Disco persistente"**

El proyecto ya viene preparado para esto: solo hay que encender el disco y decirle al servidor que guarde ahí.

1. En Render, cambia tu servicio del plan **Free** al plan **Starter** (desde ~7 USD/mes).
2. Ve a la pestaña **"Disks"** de tu servicio y agrega un disco de **1 GB**, con punto de montaje (*Mount Path*) `/var/datos`.
3. Ve a **"Environment"** y agrega estas dos variables:

   | Nombre | Valor |
   |---|---|
   | `DATA_DIR` | `/var/datos/data` |
   | `UPLOADS_DIR` | `/var/datos/uploads` |

4. Guarda y deja que el servicio se vuelva a publicar.

La primera vez que arranque así, el sitio copia solo el catálogo inicial al disco nuevo (para que no aparezca vacío) y a partir de ahí **todo lo que agregues desde `/admin` se queda guardado para siempre**, aunque el servidor se reinicie: piezas, marcas, categorías, blog, testimonios, citas, solicitudes y las fotos subidas.

> El archivo `render.yaml` que viene en el proyecto ya trae toda esta configuración escrita. Si prefieres, en Render puedes crear el servicio como **"Blueprint"** apuntando al repositorio y se configura solo.

**Opción B — gratis, pero con un paso manual:**
Sigue usando el plan Free y descarga un respaldo cada cierto tiempo (por ejemplo, una vez por semana). En la pantalla de **Piezas** del panel tienes el botón **"⬇ Respaldo completo"**, que descarga en un solo archivo todo el contenido del sitio: piezas, marcas, categorías, publicaciones, testimonios, blog, citas y solicitudes. Guarda ese archivo aparte. Cada pantalla del panel tiene además su propio botón "Exportar" para descargar solo esa sección. Es más trabajo, pero no cuesta nada.

> Ojo: el respaldo guarda los **datos**, no las **fotos** subidas. En el plan gratuito las fotos se pierden igual al reiniciarse el servicio, así que si el catálogo va a llevar fotos, la Opción A es la única que sirve de verdad.

Si más adelante el negocio crece y quieres algo más robusto (base de datos real, varios administradores, etc.), este proyecto se puede migrar a una base de datos gratuita como Supabase — dímelo y te ayudo a dar ese paso cuando lo necesites.

---

## Paso 4 (opcional): pon tu propio dominio

En vez de `soluciones-jorge.onrender.com`, puedes usar algo como `solucionesjorge.com`:

1. Compra el dominio en un sitio como Namecheap o GoDaddy (~10-15 USD al año).
2. En Render, ve a tu servicio → **"Settings"** → **"Custom Domains"** → agrega tu dominio.
3. Render te dará instrucciones exactas (unos registros DNS) para configurar en el sitio donde compraste el dominio.

---

## Sobre el botón "Pagar online"

Ahora mismo el botón dice **"Próximamente"** a propósito, no es un error. La razón es esta: Cuba está bajo sanciones de EE.UU., por lo que **Stripe y PayPal nunca han aceptado comercios ubicados en Cuba**, y desde junio de 2026 **Visa y Mastercard suspendieron el procesamiento de pagos en Cuba** por sanciones más amplias. Es decir, hoy no existe una pasarela de pago internacional real que puedas conectar de forma legítima estando físicamente en Cuba.

**Lo que sí funciona hoy, y ya está armado en tu web:** el botón **"Pedir"** en cada pieza abre WhatsApp con un mensaje ya escrito (nombre de la pieza, código, precio) para que coordines el pago directamente con el cliente — transferencia, efectivo, Zelle de un familiar en el exterior, USDT/criptomonedas, o lo que ya uses hoy en el negocio.

**Si en el futuro consigues una forma real de cobrar online** (por ejemplo, a través de un familiar o socio con cuenta de Stripe/PayPal fuera de Cuba, o un procesador que si opere allí), dímelo y conecto el botón "Pagar online" a ese sistema — el diseño ya está listo para recibirlo, solo falta la pasarela.

---

## ¿Algo no funciona o necesitas un cambio?

Guarda este proyecto. Si más adelante quieres agregar funciones (por ejemplo, varios usuarios del panel, reportes de ventas, o conectar un método de pago real cuando esté disponible), puedo ayudarte a ampliarlo partiendo de esta misma base.
