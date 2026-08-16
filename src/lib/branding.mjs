// Composición de los mapas de bits de marca: tarjeta Open Graph e iconos.
// WhatsApp, Facebook, X y los sistemas operativos no aceptan SVG en estos
// espacios, así que se rasterizan en el build.

import { lienzo, degradado, pintar, formas, escudo, codificarPNG, rgb } from './png.mjs';

const AZUL = '#0e2a47';
const AZUL_HONDO = '#061726';
const ORO = '#c9a227';
const HUESO = '#f4f1ea';

function marca(l, cx, cy, alto, colorFigura = HUESO, colorRealce = ORO) {
  const u = alto / 38;
  const caja = [cx - alto, cy - alto, cx + alto, cy + alto];

  // Escudo con filete interior.
  pintar(l, escudo(cx, cy, alto), colorRealce, 1, caja);
  pintar(l, escudo(cx, cy, alto * 0.88), AZUL_HONDO, 1, caja);

  // Páginas abiertas.
  const anchoPagina = 11 * u;
  const altoPagina = 8.5 * u;
  const izquierda = formas.poligono([
    [cx - 0.6 * u, cy - altoPagina * 0.72],
    [cx - anchoPagina, cy - altoPagina * 0.44],
    [cx - anchoPagina, cy + altoPagina * 0.86],
    [cx - 0.6 * u, cy + altoPagina * 0.6]
  ]);
  const derecha = formas.poligono([
    [cx + 0.6 * u, cy - altoPagina * 0.72],
    [cx + anchoPagina, cy - altoPagina * 0.44],
    [cx + anchoPagina, cy + altoPagina * 0.86],
    [cx + 0.6 * u, cy + altoPagina * 0.6]
  ]);
  pintar(l, izquierda, colorFigura, 0.95, caja);
  pintar(l, derecha, colorFigura, 0.95, caja);
  pintar(l, formas.rect(cx - 0.7 * u, cy - altoPagina * 0.8, cx + 0.7 * u, cy + altoPagina * 0.72), colorRealce, 1, caja);
}

/** Tarjeta social 1200 x 630. Sin texto: el título lo pone cada red. */
export function tarjetaSocial() {
  const l = lienzo(1200, 630);
  degradado(l, AZUL, AZUL_HONDO, 0.7, 1);

  const realce = rgb(ORO);
  for (let r = 300; r > 60; r -= 52) {
    pintar(l, formas.anillo(1010, 315, r, 1.6), realce, 0.16, [1010 - r - 4, 315 - r - 4, 1010 + r + 4, 315 + r + 4]);
  }

  pintar(l, formas.rect(0, 0, 1200, 8), ORO, 1, [0, 0, 1200, 10]);

  marca(l, 300, 300, 150);

  pintar(l, formas.rect(180, 486, 420, 490), ORO, 0.9, [176, 480, 424, 496]);
  for (let i = 0; i < 3; i += 1) {
    pintar(l, formas.rect(180, 520 + i * 26, 420 - i * 70, 528 + i * 26), HUESO, 0.28 - i * 0.06,
      [176, 514, 424, 560]);
  }
  return codificarPNG(l);
}

/** Icono cuadrado sólido para PWA, favicon y pantalla de inicio de iOS. */
export function icono(tamano, { fondo = AZUL, redondeado = false } = {}) {
  const l = lienzo(tamano, tamano);
  degradado(l, fondo, AZUL_HONDO, 0.6, 1);
  if (redondeado) {
    // Se recortan las esquinas para el icono de iOS heredado.
    const r = tamano * 0.22;
    pintar(l, formas.menos(
      formas.rect(0, 0, tamano, tamano),
      formas.rectRedondo(0, 0, tamano, tamano, r)
    ), '#ffffff', 1);
  }
  marca(l, tamano / 2, tamano / 2, tamano * 0.36);
  return codificarPNG(l);
}
