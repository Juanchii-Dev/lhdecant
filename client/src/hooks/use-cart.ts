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

  // Query para obtener el carrito con fallback
  const { data: cartItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        return [];
      }

      const response = await apiService.getCart();
      
      if (!response.success) {
        if (response.status === 404) {
          // Backend no disponible, usar localStorage como fallback
          const localCart = localStorage.getItem('localCart');
          return localCart ? JSON.parse(localCart) : [];
        }
        
        if (response.status === 401) {
          return [];
        }
        
        // Otros errores, retornar carrito vacío
        return [];
      }

      return response.data || [];
    },
    enabled: !!getAuthToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Calcular total de items
  const totalItems = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  // Función para agregar al carrito con fallback
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

      if (!response.success) {
        if (response.status === 404) {
          // Backend no disponible, usar localStorage
          const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
          const newItem = {
            id: Date.now().toString(),
            productId,
            size,
            price: '0',
            quantity,
            perfume: { id: productId, name: 'Producto', brand: 'Marca' }
          };
          localCart.push(newItem);
          localStorage.setItem('localCart', JSON.stringify(localCart));
          
          // Actualizar cache
          queryClient.setQueryData(['/api/cart'], localCart);
          
          toast({
            title: "Producto agregado (modo offline)",
            description: "El producto se agregó al carrito local",
          });
          return true;
        }
        
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
          description: response.error || "Error desconocido",
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

      if (!response.success && response.status === 404) {
        // Backend no disponible, actualizar localStorage
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const updatedCart = localCart.map((item: CartItem) => 
          item.id === itemId ? { ...item, quantity } : item
        );
        localStorage.setItem('localCart', JSON.stringify(updatedCart));
        queryClient.setQueryData(['/api/cart'], updatedCart);
        return true;
      }

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        return true;
      }

      return false;
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

      if (!response.success && response.status === 404) {
        // Backend no disponible, actualizar localStorage
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const updatedCart = localCart.filter((item: CartItem) => item.id !== itemId);
        localStorage.setItem('localCart', JSON.stringify(updatedCart));
        queryClient.setQueryData(['/api/cart'], updatedCart);
        return true;
      }

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        return true;
      }

      return false;
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

      if (!response.success && response.status === 404) {
        // Backend no disponible, limpiar localStorage
        localStorage.removeItem('localCart');
        queryClient.setQueryData(['/api/cart'], []);
        return true;
      }

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        return true;
      }

      return false;
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