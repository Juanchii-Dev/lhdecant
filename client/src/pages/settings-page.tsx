import React, { useState } from 'react';
import { buildApiUrl } from "../config/api";
import { useAuth } from '../hooks/use-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone, 
  Mail, 
  Eye, 
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload,
  Key,
  Lock,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    orderUpdates: boolean;
    newProducts: boolean;
    promotions: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    allowAnalytics: boolean;
    allowCookies: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    animations: boolean;
  };
  language: {
    locale: string;
    currency: string;
    timezone: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
  };
  data: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    exportFormat: 'json' | 'csv' | 'pdf';
  };
}

const defaultSettings: Settings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    marketing: false,
    orderUpdates: true,
    newProducts: true,
    promotions: false,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowAnalytics: true,
    allowCookies: true,
  },
  appearance: {
    theme: 'dark',
    fontSize: 'medium',
    compactMode: false,
    animations: true,
  },
  language: {
    locale: 'es-ES',
    currency: 'USD',
    timezone: 'America/New_York',
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
  },
  data: {
    autoBackup: false,
    backupFrequency: 'weekly',
    exportFormat: 'json',
  },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Obtener configuraciones del usuario
  const { data: settings = defaultSettings, isLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const response = await fetch(buildApiUrl('/api/user-settings'), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching user settings');
      return response.json();
    },
    enabled: !!user,
  });

  // Mutación para actualizar configuraciones
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      const response = await fetch(buildApiUrl('/api/user/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Error al actualizar configuraciones');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast({
        title: "Configuraciones actualizadas",
        description: "Tus configuraciones se han guardado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las configuraciones.",
        variant: "destructive",
      });
    },
  });

  // Mutación para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      const response = await fetch(buildApiUrl('/api/user/change-password'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      if (!response.ok) throw new Error('Error al cambiar contraseña');
      return response.json();
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha cambiado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la contraseña.",
        variant: "destructive",
      });
    },
  });

  // Mutación para exportar datos
  const exportDataMutation = useMutation({
    mutationFn: async (format: string) => {
      const response = await fetch(buildApiUrl('/api/user/export-data?format=${format}'), {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error al exportar datos');
      return response.blob();
    },
    onSuccess: (blob, format) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsExporting(false);
      toast({
        title: "Datos exportados",
        description: `Tus datos se han exportado en formato ${format.toUpperCase()}.`,
      });
    },
    onError: () => {
      setIsExporting(false);
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos.",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar cuenta
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(buildApiUrl('/api/user/delete-account'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentPassword }),
      });
      if (!response.ok) throw new Error('Error al eliminar cuenta');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada permanentemente.",
      });
      // Redirigir al logout
      window.location.href = '/api/auth/logout';
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta. Verifica tu contraseña.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (section: keyof Settings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    };
    updateSettingsMutation.mutate(newSettings);
  };

  const handleExportData = (format: string) => {
    setIsExporting(true);
    exportDataMutation.mutate(format);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      deleteAccountMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-charcoal rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-charcoal rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-luxury-gold mb-2">Configuración</h1>
          <p className="text-gray-400">Gestiona tus preferencias y configuraciones de cuenta</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notificaciones */}
          <Card className="bg-charcoal border-luxury-gold/20">
            <CardHeader>
              <CardTitle className="text-luxury-gold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>Configura cómo recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Notificaciones por email</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Notificaciones push</Label>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications">Notificaciones SMS</Label>
                <Switch
                  id="sms-notifications"
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="order-updates">Actualizaciones de pedidos</Label>
                  <Switch
                    id="order-updates"
                    checked={settings.notifications.orderUpdates}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'orderUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-products">Nuevos productos</Label>
                  <Switch
                    id="new-products"
                    checked={settings.notifications.newProducts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'newProducts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="promotions">Promociones</Label>
                  <Switch
                    id="promotions"
                    checked={settings.notifications.promotions}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'promotions', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacidad */}
          <Card className="bg-charcoal border-luxury-gold/20">
            <CardHeader>
              <CardTitle className="text-luxury-gold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidad
              </CardTitle>
              <CardDescription>Controla tu privacidad y datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Visibilidad del perfil</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="friends">Solo amigos</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-email">Mostrar email</Label>
                <Switch
                  id="show-email"
                  checked={settings.privacy.showEmail}
                  onCheckedChange={(checked) => handleSettingChange('privacy', 'showEmail', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-phone">Mostrar teléfono</Label>
                <Switch
                  id="show-phone"
                  checked={settings.privacy.showPhone}
                  onCheckedChange={(checked) => handleSettingChange('privacy', 'showPhone', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-analytics">Permitir analytics</Label>
                <Switch
                  id="allow-analytics"
                  checked={settings.privacy.allowAnalytics}
                  onCheckedChange={(checked) => handleSettingChange('privacy', 'allowAnalytics', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-cookies">Permitir cookies</Label>
                <Switch
                  id="allow-cookies"
                  checked={settings.privacy.allowCookies}
                  onCheckedChange={(checked) => handleSettingChange('privacy', 'allowCookies', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Apariencia */}
          <Card className="bg-charcoal border-luxury-gold/20">
            <CardHeader>
              <CardTitle className="text-luxury-gold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apariencia
              </CardTitle>
              <CardDescription>Personaliza la interfaz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleSettingChange('appearance', 'theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Oscuro
                      </div>
                    </SelectItem>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Automático
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-size">Tamaño de fuente</Label>
                <Select
                  value={settings.appearance.fontSize}
                  onValueChange={(value) => handleSettingChange('appearance', 'fontSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeño</SelectItem>
                    <SelectItem value="medium">Mediano</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode">Modo compacto</Label>
                <Switch
                  id="compact-mode"
                  checked={settings.appearance.compactMode}
                  onCheckedChange={(checked) => handleSettingChange('appearance', 'compactMode', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Animaciones</Label>
                <Switch
                  id="animations"
                  checked={settings.appearance.animations}
                  onCheckedChange={(checked) => handleSettingChange('appearance', 'animations', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Idioma y Región */}
          <Card className="bg-charcoal border-luxury-gold/20">
            <CardHeader>
              <CardTitle className="text-luxury-gold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Idioma y Región
              </CardTitle>
              <CardDescription>Configura tu idioma y moneda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locale">Idioma</Label>
                <Select
                  value={settings.language.locale}
                  onValueChange={(value) => handleSettingChange('language', 'locale', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es-ES">Español (España)</SelectItem>
                    <SelectItem value="es-MX">Español (México)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="fr-FR">Français</SelectItem>
                    <SelectItem value="de-DE">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={settings.language.currency}
                  onValueChange={(value) => handleSettingChange('language', 'currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="MXN">MXN ($)</SelectItem>
                    <SelectItem value="COP">COP ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona horaria</Label>
                <Select
                  value={settings.language.timezone}
                  onValueChange={(value) => handleSettingChange('language', 'timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                    <SelectItem value="America/Bogota">Bogotá</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card className="bg-charcoal border-luxury-gold/20">
            <CardHeader>
              <CardTitle className="text-luxury-gold flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>Protege tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor">Autenticación de dos factores</Label>
                <Switch
                  id="two-factor"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorAuth', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Tiempo de sesión (minutos)</Label>
                <Select
                  value={settings.security.sessionTimeout.toString()}
                  onValueChange={(value) => handleSettingChange('security', 'sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="login-notifications">Notificaciones de inicio de sesión</Label>
                <Switch
                  id="login-notifications"
                  checked={settings.security.loginNotifications}
                  onCheckedChange={(checked) => handleSettingChange('security', 'loginNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Datos */}
          <Card className="bg-charcoal border-luxury-gold/20">
            <CardHeader>
              <CardTitle className="text-luxury-gold flex items-center gap-2">
                <Download className="h-5 w-5" />
                Datos
              </CardTitle>
              <CardDescription>Gestiona tus datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-backup">Respaldo automático</Label>
                <Switch
                  id="auto-backup"
                  checked={settings.data.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange('data', 'autoBackup', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Frecuencia de respaldo</Label>
                <Select
                  value={settings.data.backupFrequency}
                  onValueChange={(value) => handleSettingChange('data', 'backupFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="export-format">Formato de exportación</Label>
                <Select
                  value={settings.data.exportFormat}
                  onValueChange={(value) => handleSettingChange('data', 'exportFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => handleExportData(settings.data.exportFormat)}
                disabled={isExporting}
                className="w-full"
                variant="outline"
              >
                {isExporting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-luxury-gold"></div>
                    Exportando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar datos
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Cambiar Contraseña */}
        <Card className="bg-charcoal border-luxury-gold/20 mt-6">
          <CardHeader>
            <CardTitle className="text-luxury-gold flex items-center gap-2">
              <Key className="h-5 w-5" />
              Cambiar Contraseña
            </CardTitle>
            <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa la nueva contraseña"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma la nueva contraseña"
                />
              </div>
            </div>
            <Button
              onClick={() => changePasswordMutation.mutate()}
              disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
              className="w-full md:w-auto"
            >
              {changePasswordMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cambiando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Cambiar contraseña
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Eliminar Cuenta */}
        <Card className="bg-charcoal border-luxury-gold/20 mt-6 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Eliminar Cuenta
            </CardTitle>
            <CardDescription className="text-red-400">
              Esta acción es irreversible. Todos tus datos se eliminarán permanentemente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">
                <strong>Advertencia:</strong> Al eliminar tu cuenta, perderás acceso a:
              </p>
              <ul className="text-red-400 text-sm mt-2 list-disc list-inside space-y-1">
                <li>Todos tus pedidos y historial</li>
                <li>Tu lista de favoritos</li>
                <li>Información de perfil y configuraciones</li>
                <li>Datos de pago y direcciones guardadas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-password">Confirma tu contraseña</Label>
              <Input
                id="delete-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña para confirmar"
                className="border-red-500/50 focus:border-red-500"
              />
            </div>
            <Button
              onClick={handleDeleteAccount}
              disabled={!currentPassword || deleteAccountMutation.isPending}
              variant="destructive"
              className="w-full md:w-auto"
            >
              {deleteAccountMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Eliminando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Eliminar cuenta permanentemente
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 