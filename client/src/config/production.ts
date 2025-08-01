// Configuración de producción - NO localhost
export const PRODUCTION_CONFIG = {
  // URLs de producción
  API_BASE_URL: 'https://lhdecant-backend.onrender.com',
  FRONTEND_URL: 'https://lhdecant.com',
  BACKEND_URL: 'https://lhdecant-backend.onrender.com',
  
  // Google OAuth para producción
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI: 'https://lhdecant-backend.onrender.com/api/auth/google/callback',
  
  // Configuración de CORS para producción
  ALLOWED_ORIGINS: [
    'https://lhdecant.com',
    'https://lhdecant-backend.onrender.com',
    'https://lhdecant.netlify.app'
  ],
  
  // Configuración de cookies para producción
  COOKIE_CONFIG: {
    secure: true, // HTTPS obligatorio
    httpOnly: true,
    sameSite: 'none' as const, // Para CORS en producción
    domain: '.lhdecant.com'
  },
  
  // Timeouts para producción
  API_TIMEOUT: 10000,
  TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos
  
  // Logging para producción
  LOG_LEVEL: 'error', // Solo errores en producción
  ENABLE_DEBUG_LOGS: false
};

// Función para verificar si estamos en producción
export const isProduction = (): boolean => {
  return import.meta.env.PROD || 
         window.location.hostname !== 'localhost' ||
         window.location.protocol === 'https:';
};

// Función para obtener la URL base de la API
export const getApiBaseUrl = (): string => {
  if (isProduction()) {
    return PRODUCTION_CONFIG.API_BASE_URL;
  }
  // Fallback para desarrollo (aunque no debería usarse en producción)
  return import.meta.env.VITE_API_URL || PRODUCTION_CONFIG.API_BASE_URL;
};

// Función para obtener la URL del frontend
export const getFrontendUrl = (): string => {
  if (isProduction()) {
    return PRODUCTION_CONFIG.FRONTEND_URL;
  }
  return window.location.origin;
}; 