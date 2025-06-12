import { perfumes, collections, contactMessages, users, cartItems, orders, orderItems, type Perfume, type Collection, type ContactMessage, type InsertPerfume, type InsertCollection, type InsertContactMessage, type User, type InsertUser, type CartItem, type InsertCartItem, type Order, type InsertOrder, type OrderItem, type InsertOrderItem } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Perfumes
  getPerfumes(): Promise<Perfume[]>;
  getPerfumesByCategory(category: string): Promise<Perfume[]>;
  getPerfume(id: number): Promise<Perfume | undefined>;
  createPerfume(perfume: InsertPerfume): Promise<Perfume>;
  updatePerfume(id: number, perfume: Partial<InsertPerfume>): Promise<Perfume>;
  deletePerfume(id: number): Promise<void>;

  // Collections
  getCollections(): Promise<Collection[]>;
  getCollection(id: number): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Cart
  addToCart(sessionId: string, item: InsertCartItem): Promise<CartItem>;
  getCartItems(sessionId: string): Promise<(CartItem & { perfume: Perfume })[]>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;

  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<(Order & { items: OrderItem[] }) | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Session Store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPerfumes(): Promise<Perfume[]> {
    return await db.select().from(perfumes);
  }

  async getPerfumesByCategory(category: string): Promise<Perfume[]> {
    return await db.select().from(perfumes).where(eq(perfumes.category, category));
  }

  async getPerfume(id: number): Promise<Perfume | undefined> {
    const [perfume] = await db.select().from(perfumes).where(eq(perfumes.id, id));
    return perfume || undefined;
  }

  async createPerfume(insertPerfume: InsertPerfume): Promise<Perfume> {
    const [perfume] = await db
      .insert(perfumes)
      .values(insertPerfume)
      .returning();
    return perfume;
  }

  async updatePerfume(id: number, updateData: Partial<InsertPerfume>): Promise<Perfume> {
    const [perfume] = await db
      .update(perfumes)
      .set(updateData)
      .where(eq(perfumes.id, id))
      .returning();
    return perfume;
  }

  async deletePerfume(id: number): Promise<void> {
    await db.delete(perfumes).where(eq(perfumes.id, id));
  }

  async getCollections(): Promise<Collection[]> {
    return await db.select().from(collections);
  }

  async getCollection(id: number): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection || undefined;
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const [collection] = await db
      .insert(collections)
      .values(insertCollection)
      .returning();
    return collection;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async addToCart(sessionId: string, item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.sessionId, sessionId),
        eq(cartItems.perfumeId, item.perfumeId),
        eq(cartItems.size, item.size)
      ))
      .limit(1);

    if (existingItem.length > 0) {
      // Update quantity if item exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem[0].quantity + item.quantity })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db
        .insert(cartItems)
        .values({ ...item, sessionId })
        .returning();
      return newItem;
    }
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { perfume: Perfume })[]> {
    const items = await db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        perfumeId: cartItems.perfumeId,
        size: cartItems.size,
        quantity: cartItems.quantity,
        price: cartItems.price,
        createdAt: cartItems.createdAt,
        perfume: {
          id: perfumes.id,
          name: perfumes.name,
          brand: perfumes.brand,
          description: perfumes.description,
          price5ml: perfumes.price5ml,
          price10ml: perfumes.price10ml,
          category: perfumes.category,
          notes: perfumes.notes,
          imageUrl: perfumes.imageUrl,
          rating: perfumes.rating,
          inStock: perfumes.inStock,
          createdAt: perfumes.createdAt,
        }
      })
      .from(cartItems)
      .innerJoin(perfumes, eq(cartItems.perfumeId, perfumes.id))
      .where(eq(cartItems.sessionId, sessionId));

    return items;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();

    // Insert order items
    const orderItemsWithOrderId = items.map(item => ({ ...item, orderId: newOrder.id }));
    await db.insert(orderItems).values(orderItemsWithOrderId);

    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(orders.createdAt);
  }

  async getOrder(id: number): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...order, items };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
}

export const storage = new DatabaseStorage();