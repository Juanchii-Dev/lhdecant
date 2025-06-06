import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function About() {
  const features = [
    {
      title: "100% Originales",
      description: "Cada decant proviene directamente de perfumes auténticos, sin excepciones.",
    },
    {
      title: "Calidad Premium",
      description: "Utilizamos frascos de vidrio de alta calidad y etiquetado profesional.",
    },
    {
      title: "Atención Personalizada",
      description: "Nuestro equipo está siempre disponible para ayudarte a encontrar tu fragancia perfecta.",
    },
  ];

  return (
    <section id="nosotros" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-6 py-2 mb-6">
              <span className="text-luxury-gold font-medium">Nuestra Historia</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-8">
              La Pasión por las <span className="text-luxury-gold">Fragancias</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              En LH Decants, creemos que todo el mundo merece experimentar las mejores fragancias del mundo. 
              Nuestra misión es hacer accesibles los perfumes más exclusivos a través de decants de alta calidad.
            </p>
            
            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center mr-4 mt-1"
                    whileHover={{ scale: 1.1 }}
                  >
                    <i className="fas fa-check text-black text-sm"></i>
                  </motion.div>
                  <div>
                    <h4 className="text-lg font-semibold text-luxury-gold mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-luxury-gold text-black px-8 py-4 rounded-lg font-semibold hover:bg-champagne transition-all duration-300 shadow-lg">
                Conoce Más Sobre Nosotros
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.img
              src="https://i.imgur.com/Vgwv7Kh.png"
              alt="Luxury perfume collection showcase"
              className="rounded-2xl shadow-2xl w-full"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Floating stats */}
            <motion.div 
              className="absolute -top-8 -right-8 bg-luxury-gold text-black p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <motion.div 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                  viewport={{ once: true }}
                >
                  500+
                </motion.div>
                <div className="text-sm">Fragancias</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-8 -left-8 bg-charcoal border border-luxury-gold/30 text-white p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <motion.div 
                  className="text-2xl font-bold text-luxury-gold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                  viewport={{ once: true }}
                >
                  1000+
                </motion.div>
                <div className="text-sm">Clientes Felices</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
