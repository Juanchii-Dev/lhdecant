import { useCart } from "./use-cart";

export function useAddToCart() {
  const { addToCart } = useCart();

  return {
    addToCart: (params: { productId: string; quantity?: number; size?: string }) => {
      return addToCart(params.productId, params.quantity || 1, params.size);
    },
    isAdding: false, // El estado de loading se maneja en el hook useCart
    error: null,
  };
} 