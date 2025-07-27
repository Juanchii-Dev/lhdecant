import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-luxury-gold/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-luxury-gold to-champagne rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
          >
            <AlertCircle className="h-12 w-12 text-black" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-6xl md:text-8xl font-playfair font-bold mb-4 luxury-text-shadow"
          >
            <span className="text-white">404</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-2xl md:text-3xl font-montserrat font-bold mb-4 luxury-gold-text"
          >
            Página No Encontrada
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-gray-400 mb-8 leading-relaxed"
          >
            La página que buscas no existe o ha sido movida. 
            Te invitamos a explorar nuestro catálogo de perfumes exclusivos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/">
              <Button className="luxury-button px-8 py-4 rounded-lg font-montserrat font-semibold">
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
            
            <Link href="/catalogo">
              <Button variant="outline" className="luxury-outline-button px-8 py-4 rounded-lg font-montserrat font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver Catálogo
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
