#!/usr/bin/env node
/**
 * deploy.mjs — Construye el sitio y lo publica en Cloudflare.
 *
 * Uso:
 *   node deploy.mjs          → build + deploy
 *   node deploy.mjs --solo   → solo deploy (sin reconstruir)
 *
 * Requiere el archivo .env.local con:
 *   CLOUDFLARE_API_TOKEN=tu-token-aqui
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = dirname(fileURLToPath(import.meta.url));
const ENV_FILE = resolve(DIR, '.env.local');

// ── 1. Cargar el token desde .env.local ──────────────────────────────────────
if (!existsSync(ENV_FILE)) {
  console.error('\n❌  No se encontró .env.local');
  console.error('    Crea ese archivo con este contenido:');
  console.error('    CLOUDFLARE_API_TOKEN=tu-token-aqui\n');
  process.exit(1);
}

const env = readFileSync(ENV_FILE, 'utf8');
const match = env.match(/^CLOUDFLARE_API_TOKEN=(.+)$/m);

if (!match || !match[1].trim()) {
  console.error('\n❌  CLOUDFLARE_API_TOKEN no encontrado o vacío en .env.local\n');
  process.exit(1);
}

const token = match[1].trim();
const soloArgs = process.argv.includes('--solo');

const run = (cmd, label) => {
  console.log(`\n▶  ${label}`);
  execSync(cmd, {
    stdio: 'inherit',
    cwd: DIR,
    env: { ...process.env, CLOUDFLARE_API_TOKEN: token }
  });
};

// ── 2. Build ─────────────────────────────────────────────────────────────────
if (!soloArgs) {
  run('node src/build.mjs', 'Construyendo el sitio…');
}

// ── 3. Deploy ─────────────────────────────────────────────────────────────────
run('npx wrangler deploy', 'Publicando en Cloudflare…');

console.log('\n✅  Listo. El sitio está actualizado en saberesinternacionales.org\n');
