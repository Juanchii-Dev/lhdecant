
import { useState } from "react";
import { useCart } from "../hooks/use-cart";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export function CartIcon() {
  const { totalItems } = useCart();

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
  const { items, totalItems, totalAmount, updateQuantity, goToCheckout } = useCart();
  const [open, setOpen] = useState(false);

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
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Tu carrito está vacío</p>
              <Button onClick={() => setOpen(false)}>
                Continuar comprando
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-700">
                    <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                      {item.perfume?.imageUrl ? (
                        <img
                          src={item.perfume.imageUrl}
                          alt={item.perfume?.name || 'Perfume'}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs text-center">
                          <div className="text-2xl">🧴</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {item.perfume?.name || `Perfume ${item.perfumeId}`}
                      </h3>
                      <p className="text-gray-400 text-sm">{item.size}</p>
                      <p className="text-yellow-500 font-bold">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600"
                      >
                        -
                      </button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-bold">Total:</span>
                  <span className="text-yellow-500 font-bold text-xl">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={goToCheckout}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  >
                    Proceder al pago
                  </Button>
                  
                  <Button
                    onClick={() => setOpen(false)}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Continuar comprando
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}