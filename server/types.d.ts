declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
  }
  
  export function createTransporter(options: any): Transporter;
}

declare module 'cloudinary' {
  export function v2(): any;
  export function uploader(): any;
}

declare module 'passport-local' {
  export class Strategy {
    constructor(verify: any);
  }
}

declare module 'axios' {
  export function get(url: string, config?: any): Promise<any>;
  export function post(url: string, data?: any, config?: any): Promise<any>;
}

declare module 'nanoid' {
  export function nanoid(size?: number): string;
}

// Extender Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        name?: string;
        googleId?: string;
        avatar?: string | null;
      };
    }
  }
}

// Tipos para Firestore
export interface FirestoreDocument {
  id: string;
  [key: string]: any;
}

export interface Order extends FirestoreDocument {
  userId: string;
  items: Array<{
    id: string;
    perfumeId: string;
    name: string;
    size: string;
    quantity: number;
    price: string;
  }>;
  status: string;
  amount_total: number;
  createdAt: any;
  isOnOffer?: boolean;
  showOnHomepage?: boolean;
  lastLoginAt?: any;
}

export interface Perfume extends FirestoreDocument {
  name: string;
  brand: string;
  description: string;
  price: string;
  imageUrl: string;
  sizes: string[];
  isOnOffer?: boolean;
  showOnHomepage?: boolean;
  createdAt?: any;
}

export interface CartItem extends FirestoreDocument {
  perfumeId: string;
  name: string;
  size: string;
  quantity: number;
  price: string;
}

export interface User extends FirestoreDocument {
  username: string;
  email: string;
  password: string;
  name?: string;
  googleId?: string;
  avatar?: string | null;
  lastLoginAt?: any;
  createdAt?: any;
}

export interface Notification extends FirestoreDocument {
  title: string;
  message: string;
  userId: string;
  readBy?: string[];
  createdAt?: any;
}

// Extender tipos de objetos para incluir propiedades dinámicas
declare global {
  interface Object {
    [key: string]: any;
  }
} 