import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Perfume, InsertPerfume, Collection, InsertCollection, Settings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Edit, Trash2, LogOut, Settings as SettingsIcon, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPerfume, setEditingPerfume] = useState<Perfume | null>(null);

  const { data: perfumes, isLoading } = useQuery<Perfume[]>({
    queryKey: ["/api/perfumes"],
  });

  const createPerfumeMutation = useMutation({
    mutationFn: async (perfume: InsertPerfume) => {
      const res = await apiRequest("POST", "/api/perfumes", perfume);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perfumes"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Perfume creado",
        description: "El perfume se ha agregado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el perfume",
        variant: "destructive",
      });
    },
  });

  const updatePerfumeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPerfume> }) => {
      const res = await apiRequest("PUT", `/api/perfumes/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perfumes"] });
      setIsEditDialogOpen(false);
      setEditingPerfume(null);
      toast({
        title: "Perfume actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfume",
        variant: "destructive",
      });
    },
  });

  const deletePerfumeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/perfumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perfumes"] });
      toast({
        title: "Perfume eliminado",
        description: "El perfume se ha eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el perfume",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  const handleCreatePerfume = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const perfume: InsertPerfume = {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      description: formData.get("description") as string,
      price5ml: formData.get("price5ml") as string,
      price10ml: formData.get("price10ml") as string,
      category: formData.get("category") as string,
      notes: (formData.get("notes") as string).split(",").map(note => note.trim()),
      imageUrl: formData.get("imageUrl") as string,
      rating: formData.get("rating") as string,
      inStock: formData.get("inStock") === "true",
    };
    createPerfumeMutation.mutate(perfume);
  };

  const handleUpdatePerfume = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPerfume) return;
    
    const formData = new FormData(e.currentTarget);
    const updates: Partial<InsertPerfume> = {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      description: formData.get("description") as string,
      price5ml: formData.get("price5ml") as string,
      price10ml: formData.get("price10ml") as string,
      category: formData.get("category") as string,
      notes: (formData.get("notes") as string).split(",").map(note => note.trim()),
      imageUrl: formData.get("imageUrl") as string,
      rating: formData.get("rating") as string,
      inStock: formData.get("inStock") === "true",
    };
    updatePerfumeMutation.mutate({ id: editingPerfume.id, data: updates });
  };

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#D4AF37]">Panel de Administrador</h1>
            <p className="text-gray-400">Gestión de perfumes - LH Decants</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#D4AF37]">Bienvenido, {user.username}</span>
            <Button onClick={handleLogout} variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#D4AF37]">Perfumes</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="luxury-button">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Perfume
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-[#D4AF37]/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-[#D4AF37]">Crear Nuevo Perfume</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Completa la información del perfume
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePerfume} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-[#D4AF37]">Nombre</Label>
                    <Input name="name" required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="brand" className="text-[#D4AF37]">Marca</Label>
                    <Input name="brand" required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-[#D4AF37]">Descripción</Label>
                  <Textarea name="description" required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price5ml" className="text-[#D4AF37]">Precio 5ml</Label>
                    <Input name="price5ml" type="number" step="0.01" required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="price10ml" className="text-[#D4AF37]">Precio 10ml</Label>
                    <Input name="price10ml" type="number" step="0.01" required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-[#D4AF37]">Categoría</Label>
                    <Select name="category" required>
                      <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#D4AF37]/30">
                        <SelectItem value="masculine">Masculino</SelectItem>
                        <SelectItem value="feminine">Femenino</SelectItem>
                        <SelectItem value="unisex">Unisex</SelectItem>
                        <SelectItem value="niche">Nicho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-[#D4AF37]">Notas (separadas por comas)</Label>
                  <Input name="notes" required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="Rosa, Vainilla, Pachulí" />
                </div>
                <div>
                  <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de Imagen</Label>
                  <Input name="imageUrl" required className="bg-black/50 border-[#D4AF37]/30 text-white" defaultValue="https://i.imgur.com/Vgwv7Kh.png" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating" className="text-[#D4AF37]">Rating</Label>
                    <Input name="rating" type="number" step="0.1" min="0" max="5" defaultValue="5.0" className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="inStock" className="text-[#D4AF37]">En Stock</Label>
                    <Select name="inStock" defaultValue="true">
                      <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#D4AF37]/30">
                        <SelectItem value="true">Sí</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full luxury-button" disabled={createPerfumeMutation.isPending}>
                  {createPerfumeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Perfume"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Perfumes Table */}
        <Card className="bg-black/80 border-[#D4AF37]/20 backdrop-blur-md">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#D4AF37]/20">
                    <TableHead className="text-[#D4AF37]">Nombre</TableHead>
                    <TableHead className="text-[#D4AF37]">Marca</TableHead>
                    <TableHead className="text-[#D4AF37]">Categoría</TableHead>
                    <TableHead className="text-[#D4AF37]">Precio 5ml</TableHead>
                    <TableHead className="text-[#D4AF37]">Precio 10ml</TableHead>
                    <TableHead className="text-[#D4AF37]">Stock</TableHead>
                    <TableHead className="text-[#D4AF37]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perfumes?.map((perfume) => (
                    <TableRow key={perfume.id} className="border-[#D4AF37]/10">
                      <TableCell className="font-medium text-white">{perfume.name}</TableCell>
                      <TableCell className="text-gray-300">{perfume.brand}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
                          {perfume.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">${perfume.price5ml}</TableCell>
                      <TableCell className="text-gray-300">${perfume.price10ml}</TableCell>
                      <TableCell>
                        <Badge variant={perfume.inStock ? "default" : "destructive"}>
                          {perfume.inStock ? "En Stock" : "Agotado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#D4AF37]/30 text-[#D4AF37]"
                            onClick={() => {
                              setEditingPerfume(perfume);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePerfumeMutation.mutate(perfume.id)}
                            disabled={deletePerfumeMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-black border-[#D4AF37]/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#D4AF37]">Editar Perfume</DialogTitle>
              <DialogDescription className="text-gray-400">
                Modifica la información del perfume
              </DialogDescription>
            </DialogHeader>
            {editingPerfume && (
              <form onSubmit={handleUpdatePerfume} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-[#D4AF37]">Nombre</Label>
                    <Input name="name" defaultValue={editingPerfume.name} required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="brand" className="text-[#D4AF37]">Marca</Label>
                    <Input name="brand" defaultValue={editingPerfume.brand} required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-[#D4AF37]">Descripción</Label>
                  <Textarea name="description" defaultValue={editingPerfume.description} required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price5ml" className="text-[#D4AF37]">Precio 5ml</Label>
                    <Input name="price5ml" type="number" step="0.01" defaultValue={editingPerfume.price5ml} required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="price10ml" className="text-[#D4AF37]">Precio 10ml</Label>
                    <Input name="price10ml" type="number" step="0.01" defaultValue={editingPerfume.price10ml} required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-[#D4AF37]">Categoría</Label>
                    <Select name="category" defaultValue={editingPerfume.category} required>
                      <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#D4AF37]/30">
                        <SelectItem value="masculine">Masculino</SelectItem>
                        <SelectItem value="feminine">Femenino</SelectItem>
                        <SelectItem value="unisex">Unisex</SelectItem>
                        <SelectItem value="niche">Nicho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-[#D4AF37]">Notas (separadas por comas)</Label>
                  <Input name="notes" defaultValue={editingPerfume.notes.join(", ")} required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                </div>
                <div>
                  <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de Imagen</Label>
                  <Input name="imageUrl" defaultValue={editingPerfume.imageUrl} required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating" className="text-[#D4AF37]">Rating</Label>
                    <Input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={editingPerfume.rating || "5.0"} className="bg-black/50 border-[#D4AF37]/30 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="inStock" className="text-[#D4AF37]">En Stock</Label>
                    <Select name="inStock" defaultValue={editingPerfume.inStock ? "true" : "false"}>
                      <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#D4AF37]/30">
                        <SelectItem value="true">Sí</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full luxury-button" disabled={updatePerfumeMutation.isPending}>
                  {updatePerfumeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar Perfume"
                  )}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}