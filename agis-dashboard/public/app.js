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

/* ================= Almacenamiento ================= */
const Store = {
  mode: 'memory',
  data: { clientes: [], board: null, reportes: [], config: null },
  async init() {
    try {
      const r = await fetch('api/db', { cache: 'no-store', headers: { Accept: 'application/json' } });
      const ct = r.headers.get('content-type') || '';
      if (!r.ok || !ct.includes('json')) throw new Error('sin API');
      Object.assign(this.data, await r.json());
      this.mode = 'api';
    } catch (e) {
      try {
        const s = localStorage.getItem('agis-db');
        if (s) Object.assign(this.data, JSON.parse(s));
        this.mode = 'local';
      } catch (_) { this.mode = 'memory'; }
    }
    if (!this.data.config) this.data.config = { equipo: ['Luis Gómez', 'Diego', 'Omar'] };
    if (!Array.isArray(this.data.clientes)) this.data.clientes = [];
    if (!Array.isArray(this.data.reportes)) this.data.reportes = [];
    if (!this.data.board) { this.data.board = seedBoard(); }
    if (!this.data.seeded && !this.data.clientes.length) { this.data.clientes = seedClientes(); this.data.seeded = true; this.saveAll(); }
    const b = $('#syncBadge');
    b.className = 'sync ' + this.mode;
    b.textContent = this.mode === 'api' ? 'Servidor' : this.mode === 'local' ? 'Local' : 'Sin guardar';
    b.title = this.mode === 'api' ? 'Datos guardados en el servidor' : this.mode === 'local' ? 'Datos guardados solo en este navegador' : 'Los datos se pierden al cerrar';
  },
  save(key) {
    if (this.mode === 'api') {
      fetch('api/db/' + key, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.data[key]) })
        .then(r => { if (!r.ok) throw 0; }).catch(() => toast('No se pudo guardar en el servidor', true));
    } else if (this.mode === 'local') {
      try { localStorage.setItem('agis-db', JSON.stringify(this.data)); } catch (e) { toast('Almacenamiento local lleno', true); }
    }
  },
  saveAll() { ['clientes', 'board', 'reportes', 'config', 'seeded'].forEach(k => this.save(k)); }
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
    return { id, nombre: n, estatus: e, origen: o, servicios: s, saldo, telefono: '', email: '', contacto: '', direccion: '', notas: '', creado: c.toISOString(), modificado: m.toISOString(), demo: true };
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
  { k: 'proyectos', t: 'Proyectos', s: 'Próximamente', icon: 'folder', hue: 'h-slate', soon: true },
  { k: 'monitor', t: 'Monitor', s: 'Próximamente', icon: 'pulse', hue: 'h-rose', soon: true }
];
let current = null;
function buildBand() {
  $('#bandInner').innerHTML = MODULES.map((m, i) => `
    <button class="fbtn ${m.hue} ${m.soon ? 'soon' : ''}" data-mod="${m.k}" style="--i:${i}" ${m.soon ? 'aria-disabled="true"' : ''}>
      <span class="ico">${ICON[m.icon]}</span>
      <span>${esc(m.t)}<small>${esc(m.s)}</small></span>
    </button>`).join('');
  $('#bandInner').addEventListener('click', e => {
    const b = e.target.closest('.fbtn'); if (!b) return;
    const m = MODULES.find(x => x.k === b.dataset.mod);
    if (m.soon) { toast(`${m.t}: disponible en una siguiente iteración`); return; }
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
  const m = MODULES.find(x => x.k === k && !x.soon);
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
  Store.data.clientes.forEach(c => {
    if (hit([c.nombre, c.id, c.contacto, c.origen, c.email, c.telefono, c.direccion, (c.servicios || []).join(' ')].join(' ')))
      out.push({ type: 'cliente', id: c.id, title: c.nombre, sub: `${c.id} · ${ESTATUS.find(s => s.k === c.estatus)?.l || ''}${+c.saldo > 0 ? ' · Saldo ' + MXN.format(c.saldo) : ''}` });
  });
  Store.data.board.columns.forEach(col => col.cards.forEach(k => {
    const cn = clientName(k.clienteId) || k.clienteTxt;
    if (hit([k.title, cn, k.tipo, (k.responsables || []).join(' '), k.direccion, k.notas, col.name].join(' ')))
      out.push({ type: 'actividad', id: k.id, title: k.title, sub: [col.name, k.tipo, cn, k.fecha ? fmtDate(k.fecha) : ''].filter(Boolean).join(' · ') });
  }));
  Store.data.reportes.forEach(r => {
    if (hit([r.folio, r.codigo, r.asunto, r.tipo, r.data?.descripcion].join(' ')))
      out.push({ type: 'reporte', id: r.id, title: `${r.folio || 'Sin folio'} — ${r.asunto || r.tipo}`, sub: `${fmtDate(r.fecha)} · ${r.codigo || ''}` });
  });
  return out;
}
const G_META = {
  cliente: { label: 'Clientes', icon: 'users', bg: '#eef0ff', fg: '#4f46e5' },
  actividad: { label: 'Actividades', icon: 'kanban', bg: '#e9faf6', fg: '#0f8a7a' },
  reporte: { label: 'Reportes de visita', icon: 'pdf', bg: '#fde8eb', fg: '#c0001a' }
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
  if (it.type === 'cliente') { go('clientes'); const c = Store.data.clientes.find(x => x.id === it.id); if (c) clientForm(c); }
  else if (it.type === 'actividad') { go('actividades'); const { col, card } = findCard(it.id); if (card) cardForm(card, col.id); }
  else if (it.type === 'reporte') openReport(it.id);
}

/* ================= CLIENTES ================= */
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
function renderClientes(stage) {
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
      <thead><tr>
        <th class="ck"><input type="checkbox" id="ckAll" aria-label="Seleccionar todos"></th>
        <th class="sortable" data-sort="nombre">Nombre<span class="arr"></span></th>
        <th class="sortable" data-sort="creado">Creado el<span class="arr"></span></th>
        <th class="sortable" data-sort="modificado">Última modificación<span class="arr"></span></th>
        <th class="sortable" data-sort="origen">Origen<span class="arr"></span></th>
        <th>Servicios contratados</th>
        <th class="sortable r" data-sort="saldo">Saldo pendiente<span class="arr"></span></th>
        <th style="width:44px"></th>
      </tr></thead>
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
  $('#ckAll').onchange = e => {
    const ids = pageSlice(clientFiltered()).map(c => c.id);
    ids.forEach(id => e.target.checked ? CS.sel.add(id) : CS.sel.delete(id));
    refreshClientes();
  };

  root.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'new') return clientForm();
    if (act === 'export') return exportClientes();
    if (act === 'dates') { $('#dateDd').classList.toggle('hidden'); $('#filterDd').classList.add('hidden'); return; }
    if (act === 'filters') { $('#filterDd').classList.toggle('hidden'); $('#dateDd').classList.add('hidden'); return; }
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
  $$('#clientes th[data-sort]').forEach(th => {
    const on = th.dataset.sort === CS.sort; th.classList.toggle('sorted', on);
    th.querySelector('.arr').textContent = on ? (CS.dir > 0 ? '↑' : '↓') : '↕';
  });

  const list = clientFiltered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  if (CS.page > pages) CS.page = pages;
  const rows = pageSlice(list);
  const est = k => ESTATUS.find(s => s.k === k)?.l || '';
  $('#cBody').innerHTML = rows.length ? rows.map(c => `
    <tr data-id="${esc(c.id)}" class="${CS.sel.has(c.id) ? 'sel' : ''}">
      <td class="ck"><input type="checkbox" ${CS.sel.has(c.id) ? 'checked' : ''} aria-label="Seleccionar"></td>
      <td><div class="cname"><b>${esc(c.nombre)}</b><small><span class="sdot s-${c.estatus}" title="${esc(est(c.estatus))}"></span>${esc(c.id)}</small></div></td>
      <td data-l="Creado el">${fmtDate(c.creado)}</td>
      <td data-l="Última modificación">${fmtDate(c.modificado)}</td>
      <td data-l="Origen">${esc(c.origen || '—')}</td>
      <td data-l="Servicios" class="svc"><div class="chips">${(c.servicios || []).map(s => `<span class="chip ${svcClass(s)}">${esc(s)}</span>`).join('') || '<span class="meta-line">—</span>'}</div></td>
      <td data-l="Saldo pendiente" class="money ${+c.saldo > 0 ? '' : 'zero'}">${MXN.format(+c.saldo || 0)}</td>
      <td class="act"><button class="icon-btn" data-more="${esc(c.id)}" aria-label="Acciones">${ICON.more}</button></td>
    </tr>`).join('')
    : `<tr><td colspan="8"><div class="empty">${ICON.inbox}<b>Sin resultados</b>${Store.data.clientes.length ? 'Ajusta la búsqueda o los filtros.' : 'Registra tu primer cliente con “Crear nuevo”.'}</div></td></tr>`;

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
      ${!isNew ? `<div class="meta-line">ID <b>${esc(c.id)}</b> · Creado ${fmtDate(c.creado)} · Modificado ${fmtDate(c.modificado)}</div>` : `<div class="meta-line">Se asignará el ID <b>${nextClientId()}</b> al guardar.</div>`}
      <div class="grid2">
        <div class="field span2"><label>Nombre / Proyecto <span class="req">*</span></label><input class="input" name="nombre" value="${esc(c.nombre)}" placeholder="Ej. Residencia Bosques de las Lomas" autofocus></div>
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
        const now = new Date().toISOString();
        const rec = {
          nombre, estatus: f('estatus').value, origen: f('origen').value, contacto: f('contacto').value.trim(),
          telefono: f('telefono').value.trim(), email: f('email').value.trim(), saldo: Math.max(0, parseFloat(f('saldo').value) || 0),
          direccion: f('direccion').value.trim(), servicios: SERVICIOS.filter(s => sel.has(s)), notas: f('notas').value.trim(), modificado: now
        };
        if (isNew) { Store.data.clientes.unshift({ id: nextClientId(), creado: now, ...rec }); toast('Cliente registrado'); }
        else { const i = Store.data.clientes.findIndex(x => x.id === c.id); Store.data.clientes[i] = { ...Store.data.clientes[i], ...rec, demo: false }; toast('Cambios guardados'); }
        Store.save('clientes'); close(); refreshClientes();
      };
    }
  });
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
  Store.save('clientes'); Store.save('board'); refreshClientes(); toast('Datos de ejemplo eliminados');
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
  const b = $('#board'); if (!b) return;
  const sl = b.scrollLeft, today = todayISO();
  b.innerHTML = Store.data.board.columns.map(col => {
    const cards = col.cards.filter(cardVisible);
    const ct = tintStyle(col.color);
    return `<div class="kcol ${ct ? 'tinted' : ''}" data-col="${col.id}" style="${ct}">
      <div class="khead"><h3><span class="t" data-rename="${col.id}" title="Clic para renombrar">${esc(col.name)}</span><span class="badge">${col.cards.length}</span></h3>
        <button class="icon-btn" data-colmenu="${col.id}" aria-label="Opciones de columna">${ICON.more}</button></div>
      <div class="klist">${cards.map(k => {
        const cname = clientName(k.clienteId) || k.clienteTxt;
        const late = !col.done && k.fecha && k.fecha < today;
        const kt = tintStyle(k.color);
        const reps = (k.reportIds || []).map(id => Store.data.reportes.find(r => r.id === id)).filter(Boolean);
        return `<article class="kcard ${col.done ? 'done' : ''} ${kt ? 'tinted' : ''}" data-id="${k.id}" style="${kt}">
          <div class="kt"><span class="ring"></span><b>${esc(k.title)}</b></div>
          ${cname ? `<div class="kclient">${ICON.building}${esc(cname)}</div>` : ''}
          <div class="kmeta">
            ${k.tipo ? `<span class="ktag"><i style="background:${tipoColor(k.tipo)}"></i>${esc(k.tipo)}</span>` : ''}
            ${k.fecha ? `<span class="ktag ${late ? 'late' : ''}">${ICON.cal}${fmtShort(k.fecha)}${k.hora ? ' · ' + esc(k.hora) : ''}</span>` : ''}
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
function cardForm(k, colId) {
  const isNew = !k;
  k = k ? { ...k, reportIds: [...(k.reportIds || [])] } : { title: '', tipo: 'Visita técnica', clienteId: '', clienteTxt: '', fecha: todayISO(), hora: '', responsables: [], direccion: '', notas: '', color: 'none', reportIds: [] };
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
        <button type="button" class="icon-btn" data-ropen="${r.id}" title="Abrir reporte">${ICON.open}</button>
        <button type="button" class="icon-btn" data-rdl="${r.id}" title="Descargar PDF">${ICON.download}</button>
        <button type="button" class="icon-btn danger" data-runlink="${r.id}" title="Desvincular">${ICON.unlink}</button></div>`).join('') || '<span class="meta-line">Sin reportes vinculados.</span>'}</div>
      <div class="replink-add">
        <select class="input" id="repSel"><option value="">${avail.length ? 'Vincular reporte existente…' : 'No hay otros reportes guardados'}</option>${avail.map(r => `<option value="${r.id}">${esc(r.folio || 'Sin folio')} · ${fmtDate(r.fecha)} · ${esc(r.codigo || r.asunto || '')}</option>`).join('')}</select>
        <button type="button" class="btn" data-newrep>${ICON.plus}Crear reporte</button>
      </div>`;
  };
  openModal({
    title: isNew ? 'Nueva actividad' : 'Editar actividad', size: 'wide',
    body: `<div class="grid2">
      <div class="field span2"><label>Título <span class="req">*</span></label><input class="input" name="title" value="${esc(k.title)}" placeholder="Ej. Visita técnica — falla en audio de terraza" autofocus></div>
      <div class="field"><label>Tipo</label><select class="input" name="tipo">${TIPOS.map(t => `<option ${k.tipo === t.k ? 'selected' : ''}>${esc(t.k)}</option>`).join('')}</select></div>
      <div class="field"><label>Columna</label><select class="input" name="col">${cols.map(c => `<option value="${c.id}" ${c.id === colId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field span2"><label>Cliente</label><select class="input" name="clienteId"><option value="">— Sin cliente registrado —</option>${clientes.map(c => `<option value="${esc(c.id)}" ${k.clienteId === c.id ? 'selected' : ''}>${esc(c.nombre)} · ${esc(c.id)}</option>`).join('')}</select></div>
      <div class="field span2" id="ctxtWrap" ${k.clienteId ? 'hidden' : ''}><label>Cliente / lugar (texto libre)</label><input class="input" name="clienteTxt" value="${esc(k.clienteTxt)}" placeholder="Si aún no está dado de alta"></div>
      <div class="field"><label>Fecha</label><input class="input" type="date" name="fecha" value="${esc(k.fecha)}"></div>
      <div class="field"><label>Hora</label><input class="input" type="time" name="hora" value="${esc(k.hora)}"></div>
      <div class="field span2"><label>Responsables</label><div class="toggle-chips" id="pChips">${peopleChips()}</div></div>
      <div class="field span2"><label>Dirección</label><input class="input" name="direccion" value="${esc(k.direccion)}" placeholder="Calle, número, colonia, referencias de acceso"></div>
      <div class="field span2"><label>Notas</label><textarea class="input" name="notas">${esc(k.notas)}</textarea></div>
      <div class="field span2"><label>Reportes de visita</label><div id="repLinks">${repLinksHTML()}</div></div>
      <div class="field span2"><label>Color de la tarjeta</label><div id="cardSw">${swatchesHTML(color)}</div></div>
    </div>`,
    foot: `${!isNew ? `<button class="btn danger left" data-del>${ICON.trash}Eliminar</button>` : ''}<button class="btn" data-x>Cancelar</button><button class="btn primary" data-save>${ICON.save}Guardar</button>`,
    onMount(m, close) {
      const f = n => m.querySelector(`[name=${n}]`);
      const redrawPeople = () => { m.querySelector('#pChips').innerHTML = peopleChips(); };
      const redrawReps = () => { m.querySelector('#repLinks').innerHTML = repLinksHTML(); };
      f('clienteId').onchange = e => { m.querySelector('#ctxtWrap').hidden = !!e.target.value; };
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
          R.asunto = card.title; R.fecha = card.fecha || todayISO(); R.descripcion = card.notas || '';
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
        const rec = { title, tipo: f('tipo').value, clienteId: f('clienteId').value, clienteTxt: f('clienteId').value ? '' : f('clienteTxt').value.trim(), fecha: f('fecha').value, hora: f('hora').value, responsables: [...resp], direccion: f('direccion').value.trim(), notas: f('notas').value.trim(), color, reportIds: [...k.reportIds], updated: new Date().toISOString() };
        const toCol = cols.find(c => c.id === f('col').value);
        if (!cardId) { cardId = uid(); toCol.cards.push({ id: cardId, created: new Date().toISOString(), ...rec }); if (!silent) toast('Actividad creada'); }
        else {
          const { col } = findCard(cardId); const idx = col.cards.findIndex(x => x.id === cardId);
          const merged = { ...col.cards[idx], ...rec, demo: false };
          if (col.id === toCol.id) col.cards[idx] = merged; else { col.cards.splice(idx, 1); toCol.cards.push(merged); }
          if (!silent) toast('Actividad actualizada');
        }
        Store.save('board'); drawBoard();
        return true;
      }
      m.querySelector('[data-save]').onclick = () => { if (save(false)) close(); };
    }
  });
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
    tipo: 'Reporte de Visita Técnica', folio: '', fecha: todayISO(), asunto: '', preparado: 'Ing. Luis Gómez', codigo: '', clienteId: '',
    participantes: 'L. GÓMEZ (luis.gomez@arquitechtura.com)', distribucion: '', descripcion: '', componentes: [],
    concIntro: 'Con base en las pruebas realizadas, se concluye lo siguiente:', conclusiones: [''], recomendacion: '',
    responsable: '', nota: 'Arquitechtura AGIS queda a disposición para generar propuesta de Póliza de Mantenimiento de Sistemas Especiales.',
    prestNombre: 'Ing. Luis Gómez', prestCargo: 'Gerente de Integraciones – Arquitechtura AGIS', prestFecha: todayISO(), prestFirma: '',
    recNombre: '', recCargo: '', recFecha: todayISO(), recFirma: '', savedId: null, cardId: null
  };
}
let R = null;
function loadDraft() { try { const s = localStorage.getItem('agis-report-draft'); if (s) return { ...newReport(), ...JSON.parse(s) }; } catch (_) {} return newReport(); }
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
          <div class="field span2"><label>Código (cliente / proyecto) <span class="req">*</span></label><input class="input" data-f="codigo" list="cliList" placeholder="Ej. Hotel TRU Aeropuerto by Hilton"><datalist id="cliList">${clientes.map(c => `<option value="${esc(c.nombre)}">`).join('')}</datalist></div>
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
        <div class="sec-h"><span class="n">03</span><h2>Conclusión y dictamen</h2></div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="field"><label>Introducción</label><input class="input" data-f="concIntro"></div>
          <div class="field"><label>Conclusiones</label><div class="bullets" id="bullets"></div>
            <button class="btn sm ghost" data-act="addbul" style="align-self:flex-start;margin-top:4px">${ICON.plus}Agregar conclusión</button></div>
          <div class="field"><label>Recomendación</label><textarea class="input" data-f="recomendacion" rows="3" placeholder="Se recomienda…"></textarea></div>
        </div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">04</span><h2>Acciones y seguimiento</h2></div>
        <div class="grid2">
          <div class="field span2"><label>Responsable del seguimiento</label><input class="input" data-f="responsable" placeholder="Ej. Equipo de TI del cliente"></div>
          <div class="field span2"><label>Nota de Arquitechtura</label><textarea class="input" data-f="nota" rows="2"></textarea></div>
        </div>
      </div>

      <div class="card">
        <div class="sec-h"><span class="n">05</span><h2>Firmas de conformidad</h2></div>
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
    const bi = e.target.dataset.bi;
    if (bi !== undefined) { R.conclusiones[+bi] = e.target.value; saveDraft(); updateProgress(); }
  });
  root.addEventListener('change', e => { if (e.target.dataset.f === 'tipo') saveDraft(); });
  root.addEventListener('click', e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'folio') { R.folio = suggestFolio(); $('[data-f=folio]').value = R.folio; saveDraft(); return; }
    if (a === 'addcomp') return compForm();
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
  drawComps(); drawBullets(); drawSaved();
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
  updateProgress();
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
        if (isNew) R.componentes.push(rec); else R.componentes[i] = rec;
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
  return [
    ['Datos generales', !!(R.fecha && R.asunto.trim() && R.codigo.trim())],
    ['Descripción de la falla', !!R.descripcion.trim()],
    ['Diagnóstico por componente', R.componentes.length > 0],
    ['Conclusiones', R.conclusiones.some(s => s.trim())],
    ['Seguimiento', !!R.responsable.trim()],
    ['Firma del prestador', !!R.prestFirma],
    ['Firma de quien recibe', !!R.recFirma]
  ];
}
function updateProgress() {
  if (!$('#checklist')) return;
  const ch = reportChecks(), ok = ch.filter(c => c[1]).length;
  $('#progBar').style.width = Math.round(ok / ch.length * 100) + '%';
  $('#progTxt').textContent = `${ok}/${ch.length}`;
  $('#checklist').innerHTML = ch.map(([l, v]) => `<li class="${v ? 'ok' : ''}">${l}</li>`).join('');
}
function validateReport() {
  const req = ['fecha', 'asunto', 'codigo', 'descripcion'];
  let first = null;
  req.forEach(f => { const el = $(`[data-f=${f}]`); if (!String(R[f] || '').trim()) { el.classList.add('invalid'); first = first || el; } });
  if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => first.focus({ preventScroll: true }), 300); toast('Completa los campos obligatorios', true); return false; }
  return true;
}
function saveReport(notify) {
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
function generatePDF() {
  if (!validateReport()) return;
  if (!window.jspdf || !window.jspdf.jsPDF) { toast('No se pudo cargar el generador de PDF (revisa la conexión)', true); return; }
  if (!R.recFirma && !R._warned) { R._warned = true; toast('Aviso: falta la firma de quien recibe. Vuelve a pulsar para generar así.'); return; }
  delete R._warned;
  saveReport(false);
  try {
    const doc = buildReportPDF(R, { jsPDF: window.jspdf.jsPDF, logos: window.AGIS_LOGOS });
    const name = `${(R.folio || 'Reporte').replace(/[^\w\-]+/g, '_')}.pdf`;
    doc.save(name);
    toast('PDF generado: ' + name);
  } catch (err) { console.error(err); toast('Error al generar el PDF', true); }
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
  R = { ...newReport(), ...r.data, savedId: r.id }; saveDraft();
  if (current === 'reporte') renderReporte($('#stage')); else go('reporte');
  toast('Reporte abierto: ' + (r.folio || ''));
}
function downloadReport(id) {
  const r = Store.data.reportes.find(x => x.id === id); if (!r) return;
  if (!window.jspdf) return toast('No se pudo cargar el generador de PDF', true);
  try { buildReportPDF(r.data, { jsPDF: window.jspdf.jsPDF, logos: window.AGIS_LOGOS }).save(`${(r.folio || 'Reporte').replace(/[^\w\-]+/g, '_')}.pdf`); toast('Descargando ' + (r.folio || 'reporte')); }
  catch (e) { console.error(e); toast('Error al generar el PDF', true); }
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
    { label: 'Duplicar como nuevo', icon: 'copy', run: () => { R = { ...newReport(), ...r.data, savedId: null, cardId: null, folio: '', prestFirma: '', recFirma: '', fecha: todayISO(), prestFecha: todayISO(), recFecha: todayISO() }; saveDraft(); renderReporte($('#stage')); } },
    '-',
    { label: 'Eliminar', icon: 'trash', danger: true, run: async () => { if (!await confirmDialog('Eliminar reporte', `¿Eliminar el reporte <b>${esc(r.folio)}</b>?`)) return; Store.data.reportes = Store.data.reportes.filter(x => x.id !== id); if (R.savedId === id) R.savedId = null; Store.data.board.columns.forEach(c => c.cards.forEach(k => { if (k.reportIds) k.reportIds = k.reportIds.filter(x => x !== id); })); Store.save('reportes'); Store.save('board'); drawSaved(); } }
  ]);
}

/* ================= Arranque ================= */
(async function boot() {
  buildBand();
  if (window.AGIS_LOGOS) $('#topLogo').src = AGIS_LOGOS.wordmark;
  $('#menuBtn').onclick = () => { if (current) go(null); else setBand(!$('#band').classList.contains('open')); };
  $('#brandLink').onclick = e => { e.preventDefault(); go(null); };
  await Store.init();
  migrateData();
  const h = location.hash.slice(1);
  if (MODULES.some(m => m.k === h && !m.soon)) go(h); else go(null);
  window.addEventListener('hashchange', () => { const k = location.hash.slice(1); if (k !== (current || '')) go(k || null); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !current && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !modalStack.length) { e.preventDefault(); $('#gInput')?.focus(); }
  });
})();
