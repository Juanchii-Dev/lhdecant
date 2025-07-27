import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAdmin } from "./auth";
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import express from 'express';
import crypto from 'crypto';

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

  // Create perfume (admin only)
  app.post("/api/perfumes", requireAuth, async (req, res) => {
    try {
      const perfume = await storage.createPerfume(req.body);
      res.status(201).json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Failed to create perfume" });
    }
  });

  // Update perfume (admin only)
  app.put("/api/perfumes/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const perfume = await storage.updatePerfume(id, req.body);
      res.json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Failed to update perfume" });
    }
  });

  // Update perfume with PATCH (admin only)
  app.patch("/api/perfumes/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const perfume = await storage.updatePerfume(id, req.body);
      res.json(perfume);
    } catch (error) {
      res.status(500).json({ message: "Failed to update perfume" });
    }
  });

  // Delete perfume (admin only)
  app.delete("/api/perfumes/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deletePerfume(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete perfume" });
    }
  });

  // Toggle homepage display
  app.patch("/api/perfumes/:id/homepage", requireAuth, async (req, res) => {
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
  app.patch("/api/perfumes/:id/offer", requireAuth, async (req, res) => {
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
      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await storage.removeFromCart(id);
      res.sendStatus(204);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
