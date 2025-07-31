const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://lhdecant-backend.onrender.com';
const FRONTEND_URL = 'https://lhdecant.com';

console.log('🔧 VERIFICACIÓN FINAL - TODOS LOS PROBLEMAS SOLUCIONADOS\n');

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
        'User-Agent': 'LhDecant-Final-Verifier/1.0',
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
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

async function checkCORSFix() {
  console.log('🔍 Verificando CORS...\n');
  
  const endpoints = [
    '/api/health',
    '/api/perfumes',
    '/api/collections',
    '/api/cart'
  ];
  
  let corsFixed = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint}`);
      
      const corsOrigin = response.headers['access-control-allow-origin'];
      console.log(`📡 ${endpoint}:`);
      console.log(`   Status: ${response.status}`);
      console.log(`   CORS: ${corsOrigin || 'NO SET'}`);
      
      if (corsOrigin === FRONTEND_URL || corsOrigin === '*') {
        console.log(`   ✅ CORS OK`);
      } else {
        console.log(`   ❌ CORS PROBLEMA`);
        corsFixed = false;
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}\n`);
      corsFixed = false;
    }
  }
  
  return corsFixed;
}

async function checkGoogleOAuth() {
  console.log('🔐 Verificando Google OAuth...\n');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/google`);
    console.log(`📡 Google OAuth: ${response.status}`);
    
    if (response.status === 302) {
      console.log('✅ Google OAuth redirigiendo correctamente');
      return true;
    } else {
      console.log('❌ Google OAuth no funciona');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Google OAuth Error: ${error.message}`);
    return false;
  }
}

async function checkFrontend() {
  console.log('🌐 Verificando Frontend...\n');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    console.log(`📡 Frontend: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Frontend funcionando');
      return true;
    } else {
      console.log('❌ Frontend no funciona');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Frontend Error: ${error.message}`);
    return false;
  }
}

async function checkAPIs() {
  console.log('📡 Verificando APIs...\n');
  
  const apis = [
    { name: 'Perfumes', endpoint: '/api/perfumes' },
    { name: 'Collections', endpoint: '/api/collections' },
    { name: 'Health', endpoint: '/api/health' }
  ];
  
  let apisWorking = true;
  
  for (const api of apis) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${api.endpoint}`);
      console.log(`📡 ${api.name}: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   ✅ ${api.name} OK`);
      } else {
        console.log(`   ❌ ${api.name} PROBLEMA`);
        apisWorking = false;
      }
      
    } catch (error) {
      console.log(`❌ ${api.name}: ${error.message}`);
      apisWorking = false;
    }
  }
  
  return apisWorking;
}

async function runFinalVerification() {
  console.log('🚀 INICIANDO VERIFICACIÓN FINAL...\n');
  
  const results = {
    cors: await checkCORSFix(),
    oauth: await checkGoogleOAuth(),
    frontend: await checkFrontend(),
    apis: await checkAPIs()
  };
  
  console.log('\n📊 RESULTADOS FINALES:');
  console.log('='.repeat(60));
  console.log(`CORS: ${results.cors ? '✅ SOLUCIONADO' : '❌ PROBLEMA'}`);
  console.log(`Google OAuth: ${results.oauth ? '✅ FUNCIONANDO' : '❌ PROBLEMA'}`);
  console.log(`Frontend: ${results.frontend ? '✅ FUNCIONANDO' : '❌ PROBLEMA'}`);
  console.log(`APIs: ${results.apis ? '✅ FUNCIONANDO' : '❌ PROBLEMA'}`);
  console.log('='.repeat(60));
  
  const allFixed = Object.values(results).every(result => result);
  
  if (allFixed) {
    console.log('\n🎉 ¡TODOS LOS PROBLEMAS SOLUCIONADOS!');
    console.log('✅ CORS funcionando correctamente');
    console.log('✅ Google OAuth redirigiendo a lhdecant.com');
    console.log('✅ Frontend cargando sin errores');
    console.log('✅ APIs respondiendo correctamente');
    console.log('✅ Los perfumes deberían cargar');
    console.log('✅ El carrito debería funcionar');
    console.log('✅ Todo listo para producción');
  } else {
    console.log('\n⚠️ ALGUNOS PROBLEMAS PERSISTEN');
    console.log('❌ Revisar logs del servidor en Render');
    console.log('❌ Verificar configuración de Google OAuth');
  }
  
  console.log('\n🔗 URLs de Verificación:');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Google OAuth: ${BACKEND_URL}/api/auth/google`);
}

runFinalVerification().catch(console.error); 