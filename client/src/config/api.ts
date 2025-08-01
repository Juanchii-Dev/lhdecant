// Configuración de API para el frontend
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'https://lhdecant-backend.onrender.com',
  timeout: 10000,
};

// Función para normalizar endpoints con validaciones robustas
const normalizeEndpoint = (endpoint: any): string => {
  // Validar que endpoint existe y es string
  if (!endpoint) {
    console.error('❌ Endpoint is required');
    return '/';
  }
  
  if (typeof endpoint !== 'string') {
    console.error('❌ Endpoint must be a string, received:', typeof endpoint, endpoint);
    return '/';
  }
  
  // Limpiar y normalizar el endpoint
  const cleanEndpoint = endpoint.trim();
  
  // Si está vacío después de limpiar, retornar '/'
  if (!cleanEndpoint) {
    console.warn('⚠️ Empty endpoint after trimming, using "/"');
    return '/';
  }
  
  // Asegurar que empiece con '/'
  return cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
};

// Función para construir URLs de API con validaciones
export const buildApiUrl = (endpoint: any): string => {
  try {
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const url = `${API_CONFIG.baseUrl}${normalizedEndpoint}`;
    
    console.log('🔗 API URL construida:', {
      original: endpoint,
      normalized: normalizedEndpoint,
      final: url
    });
    
    return url;
  } catch (error) {
    console.error('❌ Error construyendo API URL:', error);
    return `${API_CONFIG.baseUrl}/`;
  }
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