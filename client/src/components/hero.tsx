import { motion } from "framer-motion";

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
            Descubre la elegancia en cada gota. Ofrecemos decants de perfumes 100% originales, 
            permitiéndote experimentar las fragancias más exclusivas sin compromiso.
          </motion.p>

          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <h2 className="text-lg text-luxury-gold mb-4 font-medium">✨ Nada de clones, solo originales ✨</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Cada decant proviene directamente de perfumes originales, garantizando la misma calidad 
              y experiencia olfativa que el frasco completo.
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
                <motion.i 
                  className="fas fa-arrow-right ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
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

      {/* Floating icons */}
      <motion.div 
        className="absolute top-1/4 left-10 text-luxury-gold/30"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <i className="fas fa-vial text-4xl"></i>
      </motion.div>
      <motion.div 
        className="absolute top-1/3 right-16 text-luxury-gold/20"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <i className="fas fa-flask text-3xl"></i>
      </motion.div>
      <motion.div 
        className="absolute bottom-1/4 left-1/4 text-luxury-gold/25"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <i className="fas fa-prescription-bottle text-2xl"></i>
      </motion.div>
    </section>
  );
}
