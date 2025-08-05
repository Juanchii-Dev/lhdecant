import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { getAuthToken, getRefreshToken, handleLogout as logoutHelper } from '../lib/auth-helpers';
import { apiService } from '../lib/api-service';

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  avatar?: string;
  picture?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => void;
  register: (credentials: { username: string; password: string; email: string }) => void;
  logout: () => void;
  logoutMutation: any;
  refetchUser: () => void;
  handleJWTFromURL: (token: string, refreshToken: string, userData: any) => void;
  refreshTokens: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Función para renovar tokens (simplificada)
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    // No hacer nada, ya que no queremos requests al servidor
    return false;
  }, []);

  // Función para login
  const login = useCallback((credentials: { username: string; password: string }) => {
    loginMutation.mutate(credentials);
  }, []);

  // Función para registro
  const register = useCallback((credentials: { username: string; password: string; email: string }) => {
    registerMutation.mutate(credentials);
  }, []);

  // Función para logout
  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, []);

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiService.login(credentials);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      // Validar que los datos existen
      if (!data || typeof data !== 'object') {
        console.error('Invalid login response data:', data);
        return;
      }
      
      // Guardar tokens con validación
      if (data.accessToken && typeof data.accessToken === 'string') {
        localStorage.setItem('authToken', data.accessToken);
      }
      if (data.refreshToken && typeof data.refreshToken === 'string') {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user && typeof data.user === 'object') {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      // Actualizar estado con validación
      if (data.user && typeof data.user === 'object') {
        setUser(data.user as User);
      }
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${data.user.name || data.user.email}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Error desconocido",
        variant: "destructive",
      });
    },
  });

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string; email: string }) => {
      const response = await apiService.register(credentials);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      // Validar que los datos existen
      if (!data || typeof data !== 'object') {
        console.error('Invalid register response data:', data);
        return;
      }
      
      // Guardar tokens con validación
      if (data.accessToken && typeof data.accessToken === 'string') {
        localStorage.setItem('authToken', data.accessToken);
      }
      if (data.refreshToken && typeof data.refreshToken === 'string') {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user && typeof data.user === 'object') {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      // Actualizar estado con validación
      if (data.user && typeof data.user === 'object') {
        setUser(data.user as User);
      }
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${data.user.name || data.user.email}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error de registro",
        description: error.message || "Error desconocido",
        variant: "destructive",
      });
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // No hacer request al servidor, solo limpiar local
      return { success: true };
    },
    onSuccess: () => {
      logoutHelper();
      setUser(null);
      queryClient.clear();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
    onError: () => {
      // Aún limpiar el estado local aunque falle
      logoutHelper();
      setUser(null);
      queryClient.clear();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
  });

  // Función para manejar JWT desde URL
  const handleJWTFromURL = useCallback((token: string, refreshToken: string, userData: any) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData as User);
  }, []);

  // Función para refetch user (no hace nada)
  const refetchUser = useCallback(() => {
    // No hacer nada, ya que usamos localStorage
  }, []);

  // Efecto para inicializar el estado de autenticación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        const userDataStr = localStorage.getItem('userData');
        
        if (token && userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            setUser(userData as User);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            logoutHelper();
          }
        } else {
          // Limpiar estado si no hay token válido
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logoutHelper();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    logoutMutation,
    refetchUser,
    handleJWTFromURL,
    refreshTokens,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}