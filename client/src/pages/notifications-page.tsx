import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Info,
  ShoppingBag,
  Gift,
  Star,
  Package,
  CreditCard,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search
} from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'promotion' | 'product' | 'system' | 'security';
  title: string;
  message: string;
  isRead: boolean;
  isImportant: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  security: boolean;
  system: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('all');
  const [showRead, setShowRead] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener notificaciones del usuario
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id, filterType, showRead, searchTerm],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  });

  // Obtener configuración de notificaciones
  const { data: settings } = useQuery<NotificationSettings>({
    queryKey: ['notification-settings', user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  });

  // Mutación para marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al marcar como leída');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutación para marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al marcar todas como leídas');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notificaciones marcadas como leídas",
        description: "Todas las notificaciones han sido marcadas como leídas",
      });
    },
  });

  // Mutación para eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al eliminar notificación');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notificación eliminada",
        description: "La notificación se ha eliminado correctamente",
      });
    },
  });

  // Mutación para actualizar configuración
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Error al actualizar configuración');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Configuración actualizada",
        description: "Tus preferencias de notificación se han guardado",
      });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      deleteNotificationMutation.mutate(id);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const formatDate = (dateString: string) => {
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
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-400" />;
      case 'promotion':
        return <Gift className="w-5 h-5 text-green-400" />;
      case 'product':
        return <ShoppingBag className="w-5 h-5 text-purple-400" />;
      case 'security':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-400" />;
      default:
        return <Bell className="w-5 h-5 text-luxury-gold" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'promotion':
        return 'border-green-500/20 bg-green-500/5';
      case 'product':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'security':
        return 'border-red-500/20 bg-red-500/5';
      case 'system':
        return 'border-gray-500/20 bg-gray-500/5';
      default:
        return 'border-luxury-gold/20 bg-luxury-gold/5';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = showRead || !notification.isRead;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesRead && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Bell className="w-16 h-16 text-luxury-gold mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-luxury-gold mb-4">Notificaciones</h1>
            <p className="text-gray-400 mb-8">Debes iniciar sesión para ver tus notificaciones</p>
            <Button asChild>
              <a href="/auth">Iniciar Sesión</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-luxury-gold mb-2">Notificaciones</h1>
              <p className="text-gray-400">Mantente al día con tus pedidos y ofertas especiales</p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-lg px-4 py-2">
                {unreadCount} sin leer
              </Badge>
            )}
          </div>
        </div>

        {/* Configuración de Notificaciones */}
        <Card className="bg-charcoal border-luxury-gold/20 mb-8">
          <CardHeader>
            <CardTitle className="text-luxury-gold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Notificaciones
            </CardTitle>
            <CardDescription>Personaliza cómo recibir notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Canales de Notificación
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Notificaciones por email</span>
                    <Switch
                      checked={settings?.email || false}
                      onCheckedChange={(checked) => handleSettingChange('email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Notificaciones push</span>
                    <Switch
                      checked={settings?.push || false}
                      onCheckedChange={(checked) => handleSettingChange('push', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Notificaciones SMS</span>
                    <Switch
                      checked={settings?.sms || false}
                      onCheckedChange={(checked) => handleSettingChange('sms', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Tipos de Notificación
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Actualizaciones de pedidos</span>
                    <Switch
                      checked={settings?.orderUpdates || false}
                      onCheckedChange={(checked) => handleSettingChange('orderUpdates', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Promociones y ofertas</span>
                    <Switch
                      checked={settings?.promotions || false}
                      onCheckedChange={(checked) => handleSettingChange('promotions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Nuevos productos</span>
                    <Switch
                      checked={settings?.newProducts || false}
                      onCheckedChange={(checked) => handleSettingChange('newProducts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Alertas de seguridad</span>
                    <Switch
                      checked={settings?.security || false}
                      onCheckedChange={(checked) => handleSettingChange('security', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="bg-charcoal border-luxury-gold/20 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar notificaciones..."
                  className="w-full pl-10 pr-4 py-2 bg-black/50 border border-luxury-gold/30 rounded-lg text-white placeholder-gray-400 focus:border-luxury-gold focus:outline-none"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-black/50 border border-luxury-gold/30 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="all">Todos los tipos</option>
                <option value="order">Pedidos</option>
                <option value="promotion">Promociones</option>
                <option value="product">Productos</option>
                <option value="security">Seguridad</option>
                <option value="system">Sistema</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showRead"
                  checked={showRead}
                  onChange={(e) => setShowRead(e.target.checked)}
                  className="w-4 h-4 text-luxury-gold bg-black/50 border-luxury-gold/30 rounded focus:ring-luxury-gold"
                />
                <label htmlFor="showRead" className="text-gray-300">Mostrar leídas</label>
              </div>
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllAsRead} variant="outline">
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Notificaciones */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-charcoal border-luxury-gold/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-charcoal border-luxury-gold/20 transition-all duration-200 hover:border-luxury-gold/40 ${
                  !notification.isRead ? 'ring-2 ring-luxury-gold/20' : ''
                } ${getNotificationColor(notification.type)}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h3>
                          {notification.isImportant && (
                            <Badge variant="destructive" className="text-xs">
                              Importante
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-300 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{formatDate(notification.createdAt)}</span>
                          {notification.actionUrl && notification.actionText && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-luxury-gold p-0 h-auto"
                              onClick={() => window.location.href = notification.actionUrl!}
                            >
                              {notification.actionText}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Marcar como leída"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        title="Eliminar notificación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-charcoal border-luxury-gold/20">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No hay notificaciones</h3>
                <p className="text-gray-400">
                  {searchTerm || filterType !== 'all' || !showRead
                    ? 'No se encontraron notificaciones con los filtros aplicados'
                    : 'Estás al día con todas tus notificaciones'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 