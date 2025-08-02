import { useEffect } from 'react';
import { useAuth } from './use-auth';

export function useAuthRefresh() {
  const { user, refetchUser } = useAuth();

  useEffect(() => {
    if (user) {
      // Refrescar datos del usuario cada 5 minutos
      const interval = setInterval(() => {
        refetchUser();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user, refetchUser]);
} 