import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../stores/cart-store';
import { getQueryFn, apiRequest } from '../lib/queryClient';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

export function useCartSync() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    items,
    totalItems,
    totalAmount,
    setItems,
    setLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  // Sincronizar con el backend
  const { data: backendItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    cacheTime: 0,
    retry: 1,
    enabled: !!user,
    onSuccess: (data) => {
      console.log('🛒 Backend cart data:', data);
      // Sincronizar datos del backend con el store local
      if (data && Array.isArray(data)) {
        setItems(data);
      }
    },
    onError: (error) => {
      console.error('Error fetching cart:', error);
      if (error.message.includes('401')) {
        return;
      }
      toast({
        title: "Error al cargar el carrito",
        description: "No se pudieron cargar los productos del carrito",
        variant: "destructive",
      });
    },
  });

  // Mutación para agregar al carrito
  const addToCartMutation = useMutation({
    mutationFn: async (item: any) => {
      const res = await apiRequest("POST", "/api/cart", item);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al agregar al carrito');
      }
      return await res.json();
    },
    onSuccess: async (data) => {
      console.log('🛒 Add to cart success:', data);
      
      // Solo sincronizar con backend, no actualizar store local
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Agregado al carrito",
        description: "El producto se ha agregado correctamente",
      });
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      if (error.message.includes('401')) {
        toast({
          title: "Inicia sesión para continuar",
          description: "Necesitas estar registrado para agregar productos al carrito",
          variant: "destructive",
        });
        window.location.href = '/auth?message=login-required';
        return;
      }
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar cantidad
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar cantidad');
      }
      return await res.json();
    },
    onSuccess: async () => {
      // Solo sincronizar con backend
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar item
  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/cart/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar producto');
      }
    },
    onSuccess: async () => {
      // Solo sincronizar con backend
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado del carrito",
      });
    },
    onError: (error) => {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el producto",
        variant: "destructive",
      });
    },
  });

  // Mutación para vaciar carrito
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: async () => {
      // Solo sincronizar con backend
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Carrito vacío",
        description: "Todos los productos han sido eliminados",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive",
      });
    },
  });

  // Funciones que combinan store local y backend
  const addToCart = (perfumeId: string, size: string, price: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Necesitas estar registrado para agregar productos al carrito",
        variant: "destructive",
      });
      window.location.href = '/auth?message=login-required';
      return;
    }

    addToCartMutation.mutate({
      perfumeId,
      size,
      price,
      quantity: 1,
    });
  };

  const updateQuantitySync = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemSync(id);
      return;
    }
    
    // Solo sincronizar con backend
    updateQuantityMutation.mutate({ id, quantity });
  };

  const removeItemSync = (id: string) => {
    // Solo sincronizar con backend
    removeItemMutation.mutate(id);
  };

  const clearCartSync = () => {
    // Solo sincronizar con backend
    clearCartMutation.mutate();
  };

  const goToCheckout = () => {
    if (!user) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Necesitas estar registrado para realizar la compra",
        variant: "destructive",
      });
      window.location.href = '/auth?message=login-required';
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de proceder al pago",
        variant: "destructive",
      });
      return;
    }

    window.location.href = '/checkout';
  };

  return {
    items,
    isLoading,
    totalItems,
    totalAmount,
    addToCart,
    updateQuantity: updateQuantitySync,
    removeItem: removeItemSync,
    clearCart: clearCartSync,
    goToCheckout,
  };
} 