#!/usr/bin/env node
/**
 * Generador del sitio de Editorial Saberes Internacionales.
 *
 *   npm run build     ->  reconstruye toda la carpeta dist/
 *
 * No usa ninguna dependencia externa: solo Node. Cada vez que cambian los
 * archivos de data/ o site.config.json, este script vuelve a escribir todas
 * las páginas, las portadas, el mapa del sitio y el índice de búsqueda.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { esc, recorta, slug } from './lib/utils.mjs';
import { pagina } from './lib/layout.mjs';
import { portadaSVG, retratoSVG, bannerSVG } from './lib/covers.mjs';
import { tarjetaSocial, icono as iconoPNG } from './lib/branding.mjs';

import { paginaInicio } from './pages/inicio.mjs';
import { paginaLibros, paginaCategoria, paginaNovedades } from './pages/catalogo.mjs';
import { paginaLibro } from './pages/libro.mjs';
import { paginaAutores, paginaAutor } from './pages/autores.mjs';
import { paginaBlog, paginaEntrada } from './pages/blog.mjs';
import {
  paginaNosotros, paginaContacto, paginaPublica, paginaServicios,
  paginaFAQ, paginaEnvios, paginaTerminos, paginaPrivacidad,
  paginaBuscar, pagina404
} from './pages/estaticas.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RAIZ, 'dist');

const avisos = [];
const errores = [];

/* ---------------------------------------------------------------- */
/* Carga y validación                                                */
/* ---------------------------------------------------------------- */
function leerJSON(rel) {
  const ruta = path.join(RAIZ, rel);
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch (e) {
    errores.push(`No se pudo leer ${rel}: ${e.message}`);
    process.exitCode = 1;
    throw e;
  }
}

function normalizarLibro(libro, i) {
  const l = { ...libro };
  l.id = l.id || slug(l.titulo || `libro-${i}`);
  l.titulo = l.titulo || 'Sin título';
  // Un libro puede tener varios autores. Se admite tanto "autores": [...]
  // como el "autorId" simple de las fichas antiguas.
  l.autores = Array.isArray(l.autores) && l.autores.length
    ? l.autores
    : (l.autorId ? [l.autorId] : []);
  l.autorId = l.autores[0] || '';
  l.precio = Number(l.precio) || 0;
  l.precioDigital = l.precioDigital ? Number(l.precioDigital) : 0;
  l.paginas = Number(l.paginas) || 0;
  l.anio = Number(l.anio) || new Date().getFullYear();
  l.valoracion = Number(l.valoracion) || 0;
  l.resenas = Number(l.resenas) || 0;
  l.esNuevo = Boolean(l.esNuevo);
  l.esDestacado = Boolean(l.esDestacado);
  l.disponibilidad = l.disponibilidad || 'disponible';
  l.formato = l.formato || 'Tapa blanda';
  l.edicion = l.edicion || 'Primera edición';
  l.idioma = l.idioma || 'Español';
  l.dimensiones = l.dimensiones || '15 x 22 cm';
  l.coleccion = l.coleccion || '';
  l.isbn = l.isbn || '';
  l.temas = Array.isArray(l.temas) ? l.temas : [];
  l.indice = Array.isArray(l.indice) ? l.indice : [];
  l.resumen = l.resumen || recorta(l.descripcion || '', 160);
  l.descripcion = l.descripcion || l.resumen || '';
  if (!l.isbn) avisos.push(`El libro "${l.titulo}" no tiene ISBN: la ficha se publica igual, pero Google no podrá identificarlo como producto.`);
  return l;
}

function normalizarAutor(autor, i) {
  const a = { ...autor };
  a.id = a.id || slug(a.nombre || `autor-${i}`);
  a.nombre = a.nombre || 'Autor';
  a.iniciales = a.iniciales || a.nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  a.especialidad = a.especialidad || 'Autor del sello';
  a.grado = a.grado || '';
  a.institucion = a.institucion || '';
  a.pais = a.pais || 'Ecuador';
  a.bio = a.bio || a.resumen || '';
  a.resumen = a.resumen || recorta(a.bio, 160);
  a.premios = Number(a.premios) || 0;
  a.aniosExperiencia = Number(a.aniosExperiencia) || 0;
  return a;
}

function normalizarPost(post, i) {
  const p = { ...post };
  p.id = p.id || slug(p.titulo || `entrada-${i}`);
  p.titulo = p.titulo || 'Sin título';
  p.fecha = p.fecha || new Date().toISOString().slice(0, 10);
  p.autor = p.autor || 'Equipo editorial';
  p.categoria = p.categoria || 'Editorial';
  p.contenido = p.contenido || '';
  p.resumen = p.resumen || recorta(p.contenido.replace(/[#*>]/g, ''), 160);
  return p;
}

/* ---------------------------------------------------------------- */
/* Escritura de archivos                                             */
/* ---------------------------------------------------------------- */
let escritos = 0;

function escribir(rutaRelativa, contenido) {
  const destino = path.join(DIST, rutaRelativa);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, contenido);
  escritos += 1;
}

function escribirPagina(def, ctx) {
  const html = pagina({ ...def, cfg: ctx.cfg, categorias: ctx.categorias });
  const archivo = def.ruta === '/404.html'
    ? '404.html'
    : def.ruta === '/'
      ? 'index.html'
      : `${def.ruta.replace(/^\/|\/$/g, '')}/index.html`;
  escribir(archivo, html);
  if (!def.noindex && def.ruta !== '/404.html') {
    ctx.rutas.push({ ruta: def.ruta, prioridad: def.prioridad || 0.7, cambio: def.cambio || 'weekly' });
  }
}

function copiarDirectorio(origen, destino) {
  if (!fs.existsSync(origen)) return;
  fs.mkdirSync(destino, { recursive: true });
  for (const entrada of fs.readdirSync(origen, { withFileTypes: true })) {
    const o = path.join(origen, entrada.name);
    const d = path.join(destino, entrada.name);
    if (entrada.isDirectory()) copiarDirectorio(o, d);
    else {
      fs.copyFileSync(o, d);
      escritos += 1;
    }
  }
}

/* ---------------------------------------------------------------- */
/* Construcción                                                      */
/* ---------------------------------------------------------------- */
function construir() {
  const inicio = Date.now();
  const cfg = leerJSON('site.config.json');
  cfg.url = String(cfg.url || '').replace(/\/+$/, '');

  if (!/^https?:\/\//.test(cfg.url)) {
    errores.push('site.config.json: "url" debe empezar por https:// para que el SEO funcione.');
  }
  if (cfg.github && cfg.github.usuario === 'TU-USUARIO') {
    avisos.push('Falta completar el bloque "github" de site.config.json: el panel /admin no sabrá en qué repositorio guardar.');
  }

  const categorias = leerJSON('data/categories.json');
  const autores = leerJSON('data/authors.json').map(normalizarAutor);
  const libros = leerJSON('data/books.json').map(normalizarLibro);
  const posts = leerJSON('data/posts.json')
    .map(normalizarPost)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  // Identificadores duplicados: rompen las URLs, así que se avisan fuerte.
  for (const [nombre, lista] of [['libro', libros], ['autor', autores], ['entrada', posts], ['categoría', categorias]]) {
    const vistos = new Set();
    for (const item of lista) {
      if (vistos.has(item.id)) errores.push(`Hay dos ${nombre}s con el mismo id "${item.id}". Cada id debe ser único.`);
      vistos.add(item.id);
    }
  }

  const autoresPorId = new Map(autores.map((a) => [a.id, a]));
  const categoriasPorId = new Map(categorias.map((c) => [c.id, c]));

  for (const l of libros) {
    for (const id of l.autores) {
      if (!autoresPorId.has(id)) avisos.push(`El libro "${l.titulo}" apunta al autor "${id}", que no existe en data/authors.json.`);
    }
    if (!l.autores.length) avisos.push(`El libro "${l.titulo}" no tiene ningún autor asignado.`);
    if (!categoriasPorId.has(l.categoria)) avisos.push(`El libro "${l.titulo}" usa la categoría "${l.categoria}", que no existe en data/categories.json.`);
    if (!l.precio) avisos.push(`El libro "${l.titulo}" no tiene precio: la ficha mostrará "Consultar precio" hasta que lo definas.`);
  }

  const librosPorAutor = new Map();
  const librosPorCategoria = new Map();
  for (const l of libros) {
    for (const id of l.autores) {
      if (!librosPorAutor.has(id)) librosPorAutor.set(id, []);
      librosPorAutor.get(id).push(l);
    }
    if (!librosPorCategoria.has(l.categoria)) librosPorCategoria.set(l.categoria, []);
    librosPorCategoria.get(l.categoria).push(l);
  }

  const ctx = {
    cfg, libros, autores, categorias, posts,
    autoresPorId, categoriasPorId, librosPorAutor, librosPorCategoria,
    rutas: []
  };

  // Carpeta limpia en cada build para que no queden páginas de libros borrados.
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  /* --- Páginas ---------------------------------------------------- */
  escribirPagina({ ...paginaInicio(ctx), prioridad: 1.0, cambio: 'daily' }, ctx);
  escribirPagina({ ...paginaLibros(ctx), prioridad: 0.9, cambio: 'daily' }, ctx);
  escribirPagina({ ...paginaNovedades(ctx), prioridad: 0.9, cambio: 'daily' }, ctx);
  escribirPagina({ ...paginaAutores(ctx), prioridad: 0.7 }, ctx);
  escribirPagina({ ...paginaBlog(ctx), prioridad: 0.7 }, ctx);
  escribirPagina({ ...paginaNosotros(ctx), prioridad: 0.6, cambio: 'monthly' }, ctx);
  escribirPagina({ ...paginaPublica(ctx), prioridad: 0.8, cambio: 'monthly' }, ctx);
  escribirPagina({ ...paginaServicios(ctx), prioridad: 0.7, cambio: 'monthly' }, ctx);
  escribirPagina({ ...paginaContacto(ctx), prioridad: 0.6, cambio: 'monthly' }, ctx);
  escribirPagina({ ...paginaFAQ(ctx), prioridad: 0.6, cambio: 'monthly' }, ctx);
  escribirPagina({ ...paginaEnvios(ctx), prioridad: 0.4, cambio: 'yearly' }, ctx);
  escribirPagina({ ...paginaTerminos(ctx), prioridad: 0.3, cambio: 'yearly' }, ctx);
  escribirPagina({ ...paginaPrivacidad(ctx), prioridad: 0.3, cambio: 'yearly' }, ctx);
  escribirPagina(paginaBuscar(ctx), ctx);
  escribirPagina(pagina404(ctx), ctx);

  for (const categoria of categorias) {
    escribirPagina({ ...paginaCategoria(ctx, categoria), prioridad: 0.8, cambio: 'weekly' }, ctx);
  }
  for (const libro of libros) {
    escribirPagina({ ...paginaLibro(ctx, libro), prioridad: 0.9, cambio: 'weekly' }, ctx);
  }
  for (const autor of autores) {
    escribirPagina({ ...paginaAutor(ctx, autor), prioridad: 0.6, cambio: 'monthly' }, ctx);
  }
  for (const post of posts) {
    escribirPagina({ ...paginaEntrada(ctx, post), prioridad: 0.6, cambio: 'monthly' }, ctx);
  }

  /* --- Imágenes generadas ----------------------------------------- */
  for (const libro of libros) {
    if (libro.portada) continue; // el autor subió una portada real
    const autor = autoresPorId.get(libro.autorId);
    escribir(`assets/portadas/${libro.id}.svg`, portadaSVG(libro, autor ? autor.nombre : ''));
  }
  for (const autor of autores) {
    if (autor.foto) continue;
    const primerLibro = (librosPorAutor.get(autor.id) || [])[0];
    escribir(`assets/autores/${autor.id}.svg`, retratoSVG(autor, primerLibro ? primerLibro.categoria : '_defecto'));
  }
  for (const post of posts) {
    escribir(`assets/blog/${post.id}.svg`, bannerSVG(post.titulo, 'negocios'));
  }

  escribir('assets/img/portada-social.png', tarjetaSocial());
  escribir('assets/img/icono-192.png', iconoPNG(192));
  escribir('assets/img/icono-512.png', iconoPNG(512));
  escribir('assets/img/apple-touch-icon.png', iconoPNG(180));
  // Favicon vectorial: síntesis del medallón (aro dorado + torre del saber).
  escribir('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="${esc(cfg.nombre)}">
  <circle cx="24" cy="24" r="23" fill="#c9a227"/>
  <circle cx="24" cy="24" r="20.5" fill="${cfg.seo.temaColor}"/>
  <circle cx="24" cy="24" r="18.4" fill="none" stroke="#c9a227" stroke-width="0.9" opacity=".8"/>
  <g fill="#f4f1ea">
    <rect x="10.5" y="31" width="27" height="4.6"/>
    <rect x="12.8" y="26.6" width="22.4" height="4.4"/>
    <rect x="15.2" y="22.2" width="17.6" height="4.4"/>
    <rect x="17.6" y="17.8" width="12.8" height="4.4"/>
    <rect x="20" y="13.2" width="8" height="4.6"/>
  </g>
  <rect x="21.6" y="30" width="4.8" height="5.6" fill="#c9a227"/>
  <rect x="23.2" y="7.4" width="1.6" height="5.8" fill="#c9a227"/>
  <path d="M24.8 7.4 30 8.8l-5.2 1.4z" fill="#c9a227"/>
  <rect x="9" y="35.6" width="30" height="1.6" fill="#f4f1ea" opacity=".55"/>
</svg>`);

  /* --- Archivos técnicos ------------------------------------------ */
  escribirSitemap(ctx);
  escribirRobots(ctx);
  escribirRSS(ctx);
  escribirManifiesto(ctx);
  escribirIndiceBusqueda(ctx);
  escribirCabecerasCloudflare();

  /* --- Recursos estáticos y panel --------------------------------- */
  copiarDirectorio(path.join(RAIZ, 'public'), DIST);
  copiarDirectorio(path.join(RAIZ, 'admin'), path.join(DIST, 'admin'));

  // El panel de administración necesita saber a qué repositorio escribir.
  escribir('admin/config.json', JSON.stringify({
    github: cfg.github,
    categorias: categorias.map((c) => ({ id: c.id, nombre: c.nombre })),
    autores: autores.map((a) => ({ id: a.id, nombre: a.nombre })),
    colecciones: [...new Set(libros.map((l) => l.coleccion).filter(Boolean))]
  }, null, 2));

  /* --- Reporte ---------------------------------------------------- */
  const demoLibros = libros.filter((l) => l.demo).length;
  const segundos = ((Date.now() - inicio) / 1000).toFixed(2);

  console.log('');
  console.log('  Saberes Internacionales — sitio generado');
  console.log('  ────────────────────────────────────────');
  console.log(`  Dominio        ${cfg.url}`);
  console.log(`  Libros         ${libros.length}${demoLibros ? ` (${demoLibros} de demostración)` : ''}`);
  console.log(`  Autores        ${autores.length}`);
  console.log(`  Categorías     ${categorias.length}`);
  console.log(`  Entradas blog  ${posts.length}`);
  console.log(`  Páginas HTML   ${ctx.rutas.length + 1}`);
  console.log(`  Archivos       ${escritos}`);
  console.log(`  Tiempo         ${segundos} s`);

  if (avisos.length) {
    console.log('\n  Avisos:');
    for (const a of avisos) console.log(`   · ${a}`);
  }
  if (demoLibros) {
    console.log(`\n  ${demoLibros} libros están marcados con "demo": true. Reemplázalos por tus`);
    console.log('  títulos reales desde /admin o editando data/books.json.');
  }
  if (errores.length) {
    console.log('\n  ERRORES:');
    for (const e of errores) console.log(`   · ${e}`);
    process.exitCode = 1;
  }
  console.log('');
}

/* ---------------------------------------------------------------- */
/* Archivos técnicos                                                 */
/* ---------------------------------------------------------------- */
function escribirSitemap(ctx) {
  const hoy = new Date().toISOString().slice(0, 10);
  const urls = ctx.rutas.map(({ ruta, prioridad, cambio }) => `  <url>
    <loc>${ctx.cfg.url}${ruta}</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>${cambio}</changefreq>
    <priority>${prioridad.toFixed(1)}</priority>
  </url>`).join('\n');

  escribir('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
}

function escribirRobots(ctx) {
  escribir('robots.txt', `# ${ctx.cfg.nombreLegal}
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /buscar/

# Rastreadores de IA generativa: permitidos para que el catálogo sea citable.
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /

Sitemap: ${ctx.cfg.url}/sitemap.xml
`);
}

function escribirRSS(ctx) {
  const { cfg, posts } = ctx;
  const items = posts.map((p) => `    <item>
      <title>${esc(p.titulo)}</title>
      <link>${cfg.url}/blog/${p.id}/</link>
      <guid isPermaLink="true">${cfg.url}/blog/${p.id}/</guid>
      <pubDate>${new Date(`${p.fecha}T12:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(p.categoria)}</category>
      <description>${esc(p.resumen)}</description>
    </item>`).join('\n');

  escribir('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog de ${esc(cfg.nombre)}</title>
    <link>${cfg.url}/blog/</link>
    <atom:link href="${cfg.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(cfg.descripcion)}</description>
    <language>${esc(cfg.idioma)}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`);
}

function escribirManifiesto(ctx) {
  const { cfg } = ctx;
  escribir('manifest.webmanifest', JSON.stringify({
    name: cfg.nombreLegal,
    short_name: cfg.nombre,
    description: cfg.descripcion,
    lang: cfg.idioma,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: cfg.seo.temaColor,
    icons: [
      { src: '/assets/img/icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/assets/img/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ],
    shortcuts: [
      { name: 'Catálogo', url: '/libros/' },
      { name: 'Novedades', url: '/novedades/' },
      { name: 'Contacto', url: '/contacto/' }
    ]
  }, null, 2));
}

function escribirIndiceBusqueda(ctx) {
  const { libros, autores, posts, autoresPorId, categoriasPorId } = ctx;
  const registros = [
    ...libros.map((l) => ({
      t: 'libro',
      id: l.id,
      titulo: l.titulo,
      sub: [autoresPorId.get(l.autorId)?.nombre, categoriasPorId.get(l.categoria)?.nombre].filter(Boolean).join(' · '),
      url: `/libro/${l.id}/`,
      img: l.portada || `/assets/portadas/${l.id}.svg`,
      precio: l.precio,
      texto: [l.titulo, l.subtitulo, l.isbn, l.coleccion, autoresPorId.get(l.autorId)?.nombre,
        categoriasPorId.get(l.categoria)?.nombre, ...(l.temas || []), l.resumen].filter(Boolean).join(' ').toLowerCase()
    })),
    ...autores.map((a) => ({
      t: 'autor',
      id: a.id,
      titulo: a.nombre,
      sub: a.especialidad,
      url: `/autor/${a.id}/`,
      img: a.foto || `/assets/autores/${a.id}.svg`,
      texto: [a.nombre, a.especialidad, a.institucion, a.resumen].filter(Boolean).join(' ').toLowerCase()
    })),
    ...posts.map((p) => ({
      t: 'articulo',
      id: p.id,
      titulo: p.titulo,
      sub: p.categoria,
      url: `/blog/${p.id}/`,
      img: `/assets/blog/${p.id}.svg`,
      texto: [p.titulo, p.categoria, p.resumen].join(' ').toLowerCase()
    }))
  ];
  escribir('indice-busqueda.json', JSON.stringify(registros));
}

function escribirCabecerasCloudflare() {
  escribir('_headers', `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/indice-busqueda.json
  Cache-Control: public, max-age=3600

/admin/*
  X-Robots-Tag: noindex, nofollow
`);

  escribir('_redirects', `# Rutas antiguas del sitio anterior -> estructura nueva
/index.html            /                      301
/libros.html           /libros/               301
/libro-detalle.html    /libros/               301
/autores.html          /autores/              301
/autor-detalle.html    /autores/              301
/novedades.html        /novedades/            301
/nosotros.html         /nosotros/             301
/contacto.html         /contacto/             301
/blog.html             /blog/                 301
/faq.html              /faq/                  301
/privacidad.html       /privacidad/           301
/terminos.html         /terminos/             301
/politica-envio.html   /envios/               301
/libro/:id             /libro/:id/            301
/autor/:id             /autor/:id/            301
`);
}

construir();
