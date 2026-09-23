# Heineken 5mentarios · Web

Web de una sola página, en HTML, CSS y JavaScript sin dependencias ni proceso de compilación. Se sube tal cual a cualquier hosting (Netlify, Vercel, GitHub Pages, un servidor Apache…).

```
5mentarios/
├── index.html        Estructura de la página (no hace falta tocarla para cambiar contenido)
├── css/styles.css    Diseño (colores y tipografías arriba del todo, en :root)
├── js/data.js        ← TODO EL CONTENIDO EDITABLE
├── js/main.js        Interacciones
└── img/              Imágenes (todas las actuales son de ejemplo)
```

Para verla en local: abre `index.html` en el navegador, o desde esta carpeta ejecuta `npx serve .` y entra en la dirección que indique.

---

## 1. Datos del local (dirección, horario, teléfono, Instagram, WhatsApp)

En `js/data.js`, bloque `config`. Sustituye cada valor entre corchetes:

| Campo | Ejemplo |
|---|---|
| `address` | `'Calle Mayor, 5 · 35000 Ciudad'` |
| `hours` | `'Jue–Dom · 17:00 – 04:00'` |
| `phone` | `'+34 600 000 000'` |
| `whatsapp` | `'34600000000'` (solo números, con prefijo) |
| `instagramHandle` | `'@5mentarios'` |
| `instagramUrl` | `'https://www.instagram.com/5mentarios/'` |
| `mapsUrl` | enlace de Google Maps → *Compartir* → *Copiar enlace* |

Mientras un dato siga entre corchetes, la web lo muestra en gris y los botones relacionados («Cómo llegar», «Ver Instagram», el teléfono) avisan en vez de llevar a un enlace roto.

## 2. Eventos

Bloque `events` de `js/data.js`. Cada evento es:

```js
{ id: 'friday-night',          // identificador único, sin espacios
  date: '2026-09-25',          // AAAA-MM-DD
  time: '23:30',               // HH:MM
  name: 'Friday Night',
  artist: 'DJ Nombre',
  type: 'dj',                  // 'tardeo' | 'futbol' | 'live' | 'dj' | 'fiesta'  (lo usan los filtros)
  image: 'img/evento-01.jpg',
  description: 'Texto corto que aparece en «Ver evento».',
  reserveUrl: '' }             // opcional: enlace externo de reservas. Vacío = formulario de la web
```

- Para añadir un evento, copia uno y cambia los datos.
- Los eventos pasados se ocultan solos, y el orden por fecha es automático.
- Un evento de fútbol lleva además `matchId: 'm2'`, que lo enlaza con un partido del bloque `matches`. Así, «Reservar» abre el formulario en modo «Reserva para el partido».

## 3. Partidos de fútbol

Bloque `matches`. **Son datos de ejemplo («Equipo A vs Equipo B»): sustitúyelos por la programación real.**

```js
{ id: 'm2', competition: 'Champions League', date: '2026-09-30', time: '21:00',
  home: { name: 'Equipo A', short: 'EQA', crest: '' },
  away: { name: 'Equipo B', short: 'EQB', crest: '' } }
```

- **Estado:** PRÓXIMO, EN DIRECTO (las 2 horas siguientes al inicio) o FINALIZADO. Se calcula solo. Para forzarlo, añade `status: 'directo'`.
- **Escudos:** `crest: 'img/escudo-equipo-a.png'`. Si se deja vacío, se dibuja un escudo genérico con las iniciales de `short`.
- **Partido destacado:** el bloque grande «Matchday» muestra el partido en directo o, si no hay ninguno, el próximo.
- **API deportiva:** pon en `config.matchesApiUrl` una URL que devuelva un array JSON con la misma forma que `matches`. Si falla o no está configurada, se usan los datos locales.

## 4. «¿Qué pasa hoy?» y «Hoy en 5mentarios» (hero)

Bloque `today`: hora, título, tipo (para el icono) y sección a la que lleva. Hoy es una programación de ejemplo. Cambia también `label` (por ejemplo, `'Viernes 25 de septiembre'`).

## 5. Tardeo, artistas, galería e Instagram

- `tardeo.time` y `tardeo.food`: horario del tardeo y comida. Si no hay comida, pon `food: ''` y la tarjeta desaparece.
- `artists`: nombre, género, imagen y `eventId` (el evento donde toca, del que salen la fecha y la hora).
- `gallery`: imagen, etiqueta (`#TARDEO`, `#LIVE`…) y tamaño en el mosaico: `'big'`, `'wide'` (horizontal), `'tall'` (vertical) o `'square'`.
- `instagram`: 6 publicaciones. `url` puede enlazar a cada publicación concreta; si queda vacío, lleva al perfil.

## 6. Imágenes

**Todas las imágenes actuales son de ejemplo** y llevan el texto «IMAGEN DE EJEMPLO». Para cambiarlas, sustituye el archivo en `img/` **con el mismo nombre**:

| Archivo | Dónde sale | Formato recomendado |
|---|---|---|
| `hero.jpg` | Portada | Horizontal, 1920×1080 |
| `evento-01.jpg` … `evento-08.jpg` | Carteles de eventos | Vertical 3:4, 900×1200 |
| `futbol.jpg` | Ventana de partido sin cartel propio | Horizontal |
| `tardeo-01.jpg` … `tardeo-04.jpg` | Galería del tardeo | Vertical 3:4 |
| `artista-01.jpg` … `artista-04.jpg` | Tarjetas de artistas | Vertical 4:5 |
| `gallery-01.jpg` … `gallery-10.jpg` | Galería | Según el tamaño del mosaico |
| `insta-01.jpg` … `insta-06.jpg` | Instagram | Vertical 4:5 |
| `logo-5mentarios.png` | Menú, pie y portada | PNG transparente |

- **Nombre distinto:** cambia la ruta en `js/data.js`.
- **Peso:** JPG de menos de 300 KB para que la web cargue rápido en el móvil.
- **Vídeo en la portada:** sube un MP4 corto y sin sonido (por ejemplo `img/hero.mp4`) y pon `heroVideo: 'img/hero.mp4'`. `hero.jpg` se sigue usando mientras carga.
- **Sonido:** el botón PLAY SOUND no reproduce nada hasta que pongas `sound: 'audio/ambiente.mp3'`. Nunca suena solo.

## 7. Reservas

Ahora mismo, el formulario valida los datos y muestra la confirmación en pantalla, **pero no los envía a ningún sitio**. Para recibir las reservas:

- **Opción A: formulario.** Pon en `config.reservationEndpoint` la URL de un servicio de formularios (Formspree, Make, Zapier, un script propio…). La web envía en POST un JSON con: `name`, `phone`, `date`, `time`, `people`, `type` y `context` (el evento o partido, si viene de uno).
- **Opción B: WhatsApp.** Rellena `config.whatsapp`. El botón «Reservar por WhatsApp» abre el chat con el mensaje ya redactado a partir de lo que haya escrito la persona.
- **Opción C: sistema externo.** Pon `reserveUrl` en los eventos para enviar a una plataforma de reservas.

## 8. Colores y tipografías

Al principio de `css/styles.css`:
- **Colores:** `--green` es el verde de acento, `--bg` el negro de fondo.
- **Tipografías:** *Big Shoulders Display* para los titulares y *Figtree* para el texto, ambas de Google Fonts.

## 9. Pendiente antes de publicar

- [ ] Dirección, horario, teléfono, WhatsApp e Instagram reales
- [ ] Eventos, partidos y artistas reales
- [ ] Fotos reales (sustituir todas las de ejemplo)
- [ ] Conectar las reservas (apartado 7)
- [ ] Textos legales («Aviso legal» y «Privacidad» en el pie)
- [ ] Revisar con Heineken el uso de su marca y logotipo
