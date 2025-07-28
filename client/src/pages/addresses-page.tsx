import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit, Home, Building } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { getQueryFn } from '../lib/queryClient';

interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressForm {
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressForm>({
    type: 'home',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Argentina',
    phone: '',
    isDefault: false,
  });

  // Obtener direcciones del usuario
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/addresses', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching addresses');
      return response.json();
    },
    enabled: !!user?.id,
  }) as { data: Address[], isLoading: boolean };

  // Mutación para agregar dirección
  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressForm) => {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al agregar dirección');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddForm(false);
      setFormData({
        type: 'home',
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Argentina',
        phone: '',
        isDefault: false,
      });
      toast({
        title: "Dirección agregada",
        description: "La dirección se agregó correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar la dirección",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar dirección
  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al eliminar dirección');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({
        title: "Dirección eliminada",
        description: "La dirección se eliminó correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la dirección",
        variant: "destructive",
      });
    },
  });

  // Mutación para establecer como predeterminada
  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al establecer dirección predeterminada');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({
        title: "Predeterminada",
        description: "Dirección establecida como predeterminada",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo establecer como predeterminada",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAddressMutation.mutate(formData);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home size={20} />;
      case 'work': return <Building size={20} />;
      default: return <MapPin size={20} />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'home': return 'Casa';
      case 'work': return 'Trabajo';
      default: return 'Otro';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-luxury-gold mb-4">Acceso requerido</h2>
          <p className="text-gray-400">Debes iniciar sesión para ver tus direcciones</p>
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
              <h1 className="text-4xl font-bold text-luxury-gold mb-2">Mis Direcciones</h1>
              <p className="text-gray-400">
                Gestiona tus direcciones de envío
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <Plus size={16} />
              Agregar Dirección
            </button>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando direcciones...</p>
          </div>
        )}

        {/* Addresses Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-charcoal rounded-lg p-6 border border-luxury-gold/20 relative"
              >
                {/* Address Type Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-luxury-gold">
                    {getAddressIcon(address.type)}
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {getAddressTypeLabel(address.type)}
                  </span>
                  {address.isDefault && (
                    <span className="px-2 py-1 bg-luxury-gold text-gray-900 text-xs font-semibold rounded">
                      Predeterminada
                    </span>
                  )}
                </div>

                {/* Address Details */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-white">{address.name}</h3>
                  <p className="text-gray-300">{address.street}</p>
                  <p className="text-gray-300">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-gray-300">{address.country}</p>
                  <p className="text-gray-400 text-sm">{address.phone}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultMutation.mutate(address.id)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Predeterminada
                    </button>
                  )}
                  <button
                    onClick={() => setEditingAddress(address)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteAddressMutation.mutate(address.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Empty State */}
            {addresses.length === 0 && !showAddForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full text-center py-12"
              >
                <MapPin className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No tienes direcciones</h3>
                <p className="text-gray-400 mb-6">
                  Agrega una dirección de envío para realizar compras más rápido
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  <Plus size={16} />
                  Agregar Dirección
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Add Address Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddForm(false)}
          >
            <div
              className="bg-charcoal rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-luxury-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Agregar Dirección</h2>
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
                    Tipo de Dirección
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                  >
                    <option value="home">Casa</option>
                    <option value="work">Trabajo</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ej: Casa Principal"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Calle y Número
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Av. Corrientes 1234"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Buenos Aires"
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Provincia
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="CABA"
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="1043"
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Argentina"
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54 11 1234-5678"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-luxury-gold focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-luxury-gold bg-gray-700 border-gray-600 rounded focus:ring-luxury-gold focus:ring-2"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-300">
                    Establecer como dirección predeterminada
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
                    disabled={addAddressMutation.isPending}
                    className="flex-1 px-4 py-2 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    {addAddressMutation.isPending ? 'Agregando...' : 'Agregar'}
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