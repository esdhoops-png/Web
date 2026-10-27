# Cuor di Pizza · web

Landing page y carta de Cuor di Pizza, pizzería del Grupo 5mentarios (Gran Canaria).

Es una web estática (HTML, CSS y JavaScript sin dependencias ni compilación), como el resto
de proyectos de este repositorio. Se publica tal cual en `/cuor-di-pizza/`.

```
cuor-di-pizza/
├── index.html            Portada (hero, esencia, elaboración, pizzas, inmersiva, experiencia, CTA, footer)
├── carta.html            Carta completa, generada desde config.js
└── assets/
    ├── js/config.js      ← TODO el contenido editable
    ├── js/main.js        Render del contenido + navegación + animaciones
    ├── css/styles.css    Sistema de diseño y estilos
    └── img/              Fotos en WebP (700/1200 px), favicon y Open Graph
```

## Ver en local

```bash
python3 -m http.server 8000   # desde la raíz del repositorio
# → http://localhost:8000/cuor-di-pizza/
```

## Qué falta completar (datos reales)

Todo está en `assets/js/config.js`. Mientras un campo esté vacío, la web muestra un aviso
discreto («Dirección por confirmar», «enlace pendiente»…) o no muestra el botón.

| Dato | Campo | Qué pasa si está vacío |
| --- | --- | --- |
| Dirección | `contact.address` | «Dirección por confirmar» |
| Horario | `hours` | «Horario por confirmar» |
| Teléfono, email, WhatsApp | `contact` | Aviso / se oculta WhatsApp |
| Redes sociales | `social[].url` | «enlace pendiente» |
| Cómo llegar | `links.maps` | Busca «Cuor di Pizza Gran Canaria» en Google Maps |
| Reservas | `links.reservation` | No aparece el botón «Reservar mesa» |
| Pedidos a domicilio | `links.delivery` | No aparece «Pedir a domicilio» (y la barra muestra «Ver la carta» en lugar de «Pedir ahora») |
| Carta en PDF | `links.menuPdf` | No aparece el enlace de descarga |
| Textos legales | `links.legalNotice`, `privacy`, `cookies` | «(pendiente)» |
| URL definitiva | `url` | Se omite en los datos estructurados |

**Carta y pizzas destacadas:** `featured` (portada) y `menu` (carta.html) son **contenido de ejemplo**.
Cuando estén los platos y precios reales, sustitúyelos y pon `demoMenu: false` para quitar los avisos.

Los textos de las secciones (filosofía, los tres momentos, frases de la experiencia) están en
`index.html` y son provisionales: no afirman procesos ni ingredientes concretos del local.

## Cambiar fotos

Sustituye los archivos de `assets/img` manteniendo el nombre (`masa-800.webp`, `masa-1600.webp`, etc.).
Si una foto cambia mucho, actualiza también su `alt` en `index.html` (o en `config.js` para las pizzas).

Para las pizzas basta con indicar la ruta base en `config.js` (`image: 'assets/img/margherita'`) y
crear `margherita-700.webp` y `margherita-1200.webp`.

## Sistema de movimiento

- **Curvas y duraciones únicas** (`--ease`, `--ease-io`, `--t-fast/mid/slow`, escalonado de 110 ms).
- **Revelado** con `data-reveal`: `up` (desplazamiento), `lines` (titulares por líneas), `mask`
  (foto que se descubre con recorte), `draw` (corazón dibujado), `rule` (líneas). Se activan una
  sola vez con IntersectionObserver; nada desaparece al salir de pantalla.
- **Efectos ligados al scroll** en un único `requestAnimationFrame`: parallax sutil (`data-speed`),
  recorrido horizontal de la elaboración (solo escritorio, con `position: sticky`, sin bloquear el
  scroll nativo), apertura de la imagen inmersiva, CTA que se ensancha y marquesina que solo se
  mueve al hacer scroll.
- **Móvil:** sin parallax y con la elaboración en vertical.
- **`prefers-reduced-motion`:** todo el contenido visible desde el principio, sin desplazamientos,
  desenfoques ni recorrido horizontal.

## Fotografías provisionales (Unsplash)

Licencia Unsplash. Sustituir por fotos propias del local cuando estén disponibles.

| Archivo | Foto |
| --- | --- |
| hero | https://images.unsplash.com/photo-1574071318508-1cdbab80d002 |
| mesa | https://images.unsplash.com/photo-1600628421055-4d30de868b8f |
| porcion | https://images.unsplash.com/photo-1593504049359-74330189a345 |
| masa | https://images.unsplash.com/photo-1517686469429-8bdb88b9f907 |
| ingredientes | https://images.unsplash.com/photo-1592924357228-91a4daadcfea |
| horno | https://images.unsplash.com/photo-1579751626657-72bc17010498 |
| margherita | https://images.unsplash.com/photo-1604068549290-dea0e4a305ca |
| diavola | https://images.unsplash.com/photo-1585238342024-78d387f4a707 |
| verde | https://images.unsplash.com/photo-1593560708920-61dd98c46a4e |
| bianca | https://images.unsplash.com/photo-1511689660979-10d2b1aada49 |
| panoramica / og | https://images.unsplash.com/photo-1513104890138-7c749659a591 |
| compartir | https://images.unsplash.com/photo-1555072956-7758afb20e8f |
| servir | https://images.unsplash.com/photo-1520201163981-8cc95007dd2a |
