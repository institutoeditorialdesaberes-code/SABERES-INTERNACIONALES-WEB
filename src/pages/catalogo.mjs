import { esc } from '../lib/utils.mjs';
import { icono } from '../lib/icons.mjs';
import { tarjetaLibro, paginaVacia } from '../lib/components.mjs';

function panelFiltros(ctx, categoriaFija) {
  const { categorias, librosPorCategoria } = ctx;
  const casillas = categorias.map((c) => `
      <li>
        <label class="casilla">
          <input type="checkbox" name="categoria" value="${esc(c.id)}"${categoriaFija === c.id ? ' checked' : ''}>
          <span class="punto" style="--c:${esc(c.color)}"></span>
          <span>${esc(c.nombre)}</span>
          <em>${(librosPorCategoria.get(c.id) || []).length}</em>
        </label>
      </li>`).join('');

  return `
<aside class="filtros" aria-label="Filtros del catálogo">
  <button class="filtros-alternar" type="button" data-alternar-filtros aria-expanded="false" aria-controls="panel-filtros">
    ${icono('menu')}<span>Filtrar y ordenar</span>
  </button>
  <form class="filtros-panel" id="panel-filtros" data-filtros>
    <fieldset>
      <legend>Categoría</legend>
      <ul class="lista-casillas">${casillas}</ul>
    </fieldset>

    <fieldset>
      <legend>Precio máximo</legend>
      <div class="rango">
        <input type="range" name="precio" min="0" max="40" step="1" value="40" data-rango-precio>
        <output data-salida-precio>Sin límite</output>
      </div>
    </fieldset>

    <fieldset>
      <legend>Disponibilidad</legend>
      <ul class="lista-casillas">
        <li><label class="casilla"><input type="checkbox" name="estado" value="disponible"><span>Disponible</span></label></li>
        <li><label class="casilla"><input type="checkbox" name="estado" value="preventa"><span>En preventa</span></label></li>
        <li><label class="casilla"><input type="checkbox" name="nuevo" value="1"><span>Solo novedades</span></label></li>
      </ul>
    </fieldset>

    <button type="button" class="boton boton-fantasma ancho" data-limpiar-filtros>Limpiar filtros</button>
  </form>
</aside>`;
}

function barraOrden(total) {
  return `
<div class="barra-orden">
  <p class="conteo"><strong data-conteo>${total}</strong> <span>${total === 1 ? 'título' : 'títulos'}</span></p>
  <label class="selector">
    <span>Ordenar por</span>
    <select data-orden>
      <option value="relevancia">Relevancia</option>
      <option value="novedades">Más recientes</option>
      <option value="populares">Más vendidos</option>
      <option value="precio-asc">Precio: menor a mayor</option>
      <option value="precio-desc">Precio: mayor a menor</option>
      <option value="titulo">Título A-Z</option>
    </select>
  </label>
</div>`;
}

function listadoLD(cfg, libros, nombre, ruta) {
  return {
    '@type': 'CollectionPage',
    '@id': `${cfg.url}${ruta}#pagina`,
    url: `${cfg.url}${ruta}`,
    name: nombre,
    isPartOf: { '@id': `${cfg.url}/#sitio` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: libros.length,
      itemListElement: libros.map((l, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${cfg.url}/libro/${l.id}/`,
        name: l.titulo
      }))
    }
  };
}

export function paginaLibros(ctx) {
  const { cfg, libros } = ctx;
  const cuerpo = `
<section class="portada-seccion">
  <div class="contenedor">
    <p class="sobretitulo claro">Fondo editorial</p>
    <h1>Catálogo completo</h1>
    <p class="bajada">${libros.length} títulos publicados por ${esc(cfg.nombreLegal)}. Filtra por categoría, precio o disponibilidad; el pedido se cierra por WhatsApp con el equipo.</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor disposicion-catalogo">
    ${panelFiltros(ctx, null)}
    <div class="resultados">
      ${barraOrden(libros.length)}
      <div class="rejilla-libros" data-rejilla>
        ${libros.map((l, i) => tarjetaLibro(l, ctx, { prioridad: i < 4 })).join('')}
      </div>
      <div class="vacio" data-sin-resultados hidden>${paginaVacia('Ningún título coincide con los filtros seleccionados.')}</div>
    </div>
  </div>
</section>`;

  return {
    ruta: '/libros/',
    titulo: 'Catálogo de libros',
    descripcion: `Catálogo completo de ${cfg.nombreLegal}: ${libros.length} títulos académicos y de divulgación en educación, humanidades, negocios, ciencia y derecho. Envíos desde Quito a todo el Ecuador.`,
    clase: 'p-catalogo',
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Catálogo', url: '/libros/' }],
    cuerpo,
    jsonld: [listadoLD(cfg, libros, 'Catálogo completo', '/libros/')]
  };
}

export function paginaCategoria(ctx, categoria) {
  const { cfg, librosPorCategoria } = ctx;
  const libros = librosPorCategoria.get(categoria.id) || [];
  const ruta = `/categoria/${categoria.id}/`;

  const imagen = ctx.imagenesCategorias && ctx.imagenesCategorias.get(categoria.id);

  const cuerpo = `
<section class="portada-seccion${imagen ? ' con-fondo' : ''}" style="--c:${esc(categoria.color)}">
  ${imagen ? `<img class="portada-fondo" src="${esc(imagen)}" alt="" width="690" height="276" fetchpriority="high" decoding="async">` : ''}
  <div class="contenedor">
    <p class="sobretitulo claro">${icono(categoria.icono)} Colección</p>
    <h1>${esc(categoria.nombre)}</h1>
    <p class="bajada">${esc(categoria.descripcion)}</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor disposicion-catalogo">
    ${panelFiltros(ctx, categoria.id)}
    <div class="resultados">
      ${barraOrden(libros.length)}
      <div class="rejilla-libros" data-rejilla>
        ${libros.length ? libros.map((l, i) => tarjetaLibro(l, ctx, { prioridad: i < 4 })).join('') : ''}
      </div>
      ${libros.length ? '' : paginaVacia('Todavía no hay títulos publicados en esta colección.')}
      <div class="vacio" data-sin-resultados hidden>${paginaVacia('Ningún título coincide con los filtros seleccionados.')}</div>
    </div>
  </div>
</section>`;

  return {
    ruta,
    titulo: `${categoria.nombre} — Libros`,
    descripcion: `${categoria.descripcion} ${libros.length} ${libros.length === 1 ? 'título disponible' : 'títulos disponibles'} en ${cfg.nombreLegal}, Quito.`,
    clase: 'p-catalogo',
    migas: [
      { texto: 'Inicio', url: '/' },
      { texto: 'Catálogo', url: '/libros/' },
      { texto: categoria.nombre, url: ruta }
    ],
    cuerpo,
    jsonld: [listadoLD(cfg, libros, categoria.nombre, ruta)]
  };
}

export function paginaNovedades(ctx) {
  const { cfg, libros } = ctx;
  const novedades = libros
    .filter((l) => l.esNuevo)
    .sort((a, b) => b.anio - a.anio || a.titulo.localeCompare(b.titulo, 'es'));
  const preventa = libros.filter((l) => l.disponibilidad === 'preventa');

  const cuerpo = `
<section class="portada-seccion">
  <div class="contenedor">
    <p class="sobretitulo claro">Actualizado permanentemente</p>
    <h1>Novedades editoriales</h1>
    <p class="bajada">Los títulos incorporados más recientemente al fondo de ${esc(cfg.nombre)}, incluidos los que están en preventa.</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor">
    <h2 class="titulo-bloque">Recién publicados</h2>
    <div class="rejilla-libros">
      ${novedades.length ? novedades.map((l, i) => tarjetaLibro(l, ctx, { prioridad: i < 4 })).join('') : paginaVacia('Aún no hay novedades cargadas.')}
    </div>
  </div>
</section>

${preventa.length ? `
<section class="seccion seccion-alterna">
  <div class="contenedor">
    <h2 class="titulo-bloque">En preventa</h2>
    <p class="bajada">Reserva tu ejemplar antes de que salga de imprenta.</p>
    <div class="rejilla-libros">${preventa.map((l) => tarjetaLibro(l, ctx)).join('')}</div>
  </div>
</section>` : ''}`;

  return {
    ruta: '/novedades/',
    titulo: 'Novedades',
    descripcion: `Últimos lanzamientos de ${cfg.nombreLegal}: ${novedades.length} novedades y ${preventa.length} títulos en preventa. Reserva desde Quito con envío a todo el Ecuador.`,
    clase: 'p-catalogo',
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Novedades', url: '/novedades/' }],
    cuerpo,
    jsonld: [listadoLD(cfg, novedades, 'Novedades editoriales', '/novedades/')]
  };
}
