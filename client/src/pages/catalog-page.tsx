import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { useAddToCart } from "../hooks/use-add-to-cart";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "../config/api";
import { Perfume } from "../types/perfume";

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});
  
  const { toast } = useToast();
  const { addToCart } = useAddToCart();

  const { data: perfumes, isLoading, error } = useQuery({
    queryKey: ["/api/perfumes"],
    queryFn: async () => {
      console.log('🔄 Fetching perfumes...'); // Debug log
      const response = await fetch(buildApiUrl('/api/perfumes'));
      console.log('📡 Response status:', response.status); // Debug log
      if (!response.ok) {
        console.error('❌ Failed to fetch perfumes:', response.status, response.statusText); // Debug log
        throw new Error('Failed to fetch perfumes');
      }
      const data = await response.json();
      console.log('✅ Perfumes loaded:', data.length, 'items'); // Debug log
      return data;
    },
  });

  // Filter and sort perfumes
  const filteredPerfumes = perfumes?.filter((perfume: Perfume) => {
    // Only show perfumes that are in stock (stock check)
    if (!perfume.inStock) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = perfume.name.toLowerCase().includes(searchLower);
      const matchesBrand = perfume.brand.toLowerCase().includes(searchLower);
      const matchesDescription = perfume.description.toLowerCase().includes(searchLower);
      const matchesNotes = perfume.notes?.some((note: string) => note.toLowerCase().includes(searchLower)) || false;
      
      if (!matchesName && !matchesBrand && !matchesDescription && !matchesNotes) {
        return false;
      }
    }

    // Filter by brand
    if (selectedBrand && perfume.brand !== selectedBrand) {
      return false;
    }

    return true;
  }) || [];

  const sortedPerfumes = [...filteredPerfumes].sort((a: Perfume, b: Perfume) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "brand":
        return a.brand.localeCompare(b.brand);
      case "price-low":
        return a.prices[0] - b.prices[0];
      case "price-high":
        return b.prices[0] - a.prices[0];
      default:
        return 0;
    }
  });

  const uniqueBrands = perfumes?.reduce((brands: string[], perfume: Perfume) => {
    if (!brands.includes(perfume.brand)) {
      brands.push(perfume.brand);
    }
    return brands;
  }, []).sort() || [];

  const handleSizeChange = (perfumeId: number, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [perfumeId]: size
    }));
  };

  const handleAddToCart = async (perfume: Perfume, size: string) => {
    try {
      await addToCart({ productId: perfume.id.toString(), size });
      toast({
        title: "Producto agregado",
        description: "El producto se agregó correctamente al carrito",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al agregar al carrito",
        variant: "destructive",
      });
    }
  };

  const getPrice = (perfume: Perfume, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    const originalPrice = sizeIndex !== -1 ? perfume.prices[sizeIndex] : perfume.prices[0];
    
    if (perfume.isOnOffer && perfume.discountPercentage) {
      const discount = parseFloat(perfume.discountPercentage);
      const discountedPrice = originalPrice * (1 - discount / 100);
      return discountedPrice.toFixed(2);
    }
    
    return originalPrice.toString();
  };

  const getOriginalPrice = (perfume: Perfume, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    return sizeIndex !== -1 ? perfume.prices[sizeIndex] : perfume.prices[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">❌ Error al cargar perfumes</div>
          <div className="text-red-400 mb-4">{error.message}</div>
          <div className="text-gray-400 text-sm">
            <div>API URL: {buildApiUrl('/api/perfumes')}</div>
            <div>Backend Status: Verificando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-yellow-500 mb-4">
            Catálogo de Perfumes
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Descubre nuestra colección exclusiva de perfumes de lujo. 
            Cada fragancia cuenta una historia única.
          </p>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Buscar perfumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
              />

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">Todas las marcas</SelectItem>
                {uniqueBrands.map((brand: string) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="brand">Marca</SelectItem>
                <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Grid de perfumes */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {sortedPerfumes.map((perfume, index) => {
            const selectedSize = selectedSizes[perfume.id];
            
            return (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.1 + index * 0.05,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group perspective-1000"
              >
                <div className="glass-card luxury-hover-lift rounded-3xl overflow-hidden relative border border-luxury-gold/20 h-[600px] flex flex-col">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={perfume.imageUrl || "https://i.imgur.com/Vgwv7Kh.png"}
                      alt={perfume.name}
                      className="w-full h-auto object-contain"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    
                    {/* Image Overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                      whileHover={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)" }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Brand Badge */}
                    <motion.div 
                      className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <span className="text-xs font-medium text-white">{perfume.brand}</span>
                    </motion.div>
                  </div>
                  
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-montserrat font-bold mb-2 text-white group-hover:text-luxury-gold transition-colors duration-300">
                        {perfume.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {perfume.description}
                      </p>
                    </div>
                    
                    {/* Size selector */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="text-sm text-gray-300 font-medium">Tamaño:</div>
                      <div className="flex gap-2">
                        {perfume.sizes.map((size: any, sizeIndex: any) => (
                          <motion.button
                            key={size}
                            onClick={() => handleSizeChange(perfume.id, size)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm size-selector-button ${
                              selectedSize === size ? 'active' : ''
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            {size}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                    
                    {/* Price and add to cart */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        {perfume.isOnOffer ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold luxury-gold-text">
                                ${getPrice(perfume, selectedSize)}
                              </span>
                              <span className="text-lg text-gray-400 line-through">
                                ${getOriginalPrice(perfume, selectedSize)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-400">/ {selectedSize}</span>
                            {perfume.offerDescription && (
                              <span className="text-xs text-red-400 mt-1">
                                {perfume.offerDescription}
                              </span>
                            )}
                          </div>
                        ) : (
                          <>
                            <span className="text-2xl font-bold luxury-gold-text">
                              ${getPrice(perfume, selectedSize)}
                            </span>
                            <span className="text-sm text-gray-400 ml-2">/ {selectedSize}</span>
                          </>
                        )}
                      </div>
                      <Button
                        onClick={() => handleAddToCart(perfume, selectedSize)}
                        className="luxury-button font-montserrat font-semibold px-6 py-2 rounded-xl"
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {sortedPerfumes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-lg">No se encontraron perfumes con los filtros seleccionados.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}