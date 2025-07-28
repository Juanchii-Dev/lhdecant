// Script para verificar qué perfumes de la lista original se agregaron y cuáles faltan
import fetch from 'node-fetch';

// Lista original de perfumes que se debían agregar
const originalPerfumes = [
  "Lattafa Fakhar Black",
  "Tom Ford Tobacco Vanille", 
  "JPG Le Beau Parfum",
  "Scandal Pour Homme",
  "Scandal Pour Homme Absolu",
  "Scandal Le Parfum Pour Homme",
  "Rabanne Invictus Absolu Parfum",
  "One Million",
  "Paco Rabanne Phantom Eau de Toilette",
  "Bad Boy Le Parfum",
  "JPG Le Male Elixir",
  "JPG Le Male",
  "Lattafa Khamrah Qahwa",
  "Maahir Legacy Lattafa",
  "Lattafa Hayati Al Maleky",
  "Bleu de Chanel Le Parfum",
  "Myslf Eau de Parfum",
  "Honor and Glory",
  "Montale Tonka",
  "Valentino Born in Roma",
  "Stronger With You",
  "Mandarin Sky",
  "Asad Bourbon",
  "Hawas Ice",
  "Liquid Brum",
  "9 PM",
  "Perfume Asad",
  "Vintage Radio",
  "Jean Lowe Ozure",
  "Erba Pura",
  "Versace Eros",
  "Dior Homme Intense",
  "Prada Luna Rossa Ocean Vapo",
  "Dior Sauvage Elixir",
  "Club de Nuit Iconic"
];

async function verifyPerfumes() {
  try {
    console.log("🔍 Verificando perfumes de la lista original...");
    console.log(`📝 Total en lista original: ${originalPerfumes.length}`);
    
    // Obtener todos los perfumes de la base de datos
    const response = await fetch('http://localhost:5000/api/perfumes');
    const dbPerfumes = await response.json();
    
    console.log(`📊 Total en base de datos: ${dbPerfumes.length}`);
    
    const foundPerfumes = [];
    const missingPerfumes = [];
    const extraPerfumes = [];
    
    // Verificar cuáles de la lista original están en la BD
    for (const originalPerfume of originalPerfumes) {
      const found = dbPerfumes.find(p => 
        p.name.toLowerCase() === originalPerfume.toLowerCase() ||
        p.name.toLowerCase().includes(originalPerfume.toLowerCase()) ||
        originalPerfume.toLowerCase().includes(p.name.toLowerCase())
      );
      
      if (found) {
        foundPerfumes.push({
          original: originalPerfume,
          found: found.name,
          brand: found.brand
        });
      } else {
        missingPerfumes.push(originalPerfume);
      }
    }
    
    // Verificar perfumes extra en la BD
    for (const dbPerfume of dbPerfumes) {
      const isInOriginal = originalPerfumes.some(original => 
        original.toLowerCase() === dbPerfume.name.toLowerCase() ||
        original.toLowerCase().includes(dbPerfume.name.toLowerCase()) ||
        dbPerfume.name.toLowerCase().includes(original.toLowerCase())
      );
      
      if (!isInOriginal) {
        extraPerfumes.push({
          name: dbPerfume.name,
          brand: dbPerfume.brand
        });
      }
    }
    
    console.log("\n📋 RESULTADOS:");
    console.log(`✅ Encontrados: ${foundPerfumes.length}`);
    console.log(`❌ Faltantes: ${missingPerfumes.length}`);
    console.log(`➕ Extra: ${extraPerfumes.length}`);
    
    if (foundPerfumes.length > 0) {
      console.log("\n✅ PERFUMES ENCONTRADOS:");
      foundPerfumes.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.original} → ${item.found} (${item.brand})`);
      });
    }
    
    if (missingPerfumes.length > 0) {
      console.log("\n❌ PERFUMES FALTANTES:");
      missingPerfumes.forEach((perfume, index) => {
        console.log(`   ${index + 1}. ${perfume}`);
      });
    }
    
    if (extraPerfumes.length > 0) {
      console.log("\n➕ PERFUMES EXTRA (no estaban en la lista original):");
      extraPerfumes.forEach((perfume, index) => {
        console.log(`   ${index + 1}. ${perfume.name} (${perfume.brand})`);
      });
    }
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   • Lista original: ${originalPerfumes.length} perfumes`);
    console.log(`   • Agregados correctamente: ${foundPerfumes.length}`);
    console.log(`   • Faltan por agregar: ${missingPerfumes.length}`);
    console.log(`   • Extra agregados: ${extraPerfumes.length}`);
    console.log(`   • Total en BD: ${dbPerfumes.length}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

verifyPerfumes(); 