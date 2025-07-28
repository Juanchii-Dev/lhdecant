// Script para agregar el tercer bloque de 7 perfumes faltantes (los últimos 7)
import fetch from 'node-fetch';

const thirdBatch = [
  {
    name: "9 PM",
    brand: "Afnan",
    description: "Una fragancia nocturna y seductora que combina notas de vainilla, ámbar y especias exóticas. Perfecta para ocasiones especiales.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["14.00", "22.00", "30.00"],
    category: "masculino",
    notes: ["Vainilla", "Ámbar", "Especias", "Sándalo", "Bergamota"],
    imageUrl: "",
    rating: "4.2",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Perfume Asad",
    brand: "Lattafa",
    description: "Una fragancia oriental intensa que combina notas de rosas, vainilla y especias exóticas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["12.00", "20.00", "28.00"],
    category: "masculino",
    notes: ["Rosa", "Vainilla", "Especias", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.1",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Vintage Radio",
    brand: "Lattafa",
    description: "Una fragancia retro y nostálgica que combina notas de vainilla, caramelo y especias.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["13.00", "21.00", "29.00"],
    category: "unisex",
    notes: ["Vainilla", "Caramelo", "Especias", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.0",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Jean Lowe Ozure",
    brand: "Lattafa",
    description: "Una fragancia elegante y sofisticada que combina notas cítricas frescas con acordes amaderados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["15.00", "25.00", "35.00"],
    category: "masculino",
    notes: ["Bergamota", "Lavanda", "Vetiver", "Sándalo", "Ámbar"],
    imageUrl: "",
    rating: "4.1",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Erba Pura",
    brand: "Xerjoff",
    description: "Una fragancia de lujo que combina notas de frutas exóticas, vainilla y especias orientales.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["40.00", "60.00", "80.00"],
    category: "unisex",
    notes: ["Frutas Exóticas", "Vainilla", "Especias", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.6",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Luna Rossa Ocean Vapo",
    brand: "Prada",
    description: "Una fragancia acuática y fresca que combina notas marinas con acordes amaderados y especiados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["25.00", "35.00", "45.00"],
    category: "masculino",
    notes: ["Bergamota", "Lavanda", "Vetiver", "Sándalo", "Ámbar"],
    imageUrl: "",
    rating: "4.2",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Club de Nuit Iconic",
    brand: "Armaf",
    description: "Una fragancia icónica y sofisticada que combina notas cítricas frescas con acordes amaderados y especiados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["16.00", "26.00", "36.00"],
    category: "masculino",
    notes: ["Bergamota", "Lavanda", "Vetiver", "Sándalo", "Ámbar"],
    imageUrl: "",
    rating: "4.3",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  }
];

async function addThirdBatch() {
  try {
    console.log("🎯 Agregando tercer bloque de 7 perfumes faltantes (últimos)...");
    console.log(`📝 Total de perfumes: ${thirdBatch.length}`);
    
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
      console.log("✅ Perfumes agregados exitosamente");
      console.log("📊 Resultado:", result);
      console.log("\n🎉 ¡TODOS LOS PERFUMES FALTANTES HAN SIDO AGREGADOS!");
      console.log("📋 Próximos pasos:");
      console.log("1. 📸 Actualizar las imágenes de los perfumes");
      console.log("2. 💰 Actualizar los precios según tu estrategia");
      console.log("3. 🏷️  Configurar ofertas y descuentos si es necesario");
      console.log("4. ✅ Verificar que todos los perfumes aparezcan correctamente en el admin panel");
    } else {
      const errorText = await response.text();
      console.log(`❌ Error al agregar perfumes (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.log("❌ Error de conexión:", error.message);
  }
}

addThirdBatch(); 