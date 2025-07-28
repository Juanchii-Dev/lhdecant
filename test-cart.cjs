const fetch = require('node-fetch');

async function testCart() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🧪 Probando funcionalidad del carrito...\n');
    
    // 1. Obtener el carrito actual
    console.log('1. Obteniendo carrito actual...');
    const cartResponse = await fetch(`${baseUrl}/api/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3A123456789.abcdefghijklmnopqrstuvwxyz; Path=/; HttpOnly'
      }
    });
    
    if (cartResponse.ok) {
      const cartItems = await cartResponse.json();
      console.log(`✅ Carrito obtenido: ${cartItems.length} items`);
      console.log('Items:', cartItems);
    } else {
      console.log(`❌ Error obteniendo carrito: ${cartResponse.status}`);
    }
    
    // 2. Agregar un perfume al carrito
    console.log('\n2. Agregando perfume al carrito...');
    const addToCartData = {
      perfumeId: "0lHbtoskm6Y2fZ4bOHhh", // ID de un perfume existente
      size: "2ml",
      price: "15.99",
      quantity: 1
    };
    
    const addResponse = await fetch(`${baseUrl}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3A123456789.abcdefghijklmnopqrstuvwxyz; Path=/; HttpOnly'
      },
      body: JSON.stringify(addToCartData)
    });
    
    if (addResponse.ok) {
      const addedItem = await addResponse.json();
      console.log('✅ Perfume agregado al carrito:', addedItem);
    } else {
      const error = await addResponse.text();
      console.log(`❌ Error agregando al carrito: ${addResponse.status}`);
      console.log('Error:', error);
    }
    
    // 3. Verificar el carrito después de agregar
    console.log('\n3. Verificando carrito después de agregar...');
    const cartAfterResponse = await fetch(`${baseUrl}/api/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3A123456789.abcdefghijklmnopqrstuvwxyz; Path=/; HttpOnly'
      }
    });
    
    if (cartAfterResponse.ok) {
      const cartAfterItems = await cartAfterResponse.json();
      console.log(`✅ Carrito después de agregar: ${cartAfterItems.length} items`);
      console.log('Items:', cartAfterItems);
    } else {
      console.log(`❌ Error obteniendo carrito después: ${cartAfterResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testCart(); 