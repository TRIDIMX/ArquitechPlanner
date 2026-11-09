/* Arquitechtura AGIS · Dashboard — servidor (Node >= 18, sin dependencias)
   - Login con sesión (cookie HttpOnly) · bloqueo de 5 intentos fallidos por IP durante 15 min
   - Usuarios con perfil y módulos permitidos (admin principal definido en AUTH_USER / AUTH_PASS)
   - API JSON con permisos por módulo · subida de imágenes · respaldos diarios          */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = +process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const UPLOADS = path.join(DATA_DIR, 'uploads');
const PUBLIC = path.join(__dirname, 'public');
const ADMIN_USER = (process.env.AUTH_USER || '').trim().toLowerCase();
const ADMIN_PASS = process.env.AUTH_PASS || '';
const ADMIN_NAME = process.env.AUTH_NAME || 'Administrador';
const TRUST_PROXY = process.env.TRUST_PROXY !== '0';
const SESSION_MS = (+process.env.SESSION_DAYS || 7) * 864e5;
const MAX_FAILS = 5, LOCK_MS = 15 * 60 * 1000;
const MAX_BODY = 60 * 1024 * 1024, MAX_IMG = 6 * 1024 * 1024;
const MODULES = ['clientes', 'actividades', 'reporte', 'proyectos', 'monitor'];
const ROLES = ['admin', 'colaborador'];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp' };

fs.mkdirSync(path.join(DATA_DIR, 'backups'), { recursive: true });
fs.mkdirSync(UPLOADS, { recursive: true });
const readJSONFile = (f, def) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return def; } };
let db = readJSONFile(DB_FILE, {});
let users = readJSONFile(USERS_FILE, []);

/* ---------- Persistencia ---------- */
let qDb = Promise.resolve(), qUsers = Promise.resolve();
async function atomicWrite(file, data) { const tmp = file + '.tmp'; await fs.promises.writeFile(tmp, data); await fs.promises.rename(tmp, file); }
function persistDb() {
  qDb = qDb.then(async () => {
    await atomicWrite(DB_FILE, JSON.stringify(db));
    const day = new Date().toISOString().slice(0, 10), dir = path.join(DATA_DIR, 'backups'), bk = path.join(dir, `db-${day}.json`);
    if (!fs.existsSync(bk)) {
      await fs.promises.copyFile(DB_FILE, bk);
      const files = (await fs.promises.readdir(dir)).filter(f => f.startsWith('db-')).sort();
      for (const f of files.slice(0, Math.max(0, files.length - 30))) await fs.promises.unlink(path.join(dir, f));
    }
  }).catch(err => console.error('Error al guardar db:', err));
  return qDb;
}
function persistUsers() { qUsers = qUsers.then(() => atomicWrite(USERS_FILE, JSON.stringify(users, null, 1))).catch(e => console.error('Error al guardar usuarios:', e)); return qUsers; }

/* ---------- Usuarios / contraseñas ---------- */
const sha = s => crypto.createHash('sha256').update(String(s)).digest();
const safeEq = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const hashPass = (pass, salt) => crypto.scryptSync(String(pass), salt, 64).toString('hex');
function findUser(username) {
  const u = String(username || '').trim().toLowerCase();
  if (!u) return null;
  if (ADMIN_USER && u === ADMIN_USER) return { username: ADMIN_USER, name: ADMIN_NAME, role: 'admin', modules: MODULES, active: true, builtin: true };
  return users.find(x => x.username === u) || null;
}
function checkPass(u, pass) {
  if (u.builtin) return !!ADMIN_PASS && safeEq(pass, ADMIN_PASS);
  return u.hash && safeEq(hashPass(pass, u.salt), u.hash);
}
const modulesOf = u => (u.role === 'admin' ? MODULES : (u.modules || []).filter(m => MODULES.includes(m)));
const can = (u, m) => u.role === 'admin' || modulesOf(u).includes(m);
const publicUser = u => ({ username: u.username, name: u.name, role: u.role, modules: modulesOf(u), active: u.active !== false, builtin: !!u.builtin, created: u.created, updated: u.updated, lastLogin: u.lastLogin });

/* ---------- Sesiones ---------- */
const sessions = new Map(); // sid -> { username, exp }
function parseCookies(req) { const o = {}; (req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return o; }
const isHttps = req => req.socket.encrypted || (TRUST_PROXY && String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https');
function setSession(req, res, sid, maxAge) {
  res.setHeader('Set-Cookie', `agis_sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAge / 1000)}${isHttps(req) ? '; Secure' : ''}`);
}
function currentUser(req) {
  const sid = parseCookies(req).agis_sid; if (!sid) return null;
  const s = sessions.get(sid); if (!s) return null;
  if (s.exp < Date.now()) { sessions.delete(sid); return null; }
  const u = findUser(s.username);
  if (!u || u.active === false) { sessions.delete(sid); return null; }
  s.exp = Date.now() + SESSION_MS; // sesión deslizante
  return u;
}
const killSessions = username => { for (const [k, s] of sessions) if (s.username === username) sessions.delete(k); };

/* ---------- Bloqueo por intentos fallidos ---------- */
const fails = new Map(); // ip -> { count, first, lockedUntil }
function clientIp(req) {
  if (TRUST_PROXY && req.headers['x-forwarded-for']) { const parts = String(req.headers['x-forwarded-for']).split(',').map(s => s.trim()).filter(Boolean); if (parts.length) return parts[parts.length - 1]; }
  return req.socket.remoteAddress || 'desconocida';
}
setInterval(() => { const now = Date.now(); for (const [ip, r] of fails) if ((r.lockedUntil || 0) < now && now - r.first > LOCK_MS) fails.delete(ip); for (const [k, s] of sessions) if (s.exp < now) sessions.delete(k); }, 60e3).unref();

/* ---------- HTTP helpers ---------- */
function headers(req, extra = {}) {
  const h = {
    'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    ...extra
  };
  if (isHttps(req)) h['Strict-Transport-Security'] = 'max-age=31536000';
  return h;
}
function send(req, res, code, body, type = 'application/json; charset=utf-8', extra = {}) {
  res.writeHead(code, headers(req, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra }));
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req, limit = MAX_BODY) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(Object.assign(new Error('demasiado grande'), { code: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null')); } catch (e) { reject(Object.assign(new Error('JSON inválido'), { code: 400 })); } });
    req.on('error', reject);
  });
}
function sameOrigin(req) {
  const o = req.headers.origin; if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch (e) { return false; }
}

/* ---------- Filtrado de datos por permisos ---------- */
function dbFor(u) {
  const out = { seeded: db.seeded };
  out.clientes = can(u, 'clientes') ? (db.clientes || []) : (db.clientes || []).map(c => ({ id: c.id, nombre: c.nombre, estatus: c.estatus }));
  if (can(u, 'actividades')) { out.board = db.board || null; out.config = db.config || null; }
  if (can(u, 'reporte')) out.reportes = db.reportes || [];
  else if (can(u, 'actividades')) out.reportes = (db.reportes || []).map(({ data, ...r }) => r);
  out.colPrefs = (db.colPrefs || {})[u.username] || null;
  return out;
}
const PUT_PERM = { clientes: 'clientes', board: 'actividades', config: 'actividades', reportes: 'reporte', seeded: null, colPrefs: null };

/* ---------- Validación de usuarios ---------- */
function cleanUserInput(b, isNew) {
  const errs = [];
  const out = {};
  if (isNew) {
    out.username = String(b.username || '').trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(out.username)) errs.push('Usuario: 3 a 32 caracteres (letras, números, punto, guion)');
    else if (findUser(out.username)) errs.push('Ese usuario ya existe');
  }
  out.name = String(b.name || '').trim().slice(0, 80);
  if (!out.name) errs.push('Escribe el nombre');
  out.role = ROLES.includes(b.role) ? b.role : 'colaborador';
  out.modules = Array.isArray(b.modules) ? b.modules.filter(m => MODULES.includes(m)) : [];
  out.active = b.active !== false;
  if (b.password || isNew) {
    if (String(b.password || '').length < 8) errs.push('La contraseña debe tener al menos 8 caracteres');
    else { out.salt = crypto.randomBytes(16).toString('hex'); out.hash = hashPass(b.password, out.salt); }
  }
  return { errs, out };
}

/* ---------- Servidor ---------- */
const server = http.createServer(async (req, res) => {
  try {
    let p;
    try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { return send(req, res, 400, { error: 'URL inválida' }); }
    const method = req.method;

    if (p.startsWith('/api/') || p.startsWith('/uploads/')) {
      if (method !== 'GET' && !sameOrigin(req)) return send(req, res, 403, { error: 'Origen no permitido' });

      if (p === '/api/health') return send(req, res, 200, { ok: true });

      if (p === '/api/login' && method === 'POST') {
        const ip = clientIp(req), now = Date.now();
        let rec = fails.get(ip);
        if (rec && rec.lockedUntil > now) {
          const mins = Math.ceil((rec.lockedUntil - now) / 60000);
          return send(req, res, 429, { error: `Demasiados intentos fallidos. Intenta de nuevo en ${mins} min.`, retryAfter: mins }, undefined, { 'Retry-After': String(mins * 60) });
        }
        const b = await readBody(req, 10 * 1024).catch(() => ({}));
        if (!ADMIN_USER || !ADMIN_PASS) console.warn('⚠ AUTH_USER / AUTH_PASS no están definidos: el administrador principal no puede entrar.');
        const u = findUser(b && b.username);
        if (u && u.active !== false && checkPass(u, (b && b.password) || '')) {
          fails.delete(ip);
          const sid = crypto.randomBytes(32).toString('hex');
          sessions.set(sid, { username: u.username, exp: now + SESSION_MS });
          setSession(req, res, sid, SESSION_MS);
          if (!u.builtin) { u.lastLogin = new Date().toISOString(); persistUsers(); }
          return send(req, res, 200, publicUser(u));
        }
        if (!rec || now - rec.first > LOCK_MS) rec = { count: 0, first: now, lockedUntil: 0 };
        rec.count++;
        let msg = 'Usuario o contraseña incorrectos.', code = 401;
        if (rec.count >= MAX_FAILS) { rec.lockedUntil = now + LOCK_MS; rec.count = 0; rec.first = now; msg = 'Demasiados intentos fallidos. Acceso bloqueado 15 min.'; code = 429; console.warn(`Bloqueo de IP ${ip} por intentos fallidos`); }
        fails.set(ip, rec);
        await new Promise(r => setTimeout(r, 400));
        return send(req, res, code, { error: msg, remaining: code === 401 ? MAX_FAILS - rec.count : 0 });
      }

      if (p === '/api/logout' && method === 'POST') {
        const sid = parseCookies(req).agis_sid; if (sid) sessions.delete(sid);
        setSession(req, res, '', 0);
        return send(req, res, 200, { ok: true });
      }

      const me = currentUser(req);
      if (!me) return send(req, res, 401, { error: 'Sesión no iniciada' });

      if (p === '/api/me' && method === 'GET') return send(req, res, 200, publicUser(me));
      if (p === '/api/db' && method === 'GET') return send(req, res, 200, dbFor(me));

      const m = /^\/api\/db\/([a-zA-Z]+)$/.exec(p);
      if (m && method === 'PUT') {
        const key = m[1];
        if (!(key in PUT_PERM)) return send(req, res, 400, { error: 'Colección inválida' });
        if (PUT_PERM[key] && !can(me, PUT_PERM[key])) return send(req, res, 403, { error: 'Sin permiso para este módulo' });
        const body = await readBody(req);
        if (key === 'colPrefs') { db.colPrefs = db.colPrefs || {}; db.colPrefs[me.username] = body; }
        else db[key] = body;
        await persistDb();
        return send(req, res, 200, { ok: true });
      }

      if (p === '/api/upload' && method === 'POST') {
        if (!can(me, 'reporte')) return send(req, res, 403, { error: 'Sin permiso' });
        const b = await readBody(req, MAX_IMG * 1.4);
        const mm = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec((b && b.data) || '');
        if (!mm) return send(req, res, 400, { error: 'Imagen inválida' });
        const buf = Buffer.from(mm[2], 'base64');
        if (buf.length > MAX_IMG) return send(req, res, 413, { error: 'Imagen demasiado grande' });
        const ok = mm[1] === 'png' ? buf.slice(0, 4).toString('hex') === '89504e47' : buf.slice(0, 2).toString('hex') === 'ffd8';
        if (!ok) return send(req, res, 400, { error: 'Formato no reconocido' });
        const name = crypto.randomBytes(16).toString('hex') + (mm[1] === 'png' ? '.png' : '.jpg');
        await fs.promises.writeFile(path.join(UPLOADS, name), buf);
        return send(req, res, 200, { url: 'uploads/' + name });
      }
      const up = /^\/uploads\/([a-f0-9]{32}\.(?:jpg|png))$/.exec(p);
      if (up && method === 'GET') {
        return fs.readFile(path.join(UPLOADS, up[1]), (e, buf) => {
          if (e) return send(req, res, 404, { error: 'No encontrado' });
          res.writeHead(200, headers(req, { 'Content-Type': up[1].endsWith('.png') ? 'image/png' : 'image/jpeg', 'Cache-Control': 'private, max-age=86400' }));
          res.end(buf);
        });
      }

      /* --- Administración de usuarios (solo admin) --- */
      if (p === '/api/users' || p.startsWith('/api/users/')) {
        if (me.role !== 'admin') return send(req, res, 403, { error: 'Solo administradores' });
        if (p === '/api/users' && method === 'GET') {
          const list = [...(ADMIN_USER ? [findUser(ADMIN_USER)] : []), ...users].map(publicUser);
          return send(req, res, 200, { users: list, modules: MODULES });
        }
        if (p === '/api/users' && method === 'POST') {
          const { errs, out } = cleanUserInput(await readBody(req, 20 * 1024) || {}, true);
          if (errs.length) return send(req, res, 400, { error: errs.join('. ') });
          const u = { ...out, created: new Date().toISOString(), createdBy: me.username };
          users.push(u); await persistUsers();
          return send(req, res, 200, publicUser(u));
        }
        const um = /^\/api\/users\/([a-z0-9._-]+)$/.exec(p);
        if (um) {
          const target = findUser(um[1]);
          if (!target) return send(req, res, 404, { error: 'Usuario no encontrado' });
          if (target.builtin) return send(req, res, 400, { error: 'El administrador principal se configura en Easypanel (AUTH_USER / AUTH_PASS)' });
          if (method === 'PUT') {
            const { errs, out } = cleanUserInput(await readBody(req, 20 * 1024) || {}, false);
            if (errs.length) return send(req, res, 400, { error: errs.join('. ') });
            if (target.username === me.username && (out.role !== 'admin' || !out.active)) return send(req, res, 400, { error: 'No puedes quitarte tu propio acceso de administrador' });
            const passChanged = !!out.hash;
            Object.assign(target, out, { updated: new Date().toISOString() });
            await persistUsers();
            if (passChanged || !target.active) killSessions(target.username);
            return send(req, res, 200, publicUser(target));
          }
          if (method === 'DELETE') {
            if (target.username === me.username) return send(req, res, 400, { error: 'No puedes borrar tu propio usuario' });
            users = users.filter(x => x !== target); await persistUsers(); killSessions(target.username);
            return send(req, res, 200, { ok: true });
          }
        }
      }
      return send(req, res, 404, { error: 'No encontrado' });
    }

    /* ---------- Archivos estáticos (sin datos sensibles) ---------- */
    if (method !== 'GET' && method !== 'HEAD') return send(req, res, 405, 'Método no permitido', 'text/plain');
    let file = path.normalize(path.join(PUBLIC, p === '/' ? 'index.html' : p));
    if (file !== PUBLIC && !file.startsWith(PUBLIC + path.sep)) return send(req, res, 403, 'Prohibido', 'text/plain');
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) file = path.join(PUBLIC, 'index.html');
      fs.readFile(file, (e2, buf) => {
        if (e2) return send(req, res, 404, 'No encontrado', 'text/plain');
        res.writeHead(200, headers(req, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': file.endsWith('.html') ? 'no-cache' : 'public, max-age=300' }));
        res.end(method === 'HEAD' ? undefined : buf);
      });
    });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) send(req, res, err.code === 413 ? 413 : err.code === 400 ? 400 : 500, { error: err.code ? err.message : 'Error interno' });
  }
});

server.listen(PORT, () => {
  console.log(`AGIS Dashboard en http://0.0.0.0:${PORT}  ·  datos: ${DATA_DIR}`);
  if (!ADMIN_USER || !ADMIN_PASS) console.warn('⚠ Define AUTH_USER y AUTH_PASS en las variables de entorno para poder iniciar sesión.');
  else console.log(`Administrador principal: ${ADMIN_USER}  ·  usuarios adicionales: ${users.length}`);
});
