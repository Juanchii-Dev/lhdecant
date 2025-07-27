import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with golden lights */}
      <div className="absolute inset-0 hero-gradient">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-luxury-gold/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-luxury-gold/35 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-luxury-gold/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >


          <motion.h1 
            className="text-6xl md:text-8xl font-playfair font-bold mb-6 leading-tight luxury-text-shadow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="text-white">LH</span>
            <motion.span 
              className="luxury-gold-text"
              animate={{ 
                textShadow: [
                  "0 0 20px hsl(var(--luxury-gold) / 0.3)",
                  "0 0 40px hsl(var(--luxury-gold) / 0.6)",
                  "0 0 20px hsl(var(--luxury-gold) / 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Decants
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Elegancia en su forma más pura.
            <br />
            Explorá el arte del perfume sin comprar a ciegas: nuestros decants 100% originales te acercan a las fragancias más exclusivas del mundo, gota a gota.
          </motion.p>

          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <h2 className="text-lg text-luxury-gold mb-4 font-medium">✨ Solo originales. Nunca imitaciones.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Cada decant proviene directamente de frascos auténticos, preservando la calidad, la intensidad y el carácter de la fragancia tal como fue creada.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.button
              onClick={() => scrollToSection("perfumes")}
              className="luxury-outline-button px-8 py-4 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center">
                Explorar Catálogo
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="ml-2 w-4 h-4" />
                </motion.div>
              </span>
            </motion.button>

            <motion.button
              onClick={() => scrollToSection("colecciones")}
              className="luxury-outline-button px-8 py-4 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Colecciones
            </motion.button>
          </motion.div>
        </motion.div>
      </div>


    </section>
  );
}
