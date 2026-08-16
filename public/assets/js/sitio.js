/* =========================================================================
   Saberes Internacionales — comportamiento del sitio
   Vanilla JS, sin dependencias. Todo degrada con elegancia: si el script
   no carga, el sitio sigue siendo navegable porque el HTML ya viene
   generado desde el servidor.
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  function normalizar(texto) {
    return String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* ------------------------------------------------------------------ */
  /* Aviso de demostración                                               */
  /* ------------------------------------------------------------------ */
  (function avisoDemo() {
    var aviso = $('[data-aviso-demo]');
    if (!aviso) return;
    try {
      if (localStorage.getItem('si-aviso-demo') === 'cerrado') { aviso.remove(); return; }
    } catch (e) { /* modo privado */ }
    var boton = $('[data-cerrar-aviso]', aviso);
    if (boton) boton.addEventListener('click', function () {
      aviso.remove();
      try { localStorage.setItem('si-aviso-demo', 'cerrado'); } catch (e) {}
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Cabecera: menú móvil, categorías, scroll                            */
  /* ------------------------------------------------------------------ */
  (function cabecera() {
    var alternar = $('[data-alternar-menu]');
    var nav = $('#nav-principal');
    if (alternar && nav) {
      alternar.addEventListener('click', function () {
        var abierto = nav.classList.toggle('abierto');
        alternar.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        alternar.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      });
    }

    var botonCat = $('[data-alternar-categorias]');
    var listaCat = $('#lista-categorias');
    if (botonCat && listaCat) {
      botonCat.addEventListener('click', function (e) {
        e.stopPropagation();
        var abierto = listaCat.hidden;
        listaCat.hidden = !abierto;
        botonCat.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      });
      document.addEventListener('click', function (e) {
        if (!listaCat.hidden && !listaCat.contains(e.target) && e.target !== botonCat) {
          listaCat.hidden = true;
          botonCat.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !listaCat.hidden) {
          listaCat.hidden = true;
          botonCat.setAttribute('aria-expanded', 'false');
          botonCat.focus();
        }
      });
    }

    var cab = $('#cabecera');
    var subir = $('[data-subir]');
    var ultimo = 0;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      if (cab) cab.classList.toggle('compacta', y > 140);
      if (subir) subir.classList.toggle('visible', y > 600);
      ultimo = y;
    }, { passive: true });

    if (subir) subir.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Carrusel principal (hero)                                           */
  /* ------------------------------------------------------------------ */
  (function hero() {
    var caja = $('[data-hero]');
    if (!caja) return;
    var slides = $$('[data-diapositiva]', caja);
    if (slides.length < 2) return;
    var puntos = $$('[data-punto]', caja);
    var actual = 0;
    var timer = null;

    function mostrar(i) {
      actual = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        if (n === actual) s.setAttribute('data-activa', '');
        else s.removeAttribute('data-activa');
      });
      puntos.forEach(function (p, n) { p.classList.toggle('activo', n === actual); });
    }
    function arrancar() {
      if (reduceMotion) return;
      detener();
      timer = setInterval(function () { mostrar(actual + 1); }, 7000);
    }
    function detener() { if (timer) clearInterval(timer); }

    var izq = $('[data-hero-izq]', caja);
    var der = $('[data-hero-der]', caja);
    if (izq) izq.addEventListener('click', function () { mostrar(actual - 1); arrancar(); });
    if (der) der.addEventListener('click', function () { mostrar(actual + 1); arrancar(); });
    puntos.forEach(function (p, n) {
      p.addEventListener('click', function () { mostrar(n); arrancar(); });
    });

    caja.addEventListener('mouseenter', detener);
    caja.addEventListener('mouseleave', arrancar);
    caja.addEventListener('focusin', detener);

    // Deslizar con el dedo.
    var x0 = null;
    caja.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    caja.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) mostrar(actual + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });

    arrancar();
  })();

  /* ------------------------------------------------------------------ */
  /* Carruseles de tarjetas                                              */
  /* ------------------------------------------------------------------ */
  $$('[data-carrusel]').forEach(function (car) {
    var pista = $('.carrusel-pista', car);
    var izq = $('[data-carrusel-izq]', car);
    var der = $('[data-carrusel-der]', car);
    if (!pista) return;

    function paso() {
      var primera = pista.firstElementChild;
      var ancho = primera ? primera.getBoundingClientRect().width + 24 : 260;
      return Math.max(ancho, pista.clientWidth * 0.8);
    }
    function estado() {
      var max = pista.scrollWidth - pista.clientWidth - 2;
      if (izq) izq.disabled = pista.scrollLeft <= 2;
      if (der) der.disabled = pista.scrollLeft >= max;
    }
    if (izq) izq.addEventListener('click', function () { pista.scrollBy({ left: -paso(), behavior: 'smooth' }); });
    if (der) der.addEventListener('click', function () { pista.scrollBy({ left: paso(), behavior: 'smooth' }); });
    pista.addEventListener('scroll', debounce(estado, 80), { passive: true });
    window.addEventListener('resize', debounce(estado, 150));
    estado();
  });

  /* ------------------------------------------------------------------ */
  /* Índice de búsqueda compartido                                       */
  /* ------------------------------------------------------------------ */
  var indicePromesa = null;
  function cargarIndice() {
    if (!indicePromesa) {
      indicePromesa = fetch('/indice-busqueda.json')
        .then(function (r) { return r.ok ? r.json() : []; })
        .catch(function () { return []; });
    }
    return indicePromesa;
  }

  function buscar(indice, consulta) {
    var terminos = normalizar(consulta).split(/\s+/).filter(Boolean);
    if (!terminos.length) return [];
    return indice
      .map(function (item) {
        var texto = normalizar(item.texto);
        var titulo = normalizar(item.titulo);
        var puntos = 0;
        for (var i = 0; i < terminos.length; i += 1) {
          var t = terminos[i];
          if (texto.indexOf(t) === -1) return null;
          puntos += 1;
          if (titulo.indexOf(t) === 0) puntos += 4;
          else if (titulo.indexOf(t) !== -1) puntos += 2;
          if (item.t === 'libro') puntos += 0.5;
        }
        return { item: item, puntos: puntos };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.puntos - a.puntos; })
      .map(function (r) { return r.item; });
  }

  var ETIQUETA_TIPO = { libro: 'Libro', autor: 'Autor', articulo: 'Artículo' };

  /* ------------------------------------------------------------------ */
  /* Sugerencias del buscador de cabecera                                */
  /* ------------------------------------------------------------------ */
  (function sugerencias() {
    var input = $('[data-buscador]');
    var caja = $('[data-sugerencias]');
    if (!input || !caja) return;
    var resultados = [];
    var seleccion = -1;

    function pintar(lista) {
      resultados = lista.slice(0, 6);
      seleccion = -1;
      if (!resultados.length) {
        caja.innerHTML = '<p class="sin-resultados">Sin coincidencias. Prueba con otro título, autor o tema.</p>';
        caja.hidden = false;
        return;
      }
      caja.innerHTML = resultados.map(function (r) {
        return '<a href="' + r.url + '"><img src="' + r.img + '" alt="" loading="lazy">' +
          '<span><strong>' + r.titulo + '</strong><span>' + (ETIQUETA_TIPO[r.t] || '') +
          (r.sub ? ' · ' + r.sub : '') + '</span></span></a>';
      }).join('');
      caja.hidden = false;
    }

    var alEscribir = debounce(function () {
      var q = input.value.trim();
      if (q.length < 2) { caja.hidden = true; return; }
      cargarIndice().then(function (indice) { pintar(buscar(indice, q)); });
    }, 160);

    input.addEventListener('input', alEscribir);
    input.addEventListener('focus', function () { if (input.value.trim().length >= 2) alEscribir(); });

    input.addEventListener('keydown', function (e) {
      var enlaces = $$('a', caja);
      if (!enlaces.length || caja.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        seleccion += e.key === 'ArrowDown' ? 1 : -1;
        if (seleccion < 0) seleccion = enlaces.length - 1;
        if (seleccion >= enlaces.length) seleccion = 0;
        enlaces.forEach(function (a, i) { a.classList.toggle('activa', i === seleccion); });
      } else if (e.key === 'Enter' && seleccion >= 0) {
        e.preventDefault();
        window.location.href = enlaces[seleccion].getAttribute('href');
      } else if (e.key === 'Escape') {
        caja.hidden = true;
      }
    });

    document.addEventListener('click', function (e) {
      if (!caja.contains(e.target) && e.target !== input) caja.hidden = true;
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Página /buscar/                                                     */
  /* ------------------------------------------------------------------ */
  (function paginaBuscar() {
    var contenedor = $('[data-resultados-busqueda]');
    if (!contenedor) return;
    var resumen = $('[data-resumen-busqueda]');
    var input = $('[data-buscador-pagina]');
    var q = new URLSearchParams(window.location.search).get('q') || '';
    if (input && q) input.value = q;

    function render(lista, consulta) {
      if (!consulta) {
        if (resumen) resumen.textContent = 'Escribe un término para buscar en el catálogo.';
        contenedor.innerHTML = '';
        return;
      }
      if (resumen) {
        resumen.innerHTML = '<strong>' + lista.length + '</strong> ' +
          (lista.length === 1 ? 'resultado' : 'resultados') + ' para «' + consulta + '»';
      }
      contenedor.innerHTML = lista.length
        ? lista.map(function (r) {
          return '<a class="resultado tipo-' + r.t + '" href="' + r.url + '">' +
            '<img src="' + r.img + '" alt="" loading="lazy">' +
            '<div><h3>' + r.titulo + '</h3><p>' + (r.sub || '') + '</p></div>' +
            '<span class="etiqueta-tipo">' + (ETIQUETA_TIPO[r.t] || '') + '</span></a>';
        }).join('')
        : '<div class="vacio"><p>No encontramos nada con ese término. Revisa la ortografía o explora el <a href="/libros/">catálogo completo</a>.</p></div>';
    }

    cargarIndice().then(function (indice) {
      render(buscar(indice, q), q);
      if (input) {
        input.addEventListener('input', debounce(function () {
          var v = input.value.trim();
          render(buscar(indice, v), v);
          var nueva = v ? '?q=' + encodeURIComponent(v) : location.pathname;
          history.replaceState(null, '', nueva);
        }, 200));
      }
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Filtros del catálogo                                                */
  /* ------------------------------------------------------------------ */
  (function filtros() {
    var rejilla = $('[data-rejilla]');
    if (!rejilla) return;
    var formulario = $('[data-filtros]');
    var orden = $('[data-orden]');
    var conteo = $('[data-conteo]');
    var sinResultados = $('[data-sin-resultados]');
    var rango = $('[data-rango-precio]');
    var salida = $('[data-salida-precio]');
    var tarjetas = $$('.tarjeta-libro', rejilla);

    var alternarFiltros = $('[data-alternar-filtros]');
    var panel = $('#panel-filtros');
    if (alternarFiltros && panel) {
      alternarFiltros.addEventListener('click', function () {
        var abierto = panel.classList.toggle('abierto');
        alternarFiltros.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      });
    }

    function valores(nombre) {
      return $$('input[name="' + nombre + '"]:checked', formulario || document)
        .map(function (i) { return i.value; });
    }

    function aplicar() {
      var cats = valores('categoria');
      var estados = valores('estado');
      var soloNuevos = valores('nuevo').length > 0;
      var precioMax = rango ? Number(rango.value) : Infinity;
      var limite = (rango && Number(rango.value) >= Number(rango.max)) ? Infinity : precioMax;
      var visibles = 0;

      tarjetas.forEach(function (t) {
        var ok = true;
        if (cats.length && cats.indexOf(t.dataset.categoria) === -1) ok = false;
        if (ok && Number(t.dataset.precio) > limite) ok = false;
        if (ok && soloNuevos && t.dataset.nuevo !== '1') ok = false;
        if (ok && estados.length) {
          var disp = t.querySelector('.disp');
          var texto = disp ? normalizar(disp.textContent) : '';
          var coincide = estados.some(function (e) {
            return e === 'disponible' ? texto.indexOf('disponible') !== -1 : texto.indexOf('preventa') !== -1;
          });
          if (!coincide) ok = false;
        }
        t.hidden = !ok;
        if (ok) visibles += 1;
      });

      if (conteo) conteo.textContent = visibles;
      if (sinResultados) sinResultados.hidden = visibles !== 0;
      if (salida && rango) {
        salida.textContent = Number(rango.value) >= Number(rango.max)
          ? 'Sin límite' : 'Hasta $' + rango.value;
      }
    }

    function ordenar(criterio) {
      var lista = tarjetas.slice();
      var comparadores = {
        novedades: function (a, b) { return Number(b.dataset.anio) - Number(a.dataset.anio); },
        populares: function (a, b) { return Number(b.dataset.valoracion) - Number(a.dataset.valoracion); },
        'precio-asc': function (a, b) { return Number(a.dataset.precio) - Number(b.dataset.precio); },
        'precio-desc': function (a, b) { return Number(b.dataset.precio) - Number(a.dataset.precio); },
        titulo: function (a, b) { return a.dataset.titulo.localeCompare(b.dataset.titulo, 'es'); }
      };
      if (comparadores[criterio]) lista.sort(comparadores[criterio]);
      lista.forEach(function (t) { rejilla.appendChild(t); });
    }

    if (formulario) formulario.addEventListener('change', aplicar);
    if (rango) rango.addEventListener('input', aplicar);
    if (orden) orden.addEventListener('change', function () { ordenar(orden.value); });

    var limpiar = $('[data-limpiar-filtros]');
    if (limpiar && formulario) {
      limpiar.addEventListener('click', function () {
        formulario.reset();
        if (rango) rango.value = rango.max;
        aplicar();
      });
    }

    // ?orden=populares en la URL preselecciona el criterio.
    var ordenUrl = new URLSearchParams(window.location.search).get('orden');
    if (ordenUrl && orden) {
      var existe = $$('option', orden).some(function (o) { return o.value === ordenUrl; });
      if (existe) { orden.value = ordenUrl; ordenar(ordenUrl); }
    }
    aplicar();
  })();

  /* ------------------------------------------------------------------ */
  /* Pestañas de la ficha de libro                                       */
  /* ------------------------------------------------------------------ */
  $$('[data-pestanas]').forEach(function (caja) {
    var botones = $$('[role="tab"]', caja);
    var paneles = $$('[role="tabpanel"]', caja);

    function activar(i) {
      botones.forEach(function (b, n) { b.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
      paneles.forEach(function (p, n) { p.hidden = n !== i; });
    }
    botones.forEach(function (b, i) {
      b.addEventListener('click', function () { activar(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + botones.length) % botones.length;
        botones[n].focus();
        activar(n);
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Copiar enlace                                                       */
  /* ------------------------------------------------------------------ */
  $$('[data-copiar]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var texto = boton.getAttribute('data-copiar');
      var previo = boton.getAttribute('aria-label');
      function ok() {
        boton.setAttribute('aria-label', 'Enlace copiado');
        boton.classList.add('copiado');
        setTimeout(function () { boton.setAttribute('aria-label', previo); boton.classList.remove('copiado'); }, 2000);
      }
      if (navigator.clipboard) navigator.clipboard.writeText(texto).then(ok, function () {});
      else {
        var tmp = document.createElement('textarea');
        tmp.value = texto; document.body.appendChild(tmp); tmp.select();
        try { document.execCommand('copy'); ok(); } catch (e) {}
        document.body.removeChild(tmp);
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Filtro del blog por categoría                                       */
  /* ------------------------------------------------------------------ */
  (function filtroBlog() {
    var barra = $('[data-filtro-blog]');
    var rejilla = $('[data-rejilla-blog]');
    if (!barra || !rejilla) return;
    barra.addEventListener('click', function (e) {
      var boton = e.target.closest('button');
      if (!boton) return;
      var etiqueta = boton.getAttribute('data-etiqueta');
      $$('button', barra).forEach(function (b) { b.classList.toggle('activo', b === boton); });
      $$('[data-categoria-entrada]', rejilla).forEach(function (d) {
        d.hidden = etiqueta !== 'todas' && d.getAttribute('data-categoria-entrada') !== etiqueta;
      });
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Formulario de contacto -> WhatsApp o correo                         */
  /* ------------------------------------------------------------------ */
  (function contacto() {
    var form = $('[data-contacto]');
    if (!form) return;
    var estado = $('[data-contacto-estado]', form);
    var via = 'whatsapp';

    $$('[data-enviar]', form).forEach(function (b) {
      b.addEventListener('click', function () { via = b.getAttribute('data-enviar'); });
    });

    // Si se llega desde una ficha (?libro=id) se precarga el motivo.
    var params = new URLSearchParams(window.location.search);
    var asunto = $('#asunto', form);
    var mensaje = $('#mensaje', form);
    if (params.get('libro') && asunto && mensaje) {
      asunto.value = 'Pedido de un libro';
      mensaje.value = 'Me interesa el libro con referencia "' + params.get('libro') + '". ¿Está disponible?';
    }
    if (params.get('autor') && asunto && mensaje) {
      asunto.value = 'Prensa y entrevistas';
      mensaje.value = 'Quisiera contactar al autor con referencia "' + params.get('autor') + '".';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalido = null;
      $$('[required]', form).forEach(function (campo) {
        var vacio = campo.type === 'checkbox' ? !campo.checked : !campo.value.trim();
        campo.classList.toggle('error', vacio);
        if (vacio && !invalido) invalido = campo;
      });
      if (invalido) {
        if (estado) estado.textContent = 'Completa los campos obligatorios antes de enviar.';
        invalido.focus();
        return;
      }

      var d = new FormData(form);
      var cuerpo = [
        'Nombre: ' + d.get('nombre'),
        'Correo: ' + d.get('email'),
        d.get('telefono') ? 'Teléfono: ' + d.get('telefono') : '',
        'Motivo: ' + d.get('asunto'),
        '',
        d.get('mensaje')
      ].filter(Boolean).join('\n');

      if (via === 'whatsapp') {
        var numero = (document.body.getAttribute('data-wa') || '').replace(/\D/g, '');
        var enlaceWa = $('.boton-wa[href*="wa.me"]');
        if (!numero && enlaceWa) {
          var m = enlaceWa.getAttribute('href').match(/wa\.me\/(\d+)/);
          if (m) numero = m[1];
        }
        window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(cuerpo), '_blank', 'noopener');
        if (estado) estado.textContent = 'Se abrió WhatsApp con tu mensaje listo para enviar.';
      } else {
        var correo = (document.querySelector('a[href^="mailto:"]') || {}).href || 'mailto:';
        window.location.href = correo.split('?')[0] +
          '?subject=' + encodeURIComponent(d.get('asunto') + ' — ' + d.get('nombre')) +
          '&body=' + encodeURIComponent(cuerpo);
        if (estado) estado.textContent = 'Se abrió tu programa de correo con el mensaje redactado.';
      }
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Boletín                                                             */
  /* ------------------------------------------------------------------ */
  (function boletin() {
    var form = $('[data-boletin]');
    if (!form) return;
    var estado = $('[data-boletin-estado]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input[type="email"]', form);
      if (!input || !input.value.trim() || input.value.indexOf('@') === -1) {
        if (estado) estado.textContent = 'Escribe un correo válido.';
        return;
      }
      var correo = (document.querySelector('.pie a[href^="mailto:"]') || {}).href || 'mailto:';
      window.location.href = correo.split('?')[0] +
        '?subject=' + encodeURIComponent('Suscripción al boletín') +
        '&body=' + encodeURIComponent('Quiero suscribirme al boletín con el correo: ' + input.value.trim());
      if (estado) estado.textContent = 'Se abrió tu programa de correo para confirmar la suscripción.';
      form.reset();
    });
  })();
})();

/* =========================================================================
   Movimiento: aparición al desplazarse y cifras que cuentan solas.
   Se añade por JavaScript a propósito: si el script no carga, el contenido
   se ve igual, nunca queda invisible.
   ========================================================================= */
(function () {
  'use strict';

  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quieto || !('IntersectionObserver' in window)) return;

  /* ---- Aparición progresiva --------------------------------------------- */
  var GRUPOS = [
    '.encabezado-seccion', '.titulo-bloque', '.ventaja', '.tarjeta-categoria-grande',
    '.rejilla-libros > .tarjeta-libro', '.rejilla-autores > .tarjeta-autor',
    '.rejilla-entradas > *', '.coleccion', '.servicio', '.linea-pasos li',
    '.cifras', '.franja-rejilla > div', '.banda-cta-fila > *', '.entrada-destacada',
    '.acordeon-item', '.ficha-visual', '.ficha-datos', '.perfil-datos',
    '.tarjeta-lateral', '.prosa > h2', '.formulario-envoltura', '.datos-contacto'
  ];

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      observador.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  GRUPOS.forEach(function (selector) {
    var elementos = $$(selector);
    elementos.forEach(function (el, i) {
      if (el.hasAttribute('data-revelar')) return;
      // Lo que ya está en pantalla al cargar no se anima: evita el parpadeo.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      el.setAttribute('data-revelar', '');
      el.setAttribute('data-r', String(Math.min(5, i % 6)));
      observador.observe(el);
    });
  });

  /* ---- Cifras animadas --------------------------------------------------- */
  var contadores = $$('.cifras strong, .perfil-cifras strong');
  if (!contadores.length) return;

  var vigilante = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      contar(e.target);
      vigilante.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  contadores.forEach(function (c) { vigilante.observe(c); });

  function contar(el) {
    var destino = parseInt(el.textContent.replace(/\D/g, ''), 10);
    if (!destino || destino > 100000) return;
    var duracion = 1100;
    var inicio = performance.now();
    var sufijo = el.textContent.replace(/[\d\s]/g, '');
    function paso(ahora) {
      var t = Math.min(1, (ahora - inicio) / duracion);
      var suave = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(destino * suave) + sufijo;
      if (t < 1) requestAnimationFrame(paso);
    }
    el.textContent = '0' + sufijo;
    requestAnimationFrame(paso);
  }
})();
