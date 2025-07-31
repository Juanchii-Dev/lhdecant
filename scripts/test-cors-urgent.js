const https = require('https');

const BACKEND_URL = 'https://lhdecant-backend.onrender.com';
const FRONTEND_URL = 'https://lhdecant.com';

console.log('🚨 VERIFICACIÓN URGENTE DE CORS...\n');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'LhDecant-CORS-Tester/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
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

async function testCorsHeaders() {
  console.log('🔍 Verificando headers CORS...\n');
  
  const apis = [
    '/api/health',
    '/api/perfumes/homepage',
    '/api/collections',
    '/api/cart'
  ];
  
  for (const api of apis) {
    try {
      console.log(`📡 Probando: ${BACKEND_URL}${api}`);
      const response = await makeRequest(`${BACKEND_URL}${api}`);
      
      console.log(`   Status: ${response.status}`);
      
      const corsOrigin = response.headers['access-control-allow-origin'];
      const corsMethods = response.headers['access-control-allow-methods'];
      const corsHeaders = response.headers['access-control-allow-headers'];
      const corsCredentials = response.headers['access-control-allow-credentials'];
      
      console.log(`   🎯 Access-Control-Allow-Origin: ${corsOrigin}`);
      console.log(`   🔧 Access-Control-Allow-Methods: ${corsMethods}`);
      console.log(`   📋 Access-Control-Allow-Headers: ${corsHeaders}`);
      console.log(`   🔐 Access-Control-Allow-Credentials: ${corsCredentials}`);
      
      if (corsOrigin === FRONTEND_URL) {
        console.log(`   ✅ CORS configurado correctamente para ${FRONTEND_URL}`);
      } else if (corsOrigin === 'http://localhost:5173') {
        console.log(`   ❌ ERROR: CORS configurado para localhost en lugar de producción`);
      } else {
        console.log(`   ⚠️ CORS configurado para: ${corsOrigin}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

async function testPreflightRequest() {
  console.log('🔍 Verificando preflight OPTIONS...\n');
  
  try {
    console.log(`📡 Probando OPTIONS: ${BACKEND_URL}/api/cart`);
    const response = await makeRequest(`${BACKEND_URL}/api/cart`, {
      method: 'OPTIONS'
    });
    
    console.log(`   Status: ${response.status}`);
    
    const corsOrigin = response.headers['access-control-allow-origin'];
    console.log(`   🎯 Access-Control-Allow-Origin: ${corsOrigin}`);
    
    if (response.status === 200) {
      console.log(`   ✅ Preflight funcionando correctamente`);
    } else {
      console.log(`   ❌ Preflight falló`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
}

async function runUrgentTest() {
  console.log('🚨 INICIANDO VERIFICACIÓN URGENTE DE CORS...\n');
  
  await testCorsHeaders();
  await testPreflightRequest();
  
  console.log('\n📊 RESUMEN URGENTE:');
  console.log('='.repeat(50));
  console.log('🎯 Si ves "http://localhost:5173" en Access-Control-Allow-Origin:');
  console.log('   ❌ PROBLEMA: El backend está configurado para desarrollo');
  console.log('🎯 Si ves "https://lhdecant.com" en Access-Control-Allow-Origin:');
  console.log('   ✅ SOLUCIONADO: CORS configurado correctamente');
  console.log('='.repeat(50));
  
  console.log('\n🔗 URLs de Verificación:');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
}

runUrgentTest().catch(console.error); 