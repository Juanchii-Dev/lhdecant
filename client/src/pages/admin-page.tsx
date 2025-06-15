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
  const [isCreateCollectionDialogOpen, setIsCreateCollectionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("perfumes");

  const { data: perfumes, isLoading } = useQuery<Perfume[]>({
    queryKey: ["/api/perfumes"],
  });

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: settings } = useQuery<Settings[]>({
    queryKey: ["/api/settings"],
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
        description: "El perfume se ha creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePerfumeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPerfume> }) => {
      const res = await apiRequest("PATCH", `/api/perfumes/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perfumes"] });
      setIsEditDialogOpen(false);
      setEditingPerfume(null);
      toast({
        title: "Perfume actualizado",
        description: "El perfume se ha actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePerfumeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/perfumes/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perfumes"] });
      toast({
        title: "Perfume eliminado",
        description: "El perfume se ha eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (collection: InsertCollection) => {
      const res = await apiRequest("POST", "/api/collections", collection);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      setIsCreateCollectionDialogOpen(false);
      toast({
        title: "Colección creada",
        description: "La colección se ha creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await apiRequest("POST", "/api/settings", { key, value });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Configuración actualizada",
        description: "La configuración se ha actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCreatePerfume = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Parse sizes and prices from form
    const sizesStr = formData.get("sizes") as string;
    const pricesStr = formData.get("prices") as string;
    const sizes = sizesStr.split(",").map(s => s.trim());
    const prices = pricesStr.split(",").map(p => p.trim());
    
    const perfume: InsertPerfume = {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      description: formData.get("description") as string,
      sizes,
      prices,
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
    
    // Parse sizes and prices from form
    const sizesStr = formData.get("sizes") as string;
    const pricesStr = formData.get("prices") as string;
    const sizes = sizesStr.split(",").map(s => s.trim());
    const prices = pricesStr.split(",").map(p => p.trim());
    
    const updates: Partial<InsertPerfume> = {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      description: formData.get("description") as string,
      sizes,
      prices,
      category: formData.get("category") as string,
      notes: (formData.get("notes") as string).split(",").map(note => note.trim()),
      imageUrl: formData.get("imageUrl") as string,
      rating: formData.get("rating") as string,
      inStock: formData.get("inStock") === "true",
    };
    updatePerfumeMutation.mutate({ id: editingPerfume.id, data: updates });
  };

  const handleCreateCollection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const collection: InsertCollection = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      theme: formData.get("theme") as string,
      perfumeIds: (formData.get("perfumeIds") as string).split(",").map(id => parseInt(id.trim())),
      perfumeSizes: (formData.get("perfumeSizes") as string).split(",").map(size => size.trim()),
      price: formData.get("price") as string,
      imageUrl: formData.get("imageUrl") as string,
    };
    createCollectionMutation.mutate(collection);
  };

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const collectionsEnabled = settings?.find(s => s.key === 'collections_enabled')?.value === 'true';

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
            <Button onClick={() => setLocation("/")} variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
              <Package className="w-4 h-4 mr-2" />
              Ver Tienda
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full bg-black/50 border border-[#D4AF37]/20">
            <TabsTrigger value="perfumes" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              <Package className="w-4 h-4 mr-2" />
              Perfumes
            </TabsTrigger>
            <TabsTrigger value="collections" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              <Package className="w-4 h-4 mr-2" />
              Colecciones
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfumes">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#D4AF37]">Gestión de Perfumes</h2>
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
                      Completa la información del perfume con tamaños configurables
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
                        <Label htmlFor="sizes" className="text-[#D4AF37]">Tamaños (separados por coma)</Label>
                        <Input name="sizes" required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="5ml, 10ml, 15ml" />
                      </div>
                      <div>
                        <Label htmlFor="prices" className="text-[#D4AF37]">Precios (separados por coma)</Label>
                        <Input name="prices" required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="15.00, 25.00, 35.00" />
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
                      <Label htmlFor="notes" className="text-[#D4AF37]">Notas (separadas por coma)</Label>
                      <Input name="notes" className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="Bergamota, Rosa, Vainilla" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de Imagen</Label>
                        <Input name="imageUrl" type="url" className="bg-black/50 border-[#D4AF37]/30 text-white" />
                      </div>
                      <div>
                        <Label htmlFor="rating" className="text-[#D4AF37]">Rating</Label>
                        <Input name="rating" className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="4.5" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" name="inStock" value="true" id="inStock" className="rounded border-[#D4AF37]/30" />
                      <Label htmlFor="inStock" className="text-[#D4AF37]">En Stock</Label>
                    </div>
                    <Button type="submit" disabled={createPerfumeMutation.isPending} className="w-full luxury-button">
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
                        <TableHead className="text-[#D4AF37]">Precios & Tamaños</TableHead>
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
                          <TableCell className="text-gray-300">
                            {perfume.sizes.map((size, index) => (
                              <div key={size} className="text-xs">
                                {size}: ${perfume.prices[index]}
                              </div>
                            ))}
                          </TableCell>
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
                    Actualiza la información del perfume
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
                        <Label htmlFor="sizes" className="text-[#D4AF37]">Tamaños (separados por coma)</Label>
                        <Input name="sizes" defaultValue={editingPerfume.sizes.join(", ")} required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="5ml, 10ml, 15ml" />
                      </div>
                      <div>
                        <Label htmlFor="prices" className="text-[#D4AF37]">Precios (separados por coma)</Label>
                        <Input name="prices" defaultValue={editingPerfume.prices.join(", ")} required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="15.00, 25.00, 35.00" />
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
                      <Label htmlFor="notes" className="text-[#D4AF37]">Notas (separadas por coma)</Label>
                      <Input name="notes" defaultValue={editingPerfume.notes.join(", ")} className="bg-black/50 border-[#D4AF37]/30 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de Imagen</Label>
                        <Input name="imageUrl" type="url" defaultValue={editingPerfume.imageUrl} className="bg-black/50 border-[#D4AF37]/30 text-white" />
                      </div>
                      <div>
                        <Label htmlFor="rating" className="text-[#D4AF37]">Rating</Label>
                        <Input name="rating" defaultValue={editingPerfume.rating || ""} className="bg-black/50 border-[#D4AF37]/30 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" name="inStock" value="true" id="inStockEdit" defaultChecked={editingPerfume.inStock || false} className="rounded border-[#D4AF37]/30" />
                      <Label htmlFor="inStockEdit" className="text-[#D4AF37]">En Stock</Label>
                    </div>
                    <Button type="submit" disabled={updatePerfumeMutation.isPending} className="w-full luxury-button">
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
          </TabsContent>

          <TabsContent value="collections">
            <Card className="bg-black/50 border-[#D4AF37]/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-[#D4AF37]">Gestión de Colecciones</CardTitle>
                    <CardDescription className="text-gray-400">
                      Administra las colecciones de perfumes
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateCollectionDialogOpen} onOpenChange={setIsCreateCollectionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="luxury-button">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Colección
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black border-[#D4AF37]/20 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-[#D4AF37]">Crear Nueva Colección</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Completa la información de la colección
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateCollection} className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-[#D4AF37]">Nombre</Label>
                          <Input name="name" required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-[#D4AF37]">Descripción</Label>
                          <Textarea name="description" required className="bg-black/50 border-[#D4AF37]/30 text-white" />
                        </div>
                        <div>
                          <Label htmlFor="theme" className="text-[#D4AF37]">Tema</Label>
                          <Input name="theme" required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="Verano, Elegancia, etc." />
                        </div>
                        <div>
                          <Label htmlFor="perfumeIds" className="text-[#D4AF37]">IDs de Perfumes (separados por coma)</Label>
                          <Input name="perfumeIds" required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="1, 2, 3" />
                        </div>
                        <div>
                          <Label htmlFor="perfumeSizes" className="text-[#D4AF37]">Tamaños de Perfumes (separados por coma)</Label>
                          <Input name="perfumeSizes" required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="5ml, 10ml, 5ml" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price" className="text-[#D4AF37]">Precio</Label>
                            <Input name="price" required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="45.00" />
                          </div>
                          <div>
                            <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de Imagen</Label>
                            <Input name="imageUrl" type="url" className="bg-black/50 border-[#D4AF37]/30 text-white" />
                          </div>
                        </div>
                        <Button type="submit" disabled={createCollectionMutation.isPending} className="w-full luxury-button">
                          {createCollectionMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            "Crear Colección"
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {collections && collections.length > 0 ? (
                  <div className="grid gap-4">
                    {collections.map((collection) => (
                      <div key={collection.id} className="border border-[#D4AF37]/20 rounded-lg p-4">
                        <h3 className="text-[#D4AF37] font-medium">{collection.name}</h3>
                        <p className="text-gray-400 text-sm">{collection.description}</p>
                        <p className="text-white mt-2">Precio: ${collection.price}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No hay colecciones creadas. Crea tu primera colección.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-black/50 border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-[#D4AF37]">Configuración del Sistema</CardTitle>
                <CardDescription className="text-gray-400">
                  Ajustes generales de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                  <div>
                    <h3 className="text-[#D4AF37] font-medium">Mostrar Sección Colecciones</h3>
                    <p className="text-gray-400 text-sm">Controla la visibilidad de las colecciones en el sitio web</p>
                  </div>
                  <Switch 
                    checked={collectionsEnabled}
                    onCheckedChange={(checked) => {
                      updateSettingMutation.mutate({ 
                        key: 'collections_enabled', 
                        value: checked.toString() 
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}