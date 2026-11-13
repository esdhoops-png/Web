/* =========================================================
   CUOR DI PIZZA — carta en inglés, francés y alemán
   La carta en español está en config.js. Aquí solo van las
   traducciones, por el id de cada plato y el título de cada
   categoría. Nombre vacío ('') = se deja el nombre original.
   ========================================================= */
window.CUOR_I18N = {
  langs: [
    { code: 'es', label: 'ES', name: 'Español' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'de', label: 'DE', name: 'Deutsch' },
  ],

  // Textos de la página de la carta
  ui: {
    es: {
      title: 'La carta · Cuor di Pizza', skip: 'Saltar al contenido', langs: 'Idioma de la carta',
      navAnatomy: 'Anatomía', navMenu: 'Carta', navCraft: 'El oficio', navFind: 'Dónde estamos',
      order: 'Pedir en la mesa', home: 'Volver al inicio', kicker: 'La carta',
      heading: 'Nuestra <em class="sauce-text">carta</em>',
      lead: 'Pizzas en tamaño normal y XXL, focaccias recién horneadas, entrantes, postres y bebidas. Ingredientes frescos y de primera calidad.',
      footTitle: '¿Te <em class="sauce-text">esperamos?</em>', delivery: 'Pedir a domicilio', directions: 'Cómo llegar',
      call: 'Llamar', reserve: 'Reservar mesa', group: 'Un local del Grupo 5mentarios',
    },
    en: {
      title: 'Menu · Cuor di Pizza', skip: 'Skip to content', langs: 'Menu language',
      navAnatomy: 'Anatomy', navMenu: 'Menu', navCraft: 'The craft', navFind: 'Find us',
      order: 'Order at the table', home: 'Back to home', kicker: 'The menu',
      heading: 'Our <em class="sauce-text">menu</em>',
      lead: 'Pizzas in regular and XXL sizes, freshly baked focaccias, starters, desserts and drinks. Fresh, top-quality ingredients.',
      footTitle: 'See you <em class="sauce-text">soon?</em>', delivery: 'Order delivery', directions: 'Directions',
      call: 'Call', reserve: 'Book a table', group: 'Part of Grupo 5mentarios',
    },
    fr: {
      title: 'La carte · Cuor di Pizza', skip: 'Aller au contenu', langs: 'Langue de la carte',
      navAnatomy: 'Anatomie', navMenu: 'Carte', navCraft: 'Le métier', navFind: 'Nous trouver',
      order: 'Commander à table', home: 'Retour à l’accueil', kicker: 'La carte',
      heading: 'Notre <em class="sauce-text">carte</em>',
      lead: 'Pizzas en taille normale et XXL, focaccias tout juste sorties du four, entrées, desserts et boissons. Des ingrédients frais et de première qualité.',
      footTitle: 'On vous <em class="sauce-text">attend ?</em>', delivery: 'Commander en livraison', directions: 'Itinéraire',
      call: 'Appeler', reserve: 'Réserver une table', group: 'Un établissement du Grupo 5mentarios',
    },
    de: {
      title: 'Speisekarte · Cuor di Pizza', skip: 'Zum Inhalt springen', langs: 'Sprache der Speisekarte',
      navAnatomy: 'Anatomie', navMenu: 'Speisekarte', navCraft: 'Das Handwerk', navFind: 'So finden Sie uns',
      order: 'Am Tisch bestellen', home: 'Zur Startseite', kicker: 'Die Speisekarte',
      heading: 'Unsere <em class="sauce-text">Speisekarte</em>',
      lead: 'Pizzen in Normal- und XXL-Größe, frisch gebackene Focaccias, Vorspeisen, Desserts und Getränke. Frische Zutaten von bester Qualität.',
      footTitle: 'Bis <em class="sauce-text">bald?</em>', delivery: 'Lieferung bestellen', directions: 'Anfahrt',
      call: 'Anrufen', reserve: 'Tisch reservieren', group: 'Ein Lokal der Grupo 5mentarios',
    },
  },

  // Tamaños de las pizzas
  sizes: {
    Normal: { en: 'Regular', fr: 'Normale', de: 'Normal' },
    XXL: { en: 'XXL', fr: 'XXL', de: 'XXL' },
  },

  // Categorías: título en español → [título, nota]
  cats: {
    'Pizzas': { en: ['Pizzas', 'Regular / XXL'], fr: ['Pizzas', 'Normale / XXL'], de: ['Pizzen', 'Normal / XXL'] },
    'Focaccias italianas': { en: ['Italian focaccias', 'Fresh from the oven'], fr: ['Focaccias italiennes', 'Tout juste sorties du four'], de: ['Italienische Focaccias', 'Frisch aus dem Ofen'] },
    'Focaccias rellenas italianas': { en: ['Italian filled focaccias'], fr: ['Focaccias garnies italiennes'], de: ['Gefüllte italienische Focaccias'] },
    'Focaccias rellenas canarias': { en: ['Canarian filled focaccias'], fr: ['Focaccias garnies canariennes'], de: ['Gefüllte kanarische Focaccias'] },
    'Entrantes': { en: ['Starters'], fr: ['Entrées'], de: ['Vorspeisen'] },
    'Ensaladas': { en: ['Salads'], fr: ['Salades'], de: ['Salate'] },
    'Postres': { en: ['Desserts'], fr: ['Desserts'], de: ['Desserts'] },
    'Bebidas frías': { en: ['Cold drinks'], fr: ['Boissons fraîches'], de: ['Kalte Getränke'] },
    'Cervezas': { en: ['Beers'], fr: ['Bières'], de: ['Biere'] },
    'Cócteles': { en: ['Cocktails'], fr: ['Cocktails'], de: ['Cocktails'] },
    'Licores': { en: ['Liqueurs'], fr: ['Liqueurs'], de: ['Liköre'] },
    'Zumos de fruta': { en: ['Fruit juices', 'Made with an apple juice base'], fr: ['Jus de fruits', 'À base de jus de pomme'], de: ['Fruchtsäfte', 'Auf Apfelsaftbasis'] },
    'Batidos con base de leche': { en: ['Milkshakes', 'Made with milk'], fr: ['Milk-shakes', 'À base de lait'], de: ['Milchshakes', 'Auf Milchbasis'] },
  },

  // Platos: id → { en: [nombre, descripción], fr: […], de: […] }
  items: {
    // Pizzas
    'margherita': { en: ['', 'Tomato and mozzarella.'], fr: ['', 'Tomate et mozzarella.'], de: ['', 'Tomate und Mozzarella.'] },
    'prosciutto': { en: ['', 'Tomato, mozzarella and cooked ham.'], fr: ['', 'Tomate, mozzarella et jambon cuit.'], de: ['', 'Tomate, Mozzarella und Kochschinken.'] },
    'diavola': { en: ['', 'Tomato, mozzarella and salami.'], fr: ['', 'Tomate, mozzarella et salami.'], de: ['', 'Tomate, Mozzarella und Salami.'] },
    'prosciutto-e-funghi': { en: ['', 'Tomato, mozzarella, cooked ham and mushrooms.'], fr: ['', 'Tomate, mozzarella, jambon cuit et champignons.'], de: ['', 'Tomate, Mozzarella, Kochschinken und Champignons.'] },
    'vegetal': { en: ['Vegetarian', 'Tomato, mozzarella, courgette, pepper, rocket and cherry tomatoes.'], fr: ['Végétarienne', 'Tomate, mozzarella, courgette, poivron, roquette et tomates cerises.'], de: ['Vegetarisch', 'Tomate, Mozzarella, Zucchini, Paprika, Rucola und Kirschtomaten.'] },
    'siciliana': { en: ['', 'Tomato, mozzarella, capers, olives and anchovies.'], fr: ['', 'Tomate, mozzarella, câpres, olives et anchois.'], de: ['', 'Tomate, Mozzarella, Kapern, Oliven und Sardellen.'] },
    'quattro-formaggi': { en: ['', 'Tomato, mozzarella, Grana Padano, gorgonzola and fontina.'], fr: ['', 'Tomate, mozzarella, Grana Padano, gorgonzola et fontina.'], de: ['', 'Tomate, Mozzarella, Grana Padano, Gorgonzola und Fontina.'] },
    'hawaiana': { en: ['Hawaiian', 'Tomato, mozzarella, cooked ham and pineapple.'], fr: ['Hawaïenne', 'Tomate, mozzarella, jambon cuit et ananas.'], de: ['Hawaii', 'Tomate, Mozzarella, Kochschinken und Ananas.'] },
    'quattro-stagioni': { en: ['', 'Tomato, mozzarella, cooked ham, mushrooms, artichokes and pepper.'], fr: ['', 'Tomate, mozzarella, jambon cuit, champignons, artichauts et poivron.'], de: ['', 'Tomate, Mozzarella, Kochschinken, Champignons, Artischocken und Paprika.'] },
    'catedral': { en: ['', 'Tomato, mozzarella, tuna and onion.'], fr: ['', 'Tomate, mozzarella, thon et oignon.'], de: ['', 'Tomate, Mozzarella, Thunfisch und Zwiebeln.'] },
    'carbonara': { en: ['', 'Mozzarella, guanciale, egg, Grana Padano and black pepper.'], fr: ['', 'Mozzarella, guanciale, œuf, Grana Padano et poivre noir.'], de: ['', 'Mozzarella, Guanciale, Ei, Grana Padano und schwarzer Pfeffer.'] },
    'deliciosa': { en: ['', 'Tomato, mozzarella, serrano ham, rocket and cherry tomatoes.'], fr: ['', 'Tomate, mozzarella, jambon serrano, roquette et tomates cerises.'], de: ['', 'Tomate, Mozzarella, Serranoschinken, Rucola und Kirschtomaten.'] },
    'del-mar': { en: ['', 'Tomato, mozzarella, crab, prawn, garlic and parsley.'], fr: ['', 'Tomate, mozzarella, crabe, crevette, ail et persil.'], de: ['', 'Tomate, Mozzarella, Krebsfleisch, Garnele, Knoblauch und Petersilie.'] },
    'barbacoa': { en: ['Barbecue', 'Tomato, mozzarella, beef, bacon, sausage, onion and barbecue sauce.'], fr: ['Barbecue', 'Tomate, mozzarella, bœuf, bacon, saucisse, oignon et sauce barbecue.'], de: ['Barbecue', 'Tomate, Mozzarella, Rindfleisch, Speck, Würstchen, Zwiebeln und Barbecuesauce.'] },
    'cuor-di-pizza': { en: ['', 'Tomato, mozzarella, bresaola, porcini, Grana Padano, rocket and cherry tomatoes.'], fr: ['', 'Tomate, mozzarella, bresaola, cèpes, Grana Padano, roquette et tomates cerises.'], de: ['', 'Tomate, Mozzarella, Bresaola, Steinpilze, Grana Padano, Rucola und Kirschtomaten.'] },
    'mare-e-monti': { en: ['', 'Tomato, mozzarella, mixed mushrooms, prawns, garlic and parsley.'], fr: ['', 'Tomate, mozzarella, mélange de champignons, crevettes, ail et persil.'], de: ['', 'Tomate, Mozzarella, Pilzmischung, Garnelen, Knoblauch und Petersilie.'] },
    'bianca-e-rosa': { en: ['', 'Tomato, mozzarella, tuna, cooked ham and prawns.'], fr: ['', 'Tomate, mozzarella, thon, jambon cuit et crevettes.'], de: ['', 'Tomate, Mozzarella, Thunfisch, Kochschinken und Garnelen.'] },
    'speedy-gonzalez': { en: ['', 'Tomato, mozzarella, beef, pepper and bacon.'], fr: ['', 'Tomate, mozzarella, bœuf, poivron et bacon.'], de: ['', 'Tomate, Mozzarella, Rindfleisch, Paprika und Speck.'] },

    // Focaccias italianas
    'ajo-perejil-y-aove': { en: ['Garlic, parsley & EVOO', 'Garlic, parsley and extra virgin olive oil.'], fr: ['Ail, persil et huile d’olive', 'Ail, persil et huile d’olive vierge extra.'], de: ['Knoblauch, Petersilie & Olivenöl', 'Knoblauch, Petersilie und natives Olivenöl extra.'] },
    'tomate-ajo-y-oregano': { en: ['Tomato, garlic & oregano', 'Tomato, garlic and oregano.'], fr: ['Tomate, ail et origan', 'Tomate, ail et origan.'], de: ['Tomate, Knoblauch & Oregano', 'Tomate, Knoblauch und Oregano.'] },
    'tricolor': { en: ['', 'Cheese; tomato, garlic and oregano; garlic, parsley and extra virgin olive oil.'], fr: ['', 'Fromage ; tomate, ail et origan ; ail, persil et huile d’olive vierge extra.'], de: ['', 'Käse; Tomate, Knoblauch und Oregano; Knoblauch, Petersilie und natives Olivenöl extra.'] },

    // Focaccias rellenas italianas
    'la-mortadella': { en: ['', 'Pistachio mortadella, stracciatella, basil pesto and chopped pistachios.'], fr: ['', 'Mortadelle à la pistache, stracciatella, pesto au basilic et pistaches concassées.'], de: ['', 'Mortadella mit Pistazien, Stracciatella, Basilikumpesto und gehackte Pistazien.'] },
    'la-trufada': { en: ['', 'Prosciutto crudo, fresh mozzarella, truffle cream and rocket.'], fr: ['', 'Prosciutto crudo, mozzarella fraîche, crème de truffe et roquette.'], de: ['', 'Prosciutto crudo, frischer Mozzarella, Trüffelcreme und Rucola.'] },
    'focaccia-la-diavola': { en: ['', 'Spicy salami, fresh mozzarella, tomato and oregano.'], fr: ['', 'Salami piquant, mozzarella fraîche, tomate et origan.'], de: ['', 'Scharfe Salami, frischer Mozzarella, Tomate und Oregano.'] },
    'la-porchetta': { en: ['', 'Italian porchetta, smoked provola and cream cheese with black pepper.'], fr: ['', 'Porchetta italienne, provola fumée et crème de fromage au poivre noir.'], de: ['', 'Italienische Porchetta, geräucherter Provola und Frischkäsecreme mit schwarzem Pfeffer.'] },

    // Focaccias rellenas canarias
    'la-chorizo': { en: ['', 'Chorizo from Teror, roasted onion, «rulo» goat cheese, rocket and honey.'], fr: ['', 'Chorizo de Teror, oignon rôti, fromage de chèvre «rulo», roquette et miel.'], de: ['', 'Chorizo aus Teror, geröstete Zwiebeln, Ziegenkäse «Rulo», Rucola und Honig.'] },
    'pata-canaria': { en: ['', 'Roast pork leg, red mojo, roasted onion, roasted pepper and semi-cured cheese.'], fr: ['', 'Jambon de porc rôti, mojo rouge, oignon rôti, poivron rôti et fromage demi-affiné.'], de: ['', 'Gebratene Schweinekeule, roter Mojo, geröstete Zwiebeln, gerösteter Paprika und halbfester Käse.'] },
    'la-cochina': { en: ['', 'Pulled pork, mild cheese, quince paste and a touch of spicy brava sauce.'], fr: ['', 'Pulled pork, fromage doux, pâte de coing et une touche de sauce brava.'], de: ['', 'Pulled Pork, milder Käse, Quittenpaste und ein Hauch scharfe Brava-Sauce.'] },

    // Entrantes
    'pan-de-ajo': { en: ['Garlic bread', 'Bread with garlic butter.'], fr: ['Pain à l’ail', 'Pain au beurre d’ail.'], de: ['Knoblauchbrot', 'Brot mit Knoblauchbutter.'] },
    'pan-de-ajo-con-queso': { en: ['Cheesy garlic bread', 'Bread with garlic butter and cheese.'], fr: ['Pain à l’ail et au fromage', 'Pain au beurre d’ail et fromage.'], de: ['Knoblauchbrot mit Käse', 'Brot mit Knoblauchbutter und Käse.'] },

    // Ensaladas
    'ensalada-de-burrata': { en: ['Burrata salad', 'Peach, tomato, avocado, rocket, parmesan crisp, burrata, spicy oil and balsamic vinegar.'], fr: ['Salade burrata', 'Pêche, tomate, avocat, roquette, croustillant de parmesan, burrata, huile pimentée et vinaigre balsamique.'], de: ['Burrata-Salat', 'Pfirsich, Tomate, Avocado, Rucola, Parmesankruste, Burrata, scharfes Öl und Balsamico.'] },
    'ensalada-caprese': { en: ['Caprese salad', 'Tomato, mozzarella, basil and pesto.'], fr: ['Salade caprese', 'Tomate, mozzarella, basilic et pesto.'], de: ['Caprese-Salat', 'Tomate, Mozzarella, Basilikum und Pesto.'] },
    'ensalada-de-salmon-ahumado': { en: ['Smoked salmon salad', 'Lamb’s lettuce, mango, avocado, mozzarella, cherry tomatoes, smoked salmon and pesto vinaigrette.'], fr: ['Salade au saumon fumé', 'Mâche, mangue, avocat, mozzarella, tomates cerises, saumon fumé et vinaigrette au pesto.'], de: ['Salat mit Räucherlachs', 'Feldsalat, Mango, Avocado, Mozzarella, Kirschtomaten, Räucherlachs und Pesto-Vinaigrette.'] },

    // Postres
    'tiramisu-de-pistacho': { en: ['Pistachio tiramisu', ''], fr: ['Tiramisu à la pistache', ''], de: ['Pistazien-Tiramisu', ''] },
    'brookie': { en: ['', ''], fr: ['', ''], de: ['', ''] },
    'tarta-de-queso-y-chocolate': { en: ['Chocolate cheesecake', ''], fr: ['Cheesecake au chocolat', ''], de: ['Schoko-Käsekuchen', ''] },

    // Bebidas frías
    'refresco-de-naranja-limon-sprite': { en: ['Orange / lemon soda / Sprite', ''], fr: ['Soda orange / citron / Sprite', ''], de: ['Orangen- / Zitronenlimonade / Sprite', ''] },
    'nestea-de-mango-pina-limon': { en: ['Nestea mango-pineapple / lemon', ''], fr: ['Nestea mangue-ananas / citron', ''], de: ['Nestea Mango-Ananas / Zitrone', ''] },
    'vino-blanco': { en: ['White wine', ''], fr: ['Vin blanc', ''], de: ['Weißwein', ''] },
    'vino-tinto': { en: ['Red wine', ''], fr: ['Vin rouge', ''], de: ['Rotwein', ''] },

    // Cervezas
    'cana-moretti': { en: ['Draught Moretti', ''], fr: ['Moretti pression', ''], de: ['Moretti vom Fass', ''] },
    'cana-cruzcampo-reserva': { en: ['Draught Cruzcampo Reserva', ''], fr: ['Cruzcampo Reserva pression', ''], de: ['Cruzcampo Reserva vom Fass', ''] },
    'amstel-limon-0-0': { en: ['Amstel Lemon 0.0', ''], fr: ['Amstel Citron 0,0', ''], de: ['Amstel Zitrone 0,0', ''] },
    'heineken-0-0': { en: ['Heineken 0.0', ''], fr: ['', ''], de: ['', ''] },
    'cruzcampo-limon': { en: ['Cruzcampo Lemon', ''], fr: ['Cruzcampo Citron', ''], de: ['Cruzcampo Zitrone', ''] },
    'cruzcampo-sin-gluten': { en: ['Cruzcampo gluten-free', ''], fr: ['Cruzcampo sans gluten', ''], de: ['Cruzcampo glutenfrei', ''] },

    // Cócteles
    'mojito-clasico': { en: ['Classic mojito', ''], fr: ['Mojito classique', ''], de: ['Klassischer Mojito', ''] },
    'mojito-de-fresa': { en: ['Strawberry mojito', ''], fr: ['Mojito à la fraise', ''], de: ['Erdbeer-Mojito', ''] },
    'mojito-de-maracuya': { en: ['Passion fruit mojito', ''], fr: ['Mojito aux fruits de la passion', ''], de: ['Maracuja-Mojito', ''] },

    // Zumos de fruta
    'pasion': { en: ['Passion', 'Passion fruit, pineapple, mango and lemon.'], fr: ['Passion', 'Fruit de la passion, ananas, mangue et citron.'], de: ['Passion', 'Maracuja, Ananas, Mango und Zitrone.'] },
    'lava': { en: ['', 'Mango, cherry, blueberry and strawberry.'], fr: ['', 'Mangue, cerise, myrtille et fraise.'], de: ['', 'Mango, Kirsche, Heidelbeere und Erdbeere.'] },
    'pina-colada': { en: ['', 'Banana, coconut and pineapple.'], fr: ['', 'Banane, noix de coco et ananas.'], de: ['', 'Banane, Kokosnuss und Ananas.'] },
    'pitaya': { en: ['', 'Dragon fruit, mango and strawberry.'], fr: ['', 'Pitaya, mangue et fraise.'], de: ['', 'Drachenfrucht, Mango und Erdbeere.'] },

    // Batidos
    'cookies': { en: ['', 'Cookies with vanilla ice cream.'], fr: ['', 'Cookies et glace à la vanille.'], de: ['', 'Cookies mit Vanilleeis.'] },
    'batido-fresa': { en: ['Strawberry', 'Strawberry and vanilla ice cream.'], fr: ['Fraise', 'Fraise et glace à la vanille.'], de: ['Erdbeere', 'Erdbeere und Vanilleeis.'] },
    'caramelo': { en: ['Caramel', 'Vanilla ice cream with caramel.'], fr: ['Caramel', 'Glace à la vanille et caramel.'], de: ['Karamell', 'Vanilleeis mit Karamell.'] },
    'platano': { en: ['Banana', 'Vanilla ice cream with banana.'], fr: ['Banane', 'Glace à la vanille et banane.'], de: ['Banane', 'Vanilleeis mit Banane.'] },
  },
};
