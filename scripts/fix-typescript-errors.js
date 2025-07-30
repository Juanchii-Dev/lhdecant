#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Arreglando errores de TypeScript...\n');

// Función para arreglar variables no utilizadas
function fixUnusedVariables(content) {
  // Arreglar parámetros no utilizados en funciones async
  content = content.replace(/async \(req, res\) =>/g, 'async (_req, res) =>');
  content = content.replace(/async \(req, res, next\) =>/g, 'async (_req, res, next) =>');
  
  // Arreglar parámetros no utilizados en funciones normales
  content = content.replace(/\(req, res\) =>/g, '(_req, res) =>');
  content = content.replace(/\(req, res, next\) =>/g, '(_req, res, next) =>');
  
  return content;
}

// Función para arreglar returns faltantes
function fixMissingReturns(content) {
  // Arreglar funciones async que no retornan en todos los caminos
  content = content.replace(
    /if \(!req\.isAuthenticated\(\)\) return res\.sendStatus\(401\);/g,
    'if (!req.isAuthenticated()) {\n      res.sendStatus(401);\n      return;\n    }'
  );
  
  content = content.replace(
    /if \(!perfume\) \{\s*res\.status\(404\)\.json\(\{ message: "Perfume not found" \}\);\s*\} else \{\s*res\.json\(perfume\);\s*\}/g,
    'if (!perfume) {\n      res.status(404).json({ message: "Perfume not found" });\n      return;\n    }\n    res.json(perfume);'
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