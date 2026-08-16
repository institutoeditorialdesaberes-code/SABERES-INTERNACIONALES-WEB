# Editorial Saberes Internacionales — sitio web

Sitio institucional y catálogo editorial de Saberes Internacionales (Quito, Ecuador).
Generador estático propio, **sin dependencias de npm**: solo Node 18 o superior.

> **Guía de uso paso a paso, en español y sin jerga: [GUIA.md](GUIA.md).**

## Puesta en marcha

```bash
npm run dev
```

`http://localhost:4321`, con reconstrucción automática al guardar cualquier archivo.

```bash
npm run build
```

Escribe el sitio completo en `dist/`.

## Despliegue en Cloudflare Pages

| Campo | Valor |
|---|---|
| Build command | `node src/build.mjs` |
| Build output directory | `dist` |
| Node version | 18 o superior |

Cada `git push` reconstruye y publica. El panel `/admin` hace commits por ti, así que
publicar un libro nuevo no requiere tocar la terminal.

## Estructura

```
site.config.json          Dominio, contactos, menú, redes, SEO. Único archivo global.
data/
  books.json              Catálogo
  authors.json            Autores
  categories.json         Categorías y colecciones
  posts.json              Blog
src/
  build.mjs               Orquestador: lee data/, escribe dist/
  dev.mjs                 Servidor local con reconstrucción automática
  lib/
    layout.mjs            <head> con SEO, cabecera, pie, JSON-LD
    components.mjs        Tarjetas, carruseles, encabezados
    covers.mjs            Portadas, retratos y banners SVG generados
    png.mjs               Rasterizador y codificador PNG (iconos, Open Graph)
    branding.mjs          Composición de la marca en mapa de bits
    icons.mjs             Iconografía SVG y logotipo
    utils.mjs             Escapado, slugs, fechas, markdown reducido
  pages/                  Una función por tipo de página
public/                   Se copia tal cual a la raíz del sitio (CSS, JS, imágenes reales)
admin/                    Panel editorial con commits a GitHub
```

## Qué genera cada build

- Portada, catálogo, novedades, búsqueda, autores, blog, nosotros, servicios,
  publica con nosotros, contacto, FAQ, envíos, términos, privacidad y 404.
- Una página por libro, por autor, por categoría y por artículo.
- Portadas SVG deterministas para los libros sin imagen real.
- `sitemap.xml`, `robots.txt`, `rss.xml`, `manifest.webmanifest`, `_headers`, `_redirects`.
- `indice-busqueda.json` para el buscador instantáneo del sitio.
- Iconos PNG y tarjeta social 1200 × 630 generados por código.

## Datos estructurados incluidos

`Organization`, `WebSite` con `SearchAction`, `CollectionPage`, `ItemList`, `Book`,
`Product` con `Offer` y `AggregateRating`, `Person`, `ProfilePage`, `Blog`, `BlogPosting`,
`FAQPage`, `Service`, `ContactPage`, `AboutPage` y `BreadcrumbList`.

## Estado del contenido

El catálogo incluido es de **demostración** (marcado con `"demo": true` en `data/`).
Reemplázalo por los títulos reales antes de difundir el sitio, y desactiva el aviso
superior desde el panel de configuración.
