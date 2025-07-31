import React, { useState } from 'react';
import { buildApiUrl } from "../config/api";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, Star } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { getQueryFn } from '../lib/queryClient';

interface Favorite {
  id: string;
  perfumeId: string;
  userId: string;
  perfume: {
    id: string;
    name: string;
    brand: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating: number;
  };
  addedAt: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);

  // Obtener favoritos del usuario
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const response = await fetch(buildApiUrl('/api/favorites'), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching favorites');
      return response.json();
    },
    enabled: !!user?.id,
  }) as { data: Favorite[], isLoading: boolean };

  // Mutación para eliminar favoritos
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const response = await fetch(buildApiUrl(`/api/favorites/${favoriteId}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al eliminar favorito');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: "Favorito eliminado",
        description: "El perfume se eliminó de tus favoritos",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el favorito",
        variant: "destructive",
      });
    },
  });

  // Mutación para agregar al carrito
  const addToCartMutation = useMutation({
    mutationFn: async (perfumeId: string) => {
      const response = await fetch(buildApiUrl('/api/cart'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          perfumeId,
          quantity: 1,
          size: '5ml', // Tamaño por defecto
        }),
      });
      if (!response.ok) throw new Error('Error al agregar al carrito');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Agregado al carrito",
        description: "El perfume se agregó a tu carrito",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar al carrito",
        variant: "destructive",
      });
    },
  });

  // Eliminar múltiples favoritos
  const removeMultipleFavorites = async () => {
    if (selectedFavorites.length === 0) return;
    
    try {
      await Promise.all(
        selectedFavorites.map(id => removeFavoriteMutation.mutateAsync(id))
      );
      setSelectedFavorites([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar algunos favoritos",
        variant: "destructive",
      });
    }
  };

  // Seleccionar/deseleccionar todos
  const toggleSelectAll = () => {
    if (selectedFavorites.length === favorites.length) {
      setSelectedFavorites([]);
    } else {
      setSelectedFavorites(favorites.map((f: Favorite) => f.id));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-luxury-gold mb-4">Acceso requerido</h2>
          <p className="text-gray-400">Debes iniciar sesión para ver tus favoritos</p>
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
              <h1 className="text-4xl font-bold text-luxury-gold mb-2">Mis Favoritos</h1>
              <p className="text-gray-400">
                {favorites.length} perfume{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
            {favorites.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {selectedFavorites.length === favorites.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
                {selectedFavorites.length > 0 && (
                  <button
                    onClick={removeMultipleFavorites}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Eliminar ({selectedFavorites.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando favoritos...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Heart className="mx-auto h-16 w-16 text-luxury-gold mb-4" />
            <h3 className="text-xl font-semibold text-luxury-gold mb-2">No tienes favoritos</h3>
            <p className="text-gray-400 mb-6">
              Explora nuestro catálogo y guarda los perfumes que más te gusten
            </p>
            <a
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Explorar Catálogo
            </a>
          </motion.div>
        )}

        {/* Favorites Grid */}
        {!isLoading && favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {favorites.map((favorite: Favorite, index: number) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-charcoal rounded-lg border border-luxury-gold/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {/* Checkbox */}
                <div className="p-4 pb-0">
                  <input
                    type="checkbox"
                    checked={selectedFavorites.includes(favorite.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFavorites([...selectedFavorites, favorite.id]);
                      } else {
                        setSelectedFavorites(selectedFavorites.filter(id => id !== favorite.id));
                      }
                    }}
                    className="w-4 h-4 text-luxury-gold bg-gray-700 border-gray-600 rounded focus:ring-luxury-gold focus:ring-2"
                  />
                </div>

                {/* Perfume Image */}
                <div className="relative h-48 bg-gray-700">
                  {favorite.perfume.image ? (
                    <img
                      src={favorite.perfume.image}
                      alt={favorite.perfume.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-500 text-4xl">🫗</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => removeFavoriteMutation.mutate(favorite.id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Perfume Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-lg line-clamp-2">
                      {favorite.perfume.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2">{favorite.perfume.brand}</p>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(favorite.perfume.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-600'}
                      />
                    ))}
                    <span className="text-gray-400 text-sm ml-1">
                      ({favorite.perfume.rating || 0})
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {favorite.perfume.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gold font-bold text-lg">
                      ${favorite.perfume.price}
                    </span>
                    <button
                      onClick={() => addToCartMutation.mutate(favorite.perfume.id)}
                      disabled={addToCartMutation.isPending}
                      className="flex items-center gap-2 px-3 py-2 bg-luxury-gold text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                    >
                      <ShoppingCart size={16} />
                      Agregar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
} 