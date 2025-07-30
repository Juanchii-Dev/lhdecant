#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Arreglando errores de TypeScript (versión 2)...\n');

// Función para arreglar variables no utilizadas de manera más inteligente
function fixUnusedVariables(content) {
  // Solo cambiar req por _req cuando realmente no se usa
  // Buscar patrones donde req se usa dentro de la función
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Buscar funciones que usan req pero no lo declaran como parámetro
    if (line.includes('async (_req, res) =>') || line.includes('(_req, res) =>')) {
      // Verificar si las siguientes líneas usan req
      let usesReq = false;
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].includes('req.')) {
          usesReq = true;
          break;
        }
        if (lines[j].includes('}') || lines[j].includes('});')) {
          break;
        }
      }
      
      if (usesReq) {
        // Cambiar _req de vuelta a req
        line = line.replace('_req', 'req');
      }
    }
    
    fixedLines.push(line);
  }
  
  return fixedLines.join('\n');
}

// Función para arreglar returns faltantes
function fixMissingReturns(content) {
  // Agregar returns faltantes en funciones async
  content = content.replace(
    /if \(!req\.isAuthenticated\(\)\) \{\s*res\.sendStatus\(401\);\s*return;\s*\}/g,
    'if (!req.isAuthenticated()) {\n      res.sendStatus(401);\n      return;\n    }'
  );
  
  // Agregar returns faltantes en catch blocks
  content = content.replace(
    /catch \(error\) \{\s*res\.status\(500\)\.json\(\{ message: "[^"]*" \}\);\s*\}/g,
    'catch (error) {\n      res.status(500).json({ message: "Error occurred" });\n      return;\n    }'
  );
  
  return content;
}

// Función para arreglar imports no utilizados
function fixUnusedImports(content) {
  // Comentar imports no utilizados
  content = content.replace(
    /import \{ User, GoogleProfile, UserUpdates \} from "\.\/types";/g,
    '// import { User, GoogleProfile, UserUpdates } from "./types";'
  );
  
  content = content.replace(
    /import \{ uploadFromUrl, deleteImage, isCloudinaryUrl \} from "\.\/cloudinary";/g,
    'import { uploadFromUrl, deleteImage } from "./cloudinary";'
  );
  
  return content;
}

// Archivos a procesar
const files = [
  'server/index.ts',
  'server/auth.ts',
  'server/routes.ts',
  'server/storage.ts'
];

files.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      console.log(`📝 Procesando ${file}...`);
      let content = fs.readFileSync(file, 'utf8');
      
      content = fixUnusedImports(content);
      content = fixUnusedVariables(content);
      content = fixMissingReturns(content);
      
      fs.writeFileSync(file, content);
      console.log(`✅ ${file} procesado`);
    } else {
      console.log(`❌ Archivo no encontrado: ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error procesando ${file}: ${error.message}`);
  }
});

console.log('\n🎉 Proceso completado. Ejecuta "npm run server:build" para verificar.'); 