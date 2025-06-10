import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          toast({
            title: "Inicio de sesión exitoso",
            description: "Redirigiendo al panel de administrador...",
          });
          setTimeout(() => {
            setLocation("/admin");
          }, 1000);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/80 border-[#D4AF37]/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#D4AF37] font-bold">
            Panel de Administrador
          </CardTitle>
          <CardDescription className="text-gray-400">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#D4AF37]">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-black/50 border-[#D4AF37]/30 text-white focus:border-[#D4AF37]"
                placeholder="Usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#D4AF37]">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/50 border-[#D4AF37]/30 text-white focus:border-[#D4AF37]"
                placeholder="Contraseña"
              />
            </div>
            <Button
              type="submit"
              className="w-full luxury-button"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}