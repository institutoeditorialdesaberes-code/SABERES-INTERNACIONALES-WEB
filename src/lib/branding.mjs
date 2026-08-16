// Composición de los mapas de bits de marca: tarjeta Open Graph e iconos.
// WhatsApp, Facebook, X y los sistemas operativos no aceptan SVG en estos
// espacios, así que se rasterizan en el build.

import { lienzo, degradado, pintar, formas, codificarPNG, rgb } from './png.mjs';

const AZUL = '#0e2a47';
const AZUL_HONDO = '#061726';
const ORO = '#c9a227';
const HUESO = '#f4f1ea';

/**
 * Versión rasterizada del sello de la editorial: medallón circular con la
 * torre escalonada del conocimiento. Sigue la línea del logotipo real para
 * que los iconos del sistema y la tarjeta social se vean de la misma familia.
 */
function marca(l, cx, cy, radio, colorFigura = HUESO, colorRealce = ORO) {
  const u = radio / 38;
  const caja = [cx - radio - 4, cy - radio - 4, cx + radio + 4, cy + radio + 4];

  // Aro exterior dorado y campo azul interior.
  pintar(l, formas.circulo(cx, cy, radio), colorRealce, 1, caja);
  pintar(l, formas.circulo(cx, cy, radio * 0.9), AZUL_HONDO, 1, caja);
  pintar(l, formas.anillo(cx, cy, radio * 0.82, Math.max(1, radio * 0.028)), colorRealce, 0.85, caja);

  // Torre escalonada: cinco cuerpos que se estrechan al subir.
  const base = cy + 15 * u;
  const cuerpos = [
    [22, 6], [18.5, 5.5], [15, 5.5], [11.5, 5.5], [8, 6]
  ];
  let y = base;
  for (const [semiAncho, altoCuerpo] of cuerpos) {
    const w = semiAncho * u;
    const h = altoCuerpo * u;
    pintar(l, formas.rect(cx - w, y - h, cx + w, y), colorFigura, 0.94, caja);
    // Filete de sombra entre cuerpos para dar relieve.
    pintar(l, formas.rect(cx - w, y - h * 0.16, cx + w, y), AZUL_HONDO, 0.28, caja);
    y -= h;
  }

  // Vano de entrada iluminado y estandarte superior.
  pintar(l, formas.rect(cx - 2.2 * u, base - 6 * u, cx + 2.2 * u, base), colorRealce, 1, caja);
  pintar(l, formas.rect(cx - 0.7 * u, y - 7 * u, cx + 0.7 * u, y), colorRealce, 1, caja);
  pintar(l, formas.poligono([
    [cx + 0.7 * u, y - 7 * u], [cx + 6 * u, y - 5.6 * u], [cx + 0.7 * u, y - 4.2 * u]
  ]), colorRealce, 1, caja);

  // Suelo del medallón.
  pintar(l, formas.rect(cx - radio * 0.62, base, cx + radio * 0.62, base + 1.6 * u), colorFigura, 0.5, caja);
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
