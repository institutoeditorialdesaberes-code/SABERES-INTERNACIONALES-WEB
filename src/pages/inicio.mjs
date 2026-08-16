import { esc, money, recorta } from '../lib/utils.mjs';
import { icono } from '../lib/icons.mjs';
import {
  tarjetaLibro, tarjetaAutor, tarjetaEntrada, tarjetaCategoria,
  encabezadoSeccion, carrusel, bandaCTA, ventajas, rutaPortada, enlaceWhatsApp,
  cintaPortadas
} from '../lib/components.mjs';

export function paginaInicio(ctx) {
  const { cfg, libros, autores, categorias, posts, librosPorCategoria, autoresPorId } = ctx;

  const destacados = libros.filter((l) => l.esDestacado);
  const novedades = [...libros].filter((l) => l.esNuevo).sort((a, b) => b.anio - a.anio);
  const populares = [...libros].sort((a, b) => b.resenas - a.resenas).slice(0, 8);
  const principal = destacados[0] || libros[0];
  const autorPrincipal = autoresPorId.get(principal.autorId);

  const diapositivas = cfg.hero.map((h, i) => `
      <div class="diapositiva tema-${esc(h.tema)}" data-diapositiva ${i === 0 ? 'data-activa' : ''} role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${cfg.hero.length}">
        <img class="diapositiva-fondo" src="/imagenes/hero/slide-${esc(h.tema)}.jpg" alt="" width="1600" height="900" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        <div class="diapositiva-texto">
          <p class="sobretitulo claro">${esc(cfg.lema)} · ${esc(cfg.contacto.ciudad)}</p>
          ${i === 0
            ? `<h1>${esc(h.titulo)}</h1>`
            : `<p class="titulo-diapositiva">${esc(h.titulo)}</p>`}
          <p class="bajada">${esc(h.texto)}</p>
          <div class="hero-acciones">
            <a class="boton boton-primario" href="${esc(h.url)}">${esc(h.boton)}</a>
            <a class="boton boton-fantasma" href="/contacto/">Hablar con el equipo</a>
          </div>
        </div>
      </div>`).join('');

  const puntos = cfg.hero.map((_, i) => `<button type="button" data-punto="${i}" class="${i === 0 ? 'activo' : ''}" aria-label="Ir a la diapositiva ${i + 1}"></button>`).join('');

  const cuerpo = `
<section class="hero">
  <div class="contenedor hero-rejilla">
    <div class="hero-carrusel" data-hero>
      <div class="hero-sello" aria-hidden="true">
        <img src="/imagenes/marca/logo-saberes.jpg" alt="" width="80" height="80" loading="eager" decoding="async">
      </div>
      ${diapositivas}
      <div class="hero-controles">
        <div class="hero-puntos" role="tablist" aria-label="Diapositivas">${puntos}</div>
        <div class="hero-flechas">
          <button type="button" data-hero-izq aria-label="Anterior">${icono('flechaIzq')}</button>
          <button type="button" data-hero-der aria-label="Siguiente">${icono('flechaDer')}</button>
        </div>
      </div>
    </div>

    <aside class="hero-destacado" aria-label="Título destacado">
      <p class="etiqueta">${esc(principal.insignia || 'Título destacado')}</p>
      <a href="/libro/${esc(principal.id)}/" class="hero-portada">
        <img src="${esc(rutaPortada(principal))}" alt="Portada de ${esc(principal.titulo)}" width="400" height="600" fetchpriority="high" decoding="async">
      </a>
      <h2><a href="/libro/${esc(principal.id)}/">${esc(principal.titulo)}</a></h2>
      <p class="hero-autor">${esc(autorPrincipal ? autorPrincipal.nombre : '')}</p>
      <p class="hero-resumen">${esc(recorta(principal.resumen, 110))}</p>
      <p class="hero-precio">${money(principal.precio, cfg.simboloMoneda)}</p>
      <a class="boton boton-wa ancho" href="${esc(enlaceWhatsApp(cfg, principal))}" target="_blank" rel="noopener">${icono('whatsapp')}<span>Pedir por WhatsApp</span></a>
      <a class="enlace-flecha" href="/libro/${esc(principal.id)}/">Ver ficha completa ${icono('flechaDer')}</a>
    </aside>
  </div>
</section>

${ventajas(cfg, ctx)}

<section class="seccion">
  <div class="contenedor">
    ${encabezadoSeccion({
      sobretitulo: 'Fondo editorial',
      titulo: 'Explora por área de conocimiento',
      texto: 'Seis líneas de publicación que ordenan todo nuestro catálogo.',
      enlace: '/libros/',
      textoEnlace: 'Ver catálogo completo'
    })}
    <div class="rejilla-categorias">
      ${categorias.map((c) => tarjetaCategoria(c, (librosPorCategoria.get(c.id) || []).length, ctx)).join('')}
    </div>
  </div>
</section>

<section class="seccion seccion-alterna">
  <div class="contenedor">
    ${encabezadoSeccion({
      sobretitulo: 'Selección del comité',
      titulo: 'Títulos destacados',
      texto: 'Las obras que mejor representan el criterio editorial de la casa.',
      enlace: '/libros/',
      textoEnlace: 'Ver todos'
    })}
    ${carrusel('carrusel-destacados', destacados.map((l, i) => tarjetaLibro(l, ctx, { prioridad: i < 2 })).join(''))}
  </div>
</section>

<section class="franja-editorial">
  <img class="franja-editorial-fondo" src="/imagenes/secciones/franja-editorial.jpg" alt="" width="1600" height="900" loading="lazy" decoding="async">
  <div class="contenedor franja-rejilla">
    <div>
      <p class="sobretitulo claro">Quiénes somos</p>
      <h2>Una editorial académica hecha desde Quito para la región</h2>
      <p>Trabajamos con un comité de lectores especializados, correctores profesionales y diseñadores editoriales. Cada manuscrito pasa por evaluación, edición, corrección de estilo, maquetación y corrección de pruebas antes de llegar a imprenta.</p>
      <p>Acompañamos al autor en el registro de ISBN y depósito legal, y en la puesta del título en canales de venta físicos y digitales.</p>
      <a class="boton boton-primario" href="/nosotros/">Conocer la editorial</a>
    </div>
    <ul class="cifras">
      <li><strong>${libros.length}</strong><span>títulos publicados</span></li>
      <li><strong>${autores.length}</strong><span>autores del sello</span></li>
      <li><strong>${categorias.length}</strong><span>colecciones activas</span></li>
      <li><strong>${new Date().getFullYear() - Number(cfg.fundacion)}</strong><span>años de trabajo editorial</span></li>
    </ul>
  </div>
</section>

<section class="seccion">
  <div class="contenedor">
    ${encabezadoSeccion({
      sobretitulo: 'Recién publicados',
      titulo: 'Novedades del sello',
      texto: 'Los últimos títulos incorporados al catálogo.',
      enlace: '/novedades/',
      textoEnlace: 'Ver novedades'
    })}
    ${carrusel('carrusel-novedades', novedades.map((l) => tarjetaLibro(l, ctx)).join(''))}
  </div>
</section>

${cintaPortadas(libros, `${libros.length} títulos en catálogo`)}

${bandaCTA(cfg)}

<section class="seccion testimonios-seccion">
  <div class="contenedor">
    <div class="testimonios-cabecera">
      <p class="sobretitulo">Voces del sello</p>
      <h2>Lo que dicen quienes publican con nosotros</h2>
      <p class="bajada">Autores que confiaron en el proceso editorial de Saberes Internacionales.</p>
    </div>
    <div class="testimonios-rejilla">
      <article class="testimonio-card" data-revelar>
        <div class="testimonio-header">
          <div class="testimonio-avatar" style="--av-color:#1a3a6b">LS</div>
          <div>
            <strong>Mg. Laura Sánchez</strong>
            <span>Docente universitaria · Quito</span>
          </div>
          <div class="testimonio-estrellas">${'<span class="estrella llena"></span>'.repeat(5)}</div>
        </div>
        <blockquote>
          <p>Encontré en la editorial un equipo que tomó mi manuscrito en serio desde la primera lectura. El proceso fue riguroso, el acompañamiento constante y el resultado superó mis expectativas. Mi libro llegó a manos de docentes de todo el país en menos de tres meses.</p>
        </blockquote>
        <footer class="testimonio-libro">
          ${icono('libro')}<span>Educación para el Futuro</span>
        </footer>
      </article>
      <article class="testimonio-card" data-revelar>
        <div class="testimonio-header">
          <div class="testimonio-avatar" style="--av-color:#0f4c75">AG</div>
          <div>
            <strong>Dr. Andrés Guerrero</strong>
            <span>Consultor de liderazgo · Guayaquil</span>
          </div>
          <div class="testimonio-estrellas">${'<span class="estrella llena"></span>'.repeat(5)}</div>
        </div>
        <blockquote>
          <p>Publiqué mi segundo libro con Saberes Internacionales después de una experiencia positiva con el primero. El equipo de corrección de estilo entiende la diferencia entre un texto académico y uno de divulgación, y ajusta su trabajo según el propósito de la obra. Eso vale mucho.</p>
        </blockquote>
        <footer class="testimonio-libro">
          ${icono('libro')}<span>Liderazgo Sin Fronteras</span>
        </footer>
      </article>
      <article class="testimonio-card" data-revelar>
        <div class="testimonio-header">
          <div class="testimonio-avatar" style="--av-color:#1b4332">AT</div>
          <div>
            <strong>Dra. Ana Torres</strong>
            <span>Filósofa e investigadora · Loja</span>
          </div>
          <div class="testimonio-estrellas">${'<span class="estrella llena"></span>'.repeat(5)}</div>
        </div>
        <blockquote>
          <p>Lo que más valoro es que nunca sentí que mi libro era uno más en una fila de producción. Desde el diseño de portada hasta el ISBN, cada etapa tuvo atención real. Ahora mi trabajo está en las bibliotecas universitarias que siempre soñé y eso se lo debo al respaldo de la editorial.</p>
        </blockquote>
        <footer class="testimonio-libro">
          ${icono('libro')}<span>Sabiduría Ancestral</span>
        </footer>
      </article>
      <article class="testimonio-card" data-revelar>
        <div class="testimonio-header">
          <div class="testimonio-avatar" style="--av-color:#6d2f0d">DS</div>
          <div>
            <strong>Mg. David Salazar</strong>
            <span>Consultor TI · Cuenca</span>
          </div>
          <div class="testimonio-estrellas">${'<span class="estrella llena"></span>'.repeat(5)}</div>
        </div>
        <blockquote>
          <p>Venía de dos rechazos en otras editoriales. Aquí me dieron una evaluación escrita con criterios claros, me acompañaron en la revisión y publicamos en el tiempo acordado. La distribución digital fue un plus que no esperaba. Recomiendo el proceso sin dudarlo.</p>
        </blockquote>
        <footer class="testimonio-libro">
          ${icono('libro')}<span>Transformación Digital</span>
        </footer>
      </article>
    </div>
    <div class="testimonios-cta">
      <a class="boton boton-primario" href="/publica-con-nosotros/">${icono('pluma')}<span>Publicar con nosotros</span></a>
      <a class="boton boton-fantasma" href="/contacto/">${icono('correo')}<span>Consultar el proceso</span></a>
    </div>
  </div>
</section>

<section class="seccion seccion-alterna">
  <div class="contenedor">
    ${encabezadoSeccion({
      sobretitulo: 'Los más pedidos',
      titulo: 'Más vendidos',
      texto: 'Ordenados por número de reseñas de nuestros lectores.',
      enlace: '/libros/?orden=populares',
      textoEnlace: 'Ver ranking'
    })}
    ${carrusel('carrusel-populares', populares.map((l) => tarjetaLibro(l, ctx)).join(''))}
  </div>
</section>

<section class="seccion">
  <div class="contenedor">
    ${encabezadoSeccion({
      sobretitulo: 'Equipo editorial',
      titulo: 'Nuestros autores',
      texto: 'Investigadores y profesionales que publican con el sello.',
      enlace: '/autores/',
      textoEnlace: 'Ver todos los autores'
    })}
    <div class="rejilla-autores">
      ${autores.slice(0, 4).map((a) => tarjetaAutor(a, ctx)).join('')}
    </div>
  </div>
</section>

<section class="seccion seccion-alterna">
  <div class="contenedor">
    ${encabezadoSeccion({
      sobretitulo: 'Blog',
      titulo: 'Del oficio editorial',
      texto: 'Guías prácticas sobre publicación, escritura académica y producción de libros.',
      enlace: '/blog/',
      textoEnlace: 'Ver el blog'
    })}
    <div class="rejilla-entradas">
      ${posts.slice(0, 3).map((p) => tarjetaEntrada(p, ctx)).join('')}
    </div>
  </div>
</section>`;

  return {
    ruta: '/',
    titulo: 'Inicio',
    descripcion: `${cfg.descripcion} Catálogo de ${libros.length} títulos, envíos a todo el Ecuador y convocatoria abierta para nuevos manuscritos.`,
    clase: 'p-inicio',
    cuerpo,
    jsonld: [
      {
        '@type': 'CollectionPage',
        '@id': `${cfg.url}/#inicio`,
        url: `${cfg.url}/`,
        name: cfg.seo.tituloPorDefecto,
        isPartOf: { '@id': `${cfg.url}/#sitio` },
        about: { '@id': `${cfg.url}/#organizacion` }
      },
      {
        '@type': 'ItemList',
        name: 'Títulos destacados',
        itemListElement: destacados.slice(0, 10).map((l, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${cfg.url}/libro/${l.id}/`,
          name: l.titulo
        }))
      }
    ]
  };
}
