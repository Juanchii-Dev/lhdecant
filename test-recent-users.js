// Script para probar el endpoint de usuarios recientes
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

async function testRecentUsers() {
  try {
    console.log("🌐 Probando endpoint de usuarios recientes...");
    
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
    
    // 2. Probar endpoint de usuarios recientes
    console.log("\n👥 Probando /api/admin/recent-users:");
    const recentUsersResponse = await browser.request('http://localhost:5000/api/admin/recent-users');
    
    if (recentUsersResponse.ok) {
      const data = await recentUsersResponse.json();
      console.log("✅ Usuarios recientes:", data);
      console.log(`📊 Total usuarios recientes: ${data.length}`);
      
      if (data.length > 0) {
        console.log("\n📋 Detalles de usuarios:");
        data.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email || user.username} (${user.id})`);
          console.log(`      Creado: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`);
        });
      }
    } else {
      console.log(`❌ Error (${recentUsersResponse.status}):`, await recentUsersResponse.text());
    }
    
    // 3. Probar endpoint de todos los usuarios para comparar
    console.log("\n👥 Probando /api/admin/users:");
    const allUsersResponse = await browser.request('http://localhost:5000/api/admin/users');
    
    if (allUsersResponse.ok) {
      const data = await allUsersResponse.json();
      console.log(`✅ Total usuarios: ${data.length}`);
      console.log("📋 Todos los usuarios:", data.map(u => ({ id: u.id, email: u.email, username: u.username })));
    } else {
      console.log(`❌ Error (${allUsersResponse.status}):`, await allUsersResponse.text());
    }
    
  } catch (error) {
    console.error("❌ Error general:", error.message);
  }
}

testRecentUsers(); 