import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import type { Perfume } from "@shared/schema";

interface PerfumeCardProps {
  perfume: Perfume;
  index: number;
  selectedSizes?: { [key: number]: string };
  onSizeChange?: (perfumeId: number, size: string) => void;
}

export default function PerfumeCard({ 
  perfume, 
  index, 
  selectedSizes = {}, 
  onSizeChange 
}: PerfumeCardProps) {
  const [localSelectedSize, setLocalSelectedSize] = useState(perfume.sizes[0]);
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Use external size state if provided, otherwise use local state
  const selectedSize = selectedSizes[perfume.id] || localSelectedSize;

  const handleSizeChange = (perfumeId: number, size: string) => {
    if (onSizeChange) {
      onSizeChange(perfumeId, size);
    } else {
      setLocalSelectedSize(size);
    }
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
    const originalPrice = sizeIndex !== -1 ? perfume.prices[sizeIndex] : perfume.prices[0];
    
    if (perfume.isOnOffer && perfume.discountPercentage) {
      const discount = parseFloat(perfume.discountPercentage);
      const discountedPrice = parseFloat(originalPrice) * (1 - discount / 100);
      return discountedPrice.toFixed(2);
    }
    
    return originalPrice;
  };

  const getOriginalPrice = (perfume: Perfume, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    return sizeIndex !== -1 ? perfume.prices[sizeIndex] : perfume.prices[0];
  };

  return (
    <motion.div
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
          
          {/* Subtle glow effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-luxury-gold/5 via-transparent to-transparent opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          
          {/* Brand Badge */}
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
          
          {/* Offer Badge */}
          {perfume.isOnOffer && (
            <motion.div 
              className="absolute top-4 right-4"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <motion.div 
                className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                -{perfume.discountPercentage}%
              </motion.div>
            </motion.div>
          )}
        </div>
        
        {/* Content Section */}
        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
          {/* Title and Description */}
          <div>
            <h3 className="text-xl font-montserrat font-bold mb-2 text-white group-hover:text-luxury-gold transition-colors duration-300">
              {perfume.name}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {perfume.description}
            </p>
          </div>
          
          {/* Size Selector */}
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
          
          {/* Price and Add to Cart */}
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
}