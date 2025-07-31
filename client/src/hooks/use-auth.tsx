import React from "react";
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
// import { insertUserSchema, User, InsertUser } from "@shared/schema"; // ELIMINADO
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
    refetch: refetchUser,
  } = useQuery<any | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: true, // Cambiado a true para detectar cambios
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0, // Cambiado a 0 para siempre verificar
    cacheTime: 600000, // 10 minutos
    enabled: true,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      return await res.json();
    },
    onSuccess: (user: any) => {
      queryClient.setQueryData(["/api/user"], user);
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
      const res = await apiRequest("POST", "/api/register", credentials);
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
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
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

  // Función para verificar autenticación después de OAuth
  const checkAuthAfterOAuth = () => {
    console.log('🔄 Verificando autenticación después de OAuth...');
    
    // Limpiar cache primero
    queryClient.removeQueries({ queryKey: ["/api/user"] });
    
    // Verificar múltiples veces para asegurar que se detecte
    setTimeout(() => {
      console.log('🔄 Primera verificación...');
      refetchUser();
    }, 500);
    
    setTimeout(() => {
      console.log('🔄 Segunda verificación...');
      refetchUser();
    }, 1500);
    
    setTimeout(() => {
      console.log('🔄 Tercera verificación...');
      refetchUser();
    }, 3000);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        refetchUser,
        checkAuthAfterOAuth,
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