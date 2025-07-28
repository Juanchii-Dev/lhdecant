// Script para agregar perfumes usando el endpoint de seed
import fetch from 'node-fetch';

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
  }
];

async function addPerfumesViaSeed() {
  console.log("🎯 Iniciando agregado de perfumes usando el endpoint de seed...");
  console.log(`📝 Total de perfumes: ${perfumes.length}`);
  
  try {
    // Usar el endpoint de seed para agregar los perfumes
    const response = await fetch('http://localhost:5000/api/seed-perfumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'lhdecant-admin-2024'
      },
      body: JSON.stringify({ perfumes })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Perfumes agregados exitosamente");
      console.log("📊 Resultado:", result);
    } else {
      const errorText = await response.text();
      console.log(`❌ Error al agregar perfumes (${response.status}): ${errorText}`);
    }
    
  } catch (error) {
    console.log("❌ Error de conexión:", error.message);
  }

  console.log("\n📋 Próximos pasos:");
  console.log("1. 📸 Actualizar las imágenes de los perfumes");
  console.log("2. 💰 Actualizar los precios según tu estrategia");
  console.log("3. 🏷️  Configurar ofertas y descuentos si es necesario");
  console.log("4. ✅ Verificar que todos los perfumes aparezcan correctamente en el admin panel");
}

// Ejecutar el script
addPerfumesViaSeed().catch(console.error); 