import { esc, markdown, fechaLarga, recorta, tiempoLectura, url } from '../lib/utils.mjs';
import { icono } from '../lib/icons.mjs';
import { tarjetaEntrada, rutaBanner } from '../lib/components.mjs';

export function paginaBlog(ctx) {
  const { cfg, posts } = ctx;
  const [principal, ...resto] = posts;
  const categorias = [...new Set(posts.map((p) => p.categoria))];

  const cuerpo = `
<section class="portada-seccion">
  <div class="contenedor">
    <p class="sobretitulo claro">Bitácora editorial</p>
    <h1>Blog</h1>
    <p class="bajada">Guías sobre publicación, escritura académica, producción de libros y derechos de autor, escritas por el equipo de ${esc(cfg.nombre)}.</p>
  </div>
</section>

${principal ? `
<section class="seccion">
  <div class="contenedor">
    <article class="entrada-destacada">
      <a class="entrada-destacada-imagen" href="/blog/${esc(principal.id)}/" tabindex="-1" aria-hidden="true">
        <img src="${esc(rutaBanner(principal, ctx))}" alt="" width="1200" height="480" fetchpriority="high" decoding="async">
      </a>
      <div>
        <p class="tarjeta-entrada-meta"><span class="pastilla">${esc(principal.categoria)}</span><time datetime="${esc(principal.fecha)}">${fechaLarga(principal.fecha)}</time><span>${tiempoLectura(principal.contenido)} min de lectura</span></p>
        <h2><a href="/blog/${esc(principal.id)}/">${esc(principal.titulo)}</a></h2>
        <p>${esc(principal.resumen)}</p>
        <a class="boton boton-primario" href="/blog/${esc(principal.id)}/">Leer el artículo</a>
      </div>
    </article>
  </div>
</section>` : ''}

<section class="seccion seccion-alterna">
  <div class="contenedor">
    <div class="filtro-etiquetas" data-filtro-blog>
      <button type="button" class="activo" data-etiqueta="todas">Todas</button>
      ${categorias.map((c) => `<button type="button" data-etiqueta="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <div class="rejilla-entradas" data-rejilla-blog>
      ${resto.map((p) => `<div data-categoria-entrada="${esc(p.categoria)}">${tarjetaEntrada(p, ctx)}</div>`).join('')}
    </div>
  </div>
</section>`;

  return {
    ruta: '/blog/',
    titulo: 'Blog editorial',
    descripcion: `Artículos de ${cfg.nombreLegal} sobre cómo publicar un libro en Ecuador, ISBN, derechos de autor, revisión por pares y escritura académica.`,
    clase: 'p-blog',
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Blog', url: '/blog/' }],
    cuerpo,
    jsonld: [{
      '@type': 'Blog',
      '@id': `${cfg.url}/blog/#blog`,
      name: `Blog de ${cfg.nombre}`,
      url: `${cfg.url}/blog/`,
      inLanguage: cfg.idioma,
      publisher: { '@id': `${cfg.url}/#organizacion` },
      blogPost: posts.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.titulo,
        url: `${cfg.url}/blog/${p.id}/`,
        datePublished: p.fecha,
        author: { '@type': 'Organization', name: cfg.nombreLegal }
      }))
    }]
  };
}

export function paginaEntrada(ctx, post) {
  const { cfg, posts } = ctx;
  const ruta = `/blog/${post.id}/`;
  const relacionadas = posts.filter((p) => p.id !== post.id).slice(0, 3);
  const minutos = tiempoLectura(post.contenido);

  const cuerpo = `
<article class="articulo">
  <header class="articulo-cabecera">
    <div class="contenedor estrecho">
      <p class="tarjeta-entrada-meta">
        <span class="pastilla">${esc(post.categoria)}</span>
        <time datetime="${esc(post.fecha)}">${fechaLarga(post.fecha)}</time>
        <span>${minutos} min de lectura</span>
      </p>
      <h1>${esc(post.titulo)}</h1>
      <p class="bajada">${esc(post.resumen)}</p>
      <p class="articulo-autor">${icono('pluma')} ${esc(post.autor)} · ${esc(cfg.nombreLegal)}</p>
    </div>
  </header>

  <figure class="articulo-imagen">
    <img src="${esc(rutaBanner(post, ctx))}" alt="" width="1200" height="480" fetchpriority="high" decoding="async">
  </figure>

  <div class="contenedor estrecho">
    <div class="prosa articulo-cuerpo">
      ${markdown(post.contenido)}
    </div>

    <div class="articulo-pie">
      <a class="boton boton-fantasma" href="/blog/">${icono('flechaIzq')}<span>Volver al blog</span></a>
      <div class="ficha-compartir">
        <span>Compartir:</span>
        <a href="https://wa.me/?text=${encodeURIComponent(post.titulo)}%20${encodeURIComponent(url(cfg.url, ruta))}" target="_blank" rel="noopener" aria-label="WhatsApp">${icono('whatsapp')}</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url(cfg.url, ruta))}" target="_blank" rel="noopener" aria-label="Facebook">${icono('facebook')}</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url(cfg.url, ruta))}" target="_blank" rel="noopener" aria-label="LinkedIn">${icono('linkedin')}</a>
      </div>
    </div>
  </div>
</article>

<section class="seccion seccion-alterna">
  <div class="contenedor">
    <h2 class="titulo-bloque">Sigue leyendo</h2>
    <div class="rejilla-entradas">${relacionadas.map((p) => tarjetaEntrada(p, ctx)).join('')}</div>
  </div>
</section>`;

  return {
    ruta,
    titulo: post.titulo,
    descripcion: recorta(post.resumen, 200),
    palabrasClave: [post.categoria, 'editorial', 'publicar libro', 'Ecuador'],
    // Las redes sociales no renderizan SVG: solo se declara imagen cuando
    // hay un banner real subido por la editorial.
    imagen: /\.(png|jpe?g|webp)$/i.test(rutaBanner(post, ctx)) ? rutaBanner(post, ctx) : undefined,
    tipo: 'article',
    clase: 'p-articulo',
    migas: [
      { texto: 'Inicio', url: '/' },
      { texto: 'Blog', url: '/blog/' },
      { texto: post.titulo, url: ruta }
    ],
    cuerpo,
    jsonld: [{
      '@type': 'BlogPosting',
      '@id': `${url(cfg.url, ruta)}#articulo`,
      headline: post.titulo,
      description: post.resumen,
      url: url(cfg.url, ruta),
      datePublished: post.fecha,
      dateModified: post.fecha,
      inLanguage: cfg.idioma,
      wordCount: post.contenido.split(/\s+/).length,
      timeRequired: `PT${minutos}M`,
      articleSection: post.categoria,
      image: url(cfg.url, '/assets/img/portada-social.png'),
      author: { '@type': 'Organization', name: cfg.nombreLegal, url: `${cfg.url}/` },
      publisher: { '@id': `${cfg.url}/#organizacion` },
      isPartOf: { '@id': `${cfg.url}/blog/#blog` },
      mainEntityOfPage: url(cfg.url, ruta)
    }]
  };
}
