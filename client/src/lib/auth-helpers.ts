// Funciones helper para manejo de autenticación

// Función para obtener token de autenticación
export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('⚠️ No auth token found');
    return null;
  }
  return token;
};

// Función para obtener refresh token
export const getRefreshToken = (): string | null => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.warn('⚠️ No refresh token found');
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
      console.warn('⚠️ No refresh token available');
      return false;
    }
    
    console.log('🔄 Intentando renovar token...');
    
    const response = await fetch('https://lhdecant-backend.onrender.com/api/auth/refresh', {
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
      
      console.log('✅ Token renovado exitosamente');
      return true;
    } else {
      console.error('❌ Error renovando token:', response.status, response.statusText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error renovando token:', error);
    return false;
  }
};

// Función para logout completo
export const handleLogout = (): void => {
  console.log('🚪 Ejecutando logout...');
  
  // Limpiar tokens
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  
  // Limpiar cache de React Query
  if (window.queryClient) {
    window.queryClient.clear();
  }
  
  console.log('✅ Logout completado');
};

// Función para debug de autenticación
export const debugAuth = (): void => {
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