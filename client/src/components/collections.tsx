import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Collection } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Collections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (collection: Collection) => {
      return apiRequest(`/api/cart/add`, "POST", {
        type: "collection",
        id: collection.id,
        name: collection.name,
        price: collection.price,
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Añadido al carrito!",
        description: "La colección se ha agregado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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

  const mainCollections = collections?.filter(c => c.isNew || c.isPopular) || [];
  const otherCollections = collections?.filter(c => !c.isNew && !c.isPopular) || [];

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
            <span className="text-white">Descubre Nuestras</span>
            <br />
            <span className="luxury-gold-text">Colecciones Curadas</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Descubre nuestras colecciones curadas especialmente para diferentes ocasiones y temporadas. 
            Cada pack incluye 3 decants cuidadosamente seleccionados.
          </p>
        </motion.div>

        {/* ESTILO 1: Cards Horizontales Modernas */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            <span className="luxury-gold-text">Estilo 1:</span> Cards Horizontales
          </h3>
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {mainCollections.map((collection, index) => (
              <motion.div
                key={`style1-${collection.id}`}
                className="group"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.01, 
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
              >
                <div className="glass-card rounded-2xl overflow-hidden relative flex flex-col lg:flex-row">
                  <div className="relative lg:w-2/5 h-64 lg:h-auto overflow-hidden">
                    <motion.img
                      src="https://i.imgur.com/Vgwv7Kh.png"
                      alt={collection.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"
                    />
                    
                    <motion.div 
                      className="absolute top-4 left-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <motion.div 
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          collection.isNew 
                            ? "luxury-button" 
                            : "bg-gray-800/80 text-white backdrop-blur-sm"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        {collection.isNew ? "NUEVO" : "POPULAR"}
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  <div className="lg:w-3/5 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="luxury-gold-text text-sm font-medium uppercase tracking-wide">
                          {getThemeLabel(collection.theme)}
                        </span>
                        <i className={`${getThemeIcon(collection.theme)} luxury-gold-text text-xl`}></i>
                      </div>
                      
                      <h3 className="text-white font-playfair font-bold text-3xl mb-4">
                        {collection.name}
                      </h3>
                      
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        {collection.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold luxury-gold-text">${collection.price}</span>
                        {collection.originalPrice && (
                          <span className="text-lg text-gray-500 line-through">${collection.originalPrice}</span>
                        )}
                        <span className="text-sm text-gray-400">
                          (3 perfumes)
                        </span>
                      </div>
                      
                      <motion.button
                        onClick={() => handleAddToCart(collection)}
                        className="luxury-button px-8 py-3 rounded-xl font-semibold"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        Agregar al Carrito
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ESTILO 2: Cards Verticales Compactas */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            <span className="luxury-gold-text">Estilo 2:</span> Cards Verticales Compactas
          </h3>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {mainCollections.map((collection, index) => (
              <motion.div
                key={`style2-${collection.id}`}
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
                <div className="glass-card rounded-2xl overflow-hidden relative border border-luxury-gold/20 h-full">
                  <div className="relative h-40 overflow-hidden">
                    <motion.img
                      src="https://i.imgur.com/Vgwv7Kh.png"
                      alt={collection.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                    />
                    
                    <motion.div 
                      className="absolute top-3 right-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <motion.div 
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          collection.isNew 
                            ? "luxury-button text-xs" 
                            : "bg-gray-800/80 text-white backdrop-blur-sm"
                        }`}
                      >
                        {collection.isNew ? "NUEVO" : "TOP"}
                      </motion.div>
                    </motion.div>
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between">
                        <span className="luxury-gold-text text-xs font-medium uppercase tracking-wide">
                          {getThemeLabel(collection.theme)}
                        </span>
                        <i className={`${getThemeIcon(collection.theme)} luxury-gold-text text-sm`}></i>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-white font-playfair font-bold text-xl mb-2">
                      {collection.name}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-2">
                      {collection.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xl font-bold luxury-gold-text">${collection.price}</span>
                        {collection.originalPrice && (
                          <span className="text-xs text-gray-500 line-through ml-2">${collection.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">3 perfumes</span>
                    </div>
                    
                    <motion.button
                      onClick={() => handleAddToCart(collection)}
                      className="w-full luxury-outline-button py-2 rounded-lg text-sm font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      Agregar al Carrito
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}