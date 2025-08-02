import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '../lib/auth-helpers';
import { apiService } from '../lib/api-service';
import { useToast } from './use-toast';

interface CartItem {
  id: string;
  productId: string;
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

      const response = await apiService.getCart();
      
      if (response.error) {
        if (response.status === 401) {
          return [];
        }
        throw new Error(response.error);
      }

      return response.data || [];
    },
    enabled: !!getAuthToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
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

      const response = await apiService.addToCart(productId, quantity, size);

      if (response.error) {
        if (response.status === 401) {
          toast({
            title: "Error de autenticación",
            description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          });
          return false;
        }
        
        if (response.status === 500) {
          toast({
            title: "Error del servidor",
            description: "No se pudo agregar el producto al carrito. Inténtalo de nuevo.",
            variant: "destructive",
          });
          return false;
        }

        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return false;
      }

      // Actualizar cache
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Producto agregado",
        description: "El producto se agregó correctamente al carrito",
      });

      return true;
    } catch (error) {
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

      const response = await apiService.updateCartItem(itemId, quantity);

      if (response.error) {
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      return true;
    } catch (error) {
      return false;
    }
  }, [queryClient]);

  // Función para eliminar item
  const removeItem = useCallback(async (itemId: string) => {
    try {
      const token = getAuthToken();
      if (!token) return false;

      const response = await apiService.removeCartItem(itemId);

      if (response.error) {
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      return true;
    } catch (error) {
      return false;
    }
  }, [queryClient]);

  // Función para limpiar carrito
  const clearCart = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return false;

      const response = await apiService.clearCart();

      if (response.error) {
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      return true;
    } catch (error) {
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