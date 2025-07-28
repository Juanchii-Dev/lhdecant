// Script para probar las notificaciones
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

async function testToastNotifications() {
  try {
    console.log("🔔 Probando sistema de notificaciones...");
    
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
    
    // 2. Probar actualización de un perfume para generar notificación
    console.log("\n🧴 Probando actualización de perfume para generar notificación...");
    const updateResponse = await browser.request('http://localhost:5000/api/perfumes/0lHbtoskm6Y2fZ4bOHhh', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'One Million',
        brand: 'Paco Rabanne',
        description: 'Una fragancia masculina icónica que combina frescura cítrica con notas especiadas y amaderadas. Perfecta para el hombre que busca distinción.',
        sizes: ['5ml', '10ml', '15ml'],
        prices: ['25.00', '45.00', '65.00'],
        category: 'masculine',
        notes: ['Bergamota', 'Pimienta', 'Canela', 'Cedro', 'Ámbar'],
        inStock: true
      })
    });
    
    if (updateResponse.ok) {
      console.log("✅ Perfume actualizado exitosamente - debería generar notificación");
    } else {
      console.log(`❌ Error al actualizar perfume (${updateResponse.status}):`, await updateResponse.text());
    }
    
    // 3. Probar creación de un perfume para generar otra notificación
    console.log("\n➕ Probando creación de perfume para generar otra notificación...");
    const createResponse = await browser.request('http://localhost:5000/api/perfumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Perfume',
        brand: 'Test Brand',
        description: 'Perfume de prueba para verificar notificaciones',
        sizes: ['5ml', '10ml'],
        prices: ['10.00', '18.00'],
        category: 'unisex',
        notes: ['Test', 'Nota'],
        inStock: true
      })
    });
    
    if (createResponse.ok) {
      console.log("✅ Perfume creado exitosamente - debería generar notificación");
    } else {
      console.log(`❌ Error al crear perfume (${createResponse.status}):`, await createResponse.text());
    }
    
    console.log("\n📋 Instrucciones para probar las notificaciones:");
    console.log("1. Ve a http://localhost:5173/admin");
    console.log("2. Deberías ver notificaciones en la esquina superior derecha");
    console.log("3. Intenta hacer clic en la X para cerrarlas");
    console.log("4. Las notificaciones deberían desaparecer automáticamente después de 5 segundos");
    console.log("5. Si haces más acciones (crear/editar perfumes), deberían aparecer nuevas notificaciones");
    
  } catch (error) {
    console.error("❌ Error general:", error.message);
  }
}

testToastNotifications(); 