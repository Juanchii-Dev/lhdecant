// Script para agregar el tercer lote de 5 perfumes
import fetch from 'node-fetch';

const thirdBatch = [
  {
    name: "Light Blue",
    brand: "Dolce & Gabbana",
    description: "Una fragancia masculina fresca y mediterránea que combina notas cítricas con frescura marina. Perfecta para el verano y días soleados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["22.00", "40.00", "58.00"],
    category: "masculine",
    notes: ["Limón", "Bergamota", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "1 Million Lucky",
    brand: "Paco Rabanne",
    description: "Una fragancia masculina audaz y moderna que combina frescura cítrica con notas especiadas y amaderadas. Perfecta para el hombre que busca distinción.",
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
    name: "Invictus",
    brand: "Paco Rabanne",
    description: "Una fragancia masculina victoriosa y energética que combina frescura cítrica con notas amaderadas. Perfecta para el hombre que busca triunfo.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["24.00", "42.00", "60.00"],
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
    name: "Boss Bottled",
    brand: "Hugo Boss",
    description: "Una fragancia masculina elegante y sofisticada que combina frescura cítrica con profundidad amaderada. Perfecta para el hombre ejecutivo.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["25.00", "45.00", "65.00"],
    category: "masculine",
    notes: ["Bergamota", "Lavanda", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Dior Homme",
    brand: "Dior",
    description: "Una fragancia masculina refinada y elegante que combina frescura cítrica con notas iris y amaderadas. Perfecta para el hombre sofisticado.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["32.00", "58.00", "84.00"],
    category: "masculine",
    notes: ["Bergamota", "Iris", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.7",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  }
];

async function addThirdBatch() {
  console.log("🎯 Iniciando agregado del tercer lote de 5 perfumes...");
  console.log(`📝 Total de perfumes: ${thirdBatch.length}`);
  
  // Mostrar los perfumes del lote
  thirdBatch.forEach((perfume, index) => {
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
      body: JSON.stringify({ perfumes: thirdBatch })
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
addThirdBatch().catch(console.error); 