import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Truck, Eye } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { getQueryFn } from '../lib/queryClient';

interface OrderItem {
  id: string;
  perfumeId: string;
  perfumeName: string;
  perfumeImage: string;
  quantity: number;
  size: string;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  processing: { label: 'Procesando', icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  shipped: { label: 'Enviado', icon: Truck, color: 'text-green-400', bg: 'bg-green-400/10' },
  delivered: { label: 'Entregado', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
};

const paymentStatusConfig = {
  pending: { label: 'Pendiente', color: 'text-yellow-400' },
  paid: { label: 'Pagado', color: 'text-green-400' },
  failed: { label: 'Fallido', color: 'text-red-400' },
  refunded: { label: 'Reembolsado', color: 'text-gray-400' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Obtener pedidos del usuario
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  }) as { data: Order[], isLoading: boolean };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-luxury-gold mb-4">Acceso requerido</h2>
          <p className="text-gray-400">Debes iniciar sesión para ver tus pedidos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-luxury-gold mb-2">Mis Pedidos</h1>
          <p className="text-gray-400">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} realizado{orders.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando pedidos...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Package className="mx-auto h-16 w-16 text-luxury-gold mb-4" />
            <h3 className="text-xl font-semibold text-luxury-gold mb-2">No tienes pedidos</h3>
            <p className="text-gray-400 mb-6">
              Realiza tu primera compra y verás tus pedidos aquí
            </p>
            <a
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Explorar Catálogo
            </a>
          </motion.div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order: Order, index: number) => {
              const statusInfo = statusConfig[order.status];
              const paymentInfo = paymentStatusConfig[order.paymentStatus];
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-charcoal rounded-lg border border-luxury-gold/20 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Pedido #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                          <StatusIcon size={16} className={statusInfo.color} />
                          <span className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700`}>
                          <span className={`text-sm font-medium ${paymentInfo.color}`}>
                            {paymentInfo.label}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <Eye size={16} />
                          {selectedOrder?.id === order.id ? 'Ocultar' : 'Ver'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  {selectedOrder?.id === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6"
                    >
                      {/* Items */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Productos</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
                              <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                                {item.perfumeImage ? (
                                  <img
                                    src={item.perfumeImage}
                                    alt={item.perfumeName}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <span className="text-gray-400 text-2xl">🫗</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-white">{item.perfumeName}</h5>
                                <p className="text-gray-400 text-sm">
                                  Cantidad: {item.quantity} | Tamaño: {item.size}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-luxury-gold">
                                  {formatCurrency(item.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Información de Envío</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-700 rounded-lg">
                            <h5 className="font-medium text-white mb-2">Cliente</h5>
                            <p className="text-gray-300">{order.customerName}</p>
                            <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                            <p className="text-gray-400 text-sm">{order.customerPhone}</p>
                          </div>
                          <div className="p-4 bg-gray-700 rounded-lg">
                            <h5 className="font-medium text-white mb-2">Dirección</h5>
                            <p className="text-gray-300">{order.shippingAddress.street}</p>
                            <p className="text-gray-300">
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p className="text-gray-300">{order.shippingAddress.country}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tracking */}
                      {order.trackingNumber && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-white mb-4">Seguimiento</h4>
                          <div className="p-4 bg-gray-700 rounded-lg">
                            <p className="text-gray-300">
                              Número de seguimiento: <span className="font-mono text-luxury-gold">{order.trackingNumber}</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Totals */}
                      <div className="border-t border-gray-700 pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Subtotal:</span>
                            <span className="text-white">{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Envío:</span>
                            <span className="text-white">{formatCurrency(order.shipping)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Impuestos:</span>
                            <span className="text-white">{formatCurrency(order.tax)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold border-t border-gray-700 pt-2">
                            <span className="text-white">Total:</span>
                            <span className="text-luxury-gold">{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 