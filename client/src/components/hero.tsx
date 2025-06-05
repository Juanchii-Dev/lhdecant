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
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center hero-gradient"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1563170351-be82bc888aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800')"
        }}
      />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="inline-block gold-gradient p-1 rounded-full mb-6">
              <div className="bg-black px-6 py-2 rounded-full">
                <span className="text-luxury-gold font-medium">💯💧 100% Originales</span>
              </div>
            </div>
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl font-playfair font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="text-white">LH</span>
            <motion.span 
              className="text-luxury-gold"
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
              className="group bg-luxury-gold text-black px-8 py-4 rounded-lg font-semibold hover:bg-champagne transition-all duration-300 shadow-lg hover:shadow-xl"
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
              className="border-2 border-luxury-gold text-luxury-gold px-8 py-4 rounded-lg font-semibold hover:bg-luxury-gold hover:text-black transition-all duration-300"
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
