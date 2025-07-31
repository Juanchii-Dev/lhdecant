const https = require('https');

const FRONTEND_URL = 'https://lhdecant.com';
const BACKEND_URL = 'https://lhdecant-backend.onrender.com';

console.log('🚨 VERIFICACIÓN URGENTE DE REDIRECCIONES NETLIFY...\n');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'LhDecant-Redirect-Tester/1.0',
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

async function testNetlifyRedirects() {
  console.log('🔍 Verificando redirecciones de Netlify...\n');
  
  const apis = [
    '/api/auth/google',
    '/api/health',
    '/api/perfumes/homepage',
    '/api/cart'
  ];
  
  for (const api of apis) {
    try {
      console.log(`📡 Probando: ${FRONTEND_URL}${api}`);
      const response = await makeRequest(`${FRONTEND_URL}${api}`);
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   ✅ API redirigida correctamente`);
      } else if (response.status === 302) {
        console.log(`   🔄 Redirección detectada`);
        console.log(`   Location: ${response.headers.location}`);
      } else if (response.status === 404) {
        console.log(`   ❌ ERROR: Netlify NO está redirigiendo - 404`);
        console.log(`   💡 El problema está en las redirecciones de Netlify`);
      } else {
        console.log(`   ⚠️ Status inesperado: ${response.status}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

async function testDirectBackend() {
  console.log('🔍 Verificando backend directo...\n');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/google`);
    console.log(`📡 Backend directo /api/auth/google: ${response.status}`);
    
    if (response.status === 302) {
      console.log(`   ✅ Backend redirige a Google OAuth correctamente`);
      console.log(`   Location: ${response.headers.location}`);
    } else {
      console.log(`   ❌ Backend no redirige como esperado`);
    }
    
  } catch (error) {
    console.log(`❌ Backend Error: ${error.message}`);
  }
}

async function runUrgentTest() {
  console.log('🚨 INICIANDO VERIFICACIÓN URGENTE...\n');
  
  await testDirectBackend();
  await testNetlifyRedirects();
  
  console.log('\n📊 DIAGNÓSTICO:');
  console.log('='.repeat(50));
  console.log('🎯 Si ves 404 en las APIs de Netlify:');
  console.log('   ❌ PROBLEMA: Redirecciones no funcionan');
  console.log('🎯 Si ves 200/302 en las APIs de Netlify:');
  console.log('   ✅ FUNCIONA: Redirecciones correctas');
  console.log('='.repeat(50));
  
  console.log('\n🔗 URLs de Verificación:');
  console.log(`Frontend API: ${FRONTEND_URL}/api/auth/google`);
  console.log(`Backend API: ${BACKEND_URL}/api/auth/google`);
}

runUrgentTest().catch(console.error); 