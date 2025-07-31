const https = require('https');

console.log('🔍 Probando estado del backend...');

// Función para hacer petición HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testBackend() {
  try {
    console.log('📡 Probando endpoint de salud...');
    const healthResponse = await makeRequest('https://lhdecant-backend.onrender.com/api/health');
    console.log('✅ Health check:', healthResponse.statusCode);
    console.log('📋 Headers:', healthResponse.headers);
    
    console.log('\n📡 Probando endpoint de debug CORS...');
    const corsResponse = await makeRequest('https://lhdecant-backend.onrender.com/api/debug/cors');
    console.log('✅ CORS debug:', corsResponse.statusCode);
    console.log('📋 Data:', corsResponse.data);
    
    console.log('\n📡 Probando endpoint de usuario (sin cookies)...');
    const userResponse = await makeRequest('https://lhdecant-backend.onrender.com/api/user');
    console.log('✅ User endpoint:', userResponse.statusCode);
    console.log('📋 Response:', userResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBackend(); 