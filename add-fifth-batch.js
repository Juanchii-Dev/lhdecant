// Script para agregar el quinto lote de 5 perfumes
import fetch from 'node-fetch';

const fifthBatch = [
  {
    name: "Light Blue Intense",
    brand: "Dolce & Gabbana",
    description: "Una fragancia masculina intensa y mediterránea que combina notas cítricas con frescura marina. Perfecta para el verano y días soleados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["24.00", "42.00", "60.00"],
    category: "masculine",
    notes: ["Limón", "Bergamota", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Sauvage EDP",
    brand: "Dior",
    description: "La versión más concentrada de Sauvage. Una fragancia masculina de eau de parfum que combina frescura extrema con profundidad amaderada.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["35.00", "65.00", "95.00"],
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
    name: "Bleu de Chanel Parfum",
    brand: "Chanel",
    description: "La versión más concentrada y sofisticada de Bleu de Chanel. Una fragancia masculina de parfum que combina elegancia con modernidad.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["42.00", "78.00", "114.00"],
    category: "masculine",
    notes: ["Limón", "Menta", "Sándalo", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.9",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Acqua di Gio Absolu",
    brand: "Armani",
    description: "Una fragancia masculina absoluta y sofisticada que combina notas marinas con profundidad amaderada. Perfecta para el hombre que busca distinción.",
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
    name: "Eros Parfum",
    brand: "Versace",
    description: "La versión más concentrada y sofisticada de Eros. Una fragancia masculina de parfum que combina frescura mediterránea con sensualidad.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["28.00", "50.00", "72.00"],
    category: "masculine",
    notes: ["Bergamota", "Menta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  }
];

async function addFifthBatch() {
  console.log("🎯 Iniciando agregado del quinto lote de 5 perfumes...");
  console.log(`📝 Total de perfumes: ${fifthBatch.length}`);
  
  // Mostrar los perfumes del lote
  fifthBatch.forEach((perfume, index) => {
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
      body: JSON.stringify({ perfumes: fifthBatch })
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
addFifthBatch().catch(console.error); 