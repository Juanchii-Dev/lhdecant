import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Shield, 
  Package,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function AdminAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Credenciales específicas del administrador
    const adminEmail = "lhdecant@gmail.com";
    const adminPassword = "11qqaazz";

    // Simular delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === adminEmail && password === adminPassword) {
      setSuccess("¡Acceso autorizado! Redirigiendo al panel de administración...");
      
      // Guardar estado de admin en localStorage
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", email);
      
      // Simular redirección
      setTimeout(() => {
        setLocation("/admin");
      }, 2000);
    } else {
      setError("Credenciales incorrectas. Solo el administrador autorizado puede acceder.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link href="/" className="inline-block">
            <motion.div 
              className="flex items-center justify-center space-x-2 mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 gold-gradient rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-black" />
              </div>
              <span className="text-3xl font-playfair font-bold text-white">LH Decants</span>
            </motion.div>
          </Link>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <Shield className="w-8 h-8 text-luxury-gold" />
            <h2 className="text-2xl font-bold text-luxury-gold">
              Panel de Administración
            </h2>
          </motion.div>
          
          <p className="text-gray-400 text-sm">
            Acceso exclusivo para administradores autorizados
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-charcoal rounded-xl p-8 border border-luxury-gold/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email de Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-luxury-gold/30 rounded-lg text-white placeholder-gray-400 focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  placeholder="admin@lhdecant.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 bg-black/50 border border-luxury-gold/30 rounded-lg text-white placeholder-gray-400 focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-luxury-gold" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-luxury-gold" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm">{success}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-luxury-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Acceder al Panel</span>
                </div>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Link href="/">
            <motion.button
              className="flex items-center space-x-2 text-gray-400 hover:text-luxury-gold transition-colors duration-300 mx-auto"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Acceso restringido - Solo personal autorizado</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 