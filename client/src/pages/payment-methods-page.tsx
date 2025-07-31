import React, { useState } from 'react';
import { buildApiUrl } from "../config/api";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, Edit, Shield, Lock } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { getQueryFn } from '../lib/queryClient';

interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'paypal' | 'bank';
  cardType?: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethodForm {
  type: 'card' | 'paypal' | 'bank';
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  cardholderName?: string;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentMethodForm>({
    type: 'card',
    isDefault: false,
  });

  // Obtener métodos de pago del usuario
  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      const response = await fetch(buildApiUrl('/api/payment-methods'), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching payment methods');
      return response.json();
    },
    enabled: !!user?.id,
  }) as { data: PaymentMethod[], isLoading: boolean };

  // Mutación para agregar método de pago
  const addPaymentMethodMutation = useMutation({
    mutationFn: async (data: PaymentMethodForm) => {
      const response = await fetch(buildApiUrl('/api/payment-methods'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al agregar método de pago');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setShowAddForm(false);
      setFormData({ type: 'card', isDefault: false });
      toast({
        title: "Método agregado",
        description: "El método de pago se agregó correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el método de pago",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar método de pago
  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (methodId: string) => {
      const response = await fetch(buildApiUrl('/api/payment-methods/${methodId}'), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al eliminar método de pago');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({
        title: "Método eliminado",
        description: "El método de pago se eliminó correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el método de pago",
        variant: "destructive",
      });
    },
  });

  // Mutación para establecer como predeterminado
  const setDefaultMutation = useMutation({
    mutationFn: async (methodId: string) => {
      const response = await fetch(buildApiUrl('/api/payment-methods/${methodId}/default'), {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al establecer método predeterminado');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({
        title: "Predeterminado",
        description: "Método de pago establecido como predeterminado",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo establecer como predeterminado",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPaymentMethodMutation.mutate(formData);
  };

  const getCardIcon = (cardType?: string) => {
    switch (cardType) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  const formatCardNumber = (last4?: string) => {
    return last4 ? `•••• •••• •••• ${last4}` : '•••• •••• •••• ••••';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-luxury-gold mb-4">Acceso requerido</h2>
          <p className="text-gray-400">Debes iniciar sesión para ver tus métodos de pago</p>
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
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-luxury-gold mb-2">Métodos de Pago</h1>
              <p className="text-gray-400">
                Gestiona tus tarjetas y formas de pago
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <Plus size={16} />
              Agregar Método
            </button>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-blue-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-blue-400 font-semibold mb-1">Información Segura</h3>
                <p className="text-blue-300 text-sm">
                  Todos los datos de pago están encriptados y protegidos con los más altos estándares de seguridad.
                  Nunca almacenamos información completa de tarjetas en nuestros servidores.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando métodos de pago...</p>
          </div>
        )}

        {/* Payment Methods List */}
        {!isLoading && (
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-charcoal rounded-lg p-6 border border-luxury-gold/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-2xl">{getCardIcon(method.cardType)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {method.type === 'card' ? formatCardNumber(method.last4) : 'PayPal'}
                        </h3>
                        {method.isDefault && (
                          <span className="px-2 py-1 bg-luxury-gold text-gray-900 text-xs font-semibold rounded">
                            Predeterminado
                          </span>
                        )}
                      </div>
                      {method.type === 'card' && method.expiryMonth && method.expiryYear && (
                        <p className="text-gray-400 text-sm">
                          Expira: {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => setDefaultMutation.mutate(method.id)}
                        className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Predeterminado
                      </button>
                    )}
                    <button
                      onClick={() => setEditingMethod(method)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deletePaymentMethodMutation.mutate(method.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Empty State */}
            {paymentMethods.length === 0 && !showAddForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CreditCard className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No tienes métodos de pago</h3>
                <p className="text-gray-400 mb-6">
                  Agrega una tarjeta o método de pago para realizar compras más rápido
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  <Plus size={16} />
                  Agregar Método
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Add Payment Method Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddForm(false)}
          >
            <div
              className="bg-charcoal rounded-lg p-6 w-full max-w-md border border-luxury-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Agregar Método de Pago</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Método
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                  >
                    <option value="card">Tarjeta de Crédito/Débito</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                {formData.type === 'card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Mes
                        </label>
                        <select className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none">
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {(i + 1).toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Año
                        </label>
                        <select className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none">
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                        maxLength={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre del Titular
                      </label>
                      <input
                        type="text"
                        placeholder="Juan Pérez"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-luxury-gold bg-gray-700 border-gray-600 rounded focus:ring-luxury-gold focus:ring-2"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-300">
                    Establecer como método predeterminado
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={addPaymentMethodMutation.isPending}
                    className="flex-1 px-4 py-2 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    {addPaymentMethodMutation.isPending ? 'Agregando...' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 