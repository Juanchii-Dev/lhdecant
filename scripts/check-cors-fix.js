const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://lhdecant-backend.onrender.com';
const FRONTEND_URL = 'https://lhdecant.com';

console.log('🔧 VERIFICANDO CORS FIX...\n');

// Función para hacer peticiones HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'LhDecant-CORS-Checker/1.0',
        'Origin': FRONTEND_URL,
        ...options.headers
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

async function checkCORSHeaders() {
  console.log('🔍 Verificando headers de CORS...\n');
  
  const endpoints = [
    '/api/health',
    '/api/perfumes',
    '/api/collections',
    '/api/cart',
    '/api/user'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint}`);
      
      console.log(`📡 ${endpoint}:`);
      console.log(`   Status: ${response.status}`);
      
      const corsOrigin = response.headers['access-control-allow-origin'];
      console.log(`   CORS Origin: ${corsOrigin || 'NO SET'}`);
      
      if (corsOrigin === FRONTEND_URL) {
        console.log(`   ✅ CORS CORRECTO para ${FRONTEND_URL}`);
      } else if (corsOrigin === '*') {
        console.log(`   ⚠️ CORS PERMISIVO (*)`);
      } else {
        console.log(`   ❌ CORS INCORRECTO: ${corsOrigin}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}\n`);
    }
  }
}

async function checkSpecificCORS() {
  console.log('🎯 Verificando CORS específico para lhdecant.com...\n');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    
    console.log('📊 RESULTADO CORS:');
    console.log(`   Origin enviado: ${FRONTEND_URL}`);
    console.log(`   CORS recibido: ${response.headers['access-control-allow-origin'] || 'NO SET'}`);
    console.log(`   Status: ${response.status}`);
    
    if (response.headers['access-control-allow-origin'] === FRONTEND_URL) {
      console.log('   ✅ CORS FUNCIONANDO CORRECTAMENTE');
      return true;
    } else {
      console.log('   ❌ CORS AÚN NO FUNCIONA');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error verificando CORS: ${error.message}`);
    return false;
  }
}

async function runCORSFix() {
  console.log('🚀 INICIANDO VERIFICACIÓN CORS...\n');
  
  await checkCORSHeaders();
  const corsWorking = await checkSpecificCORS();
  
  console.log('\n📊 RESUMEN:');
  console.log('='.repeat(50));
  
  if (corsWorking) {
    console.log('✅ CORS CORREGIDO - Aplicación funcionando');
    console.log('✅ Los perfumes deberían cargar correctamente');
    console.log('✅ El carrito debería funcionar');
    console.log('✅ Google OAuth debería funcionar');
  } else {
    console.log('❌ CORS AÚN NO FUNCIONA');
    console.log('⚠️ Esperar unos minutos para que Render actualice');
    console.log('⚠️ Verificar logs del servidor en Render');
  }
  
  console.log('='.repeat(50));
  
  console.log('\n🔗 URLs de Verificación:');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`API Health: ${BACKEND_URL}/api/health`);
}

runCORSFix().catch(console.error); 