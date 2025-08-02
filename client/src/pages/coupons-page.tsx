import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../config/api';
import { 
  Gift, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Percent,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountPercentage: number;
  minimumAmount: number;
  maximumDiscount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

interface UserCoupon {
  id: string;
  couponId: string;
  code: string;
  description: string;
  discountPercentage: number;
  minimumAmount: number;
  maximumDiscount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usedAt: string;
  expiresAt: string;
}

export default function CouponsPage() {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener cupones disponibles
  const { data: availableCoupons = [] } = useQuery<Coupon[]>({
    queryKey: ['coupons', 'available'],
    queryFn: async () => {
      const response = await fetch('/api/coupons/available');
      if (!response.ok) throw new Error('Error obteniendo cupones');
      return response.json();
    },
  });

  // Obtener cupones del usuario
  const { data: userCoupons = [] } = useQuery<UserCoupon[]>({
    queryKey: ['coupons', 'user'],
    queryFn: async () => {
      const response = await fetch('/api/coupons/user');
      if (!response.ok) throw new Error('Error obteniendo cupones del usuario');
      return response.json();
    },
  });

  // Mutation para aplicar cupón
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/coupons/apply', { code });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Cupón aplicado",
        description: "El cupón se aplicó correctamente",
      });
      setCouponCode('');
      queryClient.invalidateQueries({ queryKey: ['coupons', 'user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al aplicar el cupón",
        variant: "destructive",
      });
    },
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de cupón",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      await applyCouponMutation.mutateAsync(couponCode);
    } finally {
      setIsApplying(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: "El código se copió al portapapeles",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Códigos de Descuento
          </h1>
          <p className="text-gray-400">
            Aprovecha nuestros cupones y promociones especiales
          </p>
        </div>

        {/* Apply Coupon Section */}
        <Card className="bg-charcoal border-luxury-gold/20">
          <CardHeader>
            <CardTitle className="text-luxury-gold flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Aplicar Cupón
            </CardTitle>
            <CardDescription className="text-gray-400">
              Ingresa un código de descuento para aplicarlo a tu próxima compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Ingresa el código del cupón"
                className="flex-1"
                maxLength={20}
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={isApplying || !couponCode.trim()}
                className="bg-luxury-gold text-black hover:bg-champagne"
              >
                {isApplying ? 'Aplicando...' : 'Aplicar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Coupons */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Gift className="w-6 h-6 text-luxury-gold" />
            Cupones Disponibles
          </h2>
          
          {availableCoupons.length === 0 ? (
            <Card className="bg-charcoal border-luxury-gold/20">
              <CardContent className="p-8 text-center">
                <Gift className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No hay cupones disponibles en este momento</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {availableCoupons.map((coupon) => (
                <Card key={coupon.id} className="bg-charcoal border-luxury-gold/20">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          {coupon.description}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-luxury-gold/20 text-luxury-gold">
                            {coupon.discountPercentage}% OFF
                          </Badge>
                          {coupon.isActive ? (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactivo
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                        className="text-luxury-gold hover:text-champagne"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex justify-between">
                        <span>Código:</span>
                        <span className="font-mono text-luxury-gold">{coupon.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mínimo de compra:</span>
                        <span>${coupon.minimumAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Descuento máximo:</span>
                        <span>${coupon.maximumDiscount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Válido hasta:</span>
                        <span className={isExpired(coupon.validUntil) ? 'text-red-400' : ''}>
                          {formatDate(coupon.validUntil)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usos restantes:</span>
                        <span>{coupon.usageLimit - coupon.usedCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* User Coupons */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-luxury-gold" />
            Mis Cupones
          </h2>
          
          {userCoupons.length === 0 ? (
            <Card className="bg-charcoal border-luxury-gold/20">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No tienes cupones aplicados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userCoupons.map((userCoupon) => (
                <Card key={userCoupon.id} className="bg-charcoal border-luxury-gold/20">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          {userCoupon.description}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-luxury-gold/20 text-luxury-gold">
                            {userCoupon.discountPercentage}% OFF
                          </Badge>
                          {isExpired(userCoupon.expiresAt) ? (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Expirado
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Válido
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex justify-between">
                        <span>Código:</span>
                        <span className="font-mono text-luxury-gold">{userCoupon.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mínimo de compra:</span>
                        <span>${userCoupon.minimumAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Descuento máximo:</span>
                        <span>${userCoupon.maximumDiscount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aplicado el:</span>
                        <span>{formatDate(userCoupon.usedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expira el:</span>
                        <span className={isExpired(userCoupon.expiresAt) ? 'text-red-400' : ''}>
                          {formatDate(userCoupon.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 