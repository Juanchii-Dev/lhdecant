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
    <section className="py-24 bg-charcoal">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ 
                  boxShadow: "0 0 30px hsl(var(--luxury-gold) / 0.5)" 
                }}
                transition={{ duration: 0.3 }}
              >
                <i className={`${feature.icon} text-black text-2xl`}></i>
              </motion.div>
              <h3 className="text-xl font-semibold mb-4 text-luxury-gold group-hover:text-champagne transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
