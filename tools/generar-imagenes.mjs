#!/usr/bin/env node
/**
 * Generador de imágenes con la API de Gemini.
 *
 * La clave NUNCA se escribe en el código ni se sube al repositorio: se lee de
 * la variable de entorno GEMINI_API_KEY o del archivo .env.local, que está
 * excluido de git.
 *
 * Uso:
 *   node tools/generar-imagenes.mjs modelos
 *       Lista los modelos de imagen disponibles para tu clave.
 *
 *   node tools/generar-imagenes.mjs portada <id-del-libro> ["indicaciones extra"]
 *       Genera la portada de un libro del catálogo, la guarda en
 *       public/imagenes/libros/ y actualiza data/books.json.
 *
 *   node tools/generar-imagenes.mjs imagen <ruta/destino.png> "<descripción>"
 *       Genera una imagen suelta en la ruta indicada.
 *
 * Opciones:
 *   --modelo=<nombre>   fuerza un modelo concreto
 *   --formato=<9:16|1:1|16:9|3:4|4:3>   proporción sugerida
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

/* ------------------------------------------------------------------ */
/* Clave                                                               */
/* ------------------------------------------------------------------ */
function leerClave() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();

  const archivo = path.join(RAIZ, '.env.local');
  if (fs.existsSync(archivo)) {
    for (const linea of fs.readFileSync(archivo, 'utf8').split('\n')) {
      const m = linea.match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '');
    }
  }

  console.error(`
  No encontré la clave de la API.

  Crea el archivo .env.local en la raíz del proyecto con esta única línea:

      GEMINI_API_KEY=tu-clave-de-google-ai-studio

  Ese archivo está excluido de git: la clave nunca sale de tu computadora.
`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Llamadas a la API                                                   */
/* ------------------------------------------------------------------ */
async function pedir(ruta, opciones = {}) {
  const clave = leerClave();
  const respuesta = await fetch(`${BASE}${ruta}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave, ...(opciones.headers || {}) }
  });

  const texto = await respuesta.text();
  let datos;
  try { datos = JSON.parse(texto); } catch { datos = { crudo: texto }; }

  if (!respuesta.ok) {
    const mensaje = datos?.error?.message || texto.slice(0, 400);
    // La clave podría aparecer en un mensaje de error: se oculta por si acaso.
    console.error(`\n  La API respondió ${respuesta.status}:\n  ${mensaje.replace(clave, '«clave oculta»')}\n`);
    if (respuesta.status === 403 || respuesta.status === 400) {
      console.error('  Revisa que la clave sea válida y que el modelo esté habilitado en tu cuenta.');
      console.error('  Prueba primero:  node tools/generar-imagenes.mjs modelos\n');
    }
    if (respuesta.status === 429) {
      console.error('  Se agotó la cuota del momento. Espera unos minutos y vuelve a intentar.\n');
    }
    process.exit(1);
  }
  return datos;
}

async function listarModelos() {
  const datos = await pedir('/models');
  const todos = datos.models || [];
  const deImagen = todos.filter((m) => /image|imagen/i.test(m.name));

  console.log(`\n  Modelos disponibles para tu clave: ${todos.length}`);
  console.log('  ─────────────────────────────────────────────');
  if (!deImagen.length) {
    console.log('  Ninguno parece generar imágenes. Modelos encontrados:\n');
    for (const m of todos.slice(0, 25)) console.log(`   · ${m.name.replace('models/', '')}`);
  } else {
    console.log('  Con capacidad de imagen:\n');
    for (const m of deImagen) {
      console.log(`   · ${m.name.replace('models/', '')}`);
      if (m.description) console.log(`     ${m.description.slice(0, 100)}`);
    }
  }
  console.log('');
}

/**
 * Modelos que se intentan, en orden, si no se indica uno concreto.
 * Verificados contra la cuenta de la editorial en agosto de 2026.
 * De mayor a menor calidad; si uno falla o agota cuota, se prueba el siguiente.
 */
const CANDIDATOS = [
  'gemini-3-pro-image',
  'gemini-3.1-flash-image',
  'gemini-2.5-flash-image'
];

async function generar(descripcion, modeloForzado) {
  const modelos = modeloForzado ? [modeloForzado] : CANDIDATOS;
  let ultimoError = null;

  for (const modelo of modelos) {
    try {
      const datos = await pedirSilencioso(`/models/${modelo}:generateContent`, {
        method: 'POST',
        body: JSON.stringify({
          contents: [{ parts: [{ text: descripcion }] }],
          generationConfig: { responseModalities: ['IMAGE'] }
        })
      });

      const partes = datos?.candidates?.[0]?.content?.parts || [];
      const imagen = partes.find((p) => p.inlineData || p.inline_data);
      if (imagen) {
        const bruto = imagen.inlineData || imagen.inline_data;
        console.log(`  Modelo utilizado: ${modelo}`);
        return {
          datos: Buffer.from(bruto.data, 'base64'),
          tipo: bruto.mimeType || bruto.mime_type || 'image/png'
        };
      }
      ultimoError = `El modelo ${modelo} respondió sin imagen.`;
    } catch (e) {
      ultimoError = `${modelo}: ${e.message}`;
    }
  }

  console.error(`\n  No se pudo generar la imagen.\n  ${ultimoError}\n`);
  console.error('  Ejecuta "node tools/generar-imagenes.mjs modelos" para ver cuáles');
  console.error('  admite tu clave, y vuelve a intentar con --modelo=<nombre>.\n');
  process.exit(1);
}

async function pedirSilencioso(ruta, opciones) {
  const clave = leerClave();
  const r = await fetch(`${BASE}${ruta}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave }
  });
  const t = await r.text();
  if (!r.ok) throw new Error((JSON.parse(t)?.error?.message || t).slice(0, 200).replace(clave, '«clave oculta»'));
  return JSON.parse(t);
}

/* ------------------------------------------------------------------ */
/* Órdenes                                                             */
/* ------------------------------------------------------------------ */
function extensionDe(tipo) {
  if (tipo.includes('jpeg') || tipo.includes('jpg')) return '.jpg';
  if (tipo.includes('webp')) return '.webp';
  return '.png';
}

function guardar(destinoSinExtension, imagen) {
  const destino = destinoSinExtension + extensionDe(imagen.tipo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, imagen.datos);
  const kb = Math.round(imagen.datos.length / 1024);
  console.log(`  Guardada: ${path.relative(RAIZ, destino)} (${kb} KB)`);
  return destino;
}

const ESTILO_PORTADA = [
  'Portada de libro académico, formato vertical 2:3, con aire profesional de sello editorial.',
  'Composición centrada, sin texto de ningún tipo, sin letras, sin palabras, sin firmas.',
  'Paleta sobria y elegante, buen contraste, textura sutil de papel impreso.',
  'Nada de collage caótico ni marcas de agua.'
].join(' ');

async function ordenPortada(argumentos, opciones) {
  const id = argumentos[0];
  if (!id) {
    console.error('\n  Falta el identificador del libro.\n  Ejemplo: node tools/generar-imagenes.mjs portada narrativas-contra-la-violencia\n');
    process.exit(1);
  }

  const rutaLibros = path.join(RAIZ, 'data', 'books.json');
  const libros = JSON.parse(fs.readFileSync(rutaLibros, 'utf8'));
  const libro = libros.find((l) => l.id === id);
  if (!libro) {
    console.error(`\n  No existe ningún libro con el identificador "${id}".`);
    console.error(`  Disponibles: ${libros.map((l) => l.id).join(', ')}\n`);
    process.exit(1);
  }

  const categorias = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'categories.json'), 'utf8'));
  const categoria = categorias.find((c) => c.id === libro.categoria);

  const descripcion = [
    ESTILO_PORTADA,
    `Tema del libro: ${libro.titulo}.`,
    libro.subtitulo ? `Enfoque: ${libro.subtitulo}.` : '',
    libro.resumen ? `Contenido: ${libro.resumen}` : '',
    categoria ? `Área: ${categoria.nombre}. Color dominante sugerido: ${categoria.color}.` : '',
    argumentos.slice(1).join(' ')
  ].filter(Boolean).join(' ');

  console.log(`\n  Generando portada de "${libro.titulo}"…`);
  const imagen = await generar(descripcion, opciones.modelo);
  const destino = guardar(path.join(RAIZ, 'public', 'imagenes', 'libros', libro.id), imagen);

  libro.portada = `/imagenes/libros/${path.basename(destino)}`;
  fs.writeFileSync(rutaLibros, `${JSON.stringify(libros, null, 2)}\n`);
  console.log(`  Ficha actualizada: portada = ${libro.portada}`);
  console.log('\n  Ejecuta "npm run build" para verla en el sitio.\n');
}

async function ordenImagen(argumentos, opciones) {
  const destino = argumentos[0];
  const descripcion = argumentos.slice(1).join(' ');
  if (!destino || !descripcion) {
    console.error('\n  Uso: node tools/generar-imagenes.mjs imagen public/imagenes/algo "descripción de la imagen"\n');
    process.exit(1);
  }
  const proporcion = opciones.formato ? ` Proporción de la imagen: ${opciones.formato}.` : '';
  console.log('\n  Generando imagen…');
  const imagen = await generar(descripcion + proporcion, opciones.modelo);
  guardar(path.join(RAIZ, destino.replace(/\.(png|jpg|jpeg|webp)$/i, '')), imagen);
  console.log('');
}

/* ------------------------------------------------------------------ */
const argv = process.argv.slice(2);
const opciones = {};
const posicionales = [];
for (const a of argv) {
  const m = a.match(/^--([a-z]+)=(.*)$/);
  if (m) opciones[m[1]] = m[2];
  else posicionales.push(a);
}

const orden = posicionales.shift();

if (orden === 'modelos') await listarModelos();
else if (orden === 'portada') await ordenPortada(posicionales, opciones);
else if (orden === 'imagen') await ordenImagen(posicionales, opciones);
else {
  console.log(`
  Generador de imágenes de Saberes Internacionales

    node tools/generar-imagenes.mjs modelos
    node tools/generar-imagenes.mjs portada <id-del-libro> ["indicaciones"]
    node tools/generar-imagenes.mjs imagen <ruta> "<descripción>" [--formato=16:9]

  Opciones:  --modelo=<nombre>   --formato=<9:16|1:1|16:9|3:4|4:3>
`);
}
