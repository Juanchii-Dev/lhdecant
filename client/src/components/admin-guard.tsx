import { useEffect, useState } from "react";
import { useLocation } from "wouter";
// Removido useAuth para evitar conflictos con autenticación de admin
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Verificar estado de admin en el servidor
        const response = await fetch("/api/admin/status", {
          credentials: "include"
        });
        const data = await response.json();
        
        if (response.ok && data.isAdmin && data.email === "lhdecant@gmail.com") {
          setIsChecking(false);
        } else {
          // Verificar localStorage como fallback
          const isAdmin = localStorage.getItem("isAdmin") === "true";
          const adminEmail = localStorage.getItem("adminEmail");
          
          if (!isAdmin || adminEmail !== "lhdecant@gmail.com") {
            setLocation("/admin-auth");
            return;
          }
          
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        // Fallback a localStorage
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      const adminEmail = localStorage.getItem("adminEmail");
      
      if (!isAdmin || adminEmail !== "lhdecant@gmail.com") {
        setLocation("/admin-auth");
        return;
      }
      
      setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 text-luxury-gold animate-spin mx-auto mb-4" />
          <p className="text-luxury-gold font-medium">Verificando acceso de administrador...</p>
        </motion.div>
      </div>
    );
  }

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const adminEmail = localStorage.getItem("adminEmail");
  
  if (!isAdmin || adminEmail !== "lhdecant@gmail.com") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-gray-400 mb-6">
            Solo los administradores autorizados pueden acceder a esta sección.
          </p>
          <button
            onClick={() => setLocation("/admin-auth")}
            className="px-6 py-3 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Ir al Login de Admin
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
} 