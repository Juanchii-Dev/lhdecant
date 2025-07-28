// Script para agregar el cuarto lote de 5 perfumes
import fetch from 'node-fetch';

const fourthBatch = [
  {
    name: "The One",
    brand: "Dolce & Gabbana",
    description: "Una fragancia masculina elegante y sofisticada que combina frescura cítrica con notas especiadas y amaderadas. Perfecta para el hombre que busca distinción.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["28.00", "50.00", "72.00"],
    category: "masculine",
    notes: ["Bergamota", "Cardamomo", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Acqua di Gio",
    brand: "Armani",
    description: "Una fragancia masculina acuática y fresca que combina notas marinas con frescura mediterránea. Perfecta para el verano y días soleados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["26.00", "48.00", "70.00"],
    category: "masculine",
    notes: ["Limón", "Bergamota", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.7",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Sauvage Parfum",
    brand: "Dior",
    description: "La versión más concentrada y sofisticada de Sauvage. Una fragancia masculina de parfum que combina frescura extrema con profundidad amaderada.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["38.00", "70.00", "102.00"],
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
    name: "Bleu de Chanel EDT",
    brand: "Chanel",
    description: "Una fragancia masculina icónica que combina frescura cítrica con profundidad amaderada. Perfecta para el hombre moderno que busca elegancia.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["30.00", "55.00", "80.00"],
    category: "masculine",
    notes: ["Bergamota", "Menta", "Sándalo", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.7",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Eros Flame",
    brand: "Versace",
    description: "Una fragancia masculina intensa y apasionada que combina frescura cítrica con notas especiadas. Perfecta para el hombre que busca intensidad.",
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
  }
];

async function addFourthBatch() {
  console.log("🎯 Iniciando agregado del cuarto lote de 5 perfumes...");
  console.log(`📝 Total de perfumes: ${fourthBatch.length}`);
  
  // Mostrar los perfumes del lote
  fourthBatch.forEach((perfume, index) => {
    console.log(`   ${index + 1}. ${perfume.name} - ${perfume.brand}`);
  });
  
  try {
    // Agregar el lote usando el endpoint
    const response = await fetch('http://localhost:5000/api/add-perfumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'lhdecant-admin-2024'
      },
      body: JSON.stringify({ perfumes: fourthBatch })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Lote agregado exitosamente");
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
addFourthBatch().catch(console.error); 