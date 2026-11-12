# 5 MENTARIOS SOCIAL HUB

Aplicación privada de marketing, comunicación y organización de **Heineken 5mentarios** (Arucas).
Calendario editorial, publicaciones con flujo de aprobación y versiones, biblioteca conectada a Google Drive,
tareas (lista y Kanban), chat interno, comentarios, notificaciones (en la app y push), historial y buscador.

- **Frontend**: web estática (Preact + htm, sin compilación) → se publica con GitHub Pages. Instalable como app (PWA).
- **Backend**: Supabase (Auth, Postgres con RLS, Realtime, Storage, Edge Functions).
- **Drive**: Google Identity Services + Drive API v3 (solo lectura; se guardan referencias, no copias).

Enlace privado (cuando se fusione en la rama publicada de GitHub Pages):
**https://esdhoops-png.github.io/Web/social-hub/** — solo entra quien tenga usuario y contraseña.

---

## 1. Puesta en marcha (≈ 20 minutos, una sola vez)

### 1.1 Crear la base de datos (Supabase)
1. Entra en <https://supabase.com> → **New project** (plan gratuito). Región: *West EU (Ireland)* o *Frankfurt*. Guarda la contraseña de la BD.
2. **SQL Editor → New query** → pega el contenido completo de [`supabase/setup.sql`](supabase/setup.sql) → **Run**.
   Crea tablas, permisos (RLS), flujo de aprobación, notificaciones, historial, bucket privado de archivos,
   recordatorio diario de fechas límite y las 12 categorías iniciales de la biblioteca.
3. **Authentication → Sign In / Providers → Email**: deja *Email* activado y **desactiva "Allow new users to sign up"** (app privada).
4. **Authentication → URL Configuration**:
   - *Site URL*: `https://esdhoops-png.github.io/Web/social-hub/`
   - *Redirect URLs*: añade `https://esdhoops-png.github.io/Web/social-hub/**`

### 1.2 Crear los dos usuarios
**Authentication → Users → Add user → Create new user** (marca *Auto Confirm User*):
1. **Primero** el responsable de marketing (email + contraseña). El primer usuario se convierte automáticamente en
   *Marketing + Administrador*.
2. Después el propietario.

Luego, en **SQL Editor**, ejecuta (cambiando los emails y nombres):
```sql
update public.profiles set full_name = 'Nombre del responsable', role = 'marketing'
  where email = 'marketing@ejemplo.com';
update public.profiles set full_name = 'Nombre del propietario', role = 'owner', can_approve = true, color = '#F2A541'
  where email = 'propietario@ejemplo.com';
```
(También se puede hacer desde la app: *Configuración → Equipo y permisos*, con la cuenta de marketing.)

> Por seguridad **nadie puede cambiarse sus propios permisos**: quien prepara el contenido no puede autoaprobarse.

### 1.3 Conectar la app con Supabase
En Supabase → **Project Settings → API** copia *Project URL* y la clave **anon / publishable** y pégalas en
[`config.js`](config.js):
```js
supabaseUrl: 'https://xxxxxxxx.supabase.co',
supabaseAnonKey: 'eyJ…',
```
La clave *anon* es pública por diseño (la protección la dan el login y las políticas RLS).
**Nunca** pongas la *service_role key* en la web.

### 1.4 Publicar
Fusiona esta rama en la rama que publica GitHub Pages (la misma que ya sirve `taxi-telde/`).
Abre el enlace, entra con cada usuario y en **Configuración → Calendario editorial → Importar** carga el plan
del 11 de noviembre al 31 de diciembre (51 elementos, 21 tareas y 92 referencias de Drive). Se puede pulsar más
de una vez: no duplica.

---

## 1.5 Marca, generador y plan editorial
- **Generador y marca** (menú lateral): plantillas de la casa (programación del finde + canal de WhatsApp, story «Hoy en 5mentarios»,
  monólogos, tardeo, carrusel de fotos, partido grande / Champions, sorteo y guiones de reel). Se rellenan con datos reales; lo que falta
  sale como **[POR CONFIRMAR]** y no se inventa nada. Desde ahí se crea la publicación en el calendario con el caption y el brief de diseño.
- **Guía de marca**: colores, tipografías, logo, estilos aprobados, lo que no gusta, tono, CTAs, hashtags, formatos y plan semanal.
  Fuente única: `00_TRANSFERENCIA_HEINEKEN_5MENTARIOS.md` (11 nov 2026), resumida en [`app/lib/brand.js`](app/lib/brand.js).
- **Plan editorial v2** (`app/plan/editorial-plan.js`): programación real de noviembre, diseños ya entregados y ritmo del planificador.
  Al importarlo sustituye el plan anterior, salvo los elementos que ya se hayan editado, comentado o tengan diseño subido.

## 1.6 Estudio creativo
**Activarlo:** pega [`supabase/estudio.sql`](supabase/estudio.sql) en Supabase → SQL Editor → Run (se puede repetir sin problema).

- **Motor de diseño** (`app/studio/engine.js`): documento por capas (texto, foto, logo, formas, pastillas, brillos, textura, rayos)
  dibujado en Canvas 2D. Exporta **PNG/JPG reales** en 1080×1350, 1080×1920, 1080×1080 y 1920×1080, a ×1/×2/×3, y los carruseles en **ZIP**.
- **Plantillas** (`app/studio/templates.js`): recreadas y editables a partir de los originales (Champions partido y portada, cartel de
  Halloween/tardeo) y de los estilos de la guía (Monólogos, story «Hoy», line-up, programación, «Así fue…», menús de Navidad, marca).
  **Estilo de referencia: los PSD del carrusel de noviembre.** Plantillas recreadas de ellos: «Artista del día», «Lista con titular»
  (Champions en noviembre), «Tardeo · palabra repetida», «Fin de semana · dos días» y «Calendario del mes»; los menús de Navidad usan
  ese mismo estilo claro. Todos los diseños del plan de marketing se producen con estas plantillas. Si un diseño se generó con el estilo
  anterior y nadie lo ha retocado (ni aprobado, programado o publicado), al volver a ejecutar el plan se guarda una versión nueva con el
  estilo de los PSD; los retocados a mano no se tocan.
- **Diseños originales** (`app/studio/originals.js`): solo archivos verificados en Drive, con formato, colores medidos, composición y qué se
  reutiliza. Los PNG/JPG se marcan como **imagen plana sin capas**; la variante se hace encima del original, que se conserva.
- **Editor**: seleccionar, mover, redimensionar, texto, tipografía, tamaño, color, foto, fondo, logo y decorativos; deshacer; varias diapositivas;
  cambio de formato; guardar como plantilla. Cada guardado es una **versión** nueva (las anteriores no se modifican).
- **Calendario**: botón «Crear diseño» en cada publicación; al exportar se guarda en Storage, se añade como nueva versión del diseño de la
  publicación (con aprobación si se marca) y a la Biblioteca. «Editar en el Estudio» reabre el diseño.
- **Instrucciones escritas**: asistente por reglas (sin IA) que elige plantilla, formato y datos.
- **Almacenamiento**: `hub/studio/<campaña>/<año-mes>/<id>/v<n>/…` + tablas `creatives` y `creative_versions` (categoría, campaña, formato,
  publicación, versión), con los mismos permisos para los dos usuarios.
- **Vídeo** (`app/studio/video.js`): escenas con fotos/vídeos, textos, subtítulos, transiciones, música autorizada y cierre con el logo;
  se exporta en el navegador (MP4 en Chrome/Edge/Safari actuales; WebM si el navegador no admite MP4). El render es en tiempo real.
- **Stories animadas** (`app/studio/story-motion.js` + `app/marketing/video-plan.js`): tres estilos recreados de los vídeos reales:
  «Esta semana» (story del 11 nov: rayos verdes, escena por día), «Hoy» (story del sábado 31: una escena por actuación con la hora en
  contorno, foto recortada y nombre, resumen y logo) y «Partido» (stories de Champions del 3 y 4 nov). Las fotos de artistas son los
  recortes sin fondo de los PSD de noviembre (`media/artistas/`), solo de artistas identificados en el propio PSD. Los MP4 de 1080×1920 (H.264, 30 fps)
  de la programación confirmada están en `media/stories/`; al ejecutar el plan se guardan en Storage, se vinculan a su publicación y quedan
  pendientes de aprobación. El sábado 21 nov no lleva vídeo hasta que se confirme quién toca. Para cambiar un texto se edita `video-plan.js`
  y se vuelven a generar (también se pueden grabar en el navegador con `recordStory`).
- **Imágenes con IA** (`supabase/functions/ai-image`): adaptadores OpenAI (gpt-image-1) y Stability. Requiere clave del proveedor:
  ```bash
  npx supabase functions deploy ai-image
  ```
  ```bash
  npx supabase secrets set AI_IMAGE_PROVIDER=openai OPENAI_API_KEY=sk-...
  ```
  Sin clave, el estudio funciona con plantillas y fotos y muestra que la IA no está configurada (no simula nada).

## 1.7 Plan de marketing (12 nov – 31 dic 2026)
Menú **Plan de marketing**: panel de control (calculado con los datos reales), auditoría, estrategia, 8 campañas y **Ejecutar plan**.
Al ejecutarlo (con vuestra sesión): importa el calendario sin duplicar (ni por clave ni con publicaciones hechas a mano el mismo día),
actualiza lo que nadie ha tocado con la información nueva confirmada, genera los diseños con información completa (PNG reales en Storage,
vinculados a su publicación, en la Biblioteca y **pendientes de aprobación**) y guarda como **borrador editable** lo que tiene datos pendientes.
Se puede repetir: no duplica. Código: `app/marketing/` y `app/plan/importer.js`. Prueba: `tests/marketing.e2e.cjs`.

## 2. Google Drive (biblioteca dentro de la app)

La app lee la carpeta **«Grupo 5mentarios»** de Drive con la cuenta de Google de cada persona (permiso de solo
lectura). Mientras no se configure, se puede adjuntar subiendo archivos o pegando enlaces de Drive.

1. <https://console.cloud.google.com> → crea un proyecto (p. ej. *5mentarios-social-hub*).
2. **APIs y servicios → Biblioteca** → busca **Google Drive API** → *Habilitar*.
3. **APIs y servicios → Pantalla de consentimiento de OAuth** (Google Auth Platform):
   - Tipo de usuario **Externo**, nombre «5 Mentarios Social Hub», tu email de soporte.
   - *Audiencia / Usuarios de prueba*: añade el Gmail del responsable de marketing **y** el del propietario.
     (En modo *Prueba* no hace falta verificación de Google; admite hasta 100 usuarios de prueba.)
   - *Acceso a datos / Permisos*: añade `https://www.googleapis.com/auth/drive.readonly`.
4. **Credenciales → Crear credenciales → ID de cliente de OAuth** → tipo **Aplicación web**:
   - *Orígenes de JavaScript autorizados*: `https://esdhoops-png.github.io`
     (y `http://localhost:5173` si quieres probar en local).
   - No hacen falta URI de redirección.
5. Copia el **ID de cliente** (`…apps.googleusercontent.com`) en `config.js` → `googleClientId`.
6. En Drive, **comparte la carpeta «Grupo 5mentarios» con la cuenta de Google del propietario** (lector o editor).
7. En la app: *Biblioteca → Google Drive → Conectar Google Drive*. La carpeta raíz y los accesos directos ya
   vienen configurados (se pueden cambiar en *Configuración → Google Drive*).

Cómo funciona: los archivos se muestran desde Drive (miniatura y vista previa). Al guardarlos en una categoría o
adjuntarlos a una publicación solo se guarda el **ID del archivo**. «Abrir en Drive» abre el original.
Los archivos subidos desde la app (máx. 50 MB) van al bucket privado `hub` de Supabase Storage.

---

## 3. Notificaciones

- **En la app (tiempo real)**: funcionan desde el primer momento. Las genera la base de datos (triggers), no la
  interfaz: mensajes, comentarios, diseños nuevos, tareas asignadas/completadas, cambios de fecha, solicitudes de
  aprobación, aprobaciones, cambios solicitados, eventos nuevos, contenido nuevo en la biblioteca y publicaciones
  marcadas como publicadas. Cada persona elige qué recibe en *Configuración → Notificaciones*.
- **Fechas límite**: `pg_cron` revisa cada día a las 08:00 (hora canaria) las tareas y publicaciones que vencen hoy o mañana.
- **Push con la app cerrada** (móvil y ordenador): estándar Web Push con claves VAPID, sin servicios de terceros:
  1. Genera las claves (en cualquier ordenador con Node): `npx web-push generate-vapid-keys`
  2. Instala la CLI de Supabase y despliega la función:
     ```bash
     npx supabase login
     ```
     ```bash
     npx supabase link --project-ref TU_REF_DE_PROYECTO
     ```
     ```bash
     npx supabase functions deploy send-push --no-verify-jwt
     ```
     ```bash
     npx supabase secrets set PUSH_SECRET=una-cadena-larga-aleatoria VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:tu@email.com
     ```
  3. En **SQL Editor** (mismo `PUSH_SECRET`):
     ```sql
     insert into private.settings (key, value) values
       ('push_url', 'https://TU_REF_DE_PROYECTO.supabase.co/functions/v1/send-push'),
       ('push_secret', 'una-cadena-larga-aleatoria')
     on conflict (key) do update set value = excluded.value;
     ```
  4. Pon la clave **pública** VAPID en `config.js` → `vapidPublicKey`.
  5. En cada dispositivo: *Configuración → Notificaciones → Activar notificaciones*.
     En **iPhone** primero hay que instalar la app (Safari → Compartir → *Añadir a pantalla de inicio*) y abrirla desde el icono (iOS 16.4+).

### Invitar a más personas (opcional)
Despliega la función de invitaciones: `npx supabase functions deploy invite-user`.
Después, el administrador invita desde *Configuración → Equipo y permisos* (llega un email para crear contraseña).
Sin la función, basta con crear el usuario en *Authentication → Users* como en el paso 1.2.

---

## 4. Roles y permisos (aplicados en la base de datos)

| Acción | Marketing | Propietario | Colaborador |
|---|---|---|---|
| Ver todo (calendario, publicaciones, biblioteca, tareas, chat) | ✅ | ✅ | ✅ |
| Crear/editar publicaciones, eventos y tareas, comentar, chatear | ✅ | ✅ | ✅ |
| Subir diseños/versiones, gestionar biblioteca y categorías | ✅ | ✅ (categorías: solo marketing/admin) | ✅ |
| **Aprobar o pedir cambios** | ❌ | ✅ (`can_approve`) | ❌ |
| Programar/publicar contenido sin aprobación | ❌ (bloqueado) | ❌ (bloqueado) | ❌ |
| Gestionar equipo y carpeta de Drive | ✅ (admin) | si se le hace admin | ❌ |

Una publicación solo pasa a *Aprobado* con el botón **Aprobar** (queda registrado quién y cuándo); si se sube
una versión nueva de algo aprobado, vuelve a *En revisión*. Las versiones anteriores nunca se borran.
*Publicado* solo se marca a mano tras publicarlo de verdad (con enlace opcional).

---

## 5. Instagram (estudio de integración)
Publicar directamente es viable con la **Instagram Graph API – Content Publishing** (cuenta profesional
vinculada a una página de Facebook, app de Meta con permiso `instagram_content_publish` revisado por Meta,
límite de 50 publicaciones/24 h; stories con restricciones). Requiere servidor (Edge Function) para guardar el
token de Meta. Mientras tanto: la app organiza y aprueba; la publicación se hace en Instagram/Meta Business Suite
y se marca como publicada aquí.

---

## 6. Desarrollo y pruebas

Requisitos: Node 20+, Docker.
```bash
cd social-hub && npx supabase start
```
```bash
python3 -m http.server 5173
```
Para usar la base local, apunta `config.js` a `http://127.0.0.1:54321` con la *anon key* que muestra `npx supabase status`.

Pruebas (con Supabase local en marcha):
```bash
cd tests && npm install
```
```bash
SUPABASE_ANON_KEY=... SUPABASE_SERVICE_KEY=... node api.test.mjs
```
```bash
SUPABASE_ANON_KEY=... node e2e.cjs
```
- `api.test.mjs` — 24 comprobaciones del backend con dos usuarios reales (permisos, aprobación, versiones, notificaciones, chat, historial, cron).
- `e2e.cjs` — 20 pasos en dos navegadores a la vez (marketing en ordenador, propietario en iPhone): importación del plan,
  arrastrar en calendario y Kanban, formulario con validación, subida de versiones, pedir cambios, aprobar, comentarios,
  chat con imagen y «leído», eventos, buscador, biblioteca, preferencias y persistencia tras cerrar sesión.
- `studio.e2e.cjs` — 14 pasos del Estudio: plantillas, instrucción escrita, edición, versiones, PNG/JPG/ZIP reales en Storage, vínculo con
  publicación y aprobación, reedición, plantillas propias, originales, IA sin configurar, vídeo MP4 real y permisos.
- `push.test.mjs` — cadena push completa: notificación → trigger → `send-push` → Web Push cifrado (VAPID) → descifrado.

Si cambias `supabase/migrations/`, regenera `supabase/setup.sql` concatenando las migraciones en orden.

## Estructura
```
social-hub/
├── index.html, styles.css, config.js, manifest.webmanifest, sw.js, icons/
├── vendor/                 Preact, hooks, htm y supabase-js (copias locales, funcionan sin CDN)
├── app/main.js             arranque, login y navegación
├── app/lib/                store (datos + tiempo real), ui, drive, media, push
├── app/views/              inicio, calendario, publicaciones, comentarios, biblioteca, tareas, chat, notificaciones, actividad, ajustes, buscar
├── app/plan/editorial-plan.js   calendario editorial 11 nov – 31 dic 2026
├── supabase/migrations/    esquema, RLS, triggers, cron
├── supabase/setup.sql      todo lo anterior en un único archivo para el SQL Editor
├── supabase/functions/     send-push (Web Push), invite-user
└── tests/                  pruebas de API, E2E y push
```
