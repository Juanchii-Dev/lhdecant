import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useCart } from "../hooks/use-cart";
import { Button } from "./ui/button";

export default function Collections() {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});

  const { data: collections, isLoading } = useQuery<any[]>({
    queryKey: ["/api/collections"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: perfumes } = useQuery<any[]>({
    queryKey: ["/api/perfumes"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Don't render anything if no collections are available or if collections are disabled
  if (!collections || collections.length === 0) {
    return (
      <section id="colecciones" className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-6 py-2 mb-6">
              <span className="luxury-gold-text font-medium">Colecciones Exclusivas</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
              <span className="text-white">🎁 Descubrí Nuestras</span>
              <br />
              <span className="luxury-gold-text">Colecciones</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-light mb-6 text-gray-200">
              Curadas para cada momento, diseñadas para sorprender.
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explorá sets temáticos de 3 decants seleccionados con criterio experto, pensados para distintas ocasiones, estaciones o estilos personales.
            </p>
          </motion.div>

          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="glass-card rounded-2xl overflow-hidden relative border border-luxury-gold/20 p-12 max-w-2xl">
              <div className="text-center">
                <motion.div 
                  className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold mx-auto mb-6"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
                <motion.h3 
                  className="text-2xl font-semibold text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Cargando colecciones...
                </motion.h3>
                <motion.p 
                  className="text-gray-400 text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Preparando las mejores colecciones para ti.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const handleAddToCart = (collection: any, size: string) => {
    const price = getPrice(collection, size);
    // For collections, we'll add them as a special perfume with negative ID
    addToCart(-collection.id, size, price);
    toast({
      title: "¡Añadido al carrito!",
      description: `${collection.name} - ${size} - $${price}`,
    });
  };

  const getPrice = (collection: any, size: string) => {
    if (!collection.sizes || !collection.prices) {
      return collection.price.toString();
    }
    const sizeIndex = collection.sizes.indexOf(size);
    return sizeIndex !== -1 ? collection.prices[sizeIndex] : collection.prices[0];
  };

  const getCollectionDetails = (collection: any) => {
    if (!perfumes) return { perfumeDetails: [], totalOriginalPrice: 0 };
    
    const perfumeDetails = collection.perfumeIds.map((id: any, index: any) => {
      const perfume = perfumes.find((p: any) => p.id === id);
      const size = collection.perfumeSizes[index];
      if (!perfume) return null;
      
      // Find the price for the specific size
      const sizeIndex = perfume.sizes.indexOf(size);
      const price = sizeIndex !== -1 ? parseFloat(perfume.prices[sizeIndex]) : 0;
      
      return {
        perfume,
        size,
        price
      };
    }).filter((detail: any) => detail !== null);

    const totalOriginalPrice = perfumeDetails.reduce((sum: any, detail: any) => sum + detail.price, 0);
    
    return { perfumeDetails, totalOriginalPrice };
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "summer":
        return "ri-sun-line";
      case "winter":
        return "ri-snowflake-line";
      case "evening":
        return "ri-moon-line";
      case "fresh":
        return "ri-leaf-line";
      case "luxury":
        return "ri-vip-crown-line";
      default:
        return "ri-perfume-line";
    }
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case "summer":
        return "Verano";
      case "evening":
        return "Noche";
      case "fresh":
        return "Fresco";
      case "luxury":
        return "Lujo";
      default:
        return "Especial";
    }
  };

  const getPerfumeNames = (perfumeIds: any[]) => {
    if (!perfumes) return [];
    return perfumeIds
      .map((id: any) => perfumes.find((p: any) => p.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3); // Asegurar solo 3 perfumes
  };

  if (isLoading) {
    return (
      <section id="colecciones" className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-6 py-2 mb-6">
              <span className="luxury-gold-text font-medium">Colecciones Exclusivas</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
              <span className="text-white">🎁 Descubrí Nuestras</span>
              <br />
              <span className="luxury-gold-text">Colecciones</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-light mb-6 text-gray-200">
              Curadas para cada momento, diseñadas para sorprender.
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explorá sets temáticos de 3 decants seleccionados con criterio experto, pensados para distintas ocasiones, estaciones o estilos personales.
            </p>
          </motion.div>

          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="glass-card rounded-2xl overflow-hidden relative border border-luxury-gold/20 p-12 max-w-2xl">
              <div className="text-center">
                <motion.div 
                  className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold mx-auto mb-6"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
                <motion.h3 
                  className="text-2xl font-semibold text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Cargando colecciones...
                </motion.h3>
                <motion.p 
                  className="text-gray-400 text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Preparando las mejores colecciones para ti.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="colecciones" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-6 py-2 mb-6">
            <span className="luxury-gold-text font-medium">Colecciones Exclusivas</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
            <span className="text-white">🎁 Descubrí Nuestras</span>
            <br />
            <span className="luxury-gold-text">Colecciones</span>
          </h2>
          <h3 className="text-2xl md:text-3xl font-light mb-6 text-gray-200">
            Curadas para cada momento, diseñadas para sorprender.
          </h3>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explorá sets temáticos de 3 decants seleccionados con criterio experto, pensados para distintas ocasiones, estaciones o estilos personales.
          </p>
        </motion.div>

        {/* Collections Grid */}
        <div className="flex justify-center">
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
          {collections?.map((collection, index) => {
            const perfumeNames = getPerfumeNames(collection.perfumeIds);
            const { perfumeDetails, totalOriginalPrice } = getCollectionDetails(collection);
            const savings = totalOriginalPrice - parseFloat(collection.price);
            
            return (
              <motion.div
                key={collection.id}
                className="group perspective-1000"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
              >
                <div className="glass-card rounded-2xl overflow-hidden relative border border-luxury-gold/20 h-[600px] flex flex-col">
                  <div className="relative overflow-hidden">
                    <motion.img
                      src="https://i.imgur.com/Vgwv7Kh.png"
                      alt={collection.name}
                      className="w-full h-auto object-contain"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                    />
                    
                    {/* Perfume Names as Tags */}
                    <div className="absolute top-3 left-3 right-3">
                      <div className="flex flex-wrap gap-1">
                        {perfumeNames.map((name: any, idx: any) => (
                          <motion.div 
                            key={idx}
                            className="bg-black/80 backdrop-blur-sm text-luxury-gold border border-luxury-gold/50 px-2 py-1 rounded-full text-xs font-bold"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + (index * 0.1) + (idx * 0.1) }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {name}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between">
                        <span className="luxury-gold-text text-xs font-medium uppercase tracking-wide">
                          {getThemeLabel(collection.theme)}
                        </span>
                        <i className={`${getThemeIcon(collection.theme)} luxury-gold-text text-sm`}></i>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <h3 className="text-white font-playfair font-bold text-xl mb-2">
                      {collection.name}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-2">
                      {collection.description}
                    </p>
                    
                    {/* Show included perfumes with sizes */}
                    <div className="mb-4">
                      <h4 className="text-xs text-gray-400 mb-2">Incluye:</h4>
                      <div className="space-y-1">
                        {perfumeDetails.map((detail: any, idx: any) => (
                          <div key={idx} className="text-xs text-gray-300 flex justify-between">
                            <span>{detail.perfume.name}</span>
                            <span className="text-[#D4AF37]">{detail.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Size selection buttons */}
                    <motion.div 
                      className="mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="flex gap-2 mb-3">
                        {(collection.sizes || ['2ml', '4ml', '6ml']).map((size: any) => (
                          <Button
                            key={size}
                            variant={selectedSizes[collection.id] === size ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSizes(prev => ({ ...prev, [collection.id]: size }))}
                            className={`text-xs ${
                              selectedSizes[collection.id] === size 
                                ? "bg-[#D4AF37] text-black border-[#D4AF37]" 
                                : "border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                            }`}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Price and add to cart */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-2xl font-bold luxury-gold-text">
                          ${getPrice(collection, selectedSizes[collection.id] || (collection.sizes?.[0] || '2ml'))}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">/ {selectedSizes[collection.id] || (collection.sizes?.[0] || '2ml')}</span>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(collection, selectedSizes[collection.id] || (collection.sizes?.[0] || '2ml'))}
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
    </section>
  );
}