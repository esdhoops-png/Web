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

## Dónde se cambia cada cosa

| Qué | Dónde |
| --- | --- |
| Textos, imágenes, secciones | `src/content/site.ts` |
| Datos de contacto oficiales (email, teléfono, web, Instagram, ubicación) | `contact` en `src/content/site.ts` — los campos vacíos no se muestran |
| Logos (vectorizados a partir de los originales) | `src/components/ui/Logos.tsx` y `public/logos/` |
| Colores y tipografías | `src/app/globals.css` (`@theme`) |
| Mapa mundial | `npm run gen:map` regenera `src/data/world-dots.json` |

## Imágenes

- `public/images/esd-*.jpg`: fotos del último torneo 3x3 de ESD HOOPS, redimensionadas, con un etalonaje oscuro y **sin metadatos EXIF** (se elimina el GPS).
- `public/images/kgm-*.jpg`: KGM Torres, de Wikimedia Commons, con licencia **CC BY-SA 4.0**. Los créditos aparecen en el pie de la web. Si KGM facilita imágenes oficiales de prensa, basta con sustituir los archivos o las rutas en `site.ts`.
- `court-night`, `net-dark`, `ball-macro`, `training-*`: Unsplash (licencia Unsplash).

## Accesibilidad y movimiento

- Respeta `prefers-reduced-motion`. Además, el menú incluye un interruptor **Reduce motion** que se recuerda en el navegador.
- Navegación por teclado: el menú se cierra con Esc y las pestañas de *Activation* funcionan con las flechas.

## Reglas comerciales aplicadas

No hay cifras, estadísticas, testimonios ni datos de contacto inventados. Los conceptos y las activaciones aparecen como propuestas creativas, con un aviso explícito. El mapa es ilustrativo: muestra regiones de conexión con jugadores, no oficinas.
