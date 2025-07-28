// Script para agregar el primer bloque de 7 perfumes faltantes
import fetch from 'node-fetch';

const firstBatch = [
  {
    name: "Scandal Le Parfum Pour Homme",
    brand: "Jean Paul Gaultier",
    description: "Una fragancia masculina intensa y seductora que combina notas de vainilla, ámbar y especias exóticas. Perfecta para ocasiones especiales y noches de fiesta.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["15.00", "25.00", "35.00"],
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
    name: "Phantom Eau de Toilette",
    brand: "Paco Rabanne",
    description: "Una fragancia futurista y moderna que combina notas cítricas frescas con acordes amaderados y especiados. Ideal para el hombre contemporáneo.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["18.00", "28.00", "38.00"],
    category: "masculino",
    notes: ["Bergamota", "Lavanda", "Vetiver", "Sándalo", "Ámbar"],
    imageUrl: "",
    rating: "4.0",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Bad Boy Le Parfum",
    brand: "Carolina Herrera",
    description: "Una fragancia audaz y rebelde que combina notas de chocolate negro, vainilla y especias. Para el hombre que no teme romper las reglas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["20.00", "30.00", "40.00"],
    category: "masculino",
    notes: ["Chocolate Negro", "Vainilla", "Especias", "Sándalo", "Bergamota"],
    imageUrl: "",
    rating: "4.3",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Khamrah Qahwa",
    brand: "Lattafa",
    description: "Una fragancia oriental intensa inspirada en el café árabe, combinando notas de café, vainilla y especias exóticas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["12.00", "20.00", "28.00"],
    category: "unisex",
    notes: ["Café", "Vainilla", "Especias", "Ámbar", "Sándalo"],
    imageUrl: "",
    rating: "4.1",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Maahir Legacy",
    brand: "Lattafa",
    description: "Una fragancia elegante y sofisticada que combina notas cítricas frescas con acordes amaderados y especiados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["14.00", "22.00", "30.00"],
    category: "masculino",
    notes: ["Bergamota", "Lavanda", "Vetiver", "Sándalo", "Ámbar"],
    imageUrl: "",
    rating: "4.0",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Hayati Al Maleky",
    brand: "Lattafa",
    description: "Una fragancia real y majestuosa que combina notas de rosas, ámbar y especias orientales.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["13.00", "21.00", "29.00"],
    category: "unisex",
    notes: ["Rosa", "Ámbar", "Especias", "Sándalo", "Vainilla"],
    imageUrl: "",
    rating: "4.2",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  },
  {
    name: "Myslf Eau de Parfum",
    brand: "Givenchy",
    description: "Una fragancia moderna y sofisticada que combina notas cítricas frescas con acordes amaderados y especiados.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["22.00", "32.00", "42.00"],
    category: "masculino",
    notes: ["Bergamota", "Lavanda", "Vetiver", "Sándalo", "Ámbar"],
    imageUrl: "",
    rating: "4.1",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null
  }
];

async function addFirstBatch() {
  try {
    console.log("🎯 Agregando primer bloque de 7 perfumes faltantes...");
    console.log(`📝 Total de perfumes: ${firstBatch.length}`);
    
    const response = await fetch('http://localhost:5000/api/add-perfumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'lhdecant-admin-2024'
      },
      body: JSON.stringify({ perfumes: firstBatch })
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

addFirstBatch(); 