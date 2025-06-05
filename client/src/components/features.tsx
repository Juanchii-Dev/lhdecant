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
              <motion.div 
                className="bg-gradient-to-br from-charcoal to-black border border-luxury-gold/20 rounded-2xl p-8 h-full hover:border-luxury-gold/40 transition-all duration-300 relative overflow-hidden"
                whileHover={{ 
                  boxShadow: "0 0 40px hsl(var(--luxury-gold) / 0.3)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-luxury-gold to-champagne rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-black">
                    {feature.icon === "fas fa-certificate" && (
                      <g>
                        <path d="M12 2l3.09 6.26L22 9l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.87 2 10l6.91-1.74L12 2z" fill="currentColor"/>
                        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </g>
                    )}
                    {feature.icon === "fas fa-shipping-fast" && (
                      <g>
                        <path d="M4 8h11l2 2v6h-2c0 1.1-.9 2-2 2s-2-.9-2-2H7c0 1.1-.9 2-2 2s-2-.9-2-2H2v-6l2-2z" fill="currentColor"/>
                        <circle cx="5" cy="17" r="1.5" fill="currentColor"/>
                        <circle cx="13" cy="17" r="1.5" fill="currentColor"/>
                        <path d="M3 6h3m2 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    )}
                    {feature.icon === "fas fa-award" && (
                      <g>
                        <circle cx="12" cy="9" r="7" fill="currentColor"/>
                        <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                    )}
                  </svg>
                </div>
                <h3 className="text-xl font-montserrat font-bold mb-4 text-luxury-gold">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
