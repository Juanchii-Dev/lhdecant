import { useState } from "react";
import { useCart } from "../hooks/use-cart";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

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
  const { items, totalItems, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();

  const handleQuantityChange = (id: number, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  return (
    <Sheet>
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
              <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4 p-4 bg-black/50 rounded-lg border border-[#D4AF37]/20"
                    >
                      <img
                        src={item.perfume.imageUrl}
                        alt={item.perfume.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{item.perfume.name}</h4>
                        <p className="text-sm text-gray-400">{item.perfume.brand}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
                            {item.size}
                          </Badge>
                          <span className="text-[#D4AF37] font-semibold">${item.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0 border-[#D4AF37]/30"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-white">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0 border-[#D4AF37]/30"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-8 h-8 p-0 ml-2"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Separator className="bg-[#D4AF37]/20" />

              <div className="space-y-2">
                <div className="flex justify-between text-white">
                  <span>Total ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                  <span className="font-bold text-[#D4AF37]">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-[#D4AF37]/30 text-[#D4AF37]"
                  onClick={clearCart}
                >
                  Vaciar
                </Button>
                <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 luxury-button">
                      Finalizar Compra
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black border-[#D4AF37]/20 text-white max-w-md">
                    <CheckoutForm 
                      items={items} 
                      totalAmount={totalAmount} 
                      onClose={() => setIsCheckoutOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CheckoutForm({ 
  items, 
  totalAmount, 
  onClose 
}: { 
  items: any[]; 
  totalAmount: number; 
  onClose: () => void; 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const orderData = {
        customerName: formData.get("customerName") as string,
        customerEmail: formData.get("customerEmail") as string,
        customerPhone: formData.get("customerPhone") as string,
        shippingAddress: formData.get("shippingAddress") as string,
        totalAmount: totalAmount.toString(),
      };

      const orderItems = items.map(item => ({
        perfumeId: item.perfumeId,
        perfumeName: item.perfume.name,
        perfumeBrand: item.perfume.brand,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: (parseFloat(item.price) * item.quantity).toString(),
      }));

      const res = await apiRequest("POST", "/api/orders", { orderData, orderItems });
      
      if (res.ok) {
        toast({
          title: "¡Pedido realizado!",
          description: "Tu pedido ha sido procesado exitosamente. Te contactaremos pronto.",
        });
        clearCart();
        onClose();
      } else {
        throw new Error("Error al procesar el pedido");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el pedido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-[#D4AF37]">Finalizar Compra</DialogTitle>
        <DialogDescription className="text-gray-400">
          Completa tus datos para procesar el pedido
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="customerName" className="text-[#D4AF37]">Nombre completo</Label>
          <Input
            id="customerName"
            name="customerName"
            required
            className="bg-black/50 border-[#D4AF37]/30 text-white"
            placeholder="Tu nombre completo"
          />
        </div>

        <div>
          <Label htmlFor="customerEmail" className="text-[#D4AF37]">Email</Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            required
            className="bg-black/50 border-[#D4AF37]/30 text-white"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <Label htmlFor="customerPhone" className="text-[#D4AF37]">Teléfono</Label>
          <Input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            className="bg-black/50 border-[#D4AF37]/30 text-white"
            placeholder="Tu número de teléfono"
          />
        </div>

        <div>
          <Label htmlFor="shippingAddress" className="text-[#D4AF37]">Dirección de envío</Label>
          <Textarea
            id="shippingAddress"
            name="shippingAddress"
            required
            className="bg-black/50 border-[#D4AF37]/30 text-white"
            placeholder="Tu dirección completa"
            rows={3}
          />
        </div>

        <Separator className="bg-[#D4AF37]/20" />

        <div className="flex justify-between items-center">
          <span className="text-white font-semibold">Total a pagar:</span>
          <span className="text-[#D4AF37] font-bold text-lg">${totalAmount.toFixed(2)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-[#D4AF37]/30 text-[#D4AF37]"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 luxury-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
          </Button>
        </div>
      </form>
    </>
  );
}