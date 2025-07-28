// Script para probar el endpoint de colecciones
import fetch from 'node-fetch';

async function testCollections() {
  try {
    console.log("📦 Probando endpoint de colecciones...");
    
    // Probar endpoint de colecciones
    console.log("\n🏷️ Probando /api/collections:");
    const collectionsResponse = await fetch('http://localhost:5000/api/collections');
    
    if (collectionsResponse.ok) {
      const data = await collectionsResponse.json();
      console.log("✅ Colecciones:", data);
      console.log(`📊 Total colecciones: ${data.length}`);
      
      if (data.length > 0) {
        console.log("\n📋 Detalles de colecciones:");
        data.forEach((collection, index) => {
          console.log(`   ${index + 1}. ${collection.name} (${collection.theme})`);
          console.log(`      Descripción: ${collection.description}`);
          console.log(`      Perfumes: ${collection.perfumeIds?.length || 0}`);
          console.log(`      ID: ${collection.id}`);
        });
      } else {
        console.log("⚠️ No hay colecciones en la base de datos");
      }
    } else {
      console.log(`❌ Error (${collectionsResponse.status}):`, await collectionsResponse.text());
    }
    
    // Probar endpoint de perfumes para comparar
    console.log("\n🧴 Probando /api/perfumes:");
    const perfumesResponse = await fetch('http://localhost:5000/api/perfumes');
    
    if (perfumesResponse.ok) {
      const data = await perfumesResponse.json();
      console.log(`✅ Total perfumes: ${data.length}`);
    } else {
      console.log(`❌ Error (${perfumesResponse.status}):`, await perfumesResponse.text());
    }
    
  } catch (error) {
    console.error("❌ Error general:", error.message);
  }
}

testCollections(); 