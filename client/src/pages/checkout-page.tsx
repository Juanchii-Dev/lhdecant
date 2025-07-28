import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useCartSync } from "../hooks/use-cart-sync";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, Shield, Truck } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalAmount, isLoading: cartLoading } = useCartSync();
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
      // Preparar los datos del carrito para Stripe
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.perfume?.name || `Perfume ${item.perfumeId}`,
            description: `${item.perfume?.brand || 'Marca'} - ${item.size}`,
            images: item.perfume?.imageUrl ? [item.perfume.imageUrl] : [],
          },
          unit_amount: Math.round(parseFloat(item.price) * 100), // Stripe espera centavos
        },
        quantity: item.quantity,
      }));

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: lineItems,
          currency: 'usd',
          customerEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la sesión de pago');
      }

      const { sessionId } = await response.json();
      
      // Redirigir a Stripe Checkout
      const stripe = await loadStripe('pk_test_placeholder');
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
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl font-bold text-yellow-500 mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Resumen del pedido */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Resumen del Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item: any, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.perfume?.imageUrl ? (
                          <img 
                            src={item.perfume.imageUrl} 
                            alt={item.perfume.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-2xl">🧴</div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-lg">
                          {item.perfume?.name || 'Producto desconocido'}
                        </h3>
                        <p className="text-gray-400 text-sm">{item.perfume?.brand || 'Marca'}</p>
                        <p className="text-gray-400 text-sm">Tamaño: {item.size}</p>
                        <p className="text-gray-400 text-sm">Cantidad: {item.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-yellow-500 font-bold text-lg">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          ${item.price} c/u
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Información del cliente */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nombre:</span>
                    <span className="text-white">{user.name || user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de pago */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Resumen de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Subtotal por items */}
                  <div className="space-y-2">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {item.perfume?.name} x{item.quantity}
                        </span>
                        <span className="text-white">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-300">Total:</span>
                      <span className="text-3xl font-bold text-yellow-500">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 text-lg transition-colors duration-300"
                    disabled={isLoading || authLoading || cartLoading || (items || []).length === 0}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        Procesando...
                      </div>
                    ) : (
                      `Pagar $${totalAmount.toFixed(2)}`
                    )}
                  </Button>

                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Pago seguro con Stripe</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Truck className="w-4 h-4" />
                    <span>Envío incluido</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 