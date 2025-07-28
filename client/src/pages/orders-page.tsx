import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Package, Calendar, DollarSign, Truck, Clock } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de órdenes
    setTimeout(() => {
      setOrders([
        {
          id: "ORD-123456",
          date: "2025-01-28",
          total: "$35.00",
          status: "Procesando",
          items: [
            { name: "Bleu de Chanel EDP", size: "5ml", quantity: 1 }
          ],
          estimatedDelivery: "3-5 días hábiles"
        },
        {
          id: "ORD-123457",
          date: "2025-01-25",
          total: "$60.00",
          status: "Enviado",
          items: [
            { name: "One Million", size: "5ml", quantity: 1 },
            { name: "Tobacco Vanille", size: "5ml", quantity: 1 }
          ],
          trackingNumber: "TRK123456789",
          estimatedDelivery: "1-2 días hábiles"
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Procesando":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "Enviado":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "Entregado":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Procesando":
        return <Clock className="w-4 h-4" />;
      case "Enviado":
        return <Truck className="w-4 h-4" />;
      case "Entregado":
        return <Package className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
          <p className="text-gray-400">Necesitas estar logueado para ver tus órdenes</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tus órdenes...</p>
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
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-500 mb-4">
              Mis Órdenes
            </h1>
            <p className="text-gray-400">
              Historial de todas tus compras
            </p>
          </div>

          {orders.length === 0 ? (
            <Card className="bg-gray-900 border-gray-700 max-w-md mx-auto">
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No tienes órdenes aún
                </h3>
                <p className="text-gray-400 mb-6">
                  Realiza tu primera compra para ver tus órdenes aquí
                </p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                >
                  Ir al Catálogo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Orden {order.id}
                        </CardTitle>
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Fecha:</span>
                            <span className="text-white">{order.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Total:</span>
                            <span className="text-yellow-500 font-bold">{order.total}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Envío:</span>
                            <span className="text-white">{order.estimatedDelivery}</span>
                          </div>
                        </div>

                        {/* Productos */}
                        <div className="border-t border-gray-700 pt-4">
                          <h4 className="text-white font-medium mb-3">Productos:</h4>
                          <div className="space-y-2">
                            {order.items.map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                                <span className="text-white">{item.name} - {item.size}</span>
                                <span className="text-gray-400">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tracking si está enviado */}
                        {order.trackingNumber && (
                          <div className="border-t border-gray-700 pt-4">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-400">Tracking:</span>
                              <span className="text-blue-500 font-mono">{order.trackingNumber}</span>
                            </div>
                          </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            Ver Detalles
                          </Button>
                          {order.trackingNumber && (
                            <Button
                              variant="outline"
                              className="flex-1 border-blue-600 text-blue-300 hover:bg-blue-900/20"
                            >
                              Rastrear Envío
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 