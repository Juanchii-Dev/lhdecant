import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Perfume } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});
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

  const uniqueBrands = [...new Set(perfumes?.map(p => p.brand) || [])].sort();

  const handleSizeChange = (perfumeId: number, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [perfumeId]: size
    }));
  };

  const handleAddToCart = (perfume: Perfume, size: string) => {
    const price = getPrice(perfume, size);
    addToCart(perfume.id, size, price);
    toast({
      title: "Agregado al carrito",
      description: `${perfume.name} - ${size} agregado correctamente`,
    });
  };

  const getPrice = (perfume: Perfume, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    return sizeIndex !== -1 ? perfume.prices[sizeIndex] : perfume.prices[0];
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
      {/* Header Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-block bg-gradient-to-r from-luxury-gold/10 to-luxury-gold/5 border border-luxury-gold/30 rounded-full px-8 py-3 mb-8 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: "rgba(212, 175, 55, 0.5)" }}
              transition={{ duration: 0.3 }}
            >
              <span className="luxury-gold-text font-semibold tracking-wide text-sm uppercase">Catálogo Completo</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-8 luxury-text-shadow">
              Catálogo <span className="luxury-gold-text">Completo</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mb-6 text-gray-200">
              Explorá nuestra colección completa de perfumes premium
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Descubrí cada fragancia en nuestra cuidada selección, con filtros avanzados para encontrar tu perfume ideal.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Filters */}
        <motion.div 
          className="bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal backdrop-blur-sm rounded-3xl p-10 mb-12 border-2 border-luxury-gold/40 shadow-2xl shadow-luxury-gold/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          whileHover={{ 
            borderColor: "rgba(212, 175, 55, 0.6)",
            boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.15)"
          }}
        >
          <motion.div 
            className="flex items-center justify-center gap-3 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-luxury-gold to-luxury-gold/80 rounded-full flex items-center justify-center">
              <Filter className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl md:text-3xl font-playfair font-bold text-luxury-gold">Filtros de Búsqueda</h3>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Search */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxury-gold w-5 h-5" />
              <Input
                placeholder="Buscar perfumes, marcas, notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-black/70 border-2 border-luxury-gold/40 text-white placeholder-gray-300 rounded-xl focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
              />
            </motion.div>

            {/* Category Filter */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 text-lg bg-black/70 border-2 border-luxury-gold/40 text-white rounded-xl focus:border-luxury-gold transition-all duration-300">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border border-luxury-gold/40">
                  <SelectItem value="all" className="text-white hover:bg-luxury-gold/20">Todas las categorías</SelectItem>
                  <SelectItem value="masculine" className="text-white hover:bg-luxury-gold/20">Masculino</SelectItem>
                  <SelectItem value="feminine" className="text-white hover:bg-luxury-gold/20">Femenino</SelectItem>
                  <SelectItem value="unisex" className="text-white hover:bg-luxury-gold/20">Unisex</SelectItem>
                  <SelectItem value="niche" className="text-white hover:bg-luxury-gold/20">Nicho</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Brand Filter */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="h-14 text-lg bg-black/70 border-2 border-luxury-gold/40 text-white rounded-xl focus:border-luxury-gold transition-all duration-300">
                  <SelectValue placeholder="Todas las marcas" />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border border-luxury-gold/40">
                  <SelectItem value="all" className="text-white hover:bg-luxury-gold/20">Todas las marcas</SelectItem>
                  {Array.from(new Set(perfumes?.map(p => p.brand) || [])).sort().map(brand => (
                    <SelectItem key={brand} value={brand} className="text-white hover:bg-luxury-gold/20">{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Sort */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-14 text-lg bg-black/70 border-2 border-luxury-gold/40 text-white rounded-xl focus:border-luxury-gold transition-all duration-300">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border border-luxury-gold/40">
                  <SelectItem value="name" className="text-white hover:bg-luxury-gold/20">Nombre A-Z</SelectItem>
                  <SelectItem value="brand" className="text-white hover:bg-luxury-gold/20">Marca A-Z</SelectItem>
                  <SelectItem value="price-low" className="text-white hover:bg-luxury-gold/20">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-high" className="text-white hover:bg-luxury-gold/20">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="rating" className="text-white hover:bg-luxury-gold/20">Mejor Calificación</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>

          {/* Results count */}
          <motion.div 
            className="text-center bg-black/50 rounded-2xl py-4 px-6 border border-luxury-gold/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <span className="text-luxury-gold text-lg font-montserrat font-semibold">
              {sortedPerfumes.length} perfume{sortedPerfumes.length !== 1 ? 's' : ''} encontrado{sortedPerfumes.length !== 1 ? 's' : ''}
            </span>
          </motion.div>
        </motion.div>

        {/* Perfumes Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {sortedPerfumes.map((perfume, index) => {
            const selectedSize = selectedSizes[perfume.id] || perfume.sizes[0];
            
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
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={perfume.imageUrl || "https://i.imgur.com/Vgwv7Kh.png"}
                      alt={perfume.name}
                      className="w-full h-auto object-contain"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                      whileHover={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)" }}
                      transition={{ duration: 0.3 }}
                    ></motion.div>
                    
                    {/* Subtle glow effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-luxury-gold/5 via-transparent to-transparent opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                    
                    {/* Brand badge */}
                    <motion.div 
                      className="absolute top-4 left-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <motion.div 
                        className="bg-black/80 backdrop-blur-sm text-luxury-gold border border-luxury-gold/50 px-3 py-1 rounded-full text-xs font-montserrat font-bold"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        {perfume.brand}
                      </motion.div>
                    </motion.div>
                    
                    {/* Rating */}
                    <motion.div 
                      className="absolute top-4 right-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <motion.div 
                        className="bg-black/50 backdrop-blur-sm luxury-gold-text px-2 py-1 rounded-full text-xs flex items-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <span className="mr-1">⭐</span>
                        {perfume.rating || "5.0"}
                      </motion.div>
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
                        {perfume.sizes.map((size, sizeIndex) => (
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
                        <span className="text-2xl font-bold luxury-gold-text">
                          ${getPrice(perfume, selectedSize)}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">/ {selectedSize}</span>
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
      </div>
    </div>
  );
}