import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
// Removido useAuth para evitar conflictos con autenticación de admin
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Upload } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Package, ShoppingCart, ShoppingBag, Percent, Plus, Edit, Trash2, 
  Download, UserCheck, BarChart3, Eye, CheckCircle, Grid, List,
  TrendingUp, Database, Loader2, Users, MessageSquare,
  FileText, Bell, Mail
} from "lucide-react";
import "../styles/admin-panel.css";

// Tipos
interface Perfume {
  id: string;
  name: string;
  brand: string;
  description: string;
  sizes: string[];
  prices: string[];
  category: string;
  notes: string[];
  imageUrl?: string;
  inStock?: boolean;
  isOnOffer?: boolean;
  discountPercentage?: string;
  offerDescription?: string;
}

interface InsertPerfume {
  name: string;
  brand: string;
  description: string;
  sizes: string[];
  prices: string[];
  category: string;
  notes: string[];
  imageUrl?: string;
  inStock?: boolean;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  theme: string;
  perfumeIds: string[];
  sizes?: string[];
  prices?: string[];
  imageUrl?: string;
}

interface InsertCollection {
  name: string;
  description: string;
  theme: string;
  perfumeIds: string[];
  sizes?: string[];
  prices?: string[];
  imageUrl?: string;
}

interface Order {
  id: string;
  customer_email: string;
  amount_total: number;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalPerfumes: number;
  ordersToday: number;
  totalCollections: number;
  perfumesOnOffer: number;
  totalOrders: number;
  totalRevenue: number;
}

interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
}

interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  monthlyRevenue: number;
  monthlyOrders: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateCollectionDialogOpen, setIsCreateCollectionDialogOpen] = useState(false);
  const [isEditCollectionDialogOpen, setIsEditCollectionDialogOpen] = useState(false);
  const [isImageUploadDialogOpen, setIsImageUploadDialogOpen] = useState(false);
  const [selectedPerfumeId, setSelectedPerfumeId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [editingPerfume, setEditingPerfume] = useState<Perfume | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Verificar autenticación de admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Verificar estado de admin en el servidor
        const response = await fetch("/api/admin/status", {
          credentials: "include"
        });
        const data = await response.json();
        
        if (!response.ok || !data.isAdmin || data.email !== "lhdecant@gmail.com") {
          // Verificar localStorage como fallback
          const isAdmin = localStorage.getItem("isAdmin") === "true";
          const adminEmail = localStorage.getItem("adminEmail");
          
          if (!isAdmin || adminEmail !== "lhdecant@gmail.com") {
            setLocation("/admin-auth");
            return;
          }
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
      }
    };

    checkAdminAuth();
  }, [setLocation]);

  // Verificar autenticación de admin usando localStorage como fallback
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const adminEmail = localStorage.getItem("adminEmail");
  
  if (!isAdmin || adminEmail !== "lhdecant@gmail.com") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-luxury-gold font-medium">Verificando acceso de administrador...</p>
        </div>
      </div>
    );
  }

  // Solo ejecutar queries si el usuario está autenticado
  const shouldFetch = isAdmin && adminEmail === "lhdecant@gmail.com";

  // Queries
  const { data: perfumes = [] } = useQuery<Perfume[]>({
    queryKey: ["perfumes"],
    queryFn: async () => {
      const response = await fetch("/api/perfumes", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching perfumes");
      return response.json();
    },
    enabled: shouldFetch
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/collections", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching collections");
      return response.json();
    },
    enabled: shouldFetch
  });

  const { data: dashboardStats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard-stats", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching dashboard stats");
      return response.json();
    },
    enabled: shouldFetch
  });

  const { data: recentOrders } = useQuery<Order[]>({
    queryKey: ["recent-orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/recent-orders", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching recent orders");
      return response.json();
    },
    enabled: shouldFetch
  });

  const { data: popularPerfumes } = useQuery<Perfume[]>({
    queryKey: ["popular-perfumes"],
    queryFn: async () => {
      const response = await fetch("/api/admin/popular-perfumes", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching popular perfumes");
      return response.json();
    },
    enabled: shouldFetch
  });

  const { data: contactMessages } = useQuery<ContactMessage[]>({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const response = await fetch("/api/admin/contact-messages", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching contact messages");
      return response.json();
    },
    enabled: shouldFetch
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/user-stats", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching user stats");
      return response.json();
    },
    enabled: shouldFetch
  });

  const { data: recentUsers = [] } = useQuery<any[]>({
    queryKey: ["recent-users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/recent-users", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching recent users");
      return response.json();
    },
    enabled: shouldFetch
  });

  const { data: salesStats } = useQuery<SalesStats>({
    queryKey: ["sales-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/sales-stats", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching sales stats");
      return response.json();
    },
    enabled: shouldFetch
  });

  // Session queries
  const { data: sessions = [] } = useQuery<any[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/sessions", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching sessions");
      return response.json();
    },
    enabled: shouldFetch
  });

  const { data: sessionStats } = useQuery<any>({
    queryKey: ["session-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/sessions-stats", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error fetching session stats");
      return response.json();
    },
    enabled: shouldFetch
  });

  // Mutations
  const createPerfumeMutation = useMutation({
    mutationFn: async (data: InsertPerfume) => {
      const response = await fetch("/api/perfumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error creating perfume");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfumes"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Perfume creado exitosamente", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al crear perfume", variant: "destructive" });
    }
  });

  const updatePerfumeMutation = useMutation({
    mutationFn: async (data: { id: string } & Partial<InsertPerfume>) => {
      const response = await fetch(`/api/perfumes/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error updating perfume");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfumes"] });
      setIsEditDialogOpen(false);
      setEditingPerfume(null);
      toast({ title: "Perfume actualizado exitosamente", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al actualizar perfume", variant: "destructive" });
    }
  });

  const deletePerfumeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/perfumes/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error deleting perfume");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfumes"] });
      toast({ title: "Perfume eliminado exitosamente", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al eliminar perfume", variant: "destructive" });
    }
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: InsertCollection) => {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error creating collection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setIsCreateCollectionDialogOpen(false);
      toast({ title: "Colección creada exitosamente", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al crear colección", variant: "destructive" });
    }
  });

  const updateCollectionMutation = useMutation({
    mutationFn: async (data: { id: string } & Partial<InsertCollection>) => {
      const response = await fetch(`/api/collections/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error updating collection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setIsEditCollectionDialogOpen(false);
      setEditingCollection(null);
      toast({ title: "Colección actualizada exitosamente", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al actualizar colección", variant: "destructive" });
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error updating setting");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Configuración actualizada", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al actualizar configuración", variant: "destructive" });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/orders/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: data.status })
      });
      if (!response.ok) throw new Error("Error updating order status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-orders"] });
      toast({ title: "Estado del pedido actualizado", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al actualizar estado del pedido", variant: "destructive" });
    }
  });

  const markMessageAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/contact-messages/${id}/read`, {
        method: "PATCH",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error marking message as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      toast({ title: "Mensaje marcado como leído", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al marcar mensaje como leído", variant: "destructive" });
    }
  });

  // Session mutations
  const deleteSessionMutation = useMutation({
    mutationFn: async (sid: string) => {
      const response = await fetch(`/api/admin/sessions/${sid}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error deleting session");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session-stats"] });
      toast({ title: "Sesión eliminada exitosamente", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al eliminar sesión", variant: "destructive" });
    }
  });

  const cleanupSessionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/sessions/cleanup", {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error cleaning up sessions");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session-stats"] });
      toast({ 
        title: `Limpieza completada: ${data.deletedCount} sesiones eliminadas`, 
        variant: "default" 
      });
    },
    onError: () => {
      toast({ title: "Error al limpiar sesiones", variant: "destructive" });
    }
  });

  // Handlers
  const handleLogout = () => {
    // Limpiar sesión de admin
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    setLocation("/");
  };

  const handleCreatePerfume = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const sizes = formData.get("sizes") as string;
    const prices = formData.get("prices") as string;
    const notes = formData.get("notes") as string;
    const inStock = formData.get("inStock") === "true";

    createPerfumeMutation.mutate({
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      description: formData.get("description") as string,
      sizes: sizes.split(",").map((s: string) => s.trim()).filter((s: string) => s),
      prices: prices.split(",").map((p: string) => p.trim()).filter((p: string) => p),
      category: formData.get("category") as string,
      notes: notes ? notes.split(",").map((n: string) => n.trim()).filter((n: string) => n) : [],
      imageUrl: formData.get("imageUrl") as string,
      inStock
    });
  };

  const handleUpdatePerfume = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPerfume) return;
    
    const formData = new FormData(e.currentTarget);
    const sizes = formData.get("sizes") as string;
    const prices = formData.get("prices") as string;
    const notes = formData.get("notes") as string;
    const inStock = formData.get("inStock") === "true";

    updatePerfumeMutation.mutate({
      id: editingPerfume.id,
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      description: formData.get("description") as string,
      sizes: sizes.split(",").map((s: string) => s.trim()).filter((s: string) => s),
      prices: prices.split(",").map((p: string) => p.trim()).filter((p: string) => p),
      category: formData.get("category") as string,
      notes: notes ? notes.split(",").map((n: string) => n.trim()).filter((n: string) => n) : [],
      imageUrl: formData.get("imageUrl") as string,
      inStock
    });
  };

  const handleCreateCollection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const perfumeIds = formData.get("perfumeIds") as string;
    const sizes = formData.get("sizes") as string;
    const prices = formData.get("prices") as string;

    createCollectionMutation.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      theme: formData.get("theme") as string,
      perfumeIds: perfumeIds ? perfumeIds.split(",").map((id: string) => id.trim()).filter((id: string) => id) : [],
      sizes: sizes ? sizes.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [],
      prices: prices ? prices.split(",").map((p: string) => p.trim()).filter((p: string) => p) : [],
      imageUrl: formData.get("imageUrl") as string
    });
  };

  const handleUpdateCollection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCollection) return;
    
    const formData = new FormData(e.currentTarget);
    const perfumeIds = formData.get("perfumeIds") as string;
    const sizes = formData.get("sizes") as string;
    const prices = formData.get("prices") as string;

    updateCollectionMutation.mutate({
      id: editingCollection.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      theme: formData.get("theme") as string,
      perfumeIds: perfumeIds ? perfumeIds.split(",").map((id: string) => id.trim()).filter((id: string) => id) : [],
      sizes: sizes ? sizes.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [],
      prices: prices ? prices.split(",").map((p: string) => p.trim()).filter((p: string) => p) : [],
      imageUrl: formData.get("imageUrl") as string
    });
  };

  // Funciones para manejo de imágenes
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedPerfumeId || (!imageUrl && !imagePreview)) {
      toast({ title: "Selecciona un perfume y una imagen", variant: "destructive" });
      return;
    }

    try {
      // Subir imagen a Cloudinary
      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageUrl: imageUrl || imagePreview }),
      });

      if (!response.ok) {
        throw new Error('Error al subir imagen');
      }

      const result = await response.json();
      
      // Actualizar el perfume con la nueva imagen
      const perfume = perfumes?.find(p => p.id === selectedPerfumeId);
      if (perfume) {
        updatePerfumeMutation.mutate({
          id: selectedPerfumeId,
          imageUrl: result.imageUrl
        });
      }

      // Limpiar el formulario
      setSelectedPerfumeId("");
      setImageUrl("");
      setImagePreview("");
      setIsImageUploadDialogOpen(false);
      
      toast({ title: "Imagen subida exitosamente", variant: "default" });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Error al subir imagen", variant: "destructive" });
    }
  };

  // Configuraciones
  // Obtener configuración de colecciones desde settings
  const { data: collectionsSettings } = useQuery({
    queryKey: ["collections-settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings/collections", {
        credentials: "include"
      });
      if (!response.ok) return { enabled: true };
      return response.json();
    },
    enabled: shouldFetch
  });

  const collectionsEnabled = collectionsSettings?.enabled ?? true;

  return (
    <div className="min-h-screen admin-gradient-bg admin-dark-theme admin-scrollbar text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold admin-gradient-text">Panel de Administración</h1>
            <p className="text-gray-400">Gestión completa de LhDecant</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[#D4AF37] font-medium">lhdecant@gmail.com</p>
              <p className="text-gray-400 text-sm">Administrador</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
            <TabsTrigger value="dashboard" className="admin-nav-item">Dashboard</TabsTrigger>
            <TabsTrigger value="perfumes" className="admin-nav-item">Perfumes</TabsTrigger>
            <TabsTrigger value="orders" className="admin-nav-item">Pedidos</TabsTrigger>
            <TabsTrigger value="users" className="admin-nav-item">Usuarios</TabsTrigger>
            <TabsTrigger value="analytics" className="admin-nav-item">Analytics</TabsTrigger>
            <TabsTrigger value="messages" className="admin-nav-item">Mensajes</TabsTrigger>
            <TabsTrigger value="content" className="admin-nav-item">Contenido</TabsTrigger>
            <TabsTrigger value="collections" className="admin-nav-item">Colecciones</TabsTrigger>
            <TabsTrigger value="images" className="admin-nav-item">Imágenes</TabsTrigger>
            <TabsTrigger value="sessions" className="admin-nav-item">Sesiones</TabsTrigger>
            <TabsTrigger value="settings" className="admin-nav-item">Configuración</TabsTrigger>
          </TabsList>
          {/* Dashboard Avanzado */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="admin-stat-card admin-card-glow admin-card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Perfumes</p>
                        <p className="text-2xl font-bold text-[#D4AF37]">{dashboardStats?.totalPerfumes || 0}</p>
                      </div>
                      <Package className="h-8 w-8 text-[#D4AF37]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="admin-stat-card admin-card-glow admin-card-hover border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Pedidos Hoy</p>
                        <p className="text-2xl font-bold text-green-400">{dashboardStats?.ordersToday || 0}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-green-400 admin-icon-glow" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="admin-stat-card admin-card-glow admin-card-hover border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Colecciones</p>
                        <p className="text-2xl font-bold text-blue-400">{dashboardStats?.totalCollections || 0}</p>
                      </div>
                      <ShoppingBag className="h-8 w-8 text-blue-400 admin-icon-glow" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="admin-stat-card admin-card-glow admin-card-hover border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">En Oferta</p>
                        <p className="text-2xl font-bold text-purple-400">{dashboardStats?.perfumesOnOffer || 0}</p>
                      </div>
                      <Percent className="h-8 w-8 text-purple-400 admin-icon-glow" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-[#D4AF37]">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      onClick={() => setActiveTab("perfumes")} 
                      className="luxury-button admin-smooth-transition"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Perfume
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("collections")} 
                      variant="outline" 
                      className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Nueva Colección
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("orders")} 
                      variant="outline" 
                      className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Ver Pedidos
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("analytics")} 
                      variant="outline" 
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-black"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Pedidos Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders?.slice(0, 5).map((order: Order, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                          <div>
                            <p className="text-white font-medium">#{order.id}</p>
                            <p className="text-gray-400 text-sm">{order.customer_email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#D4AF37] font-bold">${order.amount_total}</p>
                            <Badge variant="outline" className="border-green-500/30 text-green-400">
                              {order.status || 'Pendiente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Perfumes Populares</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {popularPerfumes?.slice(0, 5).map((perfume: Perfume, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-black" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{perfume.name}</p>
                              <p className="text-gray-400 text-sm">{perfume.brand}</p>
                            </div>
                          </div>
                          <Badge variant={perfume.inStock ? "default" : "destructive"}>
                            {perfume.inStock ? "En Stock" : "Agotado"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sección de Perfumes */}
          <TabsContent value="perfumes">
            <div className="space-y-6">
              {/* Header con filtros avanzados */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Gestión de Perfumes</h2>
                  <p className="text-gray-400">Administra el catálogo completo de perfumes</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                    className="border-[#D4AF37]/30 text-[#D4AF37]"
                  >
                    {viewMode === "list" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black hover:from-[#FFD700] hover:to-[#D4AF37] transition-all">
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
                    <div>
                      <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de Imagen</Label>
                      <Input 
                        name="imageUrl" 
                        type="url" 
                        placeholder="https://res.cloudinary.com/tu-cloud/image/upload/v1/lhdecant/perfume.jpg"
                        className="bg-black/50 border-[#D4AF37]/30 text-white" 
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Acepta URLs de imágenes (.jpg, .png, .gif, .webp, etc.)
                      </p>
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
            </div>

              {/* Filtros y búsqueda avanzada */}
              <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="search" className="text-[#D4AF37]">Buscar</Label>
                      <Input 
                        id="search"
                        placeholder="Buscar perfumes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/50 border-[#D4AF37]/30 text-white"
                      />
                  </div>
                    <div>
                      <Label htmlFor="category-filter" className="text-[#D4AF37]">Categoría</Label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-[#D4AF37]/30">
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="masculine">Masculino</SelectItem>
                          <SelectItem value="feminine">Femenino</SelectItem>
                          <SelectItem value="unisex">Unisex</SelectItem>
                          <SelectItem value="niche">Nicho</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="sort" className="text-[#D4AF37]">Ordenar por</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-[#D4AF37]/30">
                          <SelectItem value="name">Nombre</SelectItem>
                          <SelectItem value="brand">Marca</SelectItem>
                          <SelectItem value="category">Categoría</SelectItem>
                          <SelectItem value="price">Precio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#D4AF37]">Stock</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch id="stock-filter" />
                        <Label htmlFor="stock-filter" className="text-sm">Solo en stock</Label>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[#D4AF37]">Ofertas</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch id="offer-filter" />
                        <Label htmlFor="offer-filter" className="text-sm">Solo ofertas</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Perfumes */}
              {viewMode === "list" ? (
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#D4AF37]/20">
                          <TableHead className="text-[#D4AF37]">Perfume</TableHead>
                        <TableHead className="text-[#D4AF37]">Marca</TableHead>
                        <TableHead className="text-[#D4AF37]">Categoría</TableHead>
                          <TableHead className="text-[#D4AF37]">Tamaños</TableHead>
                          <TableHead className="text-[#D4AF37]">Precios</TableHead>
                        <TableHead className="text-[#D4AF37]">Stock</TableHead>
                        <TableHead className="text-[#D4AF37]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {perfumes
                          .filter(perfume => 
                            perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            perfume.brand.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .filter(perfume => filterCategory === "all" || perfume.category === filterCategory)
                          .map((perfume) => (
                            <TableRow key={perfume.id} className="border-[#D4AF37]/10 admin-table-row">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-black" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">{perfume.name}</p>
                                    <p className="text-gray-400 text-sm">{perfume.description}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-white">{perfume.brand}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
                              {perfume.category}
                            </Badge>
                          </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                            {perfume.sizes.map((size: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {size}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {perfume.prices.map((price: string, index: number) => (
                                    <div key={index} className="text-sm text-[#D4AF37] font-medium">
                                      ${price}
                              </div>
                            ))}
                                </div>
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
              </CardContent>
            </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {perfumes
                    .filter(perfume => 
                      perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      perfume.brand.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .filter(perfume => filterCategory === "all" || perfume.category === filterCategory)
                    .map((perfume) => (
                      <Card key={perfume.id} className="admin-card-hover bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-center p-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-black" />
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-white mb-2">{perfume.name}</h3>
                            <p className="text-gray-400 text-sm mb-3">{perfume.brand}</p>
                            <Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37] mb-3">
                              {perfume.category}
                            </Badge>
                            <div className="space-y-2 mb-4">
                              <div className="text-xs text-[#D4AF37]">
                                Tamaños: {perfume.sizes.join(", ")}
                              </div>
                              <div className="text-gray-400">{perfume.description}</div>
                            </div>
                            <div className="flex justify-between items-center">
                              <Badge variant={perfume.inStock ? "default" : "destructive"}>
                                {perfume.inStock ? "En Stock" : "Agotado"}
                              </Badge>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

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
                        <Input name="notes" defaultValue={editingPerfume.notes?.join(", ") || ""} className="bg-black/50 border-[#D4AF37]/30 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de Imagen</Label>
                      <Input 
                        name="imageUrl" 
                        type="url" 
                        placeholder="https://res.cloudinary.com/tu-cloud/image/upload/v1/lhdecant/perfume.jpg"
                        defaultValue={editingPerfume.imageUrl} 
                        className="bg-black/50 border-[#D4AF37]/30 text-white" 
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Acepta URLs de imágenes (.jpg, .png, .gif, .webp, etc.)
                      </p>
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
            </div>
          </TabsContent>

          {/* Sección de Pedidos */}
          <TabsContent value="orders">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Gestión de Pedidos</h2>
                  <p className="text-gray-400">Administra todos los pedidos de la tienda</p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Pedidos
                </Button>
              </div>

              <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#D4AF37]/20">
                        <TableHead className="text-[#D4AF37]">ID</TableHead>
                        <TableHead className="text-[#D4AF37]">Cliente</TableHead>
                        <TableHead className="text-[#D4AF37]">Total</TableHead>
                        <TableHead className="text-[#D4AF37]">Estado</TableHead>
                        <TableHead className="text-[#D4AF37]">Fecha</TableHead>
                        <TableHead className="text-[#D4AF37]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                                             {recentOrders?.map((order: Order, index: number) => (
                        <TableRow key={index} className="border-[#D4AF37]/10">
                          <TableCell className="font-medium text-[#D4AF37]">#{order.id}</TableCell>
                          <TableCell className="text-white">{order.customer_email}</TableCell>
                          <TableCell className="text-white font-bold">${order.amount_total}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-green-500/30 text-green-400">
                              {order.status || 'Pendiente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-500/30 text-green-400"
                                onClick={() => updateOrderStatusMutation.mutate({ 
                                  id: order.id, 
                                  status: 'Completado' 
                                })}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sección de Usuarios */}
          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Gestión de Usuarios</h2>
                  <p className="text-gray-400">Administra los usuarios registrados</p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Ver Estadísticas
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Usuarios</p>
                        <p className="text-2xl font-bold text-green-400">{userStats?.totalUsers || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Nuevos Hoy</p>
                        <p className="text-2xl font-bold text-blue-400">{userStats?.newUsersToday || 0}</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Usuarios Activos</p>
                        <p className="text-2xl font-bold text-purple-400">{userStats?.activeUsers || 0}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
              <CardHeader>
                  <CardTitle className="text-[#D4AF37]">Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers?.length > 0 ? (
                      recentUsers.map((user: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded flex items-center justify-center">
                              <Users className="w-4 h-4 text-black" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Nuevo registro</p>
                              <p className="text-gray-400 text-sm">{user.email || user.username}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[#D4AF37] text-sm">
                              {user.createdAt ? 
                                (user.createdAt._seconds ? 
                                  new Date(user.createdAt._seconds * 1000).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 
                                  new Date(user.createdAt).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                ) : 'Reciente'}
                            </p>
                            <Badge variant="outline" className="border-green-500/30 text-green-400">
                              Activo
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400">No hay actividad reciente</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sección de Analytics */}
          <TabsContent value="analytics">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Analytics y Reportes</h2>
                  <p className="text-gray-400">Análisis detallado de ventas y rendimiento</p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Exportar Reporte
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Estadísticas de Ventas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Ingresos Totales</span>
                        <span className="text-[#D4AF37] font-bold">${salesStats?.totalRevenue || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Pedidos Totales</span>
                        <span className="text-green-400 font-bold">{salesStats?.totalOrders || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Valor Promedio</span>
                        <span className="text-blue-400 font-bold">${salesStats?.averageOrderValue || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Ingresos Mensuales</span>
                        <span className="text-purple-400 font-bold">${salesStats?.monthlyRevenue || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Productos Más Vendidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                                             {popularPerfumes?.slice(0, 5).map((perfume: Perfume, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-black/30 rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded flex items-center justify-center">
                              <Package className="w-4 h-4 text-black" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{perfume.name}</p>
                              <p className="text-gray-400 text-sm">{perfume.brand}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[#D4AF37] font-bold">${perfume.prices?.[0] || 0}</p>
                            <p className="text-gray-400 text-sm">Vendido</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sección de Mensajes */}
          <TabsContent value="messages">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Mensajes de Contacto</h2>
                  <p className="text-gray-400">Gestiona las consultas de los clientes</p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Responder Todos
                </Button>
              </div>

              <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#D4AF37]/20">
                        <TableHead className="text-[#D4AF37]">Cliente</TableHead>
                        <TableHead className="text-[#D4AF37]">Email</TableHead>
                        <TableHead className="text-[#D4AF37]">Mensaje</TableHead>
                        <TableHead className="text-[#D4AF37]">Fecha</TableHead>
                        <TableHead className="text-[#D4AF37]">Estado</TableHead>
                        <TableHead className="text-[#D4AF37]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                                             {contactMessages?.map((message: ContactMessage, index: number) => (
                        <TableRow key={index} className="border-[#D4AF37]/10">
                          <TableCell className="text-white font-medium">{message.name}</TableCell>
                          <TableCell className="text-white">{message.email}</TableCell>
                          <TableCell className="text-gray-300 max-w-xs truncate">
                            {message.message}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={message.isRead ? "outline" : "default"} className={message.isRead ? "border-green-500/30 text-green-400" : "bg-[#D4AF37] text-black"}>
                              {message.isRead ? "Leído" : "Nuevo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-[#D4AF37]/30 text-[#D4AF37]"
                                onClick={() => markMessageAsReadMutation.mutate(message.id)}
                                disabled={markMessageAsReadMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-green-500/30 text-green-400">
                                <Mail className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sección de Contenido */}
          <TabsContent value="content">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Gestión de Contenido</h2>
                  <p className="text-gray-400">Administra páginas, newsletter y notificaciones</p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Crear Contenido
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="admin-card-hover bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-[#D4AF37] font-semibold">Páginas</h3>
                        <p className="text-gray-400 text-sm">Gestiona el contenido</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Página de Inicio</span>
                        <Badge variant="outline" className="border-green-500/30 text-green-400">Activa</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Sobre Nosotros</span>
                        <Badge variant="outline" className="border-green-500/30 text-green-400">Activa</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Contacto</span>
                        <Badge variant="outline" className="border-green-500/30 text-green-400">Activa</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="admin-card-hover bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-[#D4AF37] font-semibold">Newsletter</h3>
                        <p className="text-gray-400 text-sm">Suscripciones activas</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Suscriptores</span>
                        <span className="text-[#D4AF37] font-bold">1,247</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Esta semana</span>
                        <span className="text-green-400 font-bold">+23</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Tasa de apertura</span>
                        <span className="text-blue-400 font-bold">68%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="admin-card-hover bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg flex items-center justify-center">
                        <Bell className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-[#D4AF37] font-semibold">Notificaciones</h3>
                        <p className="text-gray-400 text-sm">Configura alertas</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Email</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Push</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">SMS</span>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sección de Colecciones */}
          <TabsContent value="collections">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Gestión de Colecciones</h2>
                  <p className="text-gray-400">Administra las colecciones de perfumes</p>
                  </div>
                  <Dialog open={isCreateCollectionDialogOpen} onOpenChange={setIsCreateCollectionDialogOpen}>
                    <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black hover:from-[#FFD700] hover:to-[#D4AF37] transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Colección
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black border-[#D4AF37]/20 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-[#D4AF37]">Crear Nueva Colección</DialogTitle>
                        <DialogDescription className="text-gray-400">
                        Crea una nueva colección de perfumes
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
                        <Input name="perfumeIds" className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="1, 2, 3" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="sizes" className="text-[#D4AF37]">Tamaños (separados por coma)</Label>
                          <Input name="sizes" className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="5ml, 10ml" />
                          </div>
                          <div>
                            <Label htmlFor="prices" className="text-[#D4AF37]">Precios por Tamaño (separados por coma)</Label>
                          <Input name="prices" className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="25, 45" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de Imagen</Label>
                      <Input 
                        name="imageUrl" 
                        type="url" 
                        placeholder="https://res.cloudinary.com/tu-cloud/image/upload/v1/lhdecant/collection.jpg"
                        className="bg-black/50 border-[#D4AF37]/30 text-white" 
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Acepta URLs de imágenes (.jpg, .png, .gif, .webp, etc.)
                      </p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {collections.map((collection: Collection) => (
                  <Card key={collection.id} className="admin-card-hover bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-black" />
                            </div>
                        <div>
                          <h3 className="text-[#D4AF37] font-semibold">{collection.name}</h3>
                          <p className="text-gray-400 text-sm">{collection.theme}</p>
                            </div>
                      </div>
                      <p className="text-gray-300 mb-4">{collection.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="text-xs text-[#D4AF37]">
                          Perfumes: {collection.perfumeIds?.join(", ") || "Ninguno"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Tamaños: {collection.sizes?.join(", ") || "No especificados"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Precios: {collection.prices?.join(", ") || "No especificados"}
                        </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#D4AF37]/30 text-[#D4AF37]"
                              onClick={() => {
                                setEditingCollection(collection);
                                setIsEditCollectionDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                        <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                    </CardContent>
                  </Card>
                    ))}
                  </div>
                  </div>
          </TabsContent>

          {/* Sección de Gestión de Imágenes */}
          <TabsContent value="images">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Gestión de Imágenes</h2>
                  <p className="text-gray-400">Sube y gestiona imágenes para perfumes y colecciones</p>
                </div>
                            <Button
                  onClick={() => setIsImageUploadDialogOpen(true)}
                  className="luxury-button admin-smooth-transition"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Nueva Imagen
                            </Button>
                          </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subida de Imágenes */}
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Subir Imágenes</CardTitle>
                    <CardDescription className="text-gray-400">
                      Sube imágenes desde tu computadora o URL
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border border-[#D4AF37]/20 rounded-lg">
                      <h3 className="text-[#D4AF37] font-medium mb-2">Instrucciones</h3>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Formatos soportados: JPG, PNG, GIF, WebP</li>
                        <li>• Tamaño máximo: 5MB por imagen</li>
                        <li>• Las imágenes se optimizan automáticamente</li>
                        <li>• Se almacenan en Cloudinary (gratuito)</li>
                      </ul>
                        </div>
                    
                    <div className="p-4 border border-green-500/20 rounded-lg bg-green-500/5">
                      <h3 className="text-green-400 font-medium mb-2">Ventajas de Cloudinary</h3>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• 25 GB de almacenamiento gratuito</li>
                        <li>• Optimización automática de imágenes</li>
                        <li>• CDN global para entrega rápida</li>
                        <li>• Transformaciones en tiempo real</li>
                      </ul>
                      </div>
                  </CardContent>
                </Card>

                {/* Estadísticas de Imágenes */}
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Estadísticas</CardTitle>
                    <CardDescription className="text-gray-400">
                      Información sobre el uso de imágenes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-[#D4AF37]/20 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#D4AF37]">
                          {perfumes?.filter(p => p.imageUrl).length || 0}
                        </p>
                        <p className="text-gray-400 text-sm">Perfumes con imagen</p>
                  </div>
                      <div className="p-4 border border-[#D4AF37]/20 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#D4AF37]">
                          {collections?.filter(c => c.imageUrl).length || 0}
                        </p>
                        <p className="text-gray-400 text-sm">Colecciones con imagen</p>
                  </div>
                    </div>
                    
                    <div className="p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
                      <h3 className="text-blue-400 font-medium mb-2">Uso de Cloudinary</h3>
                      <p className="text-gray-400 text-sm">
                        Plan gratuito: 25 GB almacenamiento + 25 GB/mes ancho de banda
                      </p>
                    </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sección de Gestión de Sesiones */}
          <TabsContent value="sessions">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Gestión de Sesiones</h2>
                  <p className="text-gray-400">Administra sesiones activas y expiradas</p>
                </div>
                <Button
                  onClick={() => cleanupSessionsMutation.mutate()}
                  className="luxury-button admin-smooth-transition"
                  disabled={cleanupSessionsMutation.isPending}
                >
                  {cleanupSessionsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Limpiar Sesiones Expiradas
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Estadísticas de Sesiones */}
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Estadísticas</CardTitle>
                    <CardDescription className="text-gray-400">
                      Información sobre sesiones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-[#D4AF37]/20 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#D4AF37]">
                          {sessionStats?.total || 0}
                        </p>
                        <p className="text-gray-400 text-sm">Total Sesiones</p>
                      </div>
                      <div className="p-4 border border-green-500/20 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {sessionStats?.active || 0}
                        </p>
                        <p className="text-gray-400 text-sm">Sesiones Activas</p>
                      </div>
                    </div>
                    <div className="p-4 border border-red-500/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-400">
                        {sessionStats?.expired || 0}
                      </p>
                      <p className="text-gray-400 text-sm">Sesiones Expiradas</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Información del Sistema */}
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Información del Sistema</CardTitle>
                    <CardDescription className="text-gray-400">
                      Configuración de sesiones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border border-[#D4AF37]/20 rounded-lg">
                      <h3 className="text-[#D4AF37] font-medium mb-2">Configuración</h3>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Duración: 7 días</li>
                        <li>• Almacenamiento: Firebase Firestore</li>
                        <li>• Limpieza automática: Manual</li>
                        <li>• Seguridad: Cookies seguras</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
                      <h3 className="text-blue-400 font-medium mb-2">Última Limpieza</h3>
                      <p className="text-gray-400 text-sm">
                        {sessionStats?.lastCleanup ? 
                          new Date(sessionStats.lastCleanup).toLocaleString() : 
                          'No disponible'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Acciones Rápidas */}
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Acciones Rápidas</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestiona sesiones rápidamente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => cleanupSessionsMutation.mutate()}
                      className="w-full luxury-button admin-smooth-transition"
                      disabled={cleanupSessionsMutation.isPending}
                    >
                      {cleanupSessionsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Limpiar Expiradas
                    </Button>
                    
                    <div className="p-4 border border-yellow-500/20 rounded-lg bg-yellow-500/5">
                      <h3 className="text-yellow-400 font-medium mb-2">Nota</h3>
                      <p className="text-gray-400 text-sm">
                        Las sesiones expiradas se eliminan automáticamente al acceder
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Sesiones */}
              <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-[#D4AF37]">Sesiones Activas</CardTitle>
                  <CardDescription className="text-gray-400">
                    Lista de todas las sesiones activas en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[#D4AF37]">ID de Sesión</TableHead>
                          <TableHead className="text-[#D4AF37]">Usuario</TableHead>
                          <TableHead className="text-[#D4AF37]">Tipo</TableHead>
                          <TableHead className="text-[#D4AF37]">Creada</TableHead>
                          <TableHead className="text-[#D4AF37]">Expira</TableHead>
                          <TableHead className="text-[#D4AF37]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map((session) => (
                          <TableRow key={session.id} className="hover:bg-gray-800/50">
                            <TableCell className="font-mono text-sm">
                              {session.id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {session.passport?.user?.email || session.user?.email || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={session.isAdmin ? "default" : "secondary"}>
                                {session.isAdmin ? 'Admin' : 'Usuario'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {session.createdAt ? 
                                new Date(session.createdAt.toDate()).toLocaleString() : 
                                'N/A'
                              }
                            </TableCell>
                            <TableCell>
                              {session.expiresAt ? 
                                new Date(session.expiresAt.toDate()).toLocaleString() : 
                                'N/A'
                              }
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteSessionMutation.mutate(session.id)}
                                disabled={deleteSessionMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sección de Configuración */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Configuración del Sistema</h2>
                  <p className="text-gray-400">Ajustes generales de la plataforma</p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Backup del Sistema
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuración General */}
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
              <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Configuración General</CardTitle>
                <CardDescription className="text-gray-400">
                      Ajustes básicos de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                  <div>
                    <h3 className="text-[#D4AF37] font-medium">Mostrar Sección Colecciones</h3>
                        <p className="text-gray-400 text-sm">Controla la visibilidad de las colecciones</p>
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

                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                      <div>
                        <h3 className="text-[#D4AF37] font-medium">Modo Mantenimiento</h3>
                        <p className="text-gray-400 text-sm">Activa el modo mantenimiento del sitio</p>
                      </div>
                      <Switch 
                        checked={false}
                        onCheckedChange={(checked) => {
                          updateSettingMutation.mutate({ 
                            key: 'maintenance_mode', 
                            value: checked.toString() 
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                      <div>
                        <h3 className="text-[#D4AF37] font-medium">Notificaciones por Email</h3>
                        <p className="text-gray-400 text-sm">Recibir notificaciones de pedidos</p>
                      </div>
                      <Switch 
                        checked={true}
                        onCheckedChange={(checked) => {
                          updateSettingMutation.mutate({ 
                            key: 'email_notifications', 
                        value: checked.toString() 
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>

                {/* Configuración de Pagos */}
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Configuración de Pagos</CardTitle>
                    <CardDescription className="text-gray-400">
                      Ajustes de métodos de pago
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                      <div>
                        <h3 className="text-[#D4AF37] font-medium">Stripe</h3>
                        <p className="text-gray-400 text-sm">Procesador de pagos principal</p>
                      </div>
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        Activo
                      </Badge>
      </div>

                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                      <div>
                        <h3 className="text-[#D4AF37] font-medium">PayPal</h3>
                        <p className="text-gray-400 text-sm">Método de pago alternativo</p>
                      </div>
                      <Switch 
                        checked={false}
                        onCheckedChange={(checked) => {
                          updateSettingMutation.mutate({ 
                            key: 'paypal_enabled', 
                            value: checked.toString() 
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                      <div>
                        <h3 className="text-[#D4AF37] font-medium">Transferencia Bancaria</h3>
                        <p className="text-gray-400 text-sm">Pago por transferencia</p>
                      </div>
                      <Switch 
                        checked={true}
                        onCheckedChange={(checked) => {
                          updateSettingMutation.mutate({ 
                            key: 'bank_transfer_enabled', 
                            value: checked.toString() 
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Configuración de Envíos */}
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Configuración de Envíos</CardTitle>
                    <CardDescription className="text-gray-400">
                      Ajustes de envío y logística
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                      <div>
                        <h3 className="text-[#D4AF37] font-medium">Envío Gratis</h3>
                        <p className="text-gray-400 text-sm">En pedidos superiores a $50</p>
                      </div>
                      <Switch 
                        checked={true}
                        onCheckedChange={(checked) => {
                          updateSettingMutation.mutate({ 
                            key: 'free_shipping_enabled', 
                            value: checked.toString() 
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
            <div>
                        <h3 className="text-[#D4AF37] font-medium">Seguimiento de Pedidos</h3>
                        <p className="text-gray-400 text-sm">Notificaciones de seguimiento</p>
                      </div>
                      <Switch 
                        checked={true}
                        onCheckedChange={(checked) => {
                          updateSettingMutation.mutate({ 
                            key: 'order_tracking_enabled', 
                            value: checked.toString() 
                          });
                        }}
              />
            </div>
                  </CardContent>
                </Card>

                {/* Configuración de Marketing */}
                <Card className="bg-black/50 border-[#D4AF37]/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">Configuración de Marketing</CardTitle>
                    <CardDescription className="text-gray-400">
                      Herramientas de marketing y promoción
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
            <div>
                        <h3 className="text-[#D4AF37] font-medium">Cupones de Descuento</h3>
                        <p className="text-gray-400 text-sm">Sistema de cupones activo</p>
                      </div>
                      <Switch 
                        checked={true}
                        onCheckedChange={(checked) => {
                          updateSettingMutation.mutate({ 
                            key: 'coupons_enabled', 
                            value: checked.toString() 
                          });
                        }}
              />
            </div>
            
                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                      <div>
                        <h3 className="text-[#D4AF37] font-medium">Programa de Fidelidad</h3>
                        <p className="text-gray-400 text-sm">Puntos por compras</p>
                      </div>
                      <Switch 
                        checked={false}
                        onCheckedChange={(checked) => {
                          updateSettingMutation.mutate({ 
                            key: 'loyalty_program_enabled', 
                            value: checked.toString() 
                          });
                        }}
                      />
            </div>

                    <div className="flex items-center justify-between p-4 border border-[#D4AF37]/20 rounded-lg">
                      <div>
                        <h3 className="text-[#D4AF37] font-medium">Email Marketing</h3>
                        <p className="text-gray-400 text-sm">Campañas de email</p>
                      </div>
                      <Switch 
                        checked={true}
                        onCheckedChange={(checked) => {
                          updateSettingMutation.mutate({ 
                            key: 'email_marketing_enabled', 
                            value: checked.toString() 
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Diálogos adicionales */}
      <Dialog open={isEditCollectionDialogOpen} onOpenChange={setIsEditCollectionDialogOpen}>
        <DialogContent className="bg-black border-[#D4AF37]/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37]">Editar Colección</DialogTitle>
            <DialogDescription className="text-gray-400">
              Actualiza la información de la colección
            </DialogDescription>
          </DialogHeader>
          {editingCollection && (
            <form onSubmit={handleUpdateCollection} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#D4AF37]">Nombre</Label>
                <Input name="name" defaultValue={editingCollection.name} required className="bg-black/50 border-[#D4AF37]/30 text-white" />
              </div>
              <div>
                <Label htmlFor="description" className="text-[#D4AF37]">Descripción</Label>
                <Textarea name="description" defaultValue={editingCollection.description} required className="bg-black/50 border-[#D4AF37]/30 text-white" />
              </div>
              <div>
                <Label htmlFor="theme" className="text-[#D4AF37]">Tema</Label>
                <Input name="theme" defaultValue={editingCollection.theme} required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="Verano, Elegancia, etc." />
              </div>
              <div>
                <Label htmlFor="perfumeIds" className="text-[#D4AF37]">IDs de Perfumes (separados por coma)</Label>
                  <Input name="perfumeIds" defaultValue={editingCollection.perfumeIds?.join(", ") || ""} required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="1, 2, 3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sizes" className="text-[#D4AF37]">Tamaños (separados por coma)</Label>
                    <Input name="sizes" defaultValue={editingCollection.sizes?.join(", ") || ""} required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="5ml, 10ml" />
                </div>
                <div>
                  <Label htmlFor="prices" className="text-[#D4AF37]">Precios por Tamaño (separados por coma)</Label>
                    <Input name="prices" defaultValue={editingCollection.prices?.join(", ") || ""} required className="bg-black/50 border-[#D4AF37]/30 text-white" placeholder="25, 45" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de Imagen</Label>
                      <Input 
                        name="imageUrl" 
                        type="url" 
                        placeholder="https://res.cloudinary.com/tu-cloud/image/upload/v1/lhdecant/collection.jpg"
                        defaultValue={editingCollection.imageUrl} 
                        className="bg-black/50 border-[#D4AF37]/30 text-white" 
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Acepta URLs de imágenes (.jpg, .png, .gif, .webp, etc.)
                      </p>
              </div>
              <Button type="submit" disabled={updateCollectionMutation.isPending} className="w-full luxury-button">
                {updateCollectionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Colección"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Subida de Imágenes */}
      <Dialog open={isImageUploadDialogOpen} onOpenChange={setIsImageUploadDialogOpen}>
        <DialogContent className="bg-black border-[#D4AF37]/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37]">Subir Imagen para Perfume</DialogTitle>
            <DialogDescription className="text-gray-400">
              Sube una imagen específica para un perfume desde tu computadora o URL
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Selección de Perfume */}
            <div>
              <Label htmlFor="perfumeSelect" className="text-[#D4AF37]">Seleccionar Perfume</Label>
              <select 
                id="perfumeSelect"
                className="w-full mt-2 bg-black/50 border border-[#D4AF37]/30 text-white rounded-md p-2"
                onChange={(e) => setSelectedPerfumeId(e.target.value)}
              >
                <option value="">Selecciona un perfume...</option>
                {perfumes?.map((perfume) => (
                  <option key={perfume.id} value={perfume.id}>
                    {perfume.name} - {perfume.brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Subida desde archivo */}
            <div>
              <Label className="text-[#D4AF37] mb-2 block">Subir desde archivo</Label>
              <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-lg p-6 text-center hover:border-[#D4AF37]/50 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-[#D4AF37] mb-4" />
                <p className="text-gray-400 mb-2">Arrastra una imagen aquí o haz clic para seleccionar</p>
                <p className="text-xs text-gray-500">Formatos: JPG, PNG, GIF, WebP (máx. 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileUpload}
                />
              </div>
            </div>

            {/* Subida desde URL */}
            <div>
              <Label htmlFor="imageUrl" className="text-[#D4AF37]">URL de imagen</Label>
              <Input 
                id="imageUrl"
                type="url" 
                placeholder="https://res.cloudinary.com/tu-cloud/image/upload/v1/lhdecant/perfume.jpg"
                className="bg-black/50 border-[#D4AF37]/30 text-white mt-2"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Ingresa una URL válida de imagen (.jpg, .png, .gif, .webp, etc.)
              </p>
            </div>

            {/* Vista previa */}
            {imagePreview && (
              <div>
                <Label className="text-[#D4AF37] mb-2 block">Vista previa</Label>
                <div className="relative w-full h-48 bg-charcoal rounded-lg overflow-hidden border border-[#D4AF37]/20">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Información de Cloudinary */}
            <div className="p-4 border border-green-500/20 rounded-lg bg-green-500/5">
              <h3 className="text-green-400 font-medium mb-2">Cloudinary - Almacenamiento Gratuito</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• 25 GB de almacenamiento gratuito</li>
                <li>• Optimización automática de imágenes</li>
                <li>• CDN global para entrega rápida</li>
                <li>• Transformaciones en tiempo real</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImageUploadDialogOpen(false);
                  setSelectedPerfumeId("");
                  setImageUrl("");
                  setImagePreview("");
                }}
                className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
              >
                Cancelar
              </Button>
              <Button 
                className="luxury-button"
                onClick={handleImageUpload}
                disabled={!selectedPerfumeId || (!imageUrl && !imagePreview)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Imagen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}