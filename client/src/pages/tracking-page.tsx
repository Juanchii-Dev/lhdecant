import { useState } from 'react';
import { buildApiUrl } from "../config/api";
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MapPin, Search } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { getQueryFn } from '../lib/queryClient';

interface TrackingEvent {
  id: string;
  orderId: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
}

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    perfumeName: string;
    quantity: number;
  }>;
  total: number;
}

const statusSteps = [
  { key: 'pending', label: 'Pedido Recibido', icon: Package, color: 'text-blue-400' },
  { key: 'confirmed', label: 'Confirmado', icon: CheckCircle, color: 'text-green-400' },
  { key: 'processing', label: 'Procesando', icon: Clock, color: 'text-yellow-400' },
  { key: 'shipped', label: 'Enviado', icon: Truck, color: 'text-purple-400' },
  { key: 'delivered', label: 'Entregado', icon: CheckCircle, color: 'text-green-500' },
];

export default function TrackingPage() {
  const { user } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Obtener pedidos del usuario
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const response = await fetch(buildApiUrl(`/api/tracking?email=${user?.email}`), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching orders');
      return response.json();
    },
    enabled: !!user?.id,
  }) as { data: Order[], isLoading: boolean };

  // Buscar por número de seguimiento
  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['tracking', trackingNumber],
    queryFn: async () => {
      const response = await fetch(buildApiUrl(`/api/tracking/${trackingNumber}?email=${user?.email}`), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching tracking data');
      return response.json();
    },
    enabled: !!trackingNumber && searchPerformed,
  }) as { data: TrackingEvent[], isLoading: boolean };

  const handleSearch = () => {
    if (trackingNumber.trim()) {
      setSearchPerformed(true);
    }
  };

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

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Acceso requerido</h2>
          <p className="text-gray-400">Debes iniciar sesión para ver el seguimiento</p>
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
          <h1 className="text-4xl font-bold text-luxury-gold mb-2">Seguimiento de Pedidos</h1>
          <p className="text-gray-400">
            Rastrea el estado de tus pedidos en tiempo real
          </p>
        </motion.div>

        {/* Search by Tracking Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-charcoal rounded-lg border border-luxury-gold/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Buscar por Número de Seguimiento</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ingresa el número de seguimiento"
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={!trackingNumber.trim() || trackingLoading}
                className="px-6 py-2 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Search size={16} />
                Buscar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tracking Results */}
        {searchPerformed && trackingNumber && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-charcoal rounded-lg border border-luxury-gold/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Seguimiento: {trackingNumber}
              </h2>
              
              {trackingLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold mx-auto"></div>
                  <p className="text-gray-400 mt-2">Buscando información...</p>
                </div>
              ) : trackingData && trackingData.length > 0 ? (
                <div className="space-y-4">
                  {trackingData.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
                        <MapPin size={16} className="text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{event.description}</h3>
                        <p className="text-gray-400 text-sm">{event.location}</p>
                        <p className="text-gray-500 text-xs">{formatDate(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <p className="text-gray-400">No se encontró información para este número de seguimiento</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Pedidos Recientes</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
              <p className="text-gray-400 mt-4">Cargando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-16 w-16 text-luxury-gold mb-4" />
              <h3 className="text-xl font-semibold text-luxury-gold mb-2">No tienes pedidos</h3>
              <p className="text-gray-400 mb-6">
                Realiza tu primera compra para ver el seguimiento aquí
              </p>
              <a
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Explorar Catálogo
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => {
                const currentStepIndex = getCurrentStepIndex(order.status);
                
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
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Pedido #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {formatDate(order.createdAt)}
                          </p>
                          {order.trackingNumber && (
                            <p className="text-luxury-gold text-sm font-mono">
                              Seguimiento: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-luxury-gold font-bold text-lg">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Progress Steps */}
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          {statusSteps.map((step, stepIndex) => {
                            const StepIcon = step.icon;
                            const isCompleted = stepIndex <= currentStepIndex;
                            const isCurrent = stepIndex === currentStepIndex;
                            
                            return (
                              <div key={step.key} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isCompleted 
                                    ? 'bg-luxury-gold text-gray-900' 
                                    : 'bg-gray-600 text-gray-400'
                                }`}>
                                  <StepIcon size={20} />
                                </div>
                                <p className={`text-xs mt-2 text-center ${
                                  isCurrent ? 'text-luxury-gold font-semibold' : 'text-gray-400'
                                }`}>
                                  {step.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Progress Line */}
                        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-600 -z-10">
                          <div 
                            className="h-full bg-luxury-gold transition-all duration-500"
                            style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <h4 className="font-semibold text-white mb-3">Productos:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {item.perfumeName} x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 