import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAdmin } from "./auth";
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import express from 'express';
import crypto from 'crypto';
import { admin } from "./storage";
import { uploadFromUrl, deleteImage, isCloudinaryUrl } from "./cloudinary";

const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

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
  app.get("/api/perfumes", async (req, res) => {
    try {
      const perfumes = await storage.getPerfumes();
      res.json(perfumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch perfumes" });
    }
  });

  app.get("/api/perfumes/homepage", async (req, res) => {
    try {
      const perfumes = await storage.getHomepagePerfumes();
      res.json(perfumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch homepage perfumes" });
    }
  });

  // Get perfumes by category
  app.get("/api/perfumes/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const perfumes = await storage.getPerfumesByCategory(category);
      res.json(perfumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch perfumes by category" });
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
      res.status(500).json({ message: "Failed to fetch perfume" });
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
      res.status(500).json({ message: "Failed to create perfume" });
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
      res.status(500).json({ message: "Failed to update perfume" });
    }
  });

  // Update perfume with PATCH (admin only)
  app.patch("/api/perfumes/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const perfume = await storage.updatePerfume(id, req.body);
      res.json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Failed to update perfume" });
    }
  });

  // Delete perfume (admin only)
  app.delete("/api/perfumes/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deletePerfume(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete perfume" });
    }
  });

  // Image upload endpoints
  app.post("/api/images/upload", requireAdmin, async (req, res) => {
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

  app.delete("/api/images/:publicId", requireAdmin, async (req, res) => {
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
      res.status(500).json({ message: "Failed to update homepage display" });
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
      res.status(500).json({ message: "Failed to update offer status" });
    }
  });

  // Get all collections
  app.get("/api/collections", async (req, res) => {
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
      res.status(500).json({ message: "Failed to fetch collections" });
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
      res.status(500).json({ message: "Failed to create collection" });
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
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // Update collection (admin only)
  app.put("/api/collections/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const collection = await storage.updateCollection(id, req.body);
      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update collection" });
    }
  });

  // Delete collection (admin only)
  app.delete("/api/collections/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteCollection(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const message = await storage.createContactMessage(req.body);
      res.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Cart routes
  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      console.log('Adding to cart with sessionId:', sessionId);
      const cartItem = await storage.addToCart(sessionId, req.body);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      console.log('Getting cart with sessionId:', sessionId);
      const items = await storage.getCartItems(sessionId);
      console.log('Cart items found:', items.length);
      res.json(items);
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { quantity } = req.body;
      const sessionId = req.sessionID;
      const updatedItem = await storage.updateCartItemQuantity(id, quantity, sessionId);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const sessionId = req.sessionID;
      await storage.removeFromCart(id, sessionId);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      await storage.clearCart(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
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
      res.status(500).json({ message: "Failed to fetch favorites" });
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
      res.status(500).json({ message: "Failed to add favorite" });
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
      res.status(500).json({ message: "Failed to remove favorite" });
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
      res.status(500).json({ message: "Failed to fetch profile" });
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
      res.status(500).json({ message: "Failed to update profile" });
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
      res.status(500).json({ message: "Failed to change password" });
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
      res.status(500).json({ message: "Failed to fetch addresses" });
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
      res.status(500).json({ message: "Failed to add address" });
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
      res.status(500).json({ message: "Failed to update address" });
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
      res.status(500).json({ message: "Failed to delete address" });
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
      res.status(500).json({ message: "Failed to set default address" });
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
      res.status(500).json({ message: "Failed to fetch payment methods" });
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
      res.status(500).json({ message: "Failed to add payment method" });
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
      res.status(500).json({ message: "Failed to delete payment method" });
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
      res.status(500).json({ message: "Failed to set default payment method" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
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
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", requireAuth, async (req, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
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
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Endpoints para dashboard admin
  app.get('/api/admin/orders', requireAdmin, async (req, res) => {
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
  app.get('/api/admin/dashboard-stats', requireAdmin, async (req, res) => {
    try {
      const perfumes = await storage.getPerfumes();
      const orders = await storage.getOrders();
      const collections = await storage.getCollections();
      
      // Calcular estadísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ordersToday = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      const perfumesOnOffer = perfumes.filter(p => p.isOnOffer);
      
      const stats = {
        totalPerfumes: perfumes.length,
        ordersToday: ordersToday.length,
        totalCollections: collections.length,
        perfumesOnOffer: perfumesOnOffer.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.amount_total || 0), 0)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  });

  // Endpoint para obtener pedidos recientes
  app.get('/api/admin/recent-orders', requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      
      res.json(recentOrders);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener pedidos recientes' });
    }
  });

  // Endpoint para obtener perfumes populares
  app.get('/api/admin/popular-perfumes', requireAdmin, async (req, res) => {
    try {
      const perfumes = await storage.getPerfumes();
      // Por ahora retornamos los primeros 5, pero aquí se podría implementar
      // lógica basada en ventas reales
      const popularPerfumes = perfumes.slice(0, 5);
      
      res.json(popularPerfumes);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener perfumes populares' });
    }
  });

  // Endpoint para estadísticas de usuarios
  app.get('/api/admin/user-stats', requireAdmin, async (req, res) => {
    try {
      // Obtener todos los usuarios
      const usersRef = db.collection('users');
      const usersSnapshot = await usersRef.get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newUsersToday = users.filter(user => {
        const userDate = new Date(user.createdAt);
        userDate.setHours(0, 0, 0, 0);
        return userDate.getTime() === today.getTime();
      });

      const stats = {
        totalUsers: users.length,
        newUsersToday: newUsersToday.length,
        activeUsers: users.filter(u => u.lastLoginAt && 
          new Date(u.lastLoginAt).getTime() > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
        ).length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener estadísticas de usuarios' });
    }
  });

  // Endpoint para estadísticas de ventas
  app.get('/api/admin/sales-stats', requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const ordersThisMonth = orders.filter(order => 
        new Date(order.createdAt) >= thisMonth
      );
      
      const ordersLastMonth = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= lastMonth && orderDate < thisMonth;
      });
      
      const totalRevenueThisMonth = ordersThisMonth.reduce((sum, order) => 
        sum + (order.amount_total || 0), 0
      );
      
      const totalRevenueLastMonth = ordersLastMonth.reduce((sum, order) => 
        sum + (order.amount_total || 0), 0
      );
      
      const avgOrderValue = orders.length > 0 ? 
        orders.reduce((sum, order) => sum + (order.amount_total || 0), 0) / orders.length : 0;
      
      const stats = {
        totalRevenue: orders.reduce((sum, order) => sum + (order.amount_total || 0), 0),
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
  app.get('/api/admin/contact-messages', requireAdmin, async (req, res) => {
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
        readBy: req.user.id 
      });
      
      res.json({ message: 'Mensaje marcado como leído' });
    } catch (error) {
      res.status(500).json({ message: 'Error al marcar mensaje como leído' });
    }
  });

  // Endpoint para obtener todos los usuarios
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const usersRef = db.collection('users');
      const usersSnapshot = await usersRef.orderBy('createdAt', 'desc').get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios' });
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
        updatedBy: req.user.id 
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

  app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ message: 'Estado requerido' });
      const order = await storage.updateOrderStatus(req.params.id, status);
      // Notificar al cliente por email
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: order.customer_email,
          subject: 'Actualización de tu pedido',
          html: `<b>El estado de tu pedido ha cambiado a:</b> ${status}`
        });
      } catch (err) {
        console.error('Error enviando email de estado:', err);
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el estado de la orden' });
    }
  });

  // Endpoint avanzado para crear sesión de pago con Stripe
  app.post('/api/stripe/create-checkout-session', async (req, res) => {
    try {
      const { sessionId, currency } = req.body;
      if (!sessionId || !['eur', 'usd'].includes((currency || '').toLowerCase())) {
        return res.status(400).json({ message: 'Datos de sesión o moneda inválidos' });
      }
      // Obtener carrito desde Firestore
      const items = await storage.getCartItems(sessionId);
      if (!items.length) return res.status(400).json({ message: 'El carrito está vacío' });

      // Validar stock y preparar líneas de pago
      const lineItems = [];
      for (const item of items) {
        // Aquí deberías obtener el perfume real y validar stock/precio
        // Por simplicidad, se asume que el item ya tiene nombre, precio y cantidad correctos
        if (!item.price || !item.name) {
          return res.status(400).json({ message: 'Faltan datos de producto en el carrito' });
        }
        lineItems.push({
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: item.name,
              description: item.description || '',
            },
            unit_amount: Math.round(item.price * 100), // Stripe espera centavos
          },
          quantity: item.quantity || 1,
        });
      }

      // Crear sesión de pago
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cart`,
        metadata: { sessionId },
        currency: currency.toLowerCase(),
      });
      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creando sesión de Stripe:', error);
      res.status(500).json({ message: 'Error creando sesión de pago' });
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
      // Obtener carrito y datos del cliente
      const items = await storage.getCartItems(sessionId);
      const orderData = {
        customer_email: session.customer_email,
        amount_total: session.amount_total / 100,
        currency: session.currency,
        payment_intent: session.payment_intent,
        stripe_session_id: session.id,
      };
      try {
        const order = await storage.createOrder(orderData, items);
        await storage.clearCart(sessionId);
        // Email con resumen
        const resumen = items.map(i => `<li>${i.name} (${i.size}) x${i.quantity} - ${i.price} ${session.currency.toUpperCase()}</li>`).join('');
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: session.customer_email,
          subject: '¡Gracias por tu compra!',
          html: `<b>¡Gracias por tu compra!</b><br>Tu pedido ha sido recibido.<ul>${resumen}</ul><br>Total: <b>${orderData.amount_total} ${session.currency.toUpperCase()}</b>`
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: process.env.ADMIN_EMAIL,
          subject: 'Nueva venta realizada',
          html: `<b>Nueva venta realizada</b><br>Cliente: ${session.customer_email}<ul>${resumen}</ul><br>Total: <b>${orderData.amount_total} ${session.currency.toUpperCase()}</b>`
        });
      } catch (err) {
        console.error('Error registrando orden o enviando emails:', err);
      }
      console.log('Pago exitoso para sesión:', sessionId);
    }
    res.json({ received: true });
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
      from: process.env.SMTP_FROM,
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
  app.get('/api/coupons/available', async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
