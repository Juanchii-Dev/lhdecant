// Configuración de API para el frontend
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://lhdecant-backend.onrender.com',
  REQUEST_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include' as const,
  },
};

// Función para normalizar endpoints - TODOS DEBEN EMPEZAR CON /api/
const normalizeEndpoint = (endpoint: any): string => {
  // Convertir a string si no lo es
  const endpointStr = String(endpoint || '');
  
  // Si ya empieza con /api/, dejarlo igual
  if (endpointStr.startsWith('/api/')) return endpointStr;
  
  // Si empieza con / pero no con /api/, agregar api
  if (endpointStr.startsWith('/')) return `/api${endpointStr}`;
  
  // Si no empieza con /, agregar /api/
  return `/api/${endpointStr}`;
};

// Función helper para construir URLs completas - CORREGIDA DEFINITIVAMENTE
export const buildApiUrl = (endpoint: any): string => {
  // Normalizar el endpoint para asegurar que siempre tenga /api/
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  
  // Asegurar que el BASE_URL termine sin / y el endpoint empiece con /
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  
  const url = `${baseUrl}${normalizedEndpoint}`;
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