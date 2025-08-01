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
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
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
    console.log('🔑 Token obtenido de localStorage para', queryKey[0], ':', token ? 'SÍ' : 'NO');
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Agregar JWT si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('📤 Authorization header agregado para', queryKey[0]);
    } else {
      console.log('❌ No hay token disponible para', queryKey[0]);
    }
    
    console.log('📋 Headers completos para', queryKey[0], ':', headers);
    
    const res = await fetch(buildApiUrl(queryKey[0] as string), {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log('❌ 401 Unauthorized, returning null for', queryKey[0]);
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log('✅ Success response for', queryKey[0], ':', data);
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 0, // Cambiar de Infinity a 0 para que siempre refetch
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
