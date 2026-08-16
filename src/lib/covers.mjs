// Generación de imágenes vectoriales: portadas de libros, retratos de autor
// y texturas decorativas. Todo se calcula a partir de los datos del catálogo,
// así que un libro nuevo tiene portada presentable desde el primer minuto.
//
// Si el libro trae el campo "portada" con la ruta de una imagen real,
// el generador usa esa imagen y esta portada sintética no se emite.

import { esc } from './utils.mjs';

const PALETAS = {
  'desarrollo-personal': { fondo: '#7a4a1f', tinta: '#fdf6ec', realce: '#e0a960' },
  'ciencia-tecnologia': { fondo: '#13565e', tinta: '#eefafa', realce: '#5fc6c9' },
  educacion: { fondo: '#24512f', tinta: '#f0f7f0', realce: '#7ab77f' },
  negocios: { fondo: '#0e2a47', tinta: '#eef4fb', realce: '#6ea3d8' },
  literatura: { fondo: '#5a1c2c', tinta: '#fbf0f2', realce: '#c78b98' },
  derecho: { fondo: '#312b52', tinta: '#f2f0fb', realce: '#9a92cf' },
  _defecto: { fondo: '#1f2a37', tinta: '#f4f6f8', realce: '#93a4b8' }
};

export function paletaDe(categoriaId) {
  return PALETAS[categoriaId] || PALETAS._defecto;
}

/** Corte de línea aproximado: la fuente serif ocupa ~0.52em por carácter. */
function repartirLineas(texto, maxCaracteres) {
  const palabras = String(texto).split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = '';
  for (const palabra of palabras) {
    const tentativa = actual ? `${actual} ${palabra}` : palabra;
    if (tentativa.length > maxCaracteres && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = tentativa;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/**
 * Portada 400 x 600 con lomo, filete, colección, título, autor y sello.
 */
export function portadaSVG(libro, autorNombre = '') {
  const p = paletaDe(libro.categoria);
  const titulo = String(libro.titulo || '').toUpperCase();
  const lineas = repartirLineas(titulo, titulo.length > 34 ? 16 : 13);
  const tamano = lineas.length > 4 ? 30 : lineas.length > 3 ? 34 : lineas.length > 2 ? 39 : 44;
  const alturaLinea = tamano * 1.16;
  const inicioY = 268 - ((lineas.length - 1) * alturaLinea) / 2;

  const tspans = lineas
    .map((l, i) => `<tspan x="200" y="${(inicioY + i * alturaLinea).toFixed(1)}">${esc(l)}</tspan>`)
    .join('');

  const coleccion = esc(String(libro.coleccion || 'Saberes Internacionales').toUpperCase());
  const autor = esc(String(autorNombre || '').toUpperCase());

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600" role="img" aria-label="Portada de ${esc(libro.titulo)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${p.fondo}"/>
      <stop offset="1" stop-color="${mezclar(p.fondo, '#000000', 0.35)}"/>
    </linearGradient>
    <linearGradient id="lomo" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".35"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <pattern id="trama" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 0v26" stroke="${p.tinta}" stroke-opacity=".05" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="400" height="600" fill="url(#g)"/>
  <rect width="400" height="600" fill="url(#trama)"/>
  <rect width="26" height="600" fill="url(#lomo)"/>

  <rect x="34" y="34" width="332" height="532" fill="none" stroke="${p.realce}" stroke-opacity=".55" stroke-width="1.2"/>
  <rect x="40" y="40" width="320" height="520" fill="none" stroke="${p.realce}" stroke-opacity=".25" stroke-width="0.8"/>

  <text x="200" y="96" text-anchor="middle" fill="${p.realce}"
        font-family="Georgia, 'Times New Roman', serif" font-size="13" letter-spacing="4.2">${coleccion}</text>
  <path d="M150 116h100" stroke="${p.realce}" stroke-opacity=".7" stroke-width="1"/>

  <text text-anchor="middle" fill="${p.tinta}" font-family="Georgia, 'Times New Roman', serif"
        font-size="${tamano}" letter-spacing="1.2">${tspans}</text>

  <path d="M170 ${(inicioY + lineas.length * alturaLinea + 16).toFixed(1)}h60" stroke="${p.realce}" stroke-width="2"/>

  <text x="200" y="486" text-anchor="middle" fill="${p.tinta}" fill-opacity=".82"
        font-family="Georgia, 'Times New Roman', serif" font-size="16" letter-spacing="2.4">${autor}</text>

  <g transform="translate(200 532)">
    <circle r="21" fill="none" stroke="${p.realce}" stroke-opacity=".6" stroke-width="1"/>
    <path d="M0-11c-2.6 1.7-5.4 2.4-8.6 2.4v9.2c0 4.4 3.5 7.5 8.6 8.9 5.1-1.4 8.6-4.5 8.6-8.9v-9.2C5.4-8.6 2.6-9.3 0-11z"
          fill="none" stroke="${p.tinta}" stroke-opacity=".8" stroke-width="1.4" stroke-linejoin="round"/>
  </g>
</svg>`;
}

/** Retrato tipográfico del autor: monograma sobre fondo de la especialidad. */
export function retratoSVG(autor, categoriaId = '_defecto') {
  const p = paletaDe(categoriaId);
  const iniciales = esc(autor.iniciales || (autor.nombre || '?').slice(0, 2).toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320" role="img" aria-label="${esc(autor.nombre)}">
  <defs>
    <linearGradient id="ga" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.fondo}"/>
      <stop offset="1" stop-color="${mezclar(p.fondo, '#000000', 0.4)}"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" fill="url(#ga)"/>
  <circle cx="160" cy="160" r="118" fill="none" stroke="${p.realce}" stroke-opacity=".35" stroke-width="1.2"/>
  <circle cx="160" cy="160" r="104" fill="none" stroke="${p.realce}" stroke-opacity=".18" stroke-width="1"/>
  <text x="160" y="160" text-anchor="middle" dominant-baseline="central" fill="${p.tinta}"
        font-family="Georgia, 'Times New Roman', serif" font-size="96" letter-spacing="4">${iniciales}</text>
</svg>`;
}

/** Cabecera decorativa para artículos del blog. */
export function bannerSVG(titulo, categoriaId = '_defecto') {
  const p = paletaDe(categoriaId);
  const lineas = repartirLineas(String(titulo), 30).slice(0, 3);
  const tspans = lineas
    .map((l, i) => `<tspan x="60" y="${170 + i * 46}">${esc(l)}</tspan>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 480" width="1200" height="480" role="img" aria-label="${esc(titulo)}">
  <defs>
    <linearGradient id="gb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.fondo}"/>
      <stop offset="1" stop-color="${mezclar(p.fondo, '#000000', 0.45)}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="480" fill="url(#gb)"/>
  <g stroke="${p.realce}" stroke-opacity=".18" fill="none">
    <circle cx="1040" cy="120" r="180"/><circle cx="1040" cy="120" r="130"/><circle cx="1040" cy="120" r="80"/>
  </g>
  <path d="M60 100h90" stroke="${p.realce}" stroke-width="3"/>
  <text fill="${p.tinta}" font-family="Georgia, 'Times New Roman', serif" font-size="40">${tspans}</text>
</svg>`;
}

/** Textura de fondo reutilizable para secciones oscuras. */
export function tramaSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <g fill="none" stroke="#ffffff" stroke-opacity=".05" stroke-width="1">
    <path d="M0 60h120M60 0v120"/><circle cx="60" cy="60" r="34"/><circle cx="60" cy="60" r="18"/>
  </g>
</svg>`;
}

function mezclar(hexA, hexB, cantidad) {
  const a = aRgb(hexA);
  const b = aRgb(hexB);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * cantidad));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function aRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
