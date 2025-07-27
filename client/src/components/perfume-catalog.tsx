import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { useCart } from "../hooks/use-cart";
import { Eye } from "lucide-react";
import { getQueryFn } from "../lib/queryClient";
import PerfumeCard from "./perfume-card";

export default function PerfumeCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();
  const { addToCart } = useCart();

  const { data: perfumes = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/perfumes/homepage"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const filteredPerfumes = perfumes;

  const handleAddToCart = (perfume: any, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    const price = sizeIndex !== -1 ? perfume.prices[sizeIndex] : '0.00';
    addToCart(perfume.id, size, price);
  };

  const handleSizeChange = (perfumeId: number, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [perfumeId]: size }));
  };

  const getPrice = (perfume: any, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    const originalPrice = sizeIndex !== -1 ? perfume.prices[sizeIndex] : '0.00';
    
    if (perfume.isOnOffer && perfume.discountPercentage) {
      const discount = parseFloat(perfume.discountPercentage);
      const discountedPrice = parseFloat(originalPrice) * (1 - discount / 100);
      return discountedPrice.toFixed(2);
    }
    
    return originalPrice;
  };

  const getOriginalPrice = (perfume: any, size: string) => {
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl">
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
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {filteredPerfumes.map((perfume, index) => (
                <PerfumeCard
                  key={perfume.id}
                  perfume={perfume}
                  index={index}
                  selectedSizes={selectedSizes}
                  onSizeChange={handleSizeChange}
                />
              ))}
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
          <Link href="/catalogo">
            <Button
              className="luxury-button px-8 py-4 rounded-lg font-montserrat font-semibold"
            >
              Ver Catálogo Completo
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
