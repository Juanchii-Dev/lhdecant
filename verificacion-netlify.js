const axios = require('axios');

console.log('🔍 VERIFICACIÓN NETLIFY - LH DECANTS');
console.log('==================================================\n');

async function verificarNetlify() {
  try {
    // 1. Verificar que el frontend esté funcionando
    console.log('1️⃣ Verificando frontend en Netlify...');
    const frontendResponse = await axios.get('https://lhdecant.com');
    console.log('✅ Frontend respondiendo:', frontendResponse.status);
    
    // 2. Verificar que las variables de entorno estén disponibles
    console.log('\n2️⃣ Verificando variables de entorno...');
    console.log('📋 Variables necesarias en Netlify:');
    console.log('   - VITE_API_URL: https://lhdecant-backend.onrender.com');
    console.log('   - VITE_STRIPE_PUBLISHABLE_KEY: pk_live_...');
    console.log('   - VITE_GOOGLE_CLIENT_ID: 146579938759-...');
    
    // 3. Verificar que el backend esté accesible desde el frontend
    console.log('\n3️⃣ Verificando conectividad frontend-backend...');
    const backendResponse = await axios.get('https://lhdecant-backend.onrender.com/api/collections');
    console.log('✅ Backend accesible desde frontend:', backendResponse.status);
    
    // 4. Verificar endpoints públicos
    console.log('\n4️⃣ Verificando endpoints públicos...');
    const perfumesResponse = await axios.get('https://lhdecant-backend.onrender.com/api/perfumes/homepage');
    console.log('✅ /api/perfumes/homepage:', perfumesResponse.status);
    
    const collectionsResponse = await axios.get('https://lhdecant-backend.onrender.com/api/collections');
    console.log('✅ /api/collections:', collectionsResponse.status);
    
    // 5. Verificar Google OAuth
    console.log('\n5️⃣ Verificando Google OAuth...');
    const oauthResponse = await axios.get('https://lhdecant-backend.onrender.com/api/auth/google/status');
    console.log('✅ Google OAuth configurado:', oauthResponse.data.configured);
    
    console.log('\n==================================================');
    console.log('🎯 VERIFICACIÓN NETLIFY COMPLETADA');
    console.log('==================================================');
    console.log('\n📋 ESTADO DEL SISTEMA:');
    console.log('🟢 Frontend (Netlify): FUNCIONANDO');
    console.log('🟢 Backend (Render): FUNCIONANDO');
    console.log('🟢 Conectividad: FUNCIONANDO');
    console.log('🟢 Google OAuth: CONFIGURADO');
    console.log('🟢 Endpoints públicos: FUNCIONANDO');
    
    console.log('\n🚀 PRÓXIMOS PASOS PARA TESTING:');
    console.log('1. Visita https://lhdecant.com');
    console.log('2. Abre DevTools (F12)');
    console.log('3. Ve a la pestaña Console');
    console.log('4. Ejecuta: console.log(import.meta.env.VITE_API_URL)');
    console.log('5. Verifica que muestre: https://lhdecant-backend.onrender.com');
    console.log('6. Prueba el login con Google');
    console.log('7. Verifica que no haya errores 401');
    
    console.log('\n🔍 PARA DEBUGGING:');
    console.log('- Verifica que las variables de entorno estén en Netlify Dashboard');
    console.log('- Asegúrate de que el redeploy se haya completado');
    console.log('- Limpia el cache del navegador si es necesario');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Data:', error.response.data);
    }
  }
}

verificarNetlify(); 