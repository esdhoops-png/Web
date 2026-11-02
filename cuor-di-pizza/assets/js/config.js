/* ==========================================================================
   Cuor di Pizza · Contenido editable
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para actualizar los datos
   del local: dirección, horarios, teléfono, enlaces, redes y carta.

   Reglas:
   - Un campo vacío ('') se considera "pendiente": la web muestra un aviso
     discreto del tipo «Dirección por confirmar» o directamente oculta el
     botón (por ejemplo, «Llamar» solo aparece si hay teléfono).
   - Los precios son números (10.5 = 10,50 €). Pon null para no mostrarlo.
   ========================================================================== */

window.CUOR = {
  name: 'Cuor di Pizza',
  // Confirmado: el local pertenece al Grupo 5mentarios (Gran Canaria).
  group: 'Grupo 5mentarios',
  // Confirmado por el logo: «Pizzeria & Focacceria», en Arucas.
  tagline: 'Pizzeria & Focacceria',
  region: 'Gran Canaria',
  url: '', // URL pública definitiva, p. ej. 'https://cuordipizza.com/' (para SEO)

  // Mientras sea true, la carta muestra un aviso de contenido de ejemplo.
  // Ponlo a false cuando cargues la carta real.
  demoMenu: true,

  contact: {
    address: {
      street: '',      // p. ej. 'Calle Ejemplo, 12'
      postalCode: '',  // p. ej. '35400'
      locality: 'Arucas',
      region: 'Gran Canaria',
      country: 'ES',
    },
    phone: '',     // formato internacional: '+34 600 000 000' → botón «Llamar»
    whatsapp: '',  // solo dígitos con prefijo: '34600000000' → «Enviar por WhatsApp»
    email: '',     // 'hola@cuordipizza.com'
  },

  // Días en orden. Deja `hours: []` mientras no estén confirmados.
  // Ejemplo: { days: 'Martes a jueves', time: '19:30 – 23:30', schema: 'Tu-Th 19:30-23:30' }
  // (`schema` es opcional: el mismo horario en formato de Google para el SEO local)
  hours: [],

  links: {
    menu: 'carta.html',  // carta completa en una sola página
    menuPdf: '',         // si existe una carta en PDF, su URL
    // Si se deja vacío, «Cómo llegar» busca el local por su nombre en Google Maps.
    maps: '',
    reservation: '',     // enlace real de reservas → botón «Reservar mesa»
    delivery: '',        // enlace real de pedidos → botón «Pedir a domicilio»
    legalNotice: '',
    privacy: '',
    cookies: '',
  },

  social: [
    { name: 'Instagram', url: '' },
    { name: 'Facebook', url: '' },
    { name: 'TikTok', url: '' },
  ],

  /* ------------------------------------------------------------------------
     CARTA · CONTENIDO DE EJEMPLO: sustituir por la real.
     Cada plato puede llevar:
       tag    → frase corta encima del nombre
       badge  → etiqueta sobre la ilustración (hot: true la pinta en degradado)
       art    → cómo se dibuja la pizza: sauce 'tomato' | 'white' y toppings:
                basil, salami, olive, spinach, ricotta, onion, mushroom,
                ham, artichoke, cheese
       dish   → ilustración para lo que no es pizza:
                focaccia, bruschetta, tiramisu, pannacotta
     ------------------------------------------------------------------------ */
  menu: [
    {
      title: 'Pizze rosse',
      note: 'Con base de tomate',
      items: [
        { id: 'margherita', name: 'Margherita', tag: 'La de siempre, la que nunca falla', badge: 'La clásica', price: 10.5,
          description: 'Tomate, mozzarella, albahaca y aceite de oliva.', art: { sauce: 'tomato', toppings: ['cheese', 'basil'] } },
        { id: 'diavola', name: 'Diavola', tag: 'Con un punto de picante', badge: 'Picante', hot: true, price: 12.5,
          description: 'Tomate, mozzarella, salami picante, aceitunas negras y albahaca.', art: { sauce: 'tomato', toppings: ['cheese', 'salami', 'olive', 'basil'] } },
        { id: 'spinaci-e-ricotta', name: 'Spinaci e ricotta', tag: 'Verde y cremosa', price: 13,
          description: 'Tomate, mozzarella, espinacas y ricotta.', art: { sauce: 'tomato', toppings: ['spinach', 'ricotta'] } },
        { id: 'capricciosa', name: 'Capricciosa', tag: 'Un poco de todo', price: 13.5,
          description: 'Tomate, mozzarella, jamón cocido, champiñones, alcachofa y aceitunas.', art: { sauce: 'tomato', toppings: ['cheese', 'ham', 'mushroom', 'artichoke', 'olive'] } },
      ],
    },
    {
      title: 'Pizze bianche',
      note: 'Sin tomate',
      items: [
        { id: 'bianca', name: 'Bianca', tag: 'Sin tomate y con carácter', price: 13.5,
          description: 'Mozzarella, cebolla morada, hojas verdes y aceite de oliva.', art: { sauce: 'white', toppings: ['onion', 'spinach'] } },
        { id: 'quattro-formaggi', name: 'Quattro formaggi', tag: 'Para los muy queseros', badge: 'Cuatro quesos', price: 14,
          description: 'Mozzarella y una selección de tres quesos.', art: { sauce: 'white', toppings: ['cheese', 'ricotta'] } },
        { id: 'funghi', name: 'Funghi', tag: 'Del bosque a la mesa', price: 13.5,
          description: 'Mozzarella, champiñones y un toque de aceite aromático.', art: { sauce: 'white', toppings: ['mushroom', 'basil'] } },
      ],
    },
    {
      title: 'Per cominciare',
      note: 'Para empezar y compartir',
      items: [
        { id: 'focaccia', name: 'Focaccia', tag: 'Para abrir boca', price: 5.5,
          description: 'Con aceite de oliva, sal y romero.', dish: 'focaccia' },
        { id: 'bruschetta', name: 'Bruschetta', tag: 'Crujiente y fresca', price: 6.5,
          description: 'Pan tostado con tomate, ajo y albahaca.', dish: 'bruschetta' },
      ],
    },
    {
      title: 'Dolci',
      note: 'Para terminar',
      items: [
        { id: 'tiramisu', name: 'Tiramisù', tag: 'El final perfecto', badge: 'Dolce', price: 6,
          description: 'Café, mascarpone y cacao.', dish: 'tiramisu' },
        { id: 'panna-cotta', name: 'Panna cotta', tag: 'Suave y fresca', price: 5.5,
          description: 'Con coulis de frutos rojos.', dish: 'pannacotta' },
      ],
    },
  ],
};
