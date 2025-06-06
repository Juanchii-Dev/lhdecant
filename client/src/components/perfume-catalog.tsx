import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Perfume } from "@shared/schema";

export default function PerfumeCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: '5ml' | '10ml' }>({});
  const { toast } = useToast();

  const { data: perfumes = [], isLoading } = useQuery<Perfume[]>({
    queryKey: ["/api/perfumes"],
  });

  const filteredPerfumes = perfumes;

  const handleAddToCart = (perfume: Perfume, size: '5ml' | '10ml') => {
    const price = size === '5ml' ? (parseFloat(perfume.price) * 0.6).toFixed(2) : perfume.price;
    toast({
      title: "Agregado al carrito",
      description: `${perfume.name} ${size} - $${price}`,
    });
  };

  const handleSizeChange = (perfumeId: number, size: '5ml' | '10ml') => {
    setSelectedSizes(prev => ({ ...prev, [perfumeId]: size }));
  };

  const getPrice = (perfume: Perfume, size: '5ml' | '10ml') => {
    return size === '5ml' ? (parseFloat(perfume.price) * 0.6).toFixed(2) : perfume.price;
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
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-6 py-2 mb-6">
            <span className="text-luxury-gold font-medium">Catálogo Individual</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
            Perfumes <span className="text-luxury-gold">Individuales</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explora nuestra selección de decants individuales de las mejores fragancias del mundo. 
            Perfectos para probar antes de comprar el frasco completo.
          </p>
        </motion.div>



        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-charcoal border-luxury-gold/20">
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
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {filteredPerfumes.slice(0, 3).map((perfume, index) => {
              const selectedSize = selectedSizes[perfume.id] || '10ml';
              return (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, y: 30, rotateY: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.15, type: "spring", bounce: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    rotateY: 5,
                    transition: { duration: 0.3, type: "spring", bounce: 0.4 }
                  }}
                  className="group perspective-1000"
                >
                  <div className="glass-card shimmer-effect rounded-3xl overflow-hidden transition-all duration-500 transform-gpu hover:shadow-2xl hover:shadow-luxury-gold/20 relative">
                    <div className="relative h-72 overflow-hidden">
                      <motion.img
                        src={perfume.imageUrl}
                        alt={perfume.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                        whileHover={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)" }}
                        transition={{ duration: 0.3 }}
                      ></motion.div>
                      
                      {/* Floating particles effect */}
                      <div className="absolute inset-0 opacity-20">
                        <motion.div
                          className="absolute w-1 h-1 bg-luxury-gold rounded-full"
                          style={{ top: "20%", left: "30%" }}
                          animate={{ 
                            y: [0, -10, 0],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            delay: 0
                          }}
                        />
                        <motion.div
                          className="absolute w-1 h-1 bg-luxury-gold rounded-full"
                          style={{ top: "60%", right: "25%" }}
                          animate={{ 
                            y: [0, -15, 0],
                            opacity: [0.2, 0.8, 0.2]
                          }}
                          transition={{ 
                            duration: 2.5,
                            repeat: Infinity,
                            delay: 0.5
                          }}
                        />
                        <motion.div
                          className="absolute w-0.5 h-0.5 bg-luxury-gold rounded-full"
                          style={{ top: "40%", left: "70%" }}
                          animate={{ 
                            y: [0, -8, 0],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{ 
                            duration: 1.8,
                            repeat: Infinity,
                            delay: 1
                          }}
                        />
                      </div>
                      
                      {/* Brand badge */}
                      <motion.div 
                        className="absolute top-4 left-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <motion.div 
                          className="bg-luxury-gold/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs font-montserrat font-bold"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", bounce: 0.4 }}
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
                          className="bg-black/50 backdrop-blur-sm text-luxury-gold px-2 py-1 rounded-full text-xs flex items-center"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", bounce: 0.4 }}
                        >
                          <motion.span 
                            className="mr-1"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          >
                            ⭐
                          </motion.span>
                          {perfume.rating || "5.0"}
                        </motion.div>
                      </motion.div>
                    </div>
                    
                    <div className="p-6 space-y-4">
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
                          <motion.button
                            onClick={() => handleSizeChange(perfume.id, '5ml')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedSize === '5ml'
                                ? 'bg-luxury-gold text-black'
                                : 'bg-charcoal/50 text-gray-300 hover:bg-luxury-gold/20 hover:text-luxury-gold border border-luxury-gold/20'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                          >
                            5ml
                          </motion.button>
                          <motion.button
                            onClick={() => handleSizeChange(perfume.id, '10ml')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedSize === '10ml'
                                ? 'bg-luxury-gold text-black'
                                : 'bg-charcoal/50 text-gray-300 hover:bg-luxury-gold/20 hover:text-luxury-gold border border-luxury-gold/20'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                          >
                            10ml
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      {/* Price and add to cart */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-2xl font-bold text-luxury-gold">
                            ${getPrice(perfume, selectedSize)}
                          </span>
                          <span className="text-sm text-gray-400 ml-2">/ {selectedSize}</span>
                        </div>
                        <Button
                          onClick={() => handleAddToCart(perfume, selectedSize)}
                          className="bg-luxury-gold text-black hover:bg-champagne transition-all duration-300 font-montserrat font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl"
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

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Button
            className="bg-luxury-gold text-black px-8 py-4 rounded-lg font-montserrat font-semibold hover:bg-champagne transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Ver Catálogo Completo
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
