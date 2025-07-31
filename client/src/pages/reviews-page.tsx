import React, { useState } from 'react';
import { buildApiUrl } from "../config/api";
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Edit,
  Trash2,
  Filter,
  Search,
  Plus,
  User,
  Calendar,
  Heart
} from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  perfumeId: string;
  perfumeName: string;
  perfumeBrand: string;
  rating: number;
  title: string;
  content: string;
  pros?: string;
  cons?: string;
  longevity: number;
  sillage: number;
  value: number;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt?: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface ReviewForm {
  perfumeId: string;
  rating: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
  longevity: number;
  sillage: number;
  value: number;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [formData, setFormData] = useState<ReviewForm>({
    perfumeId: '',
    rating: 5,
    title: '',
    content: '',
    pros: '',
    cons: '',
    longevity: 5,
    sillage: 5,
    value: 5,
  });

  // Obtener reseñas
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews', searchTerm, filterRating, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRating !== 'all') params.append('filter', filterRating);
      if (sortBy !== 'newest') params.append('sort', sortBy);
      
      const response = await fetch(buildApiUrl('/api/reviews?${params.toString()}'), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching reviews');
      return response.json();
    },
  });

  // Obtener perfumes para el formulario
  const { data: perfumes = [] } = useQuery<any[]>({
    queryKey: ['perfumes'],
    queryFn: async () => {
      const response = await fetch(buildApiUrl('/api/perfumes'), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching perfumes');
      return response.json();
    },
  });

  // Obtener reseñas del usuario
  const { data: userReviews = [] } = useQuery<Review[]>({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      const response = await fetch(buildApiUrl('/api/reviews/user/${user?.id}'), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching user reviews');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Mutación para crear reseña
  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewForm) => {
      const response = await fetch(buildApiUrl('/api/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al crear la reseña');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      setShowReviewForm(false);
      setFormData({
        perfumeId: '',
        rating: 5,
        title: '',
        content: '',
        pros: '',
        cons: '',
        longevity: 5,
        sillage: 5,
        value: 5,
      });
      toast({
        title: "Reseña creada",
        description: "Tu reseña se ha publicado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la reseña",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar reseña
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReviewForm> }) => {
      const response = await fetch(buildApiUrl('/api/reviews/${id}'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar la reseña');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      setEditingReview(null);
      toast({
        title: "Reseña actualizada",
        description: "Tu reseña se ha actualizado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la reseña",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar reseña
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(buildApiUrl('/api/reviews/${id}'), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al eliminar la reseña');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      toast({
        title: "Reseña eliminada",
        description: "Tu reseña se ha eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la reseña",
        variant: "destructive",
      });
    },
  });

  // Mutación para marcar como útil
  const helpfulMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(buildApiUrl('/api/reviews/${id}/helpful'), {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al marcar como útil');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview) {
      updateReviewMutation.mutate({ id: editingReview.id, data: formData });
    } else {
      createReviewMutation.mutate(formData);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      perfumeId: review.perfumeId,
      rating: review.rating,
      title: review.title,
      content: review.content,
      pros: review.pros || '',
      cons: review.cons || '',
      longevity: review.longevity,
      sillage: review.sillage,
      value: review.value,
    });
    setShowReviewForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      deleteReviewMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  const renderRatingBar = (value: number, label: string) => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 w-20">{label}:</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2">
        <div
          className="bg-luxury-gold h-2 rounded-full"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm text-gray-300 w-8">{value}/5</span>
    </div>
  );

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.perfumeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    return matchesSearch && matchesRating;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'helpful':
        return b.helpfulCount - a.helpfulCount;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-luxury-gold mb-2">Reseñas</h1>
          <p className="text-gray-400">Descubre lo que dicen nuestros clientes sobre los perfumes</p>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="bg-charcoal border-luxury-gold/20 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar reseñas..."
                  className="pl-10"
                />
              </div>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los ratings</SelectItem>
                  <SelectItem value="5">5 estrellas</SelectItem>
                  <SelectItem value="4">4 estrellas</SelectItem>
                  <SelectItem value="3">3 estrellas</SelectItem>
                  <SelectItem value="2">2 estrellas</SelectItem>
                  <SelectItem value="1">1 estrella</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="rating">Mejor rating</SelectItem>
                  <SelectItem value="helpful">Más útiles</SelectItem>
                </SelectContent>
              </Select>
              {user && (
                <Button onClick={() => setShowReviewForm(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Escribir Reseña
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formulario de Reseña */}
        {showReviewForm && (
          <Card className="bg-charcoal border-luxury-gold/20 mb-8">
            <CardHeader>
              <CardTitle className="text-luxury-gold">
                {editingReview ? 'Editar Reseña' : 'Escribir Nueva Reseña'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Perfume
                    </label>
                    <Select
                      value={formData.perfumeId}
                      onValueChange={(value) => setFormData({ ...formData, perfumeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar perfume" />
                      </SelectTrigger>
                      <SelectContent>
                        {perfumes.map((perfume) => (
                          <SelectItem key={perfume.id} value={perfume.id}>
                            {perfume.brand} - {perfume.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Rating General
                    </label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: i + 1 })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              i < formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Título
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título de tu reseña"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Reseña
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Comparte tu experiencia con este perfume..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Pros
                    </label>
                    <Textarea
                      value={formData.pros}
                      onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                      placeholder="Lo que te gustó..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Contras
                    </label>
                    <Textarea
                      value={formData.cons}
                      onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                      placeholder="Lo que no te gustó..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Evaluación Detallada</h4>
                  {renderRatingBar(formData.longevity, 'Duración')}
                  {renderRatingBar(formData.sillage, 'Proyección')}
                  {renderRatingBar(formData.value, 'Relación Precio/Calidad')}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
                  >
                    {createReviewMutation.isPending || updateReviewMutation.isPending
                      ? 'Guardando...'
                      : editingReview ? 'Actualizar Reseña' : 'Publicar Reseña'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReview(null);
                      setFormData({
                        perfumeId: '',
                        rating: 5,
                        title: '',
                        content: '',
                        pros: '',
                        cons: '',
                        longevity: 5,
                        sillage: 5,
                        value: 5,
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Reseñas */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-charcoal border-luxury-gold/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <Card key={review.id} className="bg-charcoal border-luxury-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.user.avatar} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{review.user.name}</span>
                          {review.isVerified && (
                            <Badge variant="default" className="text-xs">
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    {user && (user.id === review.userId || user.email === 'lhdecants@gmail.com') && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(review)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white">{review.perfumeBrand}</span>
                      <span className="text-gray-400">-</span>
                      <span className="text-luxury-gold">{review.perfumeName}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-white font-semibold">{review.rating}/5</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{review.title}</h3>
                    <p className="text-gray-300 mb-4">{review.content}</p>
                  </div>

                  {(review.pros || review.cons) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {review.pros && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <h4 className="font-semibold text-green-400 mb-2">Pros</h4>
                          <p className="text-sm text-gray-300">{review.pros}</p>
                        </div>
                      )}
                      {review.cons && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                          <h4 className="font-semibold text-red-400 mb-2">Contras</h4>
                          <p className="text-sm text-gray-300">{review.cons}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {renderRatingBar(review.longevity, 'Duración')}
                    {renderRatingBar(review.sillage, 'Proyección')}
                    {renderRatingBar(review.value, 'Relación Precio/Calidad')}
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => helpfulMutation.mutate(review.id)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Útil ({review.helpfulCount})
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MessageSquare className="w-4 h-4" />
                      Reseña verificada
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-charcoal border-luxury-gold/20">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No hay reseñas</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || filterRating !== 'all'
                    ? 'No se encontraron reseñas con los filtros aplicados'
                    : 'Sé el primero en escribir una reseña'}
                </p>
                {user && (
                  <Button onClick={() => setShowReviewForm(true)}>
                    Escribir Primera Reseña
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 