const fs = require('fs');
const path = require('path');

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Patrón para encontrar fetch('/api/...')
    const fetchPattern = /fetch\(['"`](\/api\/[^'"`]+)['"`]/g;
    
    // Reemplazar fetch directo con buildApiUrl
    content = content.replace(fetchPattern, (match, endpoint) => {
      modified = true;
      return `fetch(buildApiUrl('${endpoint}')`;
    });

    // Si se modificó el archivo, agregar el import si no existe
    if (modified && !content.includes("import { buildApiUrl }")) {
      // Buscar la línea después de los imports
      const importMatch = content.match(/(import.*from.*['"`][^'"`]+['"`];?\n?)+/);
      if (importMatch) {
        const importEnd = importMatch[0].lastIndexOf(';') + 1;
        const beforeImports = content.substring(0, importEnd);
        const afterImports = content.substring(importEnd);
        
        content = beforeImports + 
                  "\nimport { buildApiUrl } from \"../config/api\";" + 
                  afterImports;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalFixed += processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (processFile(filePath)) {
        totalFixed++;
      }
    }
  }

  return totalFixed;
}

// Procesar el directorio client/src
const clientSrcPath = path.join(__dirname, 'client', 'src');
console.log('🔧 Fixing API calls in client/src...');
const fixedCount = processDirectory(clientSrcPath);
console.log(`\n🎉 Total files fixed: ${fixedCount}`); 