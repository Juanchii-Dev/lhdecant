// Configuración de API para el frontend - VERSIÓN FINAL CORREGIDA
export const API_CONFIG = {
  // URL base de la API - Usar variable de entorno o fallback
  BASE_URL: import.meta.env.VITE_API_URL || 'https://lhdecant-backend.onrender.com',
  
  // Endpoints específicos
  ENDPOINTS: {
    HEALTH: '/api/health',
    AUTH: {
      GOOGLE: '/api/auth/google',
      GOOGLE_CALLBACK: '/api/auth/google/callback',
      GOOGLE_STATUS: '/api/auth/google/status',
    },
    CART: '/api/cart',
    PERFUMES: '/api/perfumes',
    ORDERS: '/api/orders',
  },
  
  // Configuración de requests
  REQUEST_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include' as const,
  },
};

// Función helper para construir URLs completas - CORREGIDA DEFINITIVAMENTE
export const buildApiUrl = (endpoint: string): string => {
  // Asegurar que el BASE_URL termine con / y el endpoint empiece con /
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const url = `${baseUrl}${cleanEndpoint}`;
  console.log('🔗 API URL construida:', url); // Debug log mejorado
  return url;
};

// Función helper para hacer requests a la API
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  const config = {
    ...API_CONFIG.REQUEST_CONFIG,
    ...options,
    headers: {
      ...API_CONFIG.REQUEST_CONFIG.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}; 