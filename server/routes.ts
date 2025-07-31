import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAdmin } from "./auth";
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import express from 'express';
import crypto from 'crypto';
import { admin } from "./storage";
import { uploadFromUrl, deleteImage } from "./cloudinary";

const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-08-16' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // CORS middleware para admin endpoints
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Middleware to check if user is authenticated for admin routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Admin authentication endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Verificar credenciales de admin
      if (email === "lhdecant@gmail.com" && password === "11qqaazz") {
        // Crear sesión de admin
        req.session.isAdmin = true;
        req.session.adminEmail = email;
        
        res.json({ 
          success: true, 
          message: "Admin authentication successful",
          user: { email, role: "admin" }
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: "Invalid admin credentials" 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Authentication failed" 
      });
    }
  });

  // Check admin status
  app.get("/api/admin/status", (req, res) => {
    const isAdmin = req.session.isAdmin === true;
    const adminEmail = req.session.adminEmail;
    
    if (isAdmin && adminEmail === "lhdecant@gmail.com") {
      res.json({ 
        isAdmin: true, 
        email: adminEmail,
        message: "Admin session active" 
      });
    } else {
      res.status(401).json({ 
        isAdmin: false, 
        message: "No admin session" 
      });
    }
  });
  // Get all perfumes
  app.get("/api/perfumes", async (_req, res) => {
    try {
      const perfumes = await storage.getPerfumes();
      res.json(perfumes);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.get("/api/perfumes/homepage", async (_req, res) => {
    try {
      const perfumes = await storage.getHomepagePerfumes();
      res.json(perfumes);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Get perfumes by category
  app.get("/api/perfumes/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const perfumes = await storage.getPerfumesByCategory(category);
      res.json(perfumes);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Get single perfume
  app.get("/api/perfumes/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const perfume = await storage.getPerfume(id);
      if (perfume === undefined || perfume === null) {
        return res.status(404).json({ message: "Perfume not found" });
      }
      res.json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Función para validar URL de imagen
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return true; // URL opcional
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
      
      if (!validProtocols.includes(urlObj.protocol)) {
        return false;
      }
      
      const pathname = urlObj.pathname.toLowerCase();
      
      // Verificar si termina en extensión válida
      const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));
      
      // Si no tiene extensión, verificar que sea una URL válida de imagen
      if (!hasValidExtension) {
        // Permitir URLs sin extensión (como CDNs que sirven imágenes)
        return urlObj.hostname.length > 0 && pathname.length > 0;
      }
      
      return hasValidExtension;
    } catch {
      return false;
    }
  };

  // Create perfume (admin only)
  app.post("/api/perfumes", requireAdmin, async (req, res) => {
    try {
      // Validar URL de imagen si se proporciona
      if (req.body.imageUrl && !isValidImageUrl(req.body.imageUrl)) {
        return res.status(400).json({ 
          message: "URL de imagen inválida. Debe ser una URL válida con extensión de imagen (.jpg, .png, .gif, etc.)" 
        });
      }
      
      const perfume = await storage.createPerfume(req.body);
      res.status(201).json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Update perfume (admin only)
  app.put("/api/perfumes/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      
      // Validar URL de imagen si se proporciona
      if (req.body.imageUrl && !isValidImageUrl(req.body.imageUrl)) {
        return res.status(400).json({ 
          message: "URL de imagen inválida. Debe ser una URL válida con extensión de imagen (.jpg, .png, .gif, etc.)" 
        });
      }
      
      const perfume = await storage.updatePerfume(id, req.body);
      res.json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Update perfume with PATCH (admin only)
  app.patch("/api/perfumes/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const perfume = await storage.updatePerfume(id, req.body);
      res.json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Delete perfume (admin only)
  app.delete("/api/perfumes/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deletePerfume(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Admin image upload endpoints (solo para administradores)
  app.post("/api/admin/images/upload", requireAdmin, async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: "URL de imagen requerida" });
      }

      // Validar URL de imagen
      if (!isValidImageUrl(imageUrl)) {
        return res.status(400).json({ 
          message: "URL de imagen inválida. Debe ser una URL válida con extensión de imagen (.jpg, .png, .gif, etc.)" 
        });
      }

      // Subir imagen a Cloudinary
      const cloudinaryUrl = await uploadFromUrl(imageUrl, 'perfumes');
      
      res.json({ 
        success: true, 
        imageUrl: cloudinaryUrl,
        message: "Imagen subida exitosamente a Cloudinary" 
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ 
        message: "Error al subir imagen. Intenta con otra URL o más tarde." 
      });
    }
  });

  app.delete("/api/admin/images/:publicId", requireAdmin, async (req, res) => {
    try {
      const { publicId } = req.params;
      
      if (!publicId) {
        return res.status(400).json({ message: "ID de imagen requerido" });
      }

      // Eliminar imagen de Cloudinary
      await deleteImage(publicId);
      
      res.json({ 
        success: true, 
        message: "Imagen eliminada exitosamente" 
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ 
        message: "Error al eliminar imagen" 
      });
    }
  });

  // Toggle homepage display
  app.patch("/api/perfumes/:id/homepage", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const { showOnHomepage } = req.body;
      const perfume = await storage.toggleHomepageDisplay(id, showOnHomepage);
      res.json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Update offer status
  app.patch("/api/perfumes/:id/offer", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const { isOnOffer, discountPercentage, offerDescription } = req.body;
      const perfume = await storage.updateOfferStatus(id, isOnOffer, discountPercentage, offerDescription);
      res.json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Get all collections
  app.get("/api/collections", async (_req, res) => {
    try {
      // Check if collections are enabled
      const collectionsEnabledSetting = await storage.getSetting('collections_enabled');
      const collectionsEnabled = collectionsEnabledSetting?.value === 'true';
      
      if (!collectionsEnabled) {
        res.json([]);
        return;
      }
      
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Create collection (admin only)
  app.post("/api/collections", requireAuth, async (req, res) => {
    try {
      // Validar URL de imagen si se proporciona
      if (req.body.imageUrl && !isValidImageUrl(req.body.imageUrl)) {
        return res.status(400).json({ 
          message: "URL de imagen inválida. Debe ser una URL válida con extensión de imagen (.jpg, .png, .gif, etc.)" 
        });
      }
      
      const collection = await storage.createCollection(req.body);
      res.status(201).json(collection);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Get single collection
  app.get("/api/collections/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const collection = await storage.getCollection(id);
      if (collection === undefined || collection === null) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Update collection (admin only)
  app.put("/api/collections/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const collection = await storage.updateCollection(id, req.body);
      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Delete collection (admin only)
  app.delete("/api/collections/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteCollection(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const message = await storage.createContactMessage(req.body);
      res.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Cart routes
  app.post("/api/cart", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log('Adding to cart with userId:', userId);
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const cartItem = await storage.addToCart(userId, req.body);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log('Getting cart with userId:', userId);
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const items = await storage.getCartItems(userId);
      console.log('Cart items found:', items.length);
      res.json(items);
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.put("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const { quantity } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(id, quantity, userId);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      
      await storage.removeFromCart(id, userId);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      
      await storage.clearCart(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Favorites endpoints
  app.get("/api/favorites", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const favorites = await storage.getUserFavorites(req.user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const favorite = await storage.addToFavorites(req.user.id, req.body.perfumeId);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.delete("/api/favorites/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.removeFromFavorites(req.params.id, req.user.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Profile endpoints
  app.get("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const profile = await storage.getUserProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const profile = await storage.updateUserProfile(req.user.id, req.body);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.put("/api/profile/password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.changeUserPassword(req.user.id, req.body.currentPassword, req.body.newPassword);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Addresses endpoints
  app.get("/api/addresses", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const addresses = await storage.getUserAddresses(req.user.id);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const address = await storage.addUserAddress(req.user.id, req.body);
      res.status(201).json(address);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.put("/api/addresses/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const address = await storage.updateUserAddress(req.params.id, req.user.id, req.body);
      res.json(address);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.deleteUserAddress(req.params.id, req.user.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.patch("/api/addresses/:id/default", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.setDefaultAddress(req.params.id, req.user.id);
      res.json({ message: "Default address updated" });
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Payment methods endpoints
  app.get("/api/payment-methods", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const paymentMethods = await storage.getUserPaymentMethods(req.user.id);
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const paymentMethod = await storage.addUserPaymentMethod(req.user.id, req.body);
      res.status(201).json(paymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.delete("/api/payment-methods/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.deleteUserPaymentMethod(req.params.id, req.user.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.patch("/api/payment-methods/:id/default", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.setDefaultPaymentMethod(req.params.id, req.user.id);
      res.json({ message: "Default payment method updated" });
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.post("/api/settings", requireAuth, async (req, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const { orderData, orderItems } = req.body;
      const order = await storage.createOrder(orderData, orderItems);
      
      // Clear cart after successful order
      const sessionId = req.sessionID || `guest_${Date.now()}`;
      await storage.clearCart(sessionId);
      
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      // Filtrar órdenes del usuario actual
      const userOrders = orders.filter(order => (order as any).userId === req.user?.id);
      res.json(userOrders);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      // Verificar que la orden pertenece al usuario
      if ((order as any).userId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
      return;
    }
  });

  // Endpoints para dashboard admin
  app.get('/api/admin/orders', requireAdmin, async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las órdenes' });
    }
  });

  app.get('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la orden' });
    }
  });

  // Endpoints para estadísticas del dashboard
  app.get('/api/admin/dashboard-stats', requireAdmin, async (_req, res) => {
    try {
      const perfumes = await storage.getPerfumes();
      const orders = await storage.getOrders();
      const collections = await storage.getCollections();
      
      // Calcular estadísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ordersToday = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      const perfumesOnOffer = perfumes.filter((p: any) => p.isOnOffer);
      
      const stats = {
        totalPerfumes: perfumes.length,
        ordersToday: ordersToday.length,
        totalCollections: collections.length,
        perfumesOnOffer: perfumesOnOffer.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + ((order as any).amount_total || 0), 0)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  });

  // Endpoint para obtener pedidos recientes
  app.get('/api/admin/recent-orders', requireAdmin, async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      const recentOrders = orders
        .sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime())
        .slice(0, 10);
      
      res.json(recentOrders);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener pedidos recientes' });
    }
  });

  // Endpoint para obtener perfumes populares
  app.get('/api/admin/popular-perfumes', requireAdmin, async (_req, res) => {
    try {
      const perfumes = await storage.getPerfumes();
      const orders = await storage.getOrders();
      
      // Calcular popularidad basada en ventas reales
      const perfumeSales: { [key: string]: number } = {};
      
      orders.forEach((order: any) => {
        if (order.items) {
          order.items.forEach((item: any) => {
            if (item.perfumeId) {
              perfumeSales[item.perfumeId] = (perfumeSales[item.perfumeId] || 0) + (item.quantity || 1);
            }
          });
        }
      });
      
      // Si no hay ventas, devolver perfumes destacados en lugar de "populares"
      if (orders.length === 0) {
        const featuredPerfumes = perfumes
          .filter((perfume: any) => perfume.showOnHomepage || perfume.isOnOffer)
          .slice(0, 5);
        
        res.json(featuredPerfumes);
        return;
      }
      
      // Ordenar perfumes por ventas y tomar los top 5
      const popularPerfumes = perfumes
        .map(perfume => ({
          ...perfume,
          salesCount: perfumeSales[perfume.id] || 0
        }))
        .filter(perfume => perfume.salesCount > 0) // Solo perfumes con ventas
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 5)
        .map(({ salesCount, ...perfume }) => perfume); // Remover salesCount del resultado
      
      res.json(popularPerfumes);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener perfumes populares' });
    }
  });

  // Endpoint para estadísticas de usuarios
  app.get('/api/admin/user-stats', requireAdmin, async (_req, res) => {
    try {
      // Obtener todos los usuarios
      const usersRef = db.collection('users');
      const usersSnapshot = await usersRef.get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newUsersToday = users.filter(user => {
        const userDate = new Date((user as any).createdAt);
        userDate.setHours(0, 0, 0, 0);
        return userDate.getTime() === today.getTime();
      });

      const stats = {
        totalUsers: users.length,
        newUsersToday: newUsersToday.length,
        activeUsers: users.filter((u: any) => u.lastLoginAt && 
          new Date(u.lastLoginAt).getTime() > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
        ).length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener estadísticas de usuarios' });
    }
  });

  // Endpoint para estadísticas de ventas
  app.get('/api/admin/sales-stats', requireAdmin, async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const ordersThisMonth = orders.filter((order: any) => 
        new Date(order.createdAt) >= thisMonth
      );
      
      const ordersLastMonth = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= lastMonth && orderDate < thisMonth;
      });
      
      const totalRevenueThisMonth = ordersThisMonth.reduce((sum, order) => 
        sum + ((order as any).amount_total || 0), 0
      );
      
      const totalRevenueLastMonth = ordersLastMonth.reduce((sum, order) => 
        sum + ((order as any).amount_total || 0), 0
      );
      
      const avgOrderValue = orders.length > 0 ? 
        orders.reduce((sum, order) => sum + ((order as any).amount_total || 0), 0) / orders.length : 0;
      
      const stats = {
        totalRevenue: orders.reduce((sum, order) => sum + ((order as any).amount_total || 0), 0),
        totalOrders: orders.length,
        avgOrderValue: avgOrderValue,
        revenueThisMonth: totalRevenueThisMonth,
        ordersThisMonth: ordersThisMonth.length,
        revenueLastMonth: totalRevenueLastMonth,
        ordersLastMonth: ordersLastMonth.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener estadísticas de ventas' });
    }
  });

  // Endpoint para obtener mensajes de contacto
  app.get('/api/admin/contact-messages', requireAdmin, async (_req, res) => {
    try {
      const messagesRef = db.collection('contactMessages');
      const messagesSnapshot = await messagesRef.orderBy('createdAt', 'desc').get();
      const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener mensajes de contacto' });
    }
  });

  // Endpoint para marcar mensaje como leído
  app.patch('/api/admin/contact-messages/:id/read', requireAdmin, async (req, res) => {
    try {
      const messageRef = db.collection('contactMessages').doc(req.params.id);
      await messageRef.update({ 
        isRead: true, 
        readAt: new Date(),
        readBy: req.user?.id 
      });
      
      res.json({ message: 'Mensaje marcado como leído' });
    } catch (error) {
      res.status(500).json({ message: 'Error al marcar mensaje como leído' });
    }
  });

  // Endpoint para obtener todos los usuarios
  app.get('/api/admin/users', requireAdmin, async (_req, res) => {
    try {
      const usersRef = db.collection('users');
      const usersSnapshot = await usersRef.orderBy('createdAt', 'desc').get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  });

  // Endpoint para obtener usuarios recientes
  app.get('/api/admin/recent-users', requireAdmin, async (_req, res) => {
    try {
      const usersRef = db.collection('users');
      const usersSnapshot = await usersRef.orderBy('createdAt', 'desc').limit(5).get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios recientes' });
    }
  });

  // Endpoint para actualizar estado de usuario
  app.patch('/api/admin/users/:id/status', requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const userRef = db.collection('users').doc(req.params.id);
      await userRef.update({ 
        status, 
        updatedAt: new Date(),
        updatedBy: req.user?.id 
      });
      
      res.json({ message: 'Estado de usuario actualizado' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar estado de usuario' });
    }
  });

  // Endpoint para exportar datos
  app.get('/api/admin/export-data', requireAdmin, async (req, res) => {
    try {
      const { type } = req.query;
      
      let data;
      switch (type) {
        case 'perfumes':
          data = await storage.getPerfumes();
          break;
        case 'orders':
          data = await storage.getOrders();
          break;
        case 'users':
          const usersRef = db.collection('users');
          const usersSnapshot = await usersRef.get();
          data = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          break;
        case 'collections':
          data = await storage.getCollections();
          break;
        default:
          return res.status(400).json({ message: 'Tipo de exportación no válido' });
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error al exportar datos' });
    }
  });

  // Sistema completo de tracking de pedidos
  app.get('/api/tracking/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const { email } = req.query;
      
      if (!orderId) {
        return res.status(400).json({ message: 'ID de orden requerido' });
      }

      // Obtener orden desde Firebase
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada' });
      }

      // Verificar que el email coincida (seguridad)
      if (email && order.customer_email !== email) {
        return res.status(403).json({ message: 'No autorizado para ver esta orden' });
      }

      // Obtener historial de tracking
      const trackingHistory = await storage.getOrderTrackingHistory(orderId);
      
      const trackingInfo = {
        orderId: order.id,
        customerEmail: order.customer_email,
        status: order.status,
        amount: order.amount_total,
        currency: order.currency,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber,
        shippingCarrier: order.shippingCarrier,
        history: trackingHistory,
        items: order.items || []
      };

      res.json(trackingInfo);
    } catch (error) {
      console.error('Error obteniendo tracking:', error);
      res.status(500).json({ message: 'Error obteniendo información de tracking' });
    }
  });

  // Endpoint para obtener tracking por email (sin orden ID)
  app.get('/api/tracking', async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ message: 'Email requerido' });
      }

      // Obtener todas las órdenes del cliente
      const orders = await storage.getOrdersByEmail(email as string);
      
      const trackingList = orders.map(order => ({
        orderId: order.id,
        status: order.status,
        amount: order.amount_total,
        currency: order.currency,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber,
        shippingCarrier: order.shippingCarrier,
        itemCount: order.items?.length || 0
      }));

      res.json(trackingList);
    } catch (error) {
      console.error('Error obteniendo tracking por email:', error);
      res.status(500).json({ message: 'Error obteniendo información de tracking' });
    }
  });

  // Endpoint para actualizar estado de orden (admin)
  app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
      const { status, trackingNumber, shippingCarrier, estimatedDelivery, notes } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Estado requerido' });
      }

      // Validar estado válido
      const validStatuses = [
        'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
      ];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ') 
        });
      }

      // Actualizar orden con información de tracking
      const order = await storage.updateOrderStatus(req.params.id, {
        status,
        trackingNumber,
        shippingCarrier,
        estimatedDelivery,
        notes,
        updatedAt: new Date().toISOString()
      });

      // Agregar entrada al historial de tracking
      await storage.addOrderTrackingEntry(req.params.id, {
        status,
        timestamp: new Date().toISOString(),
        notes: notes || `Estado actualizado a: ${status}`,
        updatedBy: 'admin'
      });

      // Enviar email de notificación al cliente
      try {
        const statusMessages = {
          'pending': 'Tu pedido está pendiente de confirmación',
          'paid': 'Tu pago ha sido confirmado',
          'processing': 'Tu pedido está siendo procesado',
          'shipped': 'Tu pedido ha sido enviado',
          'delivered': 'Tu pedido ha sido entregado',
          'cancelled': 'Tu pedido ha sido cancelado',
          'refunded': 'Tu pedido ha sido reembolsado'
        };

        const trackingInfo = trackingNumber ? 
          `<p><strong>Número de seguimiento:</strong> ${trackingNumber}</p>` : '';
        
        const carrierInfo = shippingCarrier ? 
          `<p><strong>Transportista:</strong> ${shippingCarrier}</p>` : '';
        
        const deliveryInfo = estimatedDelivery ? 
          `<p><strong>Entrega estimada:</strong> ${estimatedDelivery}</p>` : '';

        await transporter.sendMail({
          from: 'lhdecant@gmail.com',
          to: order.customer_email,
          subject: `Actualización de tu pedido #${order.id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #D4AF37;">Actualización de tu pedido</h2>
              <p><strong>Número de orden:</strong> ${order.id}</p>
              <p><strong>Estado actual:</strong> ${(statusMessages as any)[status] || status}</p>
              ${trackingInfo}
              ${carrierInfo}
              ${deliveryInfo}
              ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
              <p>Puedes hacer seguimiento de tu pedido en: ${process.env.FRONTEND_URL}/tracking/${order.id}</p>
              <p>Gracias por elegir LhDecant!</p>
            </div>
          `
        });
      } catch (err) {
        console.error('Error enviando email de estado:', err);
      }

      res.json(order);
    } catch (error) {
      console.error('Error actualizando estado de orden:', error);
      res.status(500).json({ message: 'Error al actualizar el estado de la orden' });
    }
  });

  // Endpoint para obtener estadísticas de tracking (admin)
  app.get('/api/admin/tracking-stats', requireAdmin, async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      
      const stats = {
        total: orders.length,
        byStatus: {
          pending: orders.filter(o => (o as any).status === 'pending').length,
          paid: orders.filter(o => (o as any).status === 'paid').length,
          processing: orders.filter(o => (o as any).status === 'processing').length,
          shipped: orders.filter(o => (o as any).status === 'shipped').length,
          delivered: orders.filter(o => (o as any).status === 'delivered').length,
          cancelled: orders.filter(o => (o as any).status === 'cancelled').length,
          refunded: orders.filter(o => (o as any).status === 'refunded').length
        },
        averageProcessingTime: 0, // Se calcularía basado en timestamps
        recentUpdates: [] // Últimas actualizaciones de tracking
      };

      res.json(stats);
    } catch (error) {
      console.error('Error obteniendo estadísticas de tracking:', error);
      res.status(500).json({ message: 'Error obteniendo estadísticas de tracking' });
    }
  });

  // Sistema de gestión de sesiones (admin)
  app.get('/api/admin/sessions', requireAdmin, async (req, res) => {
    try {
      const { type = 'active' } = req.query;
      
      let sessions;
      if (type === 'all') {
        sessions = await storage.getAllSessions();
      } else if (type === 'expired') {
        const allSessions = await storage.getAllSessions();
        const now = new Date();
        sessions = allSessions.filter(s => s.expiresAt && new Date(s.expiresAt.toDate()) <= now);
      } else {
        sessions = await storage.getActiveSessions();
      }
      
      res.json(sessions);
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      res.status(500).json({ message: 'Error obteniendo sesiones' });
    }
  });

  app.get('/api/admin/sessions/:sid', requireAdmin, async (req, res) => {
    try {
      const { sid } = req.params;
      const session = await storage.getSessionById(sid);
      
      if (!session) {
        return res.status(404).json({ message: 'Sesión no encontrada' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      res.status(500).json({ message: 'Error obteniendo sesión' });
    }
  });

  app.delete('/api/admin/sessions/:sid', requireAdmin, async (req, res) => {
    try {
      const { sid } = req.params;
      await storage.sessionStore.destroy(sid);
      
      res.json({ message: 'Sesión eliminada exitosamente' });
    } catch (error) {
      console.error('Error eliminando sesión:', error);
      res.status(500).json({ message: 'Error eliminando sesión' });
    }
  });

  app.post('/api/admin/sessions/cleanup', requireAdmin, async (_req, res) => {
    try {
      const deletedCount = await storage.deleteExpiredSessions();
      
      res.json({ 
        message: `${deletedCount} sesiones expiradas eliminadas`,
        deletedCount 
      });
    } catch (error) {
      console.error('Error limpiando sesiones:', error);
      res.status(500).json({ message: 'Error limpiando sesiones' });
    }
  });

  app.get('/api/admin/sessions-stats', requireAdmin, async (_req, res) => {
    try {
      const stats = await storage.getSessionStats();
      res.json(stats);
    } catch (error) {
      console.error('Error obteniendo estadísticas de sesiones:', error);
      res.status(500).json({ message: 'Error obteniendo estadísticas de sesiones' });
    }
  });

  // Endpoint para configuraciones de colecciones
  app.get('/api/admin/settings/collections', requireAdmin, async (_req, res) => {
    try {
      const setting = await storage.getSetting('collections_enabled');
      res.json({ enabled: setting === 'true' || setting === null });
    } catch (error) {
      console.error('Error obteniendo configuración de colecciones:', error);
      res.status(500).json({ message: 'Error obteniendo configuración de colecciones' });
    }
  });

  app.put('/api/admin/settings/collections', requireAdmin, async (req, res) => {
    try {
      const { enabled } = req.body;
      await storage.setSetting('collections_enabled', enabled.toString());
      res.json({ enabled });
    } catch (error) {
      console.error('Error actualizando configuración de colecciones:', error);
      res.status(500).json({ message: 'Error actualizando configuración de colecciones' });
    }
  });

  // Endpoint avanzado para crear sesión de pago con Stripe
  app.post('/api/stripe/create-checkout-session', requireAuth, async (req, res) => {
    try {
      const { currency, customerEmail } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
      
      if (!['eur', 'usd'].includes((currency || '').toLowerCase())) {
        return res.status(400).json({ message: 'Moneda inválida' });
      }

      // Obtener carrito desde Firestore usando userId
      const items = await storage.getCartItems(userId);
      if (!items.length) {
        return res.status(400).json({ message: 'El carrito está vacío' });
      }

      // Validar stock real y obtener datos actualizados de perfumes
      const validatedItems = [];
      let totalAmount = 0;

      for (const item of items) {
        try {
          // Obtener perfume actualizado desde Firebase
          const perfume = await storage.getPerfumeById((item as any).perfumeId);
          if (!perfume) {
            return res.status(400).json({ 
              message: `Perfume ${(item as any).name} no encontrado` 
            });
          }

          // Validar stock real
          if (!perfume.inStock) {
            return res.status(400).json({ 
              message: `Perfume ${perfume.name} no está disponible en stock` 
            });
          }

          // Validar cantidad
          if ((item as any).quantity <= 0) {
            return res.status(400).json({ 
              message: `Cantidad inválida para ${perfume.name}` 
            });
          }

          // Calcular precio con descuento si aplica
          let finalPrice = parseFloat((item as any).price);
          if (perfume.isOnOffer && perfume.discountPercentage) {
            const discount = parseFloat(perfume.discountPercentage) / 100;
            finalPrice = finalPrice * (1 - discount);
          }

          validatedItems.push({
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
                name: perfume.name,
                description: `${perfume.brand} - ${(item as any).size}`,
                images: perfume.imageUrl ? [perfume.imageUrl] : [],
              },
              unit_amount: Math.round(finalPrice * 100), // Stripe espera centavos
            },
            quantity: (item as any).quantity,
          });

          totalAmount += finalPrice * (item as any).quantity;

        } catch (error) {
                      console.error(`Error validando item ${(item as any).name}:`, error);
          return res.status(400).json({ 
              message: `Error validando ${(item as any).name}`
          });
        }
      }

      // Crear sesión de pago con validaciones adicionales
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: validatedItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
        metadata: { 
          userId,
          totalItems: items.length,
          totalAmount: totalAmount.toFixed(2)
        },
        currency: currency.toLowerCase(),
        customer_email: customerEmail, // Email del cliente si está disponible
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['ES', 'US', 'MX', 'AR', 'CL', 'CO', 'PE'],
        },
        payment_intent_data: {
          metadata: {
            userId,
            items: JSON.stringify(items.map(item => ({
              perfumeId: (item as any).perfumeId,
              size: (item as any).size,
              quantity: (item as any).quantity
            })))
          }
        }
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creando sesión de Stripe:', error);
      
      // Manejo específico de errores de Stripe
      if (error.type === 'StripeCardError') {
        return res.status(400).json({ 
          message: 'Error con la tarjeta de crédito. Verifica los datos.' 
        });
      } else if (error.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ 
          message: 'Datos de pago inválidos. Verifica la información.' 
        });
      } else if (error.type === 'StripeAPIError') {
        return res.status(500).json({ 
          message: 'Error del servidor de pagos. Intenta más tarde.' 
        });
      }
      
      res.status(500).json({ 
        message: 'Error interno del servidor' 
      });
    }
  });

  // Webhook de Stripe para registrar la orden solo si el pago es exitoso
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error('Webhook signature error:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sessionId = session.metadata.sessionId;
      
      try {
      // Obtener carrito y datos del cliente
      const items = await storage.getCartItems(sessionId);
        if (!items.length) {
          console.error('Carrito vacío en webhook para sesión:', sessionId);
          return res.status(400).json({ error: 'Carrito vacío' });
        }

        // Validar stock una vez más antes de procesar la orden
        const validatedItems = [];
        for (const item of items) {
          const perfume = await storage.getPerfumeById((item as any).perfumeId);
          if (!perfume || !perfume.inStock) {
            console.error(`Stock insuficiente para ${(item as any).name} en sesión:`, sessionId);
            // Reembolsar automáticamente si no hay stock
            await stripe.refunds.create({
              payment_intent: session.payment_intent,
              reason: 'requested_by_customer'
            });
            return res.status(400).json({ 
              error: `Stock insuficiente para ${(item as any).name}` 
            });
          }
          validatedItems.push(item);
        }

      const orderData = {
        customer_email: session.customer_email,
        amount_total: session.amount_total / 100,
        currency: session.currency,
        payment_intent: session.payment_intent,
        stripe_session_id: session.id,
          status: 'paid',
          shipping_address: session.shipping_address,
          billing_address: session.billing_address,
        };

        // Crear orden en Firebase
        const order = await storage.createOrder(orderData, validatedItems);
        
        // Actualizar stock de perfumes (aquí se implementaría la lógica de stock)
        for (const item of validatedItems) {
          try {
            // Aquí se actualizaría el stock del perfume
            // await storage.updatePerfumeStock(item.perfumeId, -item.quantity);
            console.log(`Stock actualizado para ${(item as any).name}: -${(item as any).quantity}`);
          } catch (error) {
                          console.error(`Error actualizando stock para ${(item as any).name}:`, error);
          }
        }

        // Limpiar carrito
        await storage.clearCart(sessionId);

        // Enviar emails
        try {
          const resumen = validatedItems.map(i => 
            `<li>${(i as any).name} (${(i as any).size}) x${(i as any).quantity} - ${(i as any).price} ${session.currency.toUpperCase()}</li>`
          ).join('');

          // Email al cliente
        await transporter.sendMail({
            from: 'lhdecant@gmail.com',
          to: session.customer_email,
            subject: '¡Gracias por tu compra en LhDecant!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #D4AF37;">¡Gracias por tu compra!</h2>
                <p>Tu pedido ha sido procesado exitosamente.</p>
                <h3>Resumen de tu compra:</h3>
                <ul>${resumen}</ul>
                <p><strong>Total: ${orderData.amount_total} ${session.currency.toUpperCase()}</strong></p>
                <p>Número de orden: <strong>${order.id}</strong></p>
                <p>Te enviaremos un email cuando tu pedido esté listo para envío.</p>
                <p>Gracias por elegir LhDecant!</p>
              </div>
            `
          });

          // Email al admin
        await transporter.sendMail({
            from: 'lhdecant@gmail.com',
          to: process.env.ADMIN_EMAIL,
            subject: 'Nueva venta realizada - LhDecant',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #D4AF37;">Nueva venta realizada</h2>
                <p><strong>Cliente:</strong> ${session.customer_email}</p>
                <p><strong>Orden:</strong> ${order.id}</p>
                <h3>Productos:</h3>
                <ul>${resumen}</ul>
                <p><strong>Total: ${orderData.amount_total} ${session.currency.toUpperCase()}</strong></p>
                <p><strong>Dirección de envío:</strong></p>
                <p>${session.shipping_address?.line1 || ''}<br>
                ${session.shipping_address?.city || ''}, ${session.shipping_address?.state || ''}<br>
                ${session.shipping_address?.postal_code || ''}, ${session.shipping_address?.country || ''}</p>
              </div>
            `
          });

        } catch (emailError) {
          console.error('Error enviando emails:', emailError);
          // No fallar la orden por error de email
        }

        console.log('Pago exitoso procesado para sesión:', sessionId);
        
      } catch (err) {
        console.error('Error procesando webhook:', err);
        
        // Intentar reembolsar en caso de error
        try {
          await stripe.refunds.create({
            payment_intent: session.payment_intent,
            reason: 'requested_by_customer'
          });
          console.log('Reembolso procesado por error en webhook');
        } catch (refundError) {
          console.error('Error procesando reembolso:', refundError);
        }
        
        return res.status(500).json({ error: 'Error procesando pago' });
      }
    }

    res.json({ received: true });
  });

  // Endpoint para verificar estado del pago
  app.get('/api/stripe/payment-status/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID requerido' });
      }

      // Buscar la sesión en Stripe
      const sessions = await stripe.checkout.sessions.list({
        limit: 1,
        expand: ['data.payment_intent']
      });

      const session = sessions.data.find(s => s.metadata?.sessionId === sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Sesión no encontrada' });
      }

      const status = {
        sessionId: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        amount: session.amount_total / 100,
        currency: session.currency,
        customerEmail: session.customer_email,
        createdAt: new Date(session.created * 1000),
        expiresAt: new Date(session.expires_at * 1000)
      };

      res.json(status);
    } catch (error) {
      console.error('Error verificando estado del pago:', error);
      res.status(500).json({ message: 'Error verificando estado del pago' });
    }
  });

  // Endpoint para obtener información de reembolso
  app.post('/api/stripe/refund', async (req, res) => {
    try {
      const { paymentIntentId, reason } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: 'Payment Intent ID requerido' });
      }

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: reason || 'requested_by_customer'
      });

      res.json({
        id: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency
      });
    } catch (error) {
      console.error('Error procesando reembolso:', error);
      res.status(500).json({ message: 'Error procesando reembolso' });
    }
  });

  // Endpoint para recuperación de contraseña
  app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requerido' });
    // Buscar usuario
    let user = await storage.getUserByUsername(email);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    // Guardar token y expiración en Firestore (colección 'passwordResets')
    await storage.savePasswordResetToken(email, token);
    // Enviar email con link
    const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${token}&email=${encodeURIComponent(email)}`;
    await transporter.sendMail({
      from: 'lhdecant@gmail.com',
      to: email,
      subject: 'Recupera tu contraseña',
      html: `<b>Recupera tu contraseña</b><br>Haz clic en el siguiente enlace para restablecer tu contraseña:<br><a href="${resetUrl}">${resetUrl}</a><br>Si no solicitaste este cambio, ignora este email.`
    });
    res.json({ message: 'Email de recuperación enviado' });
  });

  // Endpoint para resetear contraseña con token
  app.post('/api/reset-password', async (req, res) => {
    const { email, token, password } = req.body;
    if (!email || !token || !password) return res.status(400).json({ message: 'Datos incompletos' });
    // Buscar token en Firestore
    const resetRef = (await storage.getPasswordResetToken(email));
    if (!resetRef || resetRef.token !== token) return res.status(400).json({ message: 'Token inválido o expirado' });
    // Cambiar contraseña del usuario
    await storage.updateUserPassword(email, password);
    // Eliminar token
    await storage.deletePasswordResetToken(email);
    res.json({ message: 'Contraseña actualizada' });
  });

  // User settings endpoints
  app.get('/api/user/settings', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const settings = await storage.getUserSettings(req.user.id);
      res.json(settings);
    } catch (error) {
      console.error('Error getting user settings:', error);
      res.status(500).json({ error: 'Error getting settings' });
    }
  });

  app.put('/api/user/settings', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const settings = req.body;
      const updatedSettings = await storage.updateUserSettings(req.user.id, settings);
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      res.status(500).json({ error: 'Error updating settings' });
    }
  });

  // Data export endpoint
  app.get('/api/user/export-data', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { format = 'json' } = req.query;
      const userData = await storage.exportUserData(req.user.id, format as string);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user-data-${new Date().toISOString().split('T')[0]}.${format}"`);
      res.json(userData);
    } catch (error) {
      console.error('Error exporting user data:', error);
      res.status(500).json({ error: 'Error exporting data' });
    }
  });

  // Delete account endpoint
  app.delete('/api/user/delete-account', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { password } = req.body;
      await storage.deleteUserAccount(req.user.id, password);
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Error deleting account' });
    }
  });

  // Coupons endpoints
  app.get('/api/coupons/available', async (_req, res) => {
    try {
      const coupons = await storage.getAvailableCoupons();
      res.json(coupons);
    } catch (error) {
      console.error('Error getting available coupons:', error);
      res.status(500).json({ error: 'Error getting coupons' });
    }
  });

  app.get('/api/user-coupons', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const coupons = await storage.getUserCoupons(req.user.id);
      res.json(coupons);
    } catch (error) {
      console.error('Error getting user coupons:', error);
      res.status(500).json({ error: 'Error getting user coupons' });
    }
  });

  app.post('/api/coupons/apply', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { code } = req.body;
      const result = await storage.applyCoupon(req.user.id, code);
      res.json(result);
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Error applying coupon' });
    }
  });

  // Reviews endpoints
  app.get('/api/reviews', async (req, res) => {
    try {
      const { search, filter, sort } = req.query;
      const reviews = await storage.getReviews({
        search: search as string,
        filter: filter as string,
        sort: sort as string,
      });
      res.json(reviews);
    } catch (error) {
      console.error('Error getting reviews:', error);
      res.status(500).json({ error: 'Error getting reviews' });
    }
  });

  app.get('/api/user-reviews', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const reviews = await storage.getUserReviews(req.user.id);
      res.json(reviews);
    } catch (error) {
      console.error('Error getting user reviews:', error);
      res.status(500).json({ error: 'Error getting user reviews' });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const review = await storage.createReview(req.user.id, req.body);
      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Error creating review' });
    }
  });

  app.put('/api/reviews/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const review = await storage.updateReview(req.params.id, req.user.id, req.body);
      res.json(review);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ error: 'Error updating review' });
    }
  });

  app.delete('/api/reviews/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.deleteReview(req.params.id, req.user.id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Error deleting review' });
    }
  });

  app.post('/api/reviews/:id/helpful', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const result = await storage.markReviewHelpful(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error marking review helpful:', error);
      res.status(500).json({ error: 'Error marking review helpful' });
    }
  });

  // Endpoint para obtener reseñas de usuario específico
  app.get('/api/reviews/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error('Error obteniendo reseñas de usuario:', error);
      res.status(500).json({ message: 'Error obteniendo reseñas de usuario' });
    }
  });

  // Endpoint para obtener cupones del usuario
  app.get('/api/coupons/user', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const userCoupons = await storage.getUserCoupons(req.user.id);
      res.json(userCoupons);
    } catch (error) {
      console.error('Error obteniendo cupones de usuario:', error);
      res.status(500).json({ message: 'Error obteniendo cupones de usuario' });
    }
  });

  // Notifications endpoints
  app.get('/api/notifications', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { filter, showRead, search } = req.query;
      const notifications = await storage.getNotifications(req.user.id, {
        filter: filter as string,
        showRead: showRead === 'true',
        search: search as string,
      });
      res.json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ error: 'Error getting notifications' });
    }
  });

  app.get('/api/notification-settings', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const settings = await storage.getNotificationSettings(req.user.id);
      res.json(settings);
    } catch (error) {
      console.error('Error getting notification settings:', error);
      res.status(500).json({ error: 'Error getting notification settings' });
    }
  });

  app.put('/api/notification-settings', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const settings = await storage.updateNotificationSettings(req.user.id, req.body);
      res.json(settings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ error: 'Error updating notification settings' });
    }
  });

  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.markNotificationAsRead(req.params.id, req.user.id);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Error marking notification as read' });
    }
  });

  app.put('/api/notifications/read-all', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.markAllNotificationsAsRead(req.user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Error marking all notifications as read' });
    }
  });

  app.delete('/api/notifications/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await storage.deleteNotification(req.params.id, req.user.id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Error deleting notification' });
    }
  });

  // User stats and activity endpoints
  app.get('/api/user-stats', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const stats = await storage.getUserStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ error: 'Error getting user stats' });
    }
  });

  app.get('/api/user-activity', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const activity = await storage.getUserActivity(req.user.id);
      res.json(activity);
    } catch (error) {
      console.error('Error getting user activity:', error);
      res.status(500).json({ error: 'Error getting user activity' });
    }
  });

  // Seed perfumes endpoint (admin only)
  app.post('/api/seed-perfumes', async (req, res) => {
    try {
      // Verificar si es admin
      const isAdmin = req.headers['x-admin-key'] === 'lhdecant-admin-2024';
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Acceso denegado" });
      }
      
      const { seedPerfumes } = await import("./seed-perfumes");
      await seedPerfumes();
      
      res.json({ message: "Perfumes cargados exitosamente" });
    } catch (error) {
      console.error('Error seeding perfumes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Add custom perfumes endpoint (admin only)
  app.post('/api/add-perfumes', async (req, res) => {
    try {
      // Verificar si es admin
      const isAdmin = req.headers['x-admin-key'] === 'lhdecant-admin-2024';
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Acceso denegado" });
      }
      
      const { perfumes } = req.body;
      
      if (!perfumes || !Array.isArray(perfumes)) {
        return res.status(400).json({ error: "Se requiere un array de perfumes" });
      }
      
      console.log(`🌱 Agregando ${perfumes.length} perfumes...`);
      
      const perfumesRef = admin.firestore().collection("perfumes");
      let addedCount = 0;
      let skippedCount = 0;
      
      for (const perfume of perfumes) {
        try {
          // Verificar si el perfume ya existe
          const existingPerfumes = await perfumesRef
            .where('name', '==', perfume.name)
            .where('brand', '==', perfume.brand)
            .get();

          if (!existingPerfumes.empty) {
            console.log(`⏭️  Saltando ${perfume.name} - ${perfume.brand} (ya existe)`);
            skippedCount++;
            continue;
          }

          // Agregar el perfume
          await perfumesRef.add({
            ...perfume,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          console.log(`✅ Agregado: ${perfume.name} - ${perfume.brand}`);
          addedCount++;
          
        } catch (error) {
          console.error(`❌ Error con ${perfume.name}:`, error);
        }
      }
      
      res.json({ 
        message: "Perfumes procesados exitosamente",
        added: addedCount,
        skipped: skippedCount,
        total: addedCount + skippedCount
      });
      
    } catch (error) {
      console.error('Error adding perfumes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Delete perfume endpoint (admin only)
  app.delete('/api/admin/perfumes/:id', async (req, res) => {
    try {
      // Verificar si es admin
      const isAdmin = req.headers['x-admin-key'] === 'lhdecant-admin-2024';
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Acceso denegado" });
      }
      
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: "Se requiere el ID del perfume" });
      }
      
      console.log(`🗑️  Eliminando perfume con ID: ${id}`);
      
      const perfumeRef = admin.firestore().collection("perfumes").doc(id);
      const perfumeDoc = await perfumeRef.get();
      
      if (!perfumeDoc.exists) {
        return res.status(404).json({ error: "Perfume no encontrado" });
      }
      
      const perfumeData = perfumeDoc.data();
      await perfumeRef.delete();
      
      console.log(`✅ Eliminado: ${perfumeData.name} - ${perfumeData.brand}`);
      
      res.json({ 
        message: "Perfume eliminado exitosamente",
        deletedPerfume: {
          id,
          name: perfumeData.name,
          brand: perfumeData.brand
        }
      });
      
    } catch (error) {
      console.error('Error deleting perfume:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
