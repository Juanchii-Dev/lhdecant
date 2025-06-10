import { perfumes, collections, contactMessages, users, type Perfume, type Collection, type ContactMessage, type InsertPerfume, type InsertCollection, type InsertContactMessage, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();