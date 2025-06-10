import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const perfumes = pgTable("perfumes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  price5ml: decimal("price_5ml", { precision: 10, scale: 2 }).notNull(),
  price10ml: decimal("price_10ml", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // "masculine", "feminine", "unisex", "niche"
  notes: text("notes").array().notNull(),
  imageUrl: text("image_url").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  inStock: boolean("in_stock").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  theme: text("theme").notNull(), // "summer", "winter", "date_night", "office", "weekend"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url").notNull(),
  perfumeIds: integer("perfume_ids").array().notNull(),
  isNew: boolean("is_new").default(false),
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPerfumeSchema = createInsertSchema(perfumes).omit({
  id: true,
  createdAt: true,
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPerfume = z.infer<typeof insertPerfumeSchema>;
export type Perfume = typeof perfumes.$inferSelect;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
