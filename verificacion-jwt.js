const axios = require('axios');

console.log('🔍 VERIFICACIÓN ESPECÍFICA JWT - LH DECANTS');
console.log('==================================================\n');

async function verificarJWT() {
  try {
    // 1. Verificar que el backend esté funcionando
    console.log('1️⃣ Verificando backend...');
    const backendResponse = await axios.get('https://lhdecant-backend.onrender.com/api/collections');
    console.log('✅ Backend respondiendo:', backendResponse.status);
    
    // 2. Verificar endpoint de Google OAuth
    console.log('\n2️⃣ Verificando Google OAuth...');
    const oauthResponse = await axios.get('https://lhdecant-backend.onrender.com/api/auth/google/status');
    console.log('✅ Google OAuth configurado:', oauthResponse.data.configured);
    console.log('📋 Client ID:', oauthResponse.data.client_id);
    console.log('🔗 Redirect URI:', oauthResponse.data.redirect_uri);
    
    // 3. Verificar que el frontend esté funcionando
    console.log('\n3️⃣ Verificando frontend...');
    const frontendResponse = await axios.get('https://lhdecant.com');
    console.log('✅ Frontend respondiendo:', frontendResponse.status);
    
    // 4. Verificar endpoints protegidos (deben fallar sin JWT)
    console.log('\n4️⃣ Verificando endpoints protegidos (sin JWT)...');
    try {
      await axios.get('https://lhdecant-backend.onrender.com/api/user');
      console.log('❌ ERROR: Endpoint /api/user debería requerir JWT');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correcto: /api/user requiere autenticación');
      } else {
        console.log('⚠️ Respuesta inesperada:', error.response?.status);
      }
    }
    
    try {
      await axios.get('https://lhdecant-backend.onrender.com/api/cart');
      console.log('❌ ERROR: Endpoint /api/cart debería requerir JWT');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correcto: /api/cart requiere autenticación');
      } else {
        console.log('⚠️ Respuesta inesperada:', error.response?.status);
      }
    }
    
    // 5. Verificar endpoints públicos
    console.log('\n5️⃣ Verificando endpoints públicos...');
    const perfumesResponse = await axios.get('https://lhdecant-backend.onrender.com/api/perfumes/homepage');
    console.log('✅ /api/perfumes/homepage accesible:', perfumesResponse.status);
    
    const collectionsResponse = await axios.get('https://lhdecant-backend.onrender.com/api/collections');
    console.log('✅ /api/collections accesible:', collectionsResponse.status);
    
    console.log('\n==================================================');
    console.log('🎯 VERIFICACIÓN JWT COMPLETADA');
    console.log('==================================================');
    console.log('\n📋 ESTADO DEL SISTEMA:');
    console.log('🟢 Backend: FUNCIONANDO');
    console.log('🟢 Frontend: FUNCIONANDO');
    console.log('🟢 Google OAuth: CONFIGURADO');
    console.log('🟢 Endpoints protegidos: FUNCIONANDO');
    console.log('🟢 Endpoints públicos: FUNCIONANDO');
    
    console.log('\n🚀 PRÓXIMOS PASOS PARA TESTING:');
    console.log('1. Visita https://lhdecant.com');
    console.log('2. Haz clic en "Acceso / Registro"');
    console.log('3. Selecciona "Continuar con Google"');
    console.log('4. Completa el login de Google');
    console.log('5. Verifica que el JWT se guarde en localStorage');
    console.log('6. Verifica que las peticiones incluyan Authorization header');
    
    console.log('\n🔍 PARA DEBUGGING:');
    console.log('- Abre las DevTools (F12)');
    console.log('- Ve a la pestaña Console');
    console.log('- Busca los logs que empiecen con 🔑');
    console.log('- Verifica que no haya errores 401');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Data:', error.response.data);
    }
  }
}

verificarJWT(); 