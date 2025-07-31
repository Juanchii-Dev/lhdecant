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

  // User routes
  app.get('/api/user', (req, res) => {
    if (!req.session || !(req.session as any).user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    res.json((req.session as any).user);
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
        timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      cors: 'ultra-permissive',
      version: '2.0.0'
    });
  });

  // Debug endpoint para verificar CORS
  app.get('/api/debug/cors', (req, res) => {
    const origin = req.headers.origin;
      
      res.json({ 
      origin: origin,
      corsHeaders: {
        'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials')
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  // Debug endpoint para verificar variables de entorno
  app.get('/api/debug/env', (req, res) => {
      res.json({
      NODE_ENV: process.env.NODE_ENV,
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '***SET***' : 'NOT_SET',
      FRONTEND_URL: process.env.FRONTEND_URL,
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
