# Feed mezclado

Base del feed: carteles de club de running (foto con movimiento + letra de rotulador Mansalva, etiquetas pequeñas en las esquinas).
Intercalados: fotos reales con capa de app (reproductor, estadísticas del entreno) y alguna pieza tipográfica.

Patrón del grid (`grid-mezcla.png`), de arriba abajo:
| | | |
|---|---|---|
| Cartel con foto · Racha Walk | Foto + reproductor · Racha playlist | Cartel oscuro · Tu noche |
| Foto + estadísticas · mañana \| racha | Cartel claro · Agua al despertar | Cartel naranja · 4 rutas |
| Cartel con foto · Día 1 | Portada oscura · Guía 12 hábitos | Foto de producto · Racha Club |

Regla: nunca dos fotos con capa seguidas en la misma fila; alternar foto, cartel oscuro y color.

Los recuadros "📷" marcan dónde va cada foto real (ver descripción en cada uno).

## Stories (`stories/`, 1080×1920)
- `story-entreno-capa.png` y `story-playlist-capa.png`: fondo transparente. Se pegan encima de tu foto (en Instagram: copiar imagen → pegar como sticker, o en Canva/CapCut como capa).
- `*-demo.png`: cómo quedan sobre una foto.
