const fs = require('fs');
const path = require('path');

// Función para corregir URLs de API en un archivo
function fixApiUrlsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Patrón para encontrar buildApiUrl con template literals incorrectos
    const patterns = [
      {
        regex: /buildApiUrl\('\/api\/[^']*\$\{[^}]*\}'\)/g,
        replacement: (match) => {
          // Convertir comillas simples a backticks
          return match.replace(/'/g, '`');
        }
      },
      {
        regex: /buildApiUrl\("\/api\/[^"]*\$\{[^}]*\}"\)/g,
        replacement: (match) => {
          // Convertir comillas dobles a backticks
          return match.replace(/"/g, '`');
        }
      }
    ];
    
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.regex, pattern.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalFixed = 0;
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalFixed += processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixApiUrlsInFile(filePath)) {
        totalFixed++;
      }
    }
  });
  
  return totalFixed;
}

// Procesar el directorio client/src
console.log('🔧 Corrigiendo URLs de API en archivos TypeScript...\n');

const clientSrcPath = path.join(__dirname, '..', 'client', 'src');
const fixedCount = processDirectory(clientSrcPath);

console.log(`\n🎉 Proceso completado! ${fixedCount} archivos corregidos.`); 