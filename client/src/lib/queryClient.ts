import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { buildApiUrl } from "../config/api";
import { getAuthHeaders, refreshToken, handleLogout } from "./auth-helpers";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Función para hacer peticiones a la API con manejo de autenticación
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

// Función para obtener datos con React Query - CON RENOVACIÓN AUTOMÁTICA MEJORADA
export const getQueryFn = async (endpoint: string) => {
  const url = buildApiUrl(endpoint);
  
  if (!url) {
    throw new Error('Invalid endpoint');
  }

  const headers = getAuthHeaders();

  try {
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
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
    
  } catch (error) {
    console.error('❌ Error en getQueryFn:', error);
    throw error;
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 0,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Exponer queryClient globalmente para las funciones helper
if (typeof window !== 'undefined') {
  (window as any).queryClient = queryClient;
}
