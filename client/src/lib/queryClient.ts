import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { buildApiUrl } from "../config/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Obtener JWT del localStorage
  const token = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  // Agregar JWT si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Enviando JWT en petición:', { url, token: token.substring(0, 20) + '...' });
  } else {
    console.log('⚠️ No hay JWT disponible para:', url);
  }
  
  // Usar buildApiUrl CORREGIDA
  const fullUrl = buildApiUrl(url);
  console.log('🔗 URL completa construida:', fullUrl);
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Obtener JWT del localStorage
    const token = localStorage.getItem('authToken');
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Agregar JWT si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Enviando JWT en queryFn:', { url: queryKey[0], token: token.substring(0, 20) + '...' });
    } else {
      console.log('⚠️ No hay JWT disponible para queryFn:', queryKey[0]);
    }
    
    // Usar buildApiUrl CORREGIDA
    const fullUrl = buildApiUrl(queryKey[0] as string);
    console.log('🔗 URL completa construida en queryFn:', fullUrl);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log('❌ 401 Unauthorized para:', queryKey[0]);
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
