const https = require('https');

const BACKEND_URL = 'https://lhdecant-backend.onrender.com';

console.log('🔍 PROBANDO CALLBACK DE GOOGLE OAUTH...\n');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'LhDecant-Callback-Tester/1.0',
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

async function testGoogleCallback() {
  console.log('🔍 Probando callback de Google OAuth...\n');
  
  try {
    // Probar con parámetros de error (debería redirigir con error)
    const testUrl = `${BACKEND_URL}/api/auth/google/callback?error=access_denied&error_description=User%20denied%20access`;
    
    console.log(`📡 Probando: ${testUrl}`);
    const response = await makeRequest(testUrl);
    
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 302) {
      console.log(`   ✅ Callback funciona - Redirige correctamente`);
      console.log(`   Location: ${response.headers.location}`);
      
      if (response.headers.location.includes('error=google')) {
        console.log(`   🎯 Callback maneja errores correctamente`);
      }
    } else if (response.status === 200) {
      console.log(`   ⚠️ Callback devuelve 200 (puede ser HTML de error)`);
    } else {
      console.log(`   ❌ Callback no funciona como esperado`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testGoogleAuth() {
  console.log('🔍 Probando endpoint de autenticación...\n');
  
  try {
    const authUrl = `${BACKEND_URL}/api/auth/google`;
    
    console.log(`📡 Probando: ${authUrl}`);
    const response = await makeRequest(authUrl);
    
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 302) {
      console.log(`   ✅ Auth endpoint funciona - Redirige a Google`);
      console.log(`   Location: ${response.headers.location}`);
      
      if (response.headers.location.includes('accounts.google.com')) {
        console.log(`   🎯 Redirige correctamente a Google OAuth`);
      }
    } else {
      console.log(`   ❌ Auth endpoint no funciona como esperado`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runTest() {
  console.log('🚀 INICIANDO PRUEBAS DE GOOGLE OAUTH...\n');
  
  await testGoogleAuth();
  await testGoogleCallback();
  
  console.log('\n📊 RESUMEN:');
  console.log('='.repeat(50));
  console.log('🎯 Si ambos endpoints funcionan:');
  console.log('   ✅ Google OAuth está configurado correctamente');
  console.log('🎯 Si fallan:');
  console.log('   ❌ Hay problemas en la configuración');
  console.log('='.repeat(50));
}

runTest().catch(console.error); 