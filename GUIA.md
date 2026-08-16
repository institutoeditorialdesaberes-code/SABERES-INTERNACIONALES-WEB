# Guía de uso — Sitio de Saberes Internacionales

Escrita para usarse sin conocimientos técnicos. Sigue las partes en orden la primera vez;
después solo necesitarás la **Parte 4** (cargar libros) y la **Parte 6** (posicionamiento).

---

## Parte 1 · Qué es este proyecto

Es un sitio web **estático**: cada libro, cada autor y cada artículo tienen su propia página
HTML ya escrita en el servidor. Eso importa por una razón concreta: Google indexa lo que
puede leer sin ejecutar nada, y aquí todo el texto está en la página desde el primer instante.

El funcionamiento es este:

```
Tú cargas un libro en /admin
        ↓
Se guarda en data/books.json (commit automático en GitHub)
        ↓
Cloudflare Pages detecta el commit y ejecuta: node src/build.mjs
        ↓
Se regeneran las 46+ páginas, el sitemap, el RSS y el buscador
        ↓
El sitio queda publicado (≈1 minuto)
```

No hay base de datos, no hay servidor que mantener y no hay costo mensual de alojamiento.

---

## Parte 2 · Subir el proyecto a GitHub

1. Crea una cuenta en [github.com](https://github.com) si aún no la tienes.
2. Crea un repositorio nuevo, por ejemplo `saberes-internacionales`. Puede ser **privado**:
   Cloudflare igual podrá publicarlo.
3. Desde esta carpeta, en la terminal:

```bash
git init && git add -A && git commit -m "Sitio de Saberes Internacionales" && git branch -M main
```

4. Conecta con tu repositorio (cambia `TU-USUARIO`):

```bash
git remote add origin https://github.com/TU-USUARIO/saberes-internacionales.git && git push -u origin main
```

---

## Parte 3 · Publicar en Cloudflare Pages

1. Entra a **dash.cloudflare.com** → *Workers & Pages* → *Create* → pestaña **Pages** →
   *Connect to Git*.
2. Autoriza GitHub y elige tu repositorio.
3. En la configuración del build escribe exactamente esto:

   | Campo | Valor |
   |---|---|
   | Framework preset | `None` |
   | Build command | `node src/build.mjs` |
   | Build output directory | `dist` |
   | Root directory | *(vacío)* |

4. *Save and Deploy*. El primer despliegue toma un par de minutos.

### Conectar tu dominio

1. Tu dominio ya debe estar en Cloudflare (*Websites* → *Add a site*, y los nameservers
   apuntando a Cloudflare desde donde lo compraste).
2. En tu proyecto de Pages: pestaña **Custom domains** → *Set up a domain*.
3. Escribe `saberesinternacionales.org` y acepta. Cloudflare crea los registros DNS solo.
4. Repite con `www.saberesinternacionales.org` para que ambas direcciones funcionen.
5. Espera a que el certificado SSL diga *Active* (suele tomar minutos).

### Paso final

El dominio **ya está configurado** en `site.config.json`:

```json
"url": "https://saberesinternacionales.org",
```

Lo único que falta ahí es el bloque `github`, que usa el panel `/admin` para saber
dónde guardar. Cambia `TU-USUARIO` por tu usuario real de GitHub:

```json
"github": {
  "usuario": "TU-USUARIO",
  "repositorio": "saberes-internacionales",
  "rama": "main"
}
```

Mientras diga `TU-USUARIO`, el build te lo recuerda con un aviso en cada
reconstrucción, y el panel te pedirá escribir el repositorio a mano al conectarte.

---

## Parte 4 · Cargar libros (uso diario)

### Opción A — Panel web (recomendado)

Entra a `https://saberesinternacionales.org/admin/`.

**Solo la primera vez**, necesitas un token de GitHub:

1. Ve a [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new).
2. *Token name*: `Panel editorial`. *Expiration*: 1 año.
3. *Repository access* → **Only select repositories** → marca tu repositorio.
4. *Permissions* → *Repository permissions* → **Contents: Read and write**. Nada más.
5. *Generate token*, cópialo y pégalo en el panel.

El token queda guardado en tu navegador. En una computadora compartida, pulsa **Salir** al terminar.

Ya dentro: **+ Añadir libro**, llena el formulario y **Guardar y publicar**. El panel completa solo
la dirección web, valida el ISBN, genera el resumen corto si lo dejas vacío y sube la portada.
En un minuto el libro está publicado con su ficha, su lugar en el catálogo, su categoría, su
autor, el buscador actualizado y una entrada nueva en el mapa del sitio.

### Opción B — Editar el archivo directamente

En GitHub, abre `data/books.json`, pulsa el lápiz, copia un bloque existente, cámbialo y
guarda. Cuida las comas: un JSON mal formado hace fallar el build (y por eso existe la
verificación automática, que te avisa por correo antes de que el sitio se rompa).

### Portadas

Si no subes portada, el sitio **genera una** tipográfica con los colores de la categoría.
Es presentable y evita el hueco gris. Cuando tengas la portada real, súbela desde el panel:
JPG de unos 800 × 1200 px y menos de 1 MB.

---

## Parte 5 · Reemplazar los datos de demostración

El catálogo viene con 12 libros y 8 autores de ejemplo, marcados con `"demo": true`
en los archivos de `data/`. Sirven para que veas el sitio funcionando completo.

Para pasar a producción:

1. Carga tus libros y autores reales desde `/admin`.
2. Elimina los de demostración (botón **Eliminar** en cada ficha).
3. En **Configuración**, desmarca *Mostrar el aviso de «catálogo de demostración»*.
4. Revisa que el teléfono, el WhatsApp, la dirección y el correo sean los tuyos.

---

## Parte 6 · Posicionamiento en Google

Lo que ya viene resuelto, sin que tengas que hacer nada:

- Una página HTML real por cada libro, autor, categoría y artículo.
- `title`, `description` y `canonical` distintos en cada página.
- Datos estructurados Schema.org: `Organization`, `WebSite`, `Book`, `Product` con precio
  y disponibilidad, `Person`, `BlogPosting`, `FAQPage` y migas de pan. Es lo que permite que
  Google muestre precio y valoración directamente en los resultados.
- `sitemap.xml` y `robots.txt` regenerados en cada build.
- Open Graph y Twitter Card con imagen en PNG, para que el enlace se vea bien en WhatsApp.
- RSS del blog, manifiesto PWA, iconos en todos los tamaños.
- Encabezados de seguridad y caché en `_headers`.
- Redirecciones desde las direcciones del sitio anterior en `_redirects`.

Lo que debes hacer tú, una sola vez:

1. **Google Search Console** → añade la propiedad de tu dominio. Elige verificación por
   etiqueta HTML, copia el código y pégalo en el panel, en *Configuración → Verificación de
   Google Search Console*.
2. En Search Console, envía el sitemap: `https://saberesinternacionales.org/sitemap.xml`.
3. **Google Business Profile**: crea la ficha de la editorial en Quito. Para búsquedas
   locales («editorial en Quito») pesa más que cualquier ajuste técnico del sitio.
4. Llena las redes sociales en *Configuración*: alimentan el campo `sameAs` de Schema.org,
   que es como Google confirma que la organización es la misma en todas partes.
5. Publica en el blog con regularidad. Las guías del tipo «cómo publicar un libro en
   Ecuador» son las que atraen autores nuevos por búsqueda orgánica.

---

## Parte 7 · Trabajar en tu computadora

```bash
npm run dev
```

Abre `http://localhost:4321`. Cada archivo que guardes reconstruye el sitio solo.

```bash
npm run build
```

Genera la carpeta `dist/` con el sitio completo, igual que lo hace Cloudflare.

---

## Parte 8 · Qué archivo tocar para cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Dominio, teléfono, WhatsApp, dirección, redes | `site.config.json` (o el panel) |
| Libros | `data/books.json` (o el panel) |
| Autores | `data/authors.json` (o el panel) |
| Categorías y colecciones | `data/categories.json` |
| Blog | `data/posts.json` (o el panel) |
| Menú de navegación y pie de página | `site.config.json` |
| Textos del carrusel de la portada | `site.config.json`, bloque `hero` |
| Colores y tipografías | `public/assets/css/estilos.css`, sección 1 |
| Preguntas frecuentes | `src/pages/estaticas.mjs`, constante `PREGUNTAS` |
| Textos de Nosotros, Servicios, Publica con nosotros | `src/pages/estaticas.mjs` |
| Diseño de las portadas generadas | `src/lib/covers.mjs` |

---

## Parte 9 · Problemas frecuentes

**El sitio no se actualiza después de guardar.** Entra a Cloudflare → tu proyecto →
*Deployments*. Si el último aparece en rojo, ábrelo y lee el error: casi siempre es una coma
de más o de menos en un archivo de `data/`.

**El panel dice que el token no es válido.** Los tokens caducan. Genera uno nuevo con los
mismos permisos y vuelve a conectar.

**WhatsApp no muestra imagen al compartir un enlace.** WhatsApp cachea la vista previa.
Prueba añadiendo `?v=2` al final del enlace para forzar una lectura nueva.

**Cambié el dominio y las direcciones siguen mal.** El campo `url` de `site.config.json` es el
único origen de las direcciones absolutas. Cámbialo ahí y espera la reconstrucción.

**Quiero recuperar algo que borré.** Nada se pierde: está en el historial de GitHub, en
*Commits*. Cada guardado del panel es un commit con su descripción.
