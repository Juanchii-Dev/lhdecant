import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { CartDrawer } from "./cart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import UserMenu from "./user-menu";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };



  // Función mejorada para Google OAuth
  const handleGoogle = async () => {
    setLoadingGoogle(true);
    try {
      // Redirección directa al servidor backend para Google OAuth
      window.location.href = '/api/auth/google';
    } catch (error) {
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo conectar con el servidor. Intenta más tarde.",
        variant: "destructive"
      });
      setLoadingGoogle(false);
    }
  };

  const handleForgot = () => {
    setForgot(true);
    toast({ title: "Recuperar contraseña", description: "Funcionalidad pendiente de backend." });
    setTimeout(() => setForgot(false), 2000);
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/98 backdrop-blur-xl border-b border-luxury-gold/30 shadow-xl shadow-black/50"
            : "bg-black/90 backdrop-blur-lg border-b border-luxury-gold/20"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-2xl font-montserrat font-bold text-luxury-gold">LH Decants</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {[
                { label: "Inicio", id: "inicio" },
                { label: "Perfumes", id: "perfumes" },
                { label: "Colecciones", id: "colecciones" },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="font-montserrat font-medium hover:text-luxury-gold transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.button>
              ))}
              <Link href="/catalogo">
                <motion.span
                  className="font-montserrat font-medium hover:text-luxury-gold transition-colors duration-300 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Catálogo Perfumes
                </motion.span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button 
                className="hover:text-luxury-gold transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="fas fa-search text-lg"></i>
              </motion.button>
              <CartDrawer />
              
              {/* Mostrar menú de usuario si está autenticado, sino botón de login */}
              {user ? (
                <UserMenu user={user} />
              ) : (
              <Link href="/auth">
                <Button variant="default" className="bg-luxury-gold text-black hover:bg-luxury-gold/80 font-semibold px-5 py-2 ml-2">
                  Acceso / Registro
                </Button>
              </Link>
              )}
              
              <motion.button
                className="md:hidden hover:text-luxury-gold transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="fas fa-bars text-lg"></i>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden mt-4 bg-charcoal rounded-lg p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {[
                { label: "Inicio", id: "inicio" },
                { label: "Perfumes", id: "perfumes" },
                { label: "Colecciones", id: "colecciones" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left py-2 hover:text-luxury-gold transition-colors duration-300"
                >
                  {item.label}
                </button>
              ))}
              <Link href="/catalogo">
                <span
                  className="block w-full text-left py-2 hover:text-luxury-gold transition-colors duration-300 cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Catálogo Perfumes
                </span>
              </Link>
            </motion.div>
          )}
        </nav>
      </motion.header>

      {/* Modal de login/registro eliminado */}
    </>
  );
}
