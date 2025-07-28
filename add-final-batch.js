// Script para agregar el último lote de 6 perfumes (completar los 35)
import fetch from 'node-fetch';

const finalBatch = [
  {
    name: "Light Blue Forever",
    brand: "Dolce & Gabbana",
    description: "Una fragancia masculina eterna y mediterránea que combina notas cítricas con frescura marina. Perfecta para el verano y días soleados.",
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
    name: "Sauvage Cologne",
    brand: "Dior",
    description: "Una fragancia masculina fresca y ligera que combina frescura cítrica con notas amaderadas. Perfecta para el día a día.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["28.00", "50.00", "72.00"],
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
    name: "Bleu de Chanel Cologne",
    brand: "Chanel",
    description: "Una fragancia masculina fresca y elegante que combina frescura cítrica con profundidad amaderada. Perfecta para el hombre moderno.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["32.00", "58.00", "84.00"],
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
    name: "Acqua di Gio EDP",
    brand: "Armani",
    description: "Una fragancia masculina concentrada y sofisticada que combina notas marinas con profundidad amaderada. Perfecta para el hombre que busca distinción.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["34.00", "62.00", "90.00"],
    category: "masculine",
    notes: ["Bergamota", "Menta", "Sándalo", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.8",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Eros EDP",
    brand: "Versace",
    description: "Una fragancia masculina concentrada y sensual que combina frescura mediterránea con profundidad amaderada. Perfecta para el hombre que busca intensidad.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["30.00", "55.00", "80.00"],
    category: "masculine",
    notes: ["Bergamota", "Menta", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "The One EDP",
    brand: "Dolce & Gabbana",
    description: "Una fragancia masculina concentrada y sofisticada que combina frescura cítrica con notas especiadas y amaderadas. Perfecta para el hombre que busca distinción.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["36.00", "66.00", "96.00"],
    category: "masculine",
    notes: ["Bergamota", "Cardamomo", "Cedro", "Vetiver", "Ámbar"],
    imageUrl: "",
    rating: "4.7",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  }
];

async function addFinalBatch() {
  console.log("🎯 Iniciando agregado del último lote de 6 perfumes...");
  console.log(`📝 Total de perfumes: ${finalBatch.length}`);
  
  // Mostrar los perfumes del lote
  finalBatch.forEach((perfume, index) => {
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
      body: JSON.stringify({ perfumes: finalBatch })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Lote agregado exitosamente");
      console.log("📊 Resultado:", result);
      
      console.log("\n🎉 ¡TODOS LOS PERFUMES HAN SIDO AGREGADOS!");
      console.log("📈 Total de perfumes en la base de datos: 35");
      
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
  console.log("5. 🚀 Hacer commit y push de todos los cambios");
}

// Ejecutar el script
addFinalBatch().catch(console.error); 