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

// Lo que la guía cita pero NO está disponible en este proyecto (no se finge tenerlo)
export const MISSING = [
  'Paquete de transferencia: 01_marca, 02_disenos_entregados (monólogos, cartel y carrusel del tardeo del 14, stories y vídeos), 03_fuentes_editables y 04_fotos_y_recursos.',
  'Lienzo de diseño de octubre–noviembre (Champions C1–C6, calendario y carruseles, Halloween, Clásico, menús de Navidad NAV/NAVB/NAVC).',
  'Textura de pared de Halloween, logos del Ayuntamiento de Arucas y COA, fotos de artistas y del local.'
];
// Verificado y descartado: «Tipos de personas» (carrusel-tipos-de-personas) es de VOLCÁN, no de 5mentarios.
