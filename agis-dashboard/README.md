# Arquitechtura AGIS · Dashboard (iteración 1)

Módulos: **Home** (banda de botones flotantes), **Clientes**, **Actividades** (tablero tipo Trello) y **Reporte Visita** (formulario → PDF con firmas).

## Estructura
```
server.js        Servidor Node ≥18 sin dependencias (estáticos + API JSON)
public/          index.html · app.css · app.js · pdf.js
Dockerfile       Imagen para Easypanel
data/            (se crea solo) db.json + backups/ diarios (30 días)
```

## Despliegue en Easypanel (VPS Hostinger)
1. Sube esta carpeta a un repo de GitHub (o usa "Upload" en Easypanel).
2. Easypanel → tu proyecto → **+ Service → App** → origen: el repo, build: **Dockerfile**.
3. **Environment**:
   ```
   AUTH_USER=agis
   AUTH_PASS=una-contraseña-fuerte
   ```
   (Si los dejas vacíos, el dashboard queda abierto a cualquiera con la URL.)
4. **Mounts** → Volume: nombre `agis-data`, mount path `/data`  ← sin esto se pierden los datos en cada deploy.
5. **Domains** → puerto `3000`, agrega tu dominio/subdominio (Easypanel genera HTTPS).
6. Deploy. Prueba: `https://tu-dominio/api/health` → `{"ok":true}`.

## Local
```
node server.js        # http://localhost:3000
```

## API
- `GET  /api/db` → todo el estado
- `PUT  /api/db/{clientes|board|reportes|config}` → reemplaza la colección

Si la API no responde, la app trabaja en modo **Local** (localStorage del navegador); el indicador de la barra superior muestra el modo.

## Notas
- ID de cliente: `ddmmaa-##` con la fecha de creación y consecutivo del día.
- Folio sugerido del reporte: `XXX-TIPO-###` (p. ej. `TRU-IDO-001`).
- Arrastrar tarjetas: mouse (clic y arrastra) o touch (mantén presionado ~0.3 s y arrastra).
- Siguientes pasos sugeridos: importación desde Trello (API), usuarios/roles, módulos Proyectos y Monitor.
