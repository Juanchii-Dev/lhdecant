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
  notes?: string[];
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
  notes?: string[];
  inStock?: boolean;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  theme: string;
  price?: number;
  sizes?: string[];
  prices?: string[];
  perfumes: Perfume[];
  perfumeIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface InsertCollection {
  name: string;
  description: string;
  imageUrl: string;
  theme: string;
  sizes?: string[];
  prices?: string[];
  perfumeIds: number[];
} 