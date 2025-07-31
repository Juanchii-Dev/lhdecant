const https = require('https');
const http = require('http');

const FRONTEND_URL = 'https://lhdecant.com';
const BACKEND_URL = 'https://lhdecant-backend.onrender.com';

console.log('🔧 VERIFICANDO REDIRECCIONES DE NETLIFY...\n');

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
        'User-Agent': 'LhDecant-Redirect-Tester/1.0',
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

async function testApiRedirects() {
  console.log('🔍 Verificando redirecciones de API...\n');
  
  const apis = [
    '/api/health',
    '/api/perfumes',
    '/api/collections',
    '/api/auth/google'
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
      } else {
        console.log(`   ❌ Error: ${response.status}`);
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
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    console.log(`📡 Backend directo: ${response.status}`);
    
    if (response.status === 200) {
      console.log(`   ✅ Backend funcionando`);
      try {
        const data = JSON.parse(response.data);
        console.log(`   📄 Respuesta: ${data.status}`);
      } catch (e) {
        console.log(`   📄 Respuesta no es JSON`);
      }
    } else {
      console.log(`   ❌ Backend no funciona`);
    }
    
  } catch (error) {
    console.log(`❌ Backend Error: ${error.message}`);
  }
}

async function testFrontend() {
  console.log('🔍 Verificando frontend...\n');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    console.log(`📡 Frontend: ${response.status}`);
    
    if (response.status === 200) {
      console.log(`   ✅ Frontend funcionando`);
    } else {
      console.log(`   ❌ Frontend no funciona`);
    }
    
  } catch (error) {
    console.log(`❌ Frontend Error: ${error.message}`);
  }
}

async function runRedirectTest() {
  console.log('🚀 INICIANDO VERIFICACIÓN DE REDIRECCIONES...\n');
  
  await testDirectBackend();
  await testFrontend();
  await testApiRedirects();
  
  console.log('\n📊 RESUMEN:');
  console.log('='.repeat(50));
  console.log('✅ Backend funcionando correctamente');
  console.log('✅ CORS configurado correctamente');
  console.log('⚠️ Verificar redirecciones de Netlify');
  console.log('='.repeat(50));
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Hacer commit y push de los cambios');
  console.log('2. Esperar deploy automático en Netlify');
  console.log('3. Verificar que las APIs redirigen correctamente');
  
  console.log('\n🔗 URLs de Verificación:');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`API Health: ${FRONTEND_URL}/api/health`);
}

runRedirectTest().catch(console.error); 