#!/usr/bin/env node
/**
 * Servidor local de desarrollo.
 *
 *   npm run dev   ->  http://localhost:4321
 *
 * Reconstruye el sitio cada vez que cambia un archivo de data/, src/,
 * public/ o site.config.json. Sirve dist/ con URLs limpias, igual que
 * Cloudflare Pages.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RAIZ, 'dist');
const PUERTO = Number(process.env.PORT) || 4321;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function construir() {
  const r = spawnSync(process.execPath, [path.join(RAIZ, 'src', 'build.mjs')], { stdio: 'inherit' });
  return r.status === 0;
}

function resolver(urlRuta) {
  const limpia = decodeURIComponent(urlRuta.split('?')[0]);
  const candidatos = [
    path.join(DIST, limpia),
    path.join(DIST, limpia, 'index.html'),
    path.join(DIST, `${limpia}.html`)
  ];
  for (const c of candidatos) {
    if (!path.resolve(c).startsWith(DIST)) continue; // evita salir de dist/
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

construir();

const servidor = http.createServer((req, res) => {
  const archivo = resolver(req.url);
  if (!archivo) {
    const error404 = path.join(DIST, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(error404) ? fs.readFileSync(error404) : 'No encontrado');
    return;
  }
  const tipo = TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': tipo, 'Cache-Control': 'no-store' });
  res.end(fs.readFileSync(archivo));
});

servidor.listen(PUERTO, () => {
  console.log(`\n  Servidor local en http://localhost:${PUERTO}`);
  console.log('  Guarda cualquier archivo de data/, src/ o public/ y se reconstruye solo.\n');
});

let pendiente = null;
for (const carpeta of ['data', 'src', 'public', 'admin']) {
  const ruta = path.join(RAIZ, carpeta);
  if (!fs.existsSync(ruta)) continue;
  fs.watch(ruta, { recursive: true }, () => {
    clearTimeout(pendiente);
    pendiente = setTimeout(() => {
      console.log('\n  Cambio detectado, reconstruyendo…');
      construir();
    }, 200);
  });
}
fs.watchFile(path.join(RAIZ, 'site.config.json'), { interval: 500 }, () => {
  console.log('\n  Configuración modificada, reconstruyendo…');
  construir();
});
