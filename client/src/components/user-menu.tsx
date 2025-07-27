import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";
import { 
  User, 
  Settings, 
  Heart, 
  ShoppingBag, 
  LogOut, 
  ChevronDown,
  Crown,
  Gift,
  Star,
  Package,
  CreditCard,
  MapPin,
  Bell
} from "lucide-react";

interface UserMenuProps {
  user: any;
}

interface UserStats {
  favoritesCount: number;
  ordersCount: number;
  reviewsCount: number;
}

interface Notification {
  id: string;
  isRead: boolean;
  [key: string]: any;
}

interface Coupon {
  id: string;
  isActive: boolean;
  [key: string]: any;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { logoutMutation } = useAuth();
  const { toast } = useToast();

  // Obtener estadísticas reales del usuario
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['user-stats', user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  });

  // Obtener notificaciones no leídas
  const { data: unreadNotifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id, 'unread'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  });

  // Obtener cupones disponibles
  const { data: availableCoupons = [] } = useQuery<Coupon[]>({
    queryKey: ['coupons', 'available'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setIsOpen(false);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email[0].toUpperCase() : 'U';
  };

  const getUserDisplayName = (user: any) => {
    if (user.name) return user.name;
    if (user.username && user.username !== user.email) return user.username;
    return user.email ? user.email.split('@')[0] : 'Usuario';
  };

  const menuItems = [
    {
      icon: <User className="w-4 h-4" />,
      label: "Mi Perfil",
      href: "/profile",
      description: "Gestiona tu información personal"
    },
    {
      icon: <Heart className="w-4 h-4" />,
      label: "Favoritos",
      href: "/favorites",
      description: "Perfumes que te gustan",
      badge: userStats && userStats.favoritesCount > 0 ? userStats.favoritesCount.toString() : undefined
    },
    {
      icon: <ShoppingBag className="w-4 h-4" />,
      label: "Mis Pedidos",
      href: "/orders",
      description: "Historial de compras",
      badge: userStats && userStats.ordersCount > 0 ? userStats.ordersCount.toString() : undefined
    },
    {
      icon: <Package className="w-4 h-4" />,
      label: "Seguimiento",
      href: "/tracking",
      description: "Estado de tus envíos"
    },
    {
      icon: <CreditCard className="w-4 h-4" />,
      label: "Métodos de Pago",
      href: "/payment-methods",
      description: "Tarjetas y formas de pago"
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      label: "Direcciones",
      href: "/addresses",
      description: "Direcciones de envío"
    },
    {
      icon: <Gift className="w-4 h-4" />,
      label: "Códigos de Descuento",
      href: "/coupons",
      description: "Cupones y promociones",
      badge: availableCoupons.length > 0 ? availableCoupons.length.toString() : undefined
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: "Reseñas",
      href: "/reviews",
      description: "Tus opiniones sobre productos",
      badge: userStats && userStats.reviewsCount > 0 ? userStats.reviewsCount.toString() : undefined
    },
    {
      icon: <Bell className="w-4 h-4" />,
      label: "Notificaciones",
      href: "/notifications",
      description: "Configurar alertas",
      badge: unreadNotifications.length > 0 ? unreadNotifications.length.toString() : undefined
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: "Configuración",
      href: "/settings",
      description: "Preferencias de cuenta"
    }
  ];

  const isAdmin = user?.email === 'lhdecant@gmail.com';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-luxury-gold/10 transition-colors duration-200"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luxury-gold to-amber-600 flex items-center justify-center text-black font-semibold text-sm">
            {getUserInitials(user?.name || '', user?.email || '')}
          </div>
          {isAdmin && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <Crown className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">
            {getUserDisplayName(user)}
          </div>
          <div className="text-xs text-gray-400">
            {isAdmin ? 'Administrador' : 'Cliente'}
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 bg-charcoal border border-luxury-gold/20 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-luxury-gold/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-luxury-gold to-amber-600 flex items-center justify-center text-black font-bold text-lg">
                    {getUserInitials(user?.name || '', user?.email || '')}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {user?.email}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isAdmin 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-luxury-gold/20 text-luxury-gold'
                      }`}>
                        {isAdmin ? 'Administrador' : 'Cliente Premium'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="max-h-96 overflow-y-auto">
                {menuItems.map((item, index) => (
                  <Link key={index} href={item.href}>
                    <motion.div
                      whileHover={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                      className="flex items-center space-x-3 p-3 hover:bg-luxury-gold/5 transition-colors duration-200 cursor-pointer"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="text-luxury-gold">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold text-xs rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-luxury-gold/10">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  {logoutMutation.isPending ? "Cerrando sesión..." : "Cerrar Sesión"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 