import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../config/api';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Trash2,
  Mail,
  Smartphone,
  MessageSquare
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'product' | 'security';
  isRead: boolean;
  createdAt: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  security: boolean;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Obtener notificaciones
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Error obteniendo notificaciones');
      return response.json();
    },
  });

  // Obtener configuración de notificaciones
  const { data: settings } = useQuery<NotificationSettings>({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/settings');
      if (!response.ok) throw new Error('Error obteniendo configuración');
      return response.json();
    },
  });

  // Mutation para marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PUT', `/api/notifications/${id}/read`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutation para marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', '/api/notifications/read-all');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notificaciones marcadas",
        description: "Todas las notificaciones han sido marcadas como leídas",
      });
    },
  });

  // Mutation para eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/notifications/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notificación eliminada",
        description: "La notificación ha sido eliminada",
      });
    },
  });

  // Mutation para actualizar configuración
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      const response = await apiRequest('PUT', '/api/notifications/settings', newSettings);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Configuración actualizada",
        description: "Las preferencias de notificación han sido actualizadas",
      });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (id: string) => {
      deleteNotificationMutation.mutate(id);
  };

  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    updateSettingsMutation.mutate({ [setting]: value });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
      month: 'short',
        day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'promotion':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      case 'product':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'security':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'order':
        return <Badge className="bg-green-500/20 text-green-400">Pedido</Badge>;
      case 'promotion':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Promoción</Badge>;
      case 'product':
        return <Badge className="bg-blue-500/20 text-blue-400">Producto</Badge>;
      case 'security':
        return <Badge className="bg-red-500/20 text-red-400">Seguridad</Badge>;
      default:
        return <Badge variant="secondary">General</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Notificaciones
          </h1>
          <p className="text-gray-400">
            Gestiona tus notificaciones y preferencias
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-charcoal border-luxury-gold/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-white">{notifications.length}</div>
              <div className="text-gray-400">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-charcoal border-luxury-gold/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-luxury-gold">{unreadCount}</div>
              <div className="text-gray-400">No leídas</div>
            </CardContent>
          </Card>
          <Card className="bg-charcoal border-luxury-gold/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-500">{notifications.length - unreadCount}</div>
              <div className="text-gray-400">Leídas</div>
          </CardContent>
        </Card>
              </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              size="sm"
            >
              No leídas
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              onClick={() => setFilter('read')}
              size="sm"
            >
              Leídas
            </Button>
              </div>
          
              {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? 'Marcando...' : 'Marcar todas como leídas'}
                </Button>
              )}
            </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-charcoal border-luxury-gold/20">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  {filter === 'all' 
                    ? 'No tienes notificaciones' 
                    : filter === 'unread' 
                    ? 'No tienes notificaciones no leídas'
                    : 'No tienes notificaciones leídas'
                  }
                </p>
                  </CardContent>
                </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-charcoal border-luxury-gold/20 ${
                  !notification.isRead ? 'border-luxury-gold/40' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">
                            {notification.title}
                          </h3>
                          {getNotificationBadge(notification.type)}
                          {!notification.isRead && (
                            <Badge className="bg-luxury-gold/20 text-luxury-gold">
                              Nueva
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Settings */}
        <Card className="bg-charcoal border-luxury-gold/20">
          <CardHeader>
            <CardTitle className="text-luxury-gold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración de Notificaciones
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personaliza cómo recibir notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Channels */}
            <div>
              <h4 className="font-semibold text-white mb-4">Canales de Notificación</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-white">Email</div>
                      <div className="text-sm text-gray-400">Recibir notificaciones por correo electrónico</div>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.email || false}
                    onCheckedChange={(checked) => handleSettingChange('email', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium text-white">Push</div>
                      <div className="text-sm text-gray-400">Notificaciones push en el navegador</div>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.push || false}
                    onCheckedChange={(checked) => handleSettingChange('push', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-medium text-white">SMS</div>
                      <div className="text-sm text-gray-400">Notificaciones por mensaje de texto</div>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.sms || false}
                    onCheckedChange={(checked) => handleSettingChange('sms', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h4 className="font-semibold text-white mb-4">Tipos de Notificación</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Actualizaciones de Pedidos</div>
                    <div className="text-sm text-gray-400">Estado de envío y confirmaciones</div>
                  </div>
                  <Switch
                    checked={settings?.orderUpdates || false}
                    onCheckedChange={(checked) => handleSettingChange('orderUpdates', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Promociones</div>
                    <div className="text-sm text-gray-400">Ofertas especiales y descuentos</div>
                  </div>
                  <Switch
                    checked={settings?.promotions || false}
                    onCheckedChange={(checked) => handleSettingChange('promotions', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Nuevos Productos</div>
                    <div className="text-sm text-gray-400">Lanzamientos y novedades</div>
                  </div>
                  <Switch
                    checked={settings?.newProducts || false}
                    onCheckedChange={(checked) => handleSettingChange('newProducts', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Seguridad</div>
                    <div className="text-sm text-gray-400">Alertas de seguridad de la cuenta</div>
                  </div>
                  <Switch
                    checked={settings?.security || false}
                    onCheckedChange={(checked) => handleSettingChange('security', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 