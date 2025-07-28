// Script que simula un navegador real con cookies persistentes
import fetch from 'node-fetch';

// Simular un navegador con cookies persistentes
const browser = {
  cookies: new Map(),
  
  async request(url, options = {}) {
    const cookieHeader = Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Capturar cookies de la respuesta
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const cookies = setCookieHeader.split(',');
      cookies.forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
          this.cookies.set(name.trim(), value.trim());
        }
      });
    }
    
    return response;
  }
};

async function testAdminWithBrowser() {
  try {
    console.log("🌐 Simulando navegador real...");
    
    // 1. Hacer login como admin
    console.log("\n🔐 Haciendo login como admin...");
    const loginResponse = await browser.request('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
    console.log("🍪 Cookies capturadas:", Array.from(browser.cookies.entries()));
    
    // 2. Verificar status de admin
    console.log("\n🔍 Verificando status de admin...");
    const statusResponse = await browser.request('http://localhost:5000/api/admin/status');
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log("✅ Status de admin:", statusData);
    } else {
      console.log(`❌ Error en status (${statusResponse.status}):`, await statusResponse.text());
      return;
    }
    
    // 3. Probar dashboard-stats
    console.log("\n📊 Probando /api/admin/dashboard-stats:");
    const dashboardResponse = await browser.request('http://localhost:5000/api/admin/dashboard-stats');
    
    if (dashboardResponse.ok) {
      const data = await dashboardResponse.json();
      console.log("✅ Dashboard stats:", data);
    } else {
      console.log(`❌ Error (${dashboardResponse.status}):`, await dashboardResponse.text());
    }
    
    // 4. Probar user-stats
    console.log("\n👥 Probando /api/admin/user-stats:");
    const userStatsResponse = await browser.request('http://localhost:5000/api/admin/user-stats');
    
    if (userStatsResponse.ok) {
      const data = await userStatsResponse.json();
      console.log("✅ User stats:", data);
    } else {
      console.log(`❌ Error (${userStatsResponse.status}):`, await userStatsResponse.text());
    }
    
    // 5. Probar sessions-stats
    console.log("\n🔐 Probando /api/admin/sessions-stats:");
    const sessionsResponse = await browser.request('http://localhost:5000/api/admin/sessions-stats');
    
    if (sessionsResponse.ok) {
      const data = await sessionsResponse.json();
      console.log("✅ Session stats:", data);
    } else {
      console.log(`❌ Error (${sessionsResponse.status}):`, await sessionsResponse.text());
    }
    
    // 6. Probar perfumes
    console.log("\n🌸 Probando /api/perfumes:");
    const perfumesResponse = await browser.request('http://localhost:5000/api/perfumes');
    
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

testAdminWithBrowser(); 