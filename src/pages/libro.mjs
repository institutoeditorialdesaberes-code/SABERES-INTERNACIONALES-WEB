import { esc, money, markdown, estrellas, recorta, url, fechaLarga } from '../lib/utils.mjs';
import { icono } from '../lib/icons.mjs';
import { tarjetaLibro, rutaPortada, rutaRetrato, enlaceWhatsApp, autoresDe, precioTexto } from '../lib/components.mjs';

const DISPONIBILIDAD_SCHEMA = {
  disponible: 'https://schema.org/InStock',
  preventa: 'https://schema.org/PreOrder',
  agotado: 'https://schema.org/OutOfStock'
};

/* ── Dublin Core meta tags (BASE, OAIster, repositorios) ── */
function metasDC(libro, autores, cfg, absoluta) {
  const lines = [];
  const m = (name, content) => {
    if (content) lines.push(`<meta name="${name}" content="${esc(String(content))}">`);
  };
  m('DC.title', libro.titulo);
  autores.forEach(a => m('DC.creator', a.nombre));
  m('DC.date', String(libro.anio));
  m('DC.publisher', cfg.nombreLegal);
  m('DC.type', 'Text');
  m('DC.format', 'text/html');
  m('DC.language', cfg.idioma);
  m('DC.identifier', absoluta);
  if (libro.isbn) m('DC.identifier', `ISBN:${libro.isbn}`);
  (libro.temas || []).forEach(t => m('DC.subject', t));
  if (libro.resumen) m('DC.description', recorta(libro.resumen, 500));
  m('DC.rights', `© ${libro.anio} ${cfg.nombreLegal}`);
  return lines.join('\n');
}

/* ── COinS: detección automática por Zotero / Mendeley ── */
function coins(libro, autores, cfg, absoluta) {
  const p = [];
  p.push('ctx_ver=Z39.88-2004');
  p.push('rft_val_fmt=info:ofi/fmt:kev:mtx:book');
  p.push('rft.genre=book');
  p.push('rft.btitle=' + encodeURIComponent(libro.titulo));
  autores.forEach(a => p.push('rft.au=' + encodeURIComponent(a.nombre)));
  p.push('rft.date=' + libro.anio);
  p.push('rft.pub=' + encodeURIComponent(cfg.nombreLegal));
  p.push('rft.place=' + encodeURIComponent(cfg.contacto.ciudad + ', Ecuador'));
  if (libro.isbn) p.push('rft.isbn=' + encodeURIComponent(libro.isbn));
  if (libro.paginas) p.push('rft.tpages=' + libro.paginas);
  p.push('rft_id=' + encodeURIComponent(absoluta));
  return `<span class="Z3988" title="${esc(p.join('&'))}"></span>`;
}

/* ── BibTeX plano (para archivo descargable) ── */
function generarBibTeX(libro, autores, cfg, absoluta) {
  const key = (autores[0]?.nombre?.split(/\s+/).pop() || 'autor') + libro.anio;
  const autStr = autores.map(a => a.nombre).join(' and ') || cfg.nombreLegal;
  const lines = [`@book{${key},`];
  lines.push(`  title     = {${libro.titulo}},`);
  if (libro.subtitulo) lines.push(`  subtitle  = {${libro.subtitulo}},`);
  lines.push(`  author    = {${autStr}},`);
  lines.push(`  year      = {${libro.anio}},`);
  lines.push(`  publisher = {${cfg.nombreLegal}},`);
  lines.push(`  address   = {${cfg.contacto.ciudad}, Ecuador},`);
  if (libro.isbn) lines.push(`  isbn      = {${libro.isbn}},`);
  if (libro.paginas) lines.push(`  pages     = {${libro.paginas}},`);
  lines.push(`  url       = {${absoluta}},`);
  lines.push(`  note      = {Recuperado de ${absoluta}}`);
  lines.push('}');
  return lines.join('\n');
}

/* ── RIS (EndNote, RefWorks, Zotero) ── */
function generarRIS(libro, autores, cfg, absoluta) {
  const lines = ['TY  - BOOK'];
  lines.push(`TI  - ${libro.titulo}`);
  if (libro.subtitulo) lines.push(`T2  - ${libro.subtitulo}`);
  autores.forEach(a => lines.push(`AU  - ${a.nombre}`));
  lines.push(`PY  - ${libro.anio}`);
  lines.push(`PB  - ${cfg.nombreLegal}`);
  lines.push(`CY  - ${cfg.contacto.ciudad}, Ecuador`);
  if (libro.isbn) lines.push(`SN  - ${libro.isbn}`);
  if (libro.paginas) lines.push(`EP  - ${libro.paginas}`);
  if (libro.resumen) lines.push(`AB  - ${recorta(libro.resumen, 500)}`);
  (libro.temas || []).forEach(t => lines.push(`KW  - ${t}`));
  lines.push(`UR  - ${absoluta}`);
  lines.push(`LA  - ${cfg.idioma}`);
  lines.push('ER  - ');
  return lines.join('\r\n');
}

/* ── Metaetiquetas citation_* para Google Scholar ── */
function metasScholar(libro, autores, cfg, absoluta) {
  const lines = [];
  const m = (name, content) => {
    if (content) lines.push(`<meta name="${name}" content="${esc(String(content))}">`);
  };

  m('citation_title', libro.titulo);
  m('citation_subtitle', libro.subtitulo);

  /* Un tag por autor, formato "Apellido(s), Nombre(s)" */
  autores.forEach(a => {
    const partes = a.nombre.trim().split(/\s+/);
    /* Heurística: últimas dos palabras = apellidos, primeras = nombres */
    const nombresFmt = partes.length >= 3
      ? partes.slice(partes.length - 2).join(' ') + ', ' + partes.slice(0, partes.length - 2).join(' ')
      : partes.length === 2
        ? `${partes[1]}, ${partes[0]}`
        : partes[0];
    m('citation_author', nombresFmt);
  });

  m('citation_publication_date', String(libro.anio));
  m('citation_publisher', cfg.nombreLegal);
  m('citation_isbn', libro.isbn);
  m('citation_language', cfg.idioma);
  m('citation_abstract_html_url', absoluta);
  m('citation_fulltext_world_readable', '');

  (libro.temas || []).forEach(t => m('citation_keywords', t));

  if (libro.paginas) m('citation_pages', String(libro.paginas));

  /* Institución del autor si está disponible */
  autores.forEach(a => {
    if (a.institucion) m('citation_author_institution', a.institucion);
  });

  return lines.join('\n');
}

/* ── Genera la cita APA completa del libro ── */
function citaAPA(libro, autores, cfg) {
  let autoresStr;
  if (autores.length === 0) {
    autoresStr = cfg.nombreLegal;
  } else {
    const formateados = autores.map(a => {
      const partes = a.nombre.trim().split(/\s+/);
      const apellido = partes.length > 1 ? partes.slice(1).join(' ') : partes[0];
      const inicial = partes[0][0] + '.';
      return `${apellido}, ${inicial}`;
    });
    if (formateados.length === 1) autoresStr = formateados[0];
    else if (formateados.length === 2) autoresStr = formateados.join(', & ');
    else autoresStr = formateados.slice(0, -1).join(', ') + ', & ' + formateados.at(-1);
  }

  const titulo = libro.subtitulo
    ? `<em class="apa-titulo">${esc(libro.titulo)}: ${esc(libro.subtitulo)}</em>`
    : `<em class="apa-titulo">${esc(libro.titulo)}</em>`;

  const isbn = libro.isbn ? ` ISBN: ${esc(libro.isbn)}.` : '';
  const ciudad = 'Quito, Ecuador';

  return `<span class="apa-autores">${esc(autoresStr)}</span> <span class="apa-anio">(${libro.anio}).</span> ${titulo}. <span class="apa-editorial">${esc(cfg.nombreLegal)}.</span>${isbn}`;
}

/* ── Sección completa de reseñas de lectores ── */
function seccionResenas(libro, cfg) {
  const resenas = libro.resenas_detalle || [];
  const total = libro.resenas || 0;
  const promedio = libro.valoracion || 0;

  /* Distribución aproximada de estrellas */
  const dist = [5, 4, 3, 2, 1].map(n => {
    let pct = 0;
    if (resenas.length > 0) {
      pct = Math.round((resenas.filter(r => r.calificacion === n).length / resenas.length) * 100);
    } else if (n === 5 && promedio >= 4.5) { pct = 80; }
    else if (n === 4 && promedio >= 4) { pct = 15; }
    else if (n === 3) { pct = 5; }
    return { stars: n, pct };
  });

  const mensajeWA = encodeURIComponent(`Hola, quiero dejar una reseña del libro "${libro.titulo}". Mi opinión es:`);
  const urlWA = `https://wa.me/${cfg.contacto.whatsapp}?text=${mensajeWA}`;

  const cardsResenas = resenas.map(r => {
    const iniciales = r.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    const estrellasR = Array.from({ length: 5 }, (_, i) =>
      `<span class="estrella${i < r.calificacion ? ' llena' : ''}"></span>`).join('');
    return `
<article class="resena-card" data-revelar>
  <div class="resena-header">
    <div class="resena-avatar" aria-hidden="true">${esc(iniciales)}</div>
    <div class="resena-quien">
      <strong>${esc(r.nombre)}</strong>
      <span>${esc(r.cargo)}</span>
    </div>
    <div class="resena-meta">
      <div class="estrellas" aria-label="${r.calificacion} de 5 estrellas">${estrellasR}</div>
      <time datetime="${esc(r.fecha)}">${fechaLarga(r.fecha)}</time>
    </div>
  </div>
  <blockquote class="resena-texto">
    <p>${esc(r.texto)}</p>
  </blockquote>
  ${r.verificado ? `<p class="resena-badge">${icono('check')} Lector verificado</p>` : ''}
</article>`;
  }).join('');

  return `
<section class="seccion resenas-seccion" id="resenas">
  <div class="contenedor">

    <div class="resenas-encabezado">
      <div>
        <p class="sobretitulo">Comunidad lectora</p>
        <h2 class="titulo-bloque">Reseñas y valoraciones</h2>
      </div>
    </div>

    <div class="resenas-resumen">
      <div class="resenas-promedio">
        <span class="resenas-numero">${promedio.toFixed(1)}</span>
        <div class="estrellas grande" aria-label="${promedio} de 5">${Array.from({ length: 5 }, (_, i) =>
          `<span class="estrella${i < Math.floor(promedio) ? ' llena' : i < promedio ? ' media' : ''}"></span>`).join('')}</div>
        <span class="resenas-total">${total > 0 ? `${total} valoraciones` : 'Sin valoraciones aún'}</span>
      </div>
      <div class="resenas-barras">
        ${dist.map(d => `
        <div class="resena-barra">
          <span class="barra-label">${d.stars} ${icono('estrella-llena')}</span>
          <div class="barra-track" role="progressbar" aria-valuenow="${d.pct}" aria-valuemin="0" aria-valuemax="100">
            <div class="barra-fill" style="--w:${d.pct}%"></div>
          </div>
          <span class="barra-pct">${d.pct}%</span>
        </div>`).join('')}
      </div>
    </div>

    ${resenas.length ? `
    <div class="resenas-lista">
      ${cardsResenas}
    </div>` : ''}

    <div class="comentarios-seccion">
      <div class="comentarios-cabecera">
        <h3>${icono('chat')} Comentarios</h3>
        <p class="comentarios-sub">Inicia sesión con tu cuenta de Facebook, Google o Disqus para comentar.</p>
      </div>
      <div id="disqus_thread" class="disqus-thread">
        <div class="disqus-cargando" aria-live="polite">
          <span class="disqus-spinner"></span>
          <span>Cargando comentarios…</span>
        </div>
      </div>
    </div>

  </div>
</section>`;
}

export function paginaLibro(ctx, libro) {
  const { cfg, categoriasPorId, libros } = ctx;
  const autores = autoresDe(libro, ctx);
  const autor = autores[0];
  const categoria = categoriasPorId.get(libro.categoria);
  const ruta = `/libro/${libro.id}/`;
  const absoluta = url(cfg.url, ruta);

  const relacionados = libros
    .filter((l) => l.id !== libro.id
      && (l.categoria === libro.categoria || l.autores.some((a) => libro.autores.includes(a))))
    .slice(0, 4);

  const ficha = [
    ['ISBN', libro.isbn],
    [autores.length > 1 ? 'Autores' : 'Autor', autores.map((a) => a.nombre).join(' · ') || '—'],
    ['Editorial', cfg.nombreLegal],
    ['Colección', libro.coleccion],
    ['Año de edición', libro.anio],
    ['Edición', libro.edicion],
    ['Páginas', libro.paginas],
    ['Formato', libro.formato],
    ['Dimensiones', libro.dimensiones],
    ['Idioma', libro.idioma],
    ['País de edición', 'Ecuador']
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');

  const compartirTexto = encodeURIComponent(`${libro.titulo} — ${cfg.nombre}`);
  const compartirUrl = encodeURIComponent(absoluta);
  const apa = citaAPA(libro, autores, cfg);

  const cuerpo = `
<section class="ficha">
  <div class="contenedor ficha-rejilla">
    <div class="ficha-visual">
      <div class="ficha-portada">
        <img src="${esc(rutaPortada(libro))}" alt="Portada del libro ${esc(libro.titulo)} de ${esc(autor ? autor.nombre : '')}"
             width="400" height="600" fetchpriority="high" decoding="async">
        ${libro.insignia ? `<span class="insignia">${esc(libro.insignia)}</span>` : ''}
      </div>
      <ul class="ficha-garantias">
        <li>${icono('envio')}<span>Envío a todo el Ecuador en 24–72 h</span></li>
        <li>${icono('sello')}<span>Ejemplar original con ISBN registrado</span></li>
        <li>${icono('soporte')}<span>Atención directa del equipo editorial</span></li>
      </ul>
    </div>

    <div class="ficha-datos">
      ${categoria ? `<a class="tarjeta-categoria" href="/categoria/${esc(categoria.id)}/" style="--c:${esc(categoria.color)}">${esc(categoria.nombre)}</a>` : ''}
      <h1>${esc(libro.titulo)}</h1>
      ${libro.subtitulo ? `<p class="ficha-subtitulo">${esc(libro.subtitulo)}</p>` : ''}
      ${autores.length ? `
      <div class="ficha-autores">
        <span class="nota">${autores.length > 1 ? 'Autores:' : 'Autor:'}</span>
        ${autores.map((a) => `<a href="/autor/${esc(a.id)}/"><img src="${esc(rutaRetrato(a))}" alt="" width="28" height="28" loading="lazy">${esc(a.nombre)}</a>`).join('')}
      </div>` : ''}

      <p class="ficha-resumen">${esc(libro.resumen)}</p>

      <div class="ficha-compra">
        <div class="ficha-precios">
          <p class="precio-principal">${precioTexto(libro, cfg)}${libro.precio > 0 ? ` <span>${esc(libro.formato.toLowerCase().includes('digital') ? 'edición digital' : 'impreso')}</span>` : ''}</p>
          ${libro.precioDigital > 0 ? `<p class="precio-secundario">${money(libro.precioDigital, cfg.simboloMoneda)} <span>edición digital</span></p>` : ''}
          <p class="estado estado-${esc(libro.disponibilidad)}">${icono('check')}${esc(
            libro.disponibilidad === 'preventa' ? 'En preventa — reserva disponible'
              : libro.disponibilidad === 'agotado' ? 'Temporalmente agotado' : 'Disponible para envío inmediato'
          )}</p>
        </div>
        <div class="ficha-acciones">
          <a class="boton boton-wa grande" href="${esc(enlaceWhatsApp(cfg, libro))}" target="_blank" rel="noopener">
            ${icono('whatsapp')}<span>Pedir por WhatsApp</span>
          </a>
          <a class="boton boton-fantasma grande" href="/contacto/?libro=${esc(libro.id)}">${icono('correo')}<span>Consultar por correo</span></a>
          ${libro.urlPdf ? `<button type="button" class="boton boton-leer grande" data-leer-pdf="${esc(libro.urlPdf)}">${icono('libro')}<span>Leer en línea</span></button>` : ''}
        </div>
        <p class="nota">Pedidos institucionales y compras por volumen: escríbenos y preparamos una cotización con descuento por cantidad.</p>
      </div>

      <div class="ficha-compartir">
        <span>Compartir:</span>
        <a href="https://wa.me/?text=${compartirTexto}%20${compartirUrl}" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp">${icono('whatsapp')}</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${compartirUrl}" target="_blank" rel="noopener" aria-label="Compartir en Facebook">${icono('facebook')}</a>
        <a href="https://x.com/intent/tweet?text=${compartirTexto}&url=${compartirUrl}" target="_blank" rel="noopener" aria-label="Compartir en X">${icono('x')}</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${compartirUrl}" target="_blank" rel="noopener" aria-label="Compartir en LinkedIn">${icono('linkedin')}</a>
        <button type="button" data-copiar="${esc(absoluta)}" aria-label="Copiar enlace">${icono('mas')}</button>
      </div>
    </div>
  </div>
</section>

<section class="seccion">
  <div class="contenedor">
    <div class="pestanas" data-pestanas>
      <div class="pestanas-botones" role="tablist">
        <button type="button" role="tab" aria-selected="true" aria-controls="tab-desc" id="btn-desc">Sobre el libro</button>
        ${libro.indice?.length ? '<button type="button" role="tab" aria-selected="false" aria-controls="tab-indice" id="btn-indice">Índice</button>' : ''}
        <button type="button" role="tab" aria-selected="false" aria-controls="tab-ficha" id="btn-ficha">Ficha técnica</button>
        ${autores.length ? `<button type="button" role="tab" aria-selected="false" aria-controls="tab-autor" id="btn-autor">${autores.length > 1 ? 'Los autores' : 'El autor'}</button>` : ''}
        <button type="button" role="tab" aria-selected="false" aria-controls="tab-apa" id="btn-apa">Citar</button>
      </div>

      <div class="pestanas-panel prosa" role="tabpanel" id="tab-desc" aria-labelledby="btn-desc">
        ${markdown(libro.descripcion)}
        ${libro.temas?.length ? `<p class="temas">${libro.temas.map((t) => `<span class="pastilla">${esc(t)}</span>`).join('')}</p>` : ''}
      </div>

      ${libro.indice?.length ? `
      <div class="pestanas-panel prosa" role="tabpanel" id="tab-indice" aria-labelledby="btn-indice" hidden>
        <ol class="indice">${libro.indice.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>
      </div>` : ''}

      <div class="pestanas-panel" role="tabpanel" id="tab-ficha" aria-labelledby="btn-ficha" hidden>
        <table class="tabla-ficha">
          <caption class="visualmente-oculto">Ficha técnica de ${esc(libro.titulo)}</caption>
          <tbody>
            ${ficha.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      ${autores.length ? `
      <div class="pestanas-panel" role="tabpanel" id="tab-autor" aria-labelledby="btn-autor" hidden>
        ${autores.map((a) => `
        <div class="bloque-autor">
          <img src="${esc(rutaRetrato(a))}" alt="${esc(a.nombre)}" width="320" height="320" loading="lazy" decoding="async">
          <div class="prosa">
            <h3>${esc(a.nombre)}</h3>
            <p class="especialidad">${esc([a.grado, a.institucion].filter(Boolean).join(' · '))}</p>
            ${a.bio.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('')}
            <a class="enlace-flecha" href="/autor/${esc(a.id)}/">Ver su perfil completo ${icono('flechaDer')}</a>
          </div>
        </div>`).join('')}
      </div>` : ''}

      <div class="pestanas-panel" role="tabpanel" id="tab-apa" aria-labelledby="btn-apa" hidden>
        <div class="apa-bloque">
          <p class="apa-etiqueta">Cita bibliográfica · Formato APA 7.ª edición</p>
          <blockquote class="apa-cita" id="apa-texto">${apa}</blockquote>
          <div class="cita-acciones">
            <button type="button" class="boton boton-fantasma boton-copiar-apa" data-copiar-apa>
              ${icono('descarga')}<span>Copiar APA</span>
            </button>
            <a class="boton boton-fantasma" href="/citar/${esc(libro.id)}.bib" download="${esc(libro.id)}.bib">
              ${icono('descarga')}<span>Descargar BibTeX</span>
            </a>
            <a class="boton boton-fantasma" href="/citar/${esc(libro.id)}.ris" download="${esc(libro.id)}.ris">
              ${icono('descarga')}<span>Descargar RIS</span>
            </a>
          </div>
          <p class="apa-nota">Compatible con Zotero, Mendeley, EndNote y RefWorks. La cita APA sigue la 7.ª edición (2020).</p>
          ${coins(libro, autores, cfg, absoluta)}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="seccion compartir-seccion">
  <div class="contenedor">
    <div class="compartir-barra">
      <span class="compartir-label">${icono('envio')} Comparte este libro:</span>
      <div class="compartir-botones">
        <a class="compartir-btn compartir-fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluta)}" target="_blank" rel="noopener" aria-label="Compartir en Facebook">
          ${icono('facebook')}<span>Facebook</span>
        </a>
        <a class="compartir-btn compartir-wa" href="https://wa.me/?text=${encodeURIComponent(libro.titulo + ' — ' + absoluta)}" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp">
          ${icono('whatsapp')}<span>WhatsApp</span>
        </a>
        <a class="compartir-btn compartir-tw" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(absoluta)}&text=${encodeURIComponent(libro.titulo + ' — ' + cfg.nombreLegal)}" target="_blank" rel="noopener" aria-label="Compartir en X / Twitter">
          ${icono('x')}<span>X</span>
        </a>
        <a class="compartir-btn compartir-li" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(absoluta)}" target="_blank" rel="noopener" aria-label="Compartir en LinkedIn">
          ${icono('linkedin')}<span>LinkedIn</span>
        </a>
        <a class="compartir-btn compartir-tg" href="https://t.me/share/url?url=${encodeURIComponent(absoluta)}&text=${encodeURIComponent(libro.titulo)}" target="_blank" rel="noopener" aria-label="Compartir en Telegram">
          ${icono('telegram')}<span>Telegram</span>
        </a>
        <button class="compartir-btn compartir-copiar" type="button" data-copiar-url="${esc(absoluta)}" aria-label="Copiar enlace">
          ${icono('enlace')}<span>Copiar enlace</span>
        </button>
      </div>
    </div>
  </div>
</section>

${relacionados.length ? `
<section class="seccion seccion-alterna">
  <div class="contenedor">
    <h2 class="titulo-bloque">También te puede interesar</h2>
    <div class="rejilla-libros">${relacionados.map((l) => tarjetaLibro(l, ctx)).join('')}</div>
  </div>
</section>` : ''}`;

  const imagenAbsoluta = url(cfg.url, rutaPortada(libro));

  /* Oferta declarable: precio de venta real, o lectura gratuita cuando el PDF
     está publicado. Sin ninguna de las dos no se declara oferta, y sin oferta
     ni valoraciones reales tampoco se emite el nodo Product (Google exige que
     un Product tenga offers, review o aggregateRating). */
  const esGratis = libro.precio <= 0 && !!libro.urlPdf;
  const ofertaLD = (libro.precio > 0 || esGratis) ? {
    '@type': 'Offer',
    price: libro.precio > 0 ? libro.precio.toFixed(2) : '0',
    priceCurrency: cfg.moneda,
    availability: DISPONIBILIDAD_SCHEMA[libro.disponibilidad] || DISPONIBILIDAD_SCHEMA.disponible,
    url: absoluta,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': `${cfg.url}/#organizacion` },
    areaServed: 'EC'
  } : null;

  /* Solo se declaran valoraciones que existen de verdad en data/books.json. */
  const valoracionLD = libro.resenas > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: libro.valoracion,
    reviewCount: libro.resenas,
    bestRating: 5,
    worstRating: 1
  } : null;

  const libroLD = {
    '@type': 'Book',
    '@id': `${absoluta}#libro`,
    name: libro.titulo,
    ...(libro.subtitulo ? { alternativeHeadline: libro.subtitulo } : {}),
    url: absoluta,
    image: imagenAbsoluta,
    description: recorta(`${libro.resumen} ${libro.descripcion}`, 600),
    isbn: libro.isbn,
    numberOfPages: libro.paginas,
    bookFormat: libro.formato.toLowerCase().includes('dura')
      ? 'https://schema.org/Hardcover' : 'https://schema.org/Paperback',
    bookEdition: libro.edicion,
    inLanguage: cfg.idioma,
    datePublished: String(libro.anio),
    genre: categoria ? categoria.nombre : undefined,
    keywords: (libro.temas || []).join(', '),
    publisher: { '@id': `${cfg.url}/#organizacion` },
    ...(autores.length ? {
      author: autores.map((a) => ({
        '@type': 'Person',
        '@id': `${cfg.url}/autor/${a.id}/#persona`,
        name: a.nombre,
        url: `${cfg.url}/autor/${a.id}/`
      }))
    } : {}),
    ...(valoracionLD ? { aggregateRating: valoracionLD } : {}),
    ...(ofertaLD ? { offers: ofertaLD } : {})
  };

  return {
    ruta,
    titulo: `${libro.titulo}${autor ? ` — ${autor.nombre}` : ''}`,
    tituloSocial: `${libro.titulo} — ${cfg.nombre}`,
    descripcion: recorta([
      libro.resumen,
      `${libro.paginas ? `${libro.paginas} páginas, ` : ''}${libro.formato}.`,
      libro.isbn ? `ISBN ${libro.isbn}.` : '',
      `Editado por ${cfg.nombreLegal} en Quito, Ecuador.`
    ].filter(Boolean).join(' '), 300),
    palabrasClave: [libro.titulo, autor?.nombre, categoria?.nombre, ...(libro.temas || []), 'libro', 'Ecuador'].filter(Boolean),
    imagen: /\.(png|jpe?g|webp)$/i.test(rutaPortada(libro)) ? rutaPortada(libro) : undefined,
    tipo: 'book',
    clase: 'p-libro',
    migas: [
      { texto: 'Inicio', url: '/' },
      { texto: 'Catálogo', url: '/libros/' },
      ...(categoria ? [{ texto: categoria.nombre, url: `/categoria/${categoria.id}/` }] : []),
      { texto: libro.titulo, url: ruta }
    ],
    extraHead: metasScholar(libro, autores, cfg, absoluta) + '\n' + metasDC(libro, autores, cfg, absoluta),
    cuerpo,
    jsonld: [libroLD, ...(ofertaLD || valoracionLD ? [{
      '@type': 'Product',
      '@id': `${absoluta}#producto`,
      name: libro.titulo,
      image: imagenAbsoluta,
      description: recorta(libro.resumen, 300),
      ...(libro.isbn ? { sku: libro.isbn } : {}),
      ...(libro.isbn.replace(/-/g, '').length === 13 ? { gtin13: libro.isbn.replace(/-/g, '') } : {}),
      brand: { '@id': `${cfg.url}/#organizacion` },
      ...(ofertaLD ? { offers: ofertaLD } : {}),
      ...(valoracionLD ? { aggregateRating: valoracionLD } : {})
    }] : [])]
  };
}
