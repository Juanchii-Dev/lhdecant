import { motion } from "framer-motion";

export default function SocialMedia() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-luxury-gold/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-6 py-2 mb-6">
            <span className="luxury-gold-text font-medium">Redes Sociales</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
            <span className="text-white">Seguinos en Nuestras</span>
            <br />
            <span className="luxury-gold-text">Redes</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Mantente al día con nuestras últimas fragancias, consejos de perfumería y contenido exclusivo.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Instagram */}
          <motion.div 
            className="glass-card border border-luxury-gold/20 rounded-2xl p-8 h-[500px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.02,
              borderColor: "rgba(212, 175, 55, 0.4)"
            }}
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-luxury-gold to-champagne rounded-xl flex items-center justify-center">
                  <i className="fab fa-instagram text-black text-2xl"></i>
                </div>
                <span className="text-white text-xl font-semibold">Instagram</span>
              </div>
              <motion.a 
                href="https://www.instagram.com/lhdecant/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-luxury-gold hover:text-champagne transition-colors text-lg font-medium"
                whileHover={{ scale: 1.05 }}
              >
                @lhdecant
              </motion.a>
            </div>
            
            <div className="h-80 bg-gradient-to-br from-luxury-gold/10 to-luxury-gold/5 rounded-xl flex items-center justify-center border border-luxury-gold/20">
              <div className="text-center">
                <i className="fab fa-instagram text-luxury-gold text-6xl mb-4"></i>
                <p className="text-gray-400 mb-4">Descubre nuestro contenido en Instagram</p>
                <motion.a
                  href="https://www.instagram.com/lhdecant/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block luxury-outline-button px-6 py-3 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver Perfil
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* TikTok */}
          <motion.div 
            className="glass-card border border-luxury-gold/20 rounded-2xl p-8 h-[500px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.02,
              borderColor: "rgba(212, 175, 55, 0.4)"
            }}
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-luxury-gold to-champagne rounded-xl flex items-center justify-center">
                  <i className="fab fa-tiktok text-black text-2xl"></i>
                </div>
                <span className="text-white text-xl font-semibold">TikTok</span>
              </div>
              <motion.a 
                href="https://www.tiktok.com/@lhdecants" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-luxury-gold hover:text-champagne transition-colors text-lg font-medium"
                whileHover={{ scale: 1.05 }}
              >
                @lhdecants
              </motion.a>
            </div>
            
            <div className="h-80 bg-gradient-to-br from-luxury-gold/10 to-luxury-gold/5 rounded-xl flex items-center justify-center border border-luxury-gold/20">
              <div className="text-center">
                <i className="fab fa-tiktok text-luxury-gold text-6xl mb-4"></i>
                <p className="text-gray-400 mb-4">Sigue nuestros videos en TikTok</p>
                <motion.a
                  href="https://www.tiktok.com/@lhdecants"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block luxury-outline-button px-6 py-3 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver Perfil
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}