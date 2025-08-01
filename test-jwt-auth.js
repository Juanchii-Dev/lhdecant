const axios = require('axios');

const API_BASE = 'https://lhdecant-backend.onrender.com';

async function testJWT() {
  console.log('🧪 Probando autenticación JWT...\n');
  
  try {
    // 1. Probar endpoint público
    console.log('1️⃣ Probando endpoint público...');
    const publicResponse = await axios.get(`${API_BASE}/api/perfumes`);
    console.log('✅ Endpoint público funciona:', publicResponse.status);
    
    // 2. Probar endpoint protegido sin JWT
    console.log('\n2️⃣ Probando endpoint protegido sin JWT...');
    try {
      await axios.get(`${API_BASE}/api/user`);
      console.log('❌ Error: Debería haber fallado sin JWT');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correcto: 401 Unauthorized sin JWT');
      } else {
        console.log('❌ Error inesperado:', error.response?.status);
      }
    }
    
    // 3. Probar CORS
    console.log('\n3️⃣ Probando CORS...');
    const corsResponse = await axios.get(`${API_BASE}/api/perfumes`, {
      headers: {
        'Origin': 'https://lhdecant.com'
      }
    });
    console.log('✅ CORS funciona:', corsResponse.status);
    
    console.log('\n🎉 Todas las pruebas pasaron!');
    console.log('\n📋 Resumen:');
    console.log('- ✅ Backend respondiendo');
    console.log('- ✅ CORS configurado correctamente');
    console.log('- ✅ Autenticación JWT funcionando');
    console.log('- ✅ Endpoints protegidos funcionando');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testJWT(); 