import { perfumes, collections, contactMessages, type Perfume, type Collection, type ContactMessage, type InsertPerfume, type InsertCollection, type InsertContactMessage } from "@shared/schema";

export interface IStorage {
  // Perfumes
  getPerfumes(): Promise<Perfume[]>;
  getPerfumesByCategory(category: string): Promise<Perfume[]>;
  getPerfume(id: number): Promise<Perfume | undefined>;
  createPerfume(perfume: InsertPerfume): Promise<Perfume>;

  // Collections
  getCollections(): Promise<Collection[]>;
  getCollection(id: number): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
}

export class MemStorage implements IStorage {
  private perfumes: Map<number, Perfume>;
  private collections: Map<number, Collection>;
  private contactMessages: Map<number, ContactMessage>;
  private currentPerfumeId: number;
  private currentCollectionId: number;
  private currentMessageId: number;

  constructor() {
    this.perfumes = new Map();
    this.collections = new Map();
    this.contactMessages = new Map();
    this.currentPerfumeId = 1;
    this.currentCollectionId = 1;
    this.currentMessageId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Sample perfumes
    const samplePerfumes: InsertPerfume[] = [
      {
        name: "Aventus",
        brand: "CREED",
        description: "Frutal, ahumado y elegante",
        price: "25.00",
        category: "masculine",
        notes: ["Piña", "Bergamota", "Abedul", "Pachulí"],
        imageUrl: "https://i.imgur.com/Vgwv7Kh.png",
        rating: "5.0",
        inStock: true,
      },
      {
        name: "Coco Mademoiselle",
        brand: "CHANEL",
        description: "Floral oriental, elegante",
        price: "22.00",
        category: "feminine",
        notes: ["Rosa", "Jazmín", "Pachulí", "Vainilla"],
        imageUrl: "https://i.imgur.com/Vgwv7Kh.png",
        rating: "5.0",
        inStock: true,
      },
      {
        name: "Oud Wood",
        brand: "TOM FORD",
        description: "Woody, oriental, unisex",
        price: "35.00",
        category: "unisex",
        notes: ["Oud", "Madera de Rosa", "Cardamomo", "Sándalo"],
        imageUrl: "https://i.imgur.com/Vgwv7Kh.png",
        rating: "4.0",
        inStock: true,
      },
      {
        name: "By The Fireplace",
        brand: "MAISON MARGIELA",
        description: "Cálido, ahumado, acogedor",
        price: "28.00",
        category: "niche",
        notes: ["Castañas", "Humo", "Vainilla", "Guayacol"],
        imageUrl: "https://i.imgur.com/Vgwv7Kh.png",
        rating: "5.0",
        inStock: true,
      },
      {
        name: "Acqua di Gio Profumo",
        brand: "GIORGIO ARMANI",
        description: "Fresco, marino, masculino",
        price: "20.00",
        category: "masculine",
        notes: ["Bergamota", "Geranio", "Salvia", "Pachulí"],
        imageUrl: "https://i.imgur.com/Vgwv7Kh.png",
        rating: "4.5",
        inStock: true,
      },
      {
        name: "Light Blue Intense",
        brand: "DOLCE & GABBANA",
        description: "Cítrico, fresco, veraniego",
        price: "18.00",
        category: "feminine",
        notes: ["Limón", "Manzana", "Bambú", "Almizcle"],
        imageUrl: "https://i.imgur.com/Vgwv7Kh.png",
        rating: "4.5",
        inStock: true,
      }
    ];

    samplePerfumes.forEach(perfume => {
      const id = this.currentPerfumeId++;
      this.perfumes.set(id, { ...perfume, id });
    });

    // Sample collections
    const sampleCollections: InsertCollection[] = [
      {
        name: "Summer Vibes",
        description: "Fragancias frescas y vibrantes perfectas para los días calurosos. Incluye notas cítricas, marinas y florales ligeras.",
        theme: "summer",
        price: "65.00",
        originalPrice: "75.00",
        imageUrl: "https://i.imgur.com/Vgwv7Kh.png",
        perfumeIds: [5, 6, 1], // Acqua di Gio, Light Blue, Aventus
        isNew: true,
        isPopular: false,
      },
      {
        name: "Winter Warmth",
        description: "Fragancias cálidas y envolventes para las noches frías. Con notas amaderadas, especiadas y orientales.",
        theme: "winter",
        price: "70.00",
        originalPrice: "85.00",
        imageUrl: "https://i.imgur.com/Vgwv7Kh.png",
        perfumeIds: [3, 4, 2], // Oud Wood, By The Fireplace, Coco Mademoiselle
        isNew: false,
        isPopular: true,
      },
      {
        name: "Date Night",
        description: "Fragancias seductoras y sofisticadas para ocasiones especiales.",
        theme: "date_night",
        price: "60.00",
        originalPrice: "70.00",
        imageUrl: "https://i.imgur.com/Vgwv7Kh.png",
        perfumeIds: [1, 2, 3],
        isNew: false,
        isPopular: false,
      }
    ];

    sampleCollections.forEach(collection => {
      const id = this.currentCollectionId++;
      this.collections.set(id, { ...collection, id });
    });
  }

  async getPerfumes(): Promise<Perfume[]> {
    return Array.from(this.perfumes.values());
  }

  async getPerfumesByCategory(category: string): Promise<Perfume[]> {
    return Array.from(this.perfumes.values()).filter(
      perfume => category === "all" || perfume.category === category
    );
  }

  async getPerfume(id: number): Promise<Perfume | undefined> {
    return this.perfumes.get(id);
  }

  async createPerfume(insertPerfume: InsertPerfume): Promise<Perfume> {
    const id = this.currentPerfumeId++;
    const perfume: Perfume = { ...insertPerfume, id };
    this.perfumes.set(id, perfume);
    return perfume;
  }

  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values());
  }

  async getCollection(id: number): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = this.currentCollectionId++;
    const collection: Collection = { ...insertCollection, id };
    this.collections.set(id, collection);
    return collection;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.currentMessageId++;
    const message: ContactMessage = { 
      ...insertMessage, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.contactMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
