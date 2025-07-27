import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  Gift, 
  Copy, 
  CheckCircle, 
  Clock, 
  Percent, 
  DollarSign,
  Calendar,
  Tag,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  description: string;
  categories?: string[];
  brands?: string[];
}

interface UserCoupon {
  id: string;
  couponId: string;
  userId: string;
  usedAt?: string;
  isUsed: boolean;
  coupon: Coupon;
}

export default function CouponsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Obtener cupones disponibles
  const { data: availableCoupons = [], isLoading: couponsLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons', 'available'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Obtener cupones del usuario
  const { data: userCoupons = [], isLoading: userCouponsLoading } = useQuery<UserCoupon[]>({
    queryKey: ['user-coupons', user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  });

  // Mutación para aplicar cupón
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error('Cupón inválido o expirado');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setCouponCode('');
      toast({
        title: "¡Cupón aplicado!",
        description: `Descuento de ${data.discount} aplicado a tu carrito`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo aplicar el cupón",
        variant: "destructive",
      });
    },
  });

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      applyCouponMutation.mutate(couponCode.trim());
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Código copiado",
        description: "El código se copió al portapapeles",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCouponValid = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    return now >= validFrom && now <= validUntil && coupon.isActive && coupon.usedCount < coupon.usageLimit;
  };

  const getCouponValue = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`;
    }
    return `$${coupon.value}`;
  };

  const getCouponIcon = (coupon: Coupon) => {
    return coupon.type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Gift className="w-16 h-16 text-luxury-gold mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-luxury-gold mb-4">Códigos de Descuento</h1>
            <p className="text-gray-400 mb-8">Debes iniciar sesión para acceder a los cupones</p>
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
          <h1 className="text-4xl font-bold text-luxury-gold mb-2">Códigos de Descuento</h1>
          <p className="text-gray-400">Aprovecha nuestros cupones y ofertas especiales</p>
        </div>

        {/* Aplicar Cupón */}
        <Card className="bg-charcoal border-luxury-gold/20 mb-8">
          <CardHeader>
            <CardTitle className="text-luxury-gold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Aplicar Cupón
            </CardTitle>
            <CardDescription>Ingresa un código de descuento para aplicarlo a tu carrito</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Ingresa el código de descuento"
                className="flex-1"
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || applyCouponMutation.isPending}
              >
                {applyCouponMutation.isPending ? 'Aplicando...' : 'Aplicar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cupones Disponibles */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Gift className="h-6 w-6 text-luxury-gold" />
            Cupones Disponibles
          </h2>
          
          {couponsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-charcoal border-luxury-gold/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCoupons.map((coupon) => (
                <Card key={coupon.id} className="bg-charcoal border-luxury-gold/20 hover:border-luxury-gold/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCouponIcon(coupon)}
                        <CardTitle className="text-luxury-gold text-lg">{getCouponValue(coupon)}</CardTitle>
                      </div>
                      <Badge variant={isCouponValid(coupon) ? "default" : "secondary"}>
                        {isCouponValid(coupon) ? "Válido" : "Expirado"}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300">{coupon.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Código:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-black/50 px-2 py-1 rounded text-luxury-gold font-mono text-sm">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(coupon.code)}
                        >
                          {copiedCode === coupon.code ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Mínimo: ${coupon.minPurchase}</span>
                      </div>
                      {coupon.maxDiscount && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>Máximo: ${coupon.maxDiscount}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Válido hasta: {formatDate(coupon.validUntil)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Usos: {coupon.usedCount}/{coupon.usageLimit}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      disabled={!isCouponValid(coupon)}
                      onClick={() => {
                        setCouponCode(coupon.code);
                        handleApplyCoupon();
                      }}
                    >
                      Aplicar Cupón
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-charcoal border-luxury-gold/20">
              <CardContent className="p-8 text-center">
                <Gift className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No hay cupones disponibles</h3>
                <p className="text-gray-400">Vuelve más tarde para nuevas ofertas</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mis Cupones */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-luxury-gold" />
            Mis Cupones
          </h2>
          
          {userCouponsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-charcoal border-luxury-gold/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userCoupons.length > 0 ? (
            <div className="space-y-4">
              {userCoupons.map((userCoupon) => (
                <Card key={userCoupon.id} className="bg-charcoal border-luxury-gold/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getCouponIcon(userCoupon.coupon)}
                          <span className="text-luxury-gold font-semibold">
                            {getCouponValue(userCoupon.coupon)}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{userCoupon.coupon.description}</p>
                          <p className="text-gray-400 text-sm">Código: {userCoupon.coupon.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={userCoupon.isUsed ? "secondary" : "default"}>
                          {userCoupon.isUsed ? "Usado" : "Disponible"}
                        </Badge>
                        {userCoupon.usedAt && (
                          <p className="text-gray-400 text-sm mt-1">
                            Usado: {formatDate(userCoupon.usedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-charcoal border-luxury-gold/20">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No tienes cupones</h3>
                <p className="text-gray-400">Aplica un cupón de los disponibles arriba</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 