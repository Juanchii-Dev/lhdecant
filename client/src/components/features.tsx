import { motion } from "framer-motion";

export default function Features() {
  const features = [
    {
      icon: "fas fa-certificate",
      title: "💎 100% Originales",
      description: "Decants extraídos exclusivamente de perfumes auténticos. Sin imitaciones, sin atajos. Solo esencia pura.",
    },
    {
      icon: "fas fa-shipping-fast",
      title: "🚚 Envío Rápido",
      description: "Recibí tu fragancia en tiempo récord. Seguro, ágil y listo para que empieces a disfrutarla sin demoras.",
    },
    {
      icon: "fas fa-award",
      title: "🥂 Calidad Premium",
      description: "Cada decant se presenta en frascos de vidrio de alta calidad, con un acabado profesional que honra la fragancia que contiene.",
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
                className="glass-card luxury-hover-lift border border-luxury-gold/30 rounded-2xl p-8 h-full relative overflow-hidden"
                whileHover={{ 
                  borderColor: "rgba(212, 175, 55, 0.6)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-luxury-gold to-champagne rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                  {feature.icon === "fas fa-certificate" && (
                    <div className="text-6xl">💯</div>
                  )}
                  {feature.icon === "fas fa-shipping-fast" && (
                    <div className="text-6xl">🚚</div>
                  )}
                  {feature.icon === "fas fa-award" && (
                    <div className="text-6xl">🏆</div>
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
