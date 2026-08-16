// Piezas reutilizables de interfaz: tarjetas, encabezados de sección,
// carruseles y llamadas a la acción.

import { esc, money, recorta, estrellas, fechaLarga } from './utils.mjs';
import { icono } from './icons.mjs';

export function rutaPortada(libro) {
  if (libro.portada) return libro.portada;
  return `/assets/portadas/${libro.id}.svg`;
}

export function rutaRetrato(autor) {
  if (autor.foto) return autor.foto;
  return `/assets/autores/${autor.id}.svg`;
}

/**
 * Cabecera de una entrada del blog. Si el editor subió una imagen real a
 * public/imagenes/blog/<id>.jpg (o .png/.webp), se usa esa; si no, cae al
 * banner SVG generado por código. La comprobación la hace el build, que es
 * quien conoce el sistema de archivos; aquí solo se decide la ruta pública.
 */
export function rutaBanner(post, ctx) {
  const real = ctx.bannersReales && ctx.bannersReales.get(post.id);
  return real || `/assets/blog/${post.id}.svg`;
}

/** Imagen de apoyo para una sección institucional fija (nosotros, publica-con-nosotros…). */
export function rutaSeccion(id, ctx) {
  return (ctx.imagenesSecciones && ctx.imagenesSecciones.get(id)) || '';
}

/** Todos los autores de un libro, en el orden en que figuran en la obra. */
export function autoresDe(libro, ctx) {
  return (libro.autores || [libro.autorId])
    .map((id) => ctx.autoresPorId.get(id))
    .filter(Boolean);
}

/** Un libro sin precio definido no muestra "$0.00", muestra una invitación. */
export function precioTexto(libro, cfg) {
  return libro.precio > 0 ? money(libro.precio, cfg.simboloMoneda) : 'Consultar precio';
}

export function enlaceWhatsApp(cfg, libro) {
  const texto = `${cfg.contacto.whatsappMensaje} "${libro.titulo}" (ISBN ${libro.isbn}). ¿Está disponible?`;
  return `https://wa.me/${cfg.contacto.whatsapp}?text=${encodeURIComponent(texto)}`;
}

const ETIQUETA_DISPONIBILIDAD = {
  disponible: ['Disponible', 'ok'],
  preventa: ['En preventa', 'aviso'],
  agotado: ['Agotado', 'off']
};

export function tarjetaLibro(libro, ctx, { prioridad = false } = {}) {
  const { cfg, categoriasPorId } = ctx;
  const autores = autoresDe(libro, ctx);
  const autor = autores[0];
  const otros = autores.length - 1;
  const categoria = categoriasPorId.get(libro.categoria);
  const [textoDisp, claseDisp] = ETIQUETA_DISPONIBILIDAD[libro.disponibilidad] || ETIQUETA_DISPONIBILIDAD.disponible;

  return `
<article class="tarjeta-libro" data-categoria="${esc(libro.categoria)}" data-precio="${libro.precio}" data-anio="${libro.anio}" data-valoracion="${libro.valoracion}" data-nuevo="${libro.esNuevo ? '1' : '0'}" data-titulo="${esc(libro.titulo.toLowerCase())}" data-autor="${esc((autor?.nombre || '').toLowerCase())}">
  <a class="tarjeta-libro-imagen" href="/libro/${esc(libro.id)}/" tabindex="-1" aria-hidden="true">
    <img src="${esc(rutaPortada(libro))}" alt="" width="400" height="600"
         loading="${prioridad ? 'eager' : 'lazy'}" decoding="async"${prioridad ? ' fetchpriority="high"' : ''}>
    ${libro.insignia ? `<span class="insignia">${esc(libro.insignia)}</span>` : ''}
  </a>
  <div class="tarjeta-libro-cuerpo">
    ${categoria ? `<a class="tarjeta-categoria" href="/categoria/${esc(categoria.id)}/" style="--c:${esc(categoria.color)}">${esc(categoria.nombre)}</a>` : ''}
    <h3 class="tarjeta-titulo"><a href="/libro/${esc(libro.id)}/">${esc(libro.titulo)}</a></h3>
    ${autor ? `<p class="tarjeta-autor"><a href="/autor/${esc(autor.id)}/">${esc(autor.nombre)}</a>${otros > 0 ? ` <span>y ${otros} ${otros === 1 ? 'autor más' : 'autores más'}</span>` : ''}</p>` : ''}
    <div class="tarjeta-valoracion">${estrellas(libro.valoracion)}<span>${libro.valoracion.toFixed(1)} (${libro.resenas})</span></div>
    <div class="tarjeta-pie">
      <p class="tarjeta-precio ${libro.precio > 0 ? '' : 'sin-precio'}">${precioTexto(libro, cfg)}<span class="disp ${claseDisp}">${textoDisp}</span></p>
      <a class="boton boton-compacto boton-wa" href="${esc(enlaceWhatsApp(cfg, libro))}" target="_blank" rel="noopener">${icono('whatsapp')}<span>Pedir</span></a>
    </div>
  </div>
</article>`;
}

export function tarjetaAutor(autor, ctx) {
  const { librosPorAutor } = ctx;
  const total = (librosPorAutor.get(autor.id) || []).length;
  return `
<article class="tarjeta-autor">
  <a href="/autor/${esc(autor.id)}/" class="tarjeta-autor-foto">
    <img src="${esc(rutaRetrato(autor))}" alt="${esc(autor.nombre)}" width="320" height="320" loading="lazy" decoding="async">
  </a>
  <h3><a href="/autor/${esc(autor.id)}/">${esc(autor.nombre)}</a></h3>
  <p class="especialidad">${esc(autor.especialidad)}</p>
  <p class="resumen">${esc(recorta(autor.resumen, 120))}</p>
  <p class="meta">${total} ${total === 1 ? 'título' : 'títulos'} · ${autor.aniosExperiencia} años de trayectoria</p>
</article>`;
}

export function tarjetaEntrada(post, ctx) {
  return `
<article class="tarjeta-entrada">
  <a class="tarjeta-entrada-imagen" href="/blog/${esc(post.id)}/" tabindex="-1" aria-hidden="true">
    <img src="${esc(rutaBanner(post, ctx))}" alt="" width="1200" height="480" loading="lazy" decoding="async">
  </a>
  <div class="tarjeta-entrada-cuerpo">
    <p class="tarjeta-entrada-meta"><span class="pastilla">${esc(post.categoria)}</span><time datetime="${esc(post.fecha)}">${fechaLarga(post.fecha)}</time></p>
    <h3><a href="/blog/${esc(post.id)}/">${esc(post.titulo)}</a></h3>
    <p>${esc(recorta(post.resumen, 150))}</p>
    <a class="enlace-flecha" href="/blog/${esc(post.id)}/">Leer el artículo ${icono('flechaDer')}</a>
  </div>
</article>`;
}

export function tarjetaCategoria(categoria, cantidad, ctx) {
  const imagen = ctx && ctx.imagenesCategorias && ctx.imagenesCategorias.get(categoria.id);

  // Con imagen la tarjeta se convierte en una pieza visual: la fotografía va
  // al fondo, oscurecida con el color de la colección para que el texto se
  // lea siempre, tenga la imagen los tonos que tenga.
  if (imagen) {
    return `
<a class="tarjeta-categoria-grande con-imagen" href="/categoria/${esc(categoria.id)}/" style="--c:${esc(categoria.color)}">
  <img src="${esc(imagen)}" alt="" width="690" height="276" loading="lazy" decoding="async">
  <span class="tcg-velo"></span>
  <span class="tcg-icono">${icono(categoria.icono)}</span>
  <span class="tcg-texto">
    <strong>${esc(categoria.nombre)}</strong>
    <em>${cantidad} ${cantidad === 1 ? 'título' : 'títulos'}</em>
  </span>
  ${icono('chevronDer', 'tcg-flecha')}
</a>`;
  }

  return `
<a class="tarjeta-categoria-grande" href="/categoria/${esc(categoria.id)}/" style="--c:${esc(categoria.color)}">
  <span class="tcg-icono">${icono(categoria.icono)}</span>
  <span class="tcg-texto">
    <strong>${esc(categoria.nombre)}</strong>
    <em>${cantidad} ${cantidad === 1 ? 'título' : 'títulos'}</em>
  </span>
  ${icono('chevronDer', 'tcg-flecha')}
</a>`;
}

export function encabezadoSeccion({ sobretitulo, titulo, texto, enlace, textoEnlace }) {
  return `
<div class="encabezado-seccion">
  <div>
    ${sobretitulo ? `<p class="sobretitulo">${esc(sobretitulo)}</p>` : ''}
    <h2>${esc(titulo)}</h2>
    ${texto ? `<p class="bajada">${esc(texto)}</p>` : ''}
  </div>
  ${enlace ? `<a class="enlace-flecha" href="${esc(enlace)}">${esc(textoEnlace || 'Ver todo')} ${icono('flechaDer')}</a>` : ''}
</div>`;
}

/** Fila desplazable con botones de avance; degrada a scroll táctil sin JS. */
export function carrusel(id, contenidoHTML) {
  return `
<div class="carrusel" data-carrusel>
  <button class="carrusel-boton izq" type="button" data-carrusel-izq aria-label="Anterior" aria-controls="${esc(id)}">${icono('flechaIzq')}</button>
  <div class="carrusel-pista" id="${esc(id)}">${contenidoHTML}</div>
  <button class="carrusel-boton der" type="button" data-carrusel-der aria-label="Siguiente" aria-controls="${esc(id)}">${icono('flechaDer')}</button>
</div>`;
}

export function bandaCTA(cfg) {
  return `
<section class="banda-cta">
  <img class="banda-cta-fondo" src="/imagenes/secciones/banda-cta.jpg" alt="" width="1600" height="700" loading="lazy" decoding="async">
  <div class="contenedor banda-cta-fila">
    <div>
      <p class="sobretitulo claro">Convocatoria abierta</p>
      <h2>¿Tienes un manuscrito listo?</h2>
      <p>Recibimos propuestas durante todo el año. Evaluación editorial con informe escrito y acompañamiento en registro de ISBN, diseño, impresión y distribución.</p>
    </div>
    <div class="banda-cta-acciones">
      <a class="boton boton-primario" href="/publica-con-nosotros/">Enviar mi propuesta</a>
      <a class="boton boton-fantasma" href="/servicios/">Ver servicios editoriales</a>
    </div>
  </div>
</section>`;
}

export function ventajas(cfg, ctx) {
  const hayImagenes = cfg.ventajas.some((v) => v.id && ctx?.imagenesVentajas?.get(v.id));
  if (hayImagenes) {
    // Diseño visual con fotos, overlay y motion
    return `
<section class="ventajas ventajas-visual">
  <div class="contenedor ventajas-rejilla-visual">
    ${cfg.ventajas.map((v) => {
      const imagen = v.id && ctx?.imagenesVentajas?.get(v.id);
      const tag = v.url ? 'a' : 'div';
      const href = v.url ? ` href="${esc(v.url)}"` : '';
      return `
    <${tag} class="ventaja-card"${href}>
      ${imagen ? `<img class="ventaja-card-img" src="${esc(imagen)}" alt="" width="400" height="300" loading="lazy" decoding="async">` : ''}
      <div class="ventaja-card-overlay"></div>
      <div class="ventaja-card-body">
        <span class="ventaja-card-icono">${icono(v.icono)}</span>
        <strong class="ventaja-card-titulo">${esc(v.titulo)}</strong>
        <span class="ventaja-card-texto">${esc(v.texto)}</span>
        ${v.url ? `<span class="ventaja-card-cta">Saber más ${icono('flechaDer')}</span>` : ''}
      </div>
    </${tag}>`;
    }).join('')}
  </div>
</section>`;
  }
  // Fallback sin imágenes: diseño de iconos
  return `
<section class="ventajas">
  <div class="contenedor ventajas-rejilla">
    ${cfg.ventajas.map((v) => {
      const tag = v.url ? 'a' : 'div';
      const href = v.url ? ` href="${esc(v.url)}"` : '';
      return `
    <${tag} class="ventaja"${href}>
      <span class="ventaja-icono">${icono(v.icono)}</span>
      <div class="ventaja-texto"><strong>${esc(v.titulo)}</strong><span>${esc(v.texto)}</span></div>
      ${v.url ? `<span class="ventaja-flecha">${icono('chevronDer')}</span>` : ''}
    </${tag}>`;
    }).join('')}
  </div>
</section>`;
}

/**
 * Cinta de portadas en movimiento continuo. Es decorativa: no lleva enlaces
 * ni texto alternativo, para no duplicar rutas del catálogo ante Google.
 * La lista se emite dos veces seguidas: así el bucle no tiene costura.
 */
export function cintaPortadas(libros, titulo = 'Del fondo editorial') {
  if (libros.length < 4) return '';
  const imagenes = libros
    .map((l) => `<img src="${esc(rutaPortada(l))}" alt="" width="132" height="198" loading="lazy" decoding="async">`)
    .join('');
  return `
<section class="cinta">
  <p class="cinta-titulo">${esc(titulo)}</p>
  <div class="cinta-pista" aria-hidden="true">${imagenes}${imagenes}</div>
</section>`;
}

export function paginaVacia(mensaje) {
  return `<div class="vacio">${icono('busqueda')}<p>${esc(mensaje)}</p></div>`;
}
