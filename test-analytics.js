// Script para probar los endpoints de analytics
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

async function testAnalytics() {
  try {
    console.log("📊 Probando endpoints de analytics...");
    
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
    
    // 2. Probar endpoint de perfumes populares
    console.log("\n🏆 Probando /api/admin/popular-perfumes:");
    const popularResponse = await browser.request('http://localhost:5000/api/admin/popular-perfumes');
    
    if (popularResponse.ok) {
      const data = await popularResponse.json();
      console.log("✅ Perfumes populares:", data);
      console.log(`📊 Total perfumes populares: ${data.length}`);
      
      if (data.length > 0) {
        console.log("\n📋 Detalles de perfumes populares:");
        data.forEach((perfume, index) => {
          console.log(`   ${index + 1}. ${perfume.name} (${perfume.brand})`);
          console.log(`      Precio: $${perfume.prices?.[0] || 'N/A'}`);
          console.log(`      ID: ${perfume.id}`);
        });
      }
    } else {
      console.log(`❌ Error (${popularResponse.status}):`, await popularResponse.text());
    }
    
    // 3. Probar endpoint de estadísticas de ventas
    console.log("\n💰 Probando /api/admin/sales-stats:");
    const salesResponse = await browser.request('http://localhost:5000/api/admin/sales-stats');
    
    if (salesResponse.ok) {
      const data = await salesResponse.json();
      console.log("✅ Estadísticas de ventas:", data);
    } else {
      console.log(`❌ Error (${salesResponse.status}):`, await salesResponse.text());
    }
    
    // 4. Probar endpoint de órdenes para ver si hay datos reales
    console.log("\n📦 Probando /api/admin/orders:");
    const ordersResponse = await browser.request('http://localhost:5000/api/admin/orders');
    
    if (ordersResponse.ok) {
      const data = await ordersResponse.json();
      console.log(`✅ Total órdenes: ${data.length}`);
      if (data.length > 0) {
        console.log("📋 Órdenes disponibles:", data.map(o => ({
          id: o.id,
          customer: o.customer_email,
          amount: o.amount_total,
          status: o.status,
          items: o.items?.length || 0
        })));
      } else {
        console.log("⚠️ No hay órdenes en la base de datos");
      }
    } else {
      console.log(`❌ Error (${ordersResponse.status}):`, await ordersResponse.text());
    }
    
    // 5. Probar endpoint de todos los perfumes
    console.log("\n🧴 Probando /api/perfumes:");
    const perfumesResponse = await browser.request('http://localhost:5000/api/perfumes');
    
    if (perfumesResponse.ok) {
      const data = await perfumesResponse.json();
      console.log(`✅ Total perfumes: ${data.length}`);
      if (data.length > 0) {
        console.log("📋 Primeros 5 perfumes:", data.slice(0, 5).map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.prices?.[0]
        })));
      }
    } else {
      console.log(`❌ Error (${perfumesResponse.status}):`, await perfumesResponse.text());
    }
    
  } catch (error) {
    console.error("❌ Error general:", error.message);
  }
}

testAnalytics(); 