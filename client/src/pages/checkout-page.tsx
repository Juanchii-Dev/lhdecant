import { useState, useEffect } from "react";
import { buildApiUrl } from "../config/api";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { loadStripe } from "@stripe/stripe-js";

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

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(buildApiUrl('/api/cart'), {
          credentials: 'include'
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

    fetchCart();
  }, [user]);

  const handleCheckout = async () => {
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

    setProcessingPayment(true);

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

      const response = await fetch(buildApiUrl('/api/stripe/create-checkout-session'), {
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
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar el pago",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Inicia sesión para continuar</h1>
          <p className="text-gray-400">Necesitas estar registrado para realizar la compra</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Cargando...</p>
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
        </div>
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del carrito */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
                <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        {item.perfume?.imageUrl ? (
                          <img 
                            src={item.perfume.imageUrl} 
                            alt={item.perfume.name} 
                        className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                      <div className="text-2xl">🧴</div>
                        )}
                      </div>
                      <div className="flex-1">
                    <h3 className="font-medium">{item.perfume?.name || `Perfume ${item.perfumeId}`}</h3>
                    <p className="text-gray-400 text-sm">{item.size}</p>
                    <p className="text-yellow-500 font-bold">${item.price} x {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                      </div>
                    ))}
                  </div>
                  
            <div className="border-t border-gray-700 mt-6 pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-yellow-500">${totalAmount.toFixed(2)}</span>
              </div>
                    </div>
                  </div>

          {/* Información de pago */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Información de pago</h2>
            
            <div className="space-y-6">
              {/* Información del cliente */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Cliente</h3>
                <p className="text-gray-300">{user.name || user.username}</p>
                <p className="text-gray-400">{user.email}</p>
              </div>

              {/* Método de pago */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Método de pago</h3>
                <p className="text-gray-300">Tarjeta de crédito/débito</p>
                <p className="text-gray-400 text-sm">Procesado de forma segura por Stripe</p>
              </div>

              {/* Botón de pago */}
                  <Button
                    onClick={handleCheckout}
                disabled={processingPayment || items.length === 0}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 text-lg transition-colors duration-300"
                  >
                {processingPayment ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        Procesando...
                      </div>
                    ) : (
                      `Pagar $${totalAmount.toFixed(2)}`
                    )}
                  </Button>

              {/* Información de seguridad */}
              <div className="text-center space-y-2">
                <p className="text-gray-400 text-sm">
                  🔒 Pago seguro con Stripe
                </p>
                <p className="text-gray-400 text-sm">
                  🚚 Envío incluido
                </p>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
} 