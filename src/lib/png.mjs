// Rasterizador mínimo + codificador PNG, sin dependencias.
// Sirve para generar los archivos que las redes sociales y los sistemas
// operativos sí exigen en mapa de bits: la tarjeta Open Graph y los iconos.
//
// Las formas se describen como funciones "¿este punto está dentro?" y se
// dibujan con submuestreo 3x3, de modo que los bordes salen suavizados.

import zlib from 'node:zlib';

export function lienzo(ancho, alto, colorFondo = [255, 255, 255]) {
  const datos = new Float64Array(ancho * alto * 3);
  for (let i = 0; i < ancho * alto; i += 1) {
    datos[i * 3] = colorFondo[0];
    datos[i * 3 + 1] = colorFondo[1];
    datos[i * 3 + 2] = colorFondo[2];
  }
  return { ancho, alto, datos };
}

export function rgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** Degradado lineal en la dirección (dx, dy) normalizada sobre el lienzo. */
export function degradado(l, colorA, colorB, dx = 0, dy = 1) {
  const a = rgb(colorA);
  const b = rgb(colorB);
  const norma = Math.abs(dx) * l.ancho + Math.abs(dy) * l.alto || 1;
  for (let y = 0; y < l.alto; y += 1) {
    for (let x = 0; x < l.ancho; x += 1) {
      const t = Math.min(1, Math.max(0, (x * dx + y * dy) / norma));
      const i = (y * l.ancho + x) * 3;
      l.datos[i] = a[0] + (b[0] - a[0]) * t;
      l.datos[i + 1] = a[1] + (b[1] - a[1]) * t;
      l.datos[i + 2] = a[2] + (b[2] - a[2]) * t;
    }
  }
}

/** Pinta una forma con submuestreo. `dentro(x, y)` recibe coordenadas float. */
export function pintar(l, dentro, color, alfa = 1, caja = null) {
  const c = Array.isArray(color) ? color : rgb(color);
  const x0 = Math.max(0, Math.floor(caja ? caja[0] : 0));
  const y0 = Math.max(0, Math.floor(caja ? caja[1] : 0));
  const x1 = Math.min(l.ancho, Math.ceil(caja ? caja[2] : l.ancho));
  const y1 = Math.min(l.alto, Math.ceil(caja ? caja[3] : l.alto));
  const desplazamientos = [0.1667, 0.5, 0.8333];

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      let aciertos = 0;
      for (const sy of desplazamientos) {
        for (const sx of desplazamientos) {
          if (dentro(x + sx, y + sy)) aciertos += 1;
        }
      }
      if (!aciertos) continue;
      const k = (aciertos / 9) * alfa;
      const i = (y * l.ancho + x) * 3;
      l.datos[i] += (c[0] - l.datos[i]) * k;
      l.datos[i + 1] += (c[1] - l.datos[i + 1]) * k;
      l.datos[i + 2] += (c[2] - l.datos[i + 2]) * k;
    }
  }
}

export const formas = {
  circulo: (cx, cy, r) => (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r,
  anillo: (cx, cy, r, grosor) => (x, y) => {
    const d2 = (x - cx) ** 2 + (y - cy) ** 2;
    return d2 <= r * r && d2 >= (r - grosor) ** 2;
  },
  rect: (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1,
  rectRedondo: (x0, y0, x1, y1, r) => (x, y) => {
    if (x < x0 || x > x1 || y < y0 || y > y1) return false;
    const cx = Math.min(Math.max(x, x0 + r), x1 - r);
    const cy = Math.min(Math.max(y, y0 + r), y1 - r);
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  },
  poligono: (puntos) => (x, y) => {
    let dentro = false;
    for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i, i += 1) {
      const [xi, yi] = puntos[i];
      const [xj, yj] = puntos[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
    }
    return dentro;
  },
  menos: (a, b) => (x, y) => a(x, y) && !b(x, y)
};

/** Escudo de la marca, centrado en (cx, cy) con la altura indicada. */
export function escudo(cx, cy, alto) {
  const u = alto / 38;
  const puntos = [];
  const perfil = [
    [0, -19], [8, -15.5], [16, -14], [16, 4], [12, 13], [0, 19],
    [-12, 13], [-16, 4], [-16, -14], [-8, -15.5]
  ];
  for (const [px, py] of perfil) puntos.push([cx + px * u, cy + py * u]);
  return formas.poligono(puntos);
}

export function codificarPNG(l) {
  const { ancho, alto, datos } = l;
  const bruto = Buffer.alloc(alto * (1 + ancho * 3));
  let p = 0;
  for (let y = 0; y < alto; y += 1) {
    bruto[p] = 0;
    p += 1;
    for (let x = 0; x < ancho; x += 1) {
      const i = (y * ancho + x) * 3;
      bruto[p] = clamp(datos[i]);
      bruto[p + 1] = clamp(datos[i + 1]);
      bruto[p + 2] = clamp(datos[i + 2]);
      p += 3;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;   // profundidad de bits
  ihdr[9] = 2;   // color verdadero RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', zlib.deflateSync(bruto, { level: 9 })),
    trozo('IEND', Buffer.alloc(0))
  ]);
}

function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length, 0);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo) >>> 0, 0);
  return Buffer.concat([largo, cuerpo, crc]);
}

const TABLA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = TABLA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}
