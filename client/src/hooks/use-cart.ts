import { useCallback, useState, useEffect } from 'react';
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('localCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('localCart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoading]);

  // Calcular total de items
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Función para agregar al carrito
  const addToCart = useCallback(async (productId: string, quantity: number = 1, size?: string) => {
    setIsAddingToCart(true);
    
    try {
      // Buscar si el item ya existe
      const existingItemIndex = cartItems.findIndex(
        item => item.productId === productId && item.size === (size || '50ml')
      );

      if (existingItemIndex >= 0) {
        // Actualizar cantidad del item existente
        const updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity += quantity;
        setCartItems(updatedCart);
      } else {
        // Agregar nuevo item
        const newItem: CartItem = {
          id: Date.now().toString(),
          productId,
          size: size || '50ml',
          price: '0', // Se actualizará cuando se obtenga la información del producto
          quantity,
          perfume: {
            id: productId,
            name: 'Producto',
            brand: 'Marca'
          }
        };
        setCartItems(prev => [...prev, newItem]);
      }

      toast({
        title: "Producto agregado",
        description: "El producto se agregó correctamente al carrito",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, [cartItems, toast]);

  // Función para actualizar cantidad
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  }, []);

  // Función para eliminar item
  const removeItem = useCallback(async (itemId: string) => {
    try {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }, []);

  // Función para limpiar carrito
  const clearCart = useCallback(async () => {
    try {
      setCartItems([]);
      localStorage.removeItem('localCart');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }, []);

  // Función para refetch (no hace nada en esta implementación)
  const refetch = useCallback(() => {
    // No necesitamos refetch ya que usamos localStorage
  }, []);

  return {
    cartItems,
    totalItems,
    isLoading,
    error: null,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refetch,
    isAddingToCart,
  };
} 