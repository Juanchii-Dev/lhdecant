import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { buildApiUrl } from "../config/api";
import { getAuthToken, getRefreshToken, handleLogout as logoutHelper, debugAuth, refreshToken } from "../lib/auth-helpers";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener datos del usuario
  const { data: userData, refetch, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }
      
      const response = await fetch(buildApiUrl("/api/user"), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, intentar renovar
          const refreshed = await refreshToken();
          if (refreshed) {
            // Reintentar con el nuevo token
            const newToken = getAuthToken();
            const retryResponse = await fetch(buildApiUrl("/api/user"), {
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (!retryResponse.ok) {
              throw new Error('Failed to fetch user after token refresh');
            }
            
            return retryResponse.json();
          } else {
            // No se pudo renovar el token, limpiar estado
            handleLogout();
            throw new Error('Authentication failed');
          }
        }
        throw new Error('Failed to fetch user');
      }
      
      return response.json();
    },
    enabled: !!getAuthToken(),
    retry: false, // NO REINTENTAR - EVITAR SPAM DE 401
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error en el login");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Guardar tokens
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      // Actualizar estado
      setUser(data.user);
      queryClient.setQueryData(["/api/user"], data.user);
      
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
      const response = await fetch(buildApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error en el registro");
      }
      
      return response.json();
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
      const response = await fetch(buildApiUrl("/api/logout"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error en logout');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Limpiar estado local
      logoutHelper();
      setUser(null);
      queryClient.clear();
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
    onError: () => {
      // Aún así limpiar el estado local
      logoutHelper();
      setUser(null);
      queryClient.clear();
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
  });

  // Función para manejar JWT desde URL (después de Google OAuth)
  const handleJWTFromURL = useCallback((token: string, refreshToken: string, userData: any) => {
    console.log('🔐 handleJWTFromURL llamado con:', { token: token.substring(0, 20) + '...', refreshToken: refreshToken.substring(0, 20) + '...', userData });
    
    if (token && refreshToken) {
      // Guardar tokens en localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      console.log('✅ Tokens guardados en localStorage');
      
      // Actualizar el cache de React Query
      queryClient.setQueryData(["/api/user"], userData);
      setUser(userData);
      
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
        console.warn('No refresh token available');
        return;
      }

      const response = await fetch(buildApiUrl('/api/auth/refresh'), {
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
        console.log('✅ Tokens renovados manualmente');
      }
    } catch (error) {
      console.error('❌ Error renovando tokens:', error);
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
          setUser(userData);
          queryClient.setQueryData(["/api/user"], userData);
        } else {
          // Limpiar estado si no hay token válido
          setUser(null);
          queryClient.removeQueries({ queryKey: ["/api/user"] });
        }
      } catch (error) {
        console.error('❌ Error inicializando autenticación:', error);
        logoutHelper();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [queryClient]);

  // Efecto para actualizar usuario cuando cambian los datos
  useEffect(() => {
    if (userData) {
      setUser(userData);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}