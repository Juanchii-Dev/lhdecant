import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { buildApiUrl } from '../config/api';
import { getAuthToken, refreshToken } from '../lib/auth-helpers';
import { useToast } from './use-toast';

interface CartItem {
  id: string;
  perfumeId: string;
  size: string;
  price: string;
  quantity: number;
  perfume?: {
    id: string;
    name: string;
    brand: string;
    imageUrl?: string;
  };
}

export function useCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para obtener el carrito
  const { data: cartItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        return [];
      }

      const response = await fetch(buildApiUrl('/api/cart'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, intentar renovar
          const refreshed = await refreshToken();
          if (refreshed) {
            // Reintentar con el nuevo token
            const newToken = getAuthToken();
            const retryResponse = await fetch(buildApiUrl('/api/cart'), {
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              }
            });

            if (!retryResponse.ok) {
              throw new Error('Failed to fetch cart after token refresh');
            }

            return retryResponse.json();
          } else {
            // No se pudo renovar el token
            return [];
          }
        }
        throw new Error('Failed to fetch cart');
      }

      return response.json();
    },
    enabled: !!getAuthToken(),
    retry: (failureCount, error) => {
      if (error.message === 'Failed to fetch cart after token refresh') {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
  });

  // Calcular total de items
  const totalItems = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  // Función para agregar al carrito
  const addToCart = useCallback(async (productId: string, quantity: number = 1, size?: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para agregar productos al carrito",
          variant: "destructive",
        });
        return false;
      }

      const response = await fetch(buildApiUrl('/api/cart'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          size,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, intentar renovar
          const refreshed = await refreshToken();
          if (refreshed) {
            // Reintentar con el nuevo token
            const newToken = getAuthToken();
            const retryResponse = await fetch(buildApiUrl('/api/cart'), {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                productId,
                quantity,
                size,
              }),
            });

            if (!retryResponse.ok) {
              throw new Error('Failed to add to cart after token refresh');
            }

            // Actualizar cache
            queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
            return true;
          } else {
            toast({
              title: "Error de autenticación",
              description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
              variant: "destructive",
            });
            return false;
          }
        }
        throw new Error('Failed to add to cart');
      }

      // Actualizar cache
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Producto agregado",
        description: "El producto se agregó correctamente al carrito",
      });

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
      return false;
    }
  }, [queryClient, toast]);

  // Función para actualizar cantidad
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const token = getAuthToken();
      if (!token) return false;

      const response = await fetch(buildApiUrl(`/api/cart/${itemId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const newToken = getAuthToken();
            const retryResponse = await fetch(buildApiUrl(`/api/cart/${itemId}`), {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ quantity }),
            });

            if (!retryResponse.ok) {
              throw new Error('Failed to update quantity after token refresh');
            }

            queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
            return true;
          }
          return false;
        }
        throw new Error('Failed to update quantity');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  }, [queryClient]);

  // Función para eliminar item
  const removeItem = useCallback(async (itemId: string) => {
    try {
      const token = getAuthToken();
      if (!token) return false;

      const response = await fetch(buildApiUrl(`/api/cart/${itemId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const newToken = getAuthToken();
            const retryResponse = await fetch(buildApiUrl(`/api/cart/${itemId}`), {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (!retryResponse.ok) {
              throw new Error('Failed to remove item after token refresh');
            }

            queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
            return true;
          }
          return false;
        }
        throw new Error('Failed to remove item');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }, [queryClient]);

  // Función para limpiar carrito
  const clearCart = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return false;

      const response = await fetch(buildApiUrl('/api/cart'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const newToken = getAuthToken();
            const retryResponse = await fetch(buildApiUrl('/api/cart'), {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (!retryResponse.ok) {
              throw new Error('Failed to clear cart after token refresh');
            }

            queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
            return true;
          }
          return false;
        }
        throw new Error('Failed to clear cart');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }, [queryClient]);

  return {
    cartItems,
    totalItems,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refetch,
  };
} 