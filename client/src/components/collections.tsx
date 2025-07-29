import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { useAddToCart } from "../hooks/use-add-to-cart";
import { useQuery } from "@tanstack/react-query";

export default function Collections() {
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();
  const { addToCart } = useAddToCart();

  const { data: collections, isLoading } = useQuery({
    queryKey: ["/api/collections"],
    queryFn: async () => {
      const response = await fetch('/api/collections');
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      return response.json();
    },
  });

  const handleSizeChange = (perfumeId: number, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [perfumeId]: size
    }));
  };

  const handleAddToCart = async (perfume: any, size: string) => {
    const price = getPrice(perfume, size);
    await addToCart(perfume.id.toString(), size, price);
  };

  const getPrice = (perfume: any, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    const originalPrice = sizeIndex !== -1 ? perfume.prices[sizeIndex] : perfume.prices[0];
    
    if (perfume.isOnOffer && perfume.discountPercentage) {
      const discount = parseFloat(perfume.discountPercentage);
      const discountedPrice = parseFloat(originalPrice) * (1 - discount / 100);
      return discountedPrice.toFixed(2);
    }
    
    return originalPrice;
  };

  const getOriginalPrice = (perfume: any, size: string) => {
    const sizeIndex = perfume.sizes.indexOf(size);
    return sizeIndex !== -1 ? perfume.prices[sizeIndex] : perfume.prices[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Cargando colecciones...</p>
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
            Colecciones Exclusivas
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Descubre nuestras colecciones curadas de perfumes de lujo. 
            Cada colección cuenta una historia única.
          </p>
        </motion.div>

        <div className="space-y-16">
          {collections?.map((collection: any, collectionIndex: number) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: collectionIndex * 0.2 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">{collection.name}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">{collection.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collection.perfumes?.map((perfume: any, index: number) => {
                  const selectedSize = selectedSizes[perfume.id];

                  return (
                    <motion.div
                      key={perfume.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: collectionIndex * 0.2 + index * 0.1,
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}