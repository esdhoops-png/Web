/* ==========================================================================
   Cuor di Pizza · Contenido editable
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para actualizar los datos
   del local: dirección, horarios, teléfono, enlaces, redes, pizzas y carta.

   Reglas:
   - Un campo vacío ('') se considera "pendiente": la web muestra un aviso
     discreto del tipo «Dirección por confirmar» o directamente oculta el
     botón (por ejemplo, «Reservar mesa» solo aparece si hay enlace).
   - Los precios son números (10.5 = 10,50 €). Pon null para no mostrarlo.
   - Las fotos de las pizzas destacadas son cuadradas (se muestran en
     círculo). Ruta base sin tamaño ni extensión: 'assets/img/sq-margherita'
     → usa sq-margherita-500.webp y sq-margherita-900.webp.
   ========================================================================== */

window.CUOR = {
  name: 'Cuor di Pizza',
  // Confirmado: el local pertenece al Grupo 5mentarios (Gran Canaria).
  group: 'Grupo 5mentarios',
  region: 'Gran Canaria',
  url: '', // URL pública definitiva, p. ej. 'https://cuordipizza.com/' (para SEO)

  // Mientras sea true, la carta y las pizzas destacadas muestran un aviso de
  // contenido de ejemplo. Ponlo a false cuando cargues la carta real.
  demoMenu: true,

  contact: {
    address: {
      street: '',      // p. ej. 'Calle Ejemplo, 12'
      postalCode: '',  // p. ej. '35400'
      locality: '',    // p. ej. 'Arucas'
      region: 'Gran Canaria',
      country: 'ES',
    },
    phone: '',     // formato internacional: '+34 600 000 000'
    whatsapp: '',  // solo dígitos con prefijo: '34600000000'
    email: '',     // 'hola@cuordipizza.com'
  },

  // Días en orden. Deja `hours: []` mientras no estén confirmados.
  // Ejemplo: { days: 'Martes a jueves', time: '19:30 – 23:30', schema: 'Tu-Th 19:30-23:30' }
  // (`schema` es opcional: el mismo horario en formato de Google para el SEO local)
  hours: [],

  links: {
    // Carta completa: por defecto la página carta.html de esta misma web.
    menu: 'carta.html',
    menuPdf: '',      // si existe una carta en PDF, su URL
    // Si se deja vacío, «Cómo llegar» busca el local por su nombre en Google Maps.
    maps: '',
    reservation: '',  // enlace real de reservas → aparece el botón «Reservar mesa»
    delivery: '',     // enlace real de pedidos → aparece el botón «Pedir a domicilio»
    legalNotice: '',  // aviso legal
    privacy: '',      // política de privacidad
    cookies: '',      // política de cookies
  },

  social: [
    { name: 'Instagram', url: '' },
    { name: 'Facebook', url: '' },
    { name: 'TikTok', url: '' },
  ],

  /* Pizzas destacadas de la portada (3 o 4). `id` enlaza con la carta. */
  featured: [
    {
      id: 'margherita',
      name: 'Margherita',
      description: 'La de siempre, la que nunca falla.',
      ingredients: ['Tomate', 'Mozzarella', 'Albahaca', 'Aceite de oliva'],
      price: 10.5,
      image: 'assets/img/sq-margherita',
      alt: 'Pizza margherita con tomate, mozzarella fundida y hojas de albahaca',
    },
    {
      id: 'diavola',
      name: 'Diavola',
      description: 'Para quienes buscan un punto de picante.',
      ingredients: ['Tomate', 'Mozzarella', 'Salami picante', 'Aceitunas negras', 'Albahaca'],
      price: 12.5,
      image: 'assets/img/sq-diavola',
      alt: 'Pizza cortada en porciones con salami, tomate, aceitunas y albahaca sobre madera',
    },
    {
      id: 'spinaci-e-ricotta',
      name: 'Spinaci e ricotta',
      description: 'Verde, cremosa y sorprendentemente ligera.',
      ingredients: ['Tomate', 'Espinacas', 'Ricotta', 'Mozzarella'],
      price: 13,
      image: 'assets/img/sq-verde',
      alt: 'Pizza con espinacas frescas y montoncitos de ricotta',
    },
    {
      id: 'bianca',
      name: 'Bianca',
      description: 'Sin tomate y con mucho carácter.',
      ingredients: ['Mozzarella', 'Cebolla morada', 'Hojas verdes', 'Aceite de oliva'],
      price: 13.5,
      image: 'assets/img/sq-bianca',
      alt: 'Porciones de pizza blanca con cebolla morada y hojas verdes sobre una mesa de madera',
    },
  ],

  /* Carta completa (carta.html). CONTENIDO DE EJEMPLO: sustituir por la real. */
  menu: [
    {
      title: 'Pizze rosse',
      note: 'Con base de tomate',
      items: [
        { id: 'margherita', name: 'Margherita', description: 'Tomate, mozzarella, albahaca y aceite de oliva.', price: 10.5 },
        { id: 'diavola', name: 'Diavola', description: 'Tomate, mozzarella, salami picante, aceitunas negras y albahaca.', price: 12.5 },
        { id: 'spinaci-e-ricotta', name: 'Spinaci e ricotta', description: 'Tomate, mozzarella, espinacas y ricotta.', price: 13 },
        { id: 'capricciosa', name: 'Capricciosa', description: 'Tomate, mozzarella, jamón cocido, champiñones, alcachofa y aceitunas.', price: 13.5 },
      ],
    },
    {
      title: 'Pizze bianche',
      note: 'Sin tomate',
      items: [
        { id: 'bianca', name: 'Bianca', description: 'Mozzarella, cebolla morada, hojas verdes y aceite de oliva.', price: 13.5 },
        { id: 'quattro-formaggi', name: 'Quattro formaggi', description: 'Mozzarella y una selección de tres quesos.', price: 14 },
        { id: 'funghi-e-tartufo', name: 'Funghi', description: 'Mozzarella, champiñones y un toque de aceite aromático.', price: 13.5 },
      ],
    },
    {
      title: 'Per cominciare',
      note: 'Para empezar y compartir',
      items: [
        { id: 'focaccia', name: 'Focaccia', description: 'Con aceite de oliva, sal y romero.', price: 5.5 },
        { id: 'bruschetta', name: 'Bruschetta', description: 'Pan tostado con tomate, ajo y albahaca.', price: 6.5 },
      ],
    },
    {
      title: 'Dolci',
      note: 'Para terminar',
      items: [
        { id: 'tiramisu', name: 'Tiramisù', description: 'Café, mascarpone y cacao.', price: 6 },
        { id: 'panna-cotta', name: 'Panna cotta', description: 'Con coulis de frutos rojos.', price: 5.5 },
      ],
    },
  ],
};
