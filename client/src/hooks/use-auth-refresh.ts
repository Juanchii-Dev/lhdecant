import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';

export function useAuthRefresh() {
  const { user, refetchUser } = useAuth();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    // Verificar autenticación inmediatamente al montar
    console.log('🔄 useAuthRefresh - Verificación inicial');
    refetchUser();
    lastCheckRef.current = Date.now();

    // Configurar verificación periódica cada 10 segundos
    refreshIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheckRef.current;
      
      console.log('🔄 useAuthRefresh - Verificación periódica');
      refetchUser();
      lastCheckRef.current = now;
    }, 10000);

    // Verificar cuando la ventana vuelve a estar activa
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 useAuthRefresh - Ventana activa, verificando autenticación');
        refetchUser();
        lastCheckRef.current = Date.now();
      }
    };

    // Verificar cuando la página vuelve a estar enfocada
    const handleFocus = () => {
      console.log('🔄 useAuthRefresh - Página enfocada, verificando autenticación');
      refetchUser();
      lastCheckRef.current = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchUser]);

  // Función para forzar verificación inmediata
  const forceRefresh = () => {
    console.log('🔄 useAuthRefresh - Forzando verificación inmediata');
    refetchUser();
    lastCheckRef.current = Date.now();
  };

  return {
    user,
    forceRefresh,
    lastCheck: lastCheckRef.current,
  };
} 