import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface CartItem {
  id: string;
  perfumeId: string;
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

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  totalItems: number;
  totalAmount: number;
  
  // Actions
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getItemById: (id: string) => CartItem | undefined;
  getItemByPerfumeAndSize: (perfumeId: string, size: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  devtools(
    (set, get) => ({
      items: [],
      isLoading: false,
      totalItems: 0,
      totalAmount: 0,

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            item => item.perfumeId === newItem.perfumeId && item.size === newItem.size
          );

          if (existingItem) {
            // Actualizar cantidad si ya existe
            const updatedItems = state.items.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
            
            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            
            return {
              items: updatedItems,
              totalItems,
              totalAmount,
            };
          } else {
            // Agregar nuevo item con el ID del backend
            const updatedItems = [...state.items, newItem];
            
            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            
            return {
              items: updatedItems,
              totalItems,
              totalAmount,
            };
          }
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Eliminar item si cantidad es 0 o menor
            const updatedItems = state.items.filter(item => item.id !== id);
            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            
            return {
              items: updatedItems,
              totalItems,
              totalAmount,
            };
          } else {
            // Actualizar cantidad
            const updatedItems = state.items.map(item =>
              item.id === id ? { ...item, quantity } : item
            );
            
            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            
            return {
              items: updatedItems,
              totalItems,
              totalAmount,
            };
          }
        });
      },

      removeItem: (id) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.id !== id);
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
          
          return {
            items: updatedItems,
            totalItems,
            totalAmount,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        });
      },

      setItems: (items) => {
        set((state) => {
          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
          
          return {
            items,
            totalItems,
            totalAmount,
          };
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      getItemById: (id) => {
        return get().items.find(item => item.id === id);
      },

      getItemByPerfumeAndSize: (perfumeId, size) => {
        return get().items.find(item => item.perfumeId === perfumeId && item.size === size);
      },
    }),
    {
      name: 'cart-store',
    }
  )
); 