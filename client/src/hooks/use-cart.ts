import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  // Query para obtener el carrito con fallback robusto
  const { data: cartItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        const token = getAuthToken();
        
        if (!token) {
          // No hay token, usar localStorage
          const localCart = localStorage.getItem('localCart');
          return localCart ? JSON.parse(localCart) : [];
        }

        // Intentar obtener del servidor
        const response = await apiService.getCart();
        
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        
        // Si falla el servidor, usar localStorage como fallback
        console.warn('Server cart failed, using localStorage fallback');
        const localCart = localStorage.getItem('localCart');
        return localCart ? JSON.parse(localCart) : [];
        
      } catch (error) {
        console.error('Error fetching cart:', error);
        // Fallback a localStorage en caso de error
        try {
          const localCart = localStorage.getItem('localCart');
          return localCart ? JSON.parse(localCart) : [];
        } catch (parseError) {
          console.error('Error parsing local cart:', parseError);
          return [];
        }
      }
    },
    staleTime: 0, // Siempre obtener datos frescos
    refetchOnWindowFocus: true,
    retry: 1, // Solo reintentar una vez
  });

  // Calcular total de items con validación
  const totalItems = (Array.isArray(cartItems) ? cartItems : []).reduce((sum: number, item: CartItem) => sum + (item.quantity || 0), 0);

  // Mutation para agregar al carrito
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1, size }: { productId: string; quantity?: number; size?: string }) => {
      const token = getAuthToken();
      
      if (token) {
        // Intentar agregar al servidor
        try {
          const response = await apiService.addToCart(productId, quantity, size);
          if (response.success) {
            return response.data;
          }
        } catch (error) {
          console.warn('Server add to cart failed, using localStorage:', error);
        }
      }
      
      // Fallback a localStorage
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const existingItem = localCart.find((item: CartItem) => item.productId === productId && item.size === size);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const newItem = {
          id: Date.now().toString(),
          productId,
          size: size || '50ml',
          price: '0', // Precio se obtendrá del producto
          quantity,
          perfume: { id: productId, name: 'Producto', brand: 'Marca' }
        };
        localCart.push(newItem);
      }
      
      localStorage.setItem('localCart', JSON.stringify(localCart));
      return localCart;
    },
    onSuccess: (data) => {
      // Actualizar el cache inmediatamente
      queryClient.setQueryData(['cart'], data);
      // Refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      toast({
        title: "Producto agregado",
        description: "El producto se agregó correctamente al carrito",
      });
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    }
  });

  // Función para agregar al carrito (wrapper)
  const addToCart = useCallback(async (productId: string, quantity: number = 1, size?: string) => {
    addToCartMutation.mutate({ productId, quantity, size });
  }, [addToCartMutation]);

  // Función para actualizar cantidad
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const token = getAuthToken();
      
      if (token) {
        try {
          const response = await apiService.updateCartItem(itemId, quantity);
          if (response.success) {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            return true;
          }
        } catch (error) {
          console.warn('Server update failed, using localStorage:', error);
        }
      }
      
      // Fallback a localStorage
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const updatedCart = localCart.map((item: CartItem) => 
        item.id === itemId ? { ...item, quantity } : item
      );
      localStorage.setItem('localCart', JSON.stringify(updatedCart));
      queryClient.setQueryData(['cart'], updatedCart);
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
      
      if (token) {
        try {
          const response = await apiService.removeCartItem(itemId);
          if (response.success) {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            return true;
          }
        } catch (error) {
          console.warn('Server remove failed, using localStorage:', error);
        }
      }
      
      // Fallback a localStorage
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const updatedCart = localCart.filter((item: CartItem) => item.id !== itemId);
      localStorage.setItem('localCart', JSON.stringify(updatedCart));
      queryClient.setQueryData(['cart'], updatedCart);
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
      
      if (token) {
        try {
          const response = await apiService.clearCart();
          if (response.success) {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            return true;
          }
        } catch (error) {
          console.warn('Server clear failed, using localStorage:', error);
        }
      }
      
      // Fallback a localStorage
      localStorage.removeItem('localCart');
      queryClient.setQueryData(['cart'], []);
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
    isAddingToCart: addToCartMutation.isPending,
  };
} 