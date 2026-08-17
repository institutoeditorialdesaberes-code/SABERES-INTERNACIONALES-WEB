// Utilidades compartidas por todo el generador. Sin dependencias externas.

export function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Calle seguida de su separador, o nada si no hay dirección declarada.
 * Permite dejar `contacto.direccion` vacío y mostrar solo la ciudad, sin que
 * queden comas huérfanas del tipo «con domicilio en , Quito».
 * El separador NO se escapa, para poder pasar `<br>`.
 */
export function calle(cfg, separador = ', ') {
  const via = String(cfg.contacto.direccion || '').trim();
  return via ? `${esc(via)}${separador}` : '';
}

/** Escapa texto que va dentro de un bloque <script type="application/ld+json">. */
export function escJson(data) {
  return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

export function slug(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function money(value, symbol = '$') {
  const n = Number(value || 0);
  return `${symbol}${n.toFixed(2)}`;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function fechaLarga(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function fechaRfc(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

export function recorta(text = '', max = 160) {
  const limpio = String(text).replace(/\s+/g, ' ').trim();
  if (limpio.length <= max) return limpio;
  return `${limpio.slice(0, max - 1).replace(/[\s,;.:]+\S*$/, '')}…`;
}

export function tiempoLectura(texto = '') {
  const palabras = String(texto).trim().split(/\s+/).length;
  return Math.max(1, Math.round(palabras / 200));
}

/**
 * Markdown reducido: encabezados ##/###, negrita, cursiva, enlaces,
 * listas con - o número, citas con > y párrafos. Suficiente para el blog
 * y para las descripciones largas de los libros.
 */
export function markdown(texto = '') {
  const bloques = String(texto).replace(/\r\n/g, '\n').split(/\n{2,}/);
  const salida = [];

  for (const bloqueBruto of bloques) {
    const bloque = bloqueBruto.trim();
    if (!bloque) continue;

    if (/^### /.test(bloque)) {
      salida.push(`<h3>${enlinea(bloque.replace(/^### /, ''))}</h3>`);
      continue;
    }
    if (/^## /.test(bloque)) {
      salida.push(`<h2>${enlinea(bloque.replace(/^## /, ''))}</h2>`);
      continue;
    }
    if (/^>/.test(bloque)) {
      const cita = bloque.split('\n').map((l) => l.replace(/^>\s?/, '')).join(' ');
      salida.push(`<blockquote><p>${enlinea(cita)}</p></blockquote>`);
      continue;
    }
    if (/^\d+\.\s/.test(bloque)) {
      const items = bloque.split('\n')
        .filter((l) => l.trim())
        .map((l) => `<li>${enlinea(l.replace(/^\s*\d+\.\s*/, ''))}</li>`)
        .join('');
      salida.push(`<ol>${items}</ol>`);
      continue;
    }
    if (/^[-*]\s/.test(bloque)) {
      const items = bloque.split('\n')
        .filter((l) => l.trim())
        .map((l) => `<li>${enlinea(l.replace(/^\s*[-*]\s*/, ''))}</li>`)
        .join('');
      salida.push(`<ul>${items}</ul>`);
      continue;
    }
    salida.push(`<p>${enlinea(bloque).replace(/\n/g, '<br>')}</p>`);
  }
  return salida.join('\n');
}

function enlinea(texto) {
  return esc(texto)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
    .replace(/\[(.+?)\]\((\S+?)\)/g, (_m, t, u) => {
      const externo = /^https?:\/\//.test(u);
      const attr = externo ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${u}"${attr}>${t}</a>`;
    });
}

/** Convierte texto plano con saltos dobles en párrafos. */
export function parrafos(texto = '') {
  return String(texto)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join('\n');
}

export function url(base, ruta) {
  const limpio = String(ruta || '/');
  return `${String(base).replace(/\/+$/, '')}${limpio.startsWith('/') ? limpio : `/${limpio}`}`;
}

export function estrellas(valor = 0) {
  const llenas = Math.floor(valor);
  const media = valor - llenas >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i += 1) {
    let clase = 'vacia';
    if (i < llenas) clase = 'llena';
    else if (i === llenas && media) clase = 'media';
    html += `<span class="estrella ${clase}" aria-hidden="true"></span>`;
  }
  return `<span class="estrellas" role="img" aria-label="${valor} de 5 estrellas">${html}</span>`;
}

export function agrupar(lista, clave) {
  const mapa = new Map();
  for (const item of lista) {
    const k = typeof clave === 'function' ? clave(item) : item[clave];
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(item);
  }
  return mapa;
}
