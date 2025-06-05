import { pgTable, text, serial, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const perfumes = pgTable("perfumes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // "masculine", "feminine", "unisex", "niche"
  notes: text("notes").array().notNull(),
  imageUrl: text("image_url").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  inStock: boolean("in_stock").default(true),
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
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertPerfumeSchema = createInsertSchema(perfumes).omit({
  id: true,
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertPerfume = z.infer<typeof insertPerfumeSchema>;
export type Perfume = typeof perfumes.$inferSelect;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
