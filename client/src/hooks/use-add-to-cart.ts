import { useCart } from "./use-cart";

export function useAddToCart() {
  const { addToCart, isAddingToCart } = useCart();

  return {
    addToCart: (params: { productId: string; quantity?: number; size?: string }) => {
      return addToCart(params.productId, params.quantity || 1, params.size);
    },
    isAdding: isAddingToCart,
    error: null,
  };
} 