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
  demoMenu: false,

  contact: {
    address: {
      street: 'Calle León y Castillo, 16',
      postalCode: '35400',
      locality: 'Arucas',
      region: 'Gran Canaria',
      country: 'ES',
    },
    phone: '',     // formato internacional: '+34 600 000 000' → botón «Llamar»
    whatsapp: '',  // solo dígitos con prefijo: '34600000000' → «Enviar por WhatsApp»
    email: '',     // 'hola@cuordipizza.com'
  },

  // Horario publicado en Just Eat para pedidos a domicilio (cuordipizzaarucas.com).
  // `schema` es el mismo horario en el formato de Google (SEO local).
  hours: [
    { days: 'Lunes y martes', time: 'Cerrado' },
    { days: 'Miércoles a domingo', time: '13:00 – 15:45 · 19:00 – 23:45', schema: ['We-Su 13:00-15:45', 'We-Su 19:00-23:45'] },
  ],
  hoursNote: 'Horario de pedidos a domicilio según Just Eat.',
  deliveryZones: ['35400', '35411'],

  links: {
    menu: 'carta.html',  // carta completa en una sola página
    menuPdf: '',         // si existe una carta en PDF, su URL
    // Si se deja vacío, «Cómo llegar» busca el local por su nombre en Google Maps.
    maps: '',
    reservation: '',     // enlace real de reservas → botón «Reservar mesa»
    delivery: 'https://www.just-eat.es/restaurants-cuordipizzaarucas/menu', // pedidos a domicilio
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
     CARTA REAL · fuente: carta de Just Eat del local (cuordipizzaarucas.com).
     Cada plato:
       prices → tamaños y precios: [{ label: 'Mediana', price: 7.5 }, …]
       tag    → frase corta encima del nombre (opcional)
       badge  → etiqueta sobre la ilustración (hot: true la pinta en degradado)
       art    → ingredientes que se dibujan en la ilustración de la pizza
       dish   → ilustración especial: calzone, rellena, leon, focaccia, can, water
     ------------------------------------------------------------------------ */
  menu: [
    {
      "title": "Le classiche",
      "note": "Las de toda la vida",
      "items": [
        {
          "id": "margherita",
          "name": "Margherita",
          "description": "Albahaca",
          "prices": [
            {
              "label": "Mediana",
              "price": 5.5
            },
            {
              "label": "Familiar",
              "price": 10.0
            }
          ],
          "badge": "La clásica",
          "art": {
            "toppings": [
              "cheese",
              "basil"
            ]
          }
        },
        {
          "id": "prosciutto",
          "name": "Prosciutto",
          "description": "Jamón cocido, orégano",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.0
            },
            {
              "label": "Familiar",
              "price": 11.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "oregano",
              "ham"
            ]
          }
        },
        {
          "id": "prosciutto-e-funghi",
          "name": "Prosciutto e Funghi",
          "description": "Jamón cocido, champiñón",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.5
            },
            {
              "label": "Familiar",
              "price": 12.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "ham",
              "mushroom"
            ]
          }
        },
        {
          "id": "diavola",
          "name": "Diavola",
          "description": "Salami picante, guindilla",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.0
            },
            {
              "label": "Familiar",
              "price": 11.5
            }
          ],
          "badge": "Picante",
          "hot": true,
          "art": {
            "toppings": [
              "cheese",
              "salami",
              "chili"
            ]
          }
        },
        {
          "id": "napoli",
          "name": "Napoli",
          "description": "Anchoas, orégano",
          "prices": [
            {
              "label": "Mediana",
              "price": 6.5
            },
            {
              "label": "Familiar",
              "price": 11.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "anchovy",
              "oregano"
            ]
          }
        },
        {
          "id": "romana",
          "name": "Romana",
          "description": "Alcaparras, anchoas, orégano",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.0
            },
            {
              "label": "Familiar",
              "price": 11.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "caper",
              "anchovy",
              "oregano"
            ]
          }
        },
        {
          "id": "siciliana",
          "name": "Siciliana",
          "description": "Alcaparras, anchoas, aceitunas, orégano",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.5
            },
            {
              "label": "Familiar",
              "price": 12.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "caper",
              "anchovy",
              "olive",
              "oregano"
            ]
          }
        },
        {
          "id": "pugliese",
          "name": "Pugliese",
          "description": "Cebolla",
          "prices": [
            {
              "label": "Mediana",
              "price": 6.0
            },
            {
              "label": "Familiar",
              "price": 10.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "onion"
            ]
          }
        },
        {
          "id": "quattro-formaggi",
          "name": "Quattro Formaggi",
          "description": "Grana padano, gorgonzola, fontina",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.5
            },
            {
              "label": "Familiar",
              "price": 12.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "grana"
            ]
          }
        },
        {
          "id": "quattro-stagioni",
          "name": "Quattro Stagioni",
          "description": "Jamón cocido, champiñón, alcachofas, pimiento",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.5
            },
            {
              "label": "Familiar",
              "price": 12.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "ham",
              "mushroom",
              "pepper",
              "artichoke"
            ]
          }
        },
        {
          "id": "capricciosa",
          "name": "Capricciosa",
          "description": "Champiñón, jamón cocido, aceitunas, alcachofas",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.5
            },
            {
              "label": "Familiar",
              "price": 12.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "olive",
              "ham",
              "mushroom",
              "artichoke"
            ]
          }
        },
        {
          "id": "hawaiana",
          "name": "Hawaiana",
          "description": "Jamón cocido, piña",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.5
            },
            {
              "label": "Familiar",
              "price": 12.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "ham",
              "pineapple"
            ]
          }
        },
        {
          "id": "alemana",
          "name": "Alemana",
          "description": "Salchicha",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.0
            },
            {
              "label": "Familiar",
              "price": 11.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "sausage"
            ]
          }
        },
        {
          "id": "serrano",
          "name": "Serrano",
          "description": "Jamón serrano",
          "prices": [
            {
              "label": "Mediana",
              "price": 8.0
            },
            {
              "label": "Familiar",
              "price": 12.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "serrano"
            ]
          }
        }
      ]
    },
    {
      "title": "Especiales",
      "note": "Con nombre propio",
      "items": [
        {
          "id": "cuor-di-pizza",
          "name": "Cuor di Pizza",
          "description": "Bresaola, setas porcini, grana padano, rúcula, tomate cherry",
          "prices": [
            {
              "label": "Mediana",
              "price": 10.0
            },
            {
              "label": "Familiar",
              "price": 14.5
            }
          ],
          "badge": "Lleva nuestro nombre",
          "hot": true,
          "art": {
            "toppings": [
              "cheese",
              "cherry",
              "grana",
              "porcini",
              "bresaola",
              "arugula"
            ]
          }
        },
        {
          "id": "arucas",
          "name": "Arucas",
          "description": "Chorizo, pimiento",
          "prices": [
            {
              "label": "Mediana",
              "price": 8.0
            },
            {
              "label": "Familiar",
              "price": 12.5
            }
          ],
          "badge": "Como el pueblo",
          "art": {
            "toppings": [
              "cheese",
              "pepper",
              "chorizo"
            ]
          }
        },
        {
          "id": "leon-y-castillo",
          "name": "León y Castillo",
          "description": "Medio calzone, media pizza al gusto",
          "prices": [
            {
              "label": "Mediana",
              "price": 9.5
            },
            {
              "label": "Familiar",
              "price": 14.0
            }
          ],
          "badge": "Como nuestra calle",
          "tag": "Medio calzone, media pizza",
          "dish": "leon",
          "art": {
            "toppings": [
              "cheese"
            ]
          }
        },
        {
          "id": "catedral",
          "name": "Catedral",
          "description": "Atún, cebolla, orégano",
          "prices": [
            {
              "label": "Mediana",
              "price": 8.0
            },
            {
              "label": "Familiar",
              "price": 12.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "oregano",
              "onion",
              "tuna"
            ]
          }
        },
        {
          "id": "golosa",
          "name": "Golosa",
          "description": "Bresaola, grana padano, rúcula, aceite extra virgen y pimienta negra",
          "prices": [
            {
              "label": "Mediana",
              "price": 9.5
            },
            {
              "label": "Familiar",
              "price": 14.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "grana",
              "bresaola",
              "arugula"
            ]
          }
        },
        {
          "id": "deliciosa",
          "name": "Deliciosa",
          "description": "Jamón serrano, rúcula, tomate cherry, grana padano",
          "prices": [
            {
              "label": "Mediana",
              "price": 9.0
            },
            {
              "label": "Familiar",
              "price": 13.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "cherry",
              "grana",
              "arugula",
              "serrano"
            ]
          }
        },
        {
          "id": "genova",
          "name": "Génova",
          "description": "Pesto, tomate cherry, nueces",
          "prices": [
            {
              "label": "Mediana",
              "price": 8.5
            },
            {
              "label": "Familiar",
              "price": 13.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "pesto",
              "cherry",
              "walnut"
            ]
          }
        },
        {
          "id": "carbonara",
          "name": "Carbonara",
          "description": "Panceta, huevos, grana padano, pimienta negra",
          "prices": [
            {
              "label": "Mediana",
              "price": 8.5
            },
            {
              "label": "Familiar",
              "price": 13.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "bacon",
              "egg",
              "grana"
            ]
          }
        },
        {
          "id": "cochina",
          "name": "Cochina",
          "description": "Panceta italiana, papas, pimiento, romero",
          "prices": [
            {
              "label": "Mediana",
              "price": 8.5
            },
            {
              "label": "Familiar",
              "price": 13.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "bacon",
              "pepper",
              "potato",
              "rosemary"
            ]
          }
        },
        {
          "id": "popeye",
          "name": "Popeye",
          "description": "Espinacas, grana padano, ajo",
          "prices": [
            {
              "label": "Mediana",
              "price": 8.0
            },
            {
              "label": "Familiar",
              "price": 12.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "grana",
              "spinach",
              "garlic"
            ]
          }
        },
        {
          "id": "speedy-gonzalez",
          "name": "Speedy González",
          "description": "Carne de ternera, pimiento y bacon (picante al gusto)",
          "prices": [
            {
              "label": "Mediana",
              "price": 10.0
            },
            {
              "label": "Familiar",
              "price": 14.5
            }
          ],
          "badge": "Picante al gusto",
          "hot": true,
          "art": {
            "toppings": [
              "cheese",
              "bacon",
              "pepper",
              "meat"
            ]
          }
        },
        {
          "id": "carnivora",
          "name": "Carnívora",
          "description": "Bacon, carne, salami picante, salchicha, jamón cocido",
          "prices": [
            {
              "label": "Mediana",
              "price": 13.0
            },
            {
              "label": "Familiar",
              "price": 17.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "bacon",
              "ham",
              "meat",
              "salami",
              "sausage"
            ]
          }
        },
        {
          "id": "italia",
          "name": "Italia",
          "description": "Calabacín, tomate cherry, langostinos y rúcula",
          "prices": [
            {
              "label": "Mediana",
              "price": 9.5
            },
            {
              "label": "Familiar",
              "price": 14.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "cherry",
              "prawn",
              "arugula",
              "zucchini"
            ]
          }
        },
        {
          "id": "bianca-e-rosa",
          "name": "Bianca e Rosa",
          "description": "Atún, jamón cocido y langostinos",
          "prices": [
            {
              "label": "Mediana",
              "price": 10.5
            },
            {
              "label": "Familiar",
              "price": 15.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "ham",
              "prawn",
              "tuna"
            ]
          }
        }
      ]
    },
    {
      "title": "Mar y huerta",
      "note": "Marisco, setas y verduras",
      "items": [
        {
          "id": "mare-e-monti",
          "name": "Mare e Monti",
          "description": "Mix de setas, langostinos, ajo y perejil",
          "prices": [
            {
              "label": "Mediana",
              "price": 11.5
            },
            {
              "label": "Familiar",
              "price": 16.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "porcini",
              "prawn",
              "oregano",
              "garlic"
            ]
          }
        },
        {
          "id": "del-mar",
          "name": "del Mar",
          "description": "Cangrejo, langostinos, ajo, perejil",
          "prices": [
            {
              "label": "Mediana",
              "price": 9.0
            },
            {
              "label": "Familiar",
              "price": 13.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "prawn",
              "crab",
              "oregano",
              "garlic"
            ]
          }
        },
        {
          "id": "boscaiola",
          "name": "Boscaiola",
          "description": "Mix de setas, ajo, perejil",
          "prices": [
            {
              "label": "Mediana",
              "price": 9.0
            },
            {
              "label": "Familiar",
              "price": 13.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "porcini",
              "oregano",
              "garlic"
            ]
          }
        },
        {
          "id": "vegetal",
          "name": "Vegetal",
          "description": "Calabacín, pimiento, rúcula, tomate cherry",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.5
            },
            {
              "label": "Familiar",
              "price": 12.0
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "cherry",
              "arugula",
              "zucchini",
              "pepper"
            ]
          }
        },
        {
          "id": "vegetal-especial",
          "name": "Vegetal Especial",
          "description": "Calabacín, champiñones, ajo, perejil y pimiento",
          "prices": [
            {
              "label": "Mediana",
              "price": 9.0
            },
            {
              "label": "Familiar",
              "price": 13.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "mushroom",
              "zucchini",
              "pepper",
              "oregano",
              "garlic"
            ]
          }
        }
      ]
    },
    {
      "title": "Calzone y rellenas",
      "note": "Dobladas o rellenas",
      "items": [
        {
          "id": "calzone",
          "name": "Calzone",
          "description": "Jamón cocido, champiñón",
          "prices": [
            {
              "label": "Mediana",
              "price": 7.5
            },
            {
              "label": "Familiar",
              "price": 12.0
            }
          ],
          "dish": "calzone",
          "art": {
            "toppings": [
              "cheese",
              "ham",
              "mushroom"
            ]
          }
        },
        {
          "id": "calzone-farcito",
          "name": "Calzone Farcito",
          "description": "Jamón cocido, champiñón, alcachofas, pimiento",
          "prices": [
            {
              "label": "Mediana",
              "price": 8.0
            },
            {
              "label": "Familiar",
              "price": 12.5
            }
          ],
          "dish": "calzone",
          "art": {
            "toppings": [
              "cheese",
              "ham",
              "mushroom",
              "pepper",
              "artichoke"
            ]
          }
        },
        {
          "id": "rellena",
          "name": "Rellena",
          "description": "A elegir entre: Atún y cebolla, Jamón cocido y salchicha o Jamón cocido y champiñón",
          "prices": [
            {
              "label": "Mediana",
              "price": 12.0
            },
            {
              "label": "Familiar",
              "price": 20.0
            }
          ],
          "tag": "Tres rellenos a elegir",
          "dish": "rellena",
          "art": {
            "toppings": [
              "cheese",
              "onion",
              "ham",
              "mushroom",
              "tuna",
              "sausage"
            ]
          }
        },
        {
          "id": "rellena-de-carne",
          "name": "Rellena de Carne",
          "description": "Carne de ternera, pimiento y bacon (picante al gusto)",
          "prices": [
            {
              "label": "Mediana",
              "price": 16.0
            },
            {
              "label": "Familiar",
              "price": 24.0
            }
          ],
          "tag": "Picante al gusto",
          "dish": "rellena",
          "art": {
            "toppings": [
              "cheese",
              "bacon",
              "pepper",
              "meat"
            ]
          }
        }
      ]
    },
    {
      "title": "Focaccia",
      "note": "De la focacceria",
      "items": [
        {
          "id": "focaccia",
          "name": "Focaccia",
          "tag": "Cuatro sabores a elegir",
          "badge": "Focacceria",
          "description": "A elegir entre: ajo, perejil y aceite de oliva virgen; romero, sal gorda y aceite de oliva virgen; tomate, ajo y orégano; o mozzarella y orégano.",
          "prices": [
            {
              "label": "Mediana",
              "price": 3.5
            }
          ],
          "dish": "focaccia"
        }
      ]
    },
    {
      "title": "Bebidas",
      "note": "Refrescos y agua",
      "items": [
        {
          "id": "agua-pequena",
          "name": "Agua pequeña",
          "description": "Agua mineral",
          "prices": [
            {
              "label": "",
              "price": 2.0
            }
          ],
          "dish": "water"
        },
        {
          "id": "coca-cola-zero",
          "name": "Coca-Cola Zero",
          "description": "Lata de 33 cl",
          "prices": [
            {
              "label": "",
              "price": 2.0
            }
          ],
          "dish": "can",
          "color": "#1C1A1A"
        },
        {
          "id": "nestea",
          "name": "Nestea",
          "description": "Lata de 33 cl",
          "prices": [
            {
              "label": "",
              "price": 2.0
            }
          ],
          "dish": "can",
          "color": "#C98B3A"
        },
        {
          "id": "7up",
          "name": "7up",
          "description": "Lata de 33 cl",
          "prices": [
            {
              "label": "",
              "price": 2.0
            }
          ],
          "dish": "can",
          "color": "#2E9E4F"
        },
        {
          "id": "fanta-limon",
          "name": "Fanta Limón",
          "description": "Lata de 33 cl",
          "prices": [
            {
              "label": "",
              "price": 2.0
            }
          ],
          "dish": "can",
          "color": "#F2D23A"
        },
        {
          "id": "coca-cola",
          "name": "Coca-Cola",
          "description": "Lata de 33 cl",
          "prices": [
            {
              "label": "",
              "price": 2.0
            }
          ],
          "dish": "can",
          "color": "#D3201C"
        },
        {
          "id": "fanta-naranja",
          "name": "Fanta Naranja",
          "description": "Lata de 33 cl",
          "prices": [
            {
              "label": "",
              "price": 2.0
            }
          ],
          "dish": "can",
          "color": "#F28A1E"
        },
        {
          "id": "clipper",
          "name": "Clipper",
          "description": "Lata de 33 cl",
          "prices": [
            {
              "label": "",
              "price": 2.0
            }
          ],
          "dish": "can",
          "color": "#E2507A"
        }
      ]
    }
  ],
};
