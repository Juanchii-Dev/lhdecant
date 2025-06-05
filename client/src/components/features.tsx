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
                className="bg-gradient-to-br from-charcoal to-black border border-luxury-gold/20 rounded-2xl p-8 h-full hover:border-luxury-gold/40 transition-all duration-150 relative overflow-hidden"
                whileHover={{ 
                  boxShadow: "0 0 40px hsl(var(--luxury-gold) / 0.4)",
                  scale: 1.02
                }}
                transition={{ duration: 0.15 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-luxury-gold to-champagne rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                  {feature.icon === "fas fa-certificate" && (
                    <div className="text-5xl text-black font-bold">✓</div>
                  )}
                  {feature.icon === "fas fa-shipping-fast" && (
                    <div className="text-5xl text-black">🚚</div>
                  )}
                  {feature.icon === "fas fa-award" && (
                    <div className="text-5xl text-black">🏆</div>
                  )}
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
