// Script para probar los endpoints del admin y verificar qué datos están devolviendo
import fetch from 'node-fetch';

async function testAdminEndpoints() {
  try {
    console.log("🔍 Probando endpoints del admin...");
    
    // 1. Probar dashboard-stats
    console.log("\n📊 1. Probando /api/admin/dashboard-stats:");
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
        headers: {
          'x-admin-key': 'lhdecant-admin-2024'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Dashboard stats:", data);
      } else {
        console.log(`❌ Error (${response.status}):`, await response.text());
      }
    } catch (error) {
      console.log("❌ Error de conexión:", error.message);
    }
    
    // 2. Probar user-stats
    console.log("\n👥 2. Probando /api/admin/user-stats:");
    try {
      const response = await fetch('http://localhost:5000/api/admin/user-stats', {
        headers: {
          'x-admin-key': 'lhdecant-admin-2024'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ User stats:", data);
      } else {
        console.log(`❌ Error (${response.status}):`, await response.text());
      }
    } catch (error) {
      console.log("❌ Error de conexión:", error.message);
    }
    
    // 3. Probar sessions-stats
    console.log("\n🔐 3. Probando /api/admin/sessions-stats:");
    try {
      const response = await fetch('http://localhost:5000/api/admin/sessions-stats', {
        headers: {
          'x-admin-key': 'lhdecant-admin-2024'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Session stats:", data);
      } else {
        console.log(`❌ Error (${response.status}):`, await response.text());
      }
    } catch (error) {
      console.log("❌ Error de conexión:", error.message);
    }
    
    // 4. Probar perfumes directamente
    console.log("\n🌸 4. Probando /api/perfumes:");
    try {
      const response = await fetch('http://localhost:5000/api/perfumes');
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Total perfumes: ${data.length}`);
        console.log("📋 Primeros 3 perfumes:", data.slice(0, 3).map(p => ({ id: p.id, name: p.name, brand: p.brand })));
      } else {
        console.log(`❌ Error (${response.status}):`, await response.text());
      }
    } catch (error) {
      console.log("❌ Error de conexión:", error.message);
    }
    
    // 5. Probar collections
    console.log("\n📁 5. Probando /api/collections:");
    try {
      const response = await fetch('http://localhost:5000/api/collections');
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Total collections: ${data.length}`);
        console.log("📋 Collections:", data);
      } else {
        console.log(`❌ Error (${response.status}):`, await response.text());
      }
    } catch (error) {
      console.log("❌ Error de conexión:", error.message);
    }
    
    // 6. Probar orders
    console.log("\n📦 6. Probando /api/orders:");
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Total orders: ${data.length}`);
        console.log("📋 Orders:", data);
      } else {
        console.log(`❌ Error (${response.status}):`, await response.text());
      }
    } catch (error) {
      console.log("❌ Error de conexión:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Error general:", error.message);
  }
}

testAdminEndpoints(); 