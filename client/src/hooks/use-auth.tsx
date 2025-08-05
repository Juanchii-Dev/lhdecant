import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  // Query para obtener datos del usuario
  const { data: userData, refetch, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }
      
      const response = await apiService.getUser();
      
      if (response.error) {
        if (response.status === 401) {
          // Token expirado, intentar renovar
          const refreshed = await refreshTokens();
          if (refreshed) {
            // Reintentar con el nuevo token
            const retryResponse = await apiService.getUser();
            
            if (retryResponse.error) {
              throw new Error('Failed to fetch user after token refresh');
            }
            
            return retryResponse.data;
          } else {
            // No se pudo renovar el token, limpiar estado
            logoutHelper();
            throw new Error('Authentication failed');
          }
        }
        throw new Error(response.error);
      }
      
      return response.data;
    },
    enabled: !!getAuthToken(),
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false, // No refetch automático
  });

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
        queryClient.setQueryData(["/api/user"], data.user);
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
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
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
      const response = await apiService.logout();
      return response;
    },
    onSuccess: () => {
      // Limpiar estado local
      logoutHelper();
      setUser(null);
      queryClient.clear();
      // NO mostrar toast al cerrar sesión
    },
    onError: () => {
      // Aún así limpiar el estado local
      logoutHelper();
      setUser(null);
      queryClient.clear();
      // NO mostrar toast al cerrar sesión
    },
  });

  // Función para manejar JWT desde URL (después de Google OAuth)
  const handleJWTFromURL = useCallback((token: string, refreshToken: string, userData: any) => {
    if (token && refreshToken) {
      // Guardar tokens en localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      // Actualizar el cache de React Query
      queryClient.setQueryData(["/api/user"], userData);
      setUser(userData as User);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${userData.name || userData.email}`,
      });
    }
  }, [queryClient, toast]);

  // Función para renovar tokens manualmente
  const refreshTokens = useCallback(async () => {
    try {
      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        return false;
      }

      const response = await fetch('https://lhdecant-backend.onrender.com/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  // Función para login
  const login = useCallback((credentials: { username: string; password: string }) => {
    loginMutation.mutate(credentials);
  }, [loginMutation]);

  // Función para registro
  const register = useCallback((credentials: { username: string; password: string; email: string }) => {
    registerMutation.mutate(credentials);
  }, [registerMutation]);

  // Función para logout
  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Efecto para inicializar el estado de autenticación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        const userDataStr = localStorage.getItem('userData');
        
        if (token && userDataStr) {
          const userData = JSON.parse(userDataStr);
          setUser(userData as User);
          queryClient.setQueryData(["/api/user"], userData);
        } else {
          // Limpiar estado si no hay token válido
          setUser(null);
          queryClient.removeQueries({ queryKey: ["/api/user"] });
        }
      } catch (error) {
        logoutHelper();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [queryClient]);

  // Efecto para sincronizar el estado del usuario
  useEffect(() => {
    if (userData) {
      setUser(userData as User);
    }
  }, [userData]);

  const value: AuthContextType = {
    user,
    isLoading: isLoading || userLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    logoutMutation,
    refetchUser: refetch,
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