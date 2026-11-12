// Diseños ORIGINALES de Heineken 5mentarios verificados en Google Drive (11–12 nov 2026).
// Solo se registran archivos que existen y se han abierto. Los originales NO se copian ni se modifican:
// se guarda su ID de Drive. Formato y colores medidos sobre el archivo; tipografías identificadas a simple vista.
// Un PNG/JPG es una imagen PLANA: no tiene capas editables. Para editar se usa su plantilla recreada.

export const ORIGINALS = [
  {
    id: 'champions-01', drive: '1eT6Eu3OqCR2knBRFykqtS7xy4hiE33r7', name: 'champions-01-portada-jugadores.png', category: 'futbol',
    format: 'PNG · 1080×1350 (4:5)', flat: true, psd: { drive: '1B0xFdhZO5C3UNkPgBPO8zlM64Z-OsjRH', name: 'champions-01-portada.psd' },
    colors: ['#FFFFFF', '#090A0A', '#1B6F3F', '#DEDCD6'],
    fonts: 'Anton (texto repetido «CHAMPIONS»); pie en condensada espaciada (tipo Barlow Condensed)',
    composition: 'Fondo blanco con la palabra «CHAMPIONS» repetida en filas (verde relleno, contorno negro y negro alternos), jugadores recortados en primer plano, logo arriba a la izquierda y barra negra inferior «HEINEKEN 5MENTARIOS · ARUCAS — DESLIZA →».',
    reusable: 'Estructura de texto repetido, barra inferior, logo y contador. Las fotos de jugadores son de terceros: no se reutilizan (usar las que proporcione el responsable).',
    template: 'champions-portada'
  },
  {
    id: 'champions-02', drive: '1zjQWObxstWji8VFfTVOhrSTvKUhMvusH', name: 'champions-02-galatasaray-barca.png', category: 'futbol',
    format: 'PNG · 1080×1350 (4:5)', flat: true, psd: { drive: '1xZh3coP9eDpSb8uG4ui2cSR46TeBTfPq', name: 'champions-02-galatasaray-barca.psd' },
    colors: ['#0B0C0C', '#327A41', '#193A29', '#49A067'],
    fonts: 'Anton (nombres de equipo); condensada espaciada en verde (fecha y competición)',
    composition: 'Pantalla partida: mitad izquierda foto con degradado a negro, mitad derecha foto con degradado a verde; círculo blanco «VS» en el centro, etiqueta negra «PARTIDAZO» girada arriba a la derecha, fecha «MARTES 13.10» en verde, nombres de equipo enormes, pastilla verde «20:00 H», contador «02/06» y barra inferior.',
    reusable: 'Toda la maqueta (mitades, VS, etiqueta, pastilla, pie). Sustituir fotos, fecha, equipos y hora.',
    template: 'champions-partido'
  },
  {
    id: 'champions-04', drive: '1PrD55GQboG1XlpK44vGrjgnfC-AiHl2H', name: 'champions-04-roma-madrid.png', category: 'futbol',
    format: 'PNG · 1080×1350 (4:5)', flat: true, psd: null,
    colors: ['#1B9049', '#F3F3F1', '#060C0B', '#3E6748'],
    fonts: 'Anton (equipos); condensada espaciada (fecha y competición)',
    composition: 'Variante clara de la misma maqueta: mitad izquierda con degradado a blanco y texto negro («MIÉRCOLES 14.10 · ROMA»), mitad derecha verde con «REAL MADRID», «VS», «PARTIDAZO» y pastilla de hora negra.',
    reusable: 'Igual que el anterior. La plantilla recreada permite cambiar el color de cada mitad.',
    template: 'champions-partido'
  },
  {
    id: 'halloween-cartel', drive: '1nQTe04L54ckDgysS0rhuxwlQdbaN3IBK', name: 'cartel-halloween-31-octubre.png', category: 'eventos',
    format: 'PNG · 1080×1350 (4:5)', flat: true, psd: { drive: '18wnAvaH5D8u0WpeQOgmoEcrEIA4fvMUs', name: 'halloween-cartel-parte1-diapos-1-2.psd' },
    colors: ['#040907', '#222E2C', '#0B2215', '#A8BBA3'],
    fonts: 'Anton (HALLOWEEN, artistas), manuscrita tipo Permanent Marker (fecha en verde neón), condensada (líneas pequeñas)',
    composition: 'Pared oscura con tira de polaroids del payaso arriba, etiqueta verde «TARDEO XL» + «DESDE LAS 12:00», título «HALLOWEEN» con halo verde, fecha manuscrita «Sábado 31 · Octubre», rejilla de 5 artistas en blanco, línea «…Y MÁS SORPRESAS · BARRAS EN EL EXTERIOR» y pie ORGANIZA / COLABORAN con logos.',
    reusable: 'Composición, etiqueta, título con halo, fecha manuscrita, rejilla de artistas y pie de colaboradores. El payaso y las polaroids NO (personaje): hueco para foto propia.',
    template: 'tardeo'
  },
  {
    id: 'logo-sello', drive: '1YH_hltwSN3lAN9L9PnhUQenIltcDsKuH', name: '5mentarios-sello.svg', category: 'marca',
    format: 'SVG vectorial', flat: false, psd: null, colors: ['#FFFFFF', '#000000'], fonts: '—',
    composition: 'Sello circular «5MENTARIOS · Heineken · EST. 2002» en blanco y negro.', reusable: 'Logo para fondos oscuros (incluido en la app).', template: 'marca'
  },
  {
    id: 'logo-negro', drive: '1vfdqLuDgxL80qWBHF6c7pFgOiIAa-psZ', name: '5mentarios-negro.svg', category: 'marca',
    format: 'SVG vectorial', flat: false, psd: null, colors: ['#000000'], fonts: '—',
    composition: 'Sello en negro.', reusable: 'Logo para fondos claros (incluido en la app).', template: 'champions-portada'
  }
];

// Recibidos en el chat el 12 nov 2026 (archivos reales, aún NO subidos a la app ni a Drive).
// AVISO sábado 21: «Son Aldea» (programación del 12 nov y Sin título-1), «Son Diferente» (nov-06 y calendario) o «Directo» (calendario de Sin título-1). Pendiente de confirmar.
export const RECEIVED = [
  { name: 'Story «Faltan 2 días» · Tardeo Exterior Halloween', format: 'Imagen 1080×1920 (plana)', flat: true,
    composition: 'Foto oscura de fondo, logo arriba centrado, «FALTAN» verde muy espaciado, «2 DÍAS» gigante blanco con halo verde, banda verde girada «TARDEO EXTERIOR», «HALLOWEEN» gigante, fecha manuscrita verde «Sábado 14 · Noviembre», «DESDE LAS 16:00», filas hora verde / artista blanco a la derecha con líneas verdes finas, pie ORGANIZA (Ayto. de Arucas, cajita blanca) / COLABORAN (5mentarios, COA).',
    reusable: 'Estructura de cuenta atrás y de filas; usada para la plantilla «Story HOY».', post: 'p2-1112-cuenta2' },
  { name: 'story-esta-semana-12-14-nov.mp4', format: 'Vídeo H.264 1080×1920 · 17,2 s', flat: true,
    composition: 'Rayos verdes, pastilla «12 – 14 NOV», «ESTA SEMANA EN 5MENTARIOS», escena por día con el día en contorno («JUE 12»), foto recortada del humorista, filas hora/artista, «RESERVA TU MESA» y cierre con el logo.',
    reusable: 'Ritmo de escenas para el módulo de vídeo.', post: 'p2-1111-semana' },
  { name: 'Reel «Así fue Halloween → ¿te vas a perder el Tardeo Exterior?»', format: 'Vídeo HEVC 1080×1920 · 23,8 s', flat: true,
    composition: 'Planos del bar en Halloween con logo arriba, «Así fue…» manuscrito, «HALLOWEEN en 5mentarios», «¿Y AHORA TE VAS A PERDER… EL TARDEO EXTERIOR?» y cartel final con line-up y colaboradores.',
    reusable: 'Referencia de reel de recuerdo + llamada al siguiente evento.', post: 'p2-1112-reel-halloween' },
  { name: 'nov-01-portada.psd · Calendario de noviembre (portada del carrusel)', format: 'PSD 1080×1350 · 119 capas con nombre (rasterizadas)', flat: false,
    composition: 'Fondo verde #0B8A3E, logo centrado, cabecera LUN–DOM, «NOVIEMBRE» en Anton blanco, casillas 129×92: verde oscuro vacías, negras para Champions/monólogos/tardeos y claras para noches con música; pie claro «HEINEKEN 5MENTARIOS · ARUCAS / DESLIZA →». Versión final con fotos recortadas de artistas abajo.',
    reusable: 'Recreada como plantilla «Calendario del mes»; usada para diciembre. Las capas tienen nombre, pero los textos están rasterizados: se pueden mover u ocultar en Photoshop, no reescribir.', post: 'p2-1201-diciembre' },
  { name: 'nov-05-13-y-14.psd · Slide 05/09 (vie 13 Son Diferente · sáb 14 Tardeo)', format: 'PSD 1080×1350 · 25 capas (rasterizadas)', flat: false,
    composition: 'Mitad izquierda negra con foto y nombre en Anton; mitad derecha verde «TARDEO» con filas hora/artista separadas por líneas finas.', reusable: 'Estructura de filas del tardeo.', post: null },
  { name: 'nov-06-20-y-21.psd · Slide 06/09 (vie 20 Apolo · sáb 21 Son Diferente)', format: 'PSD 1080×1350 · 16 capas (rasterizadas)', flat: false,
    composition: 'Mitad superior verde con número «20» de contorno, foto recortada, pastilla LIVE negra y DJ de contorno; mitad inferior clara con «21» verde macizo.', reusable: 'Recreada como plantilla «Fin de semana · dos días» (estilo A).', post: 'p2-1121-stories' },
  { name: 'Slide 07/09 (vie 27 Alberto Déniz · sáb 28 Savia Nueva) y slide 02/07 (vie 6 Alberto Déniz · sáb 7 Cremita de Coco)', format: 'Imágenes 1080×1350 (planas)', flat: true,
    composition: 'Mitad superior negra con foto, día en verde espaciado, nombre gigante blanco, pastilla LIVE verde y DJ de contorno blanco; mitad inferior verde.', reusable: 'Plantilla «Fin de semana · dos días» (estilo B).', post: null },
  { name: 'Slide 07/07 «Champions en noviembre»', format: 'Imagen 1080×1350 (plana)', flat: true,
    composition: 'Fondo claro, pastilla negra «FÚTBOL EN PANTALLA GRANDE», «CHAMPIONS» negro + «EN NOVIEMBRE» verde, filas fecha/hora y «LOCAL vs VISITANTE» (equipo nuestro en negro, rival en gris).',
    reusable: 'Fuente de los partidos de la J5: mar 24 R. Madrid vs PSV 20:00 · mié 25 Sabah vs Barça 17:45.', post: 'p2-1123-ucl' },
  { name: 'Foto de grupo en blanco y negro (4 músicos)', format: 'Imagen 1080×1350 (plana)', flat: true,
    composition: 'Cuatro músicos recortados en blanco y negro sobre fondo blanco.', reusable: 'Recurso de foto. No se sabe de qué grupo es: pendiente de identificar.', post: null },
  { name: 'Sin título-1.psd · Lienzo del carrusel de noviembre (6 slides en 6480×1350)', format: 'PSD 6480×1350 · ~110 capas con nombre (textos rasterizados, fotos de artistas como objetos inteligentes)', flat: false,
    composition: 'Calendario · 02/07 vie 6 Alberto Déniz / sáb 7 Cremita de Coco · 07/07 Champions en noviembre · «TARDEO» repetido dom 8 (Son Karibe 16:30, Kilian Viera 18:30) · 04/06 vie 13 Son Diferente / sáb 14 Pedro Afonso · 05/06 vie 20 Apolo / sáb 21 Son Aldea.',
    reusable: 'Versión anterior (el sábado 14 aún era noche con Pedro Afonso). Recortes sin fondo de Cremita de Coco, Kike Pérez, Kilian Viera, Apolo y el dúo de Son Diferente como objetos inteligentes: se pueden exportar y subir a la Biblioteca.', post: null }
];

// Lo que la guía cita pero NO está disponible en este proyecto (no se finge tenerlo)
export const MISSING = [
  'Paquete de transferencia: 01_marca, 02_disenos_entregados (monólogos, cartel y carrusel del tardeo del 14, stories y vídeos), 03_fuentes_editables y 04_fotos_y_recursos.',
  'Lienzo de diseño de octubre–noviembre (Champions C1–C6, calendario y carruseles, Halloween, Clásico, menús de Navidad NAV/NAVB/NAVC).',
  'Textura de pared de Halloween, logos del Ayuntamiento de Arucas y COA, fotos de artistas y del local.'
];
// Verificado y descartado: «Tipos de personas» (carrusel-tipos-de-personas) es de VOLCÁN, no de 5mentarios.
