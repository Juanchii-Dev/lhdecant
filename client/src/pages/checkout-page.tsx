import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../hooks/use-cart";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { items, totalAmount, isLoading: cartLoading } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Esperar a que se carguen los datos
    if (authLoading || cartLoading) return;

    // Verificar si el usuario está logueado
    if (!user) {
      toast({
        title: "Acceso denegado",
        description: "Necesitas estar logueado para acceder al checkout",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = '/auth?message=login-required';
      }, 1000);
      return;
    }

    // Verificar si hay items en el carrito
    if ((items || []).length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de proceder al pago",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      return;
    }
  }, [user, items, authLoading, cartLoading]);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Necesitas estar logueado para realizar la compra",
        variant: "destructive",
      });
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

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: items,
          currency: 'usd',
          customerEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la sesión de pago');
      }

      const { sessionId } = await response.json();
      
      // Redirigir a Stripe Checkout usando import.meta.env
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar el pago",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
          <p className="text-gray-400">Necesitas estar logueado para acceder al checkout</p>
        </div>
      </div>
    );
  }

  if ((items || []).length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carrito vacío</h1>
          <p className="text-gray-400">Agrega productos antes de proceder al pago</p>
          <Button onClick={() => window.location.href = '/'} className="mt-4">
            Volver al catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-black text-white py-12"
    >
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl font-bold text-yellow-500 mb-8 text-center">
          Finalizar Compra
        </h1>

        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Resumen del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-b-0">
                  <div className="flex items-center gap-3">
                    {item.perfume?.imageUrl && (
                      <img src={item.perfume.imageUrl} alt={item.perfume.name} className="w-12 h-12 object-cover rounded-md" />
                    )}
                    <div>
                      <p className="text-white font-medium">{item.perfume?.name || 'Producto desconocido'}</p>
                      <p className="text-gray-400 text-sm">{item.size} - Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-yellow-500 font-bold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <span className="text-lg font-semibold text-gray-300">Total:</span>
                <span className="text-3xl font-bold text-yellow-500">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleCheckout}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg text-lg transition-colors duration-300"
          disabled={isLoading || authLoading || cartLoading || (items || []).length === 0}
        >
          {isLoading ? "Procesando..." : "Continuar con el Pago"}
        </Button>
      </div>
    </motion.div>
  );
} 