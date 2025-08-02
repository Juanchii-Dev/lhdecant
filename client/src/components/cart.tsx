
import { useState, useEffect } from "react"
import { buildApiUrl } from "../config/api";;
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";

interface CartItem {
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

export function CartIcon() {
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await fetch(buildApiUrl('/api/cart'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const items = await response.json();
          const total = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
          setTotalItems(total);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, []);

  return (
    <div className="relative">
      <ShoppingCart className="w-6 h-6 text-[#D4AF37]" />
      {totalItems > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
        >
          {totalItems}
        </motion.div>
      )}
    </div>
  );
}

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch(buildApiUrl('/api/cart'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const cartItems = await response.json();
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCart();
    }
  }, [open, user]);

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user) return;

    // Actualización optimista
    const previousItems = [...items];
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    setItems(updatedItems);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch(buildApiUrl(`/api/cart/${id}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        // Revertir si hay error
        setItems(previousItems);
        throw new Error('Error updating quantity');
      }

      toast({
        title: "Cantidad actualizada",
        description: "La cantidad se ha actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;

    // Actualización optimista
    const previousItems = [...items];
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch(buildApiUrl(`/api/cart/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // Revertir si hay error
        setItems(previousItems);
        throw new Error('Error removing item');
      }

      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado del carrito",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    // Actualización optimista
    const previousItems = [...items];
    setItems([]);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch(buildApiUrl('/api/cart'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // Revertir si hay error
        setItems(previousItems);
        throw new Error('Error clearing cart');
      }

      toast({
        title: "Carrito vacío",
        description: "Todos los productos han sido eliminados",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive",
      });
    }
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

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10">
          <CartIcon />
          <span className="ml-2">Carrito</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-black border-[#D4AF37]/20 text-white">
        <SheetHeader>
          <SheetTitle className="text-[#D4AF37] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Carrito de Compras
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Cargando carrito...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Tu carrito está vacío</p>
              <Button onClick={() => setOpen(false)}>
                Continuar comprando
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto max-h-96">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4 py-4 border-b border-gray-700"
                    >
                      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.perfume?.imageUrl ? (
                          <img
                            src={item.perfume.imageUrl}
                            alt={item.perfume?.name || 'Perfume'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-xs text-center">
                            <div className="text-2xl">🧴</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {item.perfume?.name || `Perfume ${item.perfumeId}`}
                        </h3>
                        <p className="text-gray-400 text-sm">{item.size}</p>
                        <p className="text-yellow-500 font-bold">${item.price} c/u</p>
                        <p className="text-gray-500 text-xs">
                          Subtotal: ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="border-t border-gray-700 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">Total:</span>
                  <span className="text-yellow-500 font-bold text-2xl">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={goToCheckout}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
                    disabled={totalItems === 0}
                  >
                    Proceder al pago
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setOpen(false)}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Continuar comprando
                    </Button>
                    
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      disabled={totalItems === 0}
                    >
                      Vaciar carrito
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}