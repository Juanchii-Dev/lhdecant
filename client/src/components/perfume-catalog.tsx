import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Perfume } from "@shared/schema";

export default function PerfumeCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const { data: perfumes = [], isLoading } = useQuery<Perfume[]>({
    queryKey: ["/api/perfumes"],
  });

  const filteredPerfumes = perfumes.filter(
    (perfume) => selectedCategory === "all" || perfume.category === selectedCategory
  );

  const categories = [
    { id: "all", label: "Todos" },
    { id: "masculine", label: "Masculinos" },
    { id: "feminine", label: "Femeninos" },
    { id: "unisex", label: "Unisex" },
    { id: "niche", label: "Nicho" },
  ];

  const handleAddToCart = (perfume: Perfume) => {
    toast({
      title: "Agregado al carrito",
      description: `${perfume.name} ha sido agregado al carrito`,
    });
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

        {/* Categories Filter */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? "bg-luxury-gold text-black"
                  : "border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold hover:text-black"
              }`}
            >
              {category.label}
            </Button>
          ))}
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
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {filteredPerfumes.map((perfume, index) => (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="bg-charcoal border-luxury-gold/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={perfume.imageUrl}
                      alt={perfume.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-luxury-gold text-sm font-medium">
                        {perfume.brand}
                      </span>
                      {renderStars(perfume.rating || "5.0")}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-luxury-gold transition-colors duration-300">
                      {perfume.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4">
                      {perfume.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-luxury-gold">
                          ${perfume.price}
                        </span>
                        <span className="text-sm text-gray-400 ml-1">/ 10ml</span>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(perfume)}
                        className="bg-luxury-gold text-black hover:bg-champagne transition-colors duration-300"
                      >
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
            variant="outline"
            className="border-2 border-luxury-gold text-luxury-gold px-8 py-4 rounded-lg font-semibold hover:bg-luxury-gold hover:text-black transition-all duration-300"
          >
            Ver Más Perfumes
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
