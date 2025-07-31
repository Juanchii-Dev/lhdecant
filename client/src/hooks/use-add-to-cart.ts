import { useAuth } from './use-auth';
import { buildApiUrl } from "../config/api";
import { useToast } from './use-toast';

export function useAddToCart() {
  const { user } = useAuth();
  const { toast } = useToast();

  const addToCart = async (perfumeId: string, size: string, price: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Necesitas estar registrado para agregar productos al carrito",
        variant: "destructive",
      });
      window.location.href = '/auth?message=login-required';
      return;
    }

    // Mostrar toast inmediato
    toast({
      title: "Agregando al carrito...",
      description: "El producto se está agregando",
    });

    try {
      const response = await fetch(buildApiUrl('/api/cart'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          perfumeId,
          size,
          price,
          quantity: 1,
        }),
      });

      if (response.ok) {
        toast({
          title: "Agregado al carrito",
          description: "El producto se ha agregado correctamente",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar al carrito');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    }
  };

  return { addToCart };
} 