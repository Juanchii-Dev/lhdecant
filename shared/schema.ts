export interface Perfume {
  id: number;
  name: string;
  brand: string;
  description: string;
  sizes: string[];
  prices: number[];
  category: string;
  imageUrl: string;
  inStock: boolean;
  showOnHomepage: boolean;
  isOnOffer: boolean;
  discountPercentage: string;
  offerDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertPerfume {
  name: string;
  brand: string;
  description: string;
  sizes: string[];
  prices: string[];
  category: string;
  imageUrl: string;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  theme: string;
  perfumes: Perfume[];
  createdAt: string;
  updatedAt: string;
}

export interface InsertCollection {
  name: string;
  description: string;
  imageUrl: string;
  theme: string;
  perfumeIds: number[];
}

export interface Settings {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
} 