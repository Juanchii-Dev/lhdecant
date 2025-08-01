import { buildApiUrl } from "../config/api";
import { getAuthHeaders, refreshToken, handleLogout } from "./auth-helpers";

// Función para agregar producto al carrito
export const addToCart = async (productId: string, quantity: number = 1, size?: string) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    console.log('🛒 Agregando al carrito:', { productId, quantity, size });
    
    const url = buildApiUrl('/api/cart');
    const headers = getAuthHeaders();
    
    const body: any = {
      productId,
      quantity,
    };
    
    if (size) {
      body.size = size;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Si el token expiró, intentar renovarlo
    if (response.status === 401) {
      console.log('🔄 Token expirado, intentando renovar...');
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Reintentar la petición con el nuevo token
        const newHeaders = getAuthHeaders();
        
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: newHeaders,
          body: JSON.stringify(body),
        });

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.message || 'Error al agregar al carrito');
        }

        const data = await retryResponse.json();
        console.log('✅ Agregado al carrito exitosamente:', data);
        return data;
      } else {
        // No se pudo renovar el token, hacer logout
        console.log('❌ No se pudo renovar el token, haciendo logout...');
        handleLogout();
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al agregar al carrito');
    }

    const data = await response.json();
    console.log('✅ Agregado al carrito exitosamente:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error agregando al carrito:', error);
    throw error;
  }
};

// Función para obtener el carrito
export const getCart = async () => {
  try {
    const url = buildApiUrl('/api/cart');
    const headers = getAuthHeaders();
    
    const response = await fetch(url, {
      headers,
    });

    // Si el token expiró, intentar renovarlo
    if (response.status === 401) {
      console.log('🔄 Token expirado, intentando renovar...');
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Reintentar la petición con el nuevo token
        const newHeaders = getAuthHeaders();
        
        const retryResponse = await fetch(url, {
          headers: newHeaders,
        });

        if (!retryResponse.ok) {
          throw new Error('Error obteniendo el carrito');
        }

        return retryResponse.json();
      } else {
        // No se pudo renovar el token, hacer logout
        console.log('❌ No se pudo renovar el token, haciendo logout...');
        handleLogout();
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error('Error obteniendo el carrito');
    }

    return response.json();
    
  } catch (error) {
    console.error('❌ Error obteniendo el carrito:', error);
    throw error;
  }
};

// Función para actualizar cantidad en el carrito
export const updateCartItem = async (itemId: string, quantity: number) => {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    
    const url = buildApiUrl(`/api/cart/${itemId}`);
    const headers = getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ quantity }),
    });

    // Si el token expiró, intentar renovarlo
    if (response.status === 401) {
      console.log('🔄 Token expirado, intentando renovar...');
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Reintentar la petición con el nuevo token
        const newHeaders = getAuthHeaders();
        
        const retryResponse = await fetch(url, {
          method: 'PUT',
          headers: newHeaders,
          body: JSON.stringify({ quantity }),
        });

        if (!retryResponse.ok) {
          throw new Error('Error actualizando el carrito');
        }

        return retryResponse.json();
      } else {
        // No se pudo renovar el token, hacer logout
        console.log('❌ No se pudo renovar el token, haciendo logout...');
        handleLogout();
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error('Error actualizando el carrito');
    }

    return response.json();
    
  } catch (error) {
    console.error('❌ Error actualizando el carrito:', error);
    throw error;
  }
};

// Función para eliminar item del carrito
export const removeFromCart = async (itemId: string) => {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    
    const url = buildApiUrl(`/api/cart/${itemId}`);
    const headers = getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    // Si el token expiró, intentar renovarlo
    if (response.status === 401) {
      console.log('🔄 Token expirado, intentando renovar...');
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Reintentar la petición con el nuevo token
        const newHeaders = getAuthHeaders();
        
        const retryResponse = await fetch(url, {
          method: 'DELETE',
          headers: newHeaders,
        });

        if (!retryResponse.ok) {
          throw new Error('Error eliminando del carrito');
        }

        return retryResponse.json();
      } else {
        // No se pudo renovar el token, hacer logout
        console.log('❌ No se pudo renovar el token, haciendo logout...');
        handleLogout();
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error('Error eliminando del carrito');
    }

    return response.json();
    
  } catch (error) {
    console.error('❌ Error eliminando del carrito:', error);
    throw error;
  }
}; 