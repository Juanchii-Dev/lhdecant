import React, { useEffect, useState } from "react";
import { useCart } from "../hooks/use-cart";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { items, totalAmount, goToCheckout } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está logueado
    if (!user) {
      toast({
        title: "Acceso denegado",
        description: "Necesitas estar logueado para acceder al checkout",
        variant: "destructive",
      });
      window.location.href = '/auth?message=login-required';
      return;
    }

    // Verificar si hay items en el carrito
    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de proceder al pago",
        variant: "destructive",
      });
      window.location.href = '/';
      return;
    }
  }, [user, items, toast]);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Necesitas estar logueado para realizar la compra",
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
          items: items.map(item => ({
            perfumeId: item.perfumeId,
            size: item.size,
            quantity: item.quantity,
            price: item.price
          })),
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la sesión de pago');
      }

      const { sessionId } = await response.json();
      
      // Redirigir a Stripe Checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
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
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el pago",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStripe = async (publishableKey: string) => {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      return await loadStripe(publishableKey);
    } catch (error) {
      console.error('Error loading Stripe:', error);
      return null;
    }
  };

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

  if (items.length === 0) {
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
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-center mb-8">
            Finalizar Compra
          </h1>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Resumen del carrito */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div>
                        <h3 className="text-white font-medium">
                          {item.perfume?.name || `Perfume ${item.perfumeId}`}
                        </h3>
                        <p className="text-gray-400 text-sm">{item.size}</p>
                        <p className="text-gray-400 text-sm">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-500 font-bold">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-gray-700 mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">Total:</span>
                    <span className="text-2xl font-bold text-yellow-500">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de pago */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Información de pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Cliente</h3>
                    <p className="text-gray-400">{user.email}</p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Método de pago</h3>
                    <p className="text-gray-400">Tarjeta de crédito/débito</p>
                    <p className="text-gray-400 text-sm">Procesado por Stripe</p>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
                  >
                    {isLoading ? "Procesando..." : `Pagar $${totalAmount.toFixed(2)}`}
                  </Button>

                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Continuar comprando
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 