import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Perfume } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Star, ShoppingCart, Filter } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: perfumes, isLoading } = useQuery<Perfume[]>({
    queryKey: ["/api/perfumes"],
  });

  // Filter and sort perfumes
  const filteredPerfumes = perfumes?.filter((perfume) => {
    const matchesSearch = perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         perfume.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         perfume.notes.some(note => note.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || perfume.category === selectedCategory;
    const matchesBrand = selectedBrand === "all" || perfume.brand === selectedBrand;
    
    return matchesSearch && matchesCategory && matchesBrand;
  }) || [];

  const sortedPerfumes = [...filteredPerfumes].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "brand":
        return a.brand.localeCompare(b.brand);
      case "price-low":
        return parseFloat(a.prices[0]) - parseFloat(b.prices[0]);
      case "price-high":
        return parseFloat(b.prices[0]) - parseFloat(a.prices[0]);
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      default:
        return 0;
    }
  });

  // Get unique brands for filter
  const uniqueBrands = Array.from(new Set(perfumes?.map(p => p.brand) || [])).sort();

  const handleAddToCart = (perfume: Perfume, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    const price = perfume.prices[sizeIndex];
    addToCart(perfume.id, size, price);
    toast({
      title: "¡Añadido al carrito!",
      description: `${perfume.name} ${size} - $${price}`,
    });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "masculine": return "Masculino";
      case "feminine": return "Femenino";
      case "unisex": return "Unisex";
      case "niche": return "Nicho";
      default: return category;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-[#D4AF37] mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Catálogo Completo
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Explora nuestra colección completa de perfumes premium
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Filters */}
        <motion.div 
          className="bg-gray-900/50 rounded-2xl p-6 mb-8 border border-[#D4AF37]/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-xl font-bold text-[#D4AF37]">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar perfumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border-[#D4AF37]/30 text-white"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#D4AF37]/30">
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="masculine">Masculino</SelectItem>
                <SelectItem value="feminine">Femenino</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
                <SelectItem value="niche">Nicho</SelectItem>
              </SelectContent>
            </Select>

            {/* Brand Filter */}
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#D4AF37]/30">
                <SelectItem value="all">Todas las marcas</SelectItem>
                {uniqueBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#D4AF37]/30">
                <SelectItem value="name">Nombre A-Z</SelectItem>
                <SelectItem value="brand">Marca A-Z</SelectItem>
                <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="rating">Mejor Calificación</SelectItem>
              </SelectContent>
            </Select>

            {/* Results count */}
            <div className="flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                {sortedPerfumes.length} perfume{sortedPerfumes.length !== 1 ? 's' : ''} encontrado{sortedPerfumes.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Perfumes Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {sortedPerfumes.map((perfume, index) => (
            <motion.div
              key={perfume.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className="bg-gray-900/50 border-[#D4AF37]/20 h-full overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={perfume.imageUrl || "https://i.imgur.com/Vgwv7Kh.png"}
                    alt={perfume.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-[#D4AF37] text-black">
                      {getCategoryLabel(perfume.category)}
                    </Badge>
                  </div>
                  {!perfume.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="destructive">Agotado</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">
                        {perfume.name}
                      </h3>
                      <p className="text-[#D4AF37] text-sm">{perfume.brand}</p>
                    </div>
                    {perfume.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-300">{perfume.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {perfume.description}
                  </p>

                  {/* Notes */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Notas:</p>
                    <div className="flex flex-wrap gap-1">
                      {perfume.notes.slice(0, 3).map((note, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-[#D4AF37]/30 text-gray-300">
                          {note}
                        </Badge>
                      ))}
                      {perfume.notes.length > 3 && (
                        <Badge variant="outline" className="text-xs border-[#D4AF37]/30 text-gray-300">
                          +{perfume.notes.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Sizes and prices */}
                  <div className="space-y-2">
                    {perfume.sizes.map((size, idx) => (
                      <div key={size} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{size}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#D4AF37]">${perfume.prices[idx]}</span>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(perfume, size)}
                            disabled={!perfume.inStock}
                            className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/80 px-3 py-1 text-xs"
                          >
                            <ShoppingCart className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* No results */}
        {sortedPerfumes.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No se encontraron perfumes</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}