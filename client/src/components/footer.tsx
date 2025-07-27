import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Shield, 
  Truck, 
  CreditCard, 
  Star,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Heart,
  Award,
  Users,
  Package,
  Globe,
  MessageCircle,
  Zap,
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

  const socialLinks = [
    { 
      icon: <Instagram className="w-5 h-5" />,
      href: "https://instagram.com/lhdecant",
      label: "Instagram",
      followers: "15.2K"
    },
    { 
      icon: <Facebook className="w-5 h-5" />,
      href: "https://facebook.com/lhdecant",
      label: "Facebook",
      followers: "8.7K"
    },
    { 
      icon: <Twitter className="w-5 h-5" />,
      href: "https://twitter.com/lhdecant",
      label: "Twitter",
      followers: "12.1K"
    },
    { 
      icon: <Youtube className="w-5 h-5" />,
      href: "https://youtube.com/@lhdecant",
      label: "YouTube",
      followers: "6.3K"
    },
  ];

  const businessInfo = {
    name: "LH Decants",
    description: "Tu destino premium para decants 100% originales de las mejores fragancias del mundo. Especialistas en perfumes de lujo con autenticidad garantizada.",
    address: "Calle Gran Vía, 28, 28013 Madrid, España",
    phone: "+34 91 123 45 67",
    email: "info@lhdecant.es",
    hours: "24/7 - Atención Online",
    founded: "2020",
    customers: "50,000+",
    countries: "25+",
    satisfaction: "98%"
  };

  const features = [
    { icon: <Shield className="w-5 h-5" />, text: "100% Originales Garantizados" },
    { icon: <Truck className="w-5 h-5" />, text: "Envío Gratis +50€" },
    { icon: <CreditCard className="w-5 h-5" />, text: "Pago Seguro" },
    { icon: <Star className="w-5 h-5" />, text: "Calidad Premium" },
  ];

  const stats = [
    { number: "50K+", label: "Clientes Satisfechos" },
    { number: "25+", label: "Países" },
    { number: "500+", label: "Perfumes" },
    { number: "98%", label: "Satisfacción" },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
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
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-gray-400">
                  <MapPin className="w-4 h-4 text-luxury-gold" />
                  <span className="text-sm">{businessInfo.address}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="w-4 h-4 text-luxury-gold" />
                  <span className="text-sm">{businessInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="w-4 h-4 text-luxury-gold" />
                  <span className="text-sm">{businessInfo.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Clock className="w-4 h-4 text-luxury-gold" />
                  <span className="text-sm">{businessInfo.hours}</span>
                </div>
              </div>

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

            {/* Customer Service */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-luxury-gold mb-4">
                Atención al Cliente
              </h4>
              <ul className="space-y-3">
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
            </motion.div>

            {/* Account & Social */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-luxury-gold mb-4">
                Mi Cuenta
              </h4>
              <ul className="space-y-3 mb-6">
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

              <h4 className="text-lg font-semibold text-luxury-gold mb-4">
                Síguenos
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2 bg-charcoal rounded-lg hover:bg-luxury-gold/10 transition-all duration-300 border border-luxury-gold/20"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-luxury-gold">
                      {social.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-white text-xs font-medium">{social.label}</div>
                      <div className="text-gray-400 text-xs">{social.followers}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-8 border-t border-luxury-gold/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-2xl font-bold text-luxury-gold mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Footer */}
          <motion.div 
            className="border-t border-luxury-gold/20 pt-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
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
