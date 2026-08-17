import { esc, calle } from '../lib/utils.mjs';
import { icono } from '../lib/icons.mjs';
import { bandaCTA, tarjetaLibro, rutaSeccion } from '../lib/components.mjs';

const HOY = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/* Nosotros                                                            */
/* ------------------------------------------------------------------ */
export function paginaNosotros(ctx) {
  const { cfg, libros, autores, categorias } = ctx;
  const imagen = rutaSeccion('nosotros', ctx);
  const cuerpo = `
<section class="portada-seccion con-fondo">
  <img class="portada-fondo" src="${imagen || '/imagenes/portadas/nosotros.jpg'}" alt="" aria-hidden="true" loading="eager">
  <div class="contenedor">
    <p class="sobretitulo claro">Desde ${esc(cfg.fundacion)} en ${esc(cfg.contacto.ciudad)}</p>
    <h1>La editorial</h1>
    <p class="bajada">${esc(cfg.descripcion)}</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor disposicion-perfil">
    <div class="prosa">
      <h2>Qué hacemos</h2>
      <p>Saberes Internacionales es un sello editorial independiente dedicado a publicar obra académica, material de formación y ensayo de divulgación rigurosa. Trabajamos con autores de Ecuador y de la región, y editamos principalmente en español.</p>
      <p>No publicamos todo lo que llega. Cada propuesta se evalúa por pertinencia, originalidad y calidad de la argumentación, y esa evaluación queda por escrito. Es la única manera de que el sello signifique algo para el lector.</p>

      <h2>Cómo trabajamos</h2>
      <p>El proceso editorial tiene etapas definidas y plazos comprometidos por escrito con el autor:</p>
      <ol>
        <li><strong>Recepción y lectura editorial.</strong> Revisión inicial de pertinencia y estado del manuscrito.</li>
        <li><strong>Evaluación por pares.</strong> Lectores externos especializados emiten un informe con recomendación.</li>
        <li><strong>Edición y corrección.</strong> Edición de contenido, corrección de estilo y corrección ortotipográfica.</li>
        <li><strong>Diseño y maquetación.</strong> Portada, interiores y preliminares según normas de la colección.</li>
        <li><strong>Registro legal.</strong> Gestión de ISBN y depósito legal del título.</li>
        <li><strong>Impresión y distribución.</strong> Producción física o digital y puesta en canales de venta.</li>
      </ol>

      <h2>Nuestro compromiso con el lector</h2>
      <p>Cada ficha de este catálogo indica ISBN, número de páginas, formato, año y edición. Si un dato falta o está equivocado, escríbenos y lo corregimos: la información bibliográfica es parte del producto.</p>
    </div>

    <aside class="tarjeta-lateral">
      <h3>La editorial en cifras</h3>
      <ul class="lista-datos">
        <li><strong>${libros.length}</strong> títulos en catálogo</li>
        <li><strong>${autores.length}</strong> autores publicados</li>
        <li><strong>${categorias.length}</strong> colecciones activas</li>
        <li><strong>${new Date().getFullYear() - Number(cfg.fundacion)}</strong> años de trabajo</li>
      </ul>
      <h3>Dónde estamos</h3>
      <p>${icono('ubicacion')} ${calle(cfg, '<br>')}${esc(cfg.contacto.ciudad)} — ${esc(cfg.contacto.provincia)}, Ecuador</p>
      <p>${icono('reloj')} ${esc(cfg.contacto.horario)}</p>
      <a class="boton boton-primario ancho" href="/contacto/">Contactar al equipo</a>
    </aside>
  </div>
</section>

<section class="seccion seccion-alterna">
  <div class="contenedor">
    <h2 class="titulo-bloque">Nuestras colecciones</h2>
    <div class="rejilla-colecciones">
      ${categorias.map((c) => {
        const img = ctx.imagenesCategorias && ctx.imagenesCategorias.get(c.id);
        return `
      <article class="coleccion${img ? ' con-imagen' : ''}" style="--c:${esc(c.color)}">
        ${img ? `<img class="coleccion-imagen" src="${esc(img)}" alt="" width="690" height="276" loading="lazy" decoding="async">` : ''}
        <span class="coleccion-icono">${icono(c.icono)}</span>
        <h3>${esc(c.nombre)}</h3>
        <p>${esc(c.descripcion)}</p>
        <a class="enlace-flecha" href="/categoria/${esc(c.id)}/">Ver títulos ${icono('flechaDer')}</a>
      </article>`;
      }).join('')}
    </div>
  </div>
</section>

${bandaCTA(cfg)}`;

  return {
    ruta: '/nosotros/',
    titulo: 'Quiénes somos',
    descripcion: `${cfg.nombreLegal}: editorial académica independiente en Quito desde ${cfg.fundacion}. Proceso editorial con revisión por pares, ISBN y distribución nacional.`,
    clase: 'p-estatica',
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Nosotros', url: '/nosotros/' }],
    cuerpo,
    jsonld: [{
      '@type': 'AboutPage',
      '@id': `${cfg.url}/nosotros/#pagina`,
      url: `${cfg.url}/nosotros/`,
      name: 'Quiénes somos',
      isPartOf: { '@id': `${cfg.url}/#sitio` },
      about: { '@id': `${cfg.url}/#organizacion` }
    }]
  };
}

/* ------------------------------------------------------------------ */
/* Contacto                                                            */
/* ------------------------------------------------------------------ */
export function paginaContacto(ctx) {
  const { cfg } = ctx;
  const wa = `https://wa.me/${esc(cfg.contacto.whatsapp)}`;

  const cuerpo = `
<section class="portada-seccion con-fondo">
  <img class="portada-fondo" src="/imagenes/portadas/contacto.jpg" alt="" aria-hidden="true" loading="eager">
  <div class="contenedor">
    <p class="sobretitulo claro">Estamos en ${esc(cfg.contacto.ciudad)}</p>
    <h1>Contacto</h1>
    <p class="bajada">Pedidos, propuestas editoriales, prensa y compras institucionales. Respondemos en horario de oficina.</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor disposicion-contacto">
    <div class="formulario-envoltura">
      <h2>Escríbenos</h2>
      <p class="bajada">Completa el formulario y elige cómo prefieres enviarlo: se abrirá WhatsApp o tu programa de correo con el mensaje ya redactado.</p>
      <form class="formulario" data-contacto novalidate>
        <div class="campo">
          <label for="nombre">Nombre y apellido *</label>
          <input type="text" id="nombre" name="nombre" required autocomplete="name">
        </div>
        <div class="campo-fila">
          <div class="campo">
            <label for="email">Correo electrónico *</label>
            <input type="email" id="email" name="email" required autocomplete="email">
          </div>
          <div class="campo">
            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" name="telefono" autocomplete="tel">
          </div>
        </div>
        <div class="campo">
          <label for="asunto">Motivo *</label>
          <select id="asunto" name="asunto" required>
            <option value="Pedido de un libro">Pedido de un libro</option>
            <option value="Propuesta de manuscrito">Propuesta de manuscrito</option>
            <option value="Compra institucional o por volumen">Compra institucional o por volumen</option>
            <option value="Servicios editoriales">Servicios editoriales</option>
            <option value="Prensa y entrevistas">Prensa y entrevistas</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div class="campo">
          <label for="mensaje">Mensaje *</label>
          <textarea id="mensaje" name="mensaje" rows="6" required></textarea>
        </div>
        <label class="casilla consentimiento">
          <input type="checkbox" name="consentimiento" required>
          <span>Acepto la <a href="/privacidad/">política de privacidad</a> y el tratamiento de mis datos para responder esta consulta.</span>
        </label>
        <div class="formulario-acciones">
          <button type="submit" class="boton boton-wa grande" data-enviar="whatsapp">${icono('whatsapp')}<span>Enviar por WhatsApp</span></button>
          <button type="submit" class="boton boton-fantasma grande" data-enviar="correo">${icono('correo')}<span>Enviar por correo</span></button>
        </div>
        <p class="nota" data-contacto-estado role="status"></p>
      </form>
    </div>

    <aside class="datos-contacto">
      <h2>Datos directos</h2>
      <ul class="lista-contacto">
        <li>${icono('whatsapp')}<div><strong>WhatsApp</strong><a href="${wa}" target="_blank" rel="noopener">${esc(cfg.contacto.telefono)}</a></div></li>
        <li>${icono('correo')}<div><strong>Correo general</strong><a href="mailto:${esc(cfg.contacto.email)}">${esc(cfg.contacto.email)}</a></div></li>
        <li>${icono('pluma')}<div><strong>Propuestas editoriales</strong><a href="mailto:${esc(cfg.contacto.emailPublicaciones)}">${esc(cfg.contacto.emailPublicaciones)}</a></div></li>
        <li>${icono('ubicacion')}<div><strong>Ubicación</strong><span>${calle(cfg, '<br>')}${esc(cfg.contacto.ciudad)} — ${esc(cfg.contacto.provincia)}, Ecuador</span></div></li>
        <li>${icono('reloj')}<div><strong>Horario</strong><span>${esc(cfg.contacto.horario)}</span></div></li>
      </ul>
      ${cfg.contacto.mapaEmbed ? `<div class="mapa">${cfg.contacto.mapaEmbed}</div>` : `
      <div class="mapa-vacio">
        ${icono('ubicacion')}
        <p>Atención con cita previa. Escríbenos para coordinar una visita a la oficina.</p>
      </div>`}
    </aside>
  </div>
</section>`;

  return {
    ruta: '/contacto/',
    titulo: 'Contacto',
    descripcion: `Contacta a ${cfg.nombreLegal} en Quito: WhatsApp ${cfg.contacto.telefono}, correo ${cfg.contacto.email}. Pedidos, propuestas de manuscrito y compras institucionales.`,
    clase: 'p-contacto',
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Contacto', url: '/contacto/' }],
    cuerpo,
    jsonld: [{
      '@type': 'ContactPage',
      '@id': `${cfg.url}/contacto/#pagina`,
      url: `${cfg.url}/contacto/`,
      name: 'Contacto',
      isPartOf: { '@id': `${cfg.url}/#sitio` },
      about: { '@id': `${cfg.url}/#organizacion` }
    }]
  };
}

/* ------------------------------------------------------------------ */
/* Publica con nosotros                                                */
/* ------------------------------------------------------------------ */
export function paginaPublica(ctx) {
  const { cfg } = ctx;
  const imagen = rutaSeccion('publica-con-nosotros', ctx);
  const pasos = [
    ['Envía tu propuesta', 'Índice comentado, capítulo de muestra, resumen de la obra y hoja de vida académica en un solo PDF.'],
    ['Lectura editorial', 'Revisamos pertinencia, originalidad y estado del manuscrito. Te confirmamos recepción y plazo.'],
    ['Evaluación por pares', 'Dos lectores especializados externos emiten informe con recomendación fundamentada.'],
    ['Respuesta con informe', 'Se acepte o no, recibes el informe por escrito con observaciones concretas.'],
    ['Contrato editorial', 'Se define alcance de la cesión, plazos, regalías y formatos. Todo por escrito.'],
    ['Producción', 'Edición, corrección, diseño, ISBN, depósito legal, impresión y distribución.']
  ];

  const cuerpo = `
<section class="portada-seccion con-fondo">
  <img class="portada-fondo" src="${imagen || '/imagenes/portadas/publica.jpg'}" alt="" aria-hidden="true" loading="eager">
  <div class="contenedor">
    <p class="sobretitulo claro">Convocatoria abierta todo el año</p>
    <h1>Publica con nosotros</h1>
    <p class="bajada">Recibimos manuscritos originales de investigación, ensayo, material didáctico y divulgación rigurosa. La evaluación no tiene costo.</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor">
    <h2 class="titulo-bloque">El proceso, paso a paso</h2>
    <ol class="linea-pasos">
      ${pasos.map(([t, d], i) => `
      <li>
        <span class="numero">${String(i + 1).padStart(2, '0')}</span>
        <div><strong>${esc(t)}</strong><p>${esc(d)}</p></div>
      </li>`).join('')}
    </ol>
  </div>
</section>

<section class="seccion seccion-alterna">
  <div class="contenedor disposicion-perfil">
    <div class="prosa">
      <h2>Qué buscamos</h2>
      <ul>
        <li>Una tesis identificable y sostenida con fuentes verificables.</li>
        <li>Un lector concreto en mente: académico, docente, estudiante o profesional.</li>
        <li>Manuscritos completos o con al menos el sesenta por ciento redactado.</li>
        <li>Textos en español, con posibilidad de traducción posterior.</li>
      </ul>

      <h2>Qué no publicamos</h2>
      <ul>
        <li>Compilaciones sin hilo conductor ni criterio de selección.</li>
        <li>Tesis de posgrado enviadas sin adaptación al formato libro.</li>
        <li>Obras con material de terceros sin autorización de uso.</li>
        <li>Textos que no citan sus fuentes o que reproducen contenido ajeno.</li>
      </ul>

      <h2>Cómo enviar</h2>
      <p>Escribe a <a href="mailto:${esc(cfg.contacto.emailPublicaciones)}">${esc(cfg.contacto.emailPublicaciones)}</a> con el asunto <em>Propuesta editorial — [título de tu obra]</em> y adjunta un solo PDF que contenga índice comentado, resumen, capítulo de muestra y tu hoja de vida académica.</p>
    </div>

    <aside class="tarjeta-lateral">
      <h3>Documentos requeridos</h3>
      <ul class="lista-verificacion">
        <li>${icono('check')} Resumen de la obra (máx. 1 página)</li>
        <li>${icono('check')} Índice comentado</li>
        <li>${icono('check')} Un capítulo de muestra</li>
        <li>${icono('check')} Hoja de vida académica</li>
        <li>${icono('check')} Público lector previsto</li>
      </ul>
      <a class="boton boton-primario ancho" href="mailto:${esc(cfg.contacto.emailPublicaciones)}?subject=${encodeURIComponent('Propuesta editorial')}">${icono('correo')}<span>Enviar propuesta</span></a>
      <a class="boton boton-fantasma ancho" href="/servicios/">Ver servicios editoriales</a>
    </aside>
  </div>
</section>`;

  return {
    ruta: '/publica-con-nosotros/',
    titulo: 'Publica con nosotros',
    descripcion: `Cómo publicar tu libro con ${cfg.nombreLegal} en Ecuador: evaluación gratuita por pares, contrato editorial, ISBN, depósito legal, impresión y distribución.`,
    palabrasClave: ['publicar libro Ecuador', 'editorial acepta manuscritos', 'ISBN Ecuador', 'convocatoria editorial'],
    clase: 'p-estatica',
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Publica con nosotros', url: '/publica-con-nosotros/' }],
    cuerpo
  };
}

/* ------------------------------------------------------------------ */
/* Servicios editoriales                                               */
/* ------------------------------------------------------------------ */
export function paginaServicios(ctx) {
  const { cfg } = ctx;
  const servicios = [
    ['pluma', 'Edición de contenido', 'Trabajo sobre estructura, argumento y coherencia interna del manuscrito, con informe de observaciones.'],
    ['check', 'Corrección de estilo', 'Revisión de gramática, ortotipografía, uso y registro, respetando la voz del autor.'],
    ['libro', 'Diseño y maquetación', 'Portada, interiores y preliminares según normas de la colección y del formato elegido.'],
    ['sello', 'ISBN y depósito legal', 'Gestión del registro del título y del cumplimiento de las obligaciones legales de publicación.'],
    ['envio', 'Impresión y producción', 'Cotización de tiraje o impresión bajo demanda, control de pruebas y seguimiento de imprenta.'],
    ['grafico', 'Distribución y difusión', 'Puesta del título en canales de venta, ficha comercial y materiales de lanzamiento.']
  ];

  const cuerpo = `
<section class="portada-seccion con-fondo">
  <img class="portada-fondo" src="/imagenes/portadas/publica.jpg" alt="" aria-hidden="true" loading="eager">
  <div class="contenedor">
    <p class="sobretitulo claro">Para autores e instituciones</p>
    <h1>Servicios editoriales</h1>
    <p class="bajada">Puedes contratar el proceso completo o solo la etapa que necesitas. Cada servicio se cotiza sobre el manuscrito real, nunca a ciegas.</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor">
    <div class="rejilla-servicios">
      ${servicios.map(([ic, t, d]) => `
      <article class="servicio">
        <span class="servicio-icono">${icono(ic)}</span>
        <h2>${esc(t)}</h2>
        <p>${esc(d)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="seccion seccion-alterna">
  <div class="contenedor bloque-centrado">
    <h2>Solicita una cotización</h2>
    <p class="bajada">Envíanos el manuscrito o una muestra representativa y el formato deseado. Preparamos una propuesta con alcance, plazos y valores.</p>
    <div class="acciones-centradas">
      <a class="boton boton-primario" href="/contacto/">Pedir cotización</a>
      <a class="boton boton-fantasma" href="mailto:${esc(cfg.contacto.email)}">${esc(cfg.contacto.email)}</a>
    </div>
  </div>
</section>`;

  return {
    ruta: '/servicios/',
    titulo: 'Servicios editoriales',
    descripcion: `Servicios de ${cfg.nombreLegal}: edición, corrección de estilo, diseño y maquetación, ISBN y depósito legal, impresión y distribución en Ecuador.`,
    clase: 'p-estatica',
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Servicios', url: '/servicios/' }],
    cuerpo,
    jsonld: [{
      '@type': 'Service',
      name: 'Servicios editoriales',
      provider: { '@id': `${cfg.url}/#organizacion` },
      areaServed: { '@type': 'Country', name: 'Ecuador' },
      serviceType: 'Edición, corrección, diseño editorial, registro de ISBN, impresión y distribución',
      url: `${cfg.url}/servicios/`
    }]
  };
}

/* ------------------------------------------------------------------ */
/* Preguntas frecuentes                                                */
/* ------------------------------------------------------------------ */
const PREGUNTAS = [
  ['¿Cómo compro un libro del catálogo?',
   'Entra a la ficha del título y pulsa "Pedir por WhatsApp". El mensaje se redacta solo con el título y el ISBN. El equipo confirma disponibilidad, valor final con envío y forma de pago.'],
  ['¿Hacen envíos a todo el Ecuador?',
   'Sí. Despachamos desde Quito a todo el país mediante courier. El plazo habitual es de 24 a 72 horas laborables según la ciudad de destino.'],
  ['¿Puedo comprar desde otro país?',
   'Sí. Para envíos internacionales cotizamos el flete según el destino y el peso del pedido. Escríbenos antes de confirmar la compra.'],
  ['¿Qué formas de pago aceptan?',
   'Transferencia bancaria y depósito. Para compras institucionales emitimos factura y trabajamos con orden de compra.'],
  ['¿Emiten factura?',
   'Sí, para todas las compras. Necesitamos razón social, RUC o cédula, dirección, correo y teléfono.'],
  ['¿Cómo envío mi manuscrito para evaluación?',
   'Desde la página "Publica con nosotros". La evaluación no tiene costo e incluye un informe escrito, se acepte o no la obra.'],
  ['¿Cuánto demora la evaluación de un manuscrito?',
   'El plazo comprometido para la lectura editorial inicial es de quince días hábiles. La evaluación por pares completa toma más tiempo y se informa al autor al confirmar la recepción.'],
  ['¿La editorial gestiona el ISBN?',
   'Sí. Gestionamos el ISBN y el depósito legal de los títulos que publicamos bajo el sello, y también como servicio independiente.'],
  ['¿El autor conserva sus derechos?',
   'Los derechos morales son irrenunciables y siempre son del autor. Los derechos patrimoniales se ceden en los términos, plazos y formatos que el contrato editorial defina expresamente.'],
  ['¿Publican en formato digital?',
   'Sí. Varios títulos tienen edición digital. El formato se define en el contrato junto con el precio de cada versión.'],
  ['¿Hacen descuentos por volumen?',
   'Sí, para instituciones educativas, bibliotecas y compras al por mayor. Solicita una cotización indicando cantidad y títulos.'],
  ['¿Cómo corrijo un dato equivocado de una ficha?',
   'Escríbenos indicando el título y el dato a corregir. La información bibliográfica se actualiza y el sitio se reconstruye automáticamente.']
];

export function paginaFAQ(ctx) {
  const { cfg } = ctx;
  const cuerpo = `
<section class="portada-seccion con-fondo">
  <img class="portada-fondo" src="/imagenes/portadas/blog.jpg" alt="" aria-hidden="true" loading="eager">
  <div class="contenedor">
    <p class="sobretitulo claro">Todo lo que suelen preguntarnos</p>
    <h1>Preguntas frecuentes</h1>
    <p class="bajada">Compras, envíos, facturación y proceso editorial. Si tu duda no está aquí, escríbenos y la respondemos.</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor estrecho">
    <div class="acordeon" data-acordeon>
      ${PREGUNTAS.map(([p, r], i) => `
      <details class="acordeon-item"${i === 0 ? ' open' : ''}>
        <summary><span>${esc(p)}</span>${icono('chevronAbajo')}</summary>
        <div class="acordeon-cuerpo"><p>${esc(r)}</p></div>
      </details>`).join('')}
    </div>

    <div class="bloque-centrado bloque-ayuda">
      <h2>¿No encontraste tu respuesta?</h2>
      <p>Escríbenos por WhatsApp o correo y te contestamos en horario de oficina.</p>
      <div class="acciones-centradas">
        <a class="boton boton-wa" href="https://wa.me/${esc(cfg.contacto.whatsapp)}" target="_blank" rel="noopener">${icono('whatsapp')}<span>Escribir por WhatsApp</span></a>
        <a class="boton boton-fantasma" href="/contacto/">Ir a contacto</a>
      </div>
    </div>
  </div>
</section>`;

  return {
    ruta: '/faq/',
    titulo: 'Preguntas frecuentes',
    descripcion: `Respuestas sobre compras, envíos a todo el Ecuador, facturación, ISBN, derechos de autor y proceso editorial de ${cfg.nombreLegal}.`,
    clase: 'p-estatica',
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Preguntas frecuentes', url: '/faq/' }],
    cuerpo,
    jsonld: [{
      '@type': 'FAQPage',
      '@id': `${cfg.url}/faq/#faq`,
      url: `${cfg.url}/faq/`,
      mainEntity: PREGUNTAS.map(([p, r]) => ({
        '@type': 'Question',
        name: p,
        acceptedAnswer: { '@type': 'Answer', text: r }
      }))
    }]
  };
}

/* ------------------------------------------------------------------ */
/* Páginas legales y de envíos                                         */
/* ------------------------------------------------------------------ */
function paginaTexto(cfg, { ruta, titulo, descripcion, intro, secciones }) {
  const cuerpo = `
<section class="portada-seccion">
  <div class="contenedor">
    <p class="sobretitulo claro">Última actualización: ${HOY}</p>
    <h1>${esc(titulo)}</h1>
    <p class="bajada">${esc(intro)}</p>
  </div>
</section>

<section class="seccion">
  <div class="contenedor estrecho">
    <div class="prosa documento">
      ${secciones.map(([t, parrafos]) => `
      <h2>${esc(t)}</h2>
      ${parrafos.map((p) => (Array.isArray(p)
        ? `<ul>${p.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`
        : `<p>${esc(p)}</p>`)).join('')}`).join('')}
      <hr>
      <p class="nota">Para cualquier consulta sobre este documento escribe a <a href="mailto:${esc(cfg.contacto.email)}">${esc(cfg.contacto.email)}</a>.</p>
    </div>
  </div>
</section>`;

  return { ruta, titulo, descripcion, clase: 'p-documento', cuerpo, migas: [{ texto: 'Inicio', url: '/' }, { texto: titulo, url: ruta }] };
}

export function paginaEnvios(ctx) {
  const { cfg } = ctx;
  return paginaTexto(cfg, {
    ruta: '/envios/',
    titulo: 'Envíos y entregas',
    descripcion: `Cobertura, plazos y condiciones de envío de ${cfg.nombreLegal} desde Quito a todo el Ecuador y al exterior.`,
    intro: 'Cómo despachamos los pedidos, en qué plazos y bajo qué condiciones.',
    secciones: [
      ['Cobertura', [
        'Despachamos desde Quito a todas las provincias del Ecuador mediante empresas de courier. Para envíos internacionales cotizamos según destino y peso antes de confirmar el pedido.'
      ]],
      ['Plazos de entrega', [
        'Los plazos se cuentan en días laborables desde la confirmación del pago:',
        ['Quito: 24 a 48 horas.', 'Otras ciudades principales: 48 a 72 horas.', 'Zonas rurales y de difícil acceso: hasta 5 días laborables.', 'Envíos internacionales: según el operador y el destino.'],
        'Los títulos en preventa se despachan cuando el ejemplar sale de imprenta; la fecha estimada se informa al momento de la reserva.'
      ]],
      ['Costo del envío', [
        'El valor del envío se calcula por peso y destino, y se informa antes de cerrar el pedido. Para compras institucionales o por volumen se cotiza el flete de forma independiente.'
      ]],
      ['Seguimiento', [
        'Al despachar el pedido enviamos el número de guía por el mismo canal por el que se hizo la compra, sea WhatsApp o correo electrónico.'
      ]],
      ['Recepción y revisión', [
        'Revisa el paquete al recibirlo. Si el ejemplar llega con daño de transporte, avísanos dentro de las 48 horas siguientes adjuntando fotografías del embalaje y del libro, y coordinamos la reposición.'
      ]],
      ['Cambios y devoluciones', [
        'Aceptamos cambios por defecto de fábrica o error en el título despachado. El ejemplar debe estar sin uso y en su estado original. Los gastos de envío de la devolución corren por cuenta de la editorial cuando el error es nuestro.'
      ]]
    ]
  });
}

export function paginaTerminos(ctx) {
  const { cfg } = ctx;
  return paginaTexto(cfg, {
    ruta: '/terminos/',
    titulo: 'Términos y condiciones',
    descripcion: `Condiciones de uso del sitio web de ${cfg.nombreLegal} y de las compras realizadas a través de él.`,
    intro: 'Condiciones que rigen el uso de este sitio y las compras gestionadas a través de él.',
    secciones: [
      ['1. Titular del sitio', [
        `Este sitio web es operado por ${cfg.nombreLegal}, con domicilio en ${calle(cfg)}${cfg.contacto.ciudad}, Ecuador, y correo de contacto ${cfg.contacto.email}.`
      ]],
      ['2. Objeto', [
        'El sitio presenta el catálogo editorial, información institucional y contenidos del blog. Los pedidos no se cierran en línea: se gestionan por WhatsApp o correo con el equipo editorial, que confirma disponibilidad, valor final y forma de pago.'
      ]],
      ['3. Precios y disponibilidad', [
        'Los precios se expresan en dólares de los Estados Unidos de América e incluyen los impuestos aplicables, salvo indicación en contrario. No incluyen el costo de envío.',
        'Los precios y la disponibilidad pueden cambiar sin aviso previo. El valor válido es el confirmado por el equipo al momento de cerrar el pedido.'
      ]],
      ['4. Propiedad intelectual', [
        'Los textos, imágenes, marcas y contenidos de este sitio están protegidos por la normativa de propiedad intelectual. Las obras del catálogo pertenecen a sus autores en cuanto a derechos morales, y su explotación se rige por los contratos editoriales suscritos.',
        'No está permitida la reproducción total o parcial de los contenidos sin autorización escrita.'
      ]],
      ['5. Enlaces a terceros', [
        'El sitio puede enlazar a servicios de terceros, como WhatsApp o redes sociales. La editorial no controla ni responde por las políticas de esos servicios.'
      ]],
      ['6. Responsabilidad', [
        'Procuramos que la información bibliográfica del catálogo sea exacta y esté actualizada. Si detectas un error, escríbenos y lo corregimos. La editorial no responde por interrupciones del servicio ajenas a su control.'
      ]],
      ['7. Ley aplicable', [
        'Estas condiciones se rigen por la legislación de la República del Ecuador. Cualquier controversia se someterá a los jueces competentes del cantón Quito.'
      ]]
    ]
  });
}

export function paginaPrivacidad(ctx) {
  const { cfg } = ctx;
  return paginaTexto(cfg, {
    ruta: '/privacidad/',
    titulo: 'Política de privacidad',
    descripcion: `Cómo ${cfg.nombreLegal} trata los datos personales recogidos a través de su sitio web.`,
    intro: 'Qué datos recogemos, para qué los usamos y qué derechos tienes sobre ellos.',
    secciones: [
      ['Responsable del tratamiento', [
        `${cfg.nombreLegal}, ${calle(cfg)}${cfg.contacto.ciudad}, Ecuador. Correo de contacto: ${cfg.contacto.email}.`
      ]],
      ['Datos que recogemos', [
        'Solo tratamos los datos que tú nos entregas voluntariamente:',
        ['Nombre, correo y teléfono cuando usas el formulario de contacto o nos escribes por WhatsApp.', 'Correo electrónico cuando te suscribes al boletín.', 'Datos de facturación y envío cuando realizas una compra.']
      ]],
      ['Finalidad', [
        'Usamos esos datos únicamente para responder tu consulta, gestionar tu pedido, emitir la factura correspondiente y, si lo autorizaste, enviarte el boletín editorial.'
      ]],
      ['Conservación', [
        'Conservamos los datos el tiempo necesario para cumplir la finalidad para la que fueron entregados y los plazos legales aplicables en materia tributaria y contable.'
      ]],
      ['Comunicación a terceros', [
        'No vendemos ni cedemos datos personales. Compartimos con la empresa de courier únicamente los datos necesarios para entregar el pedido, y con la administración tributaria lo que exige la normativa.'
      ]],
      ['Cookies', [
        'Este sitio no instala cookies publicitarias ni de seguimiento de terceros por defecto. Si en el futuro se habilita analítica web, se informará en esta página antes de activarla.'
      ]],
      ['Tus derechos', [
        'Puedes solicitar en cualquier momento el acceso, la rectificación, la eliminación o la oposición al tratamiento de tus datos escribiendo a nuestro correo de contacto. Responderemos en los plazos que establece la Ley Orgánica de Protección de Datos Personales del Ecuador.'
      ]],
      ['Seguridad', [
        'Aplicamos medidas razonables para proteger la información. Ningún sistema es infalible: si ocurriera un incidente que afecte tus datos, te lo comunicaremos.'
      ]]
    ]
  });
}

/* ------------------------------------------------------------------ */
/* Búsqueda y 404                                                      */
/* ------------------------------------------------------------------ */
export function paginaBuscar(ctx) {
  const { cfg } = ctx;
  const cuerpo = `
<section class="portada-seccion con-fondo">
  <img class="portada-fondo" src="/imagenes/portadas/catalogo.jpg" alt="" aria-hidden="true" loading="lazy">
  <div class="contenedor">
    <p class="sobretitulo claro">Catálogo, autores y artículos</p>
    <h1>Buscar</h1>
    <form class="buscador-grande" action="/buscar/" method="get" role="search">
      <label class="visualmente-oculto" for="q-grande">Término de búsqueda</label>
      <input type="search" id="q-grande" name="q" placeholder="Título, autor, ISBN, tema…" data-buscador-pagina autofocus>
      <button type="submit" class="boton boton-primario">${icono('busqueda')}<span>Buscar</span></button>
    </form>
  </div>
</section>

<section class="seccion">
  <div class="contenedor">
    <p class="conteo" data-resumen-busqueda></p>
    <div class="resultados-busqueda" data-resultados-busqueda></div>
  </div>
</section>`;

  return {
    ruta: '/buscar/',
    titulo: 'Buscar en el catálogo',
    descripcion: `Busca por título, autor, ISBN o tema dentro del catálogo de ${cfg.nombreLegal}.`,
    clase: 'p-buscar',
    noindex: true,
    migas: [{ texto: 'Inicio', url: '/' }, { texto: 'Buscar', url: '/buscar/' }],
    cuerpo
  };
}

export function pagina404(ctx) {
  const { cfg, libros } = ctx;
  const sugeridos = libros.filter((l) => l.esDestacado).slice(0, 3);
  const cuerpo = `
<section class="pagina-error">
  <div class="contenedor bloque-centrado">
    <p class="codigo-error">404</p>
    <h1>Esta página no existe</h1>
    <p class="bajada">Puede que el enlace esté desactualizado o que el título haya cambiado de dirección. Prueba con el buscador o vuelve al catálogo.</p>
    <div class="acciones-centradas">
      <a class="boton boton-primario" href="/libros/">Ir al catálogo</a>
      <a class="boton boton-fantasma" href="/">Volver al inicio</a>
    </div>
    <form class="buscador-grande" action="/buscar/" method="get" role="search">
      <label class="visualmente-oculto" for="q404">Buscar</label>
      <input type="search" id="q404" name="q" placeholder="Buscar un título o autor…">
      <button type="submit" class="boton boton-primario">${icono('busqueda')}<span>Buscar</span></button>
    </form>
  </div>
</section>

<section class="seccion seccion-alterna">
  <div class="contenedor">
    <h2 class="titulo-bloque">Quizá te interese</h2>
    <div class="rejilla-libros">${sugeridos.map((l) => tarjetaLibro(l, ctx)).join('')}</div>
  </div>
</section>`;

  return {
    ruta: '/404.html',
    titulo: 'Página no encontrada',
    descripcion: 'La página solicitada no existe o cambió de dirección.',
    clase: 'p-error',
    noindex: true,
    cuerpo
  };
}
