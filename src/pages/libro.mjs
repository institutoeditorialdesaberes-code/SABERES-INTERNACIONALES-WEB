import { esc, money, markdown, estrellas, recorta, url } from '../lib/utils.mjs';
import { icono } from '../lib/icons.mjs';
import { tarjetaLibro, rutaPortada, rutaRetrato, enlaceWhatsApp, autoresDe, precioTexto } from '../lib/components.mjs';

const DISPONIBILIDAD_SCHEMA = {
  disponible: 'https://schema.org/InStock',
  preventa: 'https://schema.org/PreOrder',
  agotado: 'https://schema.org/OutOfStock'
};

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

      <div class="ficha-valoracion">
        ${estrellas(libro.valoracion)}
        <span><strong>${libro.valoracion.toFixed(1)}</strong> sobre 5 · ${libro.resenas} valoraciones de lectores</span>
      </div>

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
    // Solo se declara valoración si realmente hay reseñas registradas.
    ...(libro.resenas > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: libro.valoracion,
        reviewCount: libro.resenas,
        bestRating: 5,
        worstRating: 1
      }
    } : {}),
    // Sin precio definido no se publica una oferta: Google rechaza precio 0.
    ...(libro.precio > 0 ? {
      offers: {
        '@type': 'Offer',
        price: libro.precio.toFixed(2),
        priceCurrency: cfg.moneda,
        availability: DISPONIBILIDAD_SCHEMA[libro.disponibilidad] || DISPONIBILIDAD_SCHEMA.disponible,
        url: absoluta,
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': `${cfg.url}/#organizacion` },
        areaServed: 'EC'
      }
    } : {})
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
    // Las redes sociales no renderizan SVG: solo se usa la portada como
    // imagen social cuando el editor subió un archivo de mapa de bits.
    imagen: /\.(png|jpe?g|webp)$/i.test(rutaPortada(libro)) ? rutaPortada(libro) : undefined,
    tipo: 'book',
    clase: 'p-libro',
    migas: [
      { texto: 'Inicio', url: '/' },
      { texto: 'Catálogo', url: '/libros/' },
      ...(categoria ? [{ texto: categoria.nombre, url: `/categoria/${categoria.id}/` }] : []),
      { texto: libro.titulo, url: ruta }
    ],
    cuerpo,
    jsonld: [libroLD, {
      '@type': 'Product',
      '@id': `${absoluta}#producto`,
      name: libro.titulo,
      image: imagenAbsoluta,
      description: recorta(libro.resumen, 300),
      ...(libro.isbn ? { sku: libro.isbn } : {}),
      ...(libro.isbn.replace(/-/g, '').length === 13 ? { gtin13: libro.isbn.replace(/-/g, '') } : {}),
      brand: { '@id': `${cfg.url}/#organizacion` },
      ...(libroLD.offers ? { offers: libroLD.offers } : {}),
      ...(libroLD.aggregateRating ? { aggregateRating: libroLD.aggregateRating } : {})
    }]
  };
}
