// Script para limpiar perfumes duplicados y mantener solo las versiones más importantes
import fetch from 'node-fetch';

// Lista de perfumes a ELIMINAR (versiones duplicadas)
const perfumesToDelete = [
  // Chanel - Mantener solo "Bleu de Chanel" y "Bleu de Chanel EDP"
  { name: "Bleu de Chanel Cologne", brand: "Chanel" },
  { name: "Bleu de Chanel EDT", brand: "Chanel" },
  { name: "Bleu de Chanel Le Parfum", brand: "Chanel" },
  { name: "Bleu de Chanel Parfum", brand: "Chanel" },
  
  // Dior - Mantener solo "Sauvage" y "Sauvage EDP"
  { name: "Sauvage Cologne", brand: "Dior" },
  { name: "Sauvage EDT", brand: "Dior" },
  { name: "Sauvage Elixir", brand: "Dior" },
  { name: "Sauvage Parfum", brand: "Dior" },
  
  // Armani - Mantener solo "Acqua di Gio" y "Acqua di Gio Profumo"
  { name: "Acqua di Gio Absolu", brand: "Armani" },
  { name: "Acqua di Gio EDP", brand: "Armani" },
  
  // Versace - Mantener solo "Eros" y "Eros Flame"
  { name: "Eros EDP", brand: "Versace" },
  { name: "Eros Parfum", brand: "Versace" },
  
  // Dolce & Gabbana - Mantener solo "Light Blue" y "The One"
  { name: "Light Blue Forever", brand: "Dolce & Gabbana" },
  { name: "Light Blue Intense", brand: "Dolce & Gabbana" },
  { name: "The One EDP", brand: "Dolce & Gabbana" }
];

async function cleanDuplicates() {
  try {
    console.log("🧹 Iniciando limpieza de perfumes duplicados...");
    console.log(`📝 Perfumes a eliminar: ${perfumesToDelete.length}`);
    
    // Mostrar los perfumes que se van a eliminar
    console.log("\n🗑️  PERFUMES A ELIMINAR:");
    perfumesToDelete.forEach((perfume, index) => {
      console.log(`   ${index + 1}. ${perfume.name} - ${perfume.brand}`);
    });
    
    // Obtener todos los perfumes de la base de datos
    const response = await fetch('http://localhost:5000/api/perfumes');
    const allPerfumes = await response.json();
    
    console.log(`\n📊 Total de perfumes en la base de datos: ${allPerfumes.length}`);
    
    let deletedCount = 0;
    let notFoundCount = 0;
    
    for (const perfumeToDelete of perfumesToDelete) {
      try {
        // Buscar el perfume en la base de datos
        const perfume = allPerfumes.find(p => 
          p.name === perfumeToDelete.name && 
          p.brand === perfumeToDelete.brand
        );
        
        if (perfume) {
          // Eliminar el perfume usando el endpoint de admin
          const deleteResponse = await fetch(`http://localhost:5000/api/admin/perfumes/${perfume.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-key': 'lhdecant-admin-2024'
            }
          });
          
          if (deleteResponse.ok) {
            console.log(`✅ Eliminado: ${perfume.name} - ${perfume.brand}`);
            deletedCount++;
          } else {
            console.log(`❌ Error eliminando: ${perfume.name} - ${perfume.brand}`);
          }
        } else {
          console.log(`⏭️  No encontrado: ${perfumeToDelete.name} - ${perfumeToDelete.brand}`);
          notFoundCount++;
        }
        
        // Pequeña pausa
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`💥 Error con ${perfumeToDelete.name}: ${error.message}`);
      }
    }
    
    console.log("\n🎉 ¡Limpieza completada!");
    console.log(`✅ Perfumes eliminados: ${deletedCount}`);
    console.log(`⏭️  No encontrados: ${notFoundCount}`);
    console.log(`📊 Total procesados: ${deletedCount + notFoundCount}`);
    
    // Verificar el resultado final
    const finalResponse = await fetch('http://localhost:5000/api/perfumes');
    const finalPerfumes = await finalResponse.json();
    console.log(`\n📈 Perfumes restantes: ${finalPerfumes.length}`);
    
    console.log("\n📋 PERFUMES RESTANTES POR MARCA:");
    const byBrand = {};
    finalPerfumes.forEach(p => {
      if (!byBrand[p.brand]) byBrand[p.brand] = [];
      byBrand[p.brand].push(p.name);
    });
    
    Object.keys(byBrand).sort().forEach(brand => {
      console.log(`\n🏷️  ${brand}:`);
      byBrand[brand].sort().forEach(name => {
        console.log(`   - ${name}`);
      });
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

cleanDuplicates(); 