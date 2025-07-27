import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Edit, Save, X, Camera, Crown, Heart, ShoppingBag, Star } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { getQueryFn } from '../lib/queryClient';

interface UserStats {
  favoritesCount: number;
  ordersCount: number;
  reviewsCount: number;
}

interface RecentActivity {
  id: string;
  type: 'favorite' | 'order' | 'review';
  description: string;
  date: string;
  productName?: string;
  orderId?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferences: {
      newsletter: true,
      marketing: false,
      notifications: true,
    },
  });

  // Obtener estadísticas reales del usuario
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['user-stats', user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  });

  // Obtener actividad reciente real
  const { data: recentActivity = [], isLoading: activityLoading } = useQuery<RecentActivity[]>({
    queryKey: ['user-activity', user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  });

  // Usar datos del usuario directamente
  const profile = user ? {
    id: user.id,
    username: user.username || user.email,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,
    isPremium: user.email?.includes('premium') || false,
    memberSince: user.createdAt || new Date().toISOString(),
    lastLogin: user.updatedAt || new Date().toISOString(),
    preferences: {
      newsletter: true,
      marketing: false,
      notifications: true,
    }
  } : null;

  // Mutación para actualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar perfil');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tu información se actualizó correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  // Mutación para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al cambiar contraseña');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contraseña cambiada",
        description: "Tu contraseña se actualizó correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
    form.reset();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'favorite':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-400" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-400" />;
      default:
        return <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-luxury-gold mb-4">Acceso requerido</h2>
          <p className="text-gray-400">Debes iniciar sesión para ver tu perfil</p>
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
          <h1 className="text-4xl font-bold text-luxury-gold mb-2">Mi Perfil</h1>
          <p className="text-gray-400">Gestiona tu información personal y preferencias</p>
        </motion.div>

        {/* Profile Content */}
        {profile && (
          <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-charcoal rounded-lg border border-luxury-gold/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-luxury-gold to-amber-600 flex items-center justify-center text-black font-bold text-2xl">
                      {profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : profile.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{profile.name || profile.email.split('@')[0]}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-luxury-gold/20 text-luxury-gold">
                          {profile.isPremium ? 'Cliente Premium' : 'Cliente'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                        <User className="w-4 h-4" />
                        <span>Nombre Completo</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                        />
                      ) : (
                        <p className="text-white">{profile.name || 'No especificado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </label>
                      <p className="text-white">{profile.email}</p>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                        <Phone className="w-4 h-4" />
                        <span>Teléfono</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                        />
                      ) : (
                        <p className="text-white">{profile.phone || 'No especificado'}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Fecha de Nacimiento</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                        />
                      ) : (
                        <p className="text-white">No especificada</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Miembro desde</span>
                      </label>
                      <p className="text-white">{formatDate(profile.memberSince)}</p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-luxury-gold/10">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => updateProfileMutation.mutate(formData)}
                      disabled={updateProfileMutation.isPending}
                      className="px-4 py-2 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                    >
                      {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-charcoal rounded-lg border border-luxury-gold/20 p-6 text-center">
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-luxury-gold mb-2">
                      {userStats?.favoritesCount || 0}
                    </div>
                    <div className="text-gray-400">Favoritos</div>
                  </>
                )}
              </div>
              <div className="bg-charcoal rounded-lg border border-luxury-gold/20 p-6 text-center">
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-luxury-gold mb-2">
                      {userStats?.ordersCount || 0}
                    </div>
                    <div className="text-gray-400">Pedidos</div>
                  </>
                )}
              </div>
              <div className="bg-charcoal rounded-lg border border-luxury-gold/20 p-6 text-center">
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-luxury-gold mb-2">
                      {userStats?.reviewsCount || 0}
                    </div>
                    <div className="text-gray-400">Reseñas</div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-charcoal rounded-lg border border-luxury-gold/20 p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Cambiar Contraseña</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full px-4 py-2 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-charcoal rounded-lg border border-luxury-gold/20 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg animate-pulse">
                      <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="text-white">{activity.description}</p>
                        <p className="text-sm text-gray-400">{formatRelativeDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">📝</div>
                  <p className="text-gray-400">No hay actividad reciente</p>
                  <p className="text-sm text-gray-500">Comienza a usar la aplicación para ver tu actividad aquí</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 