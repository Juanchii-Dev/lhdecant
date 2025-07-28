// Script para hacer login como admin y luego probar los endpoints
import fetch from 'node-fetch';

async function testAdminWithLogin() {
  try {
    console.log("🔐 Haciendo login como admin...");
    
    // 1. Hacer login como admin
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Importante para las cookies
      body: JSON.stringify({
        email: 'lhdecant@gmail.com',
        password: '11qqaazz'
      })
    });
    
    if (!loginResponse.ok) {
      console.log(`❌ Error en login (${loginResponse.status}):`, await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log("✅ Login exitoso:", loginData);
    
    // 2. Verificar status de admin
    console.log("\n🔍 Verificando status de admin...");
    const statusResponse = await fetch('http://localhost:5000/api/admin/status', {
      credentials: 'include'
    });
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log("✅ Status de admin:", statusData);
    } else {
      console.log(`❌ Error en status (${statusResponse.status}):`, await statusResponse.text());
      return;
    }
    
    // 3. Probar dashboard-stats
    console.log("\n📊 Probando /api/admin/dashboard-stats:");
    const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
      credentials: 'include'
    });
    
    if (dashboardResponse.ok) {
      const data = await dashboardResponse.json();
      console.log("✅ Dashboard stats:", data);
    } else {
      console.log(`❌ Error (${dashboardResponse.status}):`, await dashboardResponse.text());
    }
    
    // 4. Probar user-stats
    console.log("\n👥 Probando /api/admin/user-stats:");
    const userStatsResponse = await fetch('http://localhost:5000/api/admin/user-stats', {
      credentials: 'include'
    });
    
    if (userStatsResponse.ok) {
      const data = await userStatsResponse.json();
      console.log("✅ User stats:", data);
    } else {
      console.log(`❌ Error (${userStatsResponse.status}):`, await userStatsResponse.text());
    }
    
    // 5. Probar sessions-stats
    console.log("\n🔐 Probando /api/admin/sessions-stats:");
    const sessionsResponse = await fetch('http://localhost:5000/api/admin/sessions-stats', {
      credentials: 'include'
    });
    
    if (sessionsResponse.ok) {
      const data = await sessionsResponse.json();
      console.log("✅ Session stats:", data);
    } else {
      console.log(`❌ Error (${sessionsResponse.status}):`, await sessionsResponse.text());
    }
    
    // 6. Probar perfumes
    console.log("\n🌸 Probando /api/perfumes:");
    const perfumesResponse = await fetch('http://localhost:5000/api/perfumes');
    
    if (perfumesResponse.ok) {
      const data = await perfumesResponse.json();
      console.log(`✅ Total perfumes: ${data.length}`);
      console.log("📋 Primeros 3 perfumes:", data.slice(0, 3).map(p => ({ id: p.id, name: p.name, brand: p.brand })));
    } else {
      console.log(`❌ Error (${perfumesResponse.status}):`, await perfumesResponse.text());
    }
    
  } catch (error) {
    console.error("❌ Error general:", error.message);
  }
}

testAdminWithLogin(); 