import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const quickLinks = [
    { label: "Perfumes Individuales", id: "perfumes" },
    { label: "Colecciones", id: "colecciones" },
  ];

  const socialLinks = [
    { 
      icon: "fab fa-instagram", 
      href: "https://instagram.com/lhdecant",
      image: "https://i.imgur.com/huoe1e0.png",
      alt: "Instagram"
    },
    { 
      icon: "fab fa-tiktok", 
      href: "https://tiktok.com/@lhdecants",
      image: "https://i.imgur.com/IAh3uj5.png", 
      alt: "TikTok"
    },
  ];

  return (
    <footer className="bg-black border-t border-luxury-gold/20 py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="flex items-center space-x-2 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center">
                <i className="fas fa-flask text-black text-lg"></i>
              </div>
              <span className="text-2xl font-playfair font-bold text-white">LH Decants</span>
            </motion.div>
            
            <p className="text-gray-400 mb-6 max-w-md">
              Tu destino para decants 100% originales de las mejores fragancias del mundo. 
              Calidad premium y autenticidad garantizada.
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-charcoal rounded-lg flex items-center justify-center hover:bg-luxury-gold transition-all duration-300 border border-luxury-gold/20"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img 
                    src={social.image} 
                    alt={social.alt}
                    className="w-6 h-6 object-contain"
                  />
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-luxury-gold mb-4">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2 text-gray-400">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="hover:text-luxury-gold transition-colors duration-300"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          {/* Admin Access */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-luxury-gold mb-4">
              Administración
            </h4>
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/auth"
                className="text-gray-400 hover:text-luxury-gold transition-colors duration-300"
              >
                Acceso Administrador
              </Link>
            </motion.div>
          </motion.div>
        </div>


        <motion.div 
          className="border-t border-luxury-gold/20 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 LH Decants. Todos los derechos reservados.
          </p>
          
          <motion.div 
            className="flex items-center space-x-2 text-sm text-gray-400"
            whileHover={{ scale: 1.05 }}
          >
            <i className="fas fa-shield-alt text-luxury-gold"></i>
            <span>100% Originales Garantizados</span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
