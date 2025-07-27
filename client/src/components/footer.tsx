import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Shield, 
  Truck, 
  CreditCard, 
  Star,
  Heart,
  Award,
  Package,
  CheckCircle
} from "lucide-react";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const quickLinks = [
    { label: "Perfumes Individuales", href: "/catalogo" },
    { label: "Colecciones", href: "/catalogo" },
    { label: "Novedades", href: "/catalogo" },
    { label: "Ofertas Especiales", href: "/coupons" },
  ];

  const customerService = [
    { label: "Centro de Ayuda", href: "/contact" },
    { label: "Envíos y Devoluciones", href: "/contact" },
    { label: "Política de Privacidad", href: "/settings" },
    { label: "Términos y Condiciones", href: "/settings" },
  ];

  const accountLinks = [
    { label: "Mi Cuenta", href: "/profile" },
    { label: "Mis Pedidos", href: "/orders" },
    { label: "Favoritos", href: "/favorites" },
    { label: "Reseñas", href: "/reviews" },
  ];

  const businessInfo = {
    name: "LH Decants",
    description: "Tu destino premium para decants 100% originales de las mejores fragancias del mundo. Especialistas en perfumes de lujo con autenticidad garantizada.",
    founded: "2020"
  };

  const features = [
    { icon: <Shield className="w-5 h-5" />, text: "100% Originales Garantizados" },
    { icon: <Truck className="w-5 h-5" />, text: "Envío Gratis +50€" },
    { icon: <CreditCard className="w-5 h-5" />, text: "Pago Seguro" },
    { icon: <Star className="w-5 h-5" />, text: "Calidad Premium" },
  ];

  return (
    <footer className="bg-black border-t border-luxury-gold/20">
      {/* Newsletter Section */}
      <div className="bg-charcoal border-b border-luxury-gold/10 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-luxury-gold mb-2">
                ¡Únete a Nuestra Comunidad!
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Recibe ofertas exclusivas, novedades y consejos de fragancias directamente en tu email
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-4 py-3 bg-black/50 border border-luxury-gold/30 rounded-lg text-white placeholder-gray-400 focus:border-luxury-gold focus:outline-none"
                />
                <button className="px-6 py-3 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
                  Suscribirse
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Brand & Info */}
            <motion.div 
              className="lg:col-span-1"
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
                  <Package className="w-5 h-5 text-black" />
                </div>
                <span className="text-2xl font-playfair font-bold text-white">LH Decants</span>
              </motion.div>
              
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                {businessInfo.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-2 text-gray-400"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {feature.icon}
                    <span className="text-sm">{feature.text}</span>
                  </motion.div>
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
                Productos
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-luxury-gold transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Customer Service & Account */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-luxury-gold mb-4">
                Atención al Cliente
              </h4>
              <ul className="space-y-3 mb-6">
                {customerService.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-luxury-gold transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold text-luxury-gold mb-4">
                Mi Cuenta
              </h4>
              <ul className="space-y-3">
                {accountLinks.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-luxury-gold transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom Footer */}
          <motion.div 
            className="border-t border-luxury-gold/20 pt-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © 2025 LH Decants. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Fundado en {businessInfo.founded}</span>
                <span>•</span>
                <span>Madrid, España</span>
              </div>
            </div>
            
            <motion.div 
              className="flex items-center space-x-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-luxury-gold" />
                <span>Verificados por Google</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Award className="w-4 h-4 text-luxury-gold" />
                <span>Calidad Premium</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-luxury-gold" />
                <span>Hecho con ❤️ en España</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
