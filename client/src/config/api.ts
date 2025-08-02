import { getApiBaseUrl } from './production';

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
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
    
    // Solo mostrar logs en desarrollo
    if (import.meta.env.DEV) {
      console.log('🔗 API URL construida:', {
        original: endpoint,
        normalized: normalizedEndpoint,
        final: url
      });
    }
    
    return url;
  } catch (error) {
    console.error('❌ Error construyendo API URL:', error);
    return `${API_CONFIG.baseUrl}/`;
  }
};

// Función helper para hacer requests a la API
export const apiRequest = async (method: string, endpoint: string, data?: any) => {
  const url = buildApiUrl(endpoint);
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
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