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

  // Estado de carga
  if (isLoading) {
    return (
      <section id="colecciones" className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando colecciones...</p>
          </div>
        </div>
      </section>
    );
  }

  // No hay colecciones
  if (!collections || collections.length === 0) {
    return (
      <section id="colecciones" className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-yellow-500 mb-4">
              Colecciones
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Descubre nuestras colecciones exclusivas de perfumes
            </p>
            <div className="bg-gray-900 border border-yellow-500/20 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-yellow-500 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No hay colecciones disponibles
                </h3>
                <p className="text-gray-400">
                  Pronto tendremos colecciones exclusivas para ti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Resto del componente para cuando hay colecciones
  const handleAddToCart = (collection: any, size: string) => {
    const price = getPrice(collection, size);
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
      .slice(0, 3);
  };

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
          <div className="inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-full px-6 py-2 mb-6">
            <span className="text-yellow-500 font-medium">Colecciones Exclusivas</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">🎁 Descubrí Nuestras</span>
            <br />
            <span className="text-yellow-500">Colecciones</span>
          </h2>
          <h3 className="text-2xl md:text-3xl font-light mb-6 text-gray-200">
            Curadas para cada momento, diseñadas para sorprender.
          </h3>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explorá sets temáticos de 3 decants seleccionados con criterio experto, pensados para distintas ocasiones, estaciones o estilos personales.
          </p>
        </motion.div>

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
                  className="group"
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
                  <div className="bg-gray-900 rounded-2xl overflow-hidden relative border border-yellow-500/20 h-[600px] flex flex-col">
                    <div className="relative overflow-hidden">
                      <img
                        src="https://i.imgur.com/Vgwv7Kh.png"
                        alt={collection.name}
                        className="w-full h-auto object-contain"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3 right-3">
                        <div className="flex flex-wrap gap-1">
                          {perfumeNames.map((name: any, idx: any) => (
                            <div 
                              key={idx}
                              className="bg-black/80 backdrop-blur-sm text-yellow-500 border border-yellow-500/50 px-2 py-1 rounded-full text-xs font-bold"
                            >
                              {name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                        <div className="flex items-center gap-2">
                          <i className={`ri ${getThemeIcon(collection.theme)} text-yellow-500`}></i>
                          <span className="text-sm text-gray-400">{getThemeLabel(collection.theme)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4 flex-1">
                        {collection.description}
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Precio original:</span>
                          <span className="text-gray-500 line-through">${totalOriginalPrice.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-500 font-bold">Precio colección:</span>
                          <span className="text-yellow-500 font-bold text-xl">${collection.price}</span>
                        </div>
                        
                        {savings > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-green-400">Ahorras:</span>
                            <span className="text-green-400 font-bold">${savings.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {collection.sizes?.map((size: string, idx: number) => (
                            <Button
                              key={size}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                              onClick={() => handleAddToCart(collection, size)}
                            >
                              {size} - ${getPrice(collection, size)}
                            </Button>
                          ))}
                        </div>
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