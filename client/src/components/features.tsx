import { motion } from "framer-motion";

export default function Features() {
  const features = [
    {
      icon: "fas fa-certificate",
      title: "100% Originales",
      description: "Cada decant proviene de perfumes auténticos. Sin imitaciones, sin clones.",
    },
    {
      icon: "fas fa-shipping-fast",
      title: "Envío Rápido",
      description: "Entrega segura y rápida para que disfrutes tus fragancias sin espera.",
    },
    {
      icon: "fas fa-award",
      title: "Calidad Premium",
      description: "Frascos de vidrio premium y etiquetado profesional para cada decant.",
    },
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-luxury-gold/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-luxury-gold/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-gradient-to-br from-charcoal to-black border border-luxury-gold/20 rounded-2xl p-8 h-full hover:border-luxury-gold/40 transition-all duration-300">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-luxury-gold to-champagne rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ 
                    boxShadow: "0 0 30px hsl(var(--luxury-gold) / 0.6)",
                    scale: 1.1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-black">
                    {feature.icon === "fas fa-certificate" && (
                      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                    )}
                    {feature.icon === "fas fa-shipping-fast" && (
                      <path d="M3 17H5.5L6.5 15H17.5L18.5 17H21V19H3V17ZM6 12L8 7H16L18 12H6ZM7.5 10H16.5L15.5 8H8.5L7.5 10Z" fill="currentColor"/>
                    )}
                    {feature.icon === "fas fa-award" && (
                      <path d="M12 8.5C13.38 8.5 14.5 7.38 14.5 6C14.5 4.62 13.38 3.5 12 3.5C10.62 3.5 9.5 4.62 9.5 6C9.5 7.38 10.62 8.5 12 8.5ZM12 10.5C9.79 10.5 8 8.71 8 6.5C8 4.29 9.79 2.5 12 2.5C14.21 2.5 16 4.29 16 6.5C16 8.71 14.21 10.5 12 10.5ZM12 11L15.09 17.26L22 18L17 23L18.18 30L12 26.77L5.82 30L7 23L2 18L8.91 17.26L12 11Z" fill="currentColor"/>
                    )}
                  </svg>
                </motion.div>
                <h3 className="text-xl font-montserrat font-bold mb-4 text-luxury-gold">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
