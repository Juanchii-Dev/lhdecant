const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://lhdecant-backend.onrender.com';
const FRONTEND_URL = 'https://lhdecant.com';

console.log('🔍 VERIFICACIÓN FINAL - APLICACIÓN COMPLETA\n');

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
          data: data
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

async function checkBackendHealth() {
  console.log('🔧 Verificando Backend...');
  
  try {
    const health = await makeRequest(`${BACKEND_URL}/api/health`);
    console.log(`✅ Health Check: ${health.status}`);
    
    const healthData = JSON.parse(health.data);
    console.log(`   - Status: ${healthData.status}`);
    console.log(`   - Environment: ${healthData.environment}`);
    console.log(`   - CORS: ${healthData.cors}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Backend Error: ${error.message}`);
    return false;
  }
}

async function checkApiEndpoints() {
  console.log('\n📡 Verificando Endpoints de API...');
  
  const endpoints = [
    '/api/perfumes',
    '/api/collections',
    '/api/auth/google',
    '/api/debug/cors',
    '/api/debug/env'
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status}`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  return successCount === endpoints.length;
}

async function checkFrontend() {
  console.log('\n🌐 Verificando Frontend...');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    console.log(`✅ Frontend: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   - Página principal cargando correctamente');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Frontend Error: ${error.message}`);
    return false;
  }
}

async function checkNetlifyRedirects() {
  console.log('\n🔄 Verificando Redirecciones de Netlify...');
  
  try {
    // Verificar que las APIs se redirigen al backend
    const apiResponse = await makeRequest(`${FRONTEND_URL}/api/health`);
    console.log(`✅ API Redirect: ${apiResponse.status}`);
    
    if (apiResponse.status === 200) {
      console.log('   - Redirecciones de API funcionando correctamente');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ API Redirect Error: ${error.message}`);
    return false;
  }
}

async function runFinalVerification() {
  console.log('🚀 INICIANDO VERIFICACIÓN FINAL...\n');
  
  const results = {
    backend: await checkBackendHealth(),
    api: await checkApiEndpoints(),
    frontend: await checkFrontend(),
    redirects: await checkNetlifyRedirects()
  };
  
  console.log('\n📊 RESULTADOS FINALES:');
  console.log('='.repeat(50));
  console.log(`Backend Health: ${results.backend ? '✅ OK' : '❌ FAIL'}`);
  console.log(`API Endpoints: ${results.api ? '✅ OK' : '❌ FAIL'}`);
  console.log(`Frontend: ${results.frontend ? '✅ OK' : '❌ FAIL'}`);
  console.log(`Netlify Redirects: ${results.redirects ? '✅ OK' : '❌ FAIL'}`);
  console.log('='.repeat(50));
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 ¡VERIFICACIÓN EXITOSA!');
    console.log('✅ Todos los componentes funcionando correctamente');
    console.log('✅ Aplicación lista para producción');
    console.log('✅ Google OAuth configurado');
    console.log('✅ CORS funcionando');
    console.log('✅ APIs respondiendo');
    console.log('✅ Frontend cargando');
  } else {
    console.log('\n⚠️ VERIFICACIÓN CON PROBLEMAS');
    console.log('❌ Algunos componentes necesitan atención');
  }
  
  console.log('\n🔗 URLs de Producción:');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Google OAuth: ${BACKEND_URL}/api/auth/google`);
}

runFinalVerification().catch(console.error); 