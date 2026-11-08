/* Arquitechtura AGIS · Dashboard — servidor mínimo (Node >= 18, sin dependencias)
   - Sirve /public
   - API JSON:  GET /api/db   ·   PUT /api/db/:coleccion
   - Persistencia en DATA_DIR/db.json (escritura atómica + respaldo diario)
   - Acceso protegido opcional con AUTH_USER / AUTH_PASS (Basic Auth)        */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = +process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PUBLIC = path.join(__dirname, 'public');
const KEYS = new Set(['clientes', 'board', 'reportes', 'config', 'seeded']);
const AUTH_USER = process.env.AUTH_USER || '';
const AUTH_PASS = process.env.AUTH_PASS || '';
const MAX_BODY = 15 * 1024 * 1024;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp' };

fs.mkdirSync(path.join(DATA_DIR, 'backups'), { recursive: true });
let db = {};
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (e) { db = {}; }

let writing = Promise.resolve();
function persist() {
  writing = writing.then(async () => {
    const tmp = DB_FILE + '.tmp';
    await fs.promises.writeFile(tmp, JSON.stringify(db));
    await fs.promises.rename(tmp, DB_FILE);
    const day = new Date().toISOString().slice(0, 10);
    const bk = path.join(DATA_DIR, 'backups', `db-${day}.json`);
    if (!fs.existsSync(bk)) {
      await fs.promises.copyFile(DB_FILE, bk);
      const files = (await fs.promises.readdir(path.join(DATA_DIR, 'backups'))).sort();
      for (const f of files.slice(0, Math.max(0, files.length - 30))) await fs.promises.unlink(path.join(DATA_DIR, 'backups', f));
    }
  }).catch(err => console.error('Error al guardar:', err));
  return writing;
}

function safeEq(a, b) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); }
function authorized(req) {
  if (!AUTH_USER) return true;
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const [u, ...p] = Buffer.from(h.slice(6), 'base64').toString().split(':');
  return safeEq(u, AUTH_USER) && safeEq(p.join(':'), AUTH_PASS);
}
function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (!authorized(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Arquitechtura AGIS", charset="UTF-8"' });
    return res.end('Acceso restringido');
  }
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);

  if (p === '/api/health') return send(res, 200, { ok: true });
  if (p === '/api/db' && req.method === 'GET') return send(res, 200, db);
  const m = /^\/api\/db\/([a-z]+)$/.exec(p);
  if (m && req.method === 'PUT') {
    if (!KEYS.has(m[1])) return send(res, 400, { error: 'colección inválida' });
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { send(res, 413, { error: 'demasiado grande' }); req.destroy(); } else chunks.push(c); });
    req.on('end', async () => {
      if (res.writableEnded) return;
      try { db[m[1]] = JSON.parse(Buffer.concat(chunks).toString('utf8')); await persist(); send(res, 200, { ok: true }); }
      catch (e) { send(res, 400, { error: 'JSON inválido' }); }
    });
    return;
  }
  if (p.startsWith('/api/')) return send(res, 404, { error: 'no encontrado' });

  // Archivos estáticos
  let file = path.normalize(path.join(PUBLIC, p === '/' ? 'index.html' : p));
  if (!file.startsWith(PUBLIC)) return send(res, 403, 'Prohibido', 'text/plain');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) file = path.join(PUBLIC, 'index.html');
    fs.readFile(file, (e2, buf) => {
      if (e2) return send(res, 404, 'No encontrado', 'text/plain');
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=300' });
      res.end(buf);
    });
  });
});

server.listen(PORT, () => console.log(`AGIS Dashboard en http://0.0.0.0:${PORT}  ·  datos: ${DB_FILE}  ·  auth: ${AUTH_USER ? 'activa' : 'desactivada'}`));
