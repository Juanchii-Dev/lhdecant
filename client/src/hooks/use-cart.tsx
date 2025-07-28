import React from "react";
import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
// import { CartItem, Perfume, InsertCartItem } from "../../../shared/schema"; // ELIMINADO
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";

type CartContextType = {
  items: (any & { perfume: any })[];
  isLoading: boolean;
  totalItems: number;
  totalAmount: number;
  addToCart: (perfumeId: string, size: string, price: string) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  forceRefreshCart: () => Promise<void>;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<(any & { perfume: any })[]>({
    queryKey: ["/api/cart"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    cacheTime: 0,
  });

  console.log('🛒 CartProvider - items:', items);
  console.log('🛒 CartProvider - items length:', items?.length);

  const addToCartMutation = useMutation({
    mutationFn: async (item: any) => {
      console.log('🛒 addToCartMutation - item:', item);
      const res = await apiRequest("POST", "/api/cart", item);
      return await res.json();
    },
    onSuccess: async (data) => {
      console.log('🛒 addToCartMutation - success:', data);
      
      // Forzar invalidación y refetch inmediato
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Agregado al carrito",
        description: "El producto se ha agregado correctamente",
      });
    },
    onError: (error) => {
      console.log('🛒 addToCartMutation - error:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado del carrito",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
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

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const addToCart = (perfumeId: string, size: string, price: string) => {
    console.log('🛒 addToCart - llamando con:', { perfumeId, size, price });
    addToCartMutation.mutate({
      perfumeId,
      size,
      price,
      quantity: 1,
    });
  };

  const forceRefreshCart = async () => {
    console.log('🛒 forceRefreshCart - forzando refresh');
    await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    await queryClient.refetchQueries({ queryKey: ["/api/cart"] });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    updateQuantityMutation.mutate({ id, quantity });
  };

  const removeItem = (id: number) => {
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
        forceRefreshCart,
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