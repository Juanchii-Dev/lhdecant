import { exec } from 'child_process';
import path from 'path';

console.log("🎯 Iniciando script para agregar nuevos perfumes...");
console.log("📝 Este script agregará todos los perfumes de la lista a Firebase Firestore");
console.log("✅ Los perfumes que ya existen serán saltados automáticamente");
console.log("🔄 Generando descripciones únicas y configuración completa...\n");

// Compilar TypeScript y ejecutar
exec('npx tsc server/add-new-perfumes.ts --outDir dist && node dist/add-new-perfumes.js', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error al ejecutar el script:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️  Advertencias:', stderr);
  }
  
  console.log('📤 Output del script:');
  console.log(stdout);
  
  console.log('\n🎉 ¡Proceso completado!');
  console.log('📋 Próximos pasos:');
  console.log('1. 📸 Actualizar las imágenes de los perfumes');
  console.log('2. 💰 Actualizar los precios según tu estrategia');
  console.log('3. 🏷️  Configurar ofertas y descuentos si es necesario');
  console.log('4. ✅ Verificar que todos los perfumes aparezcan correctamente en el admin panel');
}); 