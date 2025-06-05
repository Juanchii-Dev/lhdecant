import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Collection } from "@shared/schema";

export default function Collections() {
  const { toast } = useToast();

  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const handleAddToCart = (collection: Collection) => {
    toast({
      title: "Colección agregada",
      description: `${collection.name} ha sido agregado al carrito`,
    });
  };

  const mainCollections = collections.filter(c => c.isNew || c.isPopular);
  const otherCollections = collections.filter(c => !c.isNew && !c.isPopular);

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "summer": return "fas fa-sun";
      case "winter": return "fas fa-snowflake";
      case "date_night": return "fas fa-moon";
      case "office": return "fas fa-briefcase";
      case "weekend": return "fas fa-mountain";
      default: return "fas fa-heart";
    }
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case "summer": return "COLECCIÓN VERANO 2024";
      case "winter": return "COLECCIÓN INVIERNO 2024";
      case "date_night": return "COLECCIÓN NOCHE";
      case "office": return "COLECCIÓN OFICINA";
      case "weekend": return "COLECCIÓN FIN DE SEMANA";
      default: return "COLECCIÓN ESPECIAL";
    }
  };

  if (isLoading) {
    return (
      <section id="colecciones" className="py-24 bg-charcoal">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-6 py-2 mb-6">
              <span className="text-luxury-gold font-medium">Colecciones Especiales</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
              Nuestras <span className="text-luxury-gold">Colecciones</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Descubre nuestras colecciones curadas especialmente para diferentes ocasiones y temporadas.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-black border-luxury-gold/20">
                <div className="h-80 bg-gray-700 animate-pulse rounded-t-lg"></div>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-4 bg-gray-700 rounded animate-pulse w-5/6"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
              className="group"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-black border-luxury-gold/20 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-80">
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      collection.isNew 
                        ? "bg-luxury-gold text-black" 
                        : "bg-gray-700 text-white"
                    }`}>
                      {collection.isNew ? "NUEVO" : "POPULAR"}
                    </div>
                  </div>
                  
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
                
                <CardContent className="p-8">
                  <p className="text-gray-400 mb-6">
                    {collection.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {/* We would need to fetch perfume details for the IDs, but for now showing placeholders */}
                    <div className="flex items-center text-sm">
                      <i className="fas fa-vial text-luxury-gold mr-3"></i>
                      <span className="text-gray-300">Perfume Premium 1</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <i className="fas fa-vial text-luxury-gold mr-3"></i>
                      <span className="text-gray-300">Perfume Premium 2</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <i className="fas fa-vial text-luxury-gold mr-3"></i>
                      <span className="text-gray-300">Perfume Premium 3</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-luxury-gold">
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
                    <Button
                      onClick={() => handleAddToCart(collection)}
                      className="bg-luxury-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-champagne transition-all duration-300 shadow-lg"
                    >
                      Comprar Pack
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-black border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300 p-6">
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
                    <Button
                      variant="ghost"
                      onClick={() => handleAddToCart(collection)}
                      className="text-luxury-gold hover:text-champagne transition-colors duration-300 p-0"
                    >
                      <i className="fas fa-arrow-right"></i>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
