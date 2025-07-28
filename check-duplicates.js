// Script para identificar perfumes duplicados o muy similares
import fetch from 'node-fetch';

async function checkDuplicates() {
  try {
    console.log("🔍 Verificando perfumes duplicados...");
    
    // Obtener todos los perfumes de la base de datos
    const response = await fetch('http://localhost:5000/api/perfumes');
    const perfumes = await response.json();
    
    console.log(`📊 Total de perfumes en la base de datos: ${perfumes.length}`);
    
    // Agrupar por nombre y marca
    const groupedPerfumes = {};
    
    perfumes.forEach(perfume => {
      const key = `${perfume.name} - ${perfume.brand}`;
      if (!groupedPerfumes[key]) {
        groupedPerfumes[key] = [];
      }
      groupedPerfumes[key].push(perfume);
    });
    
    // Encontrar duplicados
    const duplicates = [];
    const similarNames = [];
    
    Object.keys(groupedPerfumes).forEach(key => {
      if (groupedPerfumes[key].length > 1) {
        duplicates.push({
          name: key,
          count: groupedPerfumes[key].length,
          perfumes: groupedPerfumes[key]
        });
      }
    });
    
    // Buscar nombres similares
    const perfumeNames = perfumes.map(p => p.name);
    const brands = perfumes.map(p => p.brand);
    
    for (let i = 0; i < perfumeNames.length; i++) {
      for (let j = i + 1; j < perfumeNames.length; j++) {
        const name1 = perfumeNames[i].toLowerCase();
        const name2 = perfumeNames[j].toLowerCase();
        const brand1 = brands[i];
        const brand2 = brands[j];
        
        // Verificar si son nombres muy similares
        if (name1.includes(name2) || name2.includes(name1)) {
          if (brand1 === brand2) {
            similarNames.push({
              name1: perfumeNames[i],
              name2: perfumeNames[j],
              brand: brand1
            });
          }
        }
      }
    }
    
    // Mostrar resultados
    console.log("\n📋 RESULTADOS:");
    
    if (duplicates.length > 0) {
      console.log("\n❌ DUPLICADOS EXACTOS:");
      duplicates.forEach(dup => {
        console.log(`   - ${dup.name} (${dup.count} veces)`);
        dup.perfumes.forEach(p => {
          console.log(`     ID: ${p.id}, Precio: $${p.prices[0]}`);
        });
      });
    } else {
      console.log("\n✅ No hay duplicados exactos");
    }
    
    if (similarNames.length > 0) {
      console.log("\n⚠️  NOMBRES SIMILARES:");
      similarNames.forEach(sim => {
        console.log(`   - ${sim.name1} vs ${sim.name2} (${sim.brand})`);
      });
    } else {
      console.log("\n✅ No hay nombres similares");
    }
    
    // Mostrar todos los perfumes por marca
    console.log("\n📝 TODOS LOS PERFUMES POR MARCA:");
    const byBrand = {};
    perfumes.forEach(p => {
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

checkDuplicates(); 