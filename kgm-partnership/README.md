# ESD HOOPS × KGM — Strategic Partnership Proposal

Web cinematográfica (Next.js + React + Tailwind CSS + Framer Motion + Lenis) que presenta la propuesta de colaboración entre ESD HOOPS y KGM.

## Arrancar en local

```bash
cd kgm-partnership
npm install
npm run dev        # http://localhost:3000
```

Producción: `npm run build && npm start`.

## Desplegar en Vercel

1. Importa el repositorio en Vercel.
2. En **Root Directory** selecciona `kgm-partnership`.
3. Variables de entorno (opcionales, ver `.env.example`):
   - `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`: endpoint del formulario (p. ej. Formspree). **Sin él, el formulario avisa de que no está conectado y no envía nada.**
   - `NEXT_PUBLIC_SITE_URL`: URL pública (metadatos y Open Graph).
   - `NEXT_PUBLIC_ALLOW_INDEXING=true` si quieres que Google la indexe (por defecto `noindex`, al ser una propuesta privada).

## Versión estática (sin servidor)

```bash
STATIC_EXPORT=1 npx next build && node scripts/prepare-static.mjs
```

Genera `static-site/`: una copia autónoma con rutas relativas y fuentes incrustadas, que se puede alojar en cualquier sitio.

## Dónde se cambia cada cosa

| Qué | Dónde |
| --- | --- |
| Textos, imágenes, secciones | `src/content/site.ts` |
| Datos de contacto oficiales (email, teléfono, web, Instagram, ubicación) | `contact` en `src/content/site.ts` — los campos vacíos no se muestran |
| Logos (vectorizados a partir de los originales) | `src/components/ui/Logos.tsx` y `public/logos/` |
| Colores y tipografías | `src/app/globals.css` (`@theme`) |
| Mapa mundial | `npm run gen:map` regenera `src/data/world-dots.json` |

## Imágenes

Todas están en `public/images` en WebP (máx. 1800 px) para que la web cargue rápido.

- `esd-*.webp`: fotos de torneos y entrenamientos de ESD HOOPS, con un etalonaje oscuro y **sin metadatos EXIF**.
- `kgm-*.webp`: imágenes de estudio de KGM (Musso EV, Torres EVX, Actyon Hybrid) con fondo transparente. Se usan en la portada, The Fleet, los montajes y el cierre.
- `court-night`, `net-dark`, `ball-macro`: Unsplash (licencia Unsplash).
- **Fotos de KGM en exteriores:** añade los archivos a `public/images` y rellena `kgmLifestyle` en `src/content/site.ts`; la primera pasa a ser el fondo de la sección The Future.

## Accesibilidad y movimiento

- Respeta `prefers-reduced-motion`. Además, el menú incluye un interruptor **Reduce motion** que se recuerda en el navegador.
- Navegación por teclado: el menú se cierra con Esc y las pestañas de *Activation* funcionan con las flechas.

## Reglas comerciales aplicadas

No hay cifras, estadísticas, testimonios ni datos de contacto inventados. Los conceptos y las activaciones aparecen como propuestas creativas, con un aviso explícito. El mapa es ilustrativo: muestra regiones de conexión con jugadores, no oficinas.
