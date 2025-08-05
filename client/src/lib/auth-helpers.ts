import { getApiBaseUrl } from '../config/production';

// Funciones helper para manejo de autenticación

// Función para obtener token de autenticación
export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ No auth token found');
    }
    return null;
  }
  return token;
};

// Función para obtener refresh token
export const getRefreshToken = (): string | null => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ No refresh token found');
    }
    return null;
  }
  return refreshToken;
};

// Función para obtener headers de autenticación
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Función para renovar token automáticamente
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ No refresh token available');
      }
      return false;
    }
    
    if (import.meta.env.DEV) {
      console.log('🔄 Intentando renovar token...');
    }
    
    const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Guardar nuevos tokens
      localStorage.setItem('authToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      if (import.meta.env.DEV) {
        console.log('✅ Token renovado exitosamente');
      }
      return true;
    } else {
      if (import.meta.env.DEV) {
        console.error('❌ Error renovando token:', response.status, response.statusText);
      }
      return false;
    }
    
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('❌ Error renovando token:', error);
    }
    return false;
  }
};

// Función para limpiar el estado de autenticación
export const handleLogout = () => {
  console.log('🧹 Limpiando estado de autenticación...');
  
  // Limpiar localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  
  // Limpiar sessionStorage
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userData');
  
  // Limpiar cookies si existen
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  console.log('✅ Estado de autenticación limpiado');
};

// Función para debug de autenticación (solo en desarrollo)
export const debugAuth = (): void => {
  if (!import.meta.env.DEV) return;
  
  console.log('🔍 Auth Debug:', {
    hasAuthToken: !!localStorage.getItem('authToken'),
    hasRefreshToken: !!localStorage.getItem('refreshToken'),
    hasUserData: !!localStorage.getItem('userData'),
    userData: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')!) : null
  });
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Función para verificar la validez del token
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    const response = await fetch('https://lhdecant-backend.onrender.com/api/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}; 