import { admin } from "./storage";

const samplePerfumes = [
  {
    name: "Invictus",
    brand: "Paco Rabanne",
    description: "Una fragancia masculina intensa y fresca con notas de pomelo y laurel.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["15.00", "25.00", "35.00"],
    category: "masculine",
    notes: ["Pomelo", "Laurel", "Ambergris", "Guayaco"],
    imageUrl: "https://i.imgur.com/dE1AVy1.png",
    rating: "4.5",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: true,
    discountPercentage: "20",
    offerDescription: "¡Oferta especial por tiempo limitado!",
    createdAt: new Date("2025-01-01T00:00:00Z"),
  },
  {
    name: "Tobacco Vanille",
    brand: "Tom Ford",
    description: "Una mezcla rica y opulenta de tabaco y vainilla con un toque de especias.",
    sizes: ["5ml", "10ml"],
    prices: ["35.00", "65.00"],
    category: "unisex",
    notes: ["Tabaco", "Vainilla", "Cacao", "Tonka"],
    imageUrl: "https://i.imgur.com/4KOoPSE.png",
    rating: "4.8",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null,
    createdAt: new Date("2025-01-02T00:00:00Z"),
  },
  {
    name: "Black Opium",
    brand: "Yves Saint Laurent",
    description: "Una fragancia adictiva y sensual con café negro y flor de azahar.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["20.00", "35.00", "50.00"],
    category: "feminine",
    notes: ["Café Negro", "Flor de Azahar", "Vainilla", "Cedro"],
    imageUrl: "https://i.imgur.com/example.png",
    rating: "4.6",
    inStock: true,
    showOnHomepage: false,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null,
    createdAt: new Date("2025-01-03T00:00:00Z"),
  },
  {
    name: "Bleu de Chanel",
    brand: "Chanel",
    description: "Una fragancia masculina sofisticada con notas cítricas y amaderadas.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["25.00", "45.00", "65.00"],
    category: "masculine",
    notes: ["Limón", "Menta", "Sándalo", "Vetiver"],
    imageUrl: "https://i.imgur.com/bleu-chanel.png",
    rating: "4.7",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: true,
    discountPercentage: "15",
    offerDescription: "Nuevo lanzamiento con descuento",
    createdAt: new Date("2025-01-04T00:00:00Z"),
  },
  {
    name: "La Vie Est Belle",
    brand: "Lancôme",
    description: "Una fragancia femenina alegre y optimista con iris y vainilla.",
    sizes: ["5ml", "10ml"],
    prices: ["18.00", "32.00"],
    category: "feminine",
    notes: ["Iris", "Vainilla", "Frambuesa", "Jazmín"],
    imageUrl: "https://i.imgur.com/la-vie-est-belle.png",
    rating: "4.4",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: false,
    discountPercentage: "0",
    offerDescription: null,
    createdAt: new Date("2025-01-05T00:00:00Z"),
  },
  {
    name: "Sauvage",
    brand: "Dior",
    description: "Una fragancia masculina fresca y potente con bergamota y ambroxan.",
    sizes: ["5ml", "10ml", "15ml"],
    prices: ["22.00", "40.00", "58.00"],
    category: "masculine",
    notes: ["Bergamota", "Pimienta", "Ambroxan", "Cedro"],
    imageUrl: "https://i.imgur.com/sauvage.png",
    rating: "4.9",
    inStock: true,
    showOnHomepage: true,
    isOnOffer: true,
    discountPercentage: "25",
    offerDescription: "¡Más vendido con descuento especial!",
    createdAt: new Date("2025-01-06T00:00:00Z"),
  }
];

async function seedPerfumes() {
  try {
    console.log("🌱 Iniciando carga de perfumes de ejemplo...");
    
    const perfumesRef = admin.firestore().collection("perfumes");
    
    for (const perfume of samplePerfumes) {
      const docRef = await perfumesRef.add({
        ...perfume,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`✅ Perfume "${perfume.name}" agregado con ID: ${docRef.id}`);
    }
    
    console.log("🎉 ¡Carga de perfumes completada exitosamente!");
  } catch (error) {
    console.error("❌ Error al cargar perfumes:", error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedPerfumes().then(() => {
    console.log("Script completado");
    process.exit(0);
  }).catch((error) => {
    console.error("Error en script:", error);
    process.exit(1);
  });
}

export { seedPerfumes }; 