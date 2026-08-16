// Iconografía en SVG en línea. Trazo uniforme de 1.6 para que todo el
// sistema visual se vea coherente. Ningún icono depende de una fuente externa.

const T = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const TRAZOS = {
  busqueda: `<circle cx="11" cy="11" r="6.5" ${T}/><path d="m16 16 4.5 4.5" ${T}/>`,
  menu: `<path d="M3.5 7h17M3.5 12h17M3.5 17h17" ${T}/>`,
  cerrar: `<path d="m6 6 12 12M18 6 6 18" ${T}/>`,
  flechaDer: `<path d="M5 12h13m-5.5-5.5L18 12l-5.5 5.5" ${T}/>`,
  flechaIzq: `<path d="M19 12H6m5.5-5.5L6 12l5.5 5.5" ${T}/>`,
  chevronDer: `<path d="m9 5 7 7-7 7" ${T}/>`,
  chevronAbajo: `<path d="m5 9 7 7 7-7" ${T}/>`,
  libro: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" ${T}/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5z" ${T}/>`,
  whatsapp: `<path d="M20 11.7a8 8 0 0 1-11.9 7L4 20l1.4-4A8 8 0 1 1 20 11.7z" ${T}/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1l-1.4-.7-1 .8a5 5 0 0 1-2.2-2.2l.8-1-.7-1.4c-.5 0-1 .4-1 1z" ${T}/>`,
  correo: `<rect x="3" y="5" width="18" height="14" rx="2.5" ${T}/><path d="m4 7.5 8 5 8-5" ${T}/>`,
  telefono: `<path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3 6.2 2 2 0 0 1 5 4z" ${T}/>`,
  ubicacion: `<path d="M12 21s6.5-5.6 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 15.4 12 21 12 21z" ${T}/><circle cx="12" cy="10.4" r="2.4" ${T}/>`,
  reloj: `<circle cx="12" cy="12" r="8.5" ${T}/><path d="M12 7.5V12l3 2" ${T}/>`,
  envio: `<path d="M3 7h10v9H3zM13 10h4l3 3v3h-7z" ${T}/><circle cx="7" cy="18" r="1.8" ${T}/><circle cx="17" cy="18" r="1.8" ${T}/>`,
  sello: `<circle cx="12" cy="10" r="5.5" ${T}/><path d="m9 14.5-1 6.5 4-2 4 2-1-6.5" ${T}/>`,
  pares: `<circle cx="9" cy="9" r="3" ${T}/><circle cx="17" cy="11" r="2.4" ${T}/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M15 19a4 4 0 0 1 5.5-3.7" ${T}/>`,
  soporte: `<path d="M5 13a7 7 0 0 1 14 0" ${T}/><rect x="3" y="13" width="3.5" height="6" rx="1.6" ${T}/><rect x="17.5" y="13" width="3.5" height="6" rx="1.6" ${T}/>`,
  brote: `<path d="M12 21v-7" ${T}/><path d="M12 14c0-3-2-5-5-5 0 3 2 5 5 5z" ${T}/><path d="M12 14c0-4 2.5-6.5 6-6.5 0 4-2.5 6.5-6 6.5z" ${T}/>`,
  circuito: `<circle cx="7" cy="7" r="2" ${T}/><circle cx="17" cy="17" r="2" ${T}/><path d="M9 7h6a2 2 0 0 1 2 2v6M7 9v6a2 2 0 0 0 2 2h4" ${T}/>`,
  birrete: `<path d="m3 9 9-4 9 4-9 4z" ${T}/><path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" ${T}/>`,
  grafico: `<path d="M4 20V4M4 20h16" ${T}/><path d="M8 16v-4M12 16V8M16 16v-6" ${T}/>`,
  pluma: `<path d="M4 20c6-1 10-4 12-9l3-6-6 3c-5 2-8 6-9 12z" ${T}/><path d="m8.5 15.5 5-5" ${T}/>`,
  balanza: `<path d="M12 4v16M7 20h10M4 9l4-3 4 3M12 9l4-3 4 3" ${T}/><path d="M4 9a2.5 2.5 0 0 0 4.5 0M15.5 9a2.5 2.5 0 0 0 4.5 0" ${T}/>`,
  descarga: `<path d="M12 4v10m-4-4 4 4 4-4" ${T}/><path d="M4 18v1.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V18" ${T}/>`,
  check: `<path d="m5 12.5 4.5 4.5L19 7" ${T}/>`,
  mas: `<path d="M12 5v14M5 12h14" ${T}/>`,
  cita: `<path d="M9 6c-3 1.5-4.5 4-4.5 7.5V18h5v-5H6c0-2.5 1-4.2 3-5zM19 6c-3 1.5-4.5 4-4.5 7.5V18h5v-5H16c0-2.5 1-4.2 3-5z" ${T}/>`,
  facebook: `<path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V3h-2.5A4 4 0 0 0 10.5 7v1.5H8V11h2.5v10H14V11h2.4l.6-2.5z" fill="currentColor"/>`,
  google: `<path d="M20.64 12.2c0-.638-.057-1.252-.164-1.84H12v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M12 21c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H3.957v2.332A8.997 8.997 0 0 0 12 21z" fill="#34A853"/><path d="M6.964 13.71a5.41 5.41 0 0 1-.282-1.71c0-.593.102-1.17.282-1.71V7.958H3.957A8.996 8.996 0 0 0 3 12c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M12 6.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C16.463 3.891 14.426 3 12 3a8.997 8.997 0 0 0-8.043 4.958l3.007 2.332C7.672 8.163 9.656 6.58 12 6.58z" fill="#EA4335"/>`,
  chat: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" ${T}/>`,
  instagram: `<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" ${T}/><circle cx="12" cy="12" r="3.8" ${T}/><circle cx="17" cy="7" r="1.1" fill="currentColor"/>`,
  x: `<path d="m4 4 7.5 9.5L4.5 20h2l6-6.7 5 6.7H20l-7.7-9.9L19.5 4h-2l-5.6 6.2L7.3 4z" fill="currentColor"/>`,
  linkedin: `<rect x="3.5" y="3.5" width="17" height="17" rx="3" ${T}/><path d="M8 10.5V17M8 7.6v.1M12 17v-3.6a2 2 0 0 1 4 0V17" ${T}/>`,
  youtube: `<rect x="3" y="6" width="18" height="12" rx="3.5" ${T}/><path d="m11 9.5 4 2.5-4 2.5z" ${T}/>`,
  tiktok: `<path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46" ${T}/><path d="M14 6.5A4.5 4.5 0 0 0 18.5 9" ${T}/>`
};

export function icono(nombre, extra = '') {
  const trazo = TRAZOS[nombre];
  if (!trazo) return '';
  return `<svg class="ico ${extra}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${trazo}</svg>`;
}

export function hayIcono(nombre) {
  return Boolean(TRAZOS[nombre]);
}

/** Sello de la editorial: el medallón real, recortado en círculo. */
export const RUTA_LOGO = '/imagenes/marca/logo-saberes.jpg';

export function logotipo({ alto = 48, conTexto = true, clase = '', prioridad = false } = {}) {
  const marca = `<img class="marca" src="${RUTA_LOGO}" alt="" width="${alto}" height="${alto}"
       loading="${prioridad ? 'eager' : 'lazy'}" decoding="async"${prioridad ? ' fetchpriority="high"' : ''}>`;
  if (!conTexto) return marca;
  return `<span class="logo ${clase}">${marca}<span class="logo-texto"><strong>Editorial Saberes</strong><em>Internacionales</em></span></span>`;
}
