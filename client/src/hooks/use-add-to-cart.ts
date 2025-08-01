import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { addToCart } from "../lib/cart-helpers";

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ productId, quantity, size }: { productId: string; quantity?: number; size?: string }) => {
      return addToCart(productId, quantity || 1, size);
    },
    onSuccess: (data) => {
      console.log('✅ Producto agregado al carrito:', data);
      
      // Invalidar queries relacionadas con el carrito
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Producto agregado",
        description: "El producto se agregó correctamente al carrito",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error agregando al carrito:', error);
      
      toast({
        title: "Error",
        description: error.message || "Error al agregar el producto al carrito",
        variant: "destructive",
      });
    },
  });

  return {
    addToCart: mutation.mutate,
    isAdding: mutation.isPending,
    error: mutation.error,
  };
} 