import React from "react";
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
  handleJWTFromURL: (token: string, userData: any) => void;
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

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
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
      // Limpiar localStorage
      localStorage.removeItem('authToken');
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

  // Función para verificar autenticación después de OAuth
  const checkAuthAfterOAuth = () => {
    queryClient.removeQueries({ queryKey: ["/api/user"] });
    refetchUser();
  };

  // Función para manejar JWT desde URL
  const handleJWTFromURL = (token: string, userData: any) => {
    // Guardar JWT en localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Limpiar cache y refetch
    queryClient.removeQueries({ queryKey: ["/api/user"] });
    queryClient.setQueryData(["/api/user"], userData);
    
    toast({
      title: "Inicio de sesión exitoso",
      description: `Bienvenido, ${userData.name || userData.email}`,
    });
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
        handleJWTFromURL,
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