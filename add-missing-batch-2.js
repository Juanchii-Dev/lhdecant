// Script para agregar el segundo bloque de 7 perfumes faltantes
import fetch from 'node-fetch';

const secondBatch = [
  {
    name: "Honor and Glory",
    brand: "Amouage",
    description: "Una fragancia de lujo que combina notas de rosas, vainilla y especias orientales. Una obra maestra de la perfumería árabe.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["35.00", "50.00", "65.00"],
    category: "unisex",
    notes: ["Rosa", "Vainilla", "Especias", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.5",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Montale Tonka",
    brand: "Montale",
    description: "Una fragancia oriental intensa que combina notas de tonka, vainilla y especias exóticas. Perfecta para ocasiones especiales.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["25.00", "35.00", "45.00"],
    category: "unisex",
    notes: ["Tonka", "Vainilla", "Especias", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.3",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Born in Roma",
    brand: "Valentino",
    description: "Una fragancia moderna y sofisticada que combina notas cítricas frescas con acordes amaderados y especiados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["20.00", "30.00", "40.00"],
    category: "unisex",
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
    name: "Mandarin Sky",
    brand: "Atelier Cologne",
    description: "Una fragancia cítrica fresca y luminosa que combina notas de mandarina, bergamota y acordes amaderados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["18.00", "28.00", "38.00"],
    category: "unisex",
    notes: ["Mandarina", "Bergamota", "Lavanda", "Vetiver", "Sándalo"],
    imageUrl: "",
    rating: "4.0",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Asad Bourbon",
    brand: "Lattafa",
    description: "Una fragancia oriental intensa inspirada en el bourbon, combinando notas de vainilla, caramelo y especias.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["12.00", "20.00", "28.00"],
    category: "masculino",
    notes: ["Vainilla", "Caramelo", "Especias", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.2",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Hawas Ice",
    brand: "Rasasi",
    description: "Una fragancia fresca y refrescante que combina notas cítricas con acordes acuáticos y amaderados.",
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
    name: "Liquid Brum",
    brand: "Lattafa",
    description: "Una fragancia oriental intensa que combina notas de rosas, vainilla y especias exóticas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["13.00", "21.00", "29.00"],
    category: "unisex",
    notes: ["Rosa", "Vainilla", "Especias", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.0",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  }
];

async function addSecondBatch() {
  try {
    console.log("🎯 Agregando segundo bloque de 7 perfumes faltantes...");
    console.log(`📝 Total de perfumes: ${secondBatch.length}`);
    
    const response = await fetch('http://localhost:5000/api/add-perfumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'lhdecant-admin-2024'
      },
      body: JSON.stringify({ perfumes: secondBatch })
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
}

addSecondBatch(); 