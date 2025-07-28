// Script simple para agregar perfumes de a 5 usando el admin de Firebase del servidor
import { admin } from './server/storage.js';

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
  }
];

async function addPerfumesToFirebase() {
  try {
    console.log("🚀 Iniciando inserción de perfumes directamente a Firebase...");
    console.log(`📝 Total de perfumes: ${perfumes.length}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const perfume of perfumes) {
      try {
        // Verificar si el perfume ya existe
        const existingPerfumes = await admin.firestore()
          .collection('perfumes')
          .where('name', '==', perfume.name)
          .where('brand', '==', perfume.brand)
          .get();

        if (!existingPerfumes.empty) {
          console.log(`⏭️  Saltando ${perfume.name} - ${perfume.brand} (ya existe)`);
          skippedCount++;
          continue;
        }

        // Agregar el perfume
        const perfumeRef = admin.firestore().collection('perfumes').doc();
        await perfumeRef.set({
          ...perfume,
          id: perfumeRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Agregado: ${perfume.name} - ${perfume.brand}`);
        addedCount++;
        
      } catch (error) {
        console.log(`❌ Error con ${perfume.name}: ${error.message}`);
      }
    }
    
    console.log("\n🎉 ¡Inserción completada!");
    console.log(`✅ Perfumes agregados: ${addedCount}`);
    console.log(`⏭️  Perfumes saltados: ${skippedCount}`);
    console.log(`📊 Total procesados: ${addedCount + skippedCount}`);
    
    console.log("\n📋 Próximos pasos:");
    console.log("1. 📸 Actualizar las imágenes de los perfumes");
    console.log("2. 💰 Actualizar los precios según tu estrategia");
    console.log("3. 🏷️  Configurar ofertas y descuentos si es necesario");
    console.log("4. ✅ Verificar que todos los perfumes aparezcan correctamente en el admin panel");
    
  } catch (error) {
    console.error("❌ Error al agregar perfumes:", error);
  }
}

// Ejecutar el script
addPerfumesToFirebase().then(() => {
  console.log("🏁 Script completado");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Error fatal:", error);
  process.exit(1);
}); 