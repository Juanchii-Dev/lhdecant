import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { buildApiUrl } from "../config/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Función para hacer peticiones a la API
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const authToken = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

// Función para renovar tokens automáticamente
async function refreshTokensIfNeeded(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(buildApiUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    
    // Guardar nuevos tokens
    localStorage.setItem('authToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    return true;
    
  } catch (error) {
    return false;
  }
}

// Función para obtener datos con React Query - CON RENOVACIÓN AUTOMÁTICA
export const getQueryFn = async (endpoint: string) => {
  const url = buildApiUrl(endpoint);
  const authToken = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    headers,
  });

  // Si el token expiró, intentar renovarlo
  if (response.status === 401 && authToken) {
    const refreshed = await refreshTokensIfNeeded();
    
    if (refreshed) {
      // Reintentar la petición con el nuevo token
      const newAuthToken = localStorage.getItem('authToken');
      if (newAuthToken) {
        headers['Authorization'] = `Bearer ${newAuthToken}`;
        
        const retryResponse = await fetch(url, {
          headers,
        });

        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }

        return retryResponse.json();
      }
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
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
