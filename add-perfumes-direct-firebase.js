// Script para agregar perfumes directamente a Firebase
import admin from 'firebase-admin';

// Configuración de Firebase para el proyecto Ihdecant
const serviceAccount = {
  type: 'service_account',
  project_id: 'ihdecant',
  private_key_id: 'tu_private_key_id',
  private_key: '-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-xxxxx@ihdecant.iam.gserviceaccount.com',
  client_id: 'tu_client_id',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40ihdecant.iam.gserviceaccount.com'
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'ihdecant',
  });
}

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

// Función para dividir el array en lotes de 5
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function addPerfumesToFirebase() {
  try {
    console.log("🚀 Iniciando inserción de perfumes directamente a Firebase...");
    console.log(`📝 Total de perfumes: ${perfumes.length}`);
    
    // Dividir perfumes en lotes de 5
    const batches = chunkArray(perfumes, 5);
    console.log(`📦 Total de lotes: ${batches.length}`);
    
    let totalAdded = 0;
    let totalSkipped = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n🔄 Procesando lote ${i + 1}/${batches.length} (${batch.length} perfumes)`);
      
      // Mostrar los perfumes del lote actual
      batch.forEach((perfume, index) => {
        console.log(`   ${index + 1}. ${perfume.name} - ${perfume.brand}`);
      });
      
      let batchAdded = 0;
      let batchSkipped = 0;
      
      for (const perfume of batch) {
        try {
          // Verificar si el perfume ya existe
          const existingPerfumes = await admin.firestore()
            .collection('perfumes')
            .where('name', '==', perfume.name)
            .where('brand', '==', perfume.brand)
            .get();

          if (!existingPerfumes.empty) {
            console.log(`⏭️  Saltando ${perfume.name} - ${perfume.brand} (ya existe)`);
            batchSkipped++;
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
          batchAdded++;
          
        } catch (error) {
          console.log(`❌ Error con ${perfume.name}: ${error.message}`);
        }
      }
      
      totalAdded += batchAdded;
      totalSkipped += batchSkipped;
      
      console.log(`📊 Lote ${i + 1} completado: ${batchAdded} agregados, ${batchSkipped} saltados`);
      
      // Pausa entre lotes
      if (i < batches.length - 1) {
        console.log("⏳ Esperando 2 segundos antes del siguiente lote...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log("\n🎉 ¡Inserción completada!");
    console.log(`✅ Perfumes agregados: ${totalAdded}`);
    console.log(`⏭️  Perfumes saltados: ${totalSkipped}`);
    console.log(`📊 Total procesados: ${totalAdded + totalSkipped}`);
    
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