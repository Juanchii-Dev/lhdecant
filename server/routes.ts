import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertPerfumeSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Middleware to check if user is authenticated for admin routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  // Get all perfumes
  app.get("/api/perfumes", async (req, res) => {
    try {
      const perfumes = await storage.getPerfumes();
      res.json(perfumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch perfumes" });
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
      const id = parseInt(req.params.id);
      const perfume = await storage.getPerfume(id);
      if (!perfume) {
        return res.status(404).json({ message: "Perfume not found" });
      }
      res.json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch perfume" });
    }
  });

  // Create perfume (admin only)
  app.post("/api/perfumes", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPerfumeSchema.parse(req.body);
      const perfume = await storage.createPerfume(validatedData);
      res.status(201).json(perfume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid perfume data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create perfume" });
    }
  });

  // Update perfume (admin only)
  app.put("/api/perfumes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPerfumeSchema.partial().parse(req.body);
      const perfume = await storage.updatePerfume(id, validatedData);
      res.json(perfume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid perfume data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update perfume" });
    }
  });

  // Delete perfume (admin only)
  app.delete("/api/perfumes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePerfume(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete perfume" });
    }
  });

  // Get all collections
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  // Get single collection
  app.get("/api/collections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getCollection(id);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid form data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
