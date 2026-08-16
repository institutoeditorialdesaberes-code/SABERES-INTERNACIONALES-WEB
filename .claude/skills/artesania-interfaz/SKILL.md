---
name: artesania-interfaz
description: Criterios de diseño e interacción para el sitio de Saberes Internacionales. Úsalo SIEMPRE antes de escribir o modificar CSS, animaciones, componentes visuales o maquetación de este proyecto, y al revisar si una pantalla "se ve bien". Cubre sistema tipográfico, espaciado, color, sombras, estados, movimiento y accesibilidad.
---

# Artesanía de interfaz — Saberes Internacionales

Criterios de oficio para que el sitio se sienta cuidado. No son reglas
decorativas: cada una tiene un porqué. Si vas a saltarte alguna, ten un motivo
mejor que "así queda bonito".

## 1. Movimiento

La animación mala se nota; la buena no. El objetivo no es que el usuario diga
"qué animación", es que no perciba saltos.

**Duración.** Entre 150 y 300 ms para casi todo. Cuanto más pequeño el
elemento, más rápido. Por encima de 400 ms el usuario espera; reserva eso para
recorridos largos en pantalla (una portada que viaja entre páginas) y para
efectos ambientales que no bloquean nada.

**Aceleración.** Nunca `linear` en interfaz: es la firma de lo artificial. La
única excepción legítima es el movimiento continuo sin principio ni fin (una
cinta en bucle, un giro perpetuo).

- Algo que **entra** o responde a una acción: `cubic-bezier(.2, .7, .3, 1)`.
  Arranca rápido y frena suave, como frenaría un objeto real.
- Algo que **sale**: acelera al irse, `cubic-bezier(.4, 0, 1, 1)`. Nadie mira
  lo que se va.
- Este proyecto tiene la curva de entrada en la variable `--transicion`.
  Úsala.

**Qué se anima.** Solo `transform` y `opacity`. Son las dos que el navegador
resuelve en la GPU sin recalcular la maquetación. Animar `width`, `height`,
`top`, `left`, `margin` o `padding` obliga a recalcular la página en cada
fotograma y se nota en equipos modestos.

- ¿Necesitas que algo crezca? `transform: scale()`.
- ¿Una barra de progreso? `transform: scaleX()` con `transform-origin: left`,
  no `width`.
- ¿Algo se desplaza? `translate`, no `top`.

**Nunca `transition: all`.** Declara qué propiedades se animan. `all` incluye
propiedades de maquetación que no querías animar y que aparecerán el día que
alguien añada un `padding` en el hover.

**Origen del movimiento.** Las cosas vienen de donde tiene sentido que vengan.
Un menú desplegable baja desde su botón, no desde el centro de la pantalla. Un
panel lateral entra desde su lado. Si el origen es arbitrario, el movimiento
se siente falso.

**Interrumpible.** Si el usuario mueve el cursor fuera a mitad de la
animación, esta debe revertirse desde donde está, no terminar y luego volver.
Las transiciones CSS lo hacen solas; las animaciones por JavaScript, no.

**Restricción.** Que todo se mueva equivale a que nada destaque. Si una
pantalla tiene más de dos o tres cosas animándose a la vez sin que el usuario
las haya provocado, sobra alguna.

**Siempre `prefers-reduced-motion`.** Toda animación de este sitio debe
anularse bajo esa preferencia. No es un extra: para personas con trastornos
vestibulares, el movimiento provoca malestar físico real. Ya hay bloques
`@media (prefers-reduced-motion: reduce)` en la hoja de estilos: añade ahí lo
nuevo.

## 2. Tipografía

- **Fraunces** para títulos, **Inter** para texto. Ambas autoalojadas en
  `/assets/fuentes/`. No añadas una tercera familia ni cargues fuentes de CDN.
- Pocos tamaños, bien diferenciados. Si dudas entre dos tamaños parecidos, usa
  el mismo y diferencia por peso o color.
- Títulos con `letter-spacing` ligeramente negativo (−0.02 em). El texto
  corrido, sin tocar. Las mayúsculas pequeñas de los antetítulos, muy abierto
  (0.2 em).
- Longitud de línea entre 60 y 75 caracteres. Hay clases `.bajada` y `.prosa`
  que ya lo controlan.
- Cifras en tablas y contadores: `font-variant-numeric: tabular-nums`, para que
  no bailen al cambiar.

## 3. Espaciado y maquetación

- Escala coherente: 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 rem. No inventes
  valores intermedios sin motivo.
- El espacio **agrupa**. Lo relacionado va junto; la separación entre grupos
  siempre mayor que dentro del grupo. Si algo se ve desordenado, casi siempre
  es esto y no el color.
- Alineación óptica sobre matemática: un icono circular junto a texto suele
  necesitar uno o dos píxeles de ajuste para *parecer* alineado.
- Radios anidados: el radio interior es el exterior menos el relleno. Un
  cuadro de 8 px de radio con 4 px de relleno lleva dentro elementos de 4 px.

## 4. Color y profundidad

- Paleta fija: azul `#0e2a47`, dorado `#c9a227`, hueso `#f4f1ea`, vino
  `#6b2233`, verde `#2f5d3a`. Están en variables CSS. No introduzcas colores
  nuevos sin añadirlos al sistema.
- El dorado es **acento**, no fondo. Subraya, remata y destaca; no llena.
- Sombras en capas, nunca una sola muy marcada: una corta y densa para el
  contacto, otra larga y difusa para la elevación. Ya están en `--sombra-s`,
  `--sombra-m` y `--sombra-l`.
- Texto sobre color: mínimo 4.5:1 de contraste para texto normal, 3:1 para
  texto grande. Compruébalo, no lo supongas.

## 5. Estados

Todo elemento interactivo necesita los cinco: reposo, hover, foco, activo y
deshabilitado. El que más se olvida es el foco, y es el que usa quien navega
con teclado.

- `:focus-visible` con contorno dorado de 3 px y 2 px de separación. Ya está
  definido globalmente: no lo quites de ningún elemento.
- El hover no debe mover el contenido de sitio. Elevar con `transform` está
  bien; cambiar el `padding` o el borde, no: empuja lo de al lado.
- Área de pulsación mínima de 44 × 44 px en móvil, aunque el icono sea menor.

## 6. Accesibilidad, que es parte del oficio

- Imágenes decorativas: `alt=""`. Imágenes con contenido: `alt` que describa lo
  que aporta, no "imagen de".
- Un solo `<h1>` por página y jerarquía sin saltos.
- Los iconos sueltos que son botones necesitan `aria-label`.
- Contenido oculto visualmente pero necesario para lectores: clase
  `.visualmente-oculto`, nunca `display: none`.

## 7. Rendimiento como criterio de diseño

Un sitio bonito que carga lento no es un sitio bonito.

- Imágenes siempre con `width` y `height` en el HTML, para que el navegador
  reserve el espacio y la página no dé saltos al cargar.
- `loading="lazy"` en todo lo que esté bajo el pliegue; `fetchpriority="high"`
  solo en la imagen principal de la portada.
- Prefiere SVG generado por código para elementos de interfaz: pesa poco y se
  ve nítido en cualquier pantalla.
- Este sitio no tiene dependencias de npm. No introduzcas ninguna para
  resolver algo que se puede escribir en cincuenta líneas.

## Antes de dar por buena una pantalla

1. ¿Se ve bien a 375 px de ancho?
2. ¿Se puede recorrer entera con el tabulador viendo siempre dónde está el foco?
3. ¿Funciona con `prefers-reduced-motion` activado?
4. ¿Hay algún `transition: all` o alguna animación de `width`/`height`?
5. ¿Las imágenes tienen dimensiones declaradas?
6. ¿Sigue sin desbordarse en horizontal?

Comprueba estas seis con el navegador antes de decir que está terminado.
