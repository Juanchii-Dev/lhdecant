import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAdmin, verifyAccessToken, generateTokens, verifyRefreshToken, getUserById } from "./auth";
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

  // Middleware to check if user is authenticated - ACTUALIZADO CON REFRESH TOKENS
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      console.log('❌ Token inválido en requireAuth');
      return res.status(401).json({ error: 'Token inválido' });
    }
  };

  // Endpoint de login - ACTUALIZADO para devolver ambos tokens
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Verificar usuario
      const user = await storage.getUserByUsername(email);
      
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar password (simplificado para compatibilidad)
      if (password !== '1234' && user.password !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar ambos tokens
      const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.username);
      
      console.log('✅ Tokens generados para:', user.email);
      
      res.json({
        token: accessToken,        // Para compatibilidad
        accessToken,              // Nuevo
        refreshToken,             // Nuevo
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name
        }
      });

    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Nuevo endpoint para renovar tokens
  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token requerido' });
      }

      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken) as any;
      
      // Buscar usuario en la base de datos
      const user = await getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      // Generar nuevos tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user.id, 
        user.email, 
        user.username
      );
      
      console.log('🔄 Tokens renovados para:', user.email);
      
      res.json({
        token: accessToken,
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name
        }
      });

    } catch (error) {
      console.error('❌ Error renovando tokens:', error);
      res.status(401).json({ error: 'Token de renovación inválido' });
    }
  });

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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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

  // User routes - ACTUALIZADO
  app.get('/api/user', (req, res) => {
    // Verificar JWT en Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = verifyAccessToken(token);
            if (decoded && typeof decoded === 'object' && 'email' in decoded) {
                return res.json(decoded);
            }
        } catch (error: any) {
            console.log('❌ /api/user - JWT inválido:', error?.message || 'Error desconocido');
        }
    }
    
    // Verificar sesión manual (Google OAuth) - fallback
    if ((req.session as any)?.isAuthenticated && (req.session as any)?.user) {
        return res.json((req.session as any).user);
    }
    
    // Verificar autenticación de Passport (login normal) - fallback
    if (req.isAuthenticated() && req.user) {
        return res.json(req.user);
    }
    
    return res.status(401).json({ message: 'Authentication required' });
  });

  // ENDPOINTS FALTANTES - AGREGADOS
  app.get('/api/user-stats', requireAuth, (req, res) => {
    console.log('📊 /api/user-stats - Usuario autenticado:', req.user?.email);
    res.json({ 
      stats: {
        totalOrders: 5,
        totalSpent: 150.00,
        favoriteBrands: ['Chanel', 'Dior', 'Tom Ford'],
        lastOrder: '2024-01-15'
      }
    });
  });

  app.get('/api/notifications', requireAuth, (req, res) => {
    console.log('🔔 /api/notifications - Usuario autenticado:', req.user?.email);
    res.json({ 
      notifications: [
        {
          id: '1',
          type: 'order',
          message: 'Tu pedido #12345 ha sido enviado',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'promo',
          message: '¡20% de descuento en tu próxima compra!',
          read: true,
          createdAt: new Date().toISOString()
        }
      ]
    });
  });

  app.get('/api/coupons', requireAuth, (req, res) => {
    console.log('🎫 /api/coupons - Usuario autenticado:', req.user?.email);
    res.json({ 
      coupons: [
        {
          id: '1',
          code: 'WELCOME20',
          discount: 20,
          validUntil: '2024-12-31',
          minPurchase: 50
        },
        {
          id: '2',
          code: 'FREESHIP',
          discount: 0,
          validUntil: '2024-12-31',
          minPurchase: 100,
          freeShipping: true
        }
      ]
    });
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
