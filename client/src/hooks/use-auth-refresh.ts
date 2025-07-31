import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';

export function useAuthRefresh() {
  const { user, refetchUser } = useAuth();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    // Verificar autenticación inmediatamente al montar
    refetchUser();
    lastCheckRef.current = Date.now();

    // Verificar cuando la ventana vuelve a estar activa
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchUser();
        lastCheckRef.current = Date.now();
      }
    };

    // Verificar cuando la página vuelve a estar enfocada
    const handleFocus = () => {
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
    refetchUser();
    lastCheckRef.current = Date.now();
  };

  return {
    user,
    forceRefresh,
    lastCheck: lastCheckRef.current,
  };
} 