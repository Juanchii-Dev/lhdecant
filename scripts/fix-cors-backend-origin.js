const fs = require('fs');
const path = require('path');

console.log('🔧 Agregando dominio del backend a CORS...');

// 1. Actualizar server/index.ts
console.log('📝 Actualizando server/index.ts...');
const serverIndexPath = path.join(__dirname, '../server/index.ts');
let serverContent = fs.readFileSync(serverIndexPath, 'utf8');

// Reemplazar la lista de orígenes permitidos
const newAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lhdecant.netlify.app',
  'https://www.lhdecant.netlify.app',
  'https://lhdecant.com',
  'https://www.lhdecant.com',
  'https://lhdecant-frontend.netlify.app',
  'https://lhdecant-backend.onrender.com'
];

// Reemplazar en server/index.ts
serverContent = serverContent.replace(
  /const allowedOrigins = \[[\s\S]*?\];/g,
  `const allowedOrigins = ${JSON.stringify(newAllowedOrigins, null, 2).replace(/"/g, "'")};`
);

fs.writeFileSync(serverIndexPath, serverContent);
console.log('✅ server/index.ts actualizado');

// 2. Actualizar dist/index.js
console.log('📝 Actualizando dist/index.js...');
const distIndexPath = path.join(__dirname, '../dist/index.js');
let distContent = fs.readFileSync(distIndexPath, 'utf8');

// Reemplazar en dist/index.js
distContent = distContent.replace(
  /const allowedOrigins = \[[\s\S]*?\];/g,
  `const allowedOrigins = ${JSON.stringify(newAllowedOrigins, null, 2).replace(/"/g, "'")};`
);

fs.writeFileSync(distIndexPath, distContent);
console.log('✅ dist/index.js actualizado');

// 3. Verificar que los cambios se aplicaron correctamente
console.log('🔍 Verificando cambios...');
const serverContentAfter = fs.readFileSync(serverIndexPath, 'utf8');
const distContentAfter = fs.readFileSync(distIndexPath, 'utf8');

if (serverContentAfter.includes('https://lhdecant-backend.onrender.com')) {
  console.log('✅ Backend origin agregado correctamente a server/index.ts');
} else {
  console.log('❌ Error: Backend origin no encontrado en server/index.ts');
}

if (distContentAfter.includes('https://lhdecant-backend.onrender.com')) {
  console.log('✅ Backend origin agregado correctamente a dist/index.js');
} else {
  console.log('❌ Error: Backend origin no encontrado en dist/index.js');
}

console.log('🎉 ¡Dominio del backend agregado a CORS!');
console.log('');
console.log('📋 Orígenes permitidos actualizados:');
newAllowedOrigins.forEach(origin => {
  console.log(`  ✅ ${origin}`);
});
console.log('');
console.log('🚀 Ejecuta: npm run build && git add . && git commit -m "Add backend origin to CORS" && git push'); 