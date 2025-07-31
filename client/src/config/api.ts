// Configuración de API para el frontend
export const API_CONFIG = {
  // URL base de la API - FORZADA para producción
  BASE_URL: 'https://lhdecant-backend.onrender.com',
  
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

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('🔗 API URL:', url); // Debug log
  return url;
};

// Función helper para hacer requests a la API
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  const config = {
    ...API_CONFIG.REQUEST_CONFIG,
    ...options,
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
