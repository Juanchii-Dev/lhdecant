import React from "react";
import { buildApiUrl } from "../config/api";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";

export default function AuthPage() {
  const { loginMutation, registerMutation, handleJWTFromURL } = useAuth();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const emailParam = params.get("email");
  const error = params.get("error");
  const message = params.get("message");
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">(token && emailParam ? "reset" : "login");
  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Manejar JWT desde URL (después de Google OAuth)
  React.useEffect(() => {
    if (token && !error) {
      const userParam = params.get("user");
      if (userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          handleJWTFromURL(token, userData);
          
          // Limpiar URL después de procesar
          window.history.replaceState({}, document.title, '/');
          return;
        } catch (error) {
          console.error('Error parsing user data from URL:', error);
        }
      }
    }
    
    if (error === "google" && message) {
      toast({
        title: "Error de Google OAuth",
        description: decodeURIComponent(message),
        variant: "destructive"
      });
    }
  }, [error, message, token, handleJWTFromURL, params, toast]);

  // Google login
  const handleGoogle = async () => {
    setLoadingGoogle(true);
    try {
      window.location.href = buildApiUrl('/api/auth/google');
    } catch (error) {
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo conectar con el servidor. Intenta más tarde.",
        variant: "destructive"
      });
      setLoadingGoogle(false);
    }
  };

  // Login/Register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate({ username: email, password });
    } else if (mode === "register") {
      registerMutation.mutate({ username: email, password });
    }
  };

  // Forgot password
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(buildApiUrl('/api/forgot-password'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      toast({ title: "Email enviado", description: "Revisa tu correo para el enlace de recuperación." });
    } else {
      toast({ title: "Error", description: "No se pudo enviar el email." });
    }
  };

  // Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(buildApiUrl('/api/reset-password'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailParam, token, password }),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido actualizada correctamente." });
      setMode("login");
    } else {
      toast({ title: "Error", description: "No se pudo actualizar la contraseña." });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-luxury-gold mb-2">LH Decants</h1>
          <p className="text-gray-400">
            {mode === "login" && "Inicia sesión en tu cuenta"}
            {mode === "register" && "Crea tu cuenta"}
            {mode === "forgot" && "Recupera tu contraseña"}
            {mode === "reset" && "Establece nueva contraseña"}
          </p>
        </div>

        <div className="bg-charcoal rounded-lg p-6 border border-luxury-gold/20">
          {mode === "login" && (
            <>
              <Button
                onClick={handleGoogle}
                disabled={loadingGoogle}
                className="w-full mb-4 bg-white text-black hover:bg-gray-100"
              >
                {loadingGoogle ? "Conectando..." : "Continuar con Google"}
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-charcoal text-gray-400">O continúa con email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-luxury-gold text-black hover:bg-luxury-gold/80"
                >
                  {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode("forgot")}
                  className="text-sm text-luxury-gold hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-gray-400">¿No tienes cuenta? </span>
                <button
                  onClick={() => setMode("register")}
                  className="text-luxury-gold hover:underline"
                >
                  Regístrate
                </button>
            </div>
            </>
          )}

          {mode === "register" && (
            <>
              <Button
                onClick={handleGoogle}
                disabled={loadingGoogle}
                className="w-full mb-4 bg-white text-black hover:bg-gray-100"
              >
                {loadingGoogle ? "Conectando..." : "Registrarse con Google"}
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-charcoal text-gray-400">O regístrate con email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-luxury-gold text-black hover:bg-luxury-gold/80"
                >
                  {registerMutation.isPending ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-gray-400">¿Ya tienes cuenta? </span>
                <button
                  onClick={() => setMode("login")}
                  className="text-luxury-gold hover:underline"
                >
                  Inicia sesión
                </button>
              </div>
            </>
            )}

          {mode === "forgot" && (
            <>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                    required
                  />
            </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-luxury-gold text-black hover:bg-luxury-gold/80"
                >
                  {loading ? "Enviando..." : "Enviar Email de Recuperación"}
                </Button>
          </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode("login")}
                  className="text-luxury-gold hover:underline"
                >
                  Volver al login
                </button>
            </div>
            </>
          )}

          {mode === "reset" && (
            <>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white focus:outline-none focus:border-luxury-gold"
                    required
                  />
            </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-luxury-gold text-black hover:bg-luxury-gold/80"
                >
                  {loading ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
          </form>
            </>
        )}
        </div>
      </div>
    </div>
  );
}