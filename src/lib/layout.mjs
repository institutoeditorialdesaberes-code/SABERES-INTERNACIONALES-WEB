// Estructura común de todas las páginas: <head> con SEO completo,
// cabecera, navegación, pie y datos estructurados.

import { esc, escJson, url, calle } from './utils.mjs';
import { icono, logotipo } from './icons.mjs';

const REDES = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['x', 'X'],
  ['linkedin', 'LinkedIn'],
  ['youtube', 'YouTube'],
  ['tiktok', 'TikTok']
];

export function organizacionLD(cfg) {
  const perfiles = REDES.map(([k]) => cfg.redes[k]).filter(Boolean);
  return {
    '@type': 'Organization',
    '@id': `${cfg.url}/#organizacion`,
    name: cfg.nombreLegal,
    alternateName: cfg.nombre,
    url: `${cfg.url}/`,
    logo: {
      '@type': 'ImageObject',
      url: url(cfg.url, '/assets/img/icono-512.png'),
      width: 512,
      height: 512
    },
    image: url(cfg.url, '/imagenes/marca/logo-saberes.jpg'),
    description: cfg.descripcion,
    foundingDate: cfg.fundacion,
    email: cfg.contacto.email,
    telephone: cfg.contacto.telefono,
    address: {
      '@type': 'PostalAddress',
      /* Calle y código postal solo si están declarados: declarar campos vacíos
         a Google es peor que omitirlos. */
      ...(cfg.contacto.direccion ? { streetAddress: cfg.contacto.direccion } : {}),
      addressLocality: cfg.contacto.ciudad,
      addressRegion: cfg.contacto.provincia,
      ...(cfg.contacto.codigoPostal ? { postalCode: cfg.contacto.codigoPostal } : {}),
      addressCountry: cfg.pais
    },
    ...(perfiles.length ? { sameAs: perfiles } : {})
  };
}

export function sitioLD(cfg) {
  return {
    '@type': 'WebSite',
    '@id': `${cfg.url}/#sitio`,
    name: cfg.nombre,
    url: `${cfg.url}/`,
    inLanguage: cfg.idioma,
    publisher: { '@id': `${cfg.url}/#organizacion` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${cfg.url}/buscar/?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

function migasLD(cfg, migas) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: migas.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.texto,
      item: url(cfg.url, m.url)
    }))
  };
}

function migasHTML(migas) {
  if (!migas || migas.length < 2) return '';
  const items = migas.map((m, i) => {
    const ultimo = i === migas.length - 1;
    return ultimo
      ? `<li aria-current="page">${esc(m.texto)}</li>`
      : `<li><a href="${esc(m.url)}">${esc(m.texto)}</a></li>`;
  }).join('');
  return `<nav class="migas" aria-label="Ruta de navegación"><div class="contenedor"><ol>${items}</ol></div></nav>`;
}

function cabecera(cfg, rutaActual, categorias) {
  const enlaces = cfg.menu.map((m) => {
    const activo = m.url === rutaActual || (m.url !== '/' && rutaActual.startsWith(m.url));
    return `<li><a href="${esc(m.url)}"${activo ? ' class="activo" aria-current="page"' : ''}>${esc(m.texto)}</a></li>`;
  }).join('');

  const menuCategorias = categorias.map((c) => `
        <li><a href="/categoria/${esc(c.id)}/"><span class="punto" style="--c:${esc(c.color)}"></span>${esc(c.nombre)}</a></li>`).join('');

  const wa = `https://wa.me/${esc(cfg.contacto.whatsapp)}?text=${encodeURIComponent(cfg.contacto.whatsappMensaje)}`;

  return `
<header class="cabecera" id="cabecera">
  <div class="barra-superior">
    <div class="contenedor barra-superior-fila">
      <p class="barra-mensaje">${icono('envio')}<span>${esc(cfg.contacto.ciudad)} · ${esc(cfg.contacto.horario)}</span></p>
      <p class="barra-nombre-editorial">${esc(cfg.nombreLegal)}</p>
      <ul class="barra-enlaces">
        <li><a href="tel:${esc(cfg.contacto.telefono.replace(/\s/g, ''))}">${icono('telefono')}<span>${esc(cfg.contacto.telefono)}</span></a></li>
        <li><a href="mailto:${esc(cfg.contacto.email)}">${icono('correo')}<span>${esc(cfg.contacto.email)}</span></a></li>
      </ul>
    </div>
  </div>

  <div class="cabecera-principal">
    <div class="contenedor cabecera-fila">
      <a class="cabecera-logo" href="/" aria-label="${esc(cfg.nombre)} — inicio">${logotipo({ alto: 52, prioridad: true })}</a>

      <form class="buscador" action="/buscar/" method="get" role="search">
        <label class="visualmente-oculto" for="q">Buscar en el catálogo</label>
        <input type="search" id="q" name="q" placeholder="Buscar por título, autor, ISBN o tema…" autocomplete="off" data-buscador>
        <button type="submit" aria-label="Buscar">${icono('busqueda')}</button>
        <div class="sugerencias" data-sugerencias hidden></div>
      </form>

      <div class="cabecera-acciones">
        <a class="boton boton-wa" href="${wa}" target="_blank" rel="noopener">${icono('whatsapp')}<span>Pedidos</span></a>
        <button class="alternar-menu" type="button" data-alternar-menu aria-expanded="false" aria-controls="nav-principal" aria-label="Abrir menú">
          ${icono('menu', 'ico-menu')}${icono('cerrar', 'ico-cerrar')}
        </button>
      </div>
    </div>
  </div>

  <nav class="nav-principal" id="nav-principal" aria-label="Navegación principal">
    <div class="contenedor nav-fila">
      <div class="menu-categorias">
        <button type="button" data-alternar-categorias aria-expanded="false" aria-controls="lista-categorias">
          ${icono('libro')}<span>Categorías</span>${icono('chevronAbajo', 'ico-chevron')}
        </button>
        <ul id="lista-categorias" hidden>${menuCategorias}
        </ul>
      </div>
      <ul class="nav-enlaces">${enlaces}</ul>
    </div>
  </nav>
</header>`;
}

function pie(cfg) {
  const columnas = cfg.footer.columnas.map((col) => `
      <div class="pie-columna">
        <h3>${esc(col.titulo)}</h3>
        <ul>${col.enlaces.map((e) => `<li><a href="${esc(e.url)}">${esc(e.texto)}</a></li>`).join('')}</ul>
      </div>`).join('');

  const redes = REDES
    .filter(([k]) => cfg.redes[k])
    .map(([k, nombre]) => `<a href="${esc(cfg.redes[k])}" target="_blank" rel="noopener" aria-label="${nombre}">${icono(k)}</a>`)
    .join('');

  return `
<footer class="pie">
  <div class="contenedor pie-rejilla">
    <div class="pie-marca">
      <a href="/" aria-label="${esc(cfg.nombre)} — inicio">${logotipo({ alto: 46, clase: 'logo-claro' })}</a>
      <p>${esc(cfg.descripcion)}</p>
      <ul class="pie-datos">
        <li>${icono('ubicacion')}<span>${calle(cfg)}${esc(cfg.contacto.ciudad)} — ${esc(cfg.contacto.provincia)}, Ecuador</span></li>
        <li>${icono('correo')}<a href="mailto:${esc(cfg.contacto.email)}">${esc(cfg.contacto.email)}</a></li>
        <li>${icono('telefono')}<a href="tel:${esc(cfg.contacto.telefono.replace(/\s/g, ''))}">${esc(cfg.contacto.telefono)}</a></li>
        <li>${icono('reloj')}<span>${esc(cfg.contacto.horario)}</span></li>
      </ul>
      ${redes ? `<div class="pie-redes">${redes}</div>` : ''}
    </div>
    ${columnas}
    <div class="pie-columna pie-boletin">
      <h3>Boletín editorial</h3>
      <p>Novedades, convocatorias y notas del oficio. Un correo al mes, sin ruido.</p>
      <form class="formulario-boletin" data-boletin novalidate>
        <label class="visualmente-oculto" for="correo-boletin">Tu correo electrónico</label>
        <input type="email" id="correo-boletin" name="correo" placeholder="tucorreo@ejemplo.com" required>
        <button type="submit" class="boton boton-primario">Suscribirme</button>
        <p class="nota" data-boletin-estado role="status"></p>
      </form>
    </div>
  </div>

  <div class="pie-legal">
    <div class="contenedor pie-legal-fila">
      <p>© ${new Date().getFullYear()} ${esc(cfg.nombreLegal)}. ${esc(cfg.footer.textoLegal)}</p>
      <ul>
        <li><a href="/terminos/">Términos</a></li>
        <li><a href="/privacidad/">Privacidad</a></li>
        <li><a href="/envios/">Envíos</a></li>
        <li><a href="/sitemap.xml">Mapa del sitio</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

/**
 * Arma una página completa.
 * @param {object} o
 * @param {object} o.cfg          configuración del sitio
 * @param {string} o.titulo       título de la pestaña (sin el nombre del sitio)
 * @param {string} o.descripcion  meta description
 * @param {string} o.ruta         ruta canónica, ej. "/libros/"
 * @param {string} [o.imagen]     imagen social absoluta o relativa
 * @param {string} [o.tipo]       og:type
 * @param {Array}  [o.jsonld]     nodos extra de datos estructurados
 * @param {Array}  [o.migas]      migas de pan
 * @param {string} o.cuerpo       HTML del contenido
 */
export function pagina(o) {
  const { cfg, categorias = [] } = o;
  const canonica = url(cfg.url, o.ruta);
  const titulo = o.tituloCompleto
    || (o.ruta === '/' ? cfg.seo.tituloPorDefecto : cfg.seo.plantillaTitulo.replace('%s', o.titulo));
  const imagen = o.imagen
    ? (o.imagen.startsWith('http') ? o.imagen : url(cfg.url, o.imagen))
    : url(cfg.url, '/imagenes/marca/logo-saberes.jpg');

  const grafo = [organizacionLD(cfg), sitioLD(cfg), ...(o.jsonld || [])];
  if (o.migas && o.migas.length > 1) grafo.push(migasLD(cfg, o.migas));

  const analytics = cfg.seo.googleAnalyticsId ? `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${esc(cfg.seo.googleAnalyticsId)}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(cfg.seo.googleAnalyticsId)}');</script>` : '';

  // Cortina de bienvenida: solo en la portada, solo la primera visita de la
  // sesión y solo si el visitante no pidió reducir movimiento. El guion va en
  // línea y antes del cuerpo para que no haya destello de contenido.
  // El sello lleva su tamaño en los propios atributos width/height: si la hoja
  // de estilos no llega a tiempo (caché servida a destiempo, red caída), el SVG
  // se dibuja a 190px en vez de estirarse a todo el ancho de la ventana.
  const cortina = (cfg.animacionEntrada && o.ruta === '/') ? `
<script>try{if(!sessionStorage.getItem('si-bienvenida')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('con-cortina');sessionStorage.setItem('si-bienvenida','1')}}catch(e){}</script>
<div class="cortina" data-cortina aria-hidden="true">
  <svg class="cortina-sello" width="190" height="190" viewBox="0 0 48 48" role="img" aria-label="${esc(cfg.nombre)}">
    <circle class="relleno" cx="24" cy="24" r="21" fill="currentColor"/>
    <circle class="trazo" cx="24" cy="24" r="22.2" pathLength="260"/>
    <circle class="trazo" cx="24" cy="24" r="19.4" pathLength="260"/>
    <path class="trazo" d="M10.5 35.6h27v-4.6h-27z" pathLength="260"/>
    <path class="trazo" d="M12.8 31h22.4v-4.4H12.8z" pathLength="260"/>
    <path class="trazo" d="M15.2 26.6h17.6v-4.4H15.2z" pathLength="260"/>
    <path class="trazo" d="M17.6 22.2h12.8v-4.4H17.6z" pathLength="260"/>
    <path class="trazo" d="M20 17.8h8v-4.6h-8zM24 13.2V7.4l5.6 1.4L24 10.2" pathLength="260"/>
  </svg>
</div>` : '';

  const aviso = cfg.avisoDemo && cfg.avisoDemo.activo ? `
<div class="aviso-demo" data-aviso-demo>
  <div class="contenedor aviso-demo-fila">
    <p>${esc(cfg.avisoDemo.texto)}</p>
    <button type="button" data-cerrar-aviso aria-label="Cerrar aviso">${icono('cerrar')}</button>
  </div>
</div>` : '';

  return `<!doctype html>
<html lang="${esc(cfg.idioma)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(o.descripcion)}">
<link rel="canonical" href="${esc(canonica)}">
${o.noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'}
<meta name="author" content="${esc(cfg.nombreLegal)}">
<meta name="publisher" content="${esc(cfg.nombreLegal)}">
<meta name="keywords" content="${esc((o.palabrasClave || cfg.seo.palabrasClave).join(', '))}">
<meta name="geo.region" content="EC-P">
<meta name="geo.placename" content="Quito">
<meta name="theme-color" content="${esc(cfg.seo.temaColor)}">
${cfg.seo.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(cfg.seo.googleSiteVerification)}">` : ''}

<meta property="og:type" content="${esc(o.tipo || 'website')}">
<meta property="og:site_name" content="${esc(cfg.nombre)}">
<meta property="og:locale" content="${esc(cfg.locale)}">
<meta property="og:title" content="${esc(o.tituloSocial || titulo)}">
<meta property="og:description" content="${esc(o.descripcion)}">
<meta property="og:url" content="${esc(canonica)}">
<meta property="og:image" content="${esc(imagen)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(o.tituloSocial || titulo)}">
<meta name="twitter:card" content="summary_large_image">
${cfg.seo.twitterUser ? `<meta name="twitter:site" content="${esc(cfg.seo.twitterUser)}">` : ''}
<meta name="twitter:title" content="${esc(o.tituloSocial || titulo)}">
<meta name="twitter:description" content="${esc(o.descripcion)}">
<meta name="twitter:image" content="${esc(imagen)}">

<!-- El logo real de la editorial. No declarar aquí /favicon.svg: es un emblema
     sintético y tanto los navegadores como Google lo prefieren al PNG, así que
     acabaría mostrándose en lugar del logo. -->
<link rel="icon" href="/assets/img/icono-192.png" type="image/png" sizes="192x192">
<link rel="icon" href="/assets/img/icono-512.png" type="image/png" sizes="512x512">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="Blog de ${esc(cfg.nombre)}" href="/rss.xml">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="preload" href="/assets/fuentes/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fuentes/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/css/estilos.css?v=${esc(o.version || '')}" as="style">
<link rel="stylesheet" href="/assets/css/estilos.css?v=${esc(o.version || '')}">
${o.extraHead || ''}
<script type="application/ld+json">
${escJson({ '@context': 'https://schema.org', '@graph': grafo })}
</script>${analytics}
</head>
<body class="${esc(o.clase || '')}" data-ruta="${esc(o.ruta)}" data-wa="${esc(cfg.contacto.whatsapp)}">
${cortina}
<a class="saltar" href="#contenido">Saltar al contenido</a>
${aviso}
${cabecera(cfg, o.ruta, categorias)}
${migasHTML(o.migas)}
<main id="contenido">
${o.cuerpo}
</main>
${pie(cfg)}
<a class="wa-flotante" href="https://wa.me/${esc(cfg.contacto.whatsapp)}?text=${encodeURIComponent('Hola, me interesa publicar con Saberes Internacionales.')}" target="_blank" rel="noopener" aria-label="Chatear por WhatsApp">${icono('whatsapp')}<span>¿Publicar un libro?</span></a>
<button class="subir" type="button" data-subir aria-label="Volver arriba">${icono('chevronAbajo', 'ico-subir')}</button>
<script src="/assets/js/sitio.js?v=${esc(o.version || '')}" defer></script>
${o.extraScript || ''}
</body>
</html>`;
}
