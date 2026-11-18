/* Arquitechtura AGIS · Dashboard v1 (Home, Clientes, Actividades, Reporte Visita) */
'use strict';

/* ================= Utilidades ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, '0');
const MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const localISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => localISO(new Date());
function parseD(v) { if (!v) return null; const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); return m ? new Date(+m[1], m[2] - 1, +m[3]) : new Date(v); }
function fmtDate(v) { const d = parseD(v); return d && !isNaN(d) ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '—'; }
function fmtShort(v) { const d = parseD(v); return d && !isNaN(d) ? `${pad(d.getDate())} ${MES[d.getMonth()]}` : ''; }
function fmtLong(v) { const d = parseD(v); return d && !isNaN(d) ? `${pad(d.getDate())} ${MES[d.getMonth()]} ${d.getFullYear()}` : ''; }
const initials = s => String(s || '?').replace(/^(ing|arq|lic|sr|sra)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const debounce = (fn, ms = 300) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const hashColor = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return ['#1b2a41', '#4f46e5', '#0f8a7a', '#a68452', '#be3a5a', '#2563eb', '#7c3aed', '#c2410c'][h % 8]; };

const I = (p, extra = '') => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${p}</svg>`;
const ICON = {
  users: I('<path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M21 19v-1a4 4 0 0 0-3-3.87M15.5 4.13a3.5 3.5 0 0 1 0 6.75"/>'),
  kanban: I('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 7v7M12 7v4M16 7v9"/>'),
  report: I('<path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z"/><path d="M16 5h1.5A1.5 1.5 0 0 1 19 6.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-13A1.5 1.5 0 0 1 6.5 5H8"/><path d="m9 13 2 2 4-4M9 18h6"/>'),
  folder: I('<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/>'),
  pulse: I('<path d="M3 12h4l2.5-6 5 12L17 12h4"/>'),
  search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  cal: I('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  filter: I('<path d="M4 6h16M7 12h10M10 18h4"/>'),
  download: I('<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
  edit: I('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  trash: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'),
  more: I('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
  left: I('<path d="M19 12H5m0 0 6-6m-6 6 6 6"/>'),
  right: I('<path d="M5 12h14m0 0-6-6m6 6-6 6"/>'),
  up: I('<path d="m6 15 6-6 6 6"/>'),
  down: I('<path d="m6 9 6 6 6-6"/>'),
  pin: I('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  user: I('<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>'),
  building: I('<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>'),
  pdf: I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
  save: I('<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 3v5h8V3M7 21v-7h10v7"/>'),
  reset: I('<path d="M4 4v6h6"/><path d="M20 12a8 8 0 0 0-14.9-4L4 10m16 10v-6h-6m6 2a8 8 0 0 1-14.9 0"/>'),
  copy: I('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
  open: I('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  inbox: I('<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>'),
  vdots: I('<circle cx="12" cy="5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="19" r="1.3" fill="currentColor"/>'),
  link: I('<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>'),
  unlink: I('<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1M4 4l16 16"/>'),
  shield: I('<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>'),
  columns: I('<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9.5 4v16M14.5 4v16"/>'),
  camera: I('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>'),
  logout: I('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>'),
  swap: I('<path d="M7 7h12m0 0-3-3m3 3-3 3M17 17H5m0 0 3-3m-3 3 3 3"/>'),
  lock: I('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  eye: I('<path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/>'),
  key: I('<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>'),
  bell: I('<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z"/><path d="M10 19a2 2 0 0 0 4 0"/>'),
  cash: I('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>'),
  check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  wand: I('<path d="m4 20 10-10M15 4v3M13.5 5.5h3M19 9v2M18 10h2M18 3v1.5M17.25 3.75h1.5"/>')
};

/* ================= Catálogos ================= */
const ESTATUS = [
  { k: 'prospecto', l: 'Prospecto', tab: 'Prospectos' },
  { k: 'curso', l: 'En curso', tab: 'En curso' },
  { k: 'adicionales', l: 'Con adicionales', tab: 'Con Adicionales' },
  { k: 'cerrado', l: 'Cerrado', tab: 'Cerrado' }
];
const ORIGENES = ['Recomendación', 'Arquitecto / Diseñador', 'Desarrollador', 'Constructora', 'Cliente recurrente', 'Sitio web', 'Redes sociales', 'Otro'];
const SERVICIOS = ['Automatización', 'Audio multizona', 'Home Theater', 'Iluminación', 'CCTV', 'Alarmas', 'Control de acceso', 'Detección de incendio', 'Redes / WiFi', 'Telefonía IP', 'Eléctrico', 'Cortinas motorizadas'];
const svcClass = s => 'c' + (Math.max(0, SERVICIOS.indexOf(s)) % 10);
const TIPOS = [
  { k: 'Visita técnica', c: '#2563eb' }, { k: 'Levantamiento', c: '#0f8a7a' }, { k: 'Instalación', c: '#4f46e5' },
  { k: 'Reparación', c: '#be1e1e' }, { k: 'Mantenimiento', c: '#b7791f' }, { k: 'Reunión con cliente', c: '#7c3aed' },
  { k: 'Entrega', c: '#15803d' }
];
const tipoColor = k => (TIPOS.find(t => t.k === k) || { c: '#94a3b8' }).c;
const PALETTE = [
  { k: 'none', l: 'Sin color', dot: '#cbd5e1', bg: '', bd: '' },
  { k: 'gris', l: 'Gris', dot: '#94a3b8', bg: '#eef1f5', bd: '#dce1e9' },
  { k: 'azul', l: 'Azul', dot: '#2563eb', bg: '#e4edfc', bd: '#c3d5f6' },
  { k: 'turquesa', l: 'Turquesa', dot: '#0f8a7a', bg: '#dff3ef', bd: '#b9e2da' },
  { k: 'verde', l: 'Verde', dot: '#15803d', bg: '#e2f3e8', bd: '#bfe1ca' },
  { k: 'ambar', l: 'Ámbar', dot: '#b7791f', bg: '#fbefd9', bd: '#eed6a8' },
  { k: 'naranja', l: 'Naranja', dot: '#c2410c', bg: '#fde7dc', bd: '#f4c8b1' },
  { k: 'rojo', l: 'Rojo', dot: '#be1e1e', bg: '#fbe2e2', bd: '#efc0c0' },
  { k: 'rosa', l: 'Rosa', dot: '#be3a5a', bg: '#fbe3eb', bd: '#f0c1d0' },
  { k: 'morado', l: 'Morado', dot: '#7c3aed', bg: '#ede5fd', bd: '#d4c5f7' },
  { k: 'marino', l: 'Marino', dot: '#1b2a41', bg: '#e1e6ee', bd: '#c3cbd8' }
];
const pal = k => PALETTE.find(p => p.k === k) || (k && k[0] === '#' ? (PALETTE.find(p => p.dot.toLowerCase() === k.toLowerCase()) || PALETTE[1]) : PALETTE[0]);
const tintStyle = k => { const p = pal(k); return p.bg ? `--pbg:${p.bg};--pbd:${p.bd}` : ''; };
const COL_DEFAULTS = ['gris', 'azul', 'ambar', 'verde', 'morado', 'turquesa', 'rosa', 'marino'];

/* ================= Sesión / API ================= */
const ALL_MODS = ['clientes', 'actividades', 'reporte', 'presupuesto', 'proyectos', 'monitor'];
const MOD_LABEL = { clientes: 'Clientes', actividades: 'Actividades', reporte: 'Reporte Visita', presupuesto: 'Presupuesto', proyectos: 'Proyectos', monitor: 'Monitor' };
let ME = null;
const isAdmin = () => !!ME && ME.role === 'admin';
const can = m => !!ME && (ME.role === 'admin' || (ME.modules || []).includes(m));
const ROLE_LABEL = { admin: 'Administrador', colaborador: 'Colaborador' };

/* Solo para la vista previa sin servidor: usuarios en este navegador (sin seguridad real) */
const LocalAuth = {
  key: 'agis-local-users', skey: 'agis-local-session',
  admin: { username: 'admin', name: 'Administrador', role: 'admin', active: true, builtin: true },
  all() { try { const l = JSON.parse(localStorage.getItem(this.key) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return this._mem || []; } },
  saveAll(l) { this._mem = l; try { localStorage.setItem(this.key, JSON.stringify(l)); } catch (e) {} },
  find(u) { u = String(u || '').trim().toLowerCase(); return u === 'admin' ? this.admin : this.all().find(x => x.username === u); },
  pub(u) { const { pass, ...r } = u; return { ...r, modules: u.role === 'admin' ? ALL_MODS : (u.modules || []) }; },
  current() { let s = null; try { s = localStorage.getItem(this.skey); } catch (e) {} if (s === null) s = 'admin'; const u = s && this.find(s); return u && u.active !== false ? this.pub(u) : null; },
  async login(u, p) {
    const x = this.find(u);
    if (!x || x.active === false || (x.builtin ? p !== 'admin' : x.pass !== p)) throw Object.assign(new Error('Usuario o contraseña incorrectos.'), { status: 401 });
    try { localStorage.setItem(this.skey, x.username); } catch (e) {}
    return this.pub(x);
  },
  async logout() { try { localStorage.setItem(this.skey, ''); } catch (e) {} },
  async list() { return { users: [this.admin, ...this.all()].map(u => this.pub(u)), modules: ALL_MODS }; },
  validate(b, isNew) {
    if (isNew && !/^[a-z0-9._-]{3,32}$/.test(b.username || '')) throw new Error('Usuario: 3 a 32 caracteres (letras, números, punto, guion)');
    if (isNew && this.find(b.username)) throw new Error('Ese usuario ya existe');
    if (!String(b.name || '').trim()) throw new Error('Escribe el nombre');
    if ((isNew || b.password) && String(b.password || '').length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');
  },
  async create(b) { b.username = String(b.username || '').trim().toLowerCase(); this.validate(b, true); const l = this.all(); const u = { username: b.username, name: b.name.trim(), role: b.role, modules: b.modules, active: b.active !== false, pass: b.password, created: new Date().toISOString() }; l.push(u); this.saveAll(l); return this.pub(u); },
  async update(name, b) { this.validate(b, false); const l = this.all(); const u = l.find(x => x.username === name); if (!u) throw new Error('Usuario no encontrado'); Object.assign(u, { name: b.name.trim(), role: b.role, modules: b.modules, active: b.active !== false, updated: new Date().toISOString() }); if (b.password) u.pass = b.password; this.saveAll(l); return this.pub(u); },
  async remove(name) { if (ME && name === ME.username) throw new Error('No puedes borrar tu propio usuario'); this.saveAll(this.all().filter(x => x.username !== name)); }
};

const Api = {
  mode: 'local',
  async req(method, url, body) {
    const opt = { method, credentials: 'same-origin', cache: 'no-store', headers: { 'X-Schema': String((Store.data && Store.data.schema) || 1) } };
    if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    const r = await fetch(url, opt);
    const data = (r.headers.get('content-type') || '').includes('json') ? await r.json().catch(() => null) : null;
    if (r.status === 401 && url !== 'api/login') sessionExpired();
    if (r.status === 409 && data && data.reload) { toast('La información se actualizó a una nueva estructura. Recargando…', true); setTimeout(() => location.reload(), 1800); }
    if (!r.ok) throw Object.assign(new Error((data && data.error) || `Error ${r.status}`), { status: r.status, data });
    return data;
  },
  async detect() {
    try {
      const r = await fetch('api/me', { credentials: 'same-origin', cache: 'no-store' });
      if (!(r.headers.get('content-type') || '').includes('json')) throw 0;
      this.mode = 'api';
      return r.ok ? await r.json() : null;
    } catch (e) { this.mode = 'local'; return LocalAuth.current(); }
  },
  login(u, p) { return this.mode === 'api' ? this.req('POST', 'api/login', { username: u, password: p }) : LocalAuth.login(u, p); },
  logout() { return this.mode === 'api' ? this.req('POST', 'api/logout', {}).catch(() => {}) : LocalAuth.logout(); },
  users: {
    list: () => Api.mode === 'api' ? Api.req('GET', 'api/users') : LocalAuth.list(),
    create: b => Api.mode === 'api' ? Api.req('POST', 'api/users', b) : LocalAuth.create(b),
    update: (n, b) => Api.mode === 'api' ? Api.req('PUT', 'api/users/' + encodeURIComponent(n), b) : LocalAuth.update(n, b),
    remove: n => Api.mode === 'api' ? Api.req('DELETE', 'api/users/' + encodeURIComponent(n)) : LocalAuth.remove(n)
  },
  async upload(dataURL) { if (this.mode !== 'api') return dataURL; return (await this.req('POST', 'api/upload', { data: dataURL })).url; }
};
/* Notificaciones en modo vista previa (este navegador) */
const LocalNotif = {
  key: 'agis-local-notifs',
  all() { try { return JSON.parse(localStorage.getItem(this.key) || '{}') || {}; } catch (e) { return this._m || {}; } },
  save(o) { this._m = o; try { localStorage.setItem(this.key, JSON.stringify(o)); } catch (e) {} },
  list() { return { items: this.all()[ME.username] || [] }; },
  send(b) { const o = this.all(), now = new Date().toISOString(); b.to.forEach(u => { (o[u] = o[u] || []).unshift({ id: uid().padEnd(16, '0').slice(0, 16), title: b.title, body: b.body, link: b.link, from: ME.username, fromName: ME.name, created: now }); }); this.save(o); return { ok: true, sent: b.to.length }; },
  remove(id) { const o = this.all(); o[ME.username] = (o[ME.username] || []).filter(n => n.id !== id); this.save(o); },
  clear() { const o = this.all(); o[ME.username] = []; this.save(o); }
};
Api.notif = {
  list: () => Api.mode === 'api' ? Api.req('GET', 'api/notifications') : Promise.resolve(LocalNotif.list()),
  send: b => Api.mode === 'api' ? Api.req('POST', 'api/notifications', b) : Promise.resolve(LocalNotif.send(b)),
  remove: id => Api.mode === 'api' ? Api.req('DELETE', 'api/notifications/' + id) : Promise.resolve(LocalNotif.remove(id)),
  clear: () => Api.mode === 'api' ? Api.req('DELETE', 'api/notifications') : Promise.resolve(LocalNotif.clear())
};
Api.directory = async () => {
  if (Api.mode === 'api') return (await Api.req('GET', 'api/directory')).users;
  return (await LocalAuth.list()).users.filter(u => u.active !== false);
};
let expiredShown = false;
function sessionExpired() {
  if (!ME || expiredShown) return;
  expiredShown = true; ME = null; stopNotifs();
  modalStack.slice().forEach(c => c());
  showLogin('Tu sesión terminó. Vuelve a iniciar sesión.');
}

/* ================= Almacenamiento ================= */
const Store = {
  mode: 'memory',
  data: { clientes: [], board: null, reportes: [], config: null },
  async init() {
    this.data = { clientes: [], board: null, reportes: [], presupuestos: [], config: null, colPrefs: null };
    if (Api.mode === 'api') {
      Object.assign(this.data, await Api.req('GET', 'api/db'));
      this.mode = 'api';
    } else {
      try { const s = localStorage.getItem('agis-db'); if (s) Object.assign(this.data, JSON.parse(s)); this.mode = 'local'; }
      catch (_) { this.mode = 'memory'; }
    }
    if (!this.data.config) this.data.config = { equipo: ['Luis Gómez', 'Diego', 'Omar'] };
    if (!Array.isArray(this.data.clientes)) this.data.clientes = [];
    if (!Array.isArray(this.data.reportes)) this.data.reportes = [];
    if (!Array.isArray(this.data.presupuestos)) this.data.presupuestos = [];
    if (!Array.isArray(this.data.proyectos)) this.data.proyectos = [];
    if (!this.data.catalogos) this.data.catalogos = { secciones: [...SECCIONES_DEF], unidades: [...UNIDADES_DEF] };
    if (!this.data.board) { this.data.board = seedBoard(); if (can('actividades')) this.save('board'); }
    if (!this.data.seeded && !this.data.clientes.length && can('clientes')) {
      this.data.clientes = seedClientes(); this.data.seeded = true; this.save('seeded');
      if (isAdmin()) { // instalación nueva: se crea directamente con la estructura Clientes + Proyectos
        const plan = planMigration(this.data);
        try { await applyMigration(plan, true); } catch (e) { this.save('clientes'); }
      } else this.save('clientes');
    }
    const b = $('#syncBadge');
    b.className = 'sync ' + this.mode;
    b.textContent = this.mode === 'api' ? 'Servidor' : this.mode === 'local' ? 'Vista previa' : 'Sin guardar';
    b.title = this.mode === 'api' ? 'Datos guardados en el servidor' : this.mode === 'local' ? 'Datos guardados solo en este navegador' : 'Los datos se pierden al cerrar';
  },
  async reload() {
    if (this.mode !== 'api') return;
    const fresh = await Api.req('GET', 'api/db');
    ['clientes', 'board', 'reportes', 'presupuestos', 'proyectos', 'config', 'catalogos'].forEach(k => { if (fresh[k] !== undefined && fresh[k] !== null) this.data[k] = fresh[k]; });
  },
  save(key) {
    const need = { clientes: 'clientes', board: 'actividades', config: 'actividades', reportes: 'reporte', presupuestos: 'presupuesto', proyectos: 'proyectos' }[key];
    if (need && !can(need)) return;
    if (key === 'catalogos' && !isAdmin()) return;
    if (this.mode === 'api') {
      Api.req('PUT', 'api/db/' + key, this.data[key]).catch(e => { if (e.status !== 401) toast(e.status === 403 ? 'Sin permiso para guardar en este módulo' : 'No se pudo guardar en el servidor', true); });
    } else if (this.mode === 'local') {
      try { localStorage.setItem('agis-db', JSON.stringify(this.data)); } catch (e) { toast('Almacenamiento local lleno', true); }
    }
  },
  saveAll() { ['clientes', 'board', 'reportes', 'config', 'seeded', 'colPrefs'].forEach(k => this.save(k)); }
};

function seedBoard() {
  const t = new Date(), d = n => { const x = new Date(t); x.setDate(x.getDate() + n); return localISO(x); };
  return {
    columns: [
      { id: uid(), name: 'Por programar', color: 'gris', cards: [
        { id: uid(), title: 'Levantamiento para automatización de iluminación', tipo: 'Levantamiento', clienteId: '', clienteTxt: 'Residencia Bosques', fecha: d(4), hora: '10:00', responsables: ['Luis Gómez'], direccion: '', notas: '', created: new Date().toISOString(), demo: true }
      ] },
      { id: uid(), name: 'Programadas', color: 'azul', cards: [
        { id: uid(), title: 'Visita técnica — revisión de CCTV', tipo: 'Visita técnica', clienteId: '', clienteTxt: 'Torre Polanco 4B', fecha: d(1), hora: '09:30', responsables: ['Diego'], direccion: '', notas: '', created: new Date().toISOString(), demo: true },
        { id: uid(), title: 'Reunión de presentación de propuesta Home Theater', tipo: 'Reunión con cliente', clienteId: '', clienteTxt: 'Casa Interlomas', fecha: d(2), hora: '17:00', responsables: ['Luis Gómez'], direccion: '', notas: '', created: new Date().toISOString(), demo: true }
      ] },
      { id: uid(), name: 'En proceso', color: 'ambar', cards: [
        { id: uid(), title: 'Instalación audio multizona planta alta', tipo: 'Instalación', clienteId: '', clienteTxt: 'Residencia Lomas', fecha: d(0), hora: '08:00', responsables: ['Diego', 'Omar'], direccion: '', notas: '', created: new Date().toISOString(), demo: true }
      ] },
      { id: uid(), name: 'Completadas', color: 'verde', done: true, cards: [
        { id: uid(), title: 'Reparación de telefonía IP', tipo: 'Reparación', clienteId: '', clienteTxt: 'Hotel TRU Aeropuerto', fecha: d(-3), hora: '', responsables: ['Luis Gómez'], direccion: '', notas: '', created: new Date().toISOString(), demo: true }
      ] }
    ]
  };
}
function seedClientes() {
  const names = [
    ['Residencia Bosques de las Lomas', 'curso', 'Arquitecto / Diseñador', ['Automatización', 'Iluminación', 'Audio multizona'], 185000],
    ['Departamento Polanco 4B', 'adicionales', 'Recomendación', ['CCTV', 'Control de acceso', 'Redes / WiFi'], 42500],
    ['Casa Interlomas', 'prospecto', 'Cliente recurrente', ['Home Theater'], 0],
    ['Hotel TRU Aeropuerto by Hilton', 'cerrado', 'Constructora', ['Telefonía IP', 'Redes / WiFi'], 0],
    ['Residencia Lomas de Chapultepec', 'curso', 'Desarrollador', ['Automatización', 'Cortinas motorizadas', 'Alarmas'], 96800],
    ['Penthouse Santa Fe', 'prospecto', 'Recomendación', ['Audio multizona', 'Iluminación'], 0],
    ['Oficinas Corporativo Reforma', 'adicionales', 'Sitio web', ['CCTV', 'Detección de incendio', 'Control de acceso'], 73200],
    ['Casa Tecamachalco', 'curso', 'Arquitecto / Diseñador', ['Automatización', 'Home Theater', 'Eléctrico'], 251000]
  ];
  const base = new Date();
  return names.map(([n, e, o, s, saldo], i) => {
    const c = new Date(base); c.setDate(c.getDate() - (i * 9 + 3));
    const m = new Date(c); m.setDate(m.getDate() + Math.min(i * 3 + 1, i * 9 + 2));
    const id = `${pad(c.getDate())}${pad(c.getMonth() + 1)}${String(c.getFullYear()).slice(-2)}-01`;
    const ct = [['Rafael Abiad', '55 1234 5678'], ['Moisés Cohen', '55 2345 6789'], ['Rafael Abiad', '55 1234 5678'], ['', ''], ['Sara Mizrahi', '55 3456 7890'], ['Moisés Cohen', '55 2345 6789'], ['', ''], ['Daniel Btesh', '55 4567 8901']][i];
    return { id, nombre: n, estatus: e, origen: o, servicios: s, saldo, telefono: ct[1], email: '', contacto: ct[0], direccion: '', notas: '', creado: c.toISOString(), modificado: m.toISOString(), demo: true };
  });
}

/* ================= UI genérica ================= */
function toast(msg, err) {
  const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 2800);
}
const modalStack = [];
function openModal({ title, body, foot = '', size = '', onMount, onClose }) {
  const ov = document.createElement('div'); ov.className = 'modal-ov';
  ov.innerHTML = `<div class="modal ${size}" role="dialog" aria-modal="true"><div class="mh"><h3>${esc(title)}</h3><button class="icon-btn" data-x aria-label="Cerrar">${ICON.x}</button></div><div class="mb">${body}</div><div class="mf">${foot}</div></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('in'));
  let closed = false;
  const close = () => { if (closed) return; closed = true; if (onClose) onClose(); ov.classList.remove('in'); modalStack.splice(modalStack.indexOf(close), 1); setTimeout(() => ov.remove(), 180); };
  modalStack.push(close);
  ov.addEventListener('pointerdown', e => { ov._down = e.target === ov; });
  ov.addEventListener('click', e => { if ((e.target === ov && ov._down) || e.target.closest('[data-x]')) close(); });
  const m = ov.querySelector('.modal');
  if (onMount) onMount(m, close);
  setTimeout(() => { const f = m.querySelector('[autofocus]'); if (f && matchMedia('(hover:hover)').matches) f.focus(); }, 60);
  return close;
}
function confirmDialog(title, msg, ok = 'Eliminar', danger = true) {
  return new Promise(res => {
    let val = false;
    openModal({
      title, size: 'narrow', body: `<p>${msg}</p>`,
      foot: `<button class="btn" data-x>Cancelar</button><button class="btn ${danger ? 'danger solid' : 'primary'}" data-ok>${esc(ok)}</button>`,
      onClose: () => res(val),
      onMount(m, close) { m.querySelector('[data-ok]').onclick = () => { val = true; close(); }; }
    });
  });
}
function promptDialog(title, label, value = '') {
  return new Promise(res => {
    let val = null;
    openModal({
      title, size: 'narrow', onClose: () => res(val),
      body: `<div class="field"><label>${esc(label)}</label><input class="input" id="pv" value="${esc(value)}" autofocus></div>`,
      foot: `<button class="btn" data-x>Cancelar</button><button class="btn primary" data-ok>Guardar</button>`,
      onMount(m, close) {
        const inp = m.querySelector('#pv');
        const ok = () => { const v = inp.value.trim(); if (!v) { inp.classList.add('invalid'); return; } val = v; close(); };
        m.querySelector('[data-ok]').onclick = ok;
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
      }
    });
  });
}
let popClose = null;
function popMenu(anchor, items) {
  if (popClose) popClose();
  const m = document.createElement('div'); m.className = 'popmenu';
  items.forEach(it => {
    if (it === '-') { m.appendChild(document.createElement('hr')); return; }
    if (it.header) { const h = document.createElement('div'); h.className = 'pm-head'; h.innerHTML = it.header; m.appendChild(h); return; }
    const b = document.createElement('button');
    b.innerHTML = (it.icon ? ICON[it.icon] : '') + esc(it.label);
    if (it.danger) b.className = 'danger';
    if (it.disabled) b.disabled = true, b.style.opacity = .45;
    b.onclick = e => { e.stopPropagation(); close(); it.run(); };
    m.appendChild(b);
  });
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  let left = Math.min(r.right - m.offsetWidth, innerWidth - m.offsetWidth - 8); left = Math.max(8, left);
  let top = r.bottom + 6; if (top + m.offsetHeight > innerHeight - 8) top = Math.max(8, r.top - m.offsetHeight - 6);
  m.style.left = left + 'px'; m.style.top = top + 'px';
  const out = e => { if (!m.contains(e.target)) close(); };
  function close() { m.remove(); document.removeEventListener('pointerdown', out, true); popClose = null; }
  setTimeout(() => document.addEventListener('pointerdown', out, true), 0);
  popClose = close;
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (popClose) popClose(); else if (modalStack.length) modalStack[modalStack.length - 1](); }
});
function download(filename, blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

/* ================= Shell / Home ================= */
const MODULES = [
  { k: 'clientes', t: 'Clientes', s: 'Cartera y saldos', icon: 'users', hue: 'h-indigo', render: renderClientes },
  { k: 'actividades', t: 'Actividades', s: 'Equipo en campo', icon: 'kanban', hue: 'h-teal', render: renderActividades },
  { k: 'reporte', t: 'Reporte Visita', s: 'Genera PDF firmado', icon: 'report', hue: 'h-amber', render: renderReporte },
  { k: 'presupuesto', t: 'Presupuesto', s: 'Visitas técnicas', icon: 'cash', hue: 'h-green', render: renderPresupuesto },
  { k: 'proyectos', t: 'Proyectos', s: 'Avance y seguimiento', icon: 'folder', hue: 'h-slate', render: renderProyectos },
  { k: 'monitor', t: 'Monitor', s: 'Tiempo real', icon: 'pulse', hue: 'h-rose', adminOnly: true, render: renderMonitor },
  { k: 'usuarios', t: 'Usuarios', s: 'Accesos y perfiles', icon: 'shield', hue: 'h-navy', adminOnly: true, render: renderUsuarios }
];
const allowed = m => m.adminOnly ? isAdmin() : can(m.k);
let current = null;
function buildBand() {
  $('#bandInner').innerHTML = MODULES.filter(allowed).map((m, i) => `
    <button class="fbtn ${m.hue} ${m.soon ? 'soon' : ''}" data-mod="${m.k}" style="--i:${i}" ${m.soon ? 'aria-disabled="true"' : ''}>
      <span class="ico">${ICON[m.icon]}</span>
      <span>${esc(m.t)}<small>${esc(m.s)}</small></span>
    </button>`).join('');
  if (window._bandBound) return; window._bandBound = true;
  $('#bandInner').addEventListener('click', e => {
    const b = e.target.closest('.fbtn'); if (!b) return;
    const m = MODULES.find(x => x.k === b.dataset.mod);
    if (m.soon) { toast(`${m.t}: disponible en una siguiente iteración`); return; }
    if (m.k === 'proyectos') PS.view = 'list';
    go(m.k);
  });
}
function setBand(open) {
  $('#band').classList.toggle('open', open);
  $('#band').setAttribute('aria-hidden', String(!open));
  $('#menuBtn').setAttribute('aria-expanded', String(open));
}
function setMenuMode() {
  const b = $('#menuBtn');
  b.classList.toggle('is-close', !!current);
  b.setAttribute('aria-label', current ? 'Cerrar sección' : 'Abrir menú');
}
function go(k, opts = {}) {
  if (!ME) return;
  let m = MODULES.find(x => x.k === k && !x.soon);
  if (m && !allowed(m)) { toast('No tienes acceso a ese módulo', true); m = null; }
  if (!m || m.k !== 'monitor') { document.body.classList.remove('tv'); clearInterval(monTimer); }
  $('#stage').classList.toggle('wide', !!m && m.k === 'actividades');
  $('#stage').classList.toggle('xwide', !!m && m.k === 'monitor');
  if (m && m.k === 'proyectos' && current !== 'proyectos' && !opts.keepView) { /* conserva la vista */ }
  if (popClose) popClose();
  if (!m) {
    current = null; setBand(false); setMenuMode();
    $('#crumb').textContent = ''; $$('.fbtn').forEach(b => b.classList.remove('active'));
    renderLanding($('#stage'));
    if (location.hash) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
    return;
  }
  current = k; setMenuMode();
  $$('.fbtn').forEach(b => b.classList.toggle('active', b.dataset.mod === k));
  $('#crumb').textContent = m.t;
  m.render($('#stage'));
  if (!opts.keepBand) setBand(false);
  if (location.hash.slice(1) !== k) { try { history.replaceState(null, '', '#' + k); } catch (e) { location.hash = k; } }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================= LANDING · Búsqueda global ================= */
function migrateData() {
  let changed = false;
  Store.data.board.columns.forEach(c => {
    if (c.color && c.color[0] === '#') { c.color = pal(c.color).k; changed = true; }
    c.cards.forEach(k => { if (!Array.isArray(k.reportIds)) { k.reportIds = k.reporteId ? [k.reporteId] : []; delete k.reporteId; } });
  });
  if (changed) Store.save('board');
}
function searchIndex(q) {
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const hit = hay => { const h = norm(hay); return terms.every(t => h.includes(t)); };
  const out = [];
  if (can('clientes')) Store.data.clientes.forEach(c => {
    if (isSchema2()) {
      const ps = projectsOf(c.id), sal = saldoOf(c.id);
      if (hit([c.nombre, c.id, c.email, c.telefono, ps.map(p => p.nombre).join(' ')].join(' ')))
        out.push({ type: 'cliente', id: c.id, title: c.nombre, sub: `${c.id} · ${ps.length} proyecto${ps.length === 1 ? '' : 's'}${sal > 0 ? ' · Saldo ' + MXN.format(sal) : ''}${c.porCompletar ? ' · Por completar' : ''}` });
    } else if (hit([c.nombre, c.id, c.contacto, c.origen, c.email, c.telefono, c.direccion, (c.servicios || []).join(' ')].join(' ')))
      out.push({ type: 'cliente', id: c.id, title: c.nombre, sub: `${c.id} · ${ESTATUS.find(s => s.k === c.estatus)?.l || ''}${+c.saldo > 0 ? ' · Saldo ' + MXN.format(c.saldo) : ''}` });
  });
  if (can('actividades')) Store.data.board.columns.forEach(col => col.cards.forEach(k => {
    const cn = clientName(k.clienteId) || k.clienteTxt;
    if (hit([k.title, cn, k.tipo, (k.responsables || []).join(' '), k.direccion, k.notas, col.name].join(' ')))
      out.push({ type: 'actividad', id: k.id, title: k.title, sub: [col.name, k.tipo, cn, k.fecha ? fmtDate(k.fecha) : ''].filter(Boolean).join(' · ') });
  }));
  if (can('proyectos')) Store.data.proyectos.forEach(p => {
    if (hit([p.nombre, p.codigo, p.clienteNombre, p.obra, p.direccion, p.origen, (p.servicios || []).join(' ')].join(' ')))
      out.push({ type: 'proyecto', id: p.id, title: p.nombre, sub: `${p.codigo} · ${p.clienteNombre || ''} · ${projProgress(p).value}% · ${(PEST.find(x => x.k === p.estatus) || {}).l || ''}` });
  });
  if (can('presupuesto')) Store.data.presupuestos.forEach(b => {
    if (hit([b.folio, b.clienteNombre, b.titulo, b.data && b.data.obra].join(' ')))
      out.push({ type: 'presupuesto', id: b.id, title: `${b.folio || 'Sin folio'} — ${b.titulo || ''}`, sub: `${fmtDate(b.fecha)} · ${b.clienteNombre || ''} · $${AGIS_money(b.total)} ${b.moneda || ''}` });
  });
  if (can('reporte')) Store.data.reportes.forEach(r => {
    if (hit([r.folio, r.codigo, r.asunto, r.tipo, r.data?.descripcion].join(' ')))
      out.push({ type: 'reporte', id: r.id, title: `${r.folio || 'Sin folio'} — ${r.asunto || r.tipo}`, sub: `${fmtDate(r.fecha)} · ${r.codigo || ''}` });
  });
  return out;
}
const G_META = {
  cliente: { label: 'Clientes', icon: 'users', bg: '#eef0ff', fg: '#4f46e5' },
  actividad: { label: 'Actividades', icon: 'kanban', bg: '#e9faf6', fg: '#0f8a7a' },
  reporte: { label: 'Reportes de visita', icon: 'pdf', bg: '#fde8eb', fg: '#c0001a' },
  presupuesto: { label: 'Presupuestos', icon: 'cash', bg: '#e9f7ef', fg: '#15803d' },
  proyecto: { label: 'Proyectos', icon: 'folder', bg: '#eef1f6', fg: '#1b2a41' }
};
function renderLanding(stage) {
  stage.innerHTML = `
  <section class="landing">
    <img class="landing-mark" alt="" src="${window.AGIS_LOGOS ? AGIS_LOGOS.mark : ''}">
    <div class="gsearch-wrap" id="gWrap">
      <div class="gsearch">${ICON.search}
        <input id="gInput" type="search" placeholder="¿Qué estás buscando?" autocomplete="off" aria-label="Buscar">
        <button class="icon-btn clr" id="gClear" aria-label="Limpiar">${ICON.x}</button><kbd>/</kbd>
      </div>
      <div class="gresults" id="gRes" role="listbox"></div>
    </div>
  </section>`;
  const inp = $('#gInput'), wrap = $('#gWrap'), res = $('#gRes');
  let items = [], sel = -1;
  const hl = (t, q) => { let h = esc(t); q.trim().split(/\s+/).filter(x => x.length > 1).forEach(w => { const re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'); h = h.replace(re, '<mark>$1</mark>'); }); return h; };
  function draw() {
    const q = inp.value;
    wrap.classList.toggle('has', !!q);
    if (!q.trim()) { wrap.classList.remove('open'); items = []; return; }
    items = searchIndex(q).slice(0, 30); sel = items.length ? 0 : -1;
    let html = '', last = '';
    items.forEach((it, i) => {
      const m = G_META[it.type];
      if (it.type !== last) { html += `<div class="ggroup">${m.label}</div>`; last = it.type; }
      html += `<button class="gitem ${i === sel ? 'on' : ''}" data-i="${i}"><span class="gi" style="background:${m.bg};color:${m.fg}">${ICON[m.icon]}</span><span class="gt"><b>${hl(it.title, q)}</b><small>${esc(it.sub)}</small></span></button>`;
    });
    res.innerHTML = html || `<div class="gempty">Sin coincidencias para “${esc(q)}”.</div>`;
    wrap.classList.add('open');
  }
  function mark() { $$('.gitem', res).forEach((b, i) => b.classList.toggle('on', i === sel)); $$('.gitem', res)[sel]?.scrollIntoView({ block: 'nearest' }); }
  inp.addEventListener('input', draw);
  inp.addEventListener('focus', () => { if (inp.value.trim()) draw(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); sel = (sel + 1) % items.length; mark(); }
    else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); sel = (sel - 1 + items.length) % items.length; mark(); }
    else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); openResult(items[sel]); }
    else if (e.key === 'Escape') { if (inp.value) { inp.value = ''; draw(); e.stopPropagation(); } else inp.blur(); }
  });
  res.addEventListener('click', e => { const b = e.target.closest('.gitem'); if (b) openResult(items[+b.dataset.i]); });
  $('#gClear').onclick = () => { inp.value = ''; draw(); inp.focus(); };
  document.addEventListener('pointerdown', function out(e) { if (!document.body.contains(wrap)) { document.removeEventListener('pointerdown', out); return; } if (!wrap.contains(e.target)) wrap.classList.remove('open'); });
  if (matchMedia('(hover:hover)').matches) setTimeout(() => inp.focus(), 50);
}
function openResult(it) {
  if (!it) return;
  if (it.type === 'cliente') { go('clientes'); const c = Store.data.clientes.find(x => x.id === it.id); if (c) (isSchema2() ? clientForm2 : clientForm)(c); }
  else if (it.type === 'actividad') { go('actividades'); const { col, card } = findCard(it.id); if (card) cardForm(card, col.id); }
  else if (it.type === 'reporte') openReport(it.id);
  else if (it.type === 'presupuesto') openBudget(it.id);
  else if (it.type === 'proyecto') openProject(it.id);
}

/* ================= ESTRUCTURA v2: Clientes (personas) + Proyectos ================= */
const isSchema2 = () => ((Store.data && Store.data.schema) || 1) >= 2;
const projectsOf = cid => Store.data.proyectos.filter(p => p.clienteId === cid);
const saldoOf = cid => projectsOf(cid).reduce((a, p) => a + (+p.saldo || 0), 0);
const normKey = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
const EST_MAP = { prospecto: 'prospecto', curso: 'en_curso', adicionales: 'adicionales', cerrado: 'cerrado' };

/* Calcula la migración sin tocar los datos actuales (vista previa) */
function planMigration(src) {
  const D = JSON.parse(JSON.stringify({ clientes: src.clientes || [], proyectos: src.proyectos || [], board: src.board || { columns: [] }, reportes: src.reportes || [], presupuestos: src.presupuestos || [] }));
  const legacy = D.clientes, originales = D.proyectos.slice();
  const clients = [], byKey = {}, remap = {}, projOf = {}, nuevos = [], reutilizados = [];
  const used = new Set(D.proyectos.map(p => p.codigo));
  legacy.forEach(r => {
    const key = normKey(r.contacto);
    let c = key ? byKey[key] : null;
    if (!c) {
      c = { id: r.id, nombre: String(r.contacto || '').trim() || r.nombre, telefono: r.telefono || '', email: r.email || '', notas: '', creado: r.creado, modificado: r.modificado, porCompletar: !key, migradoDe: [r.id], demo: !!r.demo };
      if (key) byKey[key] = c;
      clients.push(c);
    } else {
      c.migradoDe.push(r.id);
      if (r.telefono && !c.telefono) c.telefono = r.telefono; else if (r.telefono && r.telefono !== c.telefono && !c.notas.includes(r.telefono)) c.notas += (c.notas ? '\n' : '') + 'Otro teléfono: ' + r.telefono;
      if (r.email && !c.email) c.email = r.email; else if (r.email && r.email !== c.email && !c.notas.includes(r.email)) c.notas += (c.notas ? '\n' : '') + 'Otro correo: ' + r.email;
      if (r.creado && r.creado < c.creado) c.creado = r.creado;
      if (r.modificado && r.modificado > c.modificado) c.modificado = r.modificado;
      c.demo = c.demo && !!r.demo;
    }
    remap[r.id] = c.id;
    const extra = { origen: r.origen || '', servicios: r.servicios || [], saldo: +r.saldo || 0, direccion: r.direccion || '' };
    const ex = originales.find(p => p.clienteId === r.id && !projOf[r.id] && !reutilizados.includes(p));
    if (ex) {
      Object.assign(ex, { clienteId: c.id, clienteNombre: c.nombre, legacyClientId: r.id, origen: ex.origen || extra.origen, servicios: (ex.servicios && ex.servicios.length) ? ex.servicios : extra.servicios, saldo: ex.saldo !== undefined ? ex.saldo : extra.saldo, direccion: ex.direccion || extra.direccion });
      if (r.notas && !String(ex.notas || '').includes(r.notas)) ex.notas = (ex.notas ? ex.notas + '\n' : '') + r.notas;
      projOf[r.id] = ex.id; reutilizados.push(ex);
    } else {
      let code = 'PRY-' + r.id, n = 1;
      while (used.has(code)) code = `PRY-${r.id}-${++n}`;
      used.add(code);
      const p = { id: uid(), codigo: code, nombre: r.nombre, clienteId: c.id, clienteNombre: c.nombre, obra: '', ...extra, estatus: EST_MAP[r.estatus] || 'por_iniciar', responsable: '', equipo: [], fechaInicio: '', fechaFin: '', fechaFinBase: '', notas: r.notas || '', sistemas: [], presupuestoIds: [], reprogramaciones: [], resueltas: [], avanceManual: null, created: r.creado, updated: r.modificado, legacyClientId: r.id, demo: !!r.demo };
      D.proyectos.push(p); projOf[r.id] = p.id; nuevos.push(p);
    }
  });
  const nameOf = id => (clients.find(c => c.id === id) || {}).nombre || '';
  originales.forEach(p => { if (p.clienteId && remap[p.clienteId] && !reutilizados.includes(p)) { p.clienteId = remap[p.clienteId]; p.clienteNombre = nameOf(p.clienteId); } });
  let cards = 0, reps = 0, buds = 0;
  D.board.columns.forEach(col => col.cards.forEach(k => {
    if (k.clienteId && remap[k.clienteId]) { if (!k.proyectoId) k.proyectoId = projOf[k.clienteId]; k.clienteId = remap[k.clienteId]; cards++; }
  }));
  D.reportes.forEach(r => { const d = r.data; if (d && d.clienteId && remap[d.clienteId]) { if (!d.proyectoId) d.proyectoId = projOf[d.clienteId]; d.clienteId = remap[d.clienteId]; reps++; } });
  D.presupuestos.forEach(b => {
    const old = b.clienteId || (b.data && b.data.clienteId);
    if (!old || !remap[old]) return;
    b.clienteId = remap[old]; b.clienteNombre = nameOf(b.clienteId);
    if (b.data) { b.data.clienteId = b.clienteId; b.data.clienteNombre = b.clienteNombre; }
    if (!b.proyectoId || !D.proyectos.some(p => p.id === b.proyectoId)) b.proyectoId = projOf[old];
    const pj = D.proyectos.find(p => p.id === b.proyectoId);
    if (pj && !(pj.presupuestoIds || []).includes(b.id)) (pj.presupuestoIds = pj.presupuestoIds || []).push(b.id);
    buds++;
  });
  return {
    data: { ...D, clientes: clients, schema: 2 },
    stats: { registros: legacy.length, clientes: clients.length, nuevos, reutilizados, unidos: clients.filter(c => c.migradoDe.length > 1), porCompletar: clients.filter(c => c.porCompletar), cards, reps, buds }
  };
}
async function applyMigration(plan, silent) {
  const d = plan.data;
  if (Store.mode === 'api') await Api.req('POST', 'api/migrate', d);
  ['clientes', 'proyectos', 'board', 'reportes', 'presupuestos'].forEach(k => { Store.data[k] = d[k]; });
  Store.data.schema = 2;
  if (Store.mode !== 'api') { try { localStorage.setItem('agis-db', JSON.stringify(Store.data)); } catch (e) {} }
  if (!silent) toast('Migración aplicada');
}
function downloadBackup() {
  const snap = { exportado: new Date().toISOString(), por: ME.username, clientes: Store.data.clientes, proyectos: Store.data.proyectos, board: Store.data.board, reportes: Store.data.reportes, presupuestos: Store.data.presupuestos };
  download(`respaldo-agis-${todayISO()}.json`, new Blob([JSON.stringify(snap, null, 1)], { type: 'application/json' }));
  toast('Descargando respaldo');
}
function migrationWizard() {
  if (!isAdmin()) return;
  const plan = planMigration(Store.data), st = plan.stats;
  const estL = k => (PEST.find(x => x.k === k) || {}).l || k;
  openModal({
    title: 'Separar Clientes y Proyectos', size: 'wide',
    body: `
      <p>Cada registro actual se divide en un <b>cliente</b> (la persona: contacto principal, teléfono y correo) y un <b>proyecto</b> (nombre, estatus, origen, dirección, servicios, saldo y notas). Revisa la vista previa antes de aplicar.</p>
      <div class="mig-stats">
        <div><b>${st.registros}</b><span>registros actuales</span></div>
        <div><b>${st.clientes}</b><span>clientes</span></div>
        <div><b>${st.nuevos.length + st.reutilizados.length}</b><span>proyectos</span></div>
        <div class="${st.porCompletar.length ? 'warn' : ''}"><b>${st.porCompletar.length}</b><span>por completar</span></div>
      </div>
      ${st.unidos.length ? `<h4 class="mig-h">Se unen en un solo cliente (mismo contacto)</h4><div class="mig-list">${st.unidos.map(c => `<div><b>${esc(c.nombre)}</b><span>${c.migradoDe.map(id => esc((Store.data.clientes.find(x => x.id === id) || {}).nombre || id)).join(' · ')}</span></div>`).join('')}</div>` : ''}
      ${st.porCompletar.length ? `<h4 class="mig-h">Sin contacto principal → nombre provisional, marcados "Por completar"</h4><div class="mig-list">${st.porCompletar.map(c => `<div><b>${esc(c.nombre)}</b><span>${esc(c.id)}</span></div>`).join('')}</div>` : ''}
      <h4 class="mig-h">Proyectos resultantes</h4>
      <div class="table-wrap"><div class="table-scroll" style="max-height:260px;overflow:auto"><table class="dt mig-dt"><thead><tr><th>Proyecto</th><th>Cliente</th><th>Estatus</th><th>Origen</th><th class="r">Saldo</th></tr></thead><tbody>
        ${[...st.reutilizados.map(p => ({ p, r: true })), ...st.nuevos.map(p => ({ p }))].map(({ p, r }) => `<tr><td><b>${esc(p.nombre)}</b><small class="meta-line" style="display:block">${esc(p.codigo)}${r ? ' · ya existía, se completa' : ''}</small></td><td>${esc(p.clienteNombre)}</td><td>${esc(estL(p.estatus))}</td><td>${esc(p.origen || '—')}</td><td class="money">${MXN.format(+p.saldo || 0)}</td></tr>`).join('')}
      </tbody></table></div></div>
      <p class="meta-line" style="margin-top:4px">Se re-ligan ${st.cards} actividades, ${st.reps} reportes y ${st.buds} presupuestos al cliente y a su proyecto. ${Store.mode === 'api' ? 'El servidor guarda un respaldo automático antes de aplicar.' : ''}</p>`,
    foot: `<button class="btn left" data-bk>${ICON.download}Descargar respaldo</button><button class="btn" data-x>Cancelar</button><button class="btn primary" data-go>${ICON.check}Aplicar migración</button>`,
    onMount(m, close) {
      m.querySelector('[data-bk]').onclick = downloadBackup;
      m.querySelector('[data-go]').onclick = async () => {
        if (!await confirmDialog('Aplicar migración', `Se crearán ${st.clientes} clientes y ${st.nuevos.length} proyectos nuevos. ¿Continuar?`, 'Aplicar', false)) return;
        const btn = m.querySelector('[data-go]'); btn.disabled = true; btn.lastChild.textContent = 'Aplicando…';
        try { await applyMigration(planMigration(Store.data)); close(); renderClientes($('#stage')); }
        catch (e) { toast('No se pudo aplicar: ' + e.message, true); btn.disabled = false; btn.lastChild.textContent = 'Aplicar migración'; }
      };
    }
  });
}

function renderClientes(stage) {
  if (isSchema2()) return renderClientes2(stage);
  renderClientesLegacy(stage);
  const panel = $('#clientes');
  if (panel) {
    const b = document.createElement('div');
    b.className = 'mig-banner';
    b.innerHTML = isAdmin()
      ? `${ICON.swap}<div><b>Separar Clientes y Proyectos</b><span>Esta lista mezcla clientes y proyectos. Revisa la vista previa y aplica la nueva estructura.</span></div><button class="btn primary" data-mig>Revisar migración</button>`
      : `${ICON.swap}<div><b>Estructura en revisión</b><span>Un administrador separará pronto los clientes de sus proyectos.</span></div>`;
    panel.prepend(b);
    b.querySelector('[data-mig]')?.addEventListener('click', migrationWizard);
  }
}

/* ---------- Clientes v2 ---------- */
const CS2 = { tab: 'all', q: '', page: 1, sel: new Set(), sort: 'nombre', dir: 1, origen: '', servicio: '', saldo: false, from: '', to: '' };
const projChips = cid => { const ps = projectsOf(cid); return ps.length ? `<div class="chips">${ps.slice(0, 3).map(p => `<span class="chip pchipx" style="--sc:${pestOf(p.estatus).c}"><i></i>${esc(p.nombre)}</span>`).join('')}${ps.length > 3 ? `<span class="chip">+${ps.length - 3}</span>` : ''}</div>` : '<span class="meta-line">Sin proyectos</span>'; };
const CLIENT2_COLS = [
  { k: 'id', l: 'ID', sort: true, w: 110, render: c => `<span class="mono">${esc(c.id)}</span>` },
  { k: 'telefono', l: 'Teléfono', def: true, w: 130, render: c => esc(c.telefono || '—') },
  { k: 'email', l: 'Correo', sort: true, def: true, w: 190, render: c => esc(c.email || '—') },
  { k: 'proyectos', l: 'Proyectos', def: true, w: 280, cls: () => 'svc', render: c => projChips(c.id) },
  { k: 'saldo', l: 'Saldo pendiente', sort: true, def: true, right: true, w: 140, cls: c => 'money ' + (saldoOf(c.id) > 0 ? '' : 'zero'), render: c => MXN.format(saldoOf(c.id)) },
  { k: 'creado', l: 'Creado el', sort: true, w: 120, render: c => fmtDate(c.creado) },
  { k: 'modificado', l: 'Última modificación', sort: true, def: true, w: 150, render: c => fmtDate(c.modificado) },
  { k: 'notas', l: 'Notas', w: 220, render: c => `<span class="clip">${esc(c.notas || '—')}</span>` }
];
function visibleCols2() {
  const pref = Store.data.colPrefs && Array.isArray(Store.data.colPrefs.clientes2) ? Store.data.colPrefs.clientes2 : CLIENT2_COLS.filter(c => c.def).map(c => c.k);
  return CLIENT2_COLS.filter(c => pref.includes(c.k));
}
const CTABS2 = [
  { k: 'all', l: 'Todos', f: () => true },
  { k: 'prospecto', l: 'Prospectos', f: c => projectsOf(c.id).some(p => p.estatus === 'prospecto') },
  { k: 'curso', l: 'En curso', f: c => projectsOf(c.id).some(p => ['en_curso', 'por_iniciar', 'pausado'].includes(p.estatus)) },
  { k: 'adicionales', l: 'Con Adicionales', f: c => projectsOf(c.id).some(p => p.estatus === 'adicionales') },
  { k: 'cerrado', l: 'Cerrado', f: c => { const ps = projectsOf(c.id); return ps.length > 0 && ps.every(p => p.estatus === 'cerrado'); } },
  { k: 'pend', l: 'Por completar', f: c => !!c.porCompletar }
];
function clientFiltered2(ignoreTab) {
  const q = normKey(CS2.q);
  const tf = (CTABS2.find(t => t.k === CS2.tab) || CTABS2[0]).f;
  let list = Store.data.clientes.filter(c => {
    if (!ignoreTab && !tf(c)) return false;
    const ps = projectsOf(c.id);
    if (q && !normKey([c.nombre, c.id, c.telefono, c.email, c.notas, ps.map(p => p.nombre + ' ' + p.codigo).join(' ')].join(' ')).includes(q)) return false;
    if (CS2.origen && !ps.some(p => p.origen === CS2.origen)) return false;
    if (CS2.servicio && !ps.some(p => (p.servicios || []).includes(CS2.servicio))) return false;
    if (CS2.saldo && !(saldoOf(c.id) > 0)) return false;
    const cd = c.creado ? localISO(new Date(c.creado)) : '';
    if (CS2.from && cd < CS2.from) return false;
    if (CS2.to && cd > CS2.to) return false;
    return true;
  });
  const k = CS2.sort, dir = CS2.dir;
  list.sort((a, b) => { let va = k === 'saldo' ? saldoOf(a.id) : String(a[k] || '').toLowerCase(), vb = k === 'saldo' ? saldoOf(b.id) : String(b[k] || '').toLowerCase(); return va < vb ? -dir : va > vb ? dir : 0; });
  return list;
}
function renderClientes2(stage) {
  CS2.sel.clear();
  stage.innerHTML = `
  <section class="panel" id="clientes2">
    <div class="view-head">
      <div><h1>Clientes</h1><p>Personas y empresas con las que trabajamos. Sus obras y saldos viven en Proyectos.</p></div>
      <div class="actions"><button class="btn" data-act="export">${ICON.download}Exportar</button><button class="btn primary" data-act="new">${ICON.plus}Crear nuevo</button></div>
    </div>
    <div class="tabs" id="c2Tabs"></div>
    <div class="toolbar">
      <div class="search">${ICON.search}<input class="input" id="c2Search" placeholder="Buscar cliente, teléfono, correo o proyecto…" value="${esc(CS2.q)}"></div>
      <span class="spacer"></span><span id="c2Demo"></span>
      <div class="pop-anchor"><button class="btn" data-act="cols">${ICON.columns}Columnas</button>
        <div class="dropdown hidden" id="c2Cols"><h4>Columnas visibles</h4><div class="colchecks" id="c2ColChecks"></div></div></div>
      <div class="pop-anchor"><button class="btn" data-act="filters">${ICON.filter}Filtros <span id="c2FCount"></span></button>
        <div class="dropdown hidden" id="c2Filters"><h4>Filtrar</h4><div style="display:flex;flex-direction:column;gap:12px">
          <div class="grid2"><div class="field"><label>Creado desde</label><input type="date" class="input" id="c2From" value="${esc(CS2.from)}"></div><div class="field"><label>Hasta</label><input type="date" class="input" id="c2To" value="${esc(CS2.to)}"></div></div>
          <div class="field"><label>Origen (de sus proyectos)</label><select class="input" id="c2Origen"><option value="">Todos</option>${ORIGENES.map(o => `<option ${CS2.origen === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>
          <div class="field"><label>Servicio contratado</label><select class="input" id="c2Serv"><option value="">Todos</option>${SERVICIOS.map(o => `<option ${CS2.servicio === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>
          <label style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:13px"><input type="checkbox" id="c2Saldo" ${CS2.saldo ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--navy)"> Solo con saldo pendiente</label>
          <button class="btn sm ghost" data-act="fclear" style="align-self:flex-start">Limpiar filtros</button>
        </div></div></div>
    </div>
    <div id="c2Bulk"></div>
    <div class="table-wrap"><div class="table-scroll"><table class="dt"><thead id="c2Head"></thead><tbody id="c2Body"></tbody></table></div><div class="pager" id="c2Pager"></div></div>
  </section>`;
  const root = $('#clientes2');
  $('#c2Search').addEventListener('input', debounce(e => { CS2.q = e.target.value; CS2.page = 1; refreshClientes2(); }, 160));
  root.addEventListener('change', e => {
    const id = e.target.id;
    if (id === 'c2Origen') CS2.origen = e.target.value; else if (id === 'c2Serv') CS2.servicio = e.target.value; else if (id === 'c2Saldo') CS2.saldo = e.target.checked;
    else if (id === 'c2From') CS2.from = e.target.value; else if (id === 'c2To') CS2.to = e.target.value;
    else if (e.target.closest('#c2ColChecks')) { Store.data.colPrefs = { ...(Store.data.colPrefs || {}), clientes2: CLIENT2_COLS.map(c => c.k).filter(k => $$('#c2ColChecks input:checked').some(i => i.value === k)) }; Store.save('colPrefs'); }
    else if (id === 'ck2All') { pageRows2().forEach(c => e.target.checked ? CS2.sel.add(c.id) : CS2.sel.delete(c.id)); }
    else if (e.target.closest('tr[data-id]')) { const cid = e.target.closest('tr').dataset.id; e.target.checked ? CS2.sel.add(cid) : CS2.sel.delete(cid); }
    else return;
    CS2.page = 1; refreshClientes2();
  });
  root.addEventListener('click', e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'new') return clientForm2();
    if (a === 'export') return exportClientes2();
    if (a === 'cols' || a === 'filters') {
      const id = a === 'cols' ? 'c2Cols' : 'c2Filters', other = a === 'cols' ? 'c2Filters' : 'c2Cols';
      $('#' + other).classList.add('hidden');
      if (a === 'cols') { const vis = visibleCols2().map(c => c.k); $('#c2ColChecks').innerHTML = `<label class="colcheck fixed"><input type="checkbox" checked disabled> Nombre</label>` + CLIENT2_COLS.map(c => `<label class="colcheck"><input type="checkbox" value="${c.k}" ${vis.includes(c.k) ? 'checked' : ''}> ${esc(c.l)}</label>`).join(''); }
      $('#' + id).classList.toggle('hidden'); return;
    }
    if (a === 'fclear') { Object.assign(CS2, { origen: '', servicio: '', saldo: false, from: '', to: '' }); renderClientes2($('#stage')); return; }
    if (a === 'bulk-del') return bulkDelete2();
    if (a === 'bulk-clear') { CS2.sel.clear(); refreshClientes2(); return; }
    if (a === 'clear-demo') return clearDemo();
    const tab = e.target.closest('[data-tab]'); if (tab) { CS2.tab = tab.dataset.tab; CS2.page = 1; refreshClientes2(); return; }
    const th = e.target.closest('th[data-sort]'); if (th) { const k = th.dataset.sort; if (CS2.sort === k) CS2.dir *= -1; else { CS2.sort = k; CS2.dir = k === 'nombre' ? 1 : -1; } refreshClientes2(); return; }
    const pg = e.target.closest('[data-pg]'); if (pg) { CS2.page = +pg.dataset.pg; refreshClientes2(); return; }
    const more = e.target.closest('[data-more]');
    if (more) { const c = Store.data.clientes.find(x => x.id === more.dataset.more); return popMenu(more, [{ label: 'Editar', icon: 'edit', run: () => clientForm2(c) }, ...(can('proyectos') ? [{ label: 'Nuevo proyecto', icon: 'folder', run: () => newProjectFor(c) }] : []), '-', { label: 'Eliminar', icon: 'trash', danger: true, run: () => deleteClient2(c) }]); }
    if (e.target.closest('input[type=checkbox]')) return;
    const tr = e.target.closest('tr[data-id]'); if (tr) clientForm2(Store.data.clientes.find(x => x.id === tr.dataset.id));
  });
  document.addEventListener('pointerdown', function out(ev) { if (!document.body.contains(root)) { document.removeEventListener('pointerdown', out, true); return; } $$('#clientes2 .dropdown:not(.hidden)').forEach(dd => { if (!dd.parentElement.contains(ev.target)) dd.classList.add('hidden'); }); }, true);
  refreshClientes2();
}
const pageRows2 = () => clientFiltered2().slice((CS2.page - 1) * PAGE, CS2.page * PAGE);
function refreshClientes2() {
  if (!$('#clientes2')) return;
  const all = clientFiltered2(true);
  $('#c2Tabs').innerHTML = CTABS2.map(t => `<button class="tab ${CS2.tab === t.k ? 'on' : ''}" data-tab="${t.k}">${t.l} <span class="badge">${pad(all.filter(t.f).length)}</span></button>`).join('');
  const hasDemo = Store.data.clientes.some(c => c.demo) || Store.data.proyectos.some(p => p.demo);
  $('#c2Demo').innerHTML = hasDemo && can('actividades') && can('proyectos') ? `<span class="demo-note">Datos de ejemplo <button class="btn sm ghost" data-act="clear-demo">Limpiar</button></span>` : '';
  const fc = (CS2.origen ? 1 : 0) + (CS2.servicio ? 1 : 0) + (CS2.saldo ? 1 : 0) + (CS2.from || CS2.to ? 1 : 0);
  $('#c2FCount').innerHTML = fc ? `<span class="dot-count">${fc}</span>` : '';
  const cols = visibleCols2();
  $('#c2Head').innerHTML = `<tr><th class="ck"><input type="checkbox" id="ck2All" aria-label="Seleccionar todos"></th><th class="sortable" data-sort="nombre">Nombre<span class="arr"></span></th>${cols.map(c => `<th class="${c.sort ? 'sortable' : ''} ${c.right ? 'r' : ''}" ${c.sort ? `data-sort="${c.k}"` : ''}>${esc(c.l)}${c.sort ? '<span class="arr"></span>' : ''}</th>`).join('')}<th style="width:44px"></th></tr>`;
  $('#clientes2 table.dt').style.minWidth = Math.max(640, 320 + cols.reduce((a, c) => a + (c.w || 150), 0)) + 'px';
  $$('#clientes2 th[data-sort]').forEach(th => { const on = th.dataset.sort === CS2.sort; th.classList.toggle('sorted', on); th.querySelector('.arr').textContent = on ? (CS2.dir > 0 ? '↑' : '↓') : '↕'; });
  const list = clientFiltered2(), pages = Math.max(1, Math.ceil(list.length / PAGE));
  if (CS2.page > pages) CS2.page = pages;
  const rows = pageRows2();
  $('#c2Body').innerHTML = rows.length ? rows.map(c => { const n = projectsOf(c.id).length; return `
    <tr data-id="${esc(c.id)}" class="${CS2.sel.has(c.id) ? 'sel' : ''}">
      <td class="ck"><input type="checkbox" ${CS2.sel.has(c.id) ? 'checked' : ''} aria-label="Seleccionar"></td>
      <td><div class="cname"><b>${esc(c.nombre)}</b><small>${c.porCompletar ? '<span class="pend-badge">Por completar</span>' : `${n} proyecto${n === 1 ? '' : 's'}`}</small></div></td>
      ${cols.map(col => `<td data-l="${esc(col.l)}" class="${col.cls ? col.cls(c) : ''}">${col.render(c)}</td>`).join('')}
      <td class="act"><button class="icon-btn" data-more="${esc(c.id)}" aria-label="Acciones">${ICON.more}</button></td>
    </tr>`; }).join('') : `<tr><td colspan="${cols.length + 3}"><div class="empty">${ICON.inbox}<b>Sin resultados</b>${Store.data.clientes.length ? 'Ajusta la búsqueda o los filtros.' : 'Registra tu primer cliente con “Crear nuevo”.'}</div></td></tr>`;
  const ck = $('#ck2All'), ids = rows.map(c => c.id);
  ck.checked = ids.length > 0 && ids.every(id => CS2.sel.has(id)); ck.indeterminate = !ck.checked && ids.some(id => CS2.sel.has(id));
  $('#c2Bulk').innerHTML = CS2.sel.size ? `<div class="bulkbar">${CS2.sel.size} seleccionado${CS2.sel.size > 1 ? 's' : ''}<span style="flex:1"></span><button class="btn sm" data-act="export">${ICON.download}Exportar</button><button class="btn sm danger" data-act="bulk-del">${ICON.trash}Eliminar</button><button class="icon-btn" data-act="bulk-clear">${ICON.x}</button></div>` : '';
  const p = CS2.page; let html = '';
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - p) <= 1) html += `<button class="pg ${i === p ? 'on' : ''}" data-pg="${i}">${i}</button>`;
  $('#c2Pager').innerHTML = `<button class="btn sm" data-pg="${p - 1}" ${p <= 1 ? 'disabled' : ''}>${ICON.left}Anterior</button><div class="pages">${html}</div><button class="btn sm" data-pg="${p + 1}" ${p >= pages ? 'disabled' : ''}>Siguiente${ICON.right}</button>`;
}
function newProjectFor(c) {
  if (!can('proyectos')) return;
  go('proyectos');
  projectForm(null, { clienteId: c.id });
}
function clientForm2(c) {
  const isNew = !c;
  c = c ? { ...c } : { nombre: '', telefono: '', email: '', notas: '', porCompletar: false };
  const ps = isNew ? [] : projectsOf(c.id);
  openModal({
    title: isNew ? 'Nuevo cliente' : 'Editar cliente', size: 'wide',
    body: `${!isNew ? `<div class="meta-line">Creado ${fmtDate(c.creado)} · Modificado ${fmtDate(c.modificado)}</div>` : ''}
      ${c.porCompletar ? `<div class="pend-box">${ICON.edit}<span>Este cliente se creó con un nombre provisional durante la migración. Escribe el nombre real del contacto.</span></div>` : ''}
      <div class="grid2">
        <div class="field"><label>ID del cliente <span class="req">*</span></label><input class="input mono" name="cid" value="${esc(isNew ? nextClientId() : c.id)}" maxlength="30"></div>
        <div class="field"><label>Nombre del cliente <span class="req">*</span></label><input class="input" name="nombre" value="${esc(c.nombre)}" placeholder="Persona o empresa" autofocus></div>
        <div class="field"><label>Teléfono</label><input class="input" name="telefono" type="tel" value="${esc(c.telefono)}"></div>
        <div class="field"><label>Correo</label><input class="input" name="email" type="email" value="${esc(c.email)}"></div>
        <div class="field span2"><label>Notas</label><textarea class="input" name="notas" rows="3">${esc(c.notas)}</textarea></div>
        ${!isNew ? `<div class="field span2"><label>Proyectos (${ps.length})</label><div class="plinks">${ps.map(p => `<div class="plink" data-openp="${p.id}">${ICON.folder}<span><b>${esc(p.nombre)}</b><small>${esc(p.codigo)} · ${esc(pestOf(p.estatus).l)}${+p.saldo ? ' · Saldo ' + MXN.format(p.saldo) : ''}</small></span></div>`).join('') || '<span class="meta-line">Sin proyectos.</span>'}</div>
          ${can('proyectos') ? `<button type="button" class="btn sm" data-newp style="align-self:flex-start;margin-top:6px">${ICON.plus}Nuevo proyecto para este cliente</button>` : ''}</div>` : ''}
      </div>`,
    foot: `${!isNew ? `<button class="btn danger left" data-del>${ICON.trash}Eliminar</button>` : ''}<button class="btn" data-x>Cancelar</button><button class="btn primary" data-save>${ICON.save}Guardar</button>`,
    onMount(m, close) {
      const f = n => m.querySelector(`[name=${n}]`);
      m.addEventListener('click', e => {
        const op = e.target.closest('[data-openp]'); if (op && can('proyectos')) { close(); openProject(op.dataset.openp); }
        if (e.target.closest('[data-newp]')) { close(); newProjectFor(c); }
      });
      m.querySelector('[data-del]')?.addEventListener('click', () => { close(); deleteClient2(c); });
      m.querySelector('[data-save]').onclick = () => {
        const nombre = f('nombre').value.trim(), cid = f('cid').value.trim();
        if (!nombre) { f('nombre').classList.add('invalid'); f('nombre').focus(); return; }
        if (!cid) { f('cid').classList.add('invalid'); return; }
        if (Store.data.clientes.some(x => x.id.toLowerCase() === cid.toLowerCase() && (isNew || x.id !== c.id))) { f('cid').classList.add('invalid'); return toast(`El ID ${cid} ya está asignado`, true); }
        const now = new Date().toISOString();
        const rec = { nombre, telefono: f('telefono').value.trim(), email: f('email').value.trim(), notas: f('notas').value.trim(), modificado: now, porCompletar: false, demo: false };
        if (isNew) { Store.data.clientes.unshift({ id: cid, creado: now, ...rec }); toast('Cliente registrado'); }
        else {
          const i = Store.data.clientes.findIndex(x => x.id === c.id);
          Store.data.clientes[i] = { ...Store.data.clientes[i], ...rec, id: cid };
          relinkClient2(c.id, cid, nombre);
          toast('Cambios guardados');
        }
        Store.save('clientes'); close(); refreshClientes2();
      };
    }
  });
}
/* Mantiene nombre e ID del cliente al día en proyectos, actividades, reportes y presupuestos */
function relinkClient2(oldId, newId, nombre) {
  let p = false, b = false, r = false, bd = false;
  Store.data.proyectos.forEach(x => { if (x.clienteId === oldId) { x.clienteId = newId; x.clienteNombre = nombre; p = true; } });
  Store.data.presupuestos.forEach(x => { if (x.clienteId === oldId) { x.clienteId = newId; x.clienteNombre = nombre; if (x.data) { x.data.clienteId = newId; x.data.clienteNombre = nombre; } bd = true; } });
  if (oldId !== newId) {
    Store.data.board.columns.forEach(col => col.cards.forEach(k => { if (k.clienteId === oldId) { k.clienteId = newId; b = true; } }));
    Store.data.reportes.forEach(x => { if (x.data && x.data.clienteId === oldId) { x.data.clienteId = newId; r = true; } });
  }
  if (p) Store.save('proyectos'); if (bd) Store.save('presupuestos'); if (b) Store.save('board'); if (r) Store.save('reportes');
}
async function deleteClient2(c) {
  const n = projectsOf(c.id).length;
  if (n) return toast(`${c.nombre} tiene ${n} proyecto${n > 1 ? 's' : ''}. Elimínalos o cámbialos de cliente primero.`, true);
  if (!await confirmDialog('Eliminar cliente', `¿Eliminar <b>${esc(c.nombre)}</b> (${esc(c.id)})?`)) return;
  Store.data.clientes = Store.data.clientes.filter(x => x.id !== c.id); CS2.sel.delete(c.id);
  Store.save('clientes'); refreshClientes2(); toast('Cliente eliminado');
}
async function bulkDelete2() {
  const sel = Store.data.clientes.filter(c => CS2.sel.has(c.id)), conP = sel.filter(c => projectsOf(c.id).length);
  const del = sel.filter(c => !projectsOf(c.id).length);
  if (!del.length) return toast('Los seleccionados tienen proyectos; no se pueden eliminar', true);
  if (!await confirmDialog('Eliminar clientes', `¿Eliminar ${del.length} cliente${del.length > 1 ? 's' : ''}?${conP.length ? ` ${conP.length} con proyectos se conservan.` : ''}`)) return;
  const ids = new Set(del.map(c => c.id));
  Store.data.clientes = Store.data.clientes.filter(c => !ids.has(c.id)); CS2.sel.clear();
  Store.save('clientes'); refreshClientes2();
}
function exportClientes2() {
  const list = CS2.sel.size ? Store.data.clientes.filter(c => CS2.sel.has(c.id)) : clientFiltered2();
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['ID', 'Nombre', 'Teléfono', 'Correo', 'Proyectos', 'Saldo pendiente', 'Creado el', 'Última modificación', 'Por completar', 'Notas'];
  const rows = list.map(c => [c.id, c.nombre, c.telefono, c.email, projectsOf(c.id).map(p => p.nombre).join(' | '), saldoOf(c.id).toFixed(2), fmtDate(c.creado), fmtDate(c.modificado), c.porCompletar ? 'Sí' : '', c.notas].map(q).join(','));
  download(`clientes_${todayISO()}.csv`, new Blob(['﻿' + [head.map(q).join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  toast(`Exportando ${list.length} cliente${list.length !== 1 ? 's' : ''}`);
}

/* ================= CLIENTES ================= */
const statusPill = k => `<span class="spill sp-${esc(k)}"><i class="sdot s-${esc(k)}"></i>${esc(ESTATUS.find(s => s.k === k)?.l || 'Sin estatus')}</span>`;
const svcChips = c => `<div class="chips">${(c.servicios || []).map(s => `<span class="chip ${svcClass(s)}">${esc(s)}</span>`).join('') || '<span class="meta-line">—</span>'}</div>`;
const CLIENT_COLS = [
  { k: 'id', l: 'ID', sort: true, w: 110, render: c => `<span class="mono">${esc(c.id)}</span>` },
  { k: 'estatus', l: 'Estatus', sort: true, w: 140, render: c => statusPill(c.estatus) },
  { k: 'creado', l: 'Creado el', sort: true, def: true, w: 120, render: c => fmtDate(c.creado) },
  { k: 'modificado', l: 'Última modificación', sort: true, def: true, w: 150, render: c => fmtDate(c.modificado) },
  { k: 'origen', l: 'Origen', sort: true, def: true, w: 150, render: c => esc(c.origen || '—') },
  { k: 'contacto', l: 'Contacto principal', sort: true, w: 160, render: c => esc(c.contacto || '—') },
  { k: 'telefono', l: 'Teléfono', w: 130, render: c => esc(c.telefono || '—') },
  { k: 'email', l: 'Correo', sort: true, w: 190, render: c => esc(c.email || '—') },
  { k: 'direccion', l: 'Dirección', w: 220, render: c => `<span class="clip">${esc(c.direccion || '—')}</span>` },
  { k: 'servicios', l: 'Servicios contratados', def: true, w: 240, cls: () => 'svc', render: svcChips },
  { k: 'saldo', l: 'Saldo pendiente', sort: true, def: true, right: true, w: 140, cls: c => 'money ' + (+c.saldo > 0 ? '' : 'zero'), render: c => MXN.format(+c.saldo || 0) },
  { k: 'notas', l: 'Notas', w: 220, render: c => `<span class="clip">${esc(c.notas || '—')}</span>` }
];
function visibleCols() {
  const pref = Store.data.colPrefs && Array.isArray(Store.data.colPrefs.clientes) ? Store.data.colPrefs.clientes : CLIENT_COLS.filter(c => c.def).map(c => c.k);
  return CLIENT_COLS.filter(c => pref.includes(c.k));
}
function setVisibleCols(keys) {
  Store.data.colPrefs = { ...(Store.data.colPrefs || {}), clientes: CLIENT_COLS.map(c => c.k).filter(k => keys.includes(k)) };
  Store.save('colPrefs');
}
function drawColChecks() {
  const vis = visibleCols().map(c => c.k);
  $('#colChecks').innerHTML = `<label class="colcheck fixed"><input type="checkbox" checked disabled> Nombre y estatus</label>` +
    CLIENT_COLS.map(c => `<label class="colcheck"><input type="checkbox" value="${c.k}" ${vis.includes(c.k) ? 'checked' : ''}> ${esc(c.l)}</label>`).join('');
}
const CS = { tab: 'all', q: '', from: '', to: '', origen: '', servicio: '', saldo: false, page: 1, sel: new Set(), sort: 'creado', dir: -1, showFilters: false, showDates: false };
const PAGE = 10;

function nextClientId() {
  const d = new Date();
  const pre = `${pad(d.getDate())}${pad(d.getMonth() + 1)}${String(d.getFullYear()).slice(-2)}`;
  const max = Store.data.clientes.filter(c => c.id.startsWith(pre + '-')).reduce((a, c) => Math.max(a, parseInt(c.id.split('-')[1], 10) || 0), 0);
  return `${pre}-${pad(max + 1)}`;
}
function clientFiltered(ignoreTab) {
  const q = CS.q.trim().toLowerCase();
  let list = Store.data.clientes.filter(c => {
    if (!ignoreTab && CS.tab !== 'all' && c.estatus !== CS.tab) return false;
    if (q && ![c.nombre, c.id, c.origen, c.email, c.telefono, c.contacto, (c.servicios || []).join(' ')].join(' ').toLowerCase().includes(q)) return false;
    const cd = localISO(new Date(c.creado));
    if (CS.from && cd < CS.from) return false;
    if (CS.to && cd > CS.to) return false;
    if (CS.origen && c.origen !== CS.origen) return false;
    if (CS.servicio && !(c.servicios || []).includes(CS.servicio)) return false;
    if (CS.saldo && !(+c.saldo > 0)) return false;
    return true;
  });
  const k = CS.sort, dir = CS.dir;
  list.sort((a, b) => {
    let va = a[k], vb = b[k];
    if (k === 'saldo') { va = +va || 0; vb = +vb || 0; }
    else if (k === 'servicios') { va = (va || []).length; vb = (vb || []).length; }
    else { va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase(); }
    return va < vb ? -dir : va > vb ? dir : 0;
  });
  return list;
}
function renderClientesLegacy(stage) {
  CS.sel.clear(); CS.page = 1;
  stage.innerHTML = `
  <section class="panel" id="clientes">
    <div class="view-head">
      <div><h1>Clientes</h1><p>Consulta y administra la información de los clientes de Arquitechtura.</p></div>
      <div class="actions">
        <button class="btn" data-act="export">${ICON.download}Exportar</button>
        <button class="btn primary" data-act="new">${ICON.plus}Crear nuevo</button>
      </div>
    </div>
    <div class="tabs" id="cTabs"></div>
    <div class="toolbar">
      <div class="search">${ICON.search}<input class="input" id="cSearch" placeholder="Buscar clientes, ID, servicio…" value="${esc(CS.q)}"></div>
      <span class="spacer"></span>
      <span id="demoNote"></span>
      <div class="pop-anchor">
        <button class="btn" data-act="cols">${ICON.columns}Columnas</button>
        <div class="dropdown hidden" id="colsDd">
          <h4>Columnas visibles</h4>
          <div class="colchecks" id="colChecks"></div>
          <div style="display:flex;justify-content:space-between;gap:8px;margin-top:12px"><button class="btn sm ghost" data-act="colreset">Restablecer</button><button class="btn sm primary" data-act="colclose">Listo</button></div>
        </div>
      </div>
      <div class="pop-anchor">
        <button class="btn" data-act="dates">${ICON.cal}<span id="dateLbl"></span></button>
        <div class="dropdown hidden" id="dateDd">
          <h4>Rango de fechas de creación</h4>
          <div class="grid2">
            <div class="field"><label>Desde</label><input type="date" class="input" id="dFrom"></div>
            <div class="field"><label>Hasta</label><input type="date" class="input" id="dTo"></div>
          </div>
          <div class="presets">
            <button class="chip-btn" data-preset="month">Este mes</button>
            <button class="chip-btn" data-preset="30">Últimos 30 días</button>
            <button class="chip-btn" data-preset="90">Últimos 90 días</button>
            <button class="chip-btn" data-preset="year">Este año</button>
            <button class="chip-btn" data-preset="clear">Todas</button>
          </div>
        </div>
      </div>
      <div class="pop-anchor">
        <button class="btn" data-act="filters">${ICON.filter}Filtros <span id="fCount"></span></button>
        <div class="dropdown hidden" id="filterDd">
          <h4>Filtrar tabla</h4>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="field"><label>Origen</label><select class="input" id="fOrigen"><option value="">Todos</option>${ORIGENES.map(o => `<option>${esc(o)}</option>`).join('')}</select></div>
            <div class="field"><label>Servicio contratado</label><select class="input" id="fServ"><option value="">Todos</option>${SERVICIOS.map(o => `<option>${esc(o)}</option>`).join('')}</select></div>
            <label style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:13px"><input type="checkbox" id="fSaldo" style="width:17px;height:17px;accent-color:var(--navy)"> Solo con saldo pendiente</label>
            <div style="display:flex;justify-content:space-between;gap:8px"><button class="btn sm ghost" data-act="fclear">Limpiar filtros</button><button class="btn sm primary" data-act="fclose">Aplicar</button></div>
          </div>
        </div>
      </div>
    </div>
    <div id="bulk"></div>
    <div class="table-wrap"><div class="table-scroll"><table class="dt">
      <thead id="cHead"></thead>
      <tbody id="cBody"></tbody>
    </table></div><div class="pager" id="cPager"></div></div>
  </section>`;
  const root = $('#clientes');
  $('#fOrigen').value = CS.origen; $('#fServ').value = CS.servicio; $('#fSaldo').checked = CS.saldo;
  $('#dFrom').value = CS.from; $('#dTo').value = CS.to;

  $('#cSearch').addEventListener('input', debounce(e => { CS.q = e.target.value; CS.page = 1; refreshClientes(); }, 180));
  $('#fOrigen').onchange = e => { CS.origen = e.target.value; CS.page = 1; refreshClientes(); };
  $('#fServ').onchange = e => { CS.servicio = e.target.value; CS.page = 1; refreshClientes(); };
  $('#fSaldo').onchange = e => { CS.saldo = e.target.checked; CS.page = 1; refreshClientes(); };
  $('#dFrom').onchange = e => { CS.from = e.target.value; CS.page = 1; refreshClientes(); };
  $('#dTo').onchange = e => { CS.to = e.target.value; CS.page = 1; refreshClientes(); };
  root.addEventListener('change', e => {
    if (e.target.id !== 'ckAll') return;
    const ids = pageSlice(clientFiltered()).map(c => c.id);
    ids.forEach(id => e.target.checked ? CS.sel.add(id) : CS.sel.delete(id));
    refreshClientes();
  });

  root.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'new') return clientForm();
    if (act === 'export') return exportClientes();
    if (act === 'dates' || act === 'filters' || act === 'cols') {
      const id = { dates: 'dateDd', filters: 'filterDd', cols: 'colsDd' }[act];
      ['dateDd', 'filterDd', 'colsDd'].forEach(d => { if (d !== id) $('#' + d).classList.add('hidden'); });
      if (act === 'cols') drawColChecks();
      $('#' + id).classList.toggle('hidden'); return;
    }
    if (act === 'colclose') { $('#colsDd').classList.add('hidden'); return; }
    if (act === 'colreset') { setVisibleCols(CLIENT_COLS.filter(c => c.def).map(c => c.k)); drawColChecks(); refreshClientes(); return; }
    if (act === 'fclose') { $('#filterDd').classList.add('hidden'); return; }
    if (act === 'fclear') { CS.origen = CS.servicio = ''; CS.saldo = false; $('#fOrigen').value = ''; $('#fServ').value = ''; $('#fSaldo').checked = false; CS.page = 1; refreshClientes(); return; }
    if (act === 'bulk-del') return bulkDelete();
    if (act === 'bulk-clear') { CS.sel.clear(); refreshClientes(); return; }
    if (act === 'clear-demo') return clearDemo();
    const preset = e.target.closest('[data-preset]')?.dataset.preset;
    if (preset) {
      const t = new Date();
      if (preset === 'clear') CS.from = CS.to = '';
      else if (preset === 'month') { CS.from = localISO(new Date(t.getFullYear(), t.getMonth(), 1)); CS.to = todayISO(); }
      else if (preset === 'year') { CS.from = `${t.getFullYear()}-01-01`; CS.to = todayISO(); }
      else { const f = new Date(t); f.setDate(f.getDate() - +preset); CS.from = localISO(f); CS.to = todayISO(); }
      $('#dFrom').value = CS.from; $('#dTo').value = CS.to; CS.page = 1;
      $('#dateDd').classList.add('hidden'); refreshClientes(); return;
    }
    const tab = e.target.closest('[data-tab]');
    if (tab) { CS.tab = tab.dataset.tab; CS.page = 1; refreshClientes(); return; }
    const th = e.target.closest('th[data-sort]');
    if (th) { const k = th.dataset.sort; if (CS.sort === k) CS.dir *= -1; else { CS.sort = k; CS.dir = k === 'nombre' || k === 'origen' ? 1 : -1; } refreshClientes(); return; }
    const pg = e.target.closest('[data-pg]');
    if (pg) { CS.page = +pg.dataset.pg; refreshClientes(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const more = e.target.closest('[data-more]');
    if (more) {
      const c = Store.data.clientes.find(x => x.id === more.dataset.more);
      popMenu(more, [
        { label: 'Editar', icon: 'edit', run: () => clientForm(c) },
        { label: 'Duplicar', icon: 'copy', run: () => clientForm({ ...c, id: null, nombre: c.nombre + ' (copia)' }, true) },
        '-',
        { label: 'Eliminar', icon: 'trash', danger: true, run: () => deleteClient(c) }
      ]);
      return;
    }
    if (e.target.closest('input[type=checkbox]')) return;
    const tr = e.target.closest('tr[data-id]');
    if (tr) clientForm(Store.data.clientes.find(x => x.id === tr.dataset.id));
  });
  root.addEventListener('change', e => {
    if (e.target.closest('#colChecks')) {
      setVisibleCols($$('#colChecks input:checked').map(i => i.value)); refreshClientes(); return;
    }
    const ck = e.target.closest('tr[data-id] input[type=checkbox]');
    if (ck) { const id = ck.closest('tr').dataset.id; ck.checked ? CS.sel.add(id) : CS.sel.delete(id); refreshClientes(); }
  });
  if (!window._ddBound) { document.addEventListener('pointerdown', closeDdOutside, true); window._ddBound = true; }
  refreshClientes();
}
function closeDdOutside(e) {
  if (current !== 'clientes') return;
  $$('#clientes .dropdown:not(.hidden)').forEach(dd => { if (!dd.parentElement.contains(e.target)) dd.classList.add('hidden'); });
}
const pageSlice = list => list.slice((CS.page - 1) * PAGE, CS.page * PAGE);

function refreshClientes() {
  if (current !== 'clientes' && !$('#clientes')) return;
  const all = clientFiltered(true);
  const counts = { all: all.length }; ESTATUS.forEach(s => counts[s.k] = all.filter(c => c.estatus === s.k).length);
  $('#cTabs').innerHTML = [{ k: 'all', tab: 'Todos' }, ...ESTATUS].map(s =>
    `<button class="tab ${CS.tab === s.k ? 'on' : ''}" data-tab="${s.k}">${esc(s.tab)} <span class="badge">${pad(counts[s.k])}</span></button>`).join('');
  $('#dateLbl').textContent = CS.from || CS.to ? `${fmtLong(CS.from) || '…'} – ${fmtLong(CS.to) || 'hoy'}` : 'Todas las fechas';
  const fc = (CS.origen ? 1 : 0) + (CS.servicio ? 1 : 0) + (CS.saldo ? 1 : 0);
  $('#fCount').innerHTML = fc ? `<span class="dot-count">${fc}</span>` : '';
  const hasDemo = Store.data.clientes.some(c => c.demo) || Store.data.board.columns.some(col => col.cards.some(k => k.demo));
  $('#demoNote').innerHTML = hasDemo ? `<span class="demo-note">Datos de ejemplo <button class="btn sm ghost" data-act="clear-demo">Limpiar</button></span>` : '';
  const cols = visibleCols();
  $('#cHead').innerHTML = `<tr><th class="ck"><input type="checkbox" id="ckAll" aria-label="Seleccionar todos"></th>
    <th class="sortable" data-sort="nombre">Nombre<span class="arr"></span></th>
    ${cols.map(c => `<th class="${c.sort ? 'sortable' : ''} ${c.right ? 'r' : ''}" ${c.sort ? `data-sort="${c.k}"` : ''}>${esc(c.l)}${c.sort ? '<span class="arr"></span>' : ''}</th>`).join('')}
    <th style="width:44px"></th></tr>`;
  $('#clientes table.dt').style.minWidth = Math.max(640, 320 + cols.reduce((a, c) => a + (c.w || 150), 0)) + 'px';
  $$('#clientes th[data-sort]').forEach(th => {
    const on = th.dataset.sort === CS.sort; th.classList.toggle('sorted', on);
    th.querySelector('.arr').textContent = on ? (CS.dir > 0 ? '↑' : '↓') : '↕';
  });

  const list = clientFiltered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  if (CS.page > pages) CS.page = pages;
  const rows = pageSlice(list);
  $('#cBody').innerHTML = rows.length ? rows.map(c => `
    <tr data-id="${esc(c.id)}" class="${CS.sel.has(c.id) ? 'sel' : ''}">
      <td class="ck"><input type="checkbox" ${CS.sel.has(c.id) ? 'checked' : ''} aria-label="Seleccionar"></td>
      <td><div class="cname"><b>${esc(c.nombre)}</b><small>${statusPill(c.estatus)}</small></div></td>
      ${cols.map(col => `<td data-l="${esc(col.l)}" class="${col.cls ? col.cls(c) : ''}">${col.render(c)}</td>`).join('')}
      <td class="act"><button class="icon-btn" data-more="${esc(c.id)}" aria-label="Acciones">${ICON.more}</button></td>
    </tr>`).join('')
    : `<tr><td colspan="${cols.length + 3}"><div class="empty">${ICON.inbox}<b>Sin resultados</b>${Store.data.clientes.length ? 'Ajusta la búsqueda o los filtros.' : 'Registra tu primer cliente con “Crear nuevo”.'}</div></td></tr>`;

  const ids = rows.map(c => c.id);
  const ckAll = $('#ckAll');
  ckAll.checked = ids.length > 0 && ids.every(id => CS.sel.has(id));
  ckAll.indeterminate = !ckAll.checked && ids.some(id => CS.sel.has(id));

  $('#bulk').innerHTML = CS.sel.size ? `<div class="bulkbar">${CS.sel.size} seleccionado${CS.sel.size > 1 ? 's' : ''}<span style="flex:1"></span>
    <button class="btn sm" data-act="export">${ICON.download}Exportar</button>
    <button class="btn sm danger" data-act="bulk-del">${ICON.trash}Eliminar</button>
    <button class="icon-btn" data-act="bulk-clear" aria-label="Quitar selección">${ICON.x}</button></div>` : '';

  // paginación
  const p = CS.page, nums = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - p) <= 1 || (p <= 3 && i <= 4) || (p >= pages - 2 && i >= pages - 3)) nums.push(i);
  let html = '', prev = 0;
  nums.forEach(n => { if (n - prev > 1) html += `<span class="pg dots">…</span>`; html += `<button class="pg ${n === p ? 'on' : ''}" data-pg="${n}">${n}</button>`; prev = n; });
  $('#cPager').innerHTML = `
    <button class="btn sm" data-pg="${p - 1}" ${p <= 1 ? 'disabled' : ''}>${ICON.left}Anterior</button>
    <div class="pages">${html}</div>
    <button class="btn sm" data-pg="${p + 1}" ${p >= pages ? 'disabled' : ''}>Siguiente${ICON.right}</button>`;
}

function clientForm(c, isCopy) {
  const isNew = !c || isCopy;
  c = c ? { ...c } : { estatus: 'prospecto', origen: '', servicios: [], saldo: 0 };
  const sel = new Set(c.servicios || []);
  openModal({
    title: isNew ? 'Nuevo cliente' : 'Editar cliente', size: 'wide',
    body: `
      ${!isNew ? `<div class="meta-line">Creado ${fmtDate(c.creado)} · Modificado ${fmtDate(c.modificado)}</div>` : ''}
      <div class="grid2">
        <div class="field"><label>ID del cliente <span class="req">*</span></label><input class="input mono" name="cid" value="${esc(isNew ? nextClientId() : c.id)}" maxlength="30" autocapitalize="characters" spellcheck="false"><small class="meta-line">${isNew ? 'Generado con la fecha de hoy (ddmmaa-##); puedes cambiarlo.' : 'Puedes editarlo; se actualiza en actividades y reportes.'}</small></div>
        <div class="field"><label>Nombre / Proyecto <span class="req">*</span></label><input class="input" name="nombre" value="${esc(c.nombre)}" placeholder="Ej. Residencia Bosques de las Lomas" autofocus></div>
        <div class="field"><label>Estatus</label><select class="input" name="estatus">${ESTATUS.map(s => `<option value="${s.k}" ${c.estatus === s.k ? 'selected' : ''}>${s.l}</option>`).join('')}</select></div>
        <div class="field"><label>Origen</label><select class="input" name="origen"><option value="">Seleccionar…</option>${ORIGENES.map(o => `<option ${c.origen === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>
        <div class="field"><label>Contacto principal</label><input class="input" name="contacto" value="${esc(c.contacto)}" placeholder="Nombre de quien atiende"></div>
        <div class="field"><label>Teléfono</label><input class="input" name="telefono" type="tel" value="${esc(c.telefono)}"></div>
        <div class="field"><label>Correo</label><input class="input" name="email" type="email" value="${esc(c.email)}"></div>
        <div class="field"><label>Saldo pendiente (MXN)</label><input class="input" name="saldo" type="number" min="0" step="0.01" inputmode="decimal" value="${+c.saldo || 0}"></div>
        <div class="field span2"><label>Dirección del proyecto</label><input class="input" name="direccion" value="${esc(c.direccion)}"></div>
        <div class="field span2"><label>Servicios contratados</label><div class="toggle-chips" id="svcChips">${SERVICIOS.map(s => `<button type="button" class="tchip ${sel.has(s) ? 'on' : ''}" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>
        <div class="field span2"><label>Notas</label><textarea class="input" name="notas" placeholder="Preferencias, accesos, horarios, contacto de la administración…">${esc(c.notas)}</textarea></div>
      </div>`,
    foot: `${!isNew ? `<button class="btn danger left" data-del>${ICON.trash}Eliminar</button>` : ''}<button class="btn" data-x>Cancelar</button><button class="btn primary" data-save>${ICON.save}Guardar</button>`,
    onMount(m, close) {
      m.querySelector('#svcChips').onclick = e => { const b = e.target.closest('.tchip'); if (!b) return; b.classList.toggle('on'); sel.has(b.dataset.s) ? sel.delete(b.dataset.s) : sel.add(b.dataset.s); };
      m.querySelector('[data-del]')?.addEventListener('click', async () => { close(); deleteClient(c); });
      m.querySelector('[data-save]').onclick = () => {
        const f = n => m.querySelector(`[name=${n}]`);
        const nombre = f('nombre').value.trim();
        if (!nombre) { f('nombre').classList.add('invalid'); f('nombre').focus(); return; }
        const cid = f('cid').value.trim();
        if (!cid) { f('cid').classList.add('invalid'); f('cid').focus(); toast('El ID no puede quedar vacío', true); return; }
        if (Store.data.clientes.some(x => x.id.toLowerCase() === cid.toLowerCase() && (isNew || x.id !== c.id))) { f('cid').classList.add('invalid'); f('cid').focus(); toast(`El ID ${cid} ya está asignado a otro cliente`, true); return; }
        const now = new Date().toISOString();
        const rec = {
          nombre, estatus: f('estatus').value, origen: f('origen').value, contacto: f('contacto').value.trim(),
          telefono: f('telefono').value.trim(), email: f('email').value.trim(), saldo: Math.max(0, parseFloat(f('saldo').value) || 0),
          direccion: f('direccion').value.trim(), servicios: SERVICIOS.filter(s => sel.has(s)), notas: f('notas').value.trim(), modificado: now
        };
        if (isNew) { Store.data.clientes.unshift({ id: cid, creado: now, ...rec }); toast('Cliente registrado'); }
        else {
          const i = Store.data.clientes.findIndex(x => x.id === c.id);
          Store.data.clientes[i] = { ...Store.data.clientes[i], ...rec, id: cid, demo: false };
          if (cid !== c.id) renameClientRefs(c.id, cid);
          toast('Cambios guardados');
        }
        Store.save('clientes'); close(); refreshClientes();
      };
    }
  });
}
function renameClientRefs(oldId, newId) {
  let b = false, r = false;
  Store.data.board.columns.forEach(col => col.cards.forEach(k => { if (k.clienteId === oldId) { k.clienteId = newId; b = true; } }));
  Store.data.reportes.forEach(x => { if (x.data && x.data.clienteId === oldId) { x.data.clienteId = newId; r = true; } });
  if (CS.sel.delete(oldId)) CS.sel.add(newId);
  if (b) Store.save('board'); if (r) Store.save('reportes');
}
async function deleteClient(c) {
  if (!await confirmDialog('Eliminar cliente', `¿Eliminar <b>${esc(c.nombre)}</b> (${esc(c.id)})? Esta acción no se puede deshacer.`)) return;
  Store.data.clientes = Store.data.clientes.filter(x => x.id !== c.id); CS.sel.delete(c.id);
  Store.save('clientes'); refreshClientes(); toast('Cliente eliminado');
}
async function bulkDelete() {
  const n = CS.sel.size;
  if (!await confirmDialog('Eliminar clientes', `¿Eliminar ${n} cliente${n > 1 ? 's' : ''} seleccionado${n > 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) return;
  Store.data.clientes = Store.data.clientes.filter(x => !CS.sel.has(x.id)); CS.sel.clear();
  Store.save('clientes'); refreshClientes(); toast(`${n} eliminado${n > 1 ? 's' : ''}`);
}
async function clearDemo() {
  if (!await confirmDialog('Limpiar datos de ejemplo', 'Se eliminarán los clientes y actividades de ejemplo. Lo que hayas capturado o editado se conserva.', 'Limpiar')) return;
  Store.data.clientes = Store.data.clientes.filter(c => !c.demo);
  Store.data.board.columns.forEach(col => col.cards = col.cards.filter(k => !k.demo));
  Store.data.proyectos = Store.data.proyectos.filter(p => !p.demo);
  Store.save('clientes'); Store.save('board'); Store.save('proyectos'); isSchema2() ? refreshClientes2() : refreshClientes(); toast('Datos de ejemplo eliminados');
}
function exportClientes() {
  const list = CS.sel.size ? Store.data.clientes.filter(c => CS.sel.has(c.id)) : clientFiltered();
  const head = ['ID', 'Nombre', 'Estatus', 'Creado el', 'Última modificación', 'Origen', 'Servicios contratados', 'Saldo pendiente', 'Contacto', 'Teléfono', 'Correo', 'Dirección', 'Notas'];
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = list.map(c => [c.id, c.nombre, ESTATUS.find(s => s.k === c.estatus)?.l, fmtDate(c.creado), fmtDate(c.modificado), c.origen, (c.servicios || []).join(', '), (+c.saldo || 0).toFixed(2), c.contacto, c.telefono, c.email, c.direccion, c.notas].map(q).join(','));
  download(`clientes_${todayISO()}.csv`, new Blob(['﻿' + [head.map(q).join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  toast(`Exportando ${list.length} cliente${list.length !== 1 ? 's' : ''}`);
}

/* ================= ACTIVIDADES (Kanban) ================= */
const AS = { q: '', resp: '', tipo: '' };
function renderActividades(stage) {
  stage.innerHTML = `
  <section class="panel board-panel" id="actividades">
    <div class="view-head">
      <div><h1>Actividades</h1><p>Visitas técnicas, levantamientos, instalaciones y reuniones del equipo de integraciones.</p></div>
      <div class="actions"><button class="btn" data-act="addcol">${ICON.plus}Columna</button><button class="btn primary" data-act="newcard">${ICON.plus}Nueva actividad</button></div>
    </div>
    <div class="toolbar">
      <div class="search">${ICON.search}<input class="input" id="aSearch" placeholder="Buscar actividad o cliente…" value="${esc(AS.q)}"></div>
      <select class="input" id="aResp" style="width:auto;min-width:160px"><option value="">Todo el equipo</option>${Store.data.config.equipo.map(p => `<option ${AS.resp === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
      <select class="input" id="aTipo" style="width:auto;min-width:170px"><option value="">Todos los tipos</option>${TIPOS.map(t => `<option ${AS.tipo === t.k ? 'selected' : ''}>${esc(t.k)}</option>`).join('')}</select>
    </div>
    <div class="board" id="board"></div>
  </section>`;
  const root = $('#actividades');
  $('#aSearch').addEventListener('input', debounce(e => { AS.q = e.target.value; drawBoard(); }, 150));
  $('#aResp').onchange = e => { AS.resp = e.target.value; drawBoard(); };
  $('#aTipo').onchange = e => { AS.tipo = e.target.value; drawBoard(); };
  root.addEventListener('click', e => {
    if (dragJustEnded) return;
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'addcol') return addColumn();
    if (act === 'newcard') return cardForm(null, Store.data.board.columns[0]?.id);
    const add = e.target.closest('[data-addcard]'); if (add) return cardForm(null, add.dataset.addcard);
    const cm = e.target.closest('[data-colmenu]'); if (cm) return colMenu(cm, cm.dataset.colmenu);
    const ct = e.target.closest('[data-rename]'); if (ct) return renameColumn(ct.dataset.rename);
    const ring = e.target.closest('[data-ring]');
    if (ring) { const id = ring.closest('.kcard').dataset.id, { card: k } = findCard(id); setCardDone(id, !k.done); return; }
    const card = e.target.closest('.kcard'); if (card) { const { col, card: k } = findCard(card.dataset.id); cardForm(k, col.id); }
  });
  initDnD($('#board'));
  drawBoard();
}
function findCard(id) { for (const col of Store.data.board.columns) { const card = col.cards.find(k => k.id === id); if (card) return { col, card }; } return {}; }
function cardVisible(k) {
  if (AS.resp && !(k.responsables || []).includes(AS.resp)) return false;
  if (AS.tipo && k.tipo !== AS.tipo) return false;
  const q = AS.q.trim().toLowerCase();
  if (q && ![k.title, k.clienteTxt, clientName(k.clienteId), k.notas, k.direccion].join(' ').toLowerCase().includes(q)) return false;
  return true;
}
const clientName = id => Store.data.clientes.find(c => c.id === id)?.nombre || '';
function drawBoard() {
  const b = $('#board');
  if (!b) { if (current === 'proyectos' && $('#proyecto, #proyectos')) renderProyectos($('#stage')); return; }
  const sl = b.scrollLeft, today = todayISO();
  b.innerHTML = Store.data.board.columns.map(col => {
    const cards = col.cards.filter(cardVisible);
    const ct = tintStyle(col.color);
    return `<div class="kcol ${ct ? 'tinted' : ''}" data-col="${col.id}" style="${ct}">
      <div class="khead"><h3><span class="t" data-rename="${col.id}" title="Clic para renombrar">${esc(col.name)}</span><span class="badge">${col.cards.length}</span></h3>
        <button class="icon-btn" data-colmenu="${col.id}" aria-label="Opciones de columna">${ICON.more}</button></div>
      <div class="klist">${cards.map(k => {
        const cname = clientName(k.clienteId) || k.clienteTxt;
        const late = !col.done && !k.done && k.fecha && k.fecha < today;
        const kt = tintStyle(k.color);
        const reps = (k.reportIds || []).map(id => Store.data.reportes.find(r => r.id === id)).filter(Boolean);
        const isDone = !!(k.done || col.done);
        return `<article class="kcard ${isDone ? 'done' : ''} ${kt ? 'tinted' : ''}" data-id="${k.id}" style="${kt}">
          <div class="kt"><button class="ring" data-ring aria-label="${isDone ? 'Desmarcar como lista' : 'Marcar como lista'}" title="${isDone ? 'Lista' : 'Marcar como lista'}">${ICON.check}</button><b>${esc(k.title)}</b></div>
          ${cname ? `<div class="kclient">${ICON.building}${esc(cname)}</div>` : ''}
          <div class="kmeta">
            ${k.tipo ? `<span class="ktag"><i style="background:${tipoColor(k.tipo)}"></i>${esc(k.tipo)}</span>` : ''}
            ${k.fecha ? `<span class="ktag ${late ? 'late' : ''}">${ICON.cal}${fmtShort(k.fecha)}${k.hora ? ' · ' + esc(k.hora) : ''}</span>` : ''}
            ${k.proyectoId && projById(k.proyectoId) ? `<span class="ktag proj" title="${esc(projById(k.proyectoId).nombre)}">${ICON.folder}${esc(projById(k.proyectoId).codigo)}</span>` : ''}
            ${reps.length ? `<span class="ktag rep" title="${esc(reps.map(r => r.folio).join(', '))}">${ICON.pdf}${reps.length > 1 ? reps.length + ' reportes' : esc(reps[0].folio || 'Reporte')}</span>` : ''}
            <span class="kpeople">${(k.responsables || []).slice(0, 3).map(p => `<span style="background:${hashColor(p)}" title="${esc(p)}">${esc(initials(p))}</span>`).join('')}</span>
          </div></article>`;
      }).join('')}</div>
      <button class="kadd" data-addcard="${col.id}">${ICON.plus}Nueva actividad</button>
    </div>`;
  }).join('') + `<button class="kcol-add" data-act="addcol">${ICON.plus}Agregar columna</button>`;
  b.scrollLeft = sl;
}

/* Drag & drop con Pointer Events (mouse, touch, pluma) */
let dragJustEnded = false;
function initDnD(board) {
  board.addEventListener('pointerdown', e => {
    const card = e.target.closest('.kcard');
    if (!card || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const sx = e.clientX, sy = e.clientY, touch = e.pointerType !== 'mouse';
    let dragging = false, timer = null, ghost, ph, offX, offY, lx = sx, ly = sy, raf = null;
    const id = card.dataset.id;
    if (touch) timer = setTimeout(() => start(lx, ly), 300);

    function start(x, y) {
      dragging = true;
      const r = card.getBoundingClientRect(); offX = x - r.left; offY = y - r.top;
      ghost = card.cloneNode(true); ghost.classList.add('ghost'); ghost.style.width = r.width + 'px';
      document.body.appendChild(ghost);
      ph = document.createElement('div'); ph.className = 'kph'; ph.style.height = r.height + 'px';
      card.after(ph); card.style.display = 'none'; card.classList.add('dragging');
      document.body.classList.add('dragging');
      try { navigator.vibrate && navigator.vibrate(12); } catch (_) {}
      move(x, y); autoScroll();
    }
    function move(x, y) {
      ghost.style.transform = `translate(${x - offX}px,${y - offY}px) rotate(1.5deg)`;
      const el = document.elementFromPoint(x, y);
      const list = el && el.closest('.kcol')?.querySelector('.klist');
      if (!list) return;
      let before = null;
      for (const c of list.querySelectorAll('.kcard:not(.dragging)')) { const r = c.getBoundingClientRect(); if (y < r.top + r.height / 2) { before = c; break; } }
      if (before) { if (ph.nextSibling !== before) list.insertBefore(ph, before); }
      else if (list.lastElementChild !== ph) list.appendChild(ph);
    }
    function autoScroll() {
      if (!dragging) return;
      const r = board.getBoundingClientRect(), edge = 60;
      if (lx < r.left + edge) board.scrollLeft -= 12; else if (lx > r.right - edge) board.scrollLeft += 12;
      const list = ph.parentElement;
      if (list) { const lr = list.getBoundingClientRect(); if (ly < lr.top + 40) list.scrollTop -= 10; else if (ly > lr.bottom - 40) list.scrollTop += 10; }
      raf = requestAnimationFrame(autoScroll);
    }
    function onMove(ev) {
      lx = ev.clientX; ly = ev.clientY;
      if (!dragging) {
        const dist = Math.hypot(lx - sx, ly - sy);
        if (touch) { if (dist > 8) cleanup(); }
        else if (dist > 5) start(lx, ly);
        return;
      }
      ev.preventDefault(); move(lx, ly);
    }
    function onTouchMove(ev) { if (dragging) ev.preventDefault(); }
    function onUp() {
      if (dragging) {
        const list = ph.parentElement, toColId = list.closest('.kcol').dataset.col;
        // índice real considerando tarjetas ocultas por filtros
        const prevCard = ph.previousElementSibling?.closest('.kcard');
        const { col: from } = findCard(id);
        const k = from.cards.splice(from.cards.findIndex(x => x.id === id), 1)[0];
        const to = Store.data.board.columns.find(c => c.id === toColId);
        let idx = 0;
        if (prevCard) idx = to.cards.findIndex(x => x.id === prevCard.dataset.id) + 1;
        to.cards.splice(idx, 0, k);
        if (from.id !== to.id) { k.demo = false; k.movedAt = new Date().toISOString(); }
        Store.save('board');
        if (to.done && !k.done) setTimeout(() => setCardDone(k.id, true, { noMove: true }), 0);
        dragJustEnded = true; setTimeout(() => dragJustEnded = false, 50);
        if (from.id !== to.id) toast(`Movida a “${to.name}”`);
      }
      cleanup(true);
    }
    function cleanup(redraw) {
      clearTimeout(timer); cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onCancel);
      document.removeEventListener('touchmove', onTouchMove);
      if (dragging) { ghost.remove(); ph.remove(); document.body.classList.remove('dragging'); if (redraw) drawBoard(); else { card.style.display = ''; card.classList.remove('dragging'); } }
      dragging = false;
    }
    function onCancel() { cleanup(false); }
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
  });
  board.addEventListener('contextmenu', e => { if (e.target.closest('.kcard')) e.preventDefault(); });
}

async function addColumn() {
  const name = await promptDialog('Nueva columna', 'Nombre de la columna');
  if (!name) return;
  Store.data.board.columns.push({ id: uid(), name, color: COL_DEFAULTS[Store.data.board.columns.length % COL_DEFAULTS.length], cards: [] });
  Store.save('board'); drawBoard();
  const b = $('#board'); b.scrollTo({ left: b.scrollWidth, behavior: 'smooth' });
}
async function renameColumn(id) {
  const col = Store.data.board.columns.find(c => c.id === id);
  const name = await promptDialog('Renombrar columna', 'Nombre', col.name);
  if (!name) return; col.name = name; Store.save('board'); drawBoard();
}
function colMenu(anchor, id) {
  const cols = Store.data.board.columns, i = cols.findIndex(c => c.id === id), col = cols[i];
  popMenu(anchor, [
    { label: 'Nueva actividad aquí', icon: 'plus', run: () => cardForm(null, id) },
    { label: 'Renombrar', icon: 'edit', run: () => renameColumn(id) },
    { label: 'Color', icon: 'wand', run: () => colorPicker(col) },
    { label: col.done ? 'Desmarcar como “completada”' : 'Marcar como columna de completadas', icon: 'report', run: () => { col.done = !col.done; Store.save('board'); drawBoard(); } },
    '-',
    { label: 'Mover a la izquierda', icon: 'left', disabled: i === 0, run: () => { [cols[i - 1], cols[i]] = [cols[i], cols[i - 1]]; Store.save('board'); drawBoard(); } },
    { label: 'Mover a la derecha', icon: 'right', disabled: i === cols.length - 1, run: () => { [cols[i + 1], cols[i]] = [cols[i], cols[i + 1]]; Store.save('board'); drawBoard(); } },
    '-',
    { label: 'Eliminar columna', icon: 'trash', danger: true, run: () => deleteColumn(id) }
  ]);
}
const swatchesHTML = cur => `<div class="swatches">${PALETTE.map(p => `<button type="button" class="swatch ${p.k === 'none' ? 'none' : ''} ${pal(cur).k === p.k ? 'on' : ''}" data-c="${p.k}" title="${p.l}" style="--pbg:${p.bg || '#fff'};--pbd:${p.bd || '#dfe3ea'};--pdot:${p.dot}"></button>`).join('')}</div>`;
function colorPicker(col) {
  openModal({
    title: 'Color de la columna', size: 'narrow',
    body: `<p class="meta-line">Se aplica a toda la columna.</p>${swatchesHTML(col.color)}`,
    onMount(m, close) { m.querySelector('.swatches').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; col.color = b.dataset.c; Store.save('board'); drawBoard(); close(); }; }
  });
}
async function deleteColumn(id) {
  const cols = Store.data.board.columns;
  if (cols.length <= 1) return toast('Debe existir al menos una columna', true);
  const i = cols.findIndex(c => c.id === id), col = cols[i];
  const target = cols[i === 0 ? 1 : 0];
  const msg = col.cards.length
    ? `La columna <b>${esc(col.name)}</b> tiene ${col.cards.length} actividad${col.cards.length > 1 ? 'es' : ''}. Se moverán a <b>${esc(target.name)}</b>.`
    : `¿Eliminar la columna <b>${esc(col.name)}</b>?`;
  if (!await confirmDialog('Eliminar columna', msg)) return;
  target.cards.push(...col.cards); cols.splice(i, 1); Store.save('board'); drawBoard(); toast('Columna eliminada');
}
function cardForm(k, colId, preset = {}) {
  const isNew = !k;
  k = k ? { ...k, reportIds: [...(k.reportIds || [])] } : { title: '', tipo: 'Visita técnica', clienteId: '', clienteTxt: '', fecha: todayISO(), hora: '', responsables: [], direccion: '', notas: '', color: 'none', reportIds: [] };
  if (!k.id && preset.proyectoId) { k.proyectoId = preset.proyectoId; const pj = Store.data.proyectos.find(x => x.id === preset.proyectoId); if (pj && !k.clienteId) k.clienteId = pj.clienteId || ''; if (pj && !k.direccion) k.direccion = pj.direccion || ''; }
  const proyectos = Store.data.proyectos.filter(x => x.estatus !== 'cerrado' || x.id === k.proyectoId);
  const sysOpts = pid => { const pj = Store.data.proyectos.find(x => x.id === pid); return `<option value="">— General del proyecto —</option>` + ((pj && pj.sistemas) || []).map(s => `<option value="${s.id}" ${k.sistemaId === s.id ? 'selected' : ''}>${esc(s.nombre)}</option>`).join(''); };
  const wasDone = !!k.done;
  if (k.moveTo === undefined) k.moveTo = (Store.data.board.columns.find(c => c.done) || {}).id || '';
  let notify = !!k.notify;
  const notifyUsers = new Set(k.notifyUsers || []);
  let cardId = k.id || null;
  const resp = new Set(k.responsables || []);
  let color = k.color || 'none';
  const cols = Store.data.board.columns;
  const clientes = [...Store.data.clientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const peopleChips = () => Store.data.config.equipo.map(p => `<span class="pchip ${resp.has(p) ? 'on' : ''}"><button type="button" class="pn" data-p="${esc(p)}">${esc(p)}</button><button type="button" class="pm" data-pmenu="${esc(p)}" aria-label="Opciones de ${esc(p)}">${ICON.vdots}</button></span>`).join('') + `<button type="button" class="tchip" data-addp>+ Agregar</button>`;
  const repLinksHTML = () => {
    const linked = k.reportIds.map(id => Store.data.reportes.find(r => r.id === id)).filter(Boolean);
    const avail = Store.data.reportes.filter(r => !k.reportIds.includes(r.id));
    return `<div class="replinks">${linked.map(r => `
      <div class="replink"><span class="ri">${ICON.pdf}</span><span class="rt"><b>${esc(r.folio || 'Sin folio')}</b><small>${fmtDate(r.fecha)} · ${esc(r.asunto || r.tipo)}</small></span>
        ${can('reporte') ? `<button type="button" class="icon-btn" data-ropen="${r.id}" title="Abrir reporte">${ICON.open}</button>
        <button type="button" class="icon-btn" data-rdl="${r.id}" title="Descargar PDF">${ICON.download}</button>` : ''}
        <button type="button" class="icon-btn danger" data-runlink="${r.id}" title="Desvincular">${ICON.unlink}</button></div>`).join('') || '<span class="meta-line">Sin reportes vinculados.</span>'}</div>
      <div class="replink-add">
        <select class="input" id="repSel"><option value="">${avail.length ? 'Vincular reporte existente…' : 'No hay otros reportes guardados'}</option>${avail.map(r => `<option value="${r.id}">${esc(r.folio || 'Sin folio')} · ${fmtDate(r.fecha)} · ${esc(r.codigo || r.asunto || '')}</option>`).join('')}</select>
        ${can('reporte') ? `<button type="button" class="btn" data-newrep>${ICON.plus}Crear reporte</button>` : ''}
      </div>`;
  };
  openModal({
    title: isNew ? 'Nueva actividad' : 'Editar actividad', size: 'wide',
    body: `<div class="grid2">
      <div class="field span2"><label>Título <span class="req">*</span></label><input class="input" name="title" value="${esc(k.title)}" placeholder="Ej. Visita técnica — falla en audio de terraza" autofocus></div>
      <div class="field"><label>Tipo</label><select class="input" name="tipo">${TIPOS.map(t => `<option ${k.tipo === t.k ? 'selected' : ''}>${esc(t.k)}</option>`).join('')}</select></div>
      <div class="field"><label>Columna</label><select class="input" name="col">${cols.map(c => `<option value="${c.id}" ${c.id === colId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Proyecto</label><select class="input" name="proyectoId"><option value="">— Sin proyecto —</option>${proyectos.map(x => `<option value="${x.id}" ${k.proyectoId === x.id ? 'selected' : ''}>${esc(x.codigo)} · ${esc(x.nombre)}</option>`).join('')}</select></div>
      <div class="field"><label>Sistema</label><select class="input" name="sistemaId" ${k.proyectoId ? '' : 'disabled'}>${sysOpts(k.proyectoId)}</select></div>
      <div class="field span2"><label>Cliente</label><select class="input" name="clienteId"><option value="">— Sin cliente registrado —</option>${clientes.map(c => `<option value="${esc(c.id)}" ${k.clienteId === c.id ? 'selected' : ''}>${esc(c.nombre)} · ${esc(c.id)}</option>`).join('')}</select></div>
      <div class="field span2" id="ctxtWrap" ${k.clienteId ? 'hidden' : ''}><label>Cliente / lugar (texto libre)</label><input class="input" name="clienteTxt" value="${esc(k.clienteTxt)}" placeholder="Si aún no está dado de alta"></div>
      <div class="field"><label>Fecha</label><input class="input" type="date" name="fecha" value="${esc(k.fecha)}"></div>
      <div class="field"><label>Hora</label><input class="input" type="time" name="hora" value="${esc(k.hora)}"></div>
      <div class="field span2"><label>Responsables</label><div class="toggle-chips" id="pChips">${peopleChips()}</div></div>
      <div class="field span2"><label>Dirección</label><input class="input" name="direccion" value="${esc(k.direccion)}" placeholder="Calle, número, colonia, referencias de acceso"></div>
      <div class="field span2"><label>Notas</label><textarea class="input" name="notas">${esc(k.notas)}</textarea></div>
      <div class="field span2"><label>Reportes de visita</label><div id="repLinks">${repLinksHTML()}</div></div>
      <div class="field span2"><label>Color de la tarjeta</label><div id="cardSw">${swatchesHTML(color)}</div></div>
      <div class="field span2 done-box">
        <label class="switch"><input type="checkbox" name="done" ${k.done ? 'checked' : ''}><span class="sw"></span><span>Marcar como <b>Lista</b>${k.doneAt ? ` <span class="meta-line">· ${fmtDate(k.doneAt)}</span>` : ''}</span></label>
        <div class="grid2" style="margin-top:12px">
          <div class="field"><label>Al marcar como Lista, mover a</label><select class="input" name="moveTo"><option value="">No mover la tarjeta</option>${cols.map(c => `<option value="${c.id}" ${k.moveTo === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Notificar usuarios</label><div class="seg" id="notifSeg"><button type="button" data-n="0" class="${notify ? '' : 'on'}">No</button><button type="button" data-n="1" class="${notify ? 'on' : ''}">Sí</button></div></div>
          <div class="field span2" id="notifWrap" ${notify ? '' : 'hidden'}><label>¿A quién notificar?</label><div class="userchecks" id="notifUsers"><span class="meta-line">Cargando usuarios…</span></div><small class="meta-line">Recibirán un aviso en la campana cuando la tarea se marque como Lista.</small></div>
        </div>
      </div>
    </div>`,
    foot: `${!isNew ? `<button class="btn danger left" data-del>${ICON.trash}Eliminar</button>` : ''}<button class="btn" data-x>Cancelar</button><button class="btn primary" data-save>${ICON.save}Guardar</button>`,
    onMount(m, close) {
      const f = n => m.querySelector(`[name=${n}]`);
      const redrawPeople = () => { m.querySelector('#pChips').innerHTML = peopleChips(); };
      const redrawReps = () => { m.querySelector('#repLinks').innerHTML = repLinksHTML(); };
      f('clienteId').onchange = e => { m.querySelector('#ctxtWrap').hidden = !!e.target.value; };
      f('proyectoId').onchange = e => {
        const pid = e.target.value; f('sistemaId').innerHTML = sysOpts(pid); f('sistemaId').disabled = !pid;
        const pj = Store.data.proyectos.find(x => x.id === pid);
        if (pj && pj.clienteId && !f('clienteId').value) { f('clienteId').value = pj.clienteId; m.querySelector('#ctxtWrap').hidden = true; }
        if (pj && pj.direccion && !f('direccion').value) f('direccion').value = pj.direccion;
      };
      m.querySelector('#notifSeg').onclick = e => {
        const b = e.target.closest('[data-n]'); if (!b) return;
        notify = b.dataset.n === '1';
        $$('#notifSeg button', m).forEach(x => x.classList.toggle('on', x === b));
        m.querySelector('#notifWrap').hidden = !notify;
      };
      Api.directory().then(list => {
        const box = m.querySelector('#notifUsers'); if (!box) return;
        const users = list.filter(u => u.username !== ME.username && (u.role === 'admin' || (u.modules || []).includes('actividades')));
        box.innerHTML = users.length ? users.map(u => `<label class="ucheck"><input type="checkbox" value="${esc(u.username)}" ${notifyUsers.has(u.username) ? 'checked' : ''}><span class="avatar" style="background:${hashColor(u.username)}">${esc(initials(u.name || u.username))}</span><span><b>${esc(u.name || u.username)}</b><small>@${esc(u.username)}</small></span></label>`).join('')
          : '<span class="meta-line">No hay otros usuarios con acceso a Actividades. Créalos en Usuarios.</span>';
        box.onchange = e => { const c = e.target; if (c.type === 'checkbox') c.checked ? notifyUsers.add(c.value) : notifyUsers.delete(c.value); };
      }).catch(() => { const box = m.querySelector('#notifUsers'); if (box) box.innerHTML = '<span class="meta-line">No se pudo cargar la lista de usuarios.</span>'; });
      m.querySelector('#cardSw').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; color = b.dataset.c; $$('#cardSw .swatch', m).forEach(x => x.classList.toggle('on', x === b)); };

      m.querySelector('#pChips').onclick = async e => {
        const pm = e.target.closest('[data-pmenu]');
        if (pm) {
          const name = pm.dataset.pmenu;
          popMenu(pm, [
            { label: 'Editar', icon: 'edit', run: () => editPerson(name) },
            { label: 'Borrar', icon: 'trash', danger: true, run: () => deletePerson(name) }
          ]);
          return;
        }
        if (e.target.closest('[data-addp]')) {
          const n = await promptDialog('Agregar integrante', 'Nombre');
          if (n && !Store.data.config.equipo.includes(n)) { Store.data.config.equipo.push(n); Store.save('config'); }
          if (n) resp.add(n);
          redrawPeople(); return;
        }
        const b = e.target.closest('[data-p]'); if (!b) return;
        resp.has(b.dataset.p) ? resp.delete(b.dataset.p) : resp.add(b.dataset.p);
        b.parentElement.classList.toggle('on', resp.has(b.dataset.p));
      };
      async function editPerson(name) {
        const n = await promptDialog('Editar integrante', 'Nombre', name);
        if (!n || n === name) return;
        if (Store.data.config.equipo.includes(n)) return toast('Ya existe un integrante con ese nombre', true);
        const eq = Store.data.config.equipo; eq[eq.indexOf(name)] = n;
        Store.data.board.columns.forEach(c => c.cards.forEach(x => { x.responsables = (x.responsables || []).map(r => r === name ? n : r); }));
        if (resp.delete(name)) resp.add(n);
        if (AS.resp === name) AS.resp = n;
        Store.save('config'); Store.save('board'); redrawPeople(); drawBoard(); refreshRespFilter(); toast('Integrante actualizado');
      }
      async function deletePerson(name) {
        const used = Store.data.board.columns.reduce((a, c) => a + c.cards.filter(x => (x.responsables || []).includes(name)).length, 0);
        if (!await confirmDialog('Borrar integrante', `¿Borrar a <b>${esc(name)}</b> del equipo?${used ? ` Se quitará de ${used} actividad${used > 1 ? 'es' : ''}.` : ''}`, 'Borrar')) return;
        Store.data.config.equipo = Store.data.config.equipo.filter(p => p !== name);
        Store.data.board.columns.forEach(c => c.cards.forEach(x => { x.responsables = (x.responsables || []).filter(r => r !== name); }));
        resp.delete(name); if (AS.resp === name) AS.resp = '';
        Store.save('config'); Store.save('board'); redrawPeople(); drawBoard(); refreshRespFilter(); toast('Integrante borrado');
      }

      m.querySelector('#repLinks').addEventListener('change', e => {
        if (e.target.id === 'repSel' && e.target.value) { k.reportIds.push(e.target.value); redrawReps(); }
      });
      m.querySelector('#repLinks').addEventListener('click', e => {
        const o = e.target.closest('[data-ropen]'), dl = e.target.closest('[data-rdl]'), ul = e.target.closest('[data-runlink]');
        if (o) { if (save(true)) { close(); openReport(o.dataset.ropen); } return; }
        if (dl) { downloadReport(dl.dataset.rdl); return; }
        if (ul) { k.reportIds = k.reportIds.filter(x => x !== ul.dataset.runlink); redrawReps(); return; }
        if (e.target.closest('[data-newrep]')) {
          if (!save(true)) return;
          close();
          const { card } = findCard(cardId);
          R = newReport();
          const c = Store.data.clientes.find(x => x.id === card.clienteId);
          R.codigo = (c?.nombre || card.clienteTxt || '').toUpperCase(); R.clienteId = card.clienteId || '';
          R.asunto = card.title; R.descripcion = card.notas || '';
          R.participantes = (card.responsables || []).join(' / ');
          R.cardId = cardId;
          R.tipo = card.tipo === 'Levantamiento' ? 'Reporte de Levantamiento' : card.tipo === 'Mantenimiento' ? 'Reporte de Mantenimiento' : 'Reporte de Visita Técnica';
          saveDraft(); go('reporte');
          toast('Reporte vinculado a la actividad');
        }
      });
      m.querySelector('[data-del]')?.addEventListener('click', async () => {
        if (!await confirmDialog('Eliminar actividad', `¿Eliminar “${esc(k.title)}”?`)) return;
        const { col } = findCard(k.id); col.cards = col.cards.filter(x => x.id !== k.id);
        Store.save('board'); close(); drawBoard(); toast('Actividad eliminada');
      });
      function save(silent) {
        const title = f('title').value.trim();
        if (!title) { f('title').classList.add('invalid'); f('title').focus(); toast('Escribe un título para la actividad', true); return false; }
        if (notify && !notifyUsers.size) { toast('Elige al menos un usuario a notificar o marca “No”', true); m.querySelector('#notifWrap').scrollIntoView({ block: 'center', behavior: 'smooth' }); return false; }
        const rec = { title, tipo: f('tipo').value, clienteId: f('clienteId').value, clienteTxt: f('clienteId').value ? '' : f('clienteTxt').value.trim(), fecha: f('fecha').value, hora: f('hora').value, responsables: [...resp], direccion: f('direccion').value.trim(), notas: f('notas').value.trim(), color, reportIds: [...k.reportIds], proyectoId: f('proyectoId').value, sistemaId: f('proyectoId').value ? f('sistemaId').value : '', moveTo: f('moveTo').value, notify, notifyUsers: notify ? [...notifyUsers] : [], updated: new Date().toISOString() };
        const wantDone = f('done').checked;
        const toCol = cols.find(c => c.id === f('col').value);
        if (!cardId) { cardId = uid(); toCol.cards.push({ id: cardId, created: new Date().toISOString(), ...rec }); if (!silent) toast('Actividad creada'); }
        else {
          const { col } = findCard(cardId); const idx = col.cards.findIndex(x => x.id === cardId);
          const merged = { ...col.cards[idx], ...rec, demo: false };
          if (col.id === toCol.id) col.cards[idx] = merged; else { col.cards.splice(idx, 1); toCol.cards.push(merged); }
          if (!silent) toast('Actividad actualizada');
        }
        if (wantDone !== !!(findCard(cardId).card || {}).done) setCardDone(cardId, wantDone);
        else { Store.save('board'); drawBoard(); }
        return true;
      }
      m.querySelector('[data-save]').onclick = () => { if (save(false)) close(); };
    }
  });
}
/* Marca/desmarca una actividad como Lista: mueve a la columna elegida y notifica */
function setCardDone(id, done, opts = {}) {
  const { col, card } = findCard(id); if (!card) return;
  const was = !!card.done;
  card.done = !!done;
  if (done && !was) {
    card.doneAt = new Date().toISOString(); card.doneBy = ME.username; card.demo = false;
    const pj = card.proyectoId && projById(card.proyectoId);
    if (pj && pj.estatus === 'por_iniciar' && can('proyectos')) { pj.estatus = 'en_curso'; pj.updated = new Date().toISOString(); Store.save('proyectos'); }
    let movedTo = null;
    if (!opts.noMove && card.moveTo && card.moveTo !== col.id) {
      const to = Store.data.board.columns.find(c => c.id === card.moveTo);
      if (to) { col.cards.splice(col.cards.indexOf(card), 1); to.cards.push(card); movedTo = to.name; }
    }
    toast(movedTo ? `Lista ✓ · movida a “${movedTo}”` : 'Actividad marcada como Lista');
    if (card.notify && (card.notifyUsers || []).length) {
      Api.notif.send({ to: card.notifyUsers, title: `Tarea Finalizada - ${card.title}`, body: `${ME.name || ME.username}, ha marcado esta tarea como Lista, haz clic para ver detalles`, link: { type: 'card', id: card.id } })
        .then(r => toast(`Se notificó a ${r.sent} usuario${r.sent === 1 ? '' : 's'}`))
        .catch(() => toast('No se pudo enviar la notificación', true));
    }
  } else if (!done && was) { delete card.doneAt; delete card.doneBy; toast('Actividad desmarcada'); }
  Store.save('board'); drawBoard();
}
function refreshRespFilter() {
  const s = $('#aResp'); if (!s) return;
  s.innerHTML = `<option value="">Todo el equipo</option>${Store.data.config.equipo.map(p => `<option ${AS.resp === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}`;
}

/* ================= REPORTE DE VISITA ================= */
const TIPOS_DOC = ['Reporte de Visita Técnica', 'Informe de Daños en Obra', 'Dictamen Técnico', 'Reporte de Levantamiento', 'Reporte de Mantenimiento'];
const ESTADOS = ['OK', 'FALLA', 'OBSERVACIÓN', 'PENDIENTE', 'N/A'];
function newReport() {
  return {
    tipo: 'Reporte de Visita Técnica', folio: '', fecha: todayISO(), asunto: '', preparado: userName(), codigo: '', clienteId: '',
    participantes: userName(), distribucion: '', descripcion: '', componentes: [],
    concIntro: 'Con base en las pruebas realizadas, se concluye lo siguiente:', conclusiones: [''], recomendacion: '',
    responsable: '', nota: 'Arquitechtura AGIS queda a disposición para generar propuesta de Póliza de Mantenimiento de Sistemas Especiales.',
    prestNombre: userName(), prestCargo: '', prestFecha: todayISO(), prestFirma: '',
    recNombre: '', recCargo: '', recFecha: todayISO(), recFirma: '', savedId: null, cardId: null, fotos: []
  };
}
let R = null;
const userName = () => (ME && (ME.name || ME.username)) || '';
/* Reportes nuevos o borradores: fecha de hoy y "Preparado por" = usuario actual. Migra fotos antiguas a componentes. */
function normalizeReport(r) {
  if (!Array.isArray(r.componentes)) r.componentes = [];
  if (!r.savedId) {
    const t = todayISO();
    r.fecha = t; r.prestFecha = t; if (!r.recFirma) r.recFecha = t;
    r.preparado = userName();
    if (!r.prestNombre) r.prestNombre = userName();
  }
  if (Array.isArray(r.fotos) && r.fotos.length && !r.componentes.some(c => c.foto)) {
    r.fotos.forEach((f, i) => { const c = r.componentes[i]; if (c && f && f.src) { c.conFoto = true; c.foto = { src: f.src, w: f.w, h: f.h }; c.fotoDesc = f.caption || ''; } });
  }
  r.fotos = [];
  delete r._warned;
  return r;
}
function loadDraft() { try { const s = localStorage.getItem('agis-report-draft'); if (s) return normalizeReport({ ...newReport(), ...JSON.parse(s) }); } catch (_) {} return newReport(); }
const saveDraft = debounce(() => { try { localStorage.setItem('agis-report-draft', JSON.stringify(R)); } catch (_) {} }, 400);

function suggestFolio() {
  const stop = ['HOTEL', 'CASA', 'RESIDENCIA', 'DEPTO', 'DEPARTAMENTO', 'TORRE', 'EDIFICIO', 'OFICINA', 'OFICINAS', 'PENTHOUSE', 'EL', 'LA', 'LOS', 'LAS', 'DE', 'DEL'];
  const words = (R.codigo || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const w = words.find(x => !stop.includes(x)) || words[0] || 'AGIS';
  const pre = w.slice(0, 3);
  const ab = R.tipo.normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(x => !['de', 'en', 'la', 'el', 'del'].includes(x.toLowerCase())).map(x => x[0].toUpperCase()).join('');
  const base = `${pre}-${ab}-`;
  const n = Store.data.reportes.filter(r => (r.folio || '').startsWith(base)).length + 1;
  return base + String(n).padStart(3, '0');
}

function renderReporte(stage) {
  if (!R) R = loadDraft();
  const clientes = [...Store.data.clientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
  stage.innerHTML = `
  <section id="reporte" class="rep-layout">
    <div>
      <div class="card">
        <div class="rep-hero">
          <div><img src="${window.AGIS_LOGOS ? AGIS_LOGOS.wordmark : ''}" alt="arquitechtura"></div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
            <div class="field" style="min-width:230px"><label>Tipo de documento</label><select class="input" data-f="tipo">${TIPOS_DOC.map(t => `<option ${R.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
            <div class="field" style="width:190px"><label>Folio</label><div style="display:flex;gap:6px"><input class="input" data-f="folio" placeholder="TRU-IDO-001"><button class="icon-btn" data-act="folio" title="Sugerir folio" style="height:42px;width:42px;border:1px solid var(--line)">${ICON.wand}</button></div></div>
          </div>
        </div>
        <div class="grid2">
          <div class="field"><label>Fecha <span class="req">*</span></label><input class="input" type="date" data-f="fecha"></div>
          <div class="field"><label>Preparado por</label><input class="input" data-f="preparado"></div>
          <div class="field span2"><label>Asunto <span class="req">*</span></label><input class="input" data-f="asunto" placeholder="Ej. Dictamen de daños en sistema de telefonía"></div>
          <div class="field span2"><label>Código (cliente / proyecto) <span class="req">*</span></label><input class="input" data-f="codigo" list="cliList" placeholder="Ej. Hotel TRU Aeropuerto by Hilton"><datalist id="cliList">${[...Store.data.proyectos.map(p => p.nombre), ...clientes.map(c => c.nombre)].map(n => `<option value="${esc(n)}">`).join('')}</datalist></div>
          <div class="field span2"><label>Participantes</label><input class="input" data-f="participantes" placeholder="Nombre (correo) / Nombre (correo)"></div>
          <div class="field span2"><label>Distribución</label><input class="input" data-f="distribucion" placeholder="A quién se envía el documento"></div>
        </div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">01</span><h2>Descripción de la falla</h2></div>
        <textarea class="input" data-f="descripcion" rows="4" placeholder="Motivo de la visita y reporte del cliente…"></textarea>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">02</span><h2>Diagnóstico por componente</h2><button class="btn sm primary" data-act="addcomp">${ICON.plus}Agregar</button></div>
        <div class="comp-list" id="compList"></div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">03</span><h2>Evidencia fotográfica</h2><span class="meta-line">Una foto por componente (opcional)</span></div>
        <div class="fotos" id="fotos"></div>
        <input type="file" id="fotoInput" accept="image/*" hidden>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">04</span><h2>Conclusión y dictamen</h2></div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="field"><label>Introducción</label><input class="input" data-f="concIntro"></div>
          <div class="field"><label>Conclusiones</label><div class="bullets" id="bullets"></div>
            <button class="btn sm ghost" data-act="addbul" style="align-self:flex-start;margin-top:4px">${ICON.plus}Agregar conclusión</button></div>
          <div class="field"><label>Recomendación</label><textarea class="input" data-f="recomendacion" rows="3" placeholder="Se recomienda…"></textarea></div>
        </div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">05</span><h2>Acciones y seguimiento</h2></div>
        <div class="grid2">
          <div class="field span2"><label>Responsable del seguimiento</label><input class="input" data-f="responsable" placeholder="Ej. Equipo de TI del cliente"></div>
          <div class="field span2"><label>Nota de Arquitechtura</label><textarea class="input" data-f="nota" rows="2"></textarea></div>
        </div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">06</span><h2>Firmas de conformidad</h2></div>
        <div class="sig-grid">
          <div class="sig-box">
            <h4>PRESTADOR DE SERVICIO</h4>
            <div class="sig-pad" data-sig="prestFirma"><canvas></canvas><div class="line"></div><div class="ph">Firme aquí</div><button class="icon-btn clr" data-clr="prestFirma" title="Borrar firma">${ICON.reset}</button></div>
            <div class="field"><label>Nombre</label><input class="input" data-f="prestNombre"></div>
            <div class="field"><label>Cargo</label><input class="input" data-f="prestCargo"></div>
            <div class="field"><label>Fecha</label><input class="input" type="date" data-f="prestFecha"></div>
          </div>
          <div class="sig-box">
            <h4>RECIBE CONFORME</h4>
            <div class="sig-pad" data-sig="recFirma"><canvas></canvas><div class="line"></div><div class="ph">Firma del cliente</div><button class="icon-btn clr" data-clr="recFirma" title="Borrar firma">${ICON.reset}</button></div>
            <div class="field"><label>Nombre</label><input class="input" data-f="recNombre" placeholder="Nombre de quien recibe"></div>
            <div class="field"><label>Cargo</label><input class="input" data-f="recCargo" placeholder="Cargo"></div>
            <div class="field"><label>Fecha</label><input class="input" type="date" data-f="recFecha"></div>
          </div>
        </div>
      </div>
    </div>

    <aside class="rep-side">
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><b style="font-size:14px">Avance del reporte</b><span class="meta-line" id="progTxt"></span></div>
        <div class="progress"><i id="progBar"></i></div>
        <ul class="checklist" id="checklist"></ul>
        ${linkedCardChip()}
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">
          <button class="btn primary" data-act="pdf" style="justify-content:center;height:46px">${ICON.pdf}Generar PDF</button>
          <div style="display:flex;gap:8px"><button class="btn" data-act="save" style="flex:1;justify-content:center">${ICON.save}Guardar</button><button class="btn" data-act="new" style="flex:1;justify-content:center">${ICON.reset}Nuevo</button></div>
        </div>
      </div>
      <div class="card recent">
        <b style="font-size:14px;display:block;margin-bottom:8px">Reportes guardados</b>
        <div class="rep-list" id="repList"></div>
      </div>
    </aside>
  </section>`;

  const root = $('#reporte');
  $$('[data-f]', root).forEach(el => { el.value = R[el.dataset.f] ?? ''; });
  root.addEventListener('input', e => {
    const f = e.target.dataset.f;
    if (f) { R[f] = e.target.value; e.target.classList.remove('invalid'); if (f === 'codigo') { const c = Store.data.clientes.find(x => x.nombre === e.target.value); R.clienteId = c?.id || ''; } saveDraft(); updateProgress(); }
    const cfd = e.target.dataset.cfd;
    if (cfd !== undefined && R.componentes[+cfd]) {
      const c = R.componentes[+cfd]; c.fotoDesc = e.target.value; e.target.classList.remove('invalid'); saveDraft(); updateProgress();
      const st = e.target.closest('.cfoto').querySelector('.cf-state'), ok = c.foto && c.fotoDesc.trim();
      st.textContent = c.foto ? (ok ? 'Con foto' : 'Falta descripción') : 'Falta la foto'; st.classList.toggle('warn', !ok);
      if (ok) e.target.closest('.cfoto').classList.remove('invalid');
    }
    const bi = e.target.dataset.bi;
    if (bi !== undefined) { R.conclusiones[+bi] = e.target.value; saveDraft(); updateProgress(); }
  });
  root.addEventListener('change', e => {
    if (e.target.dataset.f === 'tipo') saveDraft();
    const cf = e.target.dataset.cf;
    if (cf !== undefined && R.componentes[+cf]) { R.componentes[+cf].conFoto = e.target.checked; saveDraft(); drawFotos(); updateProgress(); }
  });
  root.addEventListener('click', e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'folio') { R.folio = suggestFolio(); $('[data-f=folio]').value = R.folio; saveDraft(); return; }
    if (a === 'addcomp') return compForm();
    const pick = e.target.closest('[data-cfpick]'); if (pick) { fotoTarget = +pick.dataset.cfpick; $('#fotoInput').click(); return; }
    const cfdel = e.target.closest('[data-cfdel]'); if (cfdel) { const c = R.componentes[+cfdel.dataset.cfdel]; if (c) { delete c.foto; saveDraft(); drawFotos(); updateProgress(); } return; }
    if (a === 'addbul') { R.conclusiones.push(''); drawBullets(); $$('#bullets textarea').pop().focus(); saveDraft(); return; }
    if (a === 'pdf') return generatePDF();
    if (a === 'save') return saveReport(true);
    if (a === 'new') return resetReport();
    const db = e.target.closest('[data-delbul]'); if (db) { R.conclusiones.splice(+db.dataset.delbul, 1); if (!R.conclusiones.length) R.conclusiones.push(''); drawBullets(); saveDraft(); updateProgress(); return; }
    const ce = e.target.closest('[data-cedit]'); if (ce) return compForm(+ce.dataset.cedit);
    const cd = e.target.closest('[data-cdel]'); if (cd) return delComp(+cd.dataset.cdel);
    const cu = e.target.closest('[data-cup]'); if (cu) { const i = +cu.dataset.cup; if (i > 0) { [R.componentes[i - 1], R.componentes[i]] = [R.componentes[i], R.componentes[i - 1]]; drawComps(); saveDraft(); } return; }
    const cl = e.target.closest('[data-clr]'); if (cl) { R[cl.dataset.clr] = ''; pads[cl.dataset.clr]?.clear(); saveDraft(); updateProgress(); return; }
    const ro = e.target.closest('[data-ropen]'); if (ro) return openSaved(ro.dataset.ropen);
    const rm = e.target.closest('[data-rmore]'); if (rm) return savedMenu(rm);
  });
  normalizeReport(R);
  $('#fotoInput').addEventListener('change', async e => {
    const file = e.target.files && e.target.files[0]; e.target.value = '';
    const idx = fotoTarget, comp = R.componentes[idx];
    if (!file || !comp) return;
    $$(`[data-cfpick="${idx}"]`).forEach(b => { b.disabled = true; });
    const slot = $(`.foto-add[data-cfpick="${idx}"] b`); if (slot) slot.textContent = 'Procesando…';
    try {
      const img = await processImage(file);
      const src = await Api.upload(img.data);
      comp.foto = { src, w: img.w, h: img.h }; comp.conFoto = true;
      saveDraft(); toast('Foto agregada a ' + comp.sistema);
    } catch (err) { console.error(err); toast(err.message && err.status ? err.message : 'No se pudo leer la imagen (usa JPG o PNG)', true); }
    drawFotos(); updateProgress();
  });
  drawComps(); drawBullets(); drawSaved(); drawFotos();
  pads = {};
  $$('.sig-pad', root).forEach(el => { pads[el.dataset.sig] = signaturePad(el, el.dataset.sig); });
  updateProgress();
}
let pads = {};
function drawComps() {
  const el = $('#compList'); if (!el) return;
  el.innerHTML = R.componentes.length ? R.componentes.map((c, i) => `
    <div class="comp">
      <b>${esc(c.sistema)}</b>
      <span class="est est-${esc(c.estado)}">${esc(c.estado)}</span>
      <p>${esc(c.observacion) || '<span class="meta-line">Sin observación</span>'}</p>
      <div class="acts">
        <button class="icon-btn" data-cup="${i}" title="Subir" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${ICON.up}</button>
        <button class="icon-btn" data-cedit="${i}" title="Editar">${ICON.edit}</button>
        <button class="icon-btn danger" data-cdel="${i}" title="Eliminar">${ICON.trash}</button>
      </div>
    </div>`).join('')
    : `<div class="empty" style="padding:28px">${ICON.report}<b>Sin componentes</b>Agrega cada sistema o componente revisado con su estado y hallazgo.</div>`;
  drawFotos();
  updateProgress();
}
let fotoTarget = -1;
function drawFotos() {
  const el = $('#fotos'); if (!el) return;
  el.innerHTML = R.componentes.length ? R.componentes.map((c, i) => `
    <div class="cfoto ${c.conFoto ? 'on' : ''}">
      <label class="cf-head">
        <input type="checkbox" data-cf="${i}" ${c.conFoto ? 'checked' : ''}>
        <span class="cf-name"><b>${esc(c.sistema)}</b><span class="est est-${esc(c.estado)}">${esc(c.estado)}</span></span>
        <span class="cf-state ${c.conFoto && (!c.foto || !String(c.fotoDesc || '').trim()) ? 'warn' : ''}">${c.conFoto ? (c.foto ? (String(c.fotoDesc || '').trim() ? 'Con foto' : 'Falta descripción') : 'Falta la foto') : 'Sin foto'}</span>
      </label>
      ${c.conFoto ? `<div class="cf-body">
        ${c.foto ? `<div class="cf-thumb"><img src="${esc(c.foto.src)}" alt="Foto de ${esc(c.sistema)}"></div>`
          : `<button type="button" class="foto-add cf-pick" data-cfpick="${i}">${ICON.camera}<b>Seleccionar foto</b><small>Cámara o galería</small></button>`}
        <div class="cf-fields">
          <div class="field"><label>Descripción de la foto <span class="req">*</span></label><input class="input" data-cfd="${i}" value="${esc(c.fotoDesc || '')}" maxlength="140" placeholder="Qué se observa en la imagen"></div>
          ${c.foto ? `<div class="cf-acts"><button type="button" class="btn sm" data-cfpick="${i}">${ICON.camera}Reemplazar</button><button type="button" class="btn sm danger" data-cfdel="${i}">${ICON.trash}Eliminar foto</button></div>` : ''}
        </div>
      </div>` : ''}
    </div>`).join('')
    : `<div class="empty" style="padding:24px">${ICON.camera}<b>Primero agrega componentes</b>En la sección 02. Después podrás adjuntar una foto por cada componente.</div>`;
}
async function processImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('formato')); i.src = url; });
    const max = 1600, sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * sc), h = Math.round(img.naturalHeight * sc);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
    return { data: cv.toDataURL('image/jpeg', 0.82), w, h };
  } finally { URL.revokeObjectURL(url); }
}
async function srcToDataURL(src) {
  if (!src || src.startsWith('data:')) return src;
  const r = await fetch(src, { credentials: 'same-origin' });
  if (!r.ok) throw new Error('No se pudo cargar una de las fotos');
  const b = await r.blob();
  return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
}
let fontsLoading = null;
function loadPdfFonts() {
  if (window.AGIS_PDF_FONTS) return Promise.resolve();
  if (!fontsLoading) fontsLoading = new Promise(res => {
    const sc = document.createElement('script'); sc.src = 'pdf-fonts.js';
    sc.onload = () => res(); sc.onerror = () => { fontsLoading = null; res(); }; // sin fuente → Helvetica
    document.head.appendChild(sc);
  });
  return fontsLoading;
}
async function makePDF(d) {
  if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('No se pudo cargar el generador de PDF (revisa la conexión)');
  await loadPdfFonts();
  const fotos = await Promise.all((d.fotos || []).map(async f => ({ ...f, src: await srcToDataURL(f.src) })));
  return buildReportPDF({ ...d, fotos }, { jsPDF: window.jspdf.jsPDF, logos: window.AGIS_LOGOS, fonts: window.AGIS_PDF_FONTS });
}
function drawBullets() {
  $('#bullets').innerHTML = R.conclusiones.map((t, i) => `
    <div class="bullet-row"><span class="tri"></span><textarea class="input" rows="1" data-bi="${i}" placeholder="Conclusión ${i + 1}">${esc(t)}</textarea>
    <button class="icon-btn danger" data-delbul="${i}" title="Quitar" style="margin-top:4px">${ICON.x}</button></div>`).join('');
}
function compForm(i) {
  const isNew = i === undefined;
  const c = isNew ? { sistema: '', estado: 'OK', observacion: '' } : R.componentes[i];
  const sugeridos = ['Central telefónica IP', 'Cableado de entrada', 'Cableado de salida', 'Switch PoE', 'Router / Firewall', 'NVR / DVR', 'Cámaras CCTV', 'Panel de alarma', 'Control de acceso', 'Procesador de control', 'Amplificador', 'Bocinas', 'Proyector / Pantalla', 'Access Point WiFi', 'Configuración de parámetros de comunicación', 'Alimentación eléctrica / UPS'];
  openModal({
    title: isNew ? 'Agregar componente' : 'Editar componente',
    body: `
      <div class="field"><label>Sistema / componente <span class="req">*</span></label><input class="input" name="sistema" list="compSug" value="${esc(c.sistema)}" autofocus><datalist id="compSug">${sugeridos.map(s => `<option value="${esc(s)}">`).join('')}</datalist></div>
      <div class="field"><label>Estado</label><div class="toggle-chips" id="estChips">${ESTADOS.map(s => `<button type="button" class="tchip ${c.estado === s ? 'on' : ''}" data-e="${s}">${s}</button>`).join('')}</div></div>
      <div class="field"><label>Observación / hallazgo</label><textarea class="input" name="observacion" rows="4">${esc(c.observacion)}</textarea></div>`,
    foot: `<button class="btn" data-x>Cancelar</button><button class="btn primary" data-save>${isNew ? 'Agregar' : 'Guardar'}</button>`,
    onMount(m, close) {
      let estado = c.estado;
      m.querySelector('#estChips').onclick = e => { const b = e.target.closest('.tchip'); if (!b) return; estado = b.dataset.e; $$('.tchip', m).forEach(x => x.classList.toggle('on', x === b)); };
      m.querySelector('[data-save]').onclick = () => {
        const s = m.querySelector('[name=sistema]');
        if (!s.value.trim()) { s.classList.add('invalid'); s.focus(); return; }
        const rec = { sistema: s.value.trim(), estado, observacion: m.querySelector('[name=observacion]').value.trim() };
        if (isNew) R.componentes.push(rec); else R.componentes[i] = { ...R.componentes[i], ...rec };
        drawComps(); saveDraft(); close();
      };
    }
  });
}
async function delComp(i) {
  if (!await confirmDialog('Eliminar componente', `¿Quitar <b>${esc(R.componentes[i].sistema)}</b> del diagnóstico?`)) return;
  R.componentes.splice(i, 1); drawComps(); saveDraft();
}
function signaturePad(wrap, key) {
  const cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d');
  let drawing = false, last = null, dirty = !!R[key];
  function size() {
    const r = wrap.getBoundingClientRect(), dpr = Math.max(1, window.devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#14213d';
    if (R[key]) { const img = new Image(); img.onload = () => { const s = Math.min(r.width / img.width, r.height / img.height); const w = img.width * s, h = img.height * s; ctx.drawImage(img, (r.width - w) / 2, (r.height - h) / 2, w, h); }; img.src = R[key]; }
    wrap.classList.toggle('has', !!R[key]);
  }
  const pt = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, p: e.pressure && e.pointerType === 'pen' ? e.pressure : 0.5 }; };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); drawing = true; last = pt(e); wrap.classList.add('has'); ctx.beginPath(); ctx.arc(last.x, last.y, 1.1, 0, Math.PI * 2); ctx.fillStyle = '#14213d'; ctx.fill(); });
  cv.addEventListener('pointermove', e => {
    if (!drawing) return; e.preventDefault();
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
      const p = pt(ev), dist = Math.hypot(p.x - last.x, p.y - last.y);
      ctx.lineWidth = Math.max(1.4, Math.min(3.2, 3.4 - dist * 0.06)) * (0.7 + p.p * 0.6);
      ctx.beginPath(); ctx.moveTo(last.x, last.y);
      const mx = (last.x + p.x) / 2, my = (last.y + p.y) / 2;
      ctx.quadraticCurveTo(last.x, last.y, mx, my); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
    }
    dirty = true;
  });
  const end = () => { if (!drawing) return; drawing = false; if (dirty) { R[key] = trimmedPNG(cv); saveDraft(); updateProgress(); } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end); cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') end(); });
  size();
  let rw = wrap.getBoundingClientRect().width;
  new ResizeObserver(() => { const w = wrap.getBoundingClientRect().width; if (Math.abs(w - rw) > 2) { rw = w; size(); } }).observe(wrap);
  return { clear() { ctx.clearRect(0, 0, cv.width, cv.height); wrap.classList.remove('has'); dirty = false; } };
}
/* Recorta márgenes vacíos y exporta en proporción 60x22 (la caja del PDF) */
function trimmedPNG(cv) {
  const w = cv.width, h = cv.height, data = cv.getContext('2d').getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 <= x0) return '';
  const pd = 12; x0 = Math.max(0, x0 - pd); y0 = Math.max(0, y0 - pd); x1 = Math.min(w, x1 + pd); y1 = Math.min(h, y1 + pd);
  const sw = x1 - x0, sh = y1 - y0, ratio = 60 / 22;
  let ow = sw, oh = sh; if (sw / sh > ratio) oh = sw / ratio; else ow = sh * ratio;
  const out = document.createElement('canvas'); out.width = Math.round(ow); out.height = Math.round(oh);
  out.getContext('2d').drawImage(cv, x0, y0, sw, sh, (ow - sw) / 2, (oh - sh) / 2, sw, sh);
  return out.toDataURL('image/png');
}
function reportChecks() {
  const fotosOk = R.componentes.length > 0 && R.componentes.every(c => !c.conFoto || (c.foto && String(c.fotoDesc || '').trim()));
  return [
    ['Datos generales', !!(R.fecha && String(R.asunto || '').trim() && String(R.codigo || '').trim() && String(R.preparado || '').trim())],
    ['Descripción de la falla', !!String(R.descripcion || '').trim()],
    ['Diagnóstico por componente', R.componentes.length > 0],
    ['Evidencia fotográfica', fotosOk],
    ['Conclusiones', R.conclusiones.some(s => s.trim())],
    ['Seguimiento', !!String(R.responsable || '').trim()],
    ['Firma del prestador', !!R.prestFirma && !!String(R.prestNombre || '').trim()],
    ['Firma de quien recibe', !!R.recFirma && !!String(R.recNombre || '').trim()]
  ];
}
function updateProgress() {
  if (!$('#checklist')) return;
  const ch = reportChecks(), ok = ch.filter(c => c[1]).length;
  $('#progBar').style.width = Math.round(ok / ch.length * 100) + '%';
  $('#progTxt').textContent = `${ok}/${ch.length}`;
  $('#checklist').innerHTML = ch.map(([l, v]) => `<li class="${v ? 'ok' : ''}">${l}</li>`).join('');
}
/* Validación estricta: sin todos los apartados no se guarda ni se genera (no hay forma de saltarla) */
function validateReport() {
  const miss = [];
  const mark = sel => { const el = $(sel); if (el) el.classList.add('invalid'); return el; };
  let first = null;
  const need = (cond, label, sel) => { if (!cond) { miss.push(label); const el = sel ? mark(sel) : null; first = first || el; } };
  need(R.fecha, 'Fecha', '[data-f=fecha]');
  need(String(R.preparado || '').trim(), 'Preparado por', '[data-f=preparado]');
  need(String(R.asunto || '').trim(), 'Asunto', '[data-f=asunto]');
  need(String(R.codigo || '').trim(), 'Código (cliente / proyecto)', '[data-f=codigo]');
  need(String(R.descripcion || '').trim(), '01 · Descripción de la falla', '[data-f=descripcion]');
  need(R.componentes.length, '02 · Al menos un componente en el diagnóstico', '#compList');
  R.componentes.forEach((c, i) => {
    if (!c.conFoto) return;
    if (!c.foto) need(false, `03 · Foto de “${c.sistema}”`, `.cfoto:nth-child(${i + 1})`);
    else if (!String(c.fotoDesc || '').trim()) need(false, `03 · Descripción de la foto de “${c.sistema}”`, `[data-cfd="${i}"]`);
  });
  need(R.conclusiones.some(x => x.trim()), '04 · Al menos una conclusión', '#bullets textarea');
  need(String(R.responsable || '').trim(), '05 · Responsable del seguimiento', '[data-f=responsable]');
  need(R.prestFirma, '06 · Firma del prestador de servicio', '[data-sig=prestFirma]');
  need(String(R.prestNombre || '').trim(), '06 · Nombre del prestador', '[data-f=prestNombre]');
  need(R.recFirma, '06 · Firma de quien recibe', '[data-sig=recFirma]');
  need(String(R.recNombre || '').trim(), '06 · Nombre de quien recibe', '[data-f=recNombre]');
  if (!miss.length) return true;
  if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (first.focus && /INPUT|TEXTAREA/.test(first.tagName)) setTimeout(() => first.focus({ preventScroll: true }), 300); }
  openModal({
    title: 'Faltan datos en el reporte', size: 'narrow',
    body: `<p>Para guardar o generar el PDF completa:</p><ul class="miss-list">${miss.map(m => `<li>${esc(m)}</li>`).join('')}</ul>`,
    foot: `<button class="btn primary" data-x>Entendido</button>`
  });
  return false;
}
let repBusy = false;
function saveReport(notify) {
  if (notify) { if (repBusy) return; if (!validateReport()) return; }
  if (!R.folio) { R.folio = suggestFolio(); const el = $('[data-f=folio]'); if (el) el.value = R.folio; }
  const rec = { id: R.savedId || uid(), folio: R.folio, tipo: R.tipo, fecha: R.fecha, codigo: R.codigo, asunto: R.asunto, updated: new Date().toISOString(), data: { ...R } };
  R.savedId = rec.id; rec.data.savedId = rec.id;
  const i = Store.data.reportes.findIndex(r => r.id === rec.id);
  if (i >= 0) Store.data.reportes[i] = rec; else Store.data.reportes.unshift(rec);
  Store.data.reportes = Store.data.reportes.slice(0, 200);
  Store.save('reportes'); saveDraft(); drawSaved();
  if (R.cardId) {
    const { card } = findCard(R.cardId);
    if (card) { card.reportIds = card.reportIds || []; if (!card.reportIds.includes(rec.id)) { card.reportIds.push(rec.id); Store.save('board'); } }
  }
  if (notify) toast('Reporte guardado');
}
async function generatePDF() {
  if (repBusy) return;
  if (!validateReport()) return;
  repBusy = true;
  const btn = $('[data-act=pdf]'); if (btn) { btn.disabled = true; btn.lastChild.textContent = 'Generando…'; }
  saveReport(false);
  try {
    const doc = await makePDF(R);
    const name = `${(R.folio || 'Reporte').replace(/[^\w\-]+/g, '_')}.pdf`;
    doc.save(name);
    toast('PDF generado: ' + name);
  } catch (err) { console.error(err); toast(err.message || 'Error al generar el PDF', true); }
  finally { repBusy = false; if (btn) { btn.disabled = false; btn.lastChild.textContent = 'Generar PDF'; } }
}
async function resetReport() {
  if (!await confirmDialog('Nuevo reporte', 'Se limpiará el formulario actual. Si no lo guardaste, se perderá.', 'Limpiar', false)) return;
  R = newReport(); saveDraft(); renderReporte($('#stage'));
}
function drawSaved() {
  const el = $('#repList'); if (!el) return;
  el.innerHTML = Store.data.reportes.length ? Store.data.reportes.map(r => `
    <div class="rep-item">
      <span class="est est-OK" style="background:var(--accent-soft);color:var(--accent)">${ICON.pdf.replace('width="20" height="20"', 'width="15" height="15"')}</span>
      <div class="info" data-ropen="${r.id}" style="cursor:pointer"><b>${esc(r.folio || 'Sin folio')}</b><small>${fmtDate(r.fecha)} · ${esc(r.codigo || r.asunto || '')}</small></div>
      <button class="icon-btn" data-rmore="${r.id}">${ICON.more}</button>
    </div>`).join('') : `<div class="meta-line" style="padding:8px">Aún no hay reportes guardados.</div>`;
}
function openSaved(id) { openReport(id); }
function openReport(id) {
  const r = Store.data.reportes.find(x => x.id === id); if (!r) return toast('El reporte ya no existe', true);
  R = normalizeReport({ ...newReport(), ...r.data, savedId: r.id }); saveDraft();
  if (current === 'reporte') renderReporte($('#stage')); else go('reporte');
  toast('Reporte abierto: ' + (r.folio || ''));
}
async function downloadReport(id) {
  const r = Store.data.reportes.find(x => x.id === id); if (!r || !r.data) return;
  try { (await makePDF(r.data)).save(`${(r.folio || 'Reporte').replace(/[^\w\-]+/g, '_')}.pdf`); toast('Descargando ' + (r.folio || 'reporte')); }
  catch (e) { console.error(e); toast(e.message || 'Error al generar el PDF', true); }
}
function linkedCardChip() {
  if (!R.cardId) return '';
  const { card, col } = findCard(R.cardId);
  if (!card) return '';
  return `<div class="linked-chip">${ICON.link}<span>Vinculado a la actividad <b>${esc(card.title)}</b> · ${esc(col.name)}</span></div>`;
}
function savedMenu(btn) {
  const id = btn.dataset.rmore, r = Store.data.reportes.find(x => x.id === id);
  popMenu(btn, [
    { label: 'Abrir / editar', icon: 'open', run: () => openSaved(id) },
    { label: 'Descargar PDF', icon: 'download', run: () => downloadReport(id) },
    { label: 'Duplicar como nuevo', icon: 'copy', run: () => { R = normalizeReport({ ...newReport(), ...r.data, savedId: null, cardId: null, fotos: [], folio: '', prestFirma: '', recFirma: '', recNombre: '', recCargo: '', componentes: (r.data.componentes || []).map(c => ({ sistema: c.sistema, estado: c.estado, observacion: c.observacion })) }); saveDraft(); renderReporte($('#stage')); } },
    '-',
    { label: 'Eliminar', icon: 'trash', danger: true, run: async () => { if (!await confirmDialog('Eliminar reporte', `¿Eliminar el reporte <b>${esc(r.folio)}</b>?`)) return; Store.data.reportes = Store.data.reportes.filter(x => x.id !== id); if (R.savedId === id) R.savedId = null; Store.data.board.columns.forEach(c => c.cards.forEach(k => { if (k.reportIds) k.reportIds = k.reportIds.filter(x => x !== id); })); Store.save('reportes'); Store.save('board'); drawSaved(); } }
  ]);
}

/* ================= PROYECTOS ================= */
const PEST = [
  { k: 'prospecto', l: 'Prospecto', c: '#64748b' },
  { k: 'por_iniciar', l: 'Por iniciar', c: '#94a3b8' },
  { k: 'en_curso', l: 'En curso', c: '#2563eb' },
  { k: 'pausado', l: 'Pausado', c: '#b7791f' },
  { k: 'adicionales', l: 'Con adicionales', c: '#a68452' },
  { k: 'cerrado', l: 'Cerrado', c: '#15803d' }
];
const PS = { view: 'list', id: null, tab: 'activos', q: '' };
const projById = id => Store.data.proyectos.find(x => x.id === id);
const pestOf = k => PEST.find(x => x.k === k) || PEST[0];
const daysBetween = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
function projCards(pid, sid) {
  const out = [];
  Store.data.board.columns.forEach(col => col.cards.forEach(k => {
    if (k.proyectoId === pid && (sid === undefined || (k.sistemaId || '') === sid)) out.push({ col, card: k, done: !!(k.done || col.done) });
  }));
  return out;
}
function progressOf(cards, manual) {
  const total = cards.length, done = cards.filter(x => x.done).length, calc = total ? Math.round(done / total * 100) : 0;
  const isManual = manual !== null && manual !== undefined && manual !== '';
  return { calc, done, total, manual: isManual, value: isManual ? Math.max(0, Math.min(100, +manual)) : calc };
}
const projProgress = p => progressOf(projCards(p.id), p.avanceManual);
const sysProgress = (p, s) => progressOf(projCards(p.id, s.id), s.avanceManual);
function projReports(p) {
  const ids = new Set();
  projCards(p.id).forEach(x => (x.card.reportIds || []).forEach(id => ids.add(id)));
  Store.data.reportes.forEach(r => { if (r.data && r.data.proyectoId === p.id) ids.add(r.id); });
  return [...ids].map(id => Store.data.reportes.find(r => r.id === id)).filter(Boolean);
}
function projIncidents(p) {
  const out = [];
  projReports(p).forEach(r => ((r.data && r.data.componentes) || []).forEach((c, i) => {
    if (String(c.estado).toUpperCase() === 'FALLA') { const key = `${r.id}:${i}`; out.push({ key, folio: r.folio, fecha: r.fecha, sistema: c.sistema, obs: c.observacion, resuelta: (p.resueltas || []).includes(key) }); }
  }));
  return out;
}
const projBudgets = p => (p.presupuestoIds || []).map(id => Store.data.presupuestos.find(b => b.id === id)).filter(Boolean);
/* Semáforo: rojo atrasado · ámbar riesgo · verde en tiempo · gris sin iniciar/pausado */
function projHealth(p) {
  if (p.estatus === 'cerrado') return { k: 'ok', l: 'Cerrado' };
  if (p.estatus === 'por_iniciar') return { k: 'idle', l: 'Por iniciar' };
  if (p.estatus === 'prospecto') return { k: 'idle', l: 'Prospecto' };
  if (p.estatus === 'pausado') return { k: 'idle', l: 'Pausado' };
  const pr = projProgress(p).value, t = todayISO();
  if (p.fechaFin && t > p.fechaFin && pr < 100) return { k: 'bad', l: `Atrasado ${daysBetween(p.fechaFin, t)} día${daysBetween(p.fechaFin, t) === 1 ? '' : 's'}` };
  const open = projIncidents(p).filter(x => !x.resuelta).length;
  if (p.fechaInicio && p.fechaFin && t >= p.fechaInicio) {
    const exp = Math.min(100, daysBetween(p.fechaInicio, t) / Math.max(1, daysBetween(p.fechaInicio, p.fechaFin)) * 100);
    if (exp - pr > 20) return { k: 'warn', l: `Avance bajo (esperado ${Math.round(exp)}%)` };
  }
  if (open) return { k: 'warn', l: `${open} incidencia${open > 1 ? 's' : ''} abierta${open > 1 ? 's' : ''}` };
  return { k: 'ok', l: 'En tiempo' };
}
const deviation = p => (p.fechaFin && p.fechaFinBase ? daysBetween(p.fechaFinBase, p.fechaFin) : 0);
function nextProjectCode() {
  const d = new Date(), pre = `PRY-${pad(d.getDate())}${pad(d.getMonth() + 1)}${String(d.getFullYear()).slice(-2)}`;
  const max = Store.data.proyectos.filter(x => (x.codigo || '').startsWith(pre + '-')).reduce((a, x) => Math.max(a, parseInt(x.codigo.split('-').pop(), 10) || 0), 0);
  return `${pre}-${pad(max + 1)}`;
}
const donut = (v, size = 92, color = 'var(--navy)') => `<div class="donut" style="--v:${v};--sz:${size}px;--dc:${color}"><span>${v}%</span></div>`;
const bar = (v, color) => `<div class="pbar"><i style="width:${v}%;${color ? 'background:' + color : ''}"></i></div>`;

function renderProyectos(stage) {
  if (PS.view === 'detail' && projById(PS.id)) return renderProjectDetail(stage, projById(PS.id));
  PS.view = 'list';
  const canEdit = can('proyectos');
  stage.innerHTML = `
  <section class="panel" id="proyectos">
    <div class="view-head">
      <div><h1>Proyectos</h1><p>Avance por actividades, fechas comprometidas, incidencias y presupuestos de cada obra.</p></div>
      <div class="actions">${canEdit ? `${can('presupuesto') || Store.data.presupuestos.length ? `<button class="btn" data-act="pfrombud">${ICON.cash}Desde presupuesto</button>` : ''}<button class="btn primary" data-act="pnew">${ICON.plus}Nuevo proyecto</button>` : ''}</div>
    </div>
    <div class="tabs" id="pTabs"></div>
    <div class="toolbar"><div class="search">${ICON.search}<input class="input" id="pSearch" placeholder="Buscar proyecto, cliente u obra…" value="${esc(PS.q)}"></div></div>
    <div class="pgrid" id="pGrid"></div>
  </section>`;
  const root = $('#proyectos');
  $('#pSearch').addEventListener('input', debounce(e => { PS.q = e.target.value; drawProjects(); }, 150));
  root.addEventListener('click', e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'pnew') return projectForm();
    if (a === 'pfrombud') return pickBudgetForProject();
    const t = e.target.closest('[data-ptab]'); if (t) { PS.tab = t.dataset.ptab; drawProjects(); return; }
    const c = e.target.closest('[data-pid]'); if (c) openProject(c.dataset.pid);
  });
  drawProjects();
}
function drawProjects() {
  const all = Store.data.proyectos;
  const q = PS.q.trim().toLowerCase();
  const tabs = [{ k: 'activos', l: 'Activos', f: p => p.estatus !== 'cerrado' }, { k: 'todos', l: 'Todos', f: () => true }, ...PEST.map(s => ({ k: s.k, l: s.l, f: p => p.estatus === s.k }))];
  $('#pTabs').innerHTML = tabs.map(t => `<button class="tab ${PS.tab === t.k ? 'on' : ''}" data-ptab="${t.k}">${t.l} <span class="badge">${pad(all.filter(t.f).length)}</span></button>`).join('');
  const tf = (tabs.find(t => t.k === PS.tab) || tabs[0]).f;
  const list = all.filter(tf).filter(p => !q || [p.nombre, p.codigo, p.clienteNombre, p.obra].join(' ').toLowerCase().includes(q))
    .sort((a, b) => String(a.fechaFin || '9999').localeCompare(String(b.fechaFin || '9999')));
  $('#pGrid').innerHTML = list.length ? list.map(p => {
    const pr = projProgress(p), h = projHealth(p), st = pestOf(p.estatus), dev = deviation(p), inc = projIncidents(p).filter(x => !x.resuelta).length;
    return `<article class="pcard" data-pid="${p.id}">
      <div class="pc-top"><span class="pstat" style="--sc:${st.c}">${esc(st.l)}</span><span class="health h-${h.k}" title="${esc(h.l)}"><i></i>${esc(h.l)}</span></div>
      <h3>${esc(p.nombre)}</h3>
      <p class="pc-sub">${esc(p.codigo)} · ${esc(p.clienteNombre || 'Sin cliente')}</p>
      <div class="pc-prog"><div class="pc-prog-h"><span>Avance${pr.manual ? ' <em>manual</em>' : ''}</span><b>${pr.value}%</b></div>${bar(pr.value, st.c)}<small>${pr.done}/${pr.total} actividades</small></div>
      <div class="pc-dates"><span>${ICON.cal}${p.fechaInicio ? fmtShort(p.fechaInicio) : '—'} → ${p.fechaFin ? fmtShort(p.fechaFin) : '—'}</span>${dev ? `<span class="dev ${dev > 0 ? 'late' : ''}" title="Contra la fecha original ${fmtDate(p.fechaFinBase)}">${dev > 0 ? '+' : ''}${dev} d</span>` : ''}${inc ? `<span class="dev late">${inc} incid.</span>` : ''}${+p.saldo > 0 ? `<span class="dev">Saldo ${MXN.format(p.saldo).replace(/\.\d+$/, '')}</span>` : ''}</div>
    </article>`;
  }).join('') : `<div class="empty" style="grid-column:1/-1">${ICON.folder}<b>Sin proyectos</b>${all.length ? 'Nada coincide con el filtro.' : 'Crea el primero o conviértelo desde un presupuesto aprobado.'}</div>`;
}
function openProject(id) {
  if (!projById(id)) return toast('El proyecto ya no existe', true);
  PS.view = 'detail'; PS.id = id;
  if (current === 'proyectos') renderProyectos($('#stage')); else go('proyectos');
  window.scrollTo({ top: 0 });
}
function renderProjectDetail(stage, p) {
  const canEdit = can('proyectos'), pr = projProgress(p), h = projHealth(p), st = pestOf(p.estatus), dev = deviation(p);
  const cards = projCards(p.id).sort((a, b) => String(a.card.fecha || '').localeCompare(String(b.card.fecha || '')));
  const incs = projIncidents(p), reps = projReports(p), buds = projBudgets(p);
  const budTotal = buds.reduce((a, b) => a + (+b.total || 0), 0);
  stage.innerHTML = `
  <section id="proyecto" class="pdetail">
    <div class="pd-head card">
      <button class="btn sm ghost" data-act="pback">${ICON.left}Proyectos</button>
      <div class="pd-title">
        <div><span class="pstat" style="--sc:${st.c}">${esc(st.l)}</span> <span class="health h-${h.k}"><i></i>${esc(h.l)}</span></div>
        <h1>${esc(p.nombre)}</h1>
        <p>${esc(p.codigo)} · ${esc(p.clienteNombre || 'Sin cliente')}${p.obra ? ' · ' + esc(p.obra) : ''}${p.direccion ? ' · ' + esc(p.direccion) : ''}</p>
      </div>
      ${canEdit ? `<div class="actions"><button class="btn" data-act="pedit">${ICON.edit}Editar</button><button class="icon-btn" data-act="pmore" aria-label="Más opciones">${ICON.more}</button></div>` : ''}
    </div>
    <div class="pd-grid">
      <div class="pd-col">
        <div class="card">
          <div class="card-h"><h2>Avance general</h2>${pr.manual ? '<span class="tagm">Manual</span>' : '<span class="tagc">Calculado</span>'}</div>
          <div class="pd-prog">
            ${donut(pr.value, 110, st.c)}
            <div class="pd-prog-info">
              <p><b>Calculado por actividades:</b> ${pr.calc}% <span class="meta-line">(${pr.done} de ${pr.total} terminadas)</span></p>
              ${canEdit ? `<div class="ovr"><input class="input" type="number" min="0" max="100" id="ovrVal" value="${pr.manual ? pr.value : ''}" placeholder="%"><button class="btn sm" data-act="ovrset">Fijar manual</button>${pr.manual ? `<button class="btn sm ghost" data-act="ovrreset">${ICON.reset}Restablecer a calculado</button>` : ''}</div>` : ''}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-h"><h2>Sistemas</h2>${canEdit ? `<button class="btn sm" data-act="sysadd">${ICON.plus}Sistema</button>` : ''}</div>
          <div class="syslist">${(p.sistemas || []).length ? p.sistemas.map(s => { const sp = sysProgress(p, s); return `
            <div class="sysrow"><div class="sys-h"><b>${esc(s.nombre)}</b><span>${sp.value}%${sp.manual ? ' <em>manual</em>' : ''}</span>${canEdit ? `<button class="icon-btn" data-sysmenu="${s.id}" aria-label="Opciones">${ICON.more}</button>` : ''}</div>${bar(sp.value)}<small>${sp.done}/${sp.total} actividades</small></div>`; }).join('') : '<p class="meta-line">Agrega los sistemas del proyecto (CCTV, Audio, Redes…) para ver el avance de cada uno.</p>'}</div>
        </div>
        <div class="card">
          <div class="card-h"><h2>Actividades</h2>${can('actividades') ? `<button class="btn sm primary" data-act="pcard">${ICON.plus}Nueva actividad</button>` : ''}</div>
          <div class="pacts">${cards.length ? cards.map(x => `
            <div class="pact ${x.done ? 'done' : ''}" data-card="${x.card.id}">
              <span class="ring-s">${x.done ? ICON.check : ''}</span>
              <div class="pact-t"><b>${esc(x.card.title)}</b><small>${esc(x.col.name)}${x.card.sistemaId ? ' · ' + esc(((p.sistemas || []).find(s => s.id === x.card.sistemaId) || {}).nombre || '') : ''}${(x.card.responsables || []).length ? ' · ' + esc(x.card.responsables.join(', ')) : ''}</small></div>
              <span class="pact-d ${!x.done && x.card.fecha && x.card.fecha < todayISO() ? 'late' : ''}">${x.card.fecha ? fmtShort(x.card.fecha) : ''}</span>
            </div>`).join('') : '<p class="meta-line">Sin actividades ligadas. Al crear una actividad, elige este proyecto.</p>'}</div>
        </div>
      </div>
      <div class="pd-col">
        <div class="card">
          <div class="card-h"><h2>Fechas</h2></div>
          <div class="kv">
            <div><span>Inicio</span><b>${p.fechaInicio ? fmtLong(p.fechaInicio) : '—'}</b></div>
            <div><span>Fin comprometido actual</span><b>${p.fechaFin ? fmtLong(p.fechaFin) : '—'}</b></div>
            <div><span>Fin original (referencia)</span><b>${p.fechaFinBase ? fmtLong(p.fechaFinBase) : '—'}</b></div>
            <div><span>Desviación</span><b class="${dev > 0 ? 'late' : ''}">${dev ? (dev > 0 ? '+' : '') + dev + ' días' : 'Sin cambios'}</b></div>
          </div>
          ${(p.reprogramaciones || []).length ? `<div class="reprog"><small>Historial de cambios de fecha</small>${p.reprogramaciones.slice().reverse().map(r => `<div><b>${fmtDate(r.de)} → ${fmtDate(r.a)}</b><span class="orig o-${r.origen === 'Cliente' ? 'c' : 'i'}">${esc(r.origen)}</span><p>${esc(r.motivo)}</p><em>${esc(r.byName || r.by)} · ${fmtDate(r.at)}</em></div>`).join('')}</div>` : ''}
        </div>
        <div class="card">
          <div class="card-h"><h2>Incidencias</h2><span class="meta-line">${incs.filter(x => !x.resuelta).length} abiertas</span></div>
          <div class="incs">${incs.length ? incs.map(x => `
            <label class="inc ${x.resuelta ? 'ok' : ''}"><input type="checkbox" data-inc="${esc(x.key)}" ${x.resuelta ? 'checked' : ''} ${canEdit ? '' : 'disabled'}><span><b>${esc(x.sistema)}</b><small>${esc(x.folio || '')} · ${fmtDate(x.fecha)}</small><p>${esc(x.obs || '')}</p></span></label>`).join('') : '<p class="meta-line">Las fallas registradas en los reportes de visita de este proyecto aparecerán aquí.</p>'}</div>
        </div>
        <div class="card">
          <div class="card-h"><h2>Reportes de visita</h2></div>
          <div class="plinks">${reps.length ? reps.map(r => `<div class="plink"${can('reporte') ? ` data-rep="${r.id}"` : ''}>${ICON.pdf}<span><b>${esc(r.folio || 'Sin folio')}</b><small>${fmtDate(r.fecha)} · ${esc(r.asunto || '')}</small></span></div>`).join('') : '<p class="meta-line">Se ligan a través de las actividades del proyecto.</p>'}</div>
        </div>
        <div class="card">
          <div class="card-h"><h2>Presupuestos</h2>${buds.length ? `<b class="mono">$${AGIS_money(budTotal)}</b>` : ''}</div>
          <div class="plinks">${buds.length ? buds.map(b => `<div class="plink"${can('presupuesto') ? ` data-bud="${b.id}"` : ''}>${ICON.cash}<span><b>${esc(b.folio || 'Sin folio')}</b><small>${fmtDate(b.fecha)} · $${AGIS_money(b.total)} ${esc(b.moneda || '')}</small></span>${canEdit ? `<button class="icon-btn danger" data-budunlink="${b.id}" title="Desvincular">${ICON.unlink}</button>` : ''}</div>`).join('') : '<p class="meta-line">Sin presupuestos ligados.</p>'}</div>
          ${canEdit && Store.data.presupuestos.some(b => !(p.presupuestoIds || []).includes(b.id)) ? `<select class="input" id="budLink" style="margin-top:10px"><option value="">Vincular presupuesto (adicional, revisión)…</option>${Store.data.presupuestos.filter(b => !(p.presupuestoIds || []).includes(b.id)).map(b => `<option value="${b.id}">${esc(b.folio)} · ${esc(b.clienteNombre || '')}</option>`).join('')}</select>` : ''}
        </div>
        <div class="card">
          <div class="card-h"><h2>Datos comerciales</h2></div>
          <div class="kv">
            <div><span>Origen</span><b>${esc(p.origen || '—')}</b></div>
            <div><span>Saldo pendiente</span><b class="${+p.saldo > 0 ? '' : 'muted'}">${MXN.format(+p.saldo || 0)}</b></div>
          </div>
          <div class="chips" style="margin-top:12px">${(p.servicios || []).map(x => `<span class="chip ${svcClass(x)}">${esc(x)}</span>`).join('') || '<span class="meta-line">Sin servicios registrados.</span>'}</div>
        </div>
        <div class="card">
          <div class="card-h"><h2>Equipo</h2></div>
          <div class="chips">${p.responsable ? `<span class="chip c6">Responsable: ${esc(p.responsable)}</span>` : ''}${(p.equipo || []).map(n => `<span class="chip c2">${esc(n)}</span>`).join('') || (p.responsable ? '' : '<span class="meta-line">Sin equipo asignado.</span>')}</div>
          ${p.notas ? `<p class="pnotes">${esc(p.notas)}</p>` : ''}
        </div>
      </div>
    </div>
  </section>`;
  const root = $('#proyecto');
  const save = () => { p.updated = new Date().toISOString(); Store.save('proyectos'); renderProjectDetail(stage, p); };
  root.addEventListener('click', e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'pback') { PS.view = 'list'; return renderProyectos(stage); }
    if (a === 'pedit') return projectForm(p);
    if (a === 'pmore') return popMenu(e.target.closest('[data-act]'), [
      { label: 'Eliminar proyecto', icon: 'trash', danger: true, run: async () => {
        if (!await confirmDialog('Eliminar proyecto', `¿Eliminar <b>${esc(p.nombre)}</b>? Las actividades y reportes no se borran, solo se desligan.`)) return;
        Store.data.proyectos = Store.data.proyectos.filter(x => x.id !== p.id);
        Store.data.board.columns.forEach(c => c.cards.forEach(k => { if (k.proyectoId === p.id) { k.proyectoId = ''; k.sistemaId = ''; } }));
        Store.save('proyectos'); Store.save('board'); PS.view = 'list'; renderProyectos(stage); toast('Proyecto eliminado');
      } }]);
    if (a === 'ovrset') { const v = parseFloat($('#ovrVal').value); if (isNaN(v) || v < 0 || v > 100) return toast('Escribe un % entre 0 y 100', true); p.avanceManual = Math.round(v); toast('Avance fijado manualmente'); return save(); }
    if (a === 'ovrreset') { p.avanceManual = null; toast('Avance restablecido a calculado'); return save(); }
    if (a === 'sysadd') return promptDialog('Nuevo sistema', 'Nombre (ej. CCTV, Audio, Redes)').then(n => { if (!n) return; (p.sistemas = p.sistemas || []).push({ id: uid(), nombre: n, avanceManual: null }); save(); });
    if (a === 'pcard') return cardForm(null, Store.data.board.columns[0].id, { proyectoId: p.id });
    const sm = e.target.closest('[data-sysmenu]');
    if (sm) {
      const s = p.sistemas.find(x => x.id === sm.dataset.sysmenu), sp = sysProgress(p, s);
      return popMenu(sm, [
        { label: 'Fijar avance manual', icon: 'edit', run: () => promptDialog(`Avance de ${s.nombre}`, `% de avance (calculado: ${sp.calc}%)`, sp.manual ? String(sp.value) : '').then(v => { if (v === null) return; const n = parseFloat(v); if (isNaN(n) || n < 0 || n > 100) return toast('Escribe un % entre 0 y 100', true); s.avanceManual = Math.round(n); save(); }) },
        ...(sp.manual ? [{ label: 'Restablecer a calculado', icon: 'reset', run: () => { s.avanceManual = null; save(); } }] : []),
        { label: 'Renombrar', icon: 'edit', run: () => promptDialog('Renombrar sistema', 'Nombre', s.nombre).then(n => { if (n) { s.nombre = n; save(); } }) },
        '-',
        { label: 'Eliminar sistema', icon: 'trash', danger: true, run: async () => { if (!await confirmDialog('Eliminar sistema', `¿Eliminar <b>${esc(s.nombre)}</b>? Sus actividades pasan a "General".`)) return; p.sistemas = p.sistemas.filter(x => x.id !== s.id); Store.data.board.columns.forEach(c => c.cards.forEach(k => { if (k.proyectoId === p.id && k.sistemaId === s.id) k.sistemaId = ''; })); Store.save('board'); save(); } }
      ]);
    }
    const cd = e.target.closest('[data-card]'); if (cd && can('actividades')) { const { col, card } = findCard(cd.dataset.card); if (card) cardForm(card, col.id); return; }
    const rp = e.target.closest('[data-rep]'); if (rp) return openReport(rp.dataset.rep);
    const ul = e.target.closest('[data-budunlink]'); if (ul) { e.stopPropagation(); p.presupuestoIds = (p.presupuestoIds || []).filter(x => x !== ul.dataset.budunlink); return save(); }
    const bd = e.target.closest('[data-bud]'); if (bd) return openBudget(bd.dataset.bud);
  });
  root.addEventListener('change', e => {
    if (e.target.id === 'budLink' && e.target.value) { (p.presupuestoIds = p.presupuestoIds || []).push(e.target.value); const b = Store.data.presupuestos.find(x => x.id === e.target.value); if (b && !b.proyectoId) { b.proyectoId = p.id; Store.save('presupuestos'); } return save(); }
    const ik = e.target.dataset.inc;
    if (ik !== undefined) { const set = new Set(p.resueltas || []); e.target.checked ? set.add(ik) : set.delete(ik); p.resueltas = [...set]; save(); }
  });
}
function projectForm(p, prefill) {
  const isNew = !p;
  p = p ? { ...p } : { codigo: nextProjectCode(), nombre: '', clienteId: '', obra: '', direccion: '', responsable: userName(), equipo: [], estatus: 'por_iniciar', fechaInicio: todayISO(), fechaFin: '', notas: '', sistemas: [], presupuestoIds: [], origen: '', servicios: [], saldo: 0, ...(prefill || {}) };
  const svc = new Set(p.servicios || []);
  const origFin = isNew ? '' : (p.fechaFin || '');
  const eq = new Set(p.equipo || []);
  const clientes = [...Store.data.clientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
  let origen = 'Cliente';
  openModal({
    title: isNew ? 'Nuevo proyecto' : 'Editar proyecto', size: 'wide',
    body: `<div class="grid2">
      <div class="field span2"><label>Nombre del proyecto <span class="req">*</span></label><input class="input" name="nombre" value="${esc(p.nombre)}" autofocus placeholder="Ej. Automatización Residencia Bosques"></div>
      <div class="field"><label>Cliente <span class="req">*</span></label><select class="input" name="clienteId"><option value="">Seleccionar…</option>${clientes.map(c => `<option value="${esc(c.id)}" ${p.clienteId === c.id ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('')}</select></div>
      <div class="field"><label>Código</label><input class="input mono" name="codigo" value="${esc(p.codigo)}"></div>
      <div class="field"><label>Obra</label><input class="input" name="obra" value="${esc(p.obra)}"></div>
      <div class="field"><label>Estatus</label><select class="input" name="estatus">${PEST.map(s => `<option value="${s.k}" ${p.estatus === s.k ? 'selected' : ''}>${s.l}</option>`).join('')}</select></div>
      <div class="field span2"><label>Dirección del proyecto</label><input class="input" name="direccion" value="${esc(p.direccion)}"></div>
      <div class="field"><label>Origen</label><select class="input" name="origen"><option value="">Seleccionar…</option>${ORIGENES.map(o => `<option ${p.origen === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>
      <div class="field"><label>Saldo pendiente (MXN)</label><input class="input" name="saldo" type="number" min="0" step="0.01" inputmode="decimal" value="${+p.saldo || 0}"></div>
      <div class="field span2"><label>Servicios contratados</label><div class="toggle-chips" id="svcChipsP">${SERVICIOS.map(x => `<button type="button" class="tchip ${svc.has(x) ? 'on' : ''}" data-s="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>
      <div class="field"><label>Inicio</label><input class="input" type="date" name="fechaInicio" value="${esc(p.fechaInicio)}"></div>
      <div class="field"><label>Fin comprometido</label><input class="input" type="date" name="fechaFin" value="${esc(p.fechaFin)}">${p.fechaFinBase ? `<small class="meta-line">Fecha original: ${fmtDate(p.fechaFinBase)}</small>` : ''}</div>
      <div class="field span2 reprog-box" id="reprogBox" hidden>
        <b>Cambio de fecha de entrega</b><p class="meta-line">Se guarda en el historial; la fecha original se conserva como referencia.</p>
        <div class="seg" id="origSeg"><button type="button" data-o="Cliente" class="on">Por el cliente</button><button type="button" data-o="Interno">Interno</button></div>
        <input class="input" name="motivo" placeholder="Motivo del cambio (requerido)" maxlength="200" style="margin-top:8px">
      </div>
      <div class="field"><label>Responsable</label><input class="input" name="responsable" list="eqList" value="${esc(p.responsable)}"><datalist id="eqList">${Store.data.config.equipo.map(n => `<option value="${esc(n)}">`).join('')}</datalist></div>
      <div class="field"><label>Equipo asignado</label><div class="toggle-chips" id="eqChips">${Store.data.config.equipo.map(n => `<button type="button" class="tchip ${eq.has(n) ? 'on' : ''}" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div></div>
      ${isNew ? `<div class="field span2"><label>Sistemas (separados por coma)</label><input class="input" name="sistemasTxt" value="${esc((p.sistemas || []).map(s => s.nombre).join(', '))}" placeholder="CCTV, Audio, Redes, Automatización"></div>` : ''}
      <div class="field span2"><label>Notas</label><textarea class="input" name="notas" rows="3">${esc(p.notas)}</textarea></div>
    </div>`,
    foot: `<button class="btn" data-x>Cancelar</button><button class="btn primary" data-save>${ICON.save}${isNew ? 'Crear proyecto' : 'Guardar'}</button>`,
    onMount(m, close) {
      const f = n => m.querySelector(`[name=${n}]`);
      const chk = () => { m.querySelector('#reprogBox').hidden = !(origFin && f('fechaFin').value && f('fechaFin').value !== origFin); };
      f('fechaFin').addEventListener('change', chk); f('fechaFin').addEventListener('input', chk);
      m.querySelector('#origSeg').onclick = e => { const b = e.target.closest('[data-o]'); if (!b) return; origen = b.dataset.o; $$('#origSeg button', m).forEach(x => x.classList.toggle('on', x === b)); };
      m.querySelector('#svcChipsP').onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; b.classList.toggle('on'); svc.has(b.dataset.s) ? svc.delete(b.dataset.s) : svc.add(b.dataset.s); };
      m.querySelector('#eqChips').onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; b.classList.toggle('on'); eq.has(b.dataset.n) ? eq.delete(b.dataset.n) : eq.add(b.dataset.n); };
      m.querySelector('[data-save]').onclick = () => {
        const nombre = f('nombre').value.trim(), clienteId = f('clienteId').value;
        if (!nombre) { f('nombre').classList.add('invalid'); f('nombre').focus(); return; }
        if (!clienteId) { f('clienteId').classList.add('invalid'); f('clienteId').focus(); return; }
        const fi = f('fechaInicio').value, ff = f('fechaFin').value;
        if (fi && ff && ff < fi) { f('fechaFin').classList.add('invalid'); return toast('El fin no puede ser antes del inicio', true); }
        const changed = origFin && ff && ff !== origFin;
        if (changed && !f('motivo').value.trim()) { f('motivo').classList.add('invalid'); f('motivo').focus(); return toast('Escribe el motivo del cambio de fecha', true); }
        const c = Store.data.clientes.find(x => x.id === clienteId);
        const rec = { nombre, clienteId, clienteNombre: c ? c.nombre : '', codigo: f('codigo').value.trim() || nextProjectCode(), obra: f('obra').value.trim(), estatus: f('estatus').value, direccion: f('direccion').value.trim(), fechaInicio: fi, fechaFin: ff, responsable: f('responsable').value.trim(), equipo: [...eq], notas: f('notas').value.trim(), origen: f('origen').value, saldo: Math.max(0, parseFloat(f('saldo').value) || 0), servicios: SERVICIOS.filter(x => svc.has(x)), updated: new Date().toISOString() };
        let target;
        if (isNew) {
          const sis = (f('sistemasTxt').value || '').split(',').map(x => x.trim()).filter(Boolean).map(n => ({ id: uid(), nombre: n, avanceManual: null }));
          target = { id: uid(), created: new Date().toISOString(), createdBy: ME.username, avanceManual: null, resueltas: [], reprogramaciones: [], presupuestoIds: p.presupuestoIds || [], ...rec, sistemas: sis, fechaFinBase: ff || '' };
          Store.data.proyectos.unshift(target);
          (target.presupuestoIds || []).forEach(id => { const b = Store.data.presupuestos.find(x => x.id === id); if (b) b.proyectoId = target.id; });
          if (target.presupuestoIds.length) Store.save('presupuestos');
          toast('Proyecto creado');
        } else {
          target = projById(p.id);
          if (changed) (target.reprogramaciones = target.reprogramaciones || []).push({ de: origFin, a: ff, motivo: f('motivo').value.trim(), origen, by: ME.username, byName: userName(), at: new Date().toISOString() });
          Object.assign(target, rec);
          if (!target.fechaFinBase && ff) target.fechaFinBase = ff;
          toast(changed ? 'Fecha reprogramada (se conserva la original)' : 'Proyecto actualizado');
        }
        Store.save('proyectos'); close();
        PS.view = 'detail'; PS.id = target.id;
        if (current === 'proyectos') renderProyectos($('#stage')); else go('proyectos');
      };
    }
  });
}
function projectFromBudget(b) {
  const ex = b.proyectoId && projById(b.proyectoId);
  if (ex) return openProject(ex.id);
  const d = b.data || {};
  const sis = d.sistemaNombre && !/^sistema general$/i.test(d.sistemaNombre.trim()) ? [{ id: uid(), nombre: d.sistemaNombre, avanceManual: null }] : [];
  if (current !== 'proyectos') go('proyectos');
  projectForm(null, { nombre: b.titulo || d.titulo || d.obra || '', clienteId: b.clienteId || d.clienteId || '', obra: d.obra || '', direccion: d.lugar && !/^ciudad de méxico/i.test(d.lugar) ? d.lugar : '', presupuestoIds: [b.id], sistemas: sis });
}
function pickBudgetForProject() {
  const list = Store.data.presupuestos.filter(b => !(b.proyectoId && projById(b.proyectoId)));
  if (!list.length) return toast('No hay presupuestos sin proyecto', true);
  openModal({
    title: 'Crear proyecto desde presupuesto', size: 'narrow',
    body: `<div class="plinks">${list.map(b => `<div class="plink" data-pick="${b.id}">${ICON.cash}<span><b>${esc(b.folio || 'Sin folio')}</b><small>${esc(b.clienteNombre || '')} · ${fmtDate(b.fecha)} · $${AGIS_money(b.total)} ${esc(b.moneda || '')}</small></span></div>`).join('')}</div>`,
    onMount(m, close) { m.addEventListener('click', e => { const x = e.target.closest('[data-pick]'); if (!x) return; close(); setTimeout(() => projectFromBudget(Store.data.presupuestos.find(b => b.id === x.dataset.pick)), 200); }); }
  });
}

/* ================= MONITOR (solo administradores) ================= */
let monTimer = null, monAt = null;
function vigenciaDias(txt) { const m = /(\d+)/.exec(txt || ''); return m ? +m[1] : 30; }
function monitorData() {
  const t = todayISO();
  const activos = Store.data.proyectos.filter(p => p.estatus !== 'cerrado');
  const enCurso = activos.filter(p => p.estatus === 'en_curso' || p.estatus === 'adicionales');
  const cards = []; Store.data.board.columns.forEach(col => col.cards.forEach(k => cards.push({ col, card: k, done: !!(k.done || col.done) })));
  const vencidas = cards.filter(x => !x.done && x.card.fecha && x.card.fecha < t);
  const hoy = cards.filter(x => x.card.fecha === t).sort((a, b) => String(a.card.hora || '').localeCompare(String(b.card.hora || '')));
  const porVencer = Store.data.presupuestos.filter(b => !(b.proyectoId && projById(b.proyectoId))).map(b => {
    const exp = new Date(parseD(b.fecha)); exp.setDate(exp.getDate() + vigenciaDias(b.data && b.data.vigencia));
    return { b, dias: daysBetween(t, localISO(exp)) };
  }).filter(x => x.dias >= 0 && x.dias <= 7);
  const porCobrar = isSchema2() ? Store.data.proyectos.reduce((a, p) => a + (+p.saldo || 0), 0) : Store.data.clientes.reduce((a, c) => a + (+c.saldo || 0), 0);
  const avgProg = enCurso.length ? Math.round(enCurso.reduce((a, p) => a + projProgress(p).value, 0) / enCurso.length) : 0;
  const alerts = [];
  activos.forEach(p => { const h = projHealth(p); if (h.k === 'bad' || h.k === 'warn') alerts.push({ lvl: h.k, t: p.nombre, d: h.l, go: () => openProject(p.id) }); });
  activos.forEach(p => { if (p.estatus === 'en_curso') { const last = projCards(p.id).reduce((a, x) => (x.card.updated || x.card.created || '') > a ? (x.card.updated || x.card.created || '') : a, p.updated || p.created || ''); if (last && daysBetween(localISO(new Date(last)), t) > 10) alerts.push({ lvl: 'warn', t: p.nombre, d: `Sin movimiento hace ${daysBetween(localISO(new Date(last)), t)} días`, go: () => openProject(p.id) }); } });
  vencidas.slice(0, 20).forEach(x => alerts.push({ lvl: 'bad', t: x.card.title, d: `Actividad vencida (${fmtShort(x.card.fecha)}) · ${x.col.name}`, go: () => openCard(x.card.id) }));
  porVencer.forEach(x => alerts.push({ lvl: 'warn', t: x.b.folio, d: x.dias === 0 ? 'Presupuesto vence hoy' : `Presupuesto vence en ${x.dias} día${x.dias > 1 ? 's' : ''}`, go: () => openBudget(x.b.id) }));
  return { activos, enCurso, vencidas, hoy, porVencer, porCobrar, avgProg, alerts };
}
function renderMonitor(stage) {
  stage.innerHTML = `<section id="monitor" class="monitor"></section>`;
  drawMonitor();
  clearInterval(monTimer);
  monTimer = setInterval(async () => { if (current !== 'monitor') { clearInterval(monTimer); return; } if (document.visibilityState !== 'visible' || modalStack.length) return; try { await Store.reload(); } catch (e) {} drawMonitor(); }, 30000);
}
function drawMonitor() {
  const el = $('#monitor'); if (!el) return;
  monAt = new Date();
  const D = monitorData();
  const hc = { ok: '#15803d', warn: '#b7791f', bad: '#be1e1e', idle: '#94a3b8' };
  const byPerson = {};
  D.hoy.forEach(x => ((x.card.responsables || []).length ? x.card.responsables : ['Sin asignar']).forEach(n => (byPerson[n] = byPerson[n] || []).push(x)));
  el.innerHTML = `
    <div class="mon-head">
      <div><h1>Monitor</h1><p>Actualizado ${pad(monAt.getHours())}:${pad(monAt.getMinutes())} · se refresca cada 30 s</p></div>
      <div class="actions"><button class="btn" data-act="mrefresh">${ICON.reset}Actualizar</button><button class="btn primary" data-act="mtv">${document.body.classList.contains('tv') ? ICON.x + 'Salir de modo TV' : ICON.open + 'Modo TV'}</button></div>
    </div>
    <div class="kpis">
      <div class="kpi"><small>Proyectos activos</small><b>${D.activos.length}</b><span>${D.enCurso.length} en curso</span></div>
      <div class="kpi"><small>Avance promedio</small><b>${D.avgProg}%</b><span>proyectos en curso</span></div>
      <div class="kpi ${D.vencidas.length ? 'bad' : ''}"><small>Actividades vencidas</small><b>${D.vencidas.length}</b><span>sin marcar como Lista</span></div>
      <div class="kpi ${D.porVencer.length ? 'warn' : ''}"><small>Presupuestos por vencer</small><b>${D.porVencer.length}</b><span>próximos 7 días</span></div>
      <div class="kpi"><small>Por cobrar</small><b>$${AGIS_money(D.porCobrar).replace(/\.\d+$/, '')}</b><span>saldo de proyectos</span></div>
    </div>
    <div class="mon-grid">
      <div class="mon-projects">${D.activos.length ? D.activos.map(p => {
        const pr = projProgress(p), h = projHealth(p), dev = deviation(p), inc = projIncidents(p).filter(x => !x.resuelta).length;
        return `<article class="mtile" data-pid="${p.id}" style="--hc:${hc[h.k]}">
          <div class="mt-h"><b>${esc(p.nombre)}</b><small>${esc(p.clienteNombre || '')}</small></div>
          <div class="mt-body">${donut(pr.value, 96, hc[h.k])}
            <div class="mt-info">
              <div><span>Inicio</span><b>${p.fechaInicio ? fmtShort(p.fechaInicio) : '—'}</b></div>
              <div><span>Fin</span><b>${p.fechaFin ? fmtShort(p.fechaFin) : '—'}</b></div>
              <div><span>Original</span><b>${p.fechaFinBase ? fmtShort(p.fechaFinBase) : '—'}${dev ? ` <em class="${dev > 0 ? 'late' : ''}">${dev > 0 ? '+' : ''}${dev}d</em>` : ''}</b></div>
            </div></div>
          <div class="mt-foot"><span>${pr.done}/${pr.total} actividades${pr.manual ? ' · manual' : ''}</span><span>${inc ? inc + ' incid.' : 'Sin incidencias'}</span></div>
          <div class="mt-status"><i></i>${esc(h.l)}</div>
        </article>`; }).join('') : `<div class="empty">${ICON.folder}<b>Sin proyectos activos</b>Crea proyectos en el módulo Proyectos.</div>`}</div>
      <aside class="mon-side">
        <div class="card"><div class="card-h"><h2>Alertas</h2><span class="badge">${D.alerts.length}</span></div>
          <div class="alerts">${D.alerts.length ? D.alerts.map((a, i) => `<div class="alert a-${a.lvl}" data-al="${i}"><i></i><span><b>${esc(a.t)}</b><small>${esc(a.d)}</small></span></div>`).join('') : '<p class="meta-line">Todo en orden.</p>'}</div></div>
        <div class="card"><div class="card-h"><h2>Equipo hoy</h2><span class="meta-line">${fmtLong(todayISO())}</span></div>
          <div class="today">${Object.keys(byPerson).length ? Object.entries(byPerson).map(([n, xs]) => `<div class="tp"><span class="avatar" style="background:${hashColor(n)}">${esc(initials(n))}</span><div><b>${esc(n)}</b>${xs.map(x => `<small>${x.card.hora ? esc(x.card.hora) + ' · ' : ''}${esc(x.card.title)}${x.card.proyectoId && projById(x.card.proyectoId) ? ' · ' + esc(projById(x.card.proyectoId).codigo) : (x.card.clienteTxt || clientName(x.card.clienteId) ? ' · ' + esc(clientName(x.card.clienteId) || x.card.clienteTxt) : '')}</small>`).join('')}</div></div>`).join('') : '<p class="meta-line">Sin actividades programadas para hoy.</p>'}</div></div>
      </aside>
    </div>`;
  el.onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'mrefresh') { try { await Store.reload(); } catch (_) {} drawMonitor(); toast('Monitor actualizado'); return; }
    if (a === 'mtv') { toggleTV(); return; }
    const t = e.target.closest('[data-pid]'); if (t) { exitTV(); openProject(t.dataset.pid); return; }
    const al = e.target.closest('[data-al]'); if (al) { exitTV(); D.alerts[+al.dataset.al].go(); }
  };
}
function toggleTV() {
  if (document.body.classList.contains('tv')) return exitTV();
  document.body.classList.add('tv');
  try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}
  drawMonitor();
}
function exitTV() {
  if (!document.body.classList.contains('tv')) return;
  document.body.classList.remove('tv');
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
  drawMonitor();
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('tv')) { document.body.classList.remove('tv'); drawMonitor(); } });

/* ================= PRESUPUESTO (visita técnica) ================= */
const BANK = {
  banco: 'BANCOMER', titular: 'ARQUITECHTURA AGIS S.A. DE C.V.',
  mxnCuenta: '0163075710', mxnClabe: '012 180 00163075710 6',
  usdCuenta: '0165308852', usdClabe: '012 180 00165308852 2',
  contacto: 'lilia.ortiz@arquitechtura.com · Oficina (55) 5545 5054 Ext. 109'
};
const OBS_DEFAULT = [
  'Esta propuesta no incluye el diseño de planos constructivos, en caso de ser requeridos se enviará la propuesta respectiva.',
  'Se requerirán instalaciones eléctricas adicionales.',
  'No se incluyen trabajos de canalizaciones, albañilería, carpintería, ni de obra civil.',
  'Se considera la realización de los trabajos en días y horarios hábiles, lunes a viernes, 9:00am a 6:00pm, Sábados, 9:00am a 2:00pm.',
  'Se deberá revisar la propuesta de acuerdo a los requerimientos definitivos del cliente final.'
];
const SECCIONES_DEF = ['Equipos', 'Accesorios', 'Cableados', 'Mano de Obra', 'Programación', 'Visita Técnica'];
const UNIDADES_DEF = ['Pieza', 'Lote', 'Metros', 'Bobina'];
const catList = k => (Store.data.catalogos && Array.isArray(Store.data.catalogos[k]) ? Store.data.catalogos[k] : (k === 'secciones' ? SECCIONES_DEF : UNIDADES_DEF));
const r2 = n => Math.round((+n || 0) * 100) / 100;
/* Precio unitario = (Costo + Mano de obra) × (1 + Indirectos %) × (1 + Margen %) */
function calcPU(p) { return r2(((+p.costo || 0) + (+p.manoObra || 0)) * (1 + (+p.indirectos || 0) / 100) * (1 + (+p.margen || 0) / 100)); }
/* Administración de catálogos (solo admin) */
function catalogManager(key, title, onDone) {
  if (!isAdmin()) return;
  let items = [...catList(key)];
  openModal({
    title, size: 'narrow',
    body: `<p class="meta-line">Solo los administradores pueden modificar esta lista. Los presupuestos ya guardados no cambian.</p>
      <div class="cat-list" id="catList"></div>
      <div class="cat-add"><input class="input" id="catNew" placeholder="Nuevo elemento" maxlength="40"><button type="button" class="btn" id="catAddBtn">${ICON.plus}Agregar</button></div>`,
    foot: `<button class="btn" data-x>Cancelar</button><button class="btn primary" data-save>${ICON.save}Guardar lista</button>`,
    onMount(m, close) {
      const list = m.querySelector('#catList');
      const draw = () => {
        list.innerHTML = items.map((t, i) => `<div class="cat-row"><input class="input" data-ci="${i}" value="${esc(t)}" maxlength="40"><button type="button" class="icon-btn" data-cu="${i}" title="Subir" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${ICON.up}</button><button type="button" class="icon-btn danger" data-cd="${i}" title="Eliminar">${ICON.trash}</button></div>`).join('') || '<span class="meta-line">La lista está vacía.</span>';
      };
      draw();
      list.addEventListener('input', e => { const i = e.target.dataset.ci; if (i !== undefined) items[+i] = e.target.value; });
      list.addEventListener('click', e => {
        const d = e.target.closest('[data-cd]'); if (d) { items.splice(+d.dataset.cd, 1); draw(); return; }
        const u = e.target.closest('[data-cu]'); if (u) { const i = +u.dataset.cu; if (i > 0) { [items[i - 1], items[i]] = [items[i], items[i - 1]]; draw(); } }
      });
      const add = () => { const inp = m.querySelector('#catNew'), v = inp.value.trim(); if (!v) return; if (items.some(x => x.toLowerCase() === v.toLowerCase())) return toast('Ya existe en la lista', true); items.push(v); inp.value = ''; draw(); inp.focus(); };
      m.querySelector('#catAddBtn').onclick = add;
      m.querySelector('#catNew').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
      m.querySelector('[data-save]').onclick = () => {
        const clean = [...new Set(items.map(x => x.trim()).filter(Boolean))];
        if (!clean.length) return toast('La lista no puede quedar vacía', true);
        Store.data.catalogos = { ...(Store.data.catalogos || {}), [key]: clean };
        Store.save('catalogos'); close(); toast('Lista actualizada'); onDone && onDone();
      };
    }
  });
}
function newBudget() {
  return {
    folio: '', rev: 0, clienteId: '', clienteNombre: '', fecha: todayISO(), obra: '', lugar: 'Ciudad de México, CDMX',
    sistemaNombre: 'SISTEMA GENERAL', sistemaCodigo: 'SGN', sistemas: 'SISTEMA GENERAL (SGN)', titulo: '',
    moneda: 'MXN', iva: 16, partidas: [],
    condPago: '100% con la aprobación del presupuesto.', garantia: '1 año contra defectos de fabricación.', vigencia: '30 días.',
    observaciones: [...OBS_DEFAULT], banco: { ...BANK }, director: 'ING. ISAAC SHTURMAN', savedId: null
  };
}
let PB = null;
function loadBudgetDraft() {
  try { const s = localStorage.getItem('agis-budget-draft'); if (s) { const b = { ...newBudget(), ...JSON.parse(s) }; if (!b.savedId) b.fecha = todayISO(); return b; } } catch (_) {}
  return newBudget();
}
const saveBudgetDraft = debounce(() => { try { localStorage.setItem('agis-budget-draft', JSON.stringify(PB)); } catch (_) {} }, 400);
const curFmt = (n, cur) => '$' + AGIS_money(n) + ' ' + (cur || PB.moneda);
function suggestBudgetFolio() {
  const base = (PB.obra || PB.clienteNombre || 'AGIS').trim().replace(/\s+/g, ' ');
  const pre = `${base}-${(PB.sistemaCodigo || 'SGN').toUpperCase()}-VT-`;
  const n = Store.data.presupuestos.filter(x => (x.folio || '').startsWith(pre) && x.id !== PB.savedId).map(x => parseInt((x.folio.slice(pre.length).match(/^\d+/) || ['0'])[0], 10)).reduce((a, b) => Math.max(a, b), 0) + 1;
  return `${pre}${String(n).padStart(3, '0')}_Rev.${PB.rev || 0}`;
}
function renderPresupuesto(stage) {
  if (!PB) PB = loadBudgetDraft();
  const clientes = [...Store.data.clientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
  stage.innerHTML = `
  <section id="presupuesto" class="rep-layout">
    <div>
      <div class="card">
        <div class="rep-hero">
          <div><img src="${window.AGIS_LOGOS ? AGIS_LOGOS.wordmark : ''}" alt="arquitechtura"></div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
            <div class="field"><label>Moneda</label><div class="seg" id="curSeg"><button type="button" data-cur="MXN">Pesos (MXN)</button><button type="button" data-cur="USD">Dólares (USD)</button></div></div>
            <div class="field" style="width:290px;max-width:100%"><label>Concurso No. / Folio</label><div style="display:flex;gap:6px"><input class="input" data-b="folio" placeholder="Obra-SGN-VT-001_Rev.0"><button class="icon-btn" data-act="bfolio" title="Sugerir folio" style="height:42px;width:42px;border:1px solid var(--line);flex:none">${ICON.wand}</button></div></div>
          </div>
        </div>
        <div class="grid2">
          <div class="field"><label>Cliente <span class="req">*</span></label><select class="input" data-b="clienteId"><option value="">Seleccionar cliente…</option>${clientes.map(c => `<option value="${esc(c.id)}">${esc(c.nombre)} · ${esc(c.id)}</option>`).join('')}</select></div>
          <div class="field"><label>Fecha <span class="req">*</span></label><input class="input" type="date" data-b="fecha"></div>
          <div class="field"><label>Obra <span class="req">*</span></label><input class="input" data-b="obra" placeholder="Ej. Real del Country 12"></div>
          <div class="field"><label>Lugar</label><input class="input" data-b="lugar"></div>
          <div class="field"><label>Sistema</label><div style="display:flex;gap:8px"><input class="input" data-b="sistemaNombre" placeholder="SISTEMA GENERAL"><input class="input mono" data-b="sistemaCodigo" placeholder="SGN" style="width:90px;flex:none" maxlength="6"></div></div>
          <div class="field"><label>Sistemas (texto en el documento)</label><input class="input" data-b="sistemas" placeholder="SISTEMA GENERAL (SGN)"></div>
          <div class="field span2"><label>Título del presupuesto <span class="req">*</span></label><input class="input" data-b="titulo" placeholder="Ej. Visita técnica para revisión de control de acceso y red WiFi"></div>
        </div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">01</span><h2>Partidas</h2><button class="btn sm primary" data-act="addpart">${ICON.plus}Agregar partida</button></div>
        <div id="partList"></div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">02</span><h2>Notas</h2></div>
        <div class="grid2">
          <div class="field span2"><label>Precios</label><div class="ro-line" id="preciosTxt"></div></div>
          <div class="field span2"><label>Condiciones de pago <span class="req">*</span></label><input class="input" data-b="condPago"></div>
          <div class="field"><label>Garantía <span class="req">*</span></label><input class="input" data-b="garantia"></div>
          <div class="field"><label>Vigencia de cotización <span class="req">*</span></label><input class="input" data-b="vigencia"></div>
        </div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">03</span><h2>Observaciones</h2></div>
        <div class="bullets" id="obsList"></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn sm ghost" data-act="addobs">${ICON.plus}Agregar observación</button><button class="btn sm ghost" data-act="resetobs">${ICON.reset}Restaurar leyendas</button></div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">04</span><h2>Datos bancarios</h2><span class="meta-line">Informativo</span></div>
        <div class="bank-grid">
          <div><small>Banco y titular</small><b>${esc(BANK.banco)}</b><span>${esc(BANK.titular)}</span></div>
          <div><small>Moneda nacional (MXN)</small><b>Cuenta ${esc(BANK.mxnCuenta)}</b><span>CLABE ${esc(BANK.mxnClabe)}</span></div>
          <div><small>Dólares (USD)</small><b>Cuenta ${esc(BANK.usdCuenta)}</b><span>CLABE ${esc(BANK.usdClabe)}</span></div>
        </div>
        <p class="meta-line" style="margin:12px 0 0">Contacto: ${esc(BANK.contacto)} · Firma: Director General, ${esc(PB.director)}</p>
      </div>
    </div>

    <aside class="rep-side">
      <div class="card">
        <b style="font-size:14px;display:block;margin-bottom:12px">Resumen</b>
        <div class="tot-rows">
          <div><span>Subtotal</span><b id="tSub"></b></div>
          <div><span>IVA <input class="input iva-in" type="number" min="0" max="100" step="1" data-b="iva">%</span><b id="tIva"></b></div>
          <div class="tot-main"><span>Total</span><b id="tTot"></b></div>
        </div>
        <p class="tot-letras" id="tLetras"></p>
        <div class="int-sum" id="tInt"></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">
          <button class="btn primary" data-act="bpdf" style="justify-content:center;height:46px">${ICON.pdf}Generar PDF</button>
          <div style="display:flex;gap:8px"><button class="btn" data-act="bsave" style="flex:1;justify-content:center">${ICON.save}Guardar</button><button class="btn" data-act="bnew" style="flex:1;justify-content:center">${ICON.reset}Nuevo</button></div>
        </div>
      </div>
      <div class="card recent">
        <b style="font-size:14px;display:block;margin-bottom:8px">Presupuestos guardados</b>
        <div class="rep-list" id="budList"></div>
      </div>
    </aside>
  </section>`;
  const root = $('#presupuesto');
  $$('[data-b]', root).forEach(el => { el.value = PB[el.dataset.b] ?? ''; });
  root.addEventListener('input', e => {
    const k = e.target.dataset.b;
    if (k) {
      PB[k] = k === 'iva' ? Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) : e.target.value;
      e.target.classList.remove('invalid');
      if (k === 'sistemaNombre' || k === 'sistemaCodigo') { PB.sistemas = `${PB.sistemaNombre || 'SISTEMA GENERAL'} (${(PB.sistemaCodigo || 'SGN').toUpperCase()})`; const sx = $('[data-b=sistemas]'); if (sx) sx.value = PB.sistemas; }
      saveBudgetDraft(); drawBudgetTotals();
    }
    const oi = e.target.dataset.oi;
    if (oi !== undefined) { PB.observaciones[+oi] = e.target.value; saveBudgetDraft(); }
  });
  root.addEventListener('change', e => {
    if (e.target.dataset.b === 'clienteId') { const c = Store.data.clientes.find(x => x.id === e.target.value); PB.clienteNombre = c ? c.nombre : ''; if (c && !PB.obra) { PB.obra = c.nombre; $('[data-b=obra]').value = c.nombre; } saveBudgetDraft(); }
  });
  root.addEventListener('click', e => {
    const cur = e.target.closest('[data-cur]'); if (cur) { PB.moneda = cur.dataset.cur; saveBudgetDraft(); drawBudgetTotals(); return; }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'bfolio') { PB.folio = suggestBudgetFolio(); $('[data-b=folio]').value = PB.folio; $('[data-b=folio]').classList.remove('invalid'); saveBudgetDraft(); return; }
    if (a === 'addpart') return partForm();
    if (a === 'addobs') { PB.observaciones.push(''); drawObs(); $$('#obsList textarea').pop().focus(); saveBudgetDraft(); return; }
    if (a === 'resetobs') { PB.observaciones = [...OBS_DEFAULT]; drawObs(); saveBudgetDraft(); return; }
    if (a === 'bpdf') return generateBudgetPDF();
    if (a === 'bsave') return saveBudget(true);
    if (a === 'bnew') return resetBudget();
    const od = e.target.closest('[data-odel]'); if (od) { PB.observaciones.splice(+od.dataset.odel, 1); drawObs(); saveBudgetDraft(); return; }
    const pe = e.target.closest('[data-pedit]'); if (pe) return partForm(+pe.dataset.pedit);
    const pd = e.target.closest('[data-pdel]'); if (pd) return delPart(+pd.dataset.pdel);
    const pu = e.target.closest('[data-pup]'); if (pu) { const i = +pu.dataset.pup; if (i > 0) { [PB.partidas[i - 1], PB.partidas[i]] = [PB.partidas[i], PB.partidas[i - 1]]; drawParts(); saveBudgetDraft(); } return; }
    const bo = e.target.closest('[data-bopen]'); if (bo) return openBudget(bo.dataset.bopen);
    const bm = e.target.closest('[data-bmore]'); if (bm) return budgetMenu(bm);
  });
  drawParts(); drawObs(); drawBudgetTotals(); drawBudgets();
}
function drawParts() {
  const el = $('#partList'); if (!el) return;
  if (!PB.partidas.length) { el.innerHTML = `<div class="empty" style="padding:26px">${ICON.cash}<b>Sin partidas</b>Agrega los conceptos del presupuesto con su unidad, cantidad y precio.</div>`; drawBudgetTotals(); return; }
  let html = '<div class="parts">', last = null;
  PB.partidas.forEach((p, i) => {
    const sec = (p.seccion || 'GENERAL').toUpperCase();
    if (sec !== last) { html += `<div class="part-sec">${esc(sec)}</div>`; last = sec; }
    const imp = (+p.cantidad || 0) * (+p.precio || 0);
    html += `<div class="part">
      <span class="part-code mono">${esc(p.codigo || '—')}</span>
      <span class="part-con">${esc(p.concepto)}${p.costo !== undefined ? `<small class="part-int">${ICON.lock.replace('width="20" height="20"', 'width="11" height="11"')} Costo ${AGIS_money(p.costo)} · M.O. ${AGIS_money(p.manoObra)} · Ind. ${+p.indirectos || 0}% · Margen ${+p.margen || 0}%</small>` : ''}</span>
      <span class="part-q"><small>${esc(p.unidad || '')}</small>${AGIS_money(p.cantidad)} × ${AGIS_money(p.precio)}</span>
      <b class="part-imp">${AGIS_money(imp)}</b>
      <span class="acts"><button class="icon-btn" data-pup="${i}" title="Subir" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${ICON.up}</button><button class="icon-btn" data-pedit="${i}" title="Editar">${ICON.edit}</button><button class="icon-btn danger" data-pdel="${i}" title="Eliminar">${ICON.trash}</button></span>
    </div>`;
  });
  el.innerHTML = html + '</div>';
  drawBudgetTotals();
}
function drawObs() {
  const el = $('#obsList'); if (!el) return;
  el.innerHTML = PB.observaciones.map((t, i) => `<div class="bullet-row"><span class="tri"></span><textarea class="input" rows="1" data-oi="${i}" placeholder="Observación">${esc(t)}</textarea><button class="icon-btn danger" data-odel="${i}" title="Quitar" style="margin-top:4px">${ICON.x}</button></div>`).join('') || '<span class="meta-line">Sin observaciones.</span>';
}
function drawBudgetTotals() {
  if (!$('#tSub')) return;
  const t = AGIS_budgetTotals(PB);
  $('#tSub').textContent = curFmt(t.subtotal); $('#tIva').textContent = curFmt(t.iva); $('#tTot').textContent = curFmt(t.total);
  $('#tLetras').textContent = AGIS_importeLetras(t.total, PB.moneda);
  const costo = PB.partidas.reduce((a, p) => a + (+p.cantidad || 0) * ((+p.costo || 0) + (+p.manoObra || 0)), 0);
  const hasInt = PB.partidas.some(p => p.costo !== undefined);
  const util = t.subtotal - costo;
  $('#tInt').innerHTML = hasInt ? `<div class="int-h">${ICON.lock.replace('width="20" height="20"', 'width="12" height="12"')} Interno · no se imprime</div>
    <div><span>Costo directo (costo + M.O.)</span><b>${curFmt(costo)}</b></div>
    <div><span>Indirectos + utilidad</span><b>${curFmt(util)}</b></div>
    <div><span>% sobre venta</span><b>${t.subtotal ? (util / t.subtotal * 100).toFixed(1) + '%' : '—'}</b></div>` : '';
  $('#preciosTxt').textContent = `Precios en ${PB.moneda === 'USD' ? 'Dólares USD' : 'Pesos MXN'} pagaderos al día de facturación.`;
  $$('#curSeg button').forEach(b => b.classList.toggle('on', b.dataset.cur === PB.moneda));
}
function partForm(i) {
  const isNew = i === undefined;
  const code = (PB.sistemaCodigo || 'SGN').toUpperCase();
  const nextCode = `${code}-P-${String(PB.partidas.filter(p => (p.codigo || '').startsWith(code + '-P-')).length + 1).padStart(3, '0')}`;
  const prev = PB.partidas[PB.partidas.length - 1] || {};
  const p = isNew
    ? { codigo: nextCode, seccion: prev.seccion || 'Visita Técnica', concepto: '', unidad: 'Lote', cantidad: 1, costo: '', manoObra: '', indirectos: prev.indirectos ?? '', margen: prev.margen ?? '' }
    : { ...PB.partidas[i] };
  if (!isNew && p.costo === undefined) { p.costo = p.precio; p.manoObra = 0; p.indirectos = 0; p.margen = 0; } // partidas anteriores: el precio pasa a costo
  const opts = (key, cur) => { const l = catList(key); const all = cur && !l.some(x => x.toLowerCase() === String(cur).toLowerCase()) ? [...l, cur] : l; return all.map(x => `<option ${String(cur).toLowerCase() === x.toLowerCase() ? 'selected' : ''}>${esc(x)}</option>`).join(''); };
  const gear = key => isAdmin() ? `<button type="button" class="icon-btn" data-cat="${key}" title="Editar lista (admin)" style="height:42px;width:42px;border:1px solid var(--line);flex:none">${ICON.edit}</button>` : '';
  openModal({
    title: isNew ? 'Agregar partida' : 'Editar partida', size: 'wide',
    body: `<div class="grid2">
      <div class="field"><label>Código</label><input class="input mono" name="codigo" value="${esc(p.codigo)}"></div>
      <div class="field"><label>Sección</label><div style="display:flex;gap:6px"><select class="input" name="seccion">${opts('secciones', p.seccion)}</select>${gear('secciones')}</div></div>
      <div class="field span2"><label>Concepto <span class="req">*</span></label><textarea class="input" name="concepto" rows="3" autofocus placeholder="Descripción del trabajo o suministro">${esc(p.concepto)}</textarea></div>
      <div class="field"><label>Unidad</label><div style="display:flex;gap:6px"><select class="input" name="unidad">${opts('unidades', p.unidad)}</select>${gear('unidades')}</div></div>
      <div class="field"><label>Cantidad <span class="req">*</span></label><input class="input" name="cantidad" type="number" min="0" step="0.01" inputmode="decimal" value="${esc(p.cantidad)}"></div>
      <div class="field span2 internal-box">
        <div class="internal-h">${ICON.lock}<b>Uso interno</b><span class="meta-line">No aparece en el presupuesto impreso</span></div>
        <div class="grid4">
          <div class="field"><label>Costo unitario <span class="req">*</span></label><input class="input" name="costo" type="number" min="0" step="0.01" inputmode="decimal" value="${esc(p.costo)}" placeholder="0.00"></div>
          <div class="field"><label>Mano de obra (unitaria)</label><input class="input" name="manoObra" type="number" min="0" step="0.01" inputmode="decimal" value="${esc(p.manoObra)}" placeholder="0.00"></div>
          <div class="field"><label>Indirectos %</label><input class="input" name="indirectos" type="number" min="0" step="0.1" inputmode="decimal" value="${esc(p.indirectos)}" placeholder="0"></div>
          <div class="field"><label>Margen %</label><input class="input" name="margen" type="number" min="0" step="0.1" inputmode="decimal" value="${esc(p.margen)}" placeholder="0"></div>
        </div>
        <p class="formula" id="pFormula"></p>
      </div>
      <div class="field"><label>Precio unitario (${PB.moneda})</label><div class="ro-line strong" id="puPrev"></div></div>
      <div class="field"><label>Importe</label><div class="ro-line" id="impPrev"></div></div>
    </div>`,
    foot: `<button class="btn" data-x>Cancelar</button><button class="btn primary" data-save>${isNew ? 'Agregar' : 'Guardar'}</button>`,
    onMount(m, close) {
      const f = n => m.querySelector(`[name=${n}]`);
      const vals = () => ({ costo: parseFloat(f('costo').value) || 0, manoObra: parseFloat(f('manoObra').value) || 0, indirectos: parseFloat(f('indirectos').value) || 0, margen: parseFloat(f('margen').value) || 0 });
      const upd = () => {
        const v = vals(), pu = calcPU(v), cd = v.costo + v.manoObra, conInd = r2(cd * (1 + v.indirectos / 100));
        m.querySelector('#puPrev').textContent = curFmt(pu);
        m.querySelector('#impPrev').textContent = curFmt((parseFloat(f('cantidad').value) || 0) * pu);
        m.querySelector('#pFormula').innerHTML = `(${AGIS_money(v.costo)} + ${AGIS_money(v.manoObra)}) = <b>${AGIS_money(cd)}</b> · +${v.indirectos}% indirectos = <b>${AGIS_money(conInd)}</b> · +${v.margen}% margen = <b>${AGIS_money(pu)}</b>`;
      };
      ['cantidad', 'costo', 'manoObra', 'indirectos', 'margen'].forEach(n => f(n).addEventListener('input', upd)); upd();
      m.addEventListener('click', e => {
        const g = e.target.closest('[data-cat]'); if (!g) return;
        const key = g.dataset.cat, sel = f(key === 'secciones' ? 'seccion' : 'unidad'), cur = sel.value;
        catalogManager(key, key === 'secciones' ? 'Secciones de partidas' : 'Unidades', () => { sel.innerHTML = opts(key, catList(key).includes(cur) ? cur : catList(key)[0]); });
      });
      m.querySelector('[data-save]').onclick = () => {
        const con = f('concepto').value.trim(), q = parseFloat(f('cantidad').value), v = vals();
        let bad = null;
        if (!con) bad = bad || f('concepto');
        if (!(q > 0)) bad = bad || f('cantidad');
        if (f('costo').value === '' || v.costo < 0) bad = bad || f('costo');
        if (v.manoObra < 0) bad = bad || f('manoObra');
        if (bad) { bad.classList.add('invalid'); bad.focus(); return; }
        const rec = { codigo: f('codigo').value.trim(), seccion: f('seccion').value, concepto: con, unidad: f('unidad').value, cantidad: q, ...v, precio: calcPU(v) };
        if (isNew) PB.partidas.push({ id: uid(), ...rec }); else PB.partidas[i] = { ...PB.partidas[i], ...rec };
        drawParts(); saveBudgetDraft(); close();
      };
    }
  });
}
async function delPart(i) {
  if (!await confirmDialog('Eliminar partida', `¿Eliminar la partida <b>${esc(PB.partidas[i].codigo || PB.partidas[i].concepto)}</b>?`)) return;
  PB.partidas.splice(i, 1); drawParts(); saveBudgetDraft();
}
function validateBudget() {
  const miss = []; let first = null;
  const need = (cond, label, sel) => { if (!cond) { miss.push(label); const el = sel && $(sel); if (el) { el.classList.add('invalid'); first = first || el; } } };
  need(PB.clienteId, 'Cliente', '[data-b=clienteId]');
  need(PB.fecha, 'Fecha', '[data-b=fecha]');
  need(String(PB.obra || '').trim(), 'Obra', '[data-b=obra]');
  need(String(PB.titulo || '').trim(), 'Título del presupuesto', '[data-b=titulo]');
  need(PB.partidas.length, '01 · Al menos una partida', '#partList');
  need(String(PB.condPago || '').trim(), '02 · Condiciones de pago', '[data-b=condPago]');
  need(String(PB.garantia || '').trim(), '02 · Garantía', '[data-b=garantia]');
  need(String(PB.vigencia || '').trim(), '02 · Vigencia de cotización', '[data-b=vigencia]');
  if (!miss.length) return true;
  if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  openModal({ title: 'Faltan datos en el presupuesto', size: 'narrow', body: `<p>Para guardar o generar el PDF completa:</p><ul class="miss-list">${miss.map(m => `<li>${esc(m)}</li>`).join('')}</ul>`, foot: `<button class="btn primary" data-x>Entendido</button>` });
  return false;
}
let budBusy = false;
function saveBudget(notify) {
  if (budBusy || !validateBudget()) return false;
  if (!String(PB.folio || '').trim()) { PB.folio = suggestBudgetFolio(); const el = $('[data-b=folio]'); if (el) el.value = PB.folio; }
  const c = Store.data.clientes.find(x => x.id === PB.clienteId); if (c) PB.clienteNombre = c.nombre;
  const t = AGIS_budgetTotals(PB);
  const rec = { id: PB.savedId || uid(), folio: PB.folio, fecha: PB.fecha, clienteId: PB.clienteId, clienteNombre: PB.clienteNombre, titulo: PB.titulo, total: t.total, moneda: PB.moneda, updated: new Date().toISOString(), by: ME.username, data: null };
  PB.savedId = rec.id; rec.data = { ...PB };
  const i = Store.data.presupuestos.findIndex(x => x.id === rec.id);
  if (i >= 0) Store.data.presupuestos[i] = rec; else Store.data.presupuestos.unshift(rec);
  Store.save('presupuestos'); saveBudgetDraft(); drawBudgets();
  if (notify) toast('Presupuesto guardado');
  return true;
}
async function makeBudgetPDF(d) {
  if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('No se pudo cargar el generador de PDF (revisa la conexión)');
  await loadPdfFonts();
  return buildBudgetPDF({ ...d, banco: { ...BANK, ...(d.banco || {}) } }, { jsPDF: window.jspdf.jsPDF, logos: window.AGIS_LOGOS, fonts: window.AGIS_PDF_FONTS });
}
const budgetFile = f => `${(f || 'Presupuesto').replace(/[^\w\-.]+/g, '_')}.pdf`;
async function generateBudgetPDF() {
  if (budBusy) return;
  if (!saveBudget(false)) return;
  budBusy = true;
  const btn = $('[data-act=bpdf]'); if (btn) { btn.disabled = true; btn.lastChild.textContent = 'Generando…'; }
  try { (await makeBudgetPDF(PB)).save(budgetFile(PB.folio)); toast('PDF generado: ' + budgetFile(PB.folio)); }
  catch (e) { console.error(e); toast(e.message || 'Error al generar el PDF', true); }
  finally { budBusy = false; if (btn) { btn.disabled = false; btn.lastChild.textContent = 'Generar PDF'; } }
}
async function resetBudget() {
  if (!await confirmDialog('Nuevo presupuesto', 'Se limpiará el formulario actual. Si no lo guardaste, se perderá.', 'Limpiar', false)) return;
  PB = newBudget(); saveBudgetDraft(); renderPresupuesto($('#stage'));
}
function drawBudgets() {
  const el = $('#budList'); if (!el) return;
  el.innerHTML = Store.data.presupuestos.length ? Store.data.presupuestos.map(b => `
    <div class="rep-item">
      <span class="est" style="background:#e9f7ef;color:#15803d">${ICON.cash.replace('width="20" height="20"', 'width="15" height="15"')}</span>
      <div class="info" data-bopen="${b.id}" style="cursor:pointer"><b>${esc(b.folio || 'Sin folio')}</b><small>${fmtDate(b.fecha)} · ${esc(b.clienteNombre || '')} · $${AGIS_money(b.total)} ${esc(b.moneda || '')}</small></div>
      <button class="icon-btn" data-bmore="${b.id}">${ICON.more}</button>
    </div>`).join('') : `<div class="meta-line" style="padding:8px">Aún no hay presupuestos guardados.</div>`;
}
function openBudget(id) {
  const b = Store.data.presupuestos.find(x => x.id === id); if (!b || !b.data) return toast('El presupuesto ya no existe', true);
  PB = { ...newBudget(), ...b.data, savedId: b.id }; saveBudgetDraft();
  if (current === 'presupuesto') renderPresupuesto($('#stage')); else go('presupuesto');
  toast('Presupuesto abierto: ' + (b.folio || ''));
}
function budgetMenu(btn) {
  const id = btn.dataset.bmore, b = Store.data.presupuestos.find(x => x.id === id);
  popMenu(btn, [
    { label: 'Abrir / editar', icon: 'open', run: () => openBudget(id) },
    { label: 'Descargar PDF', icon: 'download', run: async () => { try { (await makeBudgetPDF(b.data)).save(budgetFile(b.folio)); } catch (e) { toast(e.message || 'Error al generar el PDF', true); } } },
    ...(can('proyectos') ? [{ label: b.proyectoId && Store.data.proyectos.some(x => x.id === b.proyectoId) ? 'Ver proyecto' : 'Convertir en proyecto', icon: 'folder', run: () => projectFromBudget(b) }] : []),
    { label: 'Nueva revisión', icon: 'copy', run: () => { const rev = (+b.data.rev || 0) + 1; PB = { ...newBudget(), ...b.data, savedId: null, rev, fecha: todayISO(), folio: String(b.data.folio || '').replace(/_Rev\.\d+$/, '') + '_Rev.' + rev }; saveBudgetDraft(); renderPresupuesto($('#stage')); toast('Revisión ' + rev + ' lista para editar'); } },
    { label: 'Duplicar como nuevo', icon: 'copy', run: () => { PB = { ...newBudget(), ...b.data, savedId: null, rev: 0, folio: '', fecha: todayISO(), clienteId: '', clienteNombre: '', obra: '' }; saveBudgetDraft(); renderPresupuesto($('#stage')); } },
    '-',
    { label: 'Eliminar', icon: 'trash', danger: true, run: async () => { if (!await confirmDialog('Eliminar presupuesto', `¿Eliminar <b>${esc(b.folio)}</b>?`)) return; Store.data.presupuestos = Store.data.presupuestos.filter(x => x.id !== id); if (PB && PB.savedId === id) PB.savedId = null; Store.save('presupuestos'); drawBudgets(); } }
  ]);
}

/* ================= USUARIOS (solo admin) ================= */
const MOD_INFO = [
  { k: 'clientes', icon: 'users', d: 'Cartera, saldos y datos de contacto' },
  { k: 'actividades', icon: 'kanban', d: 'Tablero del equipo en campo' },
  { k: 'reporte', icon: 'report', d: 'Formularios y PDF de visita' },
  { k: 'presupuesto', icon: 'cash', d: 'Presupuestos de visita técnica' },
  { k: 'proyectos', icon: 'folder', d: 'Avance, fechas e incidencias' }
];
const PRESETS = [
  { l: 'Técnico de campo', m: ['actividades', 'reporte'] },
  { l: 'Administración', m: ['clientes'] },
  { l: 'Coordinación', m: ['clientes', 'actividades', 'reporte'] }
];
let USERS_CACHE = [];
async function renderUsuarios(stage) {
  stage.innerHTML = `
  <section class="panel" id="usuarios">
    <div class="view-head">
      <div><h1>Usuarios</h1><p>Crea accesos para tu equipo y define qué módulos puede ver cada perfil.</p></div>
      <div class="actions"><button class="btn primary" data-act="newuser">${ICON.plus}Nuevo usuario</button></div>
    </div>
    <div class="table-wrap"><div class="table-scroll"><table class="dt users-dt">
      <thead><tr><th>Usuario</th><th>Perfil</th><th>Módulos visibles</th><th>Estado</th><th>Último acceso</th><th style="width:44px"></th></tr></thead>
      <tbody id="uBody"><tr><td colspan="6"><div class="empty">Cargando…</div></td></tr></tbody>
    </table></div></div>
    ${Api.mode === 'local' ? '<p class="meta-line" style="margin-top:12px">Vista previa: los usuarios se guardan solo en este navegador. En el servidor se guardan cifrados.</p>' : ''}
  </section>`;
  const root = $('#usuarios');
  root.addEventListener('click', e => {
    if (e.target.closest('[data-act=newuser]')) return userForm();
    const mb = e.target.closest('[data-umore]');
    if (mb) {
      const u = USERS_CACHE.find(x => x.username === mb.dataset.umore);
      popMenu(mb, [
        { label: 'Editar', icon: 'edit', run: () => userForm(u) },
        { label: u.active ? 'Desactivar' : 'Activar', icon: 'lock', run: () => toggleUser(u) },
        '-',
        { label: 'Eliminar', icon: 'trash', danger: true, disabled: u.username === ME.username, run: () => deleteUser(u) }
      ]);
      return;
    }
    const tr = e.target.closest('tr[data-u]');
    if (tr) { const u = USERS_CACHE.find(x => x.username === tr.dataset.u); if (u && !u.builtin) userForm(u); }
  });
  await loadUsers();
}
async function loadUsers() {
  try { USERS_CACHE = (await Api.users.list()).users; }
  catch (e) { if ($('#uBody')) $('#uBody').innerHTML = `<tr><td colspan="6"><div class="empty">${esc(e.message)}</div></td></tr>`; return; }
  const body = $('#uBody'); if (!body) return;
  body.innerHTML = USERS_CACHE.map(u => `
    <tr data-u="${esc(u.username)}" class="${u.builtin ? 'builtin' : ''}">
      <td><div class="ucell"><span class="avatar" style="background:${hashColor(u.username)}">${esc(initials(u.name || u.username))}</span><div class="cname"><b>${esc(u.name)}</b><small>@${esc(u.username)}${u.username === ME.username ? ' · tú' : ''}</small></div></div></td>
      <td data-l="Perfil"><span class="rpill ${u.role}">${esc(ROLE_LABEL[u.role] || u.role)}</span>${u.builtin ? ` <span class="meta-line" title="Definido en las variables de entorno de Easypanel">${ICON.lock.replace('width="20" height="20"', 'width="13" height="13"')} Easypanel</span>` : ''}</td>
      <td data-l="Módulos" class="svc"><div class="chips">${u.role === 'admin' ? '<span class="chip c6">Todos + Usuarios</span>' : (u.modules.length ? u.modules.map(m => `<span class="chip c${ALL_MODS.indexOf(m)}">${esc(MOD_LABEL[m])}</span>`).join('') : '<span class="meta-line">Ninguno</span>')}</div></td>
      <td data-l="Estado"><span class="upill ${u.active ? 'on' : ''}">${u.active ? 'Activo' : 'Inactivo'}</span></td>
      <td data-l="Último acceso">${u.lastLogin ? fmtDate(u.lastLogin) : '—'}</td>
      <td class="act">${u.builtin ? '' : `<button class="icon-btn" data-umore="${esc(u.username)}" aria-label="Acciones">${ICON.more}</button>`}</td>
    </tr>`).join('');
}
function userForm(u) {
  const isNew = !u;
  u = u || { username: '', name: '', role: 'colaborador', modules: ['actividades', 'reporte'], active: true };
  const mods = new Set(u.modules || []);
  openModal({
    title: isNew ? 'Nuevo usuario' : 'Editar usuario', size: 'wide',
    body: `<div class="grid2">
      <div class="field"><label>Usuario <span class="req">*</span></label><input class="input" name="username" value="${esc(u.username)}" ${isNew ? 'autofocus' : 'disabled'} autocapitalize="none" spellcheck="false" placeholder="ej. diego.h"></div>
      <div class="field"><label>Nombre completo <span class="req">*</span></label><input class="input" name="name" value="${esc(u.name)}" placeholder="Nombre y apellido"></div>
      <div class="field span2"><label>${isNew ? 'Contraseña <span class="req">*</span>' : 'Nueva contraseña <span class="meta-line">(déjala vacía para no cambiarla)</span>'}</label>
        <div class="pass-wrap"><input class="input" name="password" type="text" autocomplete="new-password" placeholder="Mínimo 8 caracteres"><button type="button" class="icon-btn" data-gen title="Generar contraseña segura">${ICON.key}</button></div></div>
      <div class="field span2"><label>Perfil</label>
        <div class="seg" id="roleSeg"><button type="button" data-r="colaborador" class="${u.role !== 'admin' ? 'on' : ''}">Colaborador</button><button type="button" data-r="admin" class="${u.role === 'admin' ? 'on' : ''}">Administrador</button></div>
        <p class="meta-line" id="roleNote"></p></div>
      <div class="field span2" id="modWrap"><label>Módulos que puede visualizar</label>
        <div class="presets" style="margin:0 0 4px">${PRESETS.map((p, i) => `<button type="button" class="chip-btn" data-preset="${i}">${p.l}</button>`).join('')}</div>
        <div class="modchecks">${MOD_INFO.map(m => `<label class="modcheck"><input type="checkbox" value="${m.k}" ${mods.has(m.k) ? 'checked' : ''}><span class="mi">${ICON[m.icon]}</span><span><b>${MOD_LABEL[m.k]}</b><small>${m.d}</small></span></label>`).join('')}</div></div>
      <label class="switch span2"><input type="checkbox" name="active" ${u.active ? 'checked' : ''}><span class="sw"></span><span>Acceso activo</span></label>
    </div>`,
    foot: `<button class="btn" data-x>Cancelar</button><button class="btn primary" data-save>${ICON.save}${isNew ? 'Crear usuario' : 'Guardar'}</button>`,
    onMount(m, close) {
      let role = u.role === 'admin' ? 'admin' : 'colaborador';
      const f = n => m.querySelector(`[name=${n}]`);
      const checks = () => $$('.modcheck input', m);
      function syncRole() {
        $$('#roleSeg button', m).forEach(b => b.classList.toggle('on', b.dataset.r === role));
        const adm = role === 'admin';
        checks().forEach(c => { c.disabled = adm; if (adm) c.checked = true; });
        m.querySelector('#modWrap').classList.toggle('disabled', adm);
        m.querySelector('#roleNote').textContent = adm ? 'Ve todos los módulos y puede crear, editar y eliminar usuarios.' : 'Solo ve los módulos marcados abajo.';
      }
      m.querySelector('#roleSeg').onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return; if (role === 'admin' && b.dataset.r !== 'admin') checks().forEach(c => c.checked = mods.has(c.value)); role = b.dataset.r; syncRole(); };
      m.querySelector('.presets').onclick = e => { const b = e.target.closest('[data-preset]'); if (!b || role === 'admin') return; const p = PRESETS[+b.dataset.preset]; checks().forEach(c => c.checked = p.m.includes(c.value)); };
      m.querySelector('[data-gen]').onclick = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$%*';
        const arr = crypto.getRandomValues(new Uint32Array(12));
        f('password').value = Array.from(arr, n => chars[n % chars.length]).join('');
      };
      syncRole();
      m.querySelector('[data-save]').onclick = async () => {
        const body = { name: f('name').value.trim(), password: f('password').value, role, modules: role === 'admin' ? ALL_MODS : checks().filter(c => c.checked).map(c => c.value), active: f('active').checked };
        if (isNew) body.username = f('username').value.trim().toLowerCase();
        if (role !== 'admin' && !body.modules.length && !await confirmDialog('Sin módulos', 'Este usuario no podrá ver ningún módulo, solo la búsqueda vacía. ¿Guardar así?', 'Guardar', false)) return;
        const btn = m.querySelector('[data-save]'); btn.disabled = true;
        try {
          if (isNew) await Api.users.create(body); else await Api.users.update(u.username, body);
          close(); toast(isNew ? `Usuario ${body.username} creado` : 'Usuario actualizado'); loadUsers();
        } catch (e) { toast(e.message, true); btn.disabled = false; }
      };
    }
  });
}
async function toggleUser(u) {
  try { await Api.users.update(u.username, { name: u.name, role: u.role, modules: u.modules, active: !u.active }); toast(u.active ? 'Usuario desactivado' : 'Usuario activado'); loadUsers(); }
  catch (e) { toast(e.message, true); }
}
async function deleteUser(u) {
  if (!await confirmDialog('Eliminar usuario', `¿Eliminar a <b>${esc(u.name)}</b> (@${esc(u.username)})? Perderá el acceso de inmediato.`)) return;
  try { await Api.users.remove(u.username); toast('Usuario eliminado'); loadUsers(); } catch (e) { toast(e.message, true); }
}

/* ================= Login / usuario actual ================= */
function showLogin(msg, prefill = '') {
  document.body.classList.add('locked');
  setBand(false);
  let ov = $('#login');
  if (!ov) { ov = document.createElement('div'); ov.id = 'login'; document.body.appendChild(ov); }
  ov.innerHTML = `
    <form class="login-card" autocomplete="on">
      <img class="login-logo" alt="arquitechtura" src="${window.AGIS_LOGOS ? AGIS_LOGOS.wordmark : ''}">
      <h1>Iniciar sesión</h1>
      <p class="login-sub">Dashboard de proyectos · Arquitechtura AGIS</p>
      <div class="login-msg ${msg ? '' : 'hidden'}" id="lMsg">${esc(msg || '')}</div>
      <div class="field"><label for="lUser">Usuario</label><input class="input" id="lUser" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" value="${esc(prefill)}" required></div>
      <div class="field"><label for="lPass">Contraseña</label>
        <div class="pass-wrap"><input class="input" id="lPass" name="password" type="password" autocomplete="current-password" required><button type="button" class="icon-btn" id="lEye" aria-label="Mostrar contraseña">${ICON.eye}</button></div></div>
      <button class="btn primary login-btn" type="submit" id="lBtn">Entrar</button>
      ${Api.mode === 'local' ? '<p class="login-hint">Vista previa sin servidor · usuario <b>admin</b> / contraseña <b>admin</b></p>' : ''}
    </form>`;
  const f = ov.querySelector('form'), u = $('#lUser'), pw = $('#lPass'), btn = $('#lBtn'), lm = $('#lMsg');
  $('#lEye').onclick = () => { pw.type = pw.type === 'password' ? 'text' : 'password'; };
  (prefill ? pw : u).focus();
  f.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled = true; btn.textContent = 'Verificando…';
    try {
      const me = await Api.login(u.value.trim(), pw.value);
      ov.remove(); document.body.classList.remove('locked'); expiredShown = false;
      await startApp(me);
    } catch (err) {
      lm.textContent = err.message || 'No se pudo iniciar sesión'; lm.classList.remove('hidden'); lm.classList.add('err');
      lm.classList.toggle('blocked', err.status === 429);
      if (err.data && err.data.remaining > 0 && err.data.remaining < 5) lm.textContent += ` Te quedan ${err.data.remaining} intento${err.data.remaining > 1 ? 's' : ''}.`;
      pw.value = ''; pw.focus();
      btn.disabled = false; btn.textContent = 'Entrar';
    }
  });
}
/* ================= Notificaciones (campana) ================= */
let NOTIFS = [], notifTimer = null;
function timeAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return 'Hace un momento';
  if (s < 3600) return `Hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `Hace ${Math.floor(s / 3600)} h`;
  if (s < 172800) return 'Ayer';
  return fmtDate(iso);
}
async function refreshNotifs() {
  if (!ME) return;
  try { NOTIFS = (await Api.notif.list()).items || []; } catch (e) { return; }
  drawBell(); drawNotifPanel();
}
function drawBell() {
  const n = NOTIFS.length, c = $('#bellCount');
  c.textContent = n > 99 ? '99+' : String(n); c.hidden = !n;
  $('#bellBtn').setAttribute('aria-label', n ? `Notificaciones (${n})` : 'Notificaciones');
}
function notifOutside(e) { const p = $('#notifPanel'); if (p && !p.contains(e.target) && !$('#bellBtn').contains(e.target) && !e.target.closest('.modal-ov')) closeNotifPanel(); }
function closeNotifPanel() { const p = $('#notifPanel'); if (p) p.remove(); document.removeEventListener('pointerdown', notifOutside, true); $('#bellBtn').classList.remove('on'); }
function toggleNotifPanel() {
  if ($('#notifPanel')) return closeNotifPanel();
  if (popClose) popClose();
  const el = document.createElement('div'); el.id = 'notifPanel'; el.className = 'notif-panel'; el.setAttribute('role', 'dialog');
  document.body.appendChild(el); $('#bellBtn').classList.add('on');
  el.addEventListener('click', onNotifClick);
  drawNotifPanel(); refreshNotifs();
  setTimeout(() => document.addEventListener('pointerdown', notifOutside, true), 0);
}
function drawNotifPanel() {
  const p = $('#notifPanel'); if (!p) return;
  p.innerHTML = `<div class="np-head"><b>Notificaciones</b><span class="badge">${NOTIFS.length}</span></div>
    <div class="np-list">${NOTIFS.length ? NOTIFS.map(n => `
      <div class="np-item" data-nid="${esc(n.id)}" role="button" tabindex="0">
        <span class="np-ico">${ICON.check}</span>
        <div class="np-txt"><b>${esc(n.title)}</b><p>${esc(n.body)}</p><small>${esc(timeAgo(n.created))}</small></div>
        <button class="icon-btn danger np-del" data-ndel="${esc(n.id)}" aria-label="Eliminar notificación">${ICON.x}</button>
      </div>`).join('') : `<div class="np-empty">${ICON.bell}<b>Sin notificaciones</b>Aquí verás los avisos de tu equipo.</div>`}</div>
    ${NOTIFS.length ? `<div class="np-foot"><button class="btn sm ghost danger" data-nclear>${ICON.trash}Eliminar todas</button></div>` : ''}`;
}
async function onNotifClick(e) {
  const del = e.target.closest('[data-ndel]');
  if (del) { e.stopPropagation(); const id = del.dataset.ndel; NOTIFS = NOTIFS.filter(n => n.id !== id); drawBell(); drawNotifPanel(); Api.notif.remove(id).catch(() => {}); return; }
  if (e.target.closest('[data-nclear]')) {
    if (!await confirmDialog('Eliminar notificaciones', '¿Eliminar todas tus notificaciones?', 'Eliminar todas')) return;
    NOTIFS = []; drawBell(); drawNotifPanel(); Api.notif.clear().catch(() => {}); return;
  }
  const it = e.target.closest('[data-nid]');
  if (it) { const n = NOTIFS.find(x => x.id === it.dataset.nid); closeNotifPanel(); if (n && n.link && n.link.type === 'card') openCard(n.link.id); }
}
async function openCard(id) {
  if (!can('actividades')) return toast('No tienes acceso a Actividades', true);
  try { await Store.reload(); } catch (e) {}
  go('actividades');
  const { col, card } = findCard(id);
  if (!card) return toast('La actividad ya no existe', true);
  cardForm(card, col.id);
}
function startNotifs() {
  $('#bellBtn').hidden = false;
  refreshNotifs();
  clearInterval(notifTimer);
  notifTimer = setInterval(() => { if (document.visibilityState === 'visible') refreshNotifs(); }, 30000);
}
function stopNotifs() { clearInterval(notifTimer); NOTIFS = []; closeNotifPanel(); $('#bellBtn').hidden = true; drawBell(); }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && ME) refreshNotifs(); });

function renderUserChip() {
  const c = $('#userChip');
  c.innerHTML = `<span class="avatar" style="background:${hashColor(ME.username)}">${esc(initials(ME.name || ME.username))}</span><span class="user-meta"><b>${esc(ME.name || ME.username)}</b><small>${esc(ROLE_LABEL[ME.role] || ME.role)}</small></span>${ICON.down.replace('width="20" height="20"', 'width="16" height="16" class="chev"')}`;
}
function userMenu(anchor) {
  popMenu(anchor, [
    { header: `<b>${esc(ME.name || ME.username)}</b><small>@${esc(ME.username)} · ${esc(ROLE_LABEL[ME.role] || '')}</small>` },
    ...(isAdmin() ? [{ label: 'Administrar usuarios', icon: 'shield', run: () => go('usuarios') }, '-'] : []),
    { label: 'Cambiar de usuario', icon: 'swap', run: () => logout('Inicia sesión con otra cuenta.') },
    { label: 'Cerrar sesión', icon: 'logout', danger: true, run: () => logout('Sesión cerrada.') }
  ]);
}
async function logout(msg) {
  await Api.logout();
  stopNotifs();
  ME = null; current = null;
  modalStack.slice().forEach(c => c());
  $('#stage').innerHTML = ''; $('#crumb').textContent = '';
  showLogin(msg);
}
async function startApp(me) {
  ME = me;
  try { await Store.init(); }
  catch (e) { if (e.status === 401) return; toast('No se pudo cargar la información: ' + e.message, true); return; }
  migrateData();
  renderUserChip();
  startNotifs();
  buildBand();
  R = null; PB = null; PS.view = 'list';
  const h = location.hash.slice(1);
  if (MODULES.some(m => m.k === h && !m.soon && allowed(m))) go(h); else go(null);
}

/* ================= Arranque ================= */
(async function boot() {
  if (window.AGIS_LOGOS) $('#topLogo').src = AGIS_LOGOS.wordmark;
  $('#menuBtn').onclick = () => { if (!ME) return; if (current) go(null); else setBand(!$('#band').classList.contains('open')); };
  $('#brandLink').onclick = e => { e.preventDefault(); go(null); };
  $('#userChip').onclick = e => { if (ME) { closeNotifPanel(); userMenu(e.currentTarget); } };
  $('#bellBtn').onclick = () => { if (ME) toggleNotifPanel(); };
  window.addEventListener('hashchange', () => { if (!ME) return; const k = location.hash.slice(1); if (k !== (current || '')) go(k || null); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && ME && !current && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !modalStack.length) { e.preventDefault(); $('#gInput')?.focus(); }
  });
  const me = await Api.detect();
  if (me) await startApp(me); else showLogin('');
})();
