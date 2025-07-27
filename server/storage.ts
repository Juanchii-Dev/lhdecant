import admin from 'firebase-admin';
import { User } from './types';

function cleanEnvVar(value?: string) {
  if (!value) return undefined;
  return value.replace(/^"|"$/g, ''); // Elimina comillas al inicio y final
}

const serviceAccount = {
  type: 'service_account',
  project_id: cleanEnvVar(process.env.FIREBASE_PROJECT_ID),
  private_key_id: cleanEnvVar(process.env.FIREBASE_PRIVATE_KEY_ID),
  private_key: cleanEnvVar(process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
  client_email: cleanEnvVar(process.env.FIREBASE_CLIENT_EMAIL),
  client_id: cleanEnvVar(process.env.FIREBASE_CLIENT_ID),
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: cleanEnvVar(process.env.FIREBASE_CLIENT_X509_CERT_URL)
};

console.log('DEBUG FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
if (!serviceAccount.project_id) {
  throw new Error('FIREBASE_PROJECT_ID no está definido o está vacío en el .env');
}
if (!serviceAccount.private_key) {
  throw new Error('FIREBASE_PRIVATE_KEY no está definido o está vacío en el .env');
}
if (!serviceAccount.client_email) {
  throw new Error('FIREBASE_CLIENT_EMAIL no está definido o está vacío en el .env');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = admin.firestore();

export class FirestoreStorage {
  // Métodos de usuario
  async getUser(id: string): Promise<User | null> {
    const userRef = db.collection('users').doc(id);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return null;
    }
    return { id: userSnap.id, ...userSnap.data() } as User;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const usersRef = db.collection('users');
    const query = await usersRef.where('username', '==', username).limit(1).get();
    if (query.empty) {
      return null;
    }
    const userDoc = query.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  async createUser(user: Partial<User>): Promise<User> {
    const usersRef = db.collection('users');
    const newUserRef = await usersRef.add({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const newUserSnap = await newUserRef.get();
    return { id: newUserRef.id, ...newUserSnap.data() } as User;
  }
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const userRef = db.collection('users').doc(id);
    await userRef.update(updates);
    const userSnap = await userRef.get();
    return { id: userSnap.id, ...userSnap.data() } as User;
  }

  // Session store para Passport
  sessionStore = {
    get: async (sid: string) => {
      // Implementación simple para desarrollo
      return null;
    },
    set: async (sid: string, session: any) => {
      // Implementación simple para desarrollo
    },
    destroy: async (sid: string) => {
      // Implementación simple para desarrollo
    }
  };
  async getPerfumes() {
    const perfumesSnap = await db.collection('perfumes').get();
    return perfumesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getPerfumesByCategory(category: string) {
    const perfumesSnap = await db.collection('perfumes').where('category', '==', category).get();
    return perfumesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getHomepagePerfumes() {
    const perfumesSnap = await db.collection('perfumes').where('showOnHomepage', '==', true).limit(6).get();
    return perfumesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getPerfume(id: string) {
    const perfumeRef = db.collection('perfumes').doc(id);
    const perfumeSnap = await perfumeRef.get();
    if (!perfumeSnap.exists) return null;
    return { id: perfumeSnap.id, ...perfumeSnap.data() };
  }

  async createPerfume(perfume: any) {
    const perfumesRef = db.collection('perfumes');
    const newPerfumeRef = await perfumesRef.add({
      ...perfume,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const newPerfumeSnap = await newPerfumeRef.get();
    return { id: newPerfumeRef.id, ...newPerfumeSnap.data() };
  }

  async updatePerfume(id: string, perfume: any) {
    const perfumeRef = db.collection('perfumes').doc(id);
    await perfumeRef.update({
      ...perfume,
      updatedAt: new Date()
    });
    const perfumeSnap = await perfumeRef.get();
    return { id: perfumeSnap.id, ...perfumeSnap.data() };
  }

  async deletePerfume(id: string) {
    await db.collection('perfumes').doc(id).delete();
    return true;
  }

  async toggleHomepageDisplay(id: string, showOnHomepage: boolean) {
    const perfumeRef = db.collection('perfumes').doc(id);
    await perfumeRef.update({ showOnHomepage, updatedAt: new Date() });
    return true;
  }

  async updateOfferStatus(id: string, isOnOffer: boolean, discountPercentage?: string, offerDescription?: string) {
    const perfumeRef = db.collection('perfumes').doc(id);
    const updates: any = { 
      isOnOffer, 
      updatedAt: new Date() 
    };
    if (discountPercentage) updates.discountPercentage = discountPercentage;
    if (offerDescription) updates.offerDescription = offerDescription;
    await perfumeRef.update(updates);
    return true;
  }

  async getCollections() {
    const collectionsSnap = await db.collection('collections').get();
    return collectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getCollection(id: string) {
    const collectionRef = db.collection('collections').doc(id);
    const collectionSnap = await collectionRef.get();
    if (!collectionSnap.exists) return null;
    return { id: collectionSnap.id, ...collectionSnap.data() };
  }

  async createCollection(collection: any) {
    const collectionsRef = db.collection('collections');
    const newCollectionRef = await collectionsRef.add({
      ...collection,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const newCollectionSnap = await newCollectionRef.get();
    return { id: newCollectionRef.id, ...newCollectionSnap.data() };
  }

  async updateCollection(id: string, collection: any) {
    const collectionRef = db.collection('collections').doc(id);
    await collectionRef.update({
      ...collection,
      updatedAt: new Date()
    });
    const collectionSnap = await collectionRef.get();
    return { id: collectionSnap.id, ...collectionSnap.data() };
  }

  async deleteCollection(id: string) {
    await db.collection('collections').doc(id).delete();
    return true;
  }

  async createContactMessage(message: any) {
    const messagesRef = db.collection('contactMessages');
    const newMessageRef = await messagesRef.add({
      ...message,
      createdAt: new Date(),
      status: 'nuevo'
    });
    const newMessageSnap = await newMessageRef.get();
    return { id: newMessageRef.id, ...newMessageSnap.data() };
  }
  async addToCart(sessionId: string, item: any) {
    const cartRef = db.collection('carts').doc(sessionId);
    const itemsRef = cartRef.collection('items');
    // Buscar si ya existe el item (por perfumeId y size)
    const query = await itemsRef.where('perfumeId', '==', item.perfumeId).where('size', '==', item.size).limit(1).get();
    if (!query.empty) {
      // Si existe, actualizar cantidad
      const doc = query.docs[0];
      const newQuantity = (doc.data().quantity || 1) + (item.quantity || 1);
      await doc.ref.update({ quantity: newQuantity });
      return { id: doc.id, ...doc.data(), quantity: newQuantity };
    } else {
      // Si no existe, agregar nuevo
      const newDoc = await itemsRef.add({ ...item, quantity: item.quantity || 1, createdAt: new Date() });
      const newItem = await newDoc.get();
      return { id: newDoc.id, ...newItem.data() };
    }
  }

  async getCartItems(sessionId: string) {
    const cartRef = db.collection('carts').doc(sessionId);
    const itemsSnap = await cartRef.collection('items').get();
    const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return items;
  }

  async updateCartItemQuantity(id: string, quantity: number) {
    // id es el id del item en la subcolección
    // Buscar el carrito del usuario (por ahora, solo uno por sesión)
    // Se asume que el frontend envía el sessionId en el body
    throw new Error('Debes implementar la lógica para actualizar la cantidad de un item en el carrito usando sessionId e id del item.');
  }

  async removeFromCart(id: string) {
    // id es el id del item en la subcolección
    // Se asume que el frontend envía el sessionId en el body
    throw new Error('Debes implementar la lógica para eliminar un item del carrito usando sessionId e id del item.');
  }

  async clearCart(sessionId: string) {
    const cartRef = db.collection('carts').doc(sessionId);
    const itemsSnap = await cartRef.collection('items').get();
    const batch = db.batch();
    itemsSnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return true;
  }
  async createOrder(order: any, items: any[]) {
    // Validar stock y descontar
    const batch = db.batch();
    for (const item of items) {
      const perfumeRef = db.collection('perfumes').doc(item.perfumeId);
      const perfumeSnap = await perfumeRef.get();
      if (!perfumeSnap.exists) throw new Error(`Perfume ${item.perfumeId} no existe`);
      const perfume = perfumeSnap.data();
      if (!perfume) throw new Error(`Perfume ${item.perfumeId} no tiene datos`);
      // Validar stock por tamaño
      const sizeStock = (perfume.sizes && perfume.sizes[item.size]) || 0;
      if (sizeStock < item.quantity) throw new Error(`Stock insuficiente para ${perfume.name} (${item.size})`);
      // Descontar stock
      batch.update(perfumeRef, { [`sizes.${item.size}`]: sizeStock - item.quantity });
    }
    // Crear la orden
    const orderRef = db.collection('orders').doc();
    batch.set(orderRef, {
      ...order,
      createdAt: new Date(),
      status: 'pagado',
    });
    // Agregar los items como subcolección
    items.forEach(item => {
      const itemRef = orderRef.collection('items').doc();
      batch.set(itemRef, item);
    });
    await batch.commit();
    return { id: orderRef.id, ...order, items };
  }
  async getOrders() {
    const ordersSnap = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = [];
    for (const doc of ordersSnap.docs) {
      const data = doc.data();
      const itemsSnap = await doc.ref.collection('items').get();
      const items = itemsSnap.docs.map(i => ({ id: i.id, ...i.data() }));
      orders.push({ id: doc.id, ...data, items });
    }
    return orders;
  }
  async getOrder(id: string) {
    const orderRef = db.collection('orders').doc(id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return null;
    const data = orderSnap.data();
    const itemsSnap = await orderRef.collection('items').get();
    const items = itemsSnap.docs.map(i => ({ id: i.id, ...i.data() }));
    return { id, ...data, items };
  }
  async updateOrderStatus(id: string, status: string) {
    const orderRef = db.collection('orders').doc(id);
    await orderRef.update({ status });
    const orderSnap = await orderRef.get();
    const data = orderSnap.data();
    const itemsSnap = await orderRef.collection('items').get();
    const items = itemsSnap.docs.map(i => ({ id: i.id, ...i.data() }));
    return { id, ...data, items };
  }
  async getSetting(key: string) {
    const settingRef = db.collection('settings').doc(key);
    const settingSnap = await settingRef.get();
    if (!settingSnap.exists) return null;
    return settingSnap.data()?.value;
  }

  async setSetting(key: string, value: string) {
    const settingRef = db.collection('settings').doc(key);
    await settingRef.set({ value, updatedAt: new Date() });
    return true;
  }

  async getSettings() {
    const settingsSnap = await db.collection('settings').get();
    const settings: any = {};
    settingsSnap.docs.forEach(doc => {
      settings[doc.id] = doc.data()?.value;
    });
    return settings;
  }
  async savePasswordResetToken(email: string, token: string) {
    const resetsRef = db.collection('passwordResets').doc(email);
    await resetsRef.set({ token, createdAt: new Date() });
  }
  async getPasswordResetToken(email: string) {
    const doc = await db.collection('passwordResets').doc(email).get();
    return doc.exists ? doc.data() : null;
  }
  async updateUserPassword(email: string, newPassword: string) {
    // Buscar usuario por email y actualizar password (hash si es necesario)
    const usersRef = db.collection('users');
    const query = await usersRef.where('email', '==', email).limit(1).get();
    if (query.empty) throw new Error('Usuario no encontrado');
    const userDoc = query.docs[0];
    await userDoc.ref.update({ password: newPassword });
  }
  async deletePasswordResetToken(email: string) {
    await db.collection('passwordResets').doc(email).delete();
  }

  // Favorites methods
  async getUserFavorites(userId: string) {
    const favoritesRef = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();
    
    const favorites = [];
    for (const doc of favoritesRef.docs) {
      const favorite = doc.data();
      const perfumeRef = await db.collection('perfumes').doc(favorite.perfumeId).get();
      if (perfumeRef.exists) {
        favorites.push({
          id: doc.id,
          ...favorite,
          perfume: { id: perfumeRef.id, ...perfumeRef.data() }
        });
      }
    }
    return favorites;
  }

  async addToFavorites(userId: string, perfumeId: string) {
    const favoriteRef = await db.collection('favorites').add({
      userId,
      perfumeId,
      addedAt: new Date()
    });
    return { id: favoriteRef.id, userId, perfumeId, addedAt: new Date() };
  }

  async removeFromFavorites(favoriteId: string, userId: string) {
    const favoriteRef = db.collection('favorites').doc(favoriteId);
    const favorite = await favoriteRef.get();
    if (!favorite.exists || favorite.data()?.userId !== userId) {
      throw new Error('Favorite not found or unauthorized');
    }
    await favoriteRef.delete();
  }

  // Profile methods
  async getUserProfile(userId: string) {
    const userRef = await db.collection('users').doc(userId).get();
    if (!userRef.exists) {
      throw new Error('User not found');
    }
    const userData = userRef.data() as User;
    return {
      ...userData,
      id: userRef.id,
      isPremium: userData.email?.includes('premium') || false,
      memberSince: userData.createdAt || new Date(),
      lastLogin: userData.updatedAt || new Date(),
      preferences: {
        newsletter: true,
        marketing: false,
        notifications: true,
      }
    };
  }

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      ...updates,
      updatedAt: new Date()
    });
    return this.getUserProfile(userId);
  }

  async changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
    const userRef = await db.collection('users').doc(userId).get();
    if (!userRef.exists) {
      throw new Error('User not found');
    }
    const userData = userRef.data() as User;
    
    // Verify current password (assuming it's already hashed)
    if (userData.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    
    // Update password (in production, hash the new password)
    await db.collection('users').doc(userId).update({
      password: newPassword,
      updatedAt: new Date()
    });
  }

  // Addresses methods
  async getUserAddresses(userId: string) {
    const addressesRef = await db.collection('addresses')
      .where('userId', '==', userId)
      .orderBy('isDefault', 'desc')
      .orderBy('createdAt', 'desc')
      .get();
    
    return addressesRef.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async addUserAddress(userId: string, addressData: any) {
    const addressRef = await db.collection('addresses').add({
      userId,
      ...addressData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    if (addressData.isDefault) {
      await this.setDefaultAddress(addressRef.id, userId);
    }
    
    return { id: addressRef.id, userId, ...addressData };
  }

  async updateUserAddress(addressId: string, userId: string, updates: any) {
    const addressRef = db.collection('addresses').doc(addressId);
    const address = await addressRef.get();
    
    if (!address.exists || address.data()?.userId !== userId) {
      throw new Error('Address not found or unauthorized');
    }
    
    await addressRef.update({
      ...updates,
      updatedAt: new Date()
    });
    
    if (updates.isDefault) {
      await this.setDefaultAddress(addressId, userId);
    }
    
    return { id: addressId, ...updates };
  }

  async deleteUserAddress(addressId: string, userId: string) {
    const addressRef = db.collection('addresses').doc(addressId);
    const address = await addressRef.get();
    
    if (!address.exists || address.data()?.userId !== userId) {
      throw new Error('Address not found or unauthorized');
    }
    
    await addressRef.delete();
  }

  async setDefaultAddress(addressId: string, userId: string) {
    // Remove default from all other addresses
    const addressesRef = await db.collection('addresses')
      .where('userId', '==', userId)
      .where('isDefault', '==', true)
      .get();
    
    const batch = db.batch();
    addressesRef.docs.forEach(doc => {
      batch.update(doc.ref, { isDefault: false });
    });
    
    // Set new default
    batch.update(db.collection('addresses').doc(addressId), { isDefault: true });
    
    await batch.commit();
  }

  // Payment methods methods
  async getUserPaymentMethods(userId: string) {
    const paymentMethodsRef = await db.collection('paymentMethods')
      .where('userId', '==', userId)
      .orderBy('isDefault', 'desc')
      .orderBy('createdAt', 'desc')
      .get();
    
    return paymentMethodsRef.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async addUserPaymentMethod(userId: string, paymentData: any) {
    const paymentRef = await db.collection('paymentMethods').add({
      userId,
      ...paymentData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    if (paymentData.isDefault) {
      await this.setDefaultPaymentMethod(paymentRef.id, userId);
    }
    
    return { id: paymentRef.id, userId, ...paymentData };
  }

  async deleteUserPaymentMethod(paymentId: string, userId: string) {
    const paymentRef = db.collection('paymentMethods').doc(paymentId);
    const payment = await paymentRef.get();
    
    if (!payment.exists || payment.data()?.userId !== userId) {
      throw new Error('Payment method not found or unauthorized');
    }
    
    await paymentRef.delete();
  }

  async setDefaultPaymentMethod(paymentId: string, userId: string) {
    // Remove default from all other payment methods
    const paymentMethodsRef = await db.collection('paymentMethods')
      .where('userId', '==', userId)
      .where('isDefault', '==', true)
      .get();
    
    const batch = db.batch();
    paymentMethodsRef.docs.forEach(doc => {
      batch.update(doc.ref, { isDefault: false });
    });
    
    // Set new default
    batch.update(db.collection('paymentMethods').doc(paymentId), { isDefault: true });
    
    await batch.commit();
  }
}

export const storage = new FirestoreStorage(); 