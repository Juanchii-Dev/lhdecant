// Script para agregar perfumes usando el servidor local con autenticación admin
import fetch from 'node-fetch';

// Primero hacer login como admin
async function loginAsAdmin() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'lhdecant@gmail.com',
        password: '11qqaazz'
      })
    });

    if (response.ok) {
      console.log('✅ Login exitoso como admin');
      return true;
    } else {
      console.log('❌ Error en login:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    return false;
  }
}

const perfumes = [
  {
    name: "Fakhar Black",
    brand: "Lattafa",
    description: "Una fragancia oriental intensa y misteriosa que combina notas de incienso, ámbar y especias exóticas. Perfecta para ocasiones nocturnas y eventos especiales.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["12.00", "20.00", "28.00"],
    category: "unisex",
    notes: ["Incienso", "Ámbar", "Especias", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.3",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Le Beau Parfum",
    brand: "Jean Paul Gaultier",
    description: "Una fragancia masculina moderna y atrevida que combina frescura mediterránea con sensualidad. Perfecta para el hombre contemporáneo que busca distinción.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["25.00", "45.00", "65.00"],
    category: "masculine",
    notes: ["Bergamota", "Cardamomo", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Scandal Pour Homme",
    brand: "Jean Paul Gaultier",
    description: "Una fragancia masculina audaz y provocativa que desafía las convenciones. Combina frescura cítrica con notas amaderadas y especiadas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["22.00", "40.00", "58.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.4",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Scandal Pour Homme Absolu",
    brand: "Jean Paul Gaultier",
    description: "La versión más intensa y concentrada de Scandal. Una fragancia masculina poderosa que combina frescura extrema con profundidad amaderada.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["28.00", "50.00", "72.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta Negra", "Cedro", "Vetiver", "Ámbar Gris"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Scandal Le Parfum Pour Homme",
    brand: "Jean Paul Gaultier",
    description: "La versión más concentrada y duradera de Scandal. Una fragancia masculina de parfum que combina elegancia con audacia.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["32.00", "58.00", "85.00"],
    category: "masculine",
    notes: ["Bergamota", "Cardamomo", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.7",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Invictus Absolu Parfum",
    brand: "Paco Rabanne",
    description: "La versión más intensa y concentrada de Invictus. Una fragancia masculina de parfum que combina frescura extrema con profundidad amaderada.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["30.00", "55.00", "80.00"],
    category: "masculine",
    notes: ["Pomelo", "Laurel", "Cedro", "Ambergris", "Guayaco"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "One Million",
    brand: "Paco Rabanne",
    description: "Una fragancia masculina icónica que combina frescura cítrica con notas especiadas y amaderadas. Perfecta para el hombre que busca distinción.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["25.00", "45.00", "65.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta", "Canela", "Cedro", "Ámbar"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Phantom Eau de Toilette",
    brand: "Paco Rabanne",
    description: "Una fragancia masculina futurista que combina tecnología olfativa con notas tradicionales. Una experiencia sensorial única.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["28.00", "50.00", "72.00"],
    category: "masculine",
    notes: ["Bergamota", "Lavanda", "Vetiver", "Ámbar", "Cedro"],
    imageUrl: "",
    rating: "4.4",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Bad Boy Le Parfum",
    brand: "Carolina Herrera",
    description: "Una fragancia masculina audaz y provocativa que combina frescura cítrica con notas especiadas y amaderadas. Para el hombre que no teme destacar.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["26.00", "48.00", "70.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Le Male Elixir",
    brand: "Jean Paul Gaultier",
    description: "La versión más concentrada y sensual de Le Male. Una fragancia masculina de elixir que combina frescura con profundidad amaderada.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["32.00", "58.00", "85.00"],
    category: "masculine",
    notes: ["Bergamota", "Cardamomo", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.7",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Le Male",
    brand: "Jean Paul Gaultier",
    description: "Una fragancia masculina icónica que combina frescura mediterránea con sensualidad. Perfecta para el hombre que busca distinción y elegancia.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["24.00", "42.00", "60.00"],
    category: "masculine",
    notes: ["Bergamota", "Lavanda", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Khamrah Qahwa",
    brand: "Lattafa",
    description: "Una fragancia oriental intensa inspirada en el café árabe. Combina notas de café, especias y ámbar para una experiencia olfativa única.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["15.00", "25.00", "35.00"],
    category: "unisex",
    notes: ["Café", "Cardamomo", "Ámbar", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.4",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Maahir Legacy",
    brand: "Lattafa",
    description: "Una fragancia oriental sofisticada que combina tradición con modernidad. Notas de incienso, ámbar y especias exóticas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["18.00", "30.00", "42.00"],
    category: "unisex",
    notes: ["Incienso", "Ámbar", "Especias", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.3",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Hayati Al Maleky",
    brand: "Lattafa",
    description: "Una fragancia oriental real que combina lujo y elegancia. Notas de rosa, ámbar y especias nobles para una experiencia olfativa majestuosa.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["20.00", "35.00", "50.00"],
    category: "unisex",
    notes: ["Rosa", "Ámbar", "Especias", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Bleu de Chanel Le Parfum",
    brand: "Chanel",
    description: "La versión más concentrada y sofisticada de Bleu de Chanel. Una fragancia masculina de parfum que combina elegancia con modernidad.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["40.00", "75.00", "110.00"],
    category: "masculine",
    notes: ["Limón", "Menta", "Sándalo", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.8",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Myslf Eau de Parfum",
    brand: "Yves Saint Laurent",
    description: "Una fragancia masculina moderna que celebra la autenticidad. Combina frescura cítrica con profundidad amaderada para el hombre contemporáneo.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["30.00", "55.00", "80.00"],
    category: "masculine",
    notes: ["Bergamota", "Lavanda", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.4",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Honor and Glory",
    brand: "Amouage",
    description: "Una fragancia de nicho sofisticada que combina tradición con innovación. Notas de incienso, ámbar y especias nobles para una experiencia olfativa única.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["45.00", "85.00", "125.00"],
    category: "unisex",
    notes: ["Incienso", "Ámbar", "Especias", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.7",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Montale Tonka",
    brand: "Montale",
    description: "Una fragancia de nicho que celebra la tonka en toda su gloria. Una mezcla opulenta y sensual que combina dulzura con profundidad.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["35.00", "65.00", "95.00"],
    category: "unisex",
    notes: ["Tonka", "Vainilla", "Cacao", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Born in Roma",
    brand: "Valentino",
    description: "Una fragancia masculina moderna que celebra la herencia italiana. Combina frescura mediterránea con elegancia contemporánea.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["28.00", "50.00", "72.00"],
    category: "masculine",
    notes: ["Bergamota", "Lavanda", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Stronger With You",
    brand: "Armani",
    description: "Una fragancia masculina que celebra la conexión humana. Combina frescura cítrica con notas especiadas y amaderadas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["26.00", "48.00", "70.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Mandarin Sky",
    brand: "Kilian",
    description: "Una fragancia de nicho que celebra la mandarina en toda su frescura. Una experiencia olfativa luminosa y vibrante.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["40.00", "75.00", "110.00"],
    category: "unisex",
    notes: ["Mandarina", "Bergamota", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.7",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Asad Bourbon",
    brand: "Lattafa",
    description: "Una fragancia oriental inspirada en el bourbon americano. Combina notas de vainilla, cacao y especias para una experiencia olfativa única.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["16.00", "28.00", "40.00"],
    category: "unisex",
    notes: ["Vainilla", "Cacao", "Especias", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.3",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Hawas Ice",
    brand: "Rasasi",
    description: "Una fragancia masculina fresca y moderna que combina frescura extrema con profundidad amaderada. Perfecta para el hombre contemporáneo.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["20.00", "35.00", "50.00"],
    category: "masculine",
    notes: ["Bergamota", "Menta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.4",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Liquid Brum",
    brand: "Lattafa",
    description: "Una fragancia oriental moderna que combina tradición con innovación. Notas de incienso, ámbar y especias exóticas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["14.00", "24.00", "34.00"],
    category: "unisex",
    notes: ["Incienso", "Ámbar", "Especias", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.2",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "9 PM",
    brand: "Afnan",
    description: "Una fragancia masculina nocturna que combina frescura cítrica con notas especiadas y amaderadas. Perfecta para ocasiones nocturnas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["18.00", "32.00", "46.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.3",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Perfume Asad",
    brand: "Lattafa",
    description: "Una fragancia oriental intensa que combina notas de incienso, ámbar y especias exóticas. Una experiencia olfativa única y misteriosa.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["15.00", "25.00", "35.00"],
    category: "unisex",
    notes: ["Incienso", "Ámbar", "Especias", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.4",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Vintage Radio",
    brand: "Lattafa",
    description: "Una fragancia oriental que evoca nostalgia y elegancia. Combina notas de incienso, ámbar y especias nobles para una experiencia olfativa única.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["17.00", "30.00", "43.00"],
    category: "unisex",
    notes: ["Incienso", "Ámbar", "Especias", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.3",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Jean Lowe Ozure",
    brand: "Lattafa",
    description: "Una fragancia de nicho que combina elegancia con modernidad. Notas de incienso, ámbar y especias nobles para una experiencia olfativa sofisticada.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["22.00", "40.00", "58.00"],
    category: "unisex",
    notes: ["Incienso", "Ámbar", "Especias", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Erba Pura",
    brand: "Xerjoff",
    description: "Una fragancia de nicho que celebra la pureza de la naturaleza. Combina frescura cítrica con notas florales y amaderadas para una experiencia olfativa única.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["50.00", "95.00", "140.00"],
    category: "unisex",
    notes: ["Bergamota", "Jazmín", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.8",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Eros",
    brand: "Versace",
    description: "Una fragancia masculina icónica que combina frescura mediterránea con sensualidad. Perfecta para el hombre que busca distinción y elegancia.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["24.00", "42.00", "60.00"],
    category: "masculine",
    notes: ["Bergamota", "Menta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Homme Intense",
    brand: "Dior",
    description: "La versión más intensa y sofisticada de Dior Homme. Una fragancia masculina de parfum que combina elegancia con modernidad.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["35.00", "65.00", "95.00"],
    category: "masculine",
    notes: ["Bergamota", "Lavanda", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.7",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Luna Rossa Ocean Vapo",
    brand: "Prada",
    description: "Una fragancia masculina moderna que celebra la frescura oceánica. Combina notas marinas con profundidad amaderada para una experiencia olfativa única.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["28.00", "50.00", "72.00"],
    category: "masculine",
    notes: ["Bergamota", "Algas", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Sauvage Elixir",
    brand: "Dior",
    description: "La versión más concentrada y sofisticada de Sauvage. Una fragancia masculina de elixir que combina frescura extrema con profundidad amaderada.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["45.00", "85.00", "125.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.8",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Club de Nuit Iconic",
    brand: "Armaf",
    description: "Una fragancia masculina moderna que combina frescura cítrica con notas especiadas y amaderadas. Perfecta para el hombre contemporáneo.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["20.00", "35.00", "50.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.4",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  }
];

async function addPerfumesToDatabase() {
  console.log("🎯 Iniciando agregado de perfumes a la base de datos...");
  console.log(`📝 Total de perfumes: ${perfumes.length}`);
  
  // Primero hacer login como admin
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log("❌ No se pudo hacer login como admin. Abortando...");
    return;
  }
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const perfume of perfumes) {
    try {
      console.log(`🔄 Procesando: ${perfume.name} - ${perfume.brand}`);
      
      // Agregar el perfume usando el endpoint del servidor
      const response = await fetch('http://localhost:5000/api/admin/perfumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(perfume)
      });
      
      if (response.ok) {
        console.log(`✅ Agregado: ${perfume.name} - ${perfume.brand}`);
        addedCount++;
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${perfume.name} - ${perfume.brand} (${response.status}): ${errorText}`);
        errorCount++;
      }
      
      // Pequeña pausa para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`💥 Error con ${perfume.name}: ${error.message}`);
      errorCount++;
    }
  }

  console.log("\n🎉 ¡Proceso completado!");
  console.log(`✅ Perfumes agregados: ${addedCount}`);
  console.log(`⏭️  Perfumes saltados: ${skippedCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📊 Total procesados: ${addedCount + skippedCount + errorCount}`);
  
  console.log("\n📋 Próximos pasos:");
  console.log("1. 📸 Actualizar las imágenes de los perfumes");
  console.log("2. 💰 Actualizar los precios según tu estrategia");
  console.log("3. 🏷️  Configurar ofertas y descuentos si es necesario");
  console.log("4. ✅ Verificar que todos los perfumes aparezcan correctamente en el admin panel");
}

// Ejecutar el script
addPerfumesToDatabase().catch(console.error); 