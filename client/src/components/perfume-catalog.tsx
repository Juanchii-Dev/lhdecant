import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import type { Perfume } from "@shared/schema";

export default function PerfumeCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();
  const { addToCart } = useCart();

  const { data: perfumes = [], isLoading } = useQuery<Perfume[]>({
    queryKey: ["/api/perfumes"],
  });

  const filteredPerfumes = perfumes;

  const handleAddToCart = (perfume: Perfume, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    const price = sizeIndex !== -1 ? perfume.prices[sizeIndex] : '0.00';
    addToCart(perfume.id, size, price);
  };

  const handleSizeChange = (perfumeId: number, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [perfumeId]: size }));
  };

  const getPrice = (perfume: Perfume, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    return sizeIndex !== -1 ? perfume.prices[sizeIndex] : '0.00';
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    return (
      <div className="flex text-luxury-gold">
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="fas fa-star text-xs"></i>
        ))}
        {hasHalfStar && <i className="fas fa-star-half-alt text-xs"></i>}
        {[...Array(5 - Math.ceil(numRating))].map((_, i) => (
          <i key={i} className="far fa-star text-xs"></i>
        ))}
      </div>
    );
  };

  return (
    <section id="perfumes" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-block bg-gradient-to-r from-luxury-gold/10 to-luxury-gold/5 border border-luxury-gold/30 rounded-full px-8 py-3 mb-8 backdrop-blur-sm"
            whileHover={{ scale: 1.05, borderColor: "rgba(212, 175, 55, 0.5)" }}
            transition={{ duration: 0.3 }}
          >
            <span className="luxury-gold-text font-semibold tracking-wide text-sm uppercase">Catálogo Individual</span>
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-playfair font-bold mb-8 luxury-text-shadow">
            Catálogo <span className="luxury-gold-text">Individual</span>
          </h2>
          <h3 className="text-2xl md:text-3xl font-light mb-6 text-gray-200">
            Descubrí tu próxima fragancia favorita.
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Explorá nuestra cuidada selección de decants individuales, ideales para conocer perfumes icónicos sin comprometerte al frasco completo.
          </p>
        </motion.div>



        {/* Products Grid */}
        <div className="flex justify-center">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-charcoal border-luxury-gold/20 h-[600px]">
                  <div className="w-full h-64 bg-gray-700 animate-pulse rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
            {filteredPerfumes.slice(0, 3).map((perfume, index) => {
              const selectedSize = selectedSizes[perfume.id] || perfume.sizes[0];
              return (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, y: 30, rotateY: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.15, type: "spring", bounce: 0.3 }}
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
                        src={perfume.imageUrl}
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
          )}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Button
            className="luxury-button px-8 py-4 rounded-lg font-montserrat font-semibold"
          >
            Ver Catálogo Completo
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
