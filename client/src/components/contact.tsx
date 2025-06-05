import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertContactMessageSchema } from "@shared/schema";

const contactFormSchema = insertContactMessageSchema.extend({
  subject: z.enum(["Consulta General", "Productos", "Pedido Personalizado", "Soporte"]),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "Consulta General",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await contactMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: "fab fa-whatsapp",
      title: "WhatsApp",
      value: "+1 (555) 123-4567",
      subtitle: "Respuesta inmediata",
    },
    {
      icon: "fas fa-envelope",
      title: "Email",
      value: "info@lhdecants.com",
      subtitle: "Respuesta en 24h",
    },
    {
      icon: "fab fa-instagram",
      title: "Instagram",
      value: "@lhdecants",
      subtitle: "Síguenos para novedades",
    },
  ];

  const businessHours = [
    { day: "Lunes - Viernes", hours: "9:00 AM - 7:00 PM" },
    { day: "Sábado", hours: "10:00 AM - 6:00 PM" },
    { day: "Domingo", hours: "12:00 PM - 5:00 PM" },
  ];

  return (
    <section id="contacto" className="py-24 bg-charcoal">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-6 py-2 mb-6">
            <span className="text-luxury-gold font-medium">Contáctanos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
            ¿Tienes <span className="text-luxury-gold">Preguntas?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Estamos aquí para ayudarte a encontrar tu fragancia perfecta. 
            No dudes en contactarnos para cualquier consulta.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-black border-luxury-gold/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-playfair font-bold mb-6 text-luxury-gold">
                  Envíanos un Mensaje
                </h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Nombre</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Tu nombre"
                                className="bg-charcoal border-luxury-gold/30 text-white focus:border-luxury-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="tu@email.com"
                                className="bg-charcoal border-luxury-gold/30 text-white focus:border-luxury-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Asunto</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-charcoal border-luxury-gold/30 text-white focus:border-luxury-gold">
                                <SelectValue placeholder="Selecciona un asunto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-charcoal border-luxury-gold/30">
                              <SelectItem value="Consulta General">Consulta General</SelectItem>
                              <SelectItem value="Productos">Productos</SelectItem>
                              <SelectItem value="Pedido Personalizado">Pedido Personalizado</SelectItem>
                              <SelectItem value="Soporte">Soporte</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Mensaje</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Cuéntanos cómo podemos ayudarte..."
                              className="bg-charcoal border-luxury-gold/30 text-white focus:border-luxury-gold resize-none min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-luxury-gold text-black py-4 rounded-lg font-semibold hover:bg-champagne transition-all duration-300 shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Mensaje
                          <i className="fas fa-paper-plane ml-2"></i>
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Contact Information */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="bg-black border-luxury-gold/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-playfair font-bold mb-6 text-luxury-gold">
                  Información de Contacto
                </h3>
                
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.div 
                        className="w-12 h-12 gold-gradient rounded-lg flex items-center justify-center mr-4"
                        whileHover={{ scale: 1.1 }}
                      >
                        <i className={`${info.icon} text-black text-xl`}></i>
                      </motion.div>
                      <div>
                        <h4 className="font-semibold text-luxury-gold mb-1">
                          {info.title}
                        </h4>
                        <p className="text-gray-400">{info.value}</p>
                        <p className="text-sm text-gray-500">{info.subtitle}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Business Hours */}
            <Card className="bg-black border-luxury-gold/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-playfair font-bold mb-4 text-luxury-gold">
                  Horario de Atención
                </h3>
                <div className="space-y-2 text-gray-400">
                  {businessHours.map((schedule, index) => (
                    <motion.div
                      key={index}
                      className="flex justify-between"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span>{schedule.day}</span>
                      <span>{schedule.hours}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
