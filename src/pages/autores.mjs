import { esc, url } from '../lib/utils.mjs';
import { icono } from '../lib/icons.mjs';
import { tarjetaLibro, tarjetaAutor, rutaRetrato } from '../lib/components.mjs';

export function paginaAutores(ctx) {
  const { cfg, autores } = ctx;
  const cuerpo = `
<section class="portada-seccion con-fondo">
  <img class="portada-fondo" src="/imagenes/portadas/autores.jpg" alt="" aria-hidden="true" loading="eager">
  <div class="contenedor">
    <p class="sobretitulo claro">Comité y colaboradores</p>
    <h1>Autores del sello</h1>
    <p class="bajada">Investigadores, docentes y profesionales que publican con ${esc(cfg.nombreLegal)}. Cada perfil reúne su trayectoria y sus títulos en catálogo.</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor">
    <div class="rejilla-autores amplia">
      ${autores.map((a) => tarjetaAutor(a, ctx)).join('')}
    </div>
  </div>
</section>

<section class="seccion seccion-alterna">
  <div class="contenedor bloque-centrado">
    <h2>¿Quieres publicar con nosotros?</h2>
    <p class="bajada">Recibimos manuscritos originales durante todo el año. El proceso de evaluación es gratuito y termina con un informe escrito, se acepte o no la propuesta.</p>
    <a class="boton boton-primario" href="/publica-con-nosotros/">Conocer el proceso editorial</a>
  </div>
</section>`;

  return {
    ruta: '/autores/',
    titulo: 'Autores',
    descripcion: `Conoce a los ${autores.length} autores que publican con ${cfg.nombreLegal} en Quito: trayectoria académica, especialidad y títulos disponibles en catálogo.`,
    clase: 'p-autores',
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Autores', url: '/autores/' }],
    cuerpo,
    jsonld: [{
      '@type': 'CollectionPage',
      '@id': `${cfg.url}/autores/#pagina`,
      name: 'Autores del sello',
      url: `${cfg.url}/autores/`,
      isPartOf: { '@id': `${cfg.url}/#sitio` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: autores.length,
        itemListElement: autores.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${cfg.url}/autor/${a.id}/`,
          name: a.nombre
        }))
      }
    }]
  };
}

export function paginaAutor(ctx, autor) {
  const { cfg, librosPorAutor, categoriasPorId } = ctx;
  const libros = librosPorAutor.get(autor.id) || [];
  const ruta = `/autor/${autor.id}/`;
  const categoriaPrincipal = libros[0] ? categoriasPorId.get(libros[0].categoria) : null;

  const cuerpo = `
<section class="perfil">
  <div class="contenedor perfil-rejilla">
    <div class="perfil-foto">
      <img src="${esc(rutaRetrato(autor))}" alt="${esc(autor.nombre)}" width="320" height="320" fetchpriority="high" decoding="async">
    </div>
    <div class="perfil-datos">
      <p class="sobretitulo">${esc(autor.especialidad)}</p>
      <h1>${esc(autor.nombre)}</h1>
      <p class="perfil-grado">${icono('birrete')} ${esc(autor.grado)} · ${esc(autor.institucion)}</p>
      <p class="perfil-resumen">${esc(autor.resumen)}</p>
      <ul class="perfil-cifras">
        <li><strong>${libros.length}</strong><span>${libros.length === 1 ? 'título publicado' : 'títulos publicados'}</span></li>
        <li><strong>${autor.aniosExperiencia}</strong><span>años de trayectoria</span></li>
      </ul>
      ${autor.sitioWeb ? `<a class="enlace-flecha" href="${esc(autor.sitioWeb)}" target="_blank" rel="noopener">Sitio personal ${icono('flechaDer')}</a>` : ''}
    </div>
  </div>
</section>

<section class="seccion">
  <div class="contenedor disposicion-perfil">
    <div class="prosa">
      <h2>Trayectoria</h2>
      ${autor.bio.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('')}
    </div>
    <aside class="tarjeta-contacto-autor">
      <h3>Invitaciones y prensa</h3>
      <p>Para entrevistas, presentaciones o conferencias con ${esc(autor.nombre.split(' ')[0])}, escribe al equipo editorial.</p>
      <a class="boton boton-primario ancho" href="/contacto/?autor=${esc(autor.id)}">${icono('correo')}<span>Escribir a la editorial</span></a>
    </aside>
  </div>
</section>

${libros.length ? `
<section class="seccion seccion-alterna">
  <div class="contenedor">
    <h2 class="titulo-bloque">Títulos de ${esc(autor.nombre)}</h2>
    <div class="rejilla-libros">${libros.map((l, i) => tarjetaLibro(l, ctx, { prioridad: i < 4 })).join('')}</div>
  </div>
</section>` : ''}`;

  return {
    ruta,
    titulo: `${autor.nombre} — ${autor.especialidad}`,
    descripcion: `${autor.resumen} ${libros.length} ${libros.length === 1 ? 'título publicado' : 'títulos publicados'} con ${cfg.nombreLegal}.`,
    palabrasClave: [autor.nombre, autor.especialidad, 'autor', 'Ecuador', categoriaPrincipal?.nombre].filter(Boolean),
    imagen: /\.(png|jpe?g|webp)$/i.test(rutaRetrato(autor)) ? rutaRetrato(autor) : undefined,
    tipo: 'profile',
    clase: 'p-autor',
    /* Mismo criterio que los libros demo: visibles en el sitio, pero no se
       ofrecen a Google mientras no sean autores reales. */
    noindex: !!autor.demo,
    migas: [
      { texto: 'Inicio', url: '/' },
      { texto: 'Autores', url: '/autores/' },
      { texto: autor.nombre, url: ruta }
    ],
    cuerpo,
    jsonld: [{
      '@type': 'ProfilePage',
      '@id': `${url(cfg.url, ruta)}#pagina`,
      url: url(cfg.url, ruta),
      isPartOf: { '@id': `${cfg.url}/#sitio` },
      mainEntity: {
        '@type': 'Person',
        '@id': `${url(cfg.url, ruta)}#persona`,
        name: autor.nombre,
        url: url(cfg.url, ruta),
        image: url(cfg.url, rutaRetrato(autor)),
        description: autor.resumen,
        jobTitle: autor.especialidad,
        knowsAbout: autor.especialidad,
        nationality: autor.pais,
        affiliation: { '@type': 'Organization', name: autor.institucion },
        worksFor: { '@id': `${cfg.url}/#organizacion` },
        ...(autor.sitioWeb ? { sameAs: [autor.sitioWeb] } : {})
      }
    }]
  };
}
