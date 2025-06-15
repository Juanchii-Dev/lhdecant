import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Collection, Perfume } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

export default function Collections() {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  // Don't render anything if no collections are available
  if (!collections || collections.length === 0) {
    return null;
  }

  const { data: perfumes } = useQuery<Perfume[]>({
    queryKey: ["/api/perfumes"],
  });

  const handleAddToCart = (collection: Collection) => {
    // For collections, we'll add them as a special perfume with negative ID
    addToCart(-collection.id, "collection", collection.price);
    toast({
      title: "¡Añadido al carrito!",
      description: `${collection.name} - $${collection.price}`,
    });
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

  const getPerfumeNames = (perfumeIds: number[]) => {
    if (!perfumes) return [];
    return perfumeIds
      .map(id => perfumes.find(p => p.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3); // Asegurar solo 3 perfumes
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
                        {perfumeNames.map((name, idx) => (
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
                      className="w-full luxury-button py-2 rounded-lg text-sm font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      Agregar al Carrito
                    </motion.button>
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