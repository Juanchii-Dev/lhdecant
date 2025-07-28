import React from "react";
import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";

type CartContextType = {
  items: (any & { perfume: any })[];
  isLoading: boolean;
  totalItems: number;
  totalAmount: number;
  addToCart: (perfumeId: string, size: string, price: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  goToCheckout: () => void;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: items = [], isLoading } = useQuery<(any & { perfume: any })[]>({
    queryKey: ["/api/cart"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0, // Siempre considerar los datos como stale para refetch inmediato
    cacheTime: 0, // No cachear para obtener datos frescos siempre
    retry: 1,
    enabled: !!user, // Solo ejecutar si el usuario está autenticado
    onSuccess: (data) => { // Added for debugging
      console.log('🛒 Cart query success:', data);
    },
    onError: (error) => {
      console.error('Error fetching cart:', error);
      if (error.message.includes('401')) {
        // Usuario no autenticado, no mostrar error
        return;
      }
      toast({
        title: "Error al cargar el carrito",
        description: "No se pudieron cargar los productos del carrito",
        variant: "destructive",
      });
    },
  });

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
      
      // Invalidar inmediatamente
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      // Refetch múltiples veces para asegurar actualización
      await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      
      // Refetch adicional después de un delay
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      }, 50);
      
      // Refetch final para asegurar
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      }, 200);
      
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
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      
      // Refetch adicional para asegurar
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      }, 100);
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

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/cart/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar producto');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      
      // Refetch adicional para asegurar
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      }, 100);
      
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

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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

  const totalItems = (items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = (items || []).reduce((sum, item) => sum + (parseFloat(item.price || '0') * (item.quantity || 0)), 0);

  const addToCart = (perfumeId: string, size: string, price: string) => {
    // Verificar si el usuario está logueado
    if (!user) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Necesitas estar registrado para agregar productos al carrito",
        variant: "destructive",
      });
      
      // Redirigir a la página de registro
      window.location.href = '/auth?message=login-required';
      return;
    }

    // Si está logueado, agregar al carrito
    addToCartMutation.mutate({
      perfumeId,
      size,
      price,
      quantity: 1,
    });
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

    if ((items || []).length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de proceder al pago",
        variant: "destructive",
      });
      return;
    }

    // Redirigir a la página de checkout
    window.location.href = '/checkout';
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    updateQuantityMutation.mutate({ id, quantity });
  };

  const removeItem = (id: string) => {
    removeItemMutation.mutate(id);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        totalItems,
        totalAmount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        goToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}