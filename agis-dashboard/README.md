# Arquitechtura AGIS · Dashboard (iteración 2)

Módulos: **Home** (banda de botones flotantes), **Clientes**, **Actividades** (tablero tipo Trello) y **Reporte Visita** (formulario → PDF con firmas).

## Estructura
```
server.js        Servidor Node ≥18 sin dependencias (estáticos + API JSON)
public/          index.html · app.css · app.js · pdf.js
Dockerfile       Imagen para Easypanel
data/            (se crea solo) db.json, users.json, uploads/ y backups/ diarios (30 días)
```

## Despliegue en Easypanel (VPS Hostinger)
1. Sube esta carpeta a un repo de GitHub (o usa "Upload" en Easypanel).
2. Easypanel → tu proyecto → **+ Service → App** → origen: el repo, build: **Dockerfile**.
3. **Environment**:
   ```
   AUTH_USER=admin              # administrador principal (no se puede borrar desde la app)
   AUTH_PASS=una-contraseña-fuerte
   AUTH_NAME=Luis Gómez         # opcional: nombre que se muestra
   SESSION_DAYS=7               # opcional: duración de la sesión
   ```
   Sin AUTH_USER/AUTH_PASS nadie puede entrar (el servidor lo avisa en el log).
4. **Mounts** → Volume: nombre `agis-data`, mount path `/data`  ← sin esto se pierden los datos en cada deploy.
5. **Domains** → puerto `3000`, agrega tu dominio/subdominio (Easypanel genera HTTPS).
6. Deploy. Prueba: `https://tu-dominio/api/health` → `{"ok":true}`.

## Local
```
node server.js        # http://localhost:3000
```

## Seguridad
- Login con sesión (cookie HttpOnly, SameSite=Lax, Secure bajo HTTPS).
- **5 intentos fallidos por IP → bloqueo de 15 minutos** (la IP se toma de `X-Forwarded-For` que pone Easypanel/Traefik; si expones el puerto directo sin proxy define `TRUST_PROXY=0`).
- Contraseñas de usuarios guardadas con scrypt + sal en `/data/users.json`.
- Permisos por módulo validados en el servidor (no solo en la pantalla).
- Rechaza peticiones de escritura desde otros dominios; encabezados CSP, X-Frame-Options, HSTS.

## Usuarios
Menú del usuario (arriba a la derecha) → **Administrar usuarios** (solo administradores).
Perfil *Administrador* = todos los módulos + gestión de usuarios. *Colaborador* = solo los módulos marcados.
**Cambiar de usuario** / **Cerrar sesión** en el mismo menú.

## API
- `POST /api/login` · `POST /api/logout` · `GET /api/me`
- `GET /api/db` (filtrado por permisos) · `PUT /api/db/{clientes|board|config|reportes|colPrefs}`
- `POST /api/upload` (fotos del reporte → `/data/uploads`, servidas solo con sesión)
- `GET|POST /api/users` · `PUT|DELETE /api/users/{usuario}` (admin)

Sin servidor (vista previa) la app trabaja en modo local con usuario `admin` / `admin`.

## Notas
- ID de cliente: `ddmmaa-##` con la fecha de creación y consecutivo del día.
- Folio sugerido del reporte: `XXX-TIPO-###` (p. ej. `TRU-IDO-001`).
- Arrastrar tarjetas: mouse (clic y arrastra) o touch (mantén presionado ~0.3 s y arrastra).
- Siguientes pasos sugeridos: importación desde Trello (API), usuarios/roles, módulos Proyectos y Monitor.
