// Tipos para la aplicación LH Decants

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  name?: string;
  googleId?: string;
  avatar?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
}

export interface SessionData {
  cartId: string;
}

// Tipos para Passport
export interface PassportUser extends User {
  id: string;
}

// Tipos para el storage
export interface StorageUser extends User {
  id: string;
}

// Tipos para las actualizaciones de usuario
export interface UserUpdates {
  googleId?: string;
  name?: string;
  avatar?: string | null;
  email?: string;
  password?: string;
} 