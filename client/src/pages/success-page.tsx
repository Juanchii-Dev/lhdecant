import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function SuccessPage() {
  const [location, setLocation] = useLocation();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extraer session_id de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Aquí puedes hacer una llamada para obtener los detalles de la orden
      // Por ahora simulamos los datos
      setTimeout(() => {
        setOrderDetails({
          orderId: `ORD-${Date.now()}`,
          total: "$75.00",
          items: [
            { name: "One Million", size: "5ml", price: "$25.00" },
            { name: "Bleu de Chanel EDP", size: "10ml", price: "$50.00" }
          ],
          estimatedDelivery: "3-5 días hábiles"
        });
        setIsLoading(false);
      }, 2000);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-yellow-500">Procesando tu pedido...</h2>
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
          className="max-w-4xl mx-auto"
        >
          {/* Header de éxito */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-yellow-500 mb-4">
              ¡Pago Exitoso!
            </h1>
            <p className="text-xl text-gray-300">
              Tu pedido ha sido procesado correctamente
            </p>
          </div>

          {/* Detalles del pedido */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-500 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Detalles del Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Número de orden:</span>
                    <span className="text-white font-bold">{orderDetails?.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total pagado:</span>
                    <span className="text-yellow-500 font-bold text-xl">{orderDetails?.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fecha:</span>
                    <span className="text-white">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-500 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Información de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <span className="text-green-500 font-bold">Confirmado</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tiempo estimado:</span>
                    <span className="text-white">{orderDetails?.estimatedDelivery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Método de pago:</span>
                    <span className="text-white">Tarjeta de crédito</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Productos comprados */}
          <Card className="bg-gray-900 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-yellow-500">Productos Comprados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderDetails?.items.map((item: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.size}</p>
                    </div>
                    <span className="text-yellow-500 font-bold">{item.price}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Próximos pasos */}
          <Card className="bg-gray-900 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-yellow-500">Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-black font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Confirmación por email</h4>
                    <p className="text-gray-400 text-sm">Recibirás un email con los detalles de tu pedido</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-black font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Preparación del pedido</h4>
                    <p className="text-gray-400 text-sm">Preparamos tu pedido con cuidado</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-black font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Envío y tracking</h4>
                    <p className="text-gray-400 text-sm">Te enviaremos el número de seguimiento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3"
            >
              <Home className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Button>
            <Button
              onClick={() => window.location.href = '/orders'}
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-8 py-3"
            >
              Ver Mis Pedidos
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 