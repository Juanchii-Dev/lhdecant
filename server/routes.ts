import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAdmin, verifyToken } from "./auth";
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



  // Middleware to check if user is authenticated for admin routes
  const requireAuth = (req: any, res: any, next: any) => {
    console.log('🔍 requireAuth - Headers recibidos:', req.headers);
    console.log('🔑 Authorization header:', req.headers.authorization ? 'SÍ' : 'NO');
    
    // Verificar JWT en Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🔐 Token JWT recibido:', token ? 'SÍ' : 'NO');
      const decoded = verifyToken(token);
      
      if (decoded && typeof decoded === 'object' && 'email' in decoded) {
        console.log('✅ requireAuth - Usuario autenticado via JWT:', (decoded as any).email);
        req.user = decoded;
        return next();
      } else {
        console.log('❌ requireAuth - Token JWT inválido o expirado');
      }
    } else {
      console.log('❌ requireAuth - No se encontró Authorization header válido');
    }
    
    // Verificar sesión manual (Google OAuth) - fallback
    if ((req.session as any)?.isAuthenticated && (req.session as any)?.user) {
      console.log('✅ requireAuth - Usuario autenticado via sesión manual');
      return next();
    }
    
    // Verificar autenticación de Passport (login normal) - fallback
    if (req.isAuthenticated()) {
      console.log('✅ requireAuth - Usuario autenticado via Passport');
      return next();
    }
    
    console.log('❌ requireAuth - Usuario NO autenticado');
    return res.status(401).json({ message: "Authentication required" });
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

  // Cart routes
  app.post("/api/cart", requireAuth, async (req, res) => {
    try {
      // Obtener userId de sesión manual (Google OAuth) o Passport
      let userId;
      if ((req.session as any)?.isAuthenticated && (req.session as any)?.user) {
        userId = (req.session as any).user.id;
      } else if (req.user) {
        userId = req.user.id;
      }
      
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
      // Obtener userId de sesión manual (Google OAuth) o Passport
      let userId;
      if ((req.session as any)?.isAuthenticated && (req.session as any)?.user) {
        userId = (req.session as any).user.id;
      } else if (req.user) {
        userId = req.user.id;
      }
      
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
      
      // Obtener userId de sesión manual (Google OAuth) o Passport
      let userId;
      if ((req.session as any)?.isAuthenticated && (req.session as any)?.user) {
        userId = (req.session as any).user.id;
      } else if (req.user) {
        userId = req.user.id;
      }
      
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
      
      // Obtener userId de sesión manual (Google OAuth) o Passport
      let userId;
      if ((req.session as any)?.isAuthenticated && (req.session as any)?.user) {
        userId = (req.session as any).user.id;
      } else if (req.user) {
        userId = req.user.id;
      }
      
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
      // Obtener userId de sesión manual (Google OAuth) o Passport
      let userId;
      if ((req.session as any)?.isAuthenticated && (req.session as any)?.user) {
        userId = (req.session as any).user.id;
      } else if (req.user) {
        userId = req.user.id;
      }
      
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

  // User routes
  app.get('/api/user', (req, res) => {
    console.log('🔍 /api/user - Headers recibidos:', req.headers);
    console.log('🔑 /api/user - Authorization header:', req.headers.authorization ? 'SÍ' : 'NO');
    
    // Verificar JWT en Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🔐 /api/user - Token JWT recibido:', token ? 'SÍ' : 'NO');
      const decoded = verifyToken(token);
      
      if (decoded && typeof decoded === 'object' && 'email' in decoded) {
        console.log('✅ /api/user - Usuario autenticado via JWT:', (decoded as any).email);
        return res.json(decoded);
      } else {
        console.log('❌ /api/user - Token JWT inválido o expirado');
      }
    } else {
      console.log('❌ /api/user - No se encontró Authorization header válido');
    }
    
    // Verificar sesión manual (Google OAuth) - fallback
    if ((req.session as any)?.isAuthenticated && (req.session as any)?.user) {
      console.log('✅ /api/user - Usuario autenticado via sesión manual');
      return res.json((req.session as any).user);
    }
    
    // Verificar autenticación de Passport (login normal) - fallback
    if (req.isAuthenticated() && req.user) {
      console.log('✅ /api/user - Usuario autenticado via Passport');
      return res.json(req.user);
    }
    
    console.log('❌ /api/user - Usuario NO autenticado');
    return res.status(401).json({ message: 'Authentication required' });
  });

  // Endpoint de prueba para crear sesión manual
  app.get('/api/test-session', (req, res) => {
    console.log('🧪 Creando sesión de prueba...');
    
    // Crear sesión de prueba
    (req.session as any).user = {
      id: 'test-user-123',
      username: 'test@example.com',
      email: 'test@example.com',
      name: 'Usuario de Prueba',
      avatar: null
    };
    (req.session as any).isAuthenticated = true;
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Error al guardar sesión de prueba:', err);
        return res.status(500).json({ error: 'Error al guardar sesión' });
      }
      
      console.log('✅ Sesión de prueba creada:', req.sessionID);
      res.json({ 
        message: 'Sesión de prueba creada',
        sessionId: req.sessionID,
        user: (req.session as any).user
      });
    });
  });





  const httpServer = createServer(app);
  return httpServer;
}
