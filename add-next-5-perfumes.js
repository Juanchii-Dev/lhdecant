// Script para agregar el siguiente lote de 5 perfumes
import fetch from 'node-fetch';

const nextPerfumes = [
  {
    name: "Bleu de Chanel EDP",
    brand: "Chanel",
    description: "Una fragancia masculina elegante y sofisticada que combina frescura cítrica con profundidad amaderada. Perfecta para el hombre moderno que busca distinción.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["35.00", "65.00", "95.00"],
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
    name: "Sauvage EDT",
    brand: "Dior",
    description: "Una fragancia masculina icónica que combina frescura extrema con sensualidad. Perfecta para el hombre que busca distinción y elegancia.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["30.00", "55.00", "80.00"],
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
    name: "Acqua di Gio Profumo",
    brand: "Armani",
    description: "Una fragancia masculina acuática y fresca que combina notas marinas con profundidad amaderada. Perfecta para el hombre que busca frescura y elegancia.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["28.00", "50.00", "72.00"],
    category: "masculine",
    notes: ["Bergamota", "Menta", "Sándalo", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "La Nuit de L'Homme",
    brand: "Yves Saint Laurent",
    description: "Una fragancia masculina sensual y misteriosa que combina frescura cítrica con notas especiadas. Perfecta para ocasiones nocturnas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["26.00", "48.00", "70.00"],
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
    name: "Spicebomb",
    brand: "Viktor&Rolf",
    description: "Una fragancia masculina explosiva y especiada que combina frescura cítrica con notas picantes. Perfecta para el hombre que busca intensidad.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["24.00", "42.00", "60.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta", "Canela", "Cedro", "Ámbar"],
    imageUrl: "",
    rating: "4.4",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  }
];

async function addNextPerfumes() {
  console.log("🎯 Iniciando agregado del siguiente lote de 5 perfumes...");
  console.log(`📝 Total de perfumes: ${nextPerfumes.length}`);
  
  try {
    // Agregar el lote usando el endpoint
    const response = await fetch('http://localhost:5000/api/add-perfumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'lhdecant-admin-2024'
      },
      body: JSON.stringify({ perfumes: nextPerfumes })
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
addNextPerfumes().catch(console.error); 