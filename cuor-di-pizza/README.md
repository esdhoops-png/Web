# Cuor di Pizza · web

Landing page y carta de Cuor di Pizza, pizzeria & focacceria del Grupo 5mentarios en Arucas (Gran Canaria).

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
| Dirección (calle y CP; Arucas ya está) | `contact.address` | «Dirección por confirmar» |
| Horario | `hours` | «Horario por confirmar» |
| Teléfono, email, WhatsApp | `contact` | Aviso / se ocultan «Llamar» y «WhatsApp» |
| Redes sociales | `social[].url` | «enlace pendiente» |
| Cómo llegar | `links.maps` | Busca «Cuor di Pizza Gran Canaria» en Google Maps |
| Reservas | `links.reservation` | No aparece el botón «Reservar mesa» |
| Pedidos a domicilio | `links.delivery` | No aparece «Pedir a domicilio» (y la barra muestra «Ver la carta» en lugar de «Pedir ahora») |
| Carta en PDF | `links.menuPdf` | No aparece el enlace de descarga |
| Textos legales | `links.legalNotice`, `privacy`, `cookies` | «(pendiente)» |
| URL definitiva | `url` | Se omite en los datos estructurados |

**Carta:** `menu` (portada y carta.html) es la **carta real** del local, tomada de su carta de Just Eat
(cuordipizzaarucas.com): 37 pizzas en tamaño mediano y familiar, focaccia y bebidas. Cada plato lleva
`prices` (un precio por tamaño); cada tamaño se añade por separado a «Tu mesa».
Cuando estén los platos y precios reales, sustitúyelos y pon `demoMenu: false` para quitar los avisos.

Los textos de las secciones (filosofía, los tres momentos, frases de la experiencia) están en
`index.html` y son provisionales: no afirman procesos ni ingredientes concretos del local.

## Logo

`assets/img/logo-full-600.webp` (logo completo) y `assets/img/logo-mark-256.webp` (solo el corazón)
son recortes con fondo transparente del logo oficial; también generan `favicon-64.png`,
`apple-touch-icon.png` y la imagen para compartir `og-cuor-di-pizza.jpg`. La paleta de la web toma
su rojo y su verde, y la tipografía romana Cinzel para el nombre.

## Cambiar fotos

Sustituye los archivos de `assets/img` manteniendo el nombre. Si una foto cambia mucho, actualiza
también su `alt` en `index.html`.

La pizza giratoria del hero (`pizza-cut-*.webp`) es un recorte circular con fondo transparente:
lo ideal es una foto cenital de una pizza real del local.

## Estilo y experiencia

Misma familia visual que la web de Volcán (Grupo 5mentarios): fondo oscuro de horno, titulares Anton,
mucho movimiento. Identidad propia con el rojo tomate, la albahaca y la cursiva italiana (Fraunces).

1. **Entrada:** fachada ilustrada de Cuor di Pizza de noche (neón, toldo, ventanales). Al hacer
   scroll la cámara se acerca, se abre la puerta y se entra en la web.
2. **Hero:** pizza real que se inclina en 3D con el ratón y gira con el scroll, ingredientes flotando,
   vapor, brasas animadas (canvas) y sello giratorio.
3. **Anatomía:** pizza ilustrada que se separa en 5 capas con el scroll y se «hornea» al final.
4. **Carta:** pestañas por categoría, una ilustración generada para cada plato (según `art` o `dish`
   en `config.js`) y botón «Añadir».
5. **Tu mesa:** lista de lo elegido con total orientativo. No es un pedido online: ofrece llamar,
   WhatsApp o pedir a domicilio solo si esos datos existen en `config.js`; si no, «Cómo llegar».
6. El oficio, sección inmersiva, galería, dónde estamos, CTA con brasas y footer.

Con `prefers-reduced-motion` no hay brasas, vapor, zoom ni inclinaciones, y todo el contenido es visible.

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
