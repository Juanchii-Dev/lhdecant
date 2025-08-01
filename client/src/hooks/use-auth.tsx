import React, { useCallback } from "react";
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";

type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, any>;
  refetchUser: () => void;
  checkAuthAfterOAuth: () => void;
  handleJWTFromURL: (token: string, refreshToken: string, userData: any) => void;
  refreshTokens: () => Promise<boolean>;
};

type LoginData = Pick<any, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  let toastContext = null;
  try {
    toastContext = useToast();
  } catch (e) {
    console.error('CRITICAL: useToast returned null or error', e);
    return <div>Error: Toast context not available</div>;
  }
  if (!toastContext) {
    console.error('AuthProvider: useToast() returned null - ToastProvider missing');
    return <div>Error: Toast context not available</div>;
  }
  const { toast } = toastContext;
  
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<any | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: () => getQueryFn("/api/user"),
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 600000,
    enabled: true,
    initialData: () => {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      
      if (userData && token) {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing userData from localStorage:', error);
          return undefined;
        }
      }
      return undefined;
    },
  });

  // Función para renovar tokens
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.log('❌ No hay refresh token disponible');
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.log('❌ Error renovando tokens:', response.status);
        return false;
      }

      const data = await response.json();
      
      // Guardar nuevos tokens
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      console.log('✅ Tokens renovados exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error renovando tokens:', error);
      return false;
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      return await res.json();
    },
    onSuccess: (data: any) => {
      // Guardar tokens
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${data.user.name || data.user.email}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de inicio de sesión",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      return await res.json();
    },
    onSuccess: (user: any) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registro exitoso",
        description: "Cuenta creada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/logout", { method: "POST" });
    },
    onSuccess: () => {
      // Limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      
      // Limpiar cache
      queryClient.setQueryData(["/api/user"], null);
      queryClient.removeQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Función para manejar JWT desde URL (después de Google OAuth)
  const handleJWTFromURL = useCallback((token: string, refreshToken: string, userData: any) => {
    if (token && refreshToken) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      // Refetch user data
      refetch();
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${userData.name || userData.email}`,
      });
    }
  }, [refetch, toast]);

  // Función para verificar autenticación después de OAuth
  const checkAuthAfterOAuth = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        refetchUser: refetch,
        checkAuthAfterOAuth,
        handleJWTFromURL,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}