const fetch = require('node-fetch');

async function testCartReal() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🧪 Probando funcionalidad del carrito con sessionId real...\n');
    
    // 1. Primero obtener el sessionId real haciendo una petición
    console.log('1. Obteniendo sessionId real...');
    const sessionResponse = await fetch(`${baseUrl}/api/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Extraer el sessionId de las cookies
    const cookies = sessionResponse.headers.get('set-cookie');
    console.log('Cookies recibidas:', cookies);
    
    // 2. Obtener el carrito actual
    console.log('\n2. Obteniendo carrito actual...');
    const cartResponse = await fetch(`${baseUrl}/api/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (cartResponse.ok) {
      const cartItems = await cartResponse.json();
      console.log(`✅ Carrito obtenido: ${cartItems.length} items`);
      console.log('Items:', cartItems);
    } else {
      console.log(`❌ Error obteniendo carrito: ${cartResponse.status}`);
    }
    
    // 3. Agregar un perfume al carrito
    console.log('\n3. Agregando perfume al carrito...');
    const addToCartData = {
      perfumeId: "0lHbtoskm6Y2fZ4bOHhh", // ID de un perfume existente
      size: "2ml",
      price: "15.99",
      quantity: 1
    };
    
    const addResponse = await fetch(`${baseUrl}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
    
    // 4. Verificar el carrito después de agregar
    console.log('\n4. Verificando carrito después de agregar...');
    const cartAfterResponse = await fetch(`${baseUrl}/api/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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

testCartReal(); 