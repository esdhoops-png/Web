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
     CARTA REAL · fuente: carta del local en PDF (Cambios cour di pizza carta español).
     Cada plato:
       prices → tamaños y precios: [{ label: 'Normal', price: 7.5 }, …] (label vacío = precio único)
       badge  → etiqueta sobre la ilustración (hot: true la pinta en degradado)
       art    → ingredientes que se dibujan en la ilustración de la pizza
       dish   → ilustración especial: focaccia, rellena, bruschetta, tiramisu, pannacotta…
     Cada categoría: home: false → sale solo en la carta completa, no en las pestañas de la portada.
     ------------------------------------------------------------------------ */
  menu: [
    {
      "title": "Pizzas",
      "note": "Normal / XXL",
      "items": [
        {
          "id": "margherita",
          "name": "Margherita",
          "description": "Tomate y mozzarella.",
          "prices": [
            {
              "label": "Normal",
              "price": 7.5
            },
            {
              "label": "XXL",
              "price": 12
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "basil"
            ]
          },
          "badge": "La clásica"
        },
        {
          "id": "prosciutto",
          "name": "Prosciutto",
          "description": "Tomate, mozzarella y jamón cocido.",
          "prices": [
            {
              "label": "Normal",
              "price": 9
            },
            {
              "label": "XXL",
              "price": 14
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "ham",
              "oregano"
            ]
          }
        },
        {
          "id": "diavola",
          "name": "Diavola",
          "description": "Tomate, mozzarella y salami.",
          "prices": [
            {
              "label": "Normal",
              "price": 9.5
            },
            {
              "label": "XXL",
              "price": 15
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "salami"
            ]
          },
          "badge": "Picante",
          "hot": true
        },
        {
          "id": "prosciutto-e-funghi",
          "name": "Prosciutto e Funghi",
          "description": "Tomate, mozzarella, jamón cocido y champiñones.",
          "prices": [
            {
              "label": "Normal",
              "price": 10
            },
            {
              "label": "XXL",
              "price": 15.5
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
          "id": "vegetal",
          "name": "Vegetal",
          "description": "Tomate, mozzarella, calabacín, pimiento, rúcula y tomate cherry.",
          "prices": [
            {
              "label": "Normal",
              "price": 10
            },
            {
              "label": "XXL",
              "price": 15
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "zucchini",
              "pepper",
              "arugula",
              "cherry"
            ]
          }
        },
        {
          "id": "siciliana",
          "name": "Siciliana",
          "description": "Tomate, mozzarella, alcaparras, aceitunas y anchoas.",
          "prices": [
            {
              "label": "Normal",
              "price": 10.5
            },
            {
              "label": "XXL",
              "price": 16
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "caper",
              "olive",
              "anchovy"
            ]
          }
        },
        {
          "id": "quattro-formaggi",
          "name": "Quattro Formaggi",
          "description": "Tomate, mozzarella, Grana Padano, gorgonzola y fontina.",
          "prices": [
            {
              "label": "Normal",
              "price": 10
            },
            {
              "label": "XXL",
              "price": 15.5
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
          "id": "hawaiana",
          "name": "Hawaiana",
          "description": "Tomate, mozzarella, jamón cocido y piña.",
          "prices": [
            {
              "label": "Normal",
              "price": 9.5
            },
            {
              "label": "XXL",
              "price": 15
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
          "id": "quattro-stagioni",
          "name": "Quattro Stagioni",
          "description": "Tomate, mozzarella, jamón cocido, champiñones, alcachofas y pimiento.",
          "prices": [
            {
              "label": "Normal",
              "price": 11
            },
            {
              "label": "XXL",
              "price": 17
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "ham",
              "mushroom",
              "artichoke",
              "pepper"
            ]
          }
        },
        {
          "id": "catedral",
          "name": "Catedral",
          "description": "Tomate, mozzarella, atún y cebolla.",
          "prices": [
            {
              "label": "Normal",
              "price": 9.5
            },
            {
              "label": "XXL",
              "price": 14.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "tuna",
              "onion"
            ]
          }
        },
        {
          "id": "carbonara",
          "name": "Carbonara",
          "description": "Mozzarella, guanciale, huevo, Grana Padano y pimienta negra.",
          "prices": [
            {
              "label": "Normal",
              "price": 11
            },
            {
              "label": "XXL",
              "price": 16
            }
          ],
          "art": {
            "sauce": "white",
            "toppings": [
              "cheese",
              "bacon",
              "egg",
              "grana"
            ]
          }
        },
        {
          "id": "deliciosa",
          "name": "Deliciosa",
          "description": "Tomate, mozzarella, jamón serrano, rúcula y tomate cherry.",
          "prices": [
            {
              "label": "Normal",
              "price": 11
            },
            {
              "label": "XXL",
              "price": 16
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "serrano",
              "arugula",
              "cherry"
            ]
          }
        },
        {
          "id": "del-mar",
          "name": "Del Mar",
          "description": "Tomate, mozzarella, cangrejo, langostino, ajo y perejil.",
          "prices": [
            {
              "label": "Normal",
              "price": 11
            },
            {
              "label": "XXL",
              "price": 17
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "crab",
              "prawn",
              "garlic"
            ]
          }
        },
        {
          "id": "barbacoa",
          "name": "Barbacoa",
          "description": "Tomate, mozzarella, ternera, bacon, salchicha, cebolla y salsa barbacoa.",
          "prices": [
            {
              "label": "Normal",
              "price": 11.5
            },
            {
              "label": "XXL",
              "price": 17
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "meat",
              "bacon",
              "sausage",
              "onion"
            ]
          }
        },
        {
          "id": "cuor-di-pizza",
          "name": "Cuor di Pizza",
          "description": "Tomate, mozzarella, bresaola, porcini, Grana Padano, rúcula y tomate cherry.",
          "prices": [
            {
              "label": "Normal",
              "price": 12.5
            },
            {
              "label": "XXL",
              "price": 19
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "bresaola",
              "porcini",
              "grana",
              "arugula",
              "cherry"
            ]
          },
          "badge": "Lleva nuestro nombre",
          "hot": true
        },
        {
          "id": "mare-e-monti",
          "name": "Mare e Monti",
          "description": "Tomate, mozzarella, mix de setas, langostinos, ajo y perejil.",
          "prices": [
            {
              "label": "Normal",
              "price": 12
            },
            {
              "label": "XXL",
              "price": 18
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "porcini",
              "prawn",
              "garlic"
            ]
          }
        },
        {
          "id": "bianca-e-rosa",
          "name": "Bianca e Rosa",
          "description": "Tomate, mozzarella, atún, jamón cocido y langostinos.",
          "prices": [
            {
              "label": "Normal",
              "price": 12
            },
            {
              "label": "XXL",
              "price": 18.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "tuna",
              "ham",
              "prawn"
            ]
          }
        },
        {
          "id": "speedy-gonzalez",
          "name": "Speedy González",
          "description": "Tomate, mozzarella, ternera, pimiento y bacon.",
          "prices": [
            {
              "label": "Normal",
              "price": 11
            },
            {
              "label": "XXL",
              "price": 16.5
            }
          ],
          "art": {
            "toppings": [
              "cheese",
              "meat",
              "pepper",
              "bacon"
            ]
          }
        }
      ]
    },
    {
      "title": "Focaccias italianas",
      "note": "Recién salidas del horno",
      "items": [
        {
          "id": "ajo-perejil-y-aove",
          "name": "Ajo, perejil y AOVE",
          "description": "Ajo, perejil y aceite de oliva virgen extra.",
          "prices": [
            {
              "label": "",
              "price": 4.5
            }
          ],
          "dish": "focaccia"
        },
        {
          "id": "tomate-ajo-y-oregano",
          "name": "Tomate, ajo y orégano",
          "description": "Tomate, ajo y orégano.",
          "prices": [
            {
              "label": "",
              "price": 4.5
            }
          ],
          "dish": "focaccia"
        },
        {
          "id": "tricolor",
          "name": "Tricolor",
          "description": "Queso; tomate, ajo y orégano; ajo, perejil y aceite de oliva virgen extra.",
          "prices": [
            {
              "label": "",
              "price": 5
            }
          ],
          "dish": "focaccia"
        }
      ]
    },
    {
      "title": "Focaccias rellenas italianas",
      "items": [
        {
          "id": "la-mortadella",
          "name": "La Mortadella",
          "description": "Mortadela con pistacho, stracciatella, pesto de albahaca y pistacho troceado.",
          "prices": [
            {
              "label": "",
              "price": 11
            }
          ],
          "dish": "rellena"
        },
        {
          "id": "la-trufada",
          "name": "La Trufada",
          "description": "Prosciutto crudo, mozzarella fresca, crema de trufa y rúcula.",
          "prices": [
            {
              "label": "",
              "price": 12
            }
          ],
          "dish": "rellena"
        },
        {
          "id": "focaccia-la-diavola",
          "name": "La Diavola",
          "description": "Salami picante, mozzarella fresca, tomate y orégano.",
          "prices": [
            {
              "label": "",
              "price": 9.5
            }
          ],
          "dish": "rellena"
        },
        {
          "id": "la-porchetta",
          "name": "La Porchetta",
          "description": "Porchetta italiana, provola ahumada y crema de queso con pimienta negra.",
          "prices": [
            {
              "label": "",
              "price": 11.5
            }
          ],
          "dish": "rellena"
        }
      ]
    },
    {
      "title": "Focaccias rellenas canarias",
      "items": [
        {
          "id": "la-chorizo",
          "name": "La Chorizo",
          "description": "Chorizo de Teror, cebolla asada, queso de rulo, rúcula y miel.",
          "prices": [
            {
              "label": "",
              "price": 9
            }
          ],
          "dish": "rellena"
        },
        {
          "id": "pata-canaria",
          "name": "Pata Canaria",
          "description": "Pata asada, mojo rojo, cebolla asada, pimiento asado y queso semiduro.",
          "prices": [
            {
              "label": "",
              "price": 10.5
            }
          ],
          "dish": "rellena"
        },
        {
          "id": "la-cochina",
          "name": "La Cochina",
          "description": "Pulled pork, queso tierno, membrillo y un toque de salsa brava.",
          "prices": [
            {
              "label": "",
              "price": 10.5
            }
          ],
          "dish": "rellena"
        }
      ]
    },
    {
      "title": "Entrantes",
      "items": [
        {
          "id": "pan-de-ajo",
          "name": "Pan de ajo",
          "description": "Pan con mantequilla de ajo.",
          "prices": [
            {
              "label": "",
              "price": 2.5
            }
          ],
          "dish": "bruschetta"
        },
        {
          "id": "pan-de-ajo-con-queso",
          "name": "Pan de ajo con queso",
          "description": "Pan con mantequilla de ajo y queso.",
          "prices": [
            {
              "label": "",
              "price": 3
            }
          ],
          "dish": "bruschetta"
        }
      ]
    },
    {
      "title": "Ensaladas",
      "home": false,
      "items": [
        {
          "id": "ensalada-de-burrata",
          "name": "Ensalada de burrata",
          "description": "Melocotón, tomate, aguacate, rúcula, costra de parmesano, burrata, aceite picante y vinagre balsámico.",
          "prices": [
            {
              "label": "",
              "price": 12.5
            }
          ]
        },
        {
          "id": "ensalada-caprese",
          "name": "Ensalada caprese",
          "description": "Tomate, mozzarella, albahaca y pesto.",
          "prices": [
            {
              "label": "",
              "price": 8.5
            }
          ]
        },
        {
          "id": "ensalada-de-salmon-ahumado",
          "name": "Ensalada de salmón ahumado",
          "description": "Canónigos, mango, aguacate, mozzarella, tomate cherry, salmón ahumado y vinagreta de pesto.",
          "prices": [
            {
              "label": "",
              "price": 12.5
            }
          ]
        }
      ]
    },
    {
      "title": "Postres",
      "items": [
        {
          "id": "tiramisu-de-pistacho",
          "name": "Tiramisú de pistacho",
          "prices": [
            {
              "label": "",
              "price": 6.5
            }
          ],
          "dish": "tiramisu"
        },
        {
          "id": "brookie",
          "name": "Brookie",
          "prices": [
            {
              "label": "",
              "price": 6
            }
          ],
          "dish": "pannacotta"
        },
        {
          "id": "tarta-de-queso-y-chocolate",
          "name": "Tarta de queso y chocolate",
          "prices": [
            {
              "label": "",
              "price": 6.5
            }
          ],
          "dish": "pannacotta"
        }
      ]
    },
    {
      "title": "Bebidas frías",
      "home": false,
      "items": [
        {
          "id": "coca-cola-coca-cola-zero",
          "name": "Coca-Cola / Coca-Cola Zero",
          "prices": [
            {
              "label": "",
              "price": 2.5
            }
          ]
        },
        {
          "id": "refresco-de-naranja-limon-sprite",
          "name": "Refresco de naranja / limón / Sprite",
          "prices": [
            {
              "label": "",
              "price": 2.5
            }
          ]
        },
        {
          "id": "monster-aquarius",
          "name": "Monster / Aquarius",
          "prices": [
            {
              "label": "",
              "price": 3
            }
          ]
        },
        {
          "id": "nestea-de-mango-pina-limon",
          "name": "Nestea de mango-piña / limón",
          "prices": [
            {
              "label": "",
              "price": 3
            }
          ]
        },
        {
          "id": "appletiser",
          "name": "Appletiser",
          "prices": [
            {
              "label": "",
              "price": 3
            }
          ]
        },
        {
          "id": "vino-blanco",
          "name": "Vino blanco",
          "prices": [
            {
              "label": "",
              "price": 4.2
            }
          ]
        },
        {
          "id": "vino-tinto",
          "name": "Vino tinto",
          "prices": [
            {
              "label": "",
              "price": 4.2
            }
          ]
        }
      ]
    },
    {
      "title": "Cervezas",
      "home": false,
      "items": [
        {
          "id": "cana-moretti",
          "name": "Caña Moretti",
          "prices": [
            {
              "label": "",
              "price": 3
            }
          ]
        },
        {
          "id": "cana-cruzcampo-reserva",
          "name": "Caña Cruzcampo Reserva",
          "prices": [
            {
              "label": "",
              "price": 3.2
            }
          ]
        },
        {
          "id": "heineken",
          "name": "Heineken",
          "prices": [
            {
              "label": "",
              "price": 3.5
            }
          ]
        },
        {
          "id": "heineken-0-0",
          "name": "Heineken 0,0",
          "prices": [
            {
              "label": "",
              "price": 3.5
            }
          ]
        },
        {
          "id": "amstel-limon-0-0",
          "name": "Amstel Limón 0,0",
          "prices": [
            {
              "label": "",
              "price": 3.5
            }
          ]
        },
        {
          "id": "cruzcampo-limon",
          "name": "Cruzcampo Limón",
          "prices": [
            {
              "label": "",
              "price": 3.5
            }
          ]
        },
        {
          "id": "cruzcampo-sin-gluten",
          "name": "Cruzcampo sin gluten",
          "prices": [
            {
              "label": "",
              "price": 3.5
            }
          ]
        },
        {
          "id": "cruzcampo-reserva",
          "name": "Cruzcampo Reserva",
          "prices": [
            {
              "label": "",
              "price": 3.5
            }
          ]
        },
        {
          "id": "18-70",
          "name": "18/70",
          "prices": [
            {
              "label": "",
              "price": 3.5
            }
          ]
        },
        {
          "id": "moretti",
          "name": "Moretti",
          "prices": [
            {
              "label": "",
              "price": 3.5
            }
          ]
        }
      ]
    },
    {
      "title": "Cócteles",
      "home": false,
      "items": [
        {
          "id": "mojito-clasico",
          "name": "Mojito clásico",
          "prices": [
            {
              "label": "",
              "price": 7.5
            }
          ]
        },
        {
          "id": "mojito-de-fresa",
          "name": "Mojito de fresa",
          "prices": [
            {
              "label": "",
              "price": 7.5
            }
          ]
        },
        {
          "id": "mojito-de-maracuya",
          "name": "Mojito de maracuyá",
          "prices": [
            {
              "label": "",
              "price": 7.5
            }
          ]
        },
        {
          "id": "aperol-spritz",
          "name": "Aperol Spritz",
          "prices": [
            {
              "label": "",
              "price": 7
            }
          ]
        },
        {
          "id": "campari-spritz",
          "name": "Campari Spritz",
          "prices": [
            {
              "label": "",
              "price": 7
            }
          ]
        }
      ]
    },
    {
      "title": "Licores",
      "home": false,
      "items": [
        {
          "id": "baileys",
          "name": "Baileys",
          "prices": [
            {
              "label": "",
              "price": 6.5
            }
          ]
        },
        {
          "id": "amaretto",
          "name": "Amaretto",
          "prices": [
            {
              "label": "",
              "price": 6.5
            }
          ]
        },
        {
          "id": "limoncello",
          "name": "Limoncello",
          "prices": [
            {
              "label": "",
              "price": 6.5
            }
          ]
        }
      ]
    },
    {
      "title": "Zumos de fruta",
      "note": "Con base de zumo de manzana",
      "home": false,
      "items": [
        {
          "id": "pasion",
          "name": "Pasión",
          "description": "Fruta de la pasión, piña, mango y limón.",
          "prices": [
            {
              "label": "",
              "price": 5.5
            }
          ]
        },
        {
          "id": "lava",
          "name": "Lava",
          "description": "Mango, cereza, arándano y fresa.",
          "prices": [
            {
              "label": "",
              "price": 5.5
            }
          ]
        },
        {
          "id": "pina-colada",
          "name": "Piña Colada",
          "description": "Plátano, coco y piña.",
          "prices": [
            {
              "label": "",
              "price": 5.5
            }
          ]
        },
        {
          "id": "pitaya",
          "name": "Pitaya",
          "description": "Pitaya, mango y fresa.",
          "prices": [
            {
              "label": "",
              "price": 5.5
            }
          ]
        }
      ]
    },
    {
      "title": "Batidos con base de leche",
      "home": false,
      "items": [
        {
          "id": "cookies",
          "name": "Cookies",
          "description": "Cookies con helado de vainilla.",
          "prices": [
            {
              "label": "",
              "price": 5.7
            }
          ]
        },
        {
          "id": "batido-fresa",
          "name": "Fresa",
          "description": "Fresa y helado de vainilla.",
          "prices": [
            {
              "label": "",
              "price": 5.7
            }
          ]
        },
        {
          "id": "caramelo",
          "name": "Caramelo",
          "description": "Helado de vainilla con caramelo.",
          "prices": [
            {
              "label": "",
              "price": 5.7
            }
          ]
        },
        {
          "id": "platano",
          "name": "Plátano",
          "description": "Helado de vainilla con plátano.",
          "prices": [
            {
              "label": "",
              "price": 5.7
            }
          ]
        }
      ]
    }
  ],
};
