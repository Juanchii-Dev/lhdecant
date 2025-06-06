import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Collection } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

export default function Collections() {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const queryClient = useQueryClient();

  const {
    data: collections,
    isLoading,
    error,
  } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (collection: Collection) => {
      console.log("Adding collection to cart:", collection);
      return collection;
    },
    onSuccess: () => {
      toast({
        title: "¡Añadido al carrito!",
        description: "La colección se ha añadido a tu carrito.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo añadir la colección al carrito.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (collection: Collection) => {
    addToCartMutation.mutate(collection);
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "summer":
        return "ri-sun-line";
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

  if (isLoading) {
    return (
      <section id="colecciones" className="py-24 bg-charcoal">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando colecciones...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="colecciones" className="py-24 bg-charcoal">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-red-400">Error cargando las colecciones</p>
          </div>
        </div>
      </section>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <section id="colecciones" className="py-24 bg-charcoal">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-400">No hay colecciones disponibles</p>
          </div>
        </div>
      </section>
    );
  }

  const mainCollections = collections.slice(0, 2);
  const otherCollections = collections.slice(2);

  return (
    <section id="colecciones" className="py-24 bg-charcoal">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-6 py-2 mb-6">
            <span className="text-luxury-gold font-medium">Colecciones Especiales</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
            Nuestras <span className="text-luxury-gold">Colecciones</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Descubre nuestras colecciones curadas especialmente para diferentes ocasiones y temporadas. 
            Cada pack incluye 3 decants cuidadosamente seleccionados.
          </p>
        </motion.div>

        {/* Main Collections */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {mainCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              className="group perspective-1000"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.02, 
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
            >
              <div className="glass-card rounded-3xl overflow-hidden relative">
                <div className="relative h-80 overflow-hidden">
                  <motion.img
                    src={collection.imageUrl}
                    alt={collection.name}
                    className="w-full h-full object-cover"
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
                  
                  <motion.div 
                    className="absolute top-4 right-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <motion.div 
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        collection.isNew 
                          ? "bg-luxury-gold text-black" 
                          : "bg-gray-700 text-white"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      {collection.isNew ? "NUEVO" : "POPULAR"}
                    </motion.div>
                  </motion.div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center mb-2">
                      <i className={`${getThemeIcon(collection.theme)} text-luxury-gold mr-2`}></i>
                      <span className="text-luxury-gold text-sm font-medium">
                        {getThemeLabel(collection.theme)}
                      </span>
                    </div>
                    <h3 className="text-2xl font-playfair font-bold mb-2">
                      {collection.name}
                    </h3>
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-gray-400 mb-6">
                    {collection.description}
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <h4 className="text-lg font-semibold mb-3">Incluye:</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {collection.perfumeIds && collection.perfumeIds.map((perfumeId, perfumeIndex) => (
                        <div key={perfumeIndex} className="flex items-center p-3 bg-charcoal/30 rounded-lg">
                          <div className="w-12 h-12 bg-luxury-gold/20 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-luxury-gold font-bold">{perfumeIndex + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">Perfume #{perfumeId}</div>
                            <div className="text-sm text-gray-400">5ml cada uno</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-luxury-gold">
                        ${collection.price}
                      </span>
                      {collection.originalPrice && (
                        <div className="ml-3">
                          <div className="text-sm text-gray-400 line-through">
                            ${collection.originalPrice}
                          </div>
                          <div className="text-xs text-luxury-gold">
                            Ahorra ${(parseFloat(collection.originalPrice) - parseFloat(collection.price)).toFixed(0)}
                          </div>
                        </div>
                      )}
                    </div>
                    <motion.button
                      onClick={() => handleAddToCart(collection)}
                      className="bg-luxury-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-champagne transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      Comprar Pack
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Collections Grid */}
        {otherCollections.length > 0 && (
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {otherCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
              >
                <div className="glass-card rounded-3xl p-6">
                  <div className="flex items-center mb-4">
                    <i className={`${getThemeIcon(collection.theme)} text-luxury-gold text-xl mr-3`}></i>
                    <h4 className="text-lg font-semibold group-hover:text-luxury-gold transition-colors duration-300">
                      {collection.name}
                    </h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    {collection.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-luxury-gold">
                      ${collection.price}
                    </span>
                    <motion.button
                      onClick={() => handleAddToCart(collection)}
                      className="bg-luxury-gold text-black px-4 py-2 rounded-lg font-semibold hover:bg-champagne transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      Comprar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}