import admin from 'firebase-admin';
import { User } from './types';

interface CartItem {
  id: string;
  price: string;
  quantity: number;
  [key: string]: any;
}

interface UserCoupon {
  id: string;
  couponId: string;
  userId: string;
  usedAt?: Date;
  isUsed: boolean;
  [key: string]: any;
}

interface Review {
  id: string;
  userId: string;
  title: string;
  content: string;
  perfumeName: string;
  rating: number;
  helpfulCount: number;
  [key: string]: any;
}

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

export { admin };

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
  // Sistema completo de sesiones con Firebase Firestore
  sessionStore = {
    get: async (sid: string) => {
      try {
        const sessionRef = db.collection('sessions').doc(sid);
        const sessionSnap = await sessionRef.get();
        
        if (!sessionSnap.exists) {
          return null;
        }
        
        const sessionData = sessionSnap.data();
        
        // Verificar si la sesión ha expirado
        if (sessionData?.expiresAt && new Date() > sessionData.expiresAt.toDate()) {
          await sessionRef.delete();
          return null;
        }
        
        return sessionData;
      } catch (error) {
        console.error('Error getting session:', error);
        return null;
      }
    },
    
    set: async (sid: string, session: any) => {
      try {
        const sessionRef = db.collection('sessions').doc(sid);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Sesión expira en 7 días
        
        await sessionRef.set({
          ...session,
          sid,
          expiresAt,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error setting session:', error);
      }
    },
    
    destroy: async (sid: string) => {
      try {
        const sessionRef = db.collection('sessions').doc(sid);
        await sessionRef.delete();
      } catch (error) {
        console.error('Error destroying session:', error);
      }
    },
    
    touch: async (sid: string, session: any) => {
      try {
        const sessionRef = db.collection('sessions').doc(sid);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Renovar por 7 días más
        
        await sessionRef.update({
          ...session,
          expiresAt,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error touching session:', error);
      }
    }
  };
  async getPerfumes() {
    const perfumesSnap = await db.collection('perfumes').get();
    return perfumesSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async getPerfumesByCategory(category: string) {
    const perfumesSnap = await db.collection('perfumes').where('category', '==', category).get();
    return perfumesSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async getHomepagePerfumes() {
    const perfumesSnap = await db.collection('perfumes').where('showOnHomepage', '==', true).get();
    return perfumesSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
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
    return collectionsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
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
  async addToCart(userId: string, item: any) {
    console.log('🛒 addToCart - userId:', userId);
    console.log('🛒 addToCart - item:', item);
    
    // Obtener la información completa del perfume
    const perfumeRef = db.collection('perfumes').doc(item.perfumeId);
    const perfumeSnap = await perfumeRef.get();
    const perfumeData = perfumeSnap.exists ? perfumeSnap.data() : null;
    
    const cartRef = db.collection('carts').doc(userId);
    console.log('🛒 addToCart - cartRef path:', cartRef.path);
    const itemsRef = cartRef.collection('items');
    
    // Buscar si ya existe el item (por perfumeId y size)
    const query = await itemsRef.where('perfumeId', '==', item.perfumeId).where('size', '==', item.size).limit(1).get();
    console.log('🛒 addToCart - query size:', query.size);
    
    if (!query.empty) {
      // Si existe, actualizar cantidad
      const doc = query.docs[0];
      const newQuantity = (doc.data().quantity || 1) + (item.quantity || 1);
      await doc.ref.update({ 
        quantity: newQuantity,
        perfume: perfumeData // Actualizar también la información del perfume
      });
      console.log('🛒 addToCart - updated existing item, new quantity:', newQuantity);
      return { id: doc.id, ...doc.data(), quantity: newQuantity, perfume: perfumeData };
    } else {
      // Si no existe, agregar nuevo
      const newDoc = await itemsRef.add({ 
        ...item, 
        quantity: item.quantity || 1, 
        createdAt: new Date(),
        perfume: perfumeData // Incluir la información completa del perfume
      });
      const newItem = await newDoc.get();
      console.log('🛒 addToCart - created new item with id:', newDoc.id);
      return { id: newDoc.id, ...newItem.data() };
    }
  }

  async getCartItems(userId: string) {
    console.log('🔍 getCartItems - userId:', userId);
    const cartRef = db.collection('carts').doc(userId);
    console.log('🔍 getCartItems - cartRef path:', cartRef.path);
    const itemsSnap = await cartRef.collection('items').get();
    console.log('🔍 getCartItems - itemsSnap size:', itemsSnap.size);
    const items = itemsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    console.log('🔍 getCartItems - items found:', items.length);
    return items;
  }

  async updateCartItemQuantity(id: string, quantity: number, userId: string) {
    try {
      // Buscar el item en el carrito del usuario
      const cartRef = db.collection('carts').doc(userId);
      const itemRef = cartRef.collection('items').doc(id);
      
      // Verificar que el item existe
      const itemSnap = await itemRef.get();
      if (!itemSnap.exists) {
        throw new Error('Item no encontrado en el carrito');
      }
      
      // Si la cantidad es 0 o menor, eliminar el item
      if (quantity <= 0) {
        await itemRef.delete();
        return { id, deleted: true };
      }
      
      // Actualizar la cantidad
      await itemRef.update({ quantity });
      
      // Retornar el item actualizado
      const updatedSnap = await itemRef.get();
      return { id: updatedSnap.id, ...updatedSnap.data() };
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  async removeFromCart(id: string, userId: string) {
    try {
      // Buscar el item en el carrito del usuario
      const cartRef = db.collection('carts').doc(userId);
      const itemRef = cartRef.collection('items').doc(id);
      
      // Verificar que el item existe
      const itemSnap = await itemRef.get();
      if (!itemSnap.exists) {
        throw new Error('Item no encontrado en el carrito');
      }
      
      // Eliminar el item
      await itemRef.delete();
      
      return { id, deleted: true };
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  }

  async clearCart(userId: string) {
    const cartRef = db.collection('carts').doc(userId);
    const itemsSnap = await cartRef.collection('items').get();
    const batch = db.batch();
    itemsSnap.forEach((doc: any) => batch.delete(doc.ref));
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
    items.forEach((item: any) => {
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
  async updateOrderStatus(id: string, updates: any): Promise<any> {
    const orderRef = db.collection('orders').doc(id);
    const orderSnap = await orderRef.get();
    
    if (!orderSnap.exists) {
      throw new Error('Order not found');
    }
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await orderRef.update(updateData);
    
    const updatedSnap = await orderRef.get();
    const data = updatedSnap.data();
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
    settingsSnap.docs.forEach((doc: any) => {
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
    
    return addressesRef.docs.map((doc: any) => ({
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
    addressesRef.docs.forEach((doc: any) => {
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
    
    return paymentMethodsRef.docs.map((doc: any) => ({
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
    paymentMethodsRef.docs.forEach((doc: any) => {
      batch.update(doc.ref, { isDefault: false });
    });
    
    // Set new default
    batch.update(db.collection('paymentMethods').doc(paymentId), { isDefault: true });
    
    await batch.commit();
  }

  // User settings methods
  async getUserSettings(userId: string): Promise<any> {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    return userData?.settings || {
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        orderUpdates: true,
        newProducts: true,
        promotions: false,
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowAnalytics: true,
        allowCookies: true,
      },
      appearance: {
        theme: 'dark',
        fontSize: 'medium',
        compactMode: false,
        animations: true,
      },
      language: {
        locale: 'es-ES',
        currency: 'USD',
        timezone: 'America/New_York',
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        loginNotifications: true,
      },
      data: {
        autoBackup: false,
        backupFrequency: 'weekly',
        exportFormat: 'json',
      },
    };
  }

  async updateUserSettings(userId: string, settings: any): Promise<any> {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      settings,
      updatedAt: new Date()
    });
    return settings;
  }

  async exportUserData(userId: string, format: string = 'json'): Promise<any> {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    
    // Obtener datos relacionados
    const [favorites, addresses, paymentMethods, orders] = await Promise.all([
      this.getUserFavorites(userId),
      this.getUserAddresses(userId),
      this.getUserPaymentMethods(userId),
      db.collection('orders').where('userId', '==', userId).get().then(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      )
    ]);

    const exportData = {
      user: {
        id: userData?.id,
        email: userData?.email,
        name: userData?.name,
        username: userData?.username,
        createdAt: userData?.createdAt,
        updatedAt: userData?.updatedAt,
      },
      settings: userData?.settings,
      favorites,
      addresses,
      paymentMethods,
      orders,
      exportDate: new Date().toISOString(),
      format
    };

    return exportData;
  }

  async deleteUserAccount(userId: string, _password: string): Promise<void> {
    try {
    const batch = db.batch();
      
      // Eliminar carrito
      const cartRef = db.collection('carts').doc(userId);
      const itemsSnap = await cartRef.collection('items').get();
      itemsSnap.forEach((doc: any) => batch.delete(doc.ref));
      batch.delete(cartRef);
    
    // Eliminar favoritos
      const favoritesRef = db.collection('users').doc(userId).collection('favorites');
      const favoritesSnap = await favoritesRef.get();
      favoritesSnap.forEach((doc: any) => batch.delete(doc.ref));
    
    // Eliminar direcciones
      const addressesRef = db.collection('users').doc(userId).collection('addresses');
      const addressesSnap = await addressesRef.get();
      addressesSnap.docs.forEach((doc: any) => batch.delete(doc.ref));
    
    // Eliminar métodos de pago
      const paymentMethodsRef = db.collection('users').doc(userId).collection('paymentMethods');
      const paymentMethodsSnapshot = await paymentMethodsRef.get();
      paymentMethodsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    
    // Eliminar órdenes
      const ordersRef = db.collection('orders');
      const ordersSnapshot = await ordersRef.where('userId', '==', userId).get();
      ordersSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    
      // Eliminar reviews
      const reviewsRef = db.collection('reviews');
      const reviewsSnapshot = await reviewsRef.where('userId', '==', userId).get();
      reviewsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    
    // Eliminar notificaciones
      const notificationsRef = db.collection('users').doc(userId).collection('notifications');
      const notificationsSnapshot = await notificationsRef.get();
      notificationsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    
      // Eliminar cupones de usuario
      const userCouponsRef = db.collection('userCoupons');
      const userCouponsSnapshot = await userCouponsRef.where('userId', '==', userId).get();
      userCouponsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    
    // Eliminar usuario
      batch.delete(db.collection('users').doc(userId));
    
    await batch.commit();
      console.log('✅ Usuario eliminado completamente');
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      throw error;
    }
  }

  // Coupons methods
  async getAvailableCoupons(): Promise<any[]> {
    const couponsSnapshot = await db.collection('coupons').where('isActive', '==', true).get();
    return couponsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async getUserCoupons(userId: string): Promise<any[]> {
    const userCouponsSnapshot = await db.collection('userCoupons').where('userId', '==', userId).get();
    const userCoupons = userCouponsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as UserCoupon[];

    // Obtener información completa de los cupones
    const couponsSnapshot = await db.collection('coupons').get();
    const coupons = couponsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return userCoupons.map(uc => ({
      ...uc,
      coupon: coupons.find(c => c.id === uc.couponId)
    }));
  }

  async applyCoupon(userId: string, code: string): Promise<any> {
    // Buscar el cupón
    const couponsSnapshot = await db.collection('coupons')
      .where('code', '==', code)
      .where('isActive', '==', true)
      .get();
    
    if (couponsSnapshot.empty) {
      throw new Error('Cupón no encontrado o inactivo');
    }

    const coupon = couponsSnapshot.docs[0];
    const couponData = coupon.data();

    // Verificar validez
    const now = new Date();
    const validFrom = couponData.validFrom.toDate();
    const validUntil = couponData.validUntil.toDate();

    if (now < validFrom || now > validUntil) {
      throw new Error('Cupón fuera de fecha');
    }

    if (couponData.usedCount >= couponData.usageLimit) {
      throw new Error('Cupón agotado');
    }

    // Verificar si el usuario ya usó este cupón
    const userCouponSnapshot = await db.collection('userCoupons')
      .where('userId', '==', userId)
      .where('couponId', '==', coupon.id)
      .get();

    if (!userCouponSnapshot.empty) {
      throw new Error('Ya has usado este cupón');
    }

    // Aplicar cupón al carrito
    const cartItems = await this.getCartItems(userId) as CartItem[];
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    if (subtotal < couponData.minPurchase) {
      throw new Error(`Compra mínima requerida: $${couponData.minPurchase}`);
    }

    let discount = 0;
    if (couponData.type === 'percentage') {
      discount = subtotal * (couponData.value / 100);
      if (couponData.maxDiscount) {
        discount = Math.min(discount, couponData.maxDiscount);
      }
    } else {
      discount = couponData.value;
    }

    // Registrar uso del cupón
    await db.collection('userCoupons').add({
      userId,
      couponId: coupon.id,
      usedAt: new Date(),
      isUsed: true,
    });

    // Actualizar contador de uso
    await coupon.ref.update({
      usedCount: admin.firestore.FieldValue.increment(1)
    });

    return {
      discount: discount.toFixed(2),
      coupon: {
        id: coupon.id,
        ...couponData
      }
    };
  }

  // Reviews methods
  async getReviews(filters: { search?: string; filter?: string; sort?: string } = {}): Promise<any[]> {
    let query = db.collection('reviews').orderBy('createdAt', 'desc');

    if (filters.filter && filters.filter !== 'all') {
      query = query.where('type', '==', filters.filter);
    }

    const reviewsSnapshot = await query.get();
    let reviews = reviewsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];

    // Filtrar por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      reviews = reviews.filter(review => 
        review.title.toLowerCase().includes(searchTerm) ||
        review.content.toLowerCase().includes(searchTerm) ||
        review.perfumeName.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenar
    if (filters.sort) {
      switch (filters.sort) {
        case 'rating':
          reviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'helpful':
          reviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
          break;
        case 'oldest':
          reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        default:
          reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    // Obtener datos de usuario
    const userIds = Array.from(new Set(reviews.map(r => r.userId)));
    const usersSnapshot = await db.collection('users')
      .where(admin.firestore.FieldPath.documentId(), 'in', userIds)
      .get();
    
    const users = usersSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return reviews.map(review => ({
      ...review,
      user: users.find(u => u.id === review.userId)
    }));
  }

  async getUserReviews(userId: string): Promise<any[]> {
    const reviewsSnapshot = await db.collection('reviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return reviewsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async createReview(userId: string, reviewData: any): Promise<any> {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const perfumeRef = db.collection('perfumes').doc(reviewData.perfumeId);
    const perfumeDoc = await perfumeRef.get();
    const perfumeData = perfumeDoc.data();

    const review = {
      userId,
      perfumeId: reviewData.perfumeId,
      perfumeName: perfumeData?.name || '',
      perfumeBrand: perfumeData?.brand || '',
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      pros: reviewData.pros,
      cons: reviewData.cons,
      longevity: reviewData.longevity,
      sillage: reviewData.sillage,
      value: reviewData.value,
      isVerified: true,
      helpfulCount: 0,
      createdAt: new Date(),
      user: {
        name: userData?.name || userData?.username || 'Usuario',
        email: userData?.email || '',
        avatar: userData?.avatar || '',
      }
    };

    const reviewRef = await db.collection('reviews').add(review);
    return { id: reviewRef.id, ...review };
  }

  async updateReview(reviewId: string, userId: string, updates: any): Promise<any> {
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();
    
    if (!reviewDoc.exists || reviewDoc.data()?.userId !== userId) {
      throw new Error('Review not found or unauthorized');
    }

    await reviewRef.update({
      ...updates,
      updatedAt: new Date()
    });

    return { id: reviewId, ...updates };
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();
    
    if (!reviewDoc.exists || reviewDoc.data()?.userId !== userId) {
      throw new Error('Review not found or unauthorized');
    }

    await reviewRef.delete();
  }

  async markReviewHelpful(reviewId: string, _userId: string): Promise<any> {
    const reviewRef = db.collection('reviews').doc(reviewId);
    await reviewRef.update({
      helpfulCount: admin.firestore.FieldValue.increment(1)
    });

    return { message: 'Review marked as helpful' };
  }

  // Notifications methods
  async getNotifications(userId: string, filters: { filter?: string; showRead?: boolean; search?: string } = {}): Promise<any[]> {
    let query = db.collection('notifications').where('userId', '==', userId);

    if (filters.filter && filters.filter !== 'all') {
      query = query.where('type', '==', filters.filter);
    }

    if (!filters.showRead) {
      query = query.where('isRead', '==', false);
    }

    const notificationsSnapshot = await query.orderBy('createdAt', 'desc').get();
    let notifications = notificationsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      notifications = notifications.filter((notification: any) => 
        (notification.title || '').toLowerCase().includes(searchTerm) ||
        (notification.message || '').toLowerCase().includes(searchTerm)
      );
    }

    return notifications;
  }

  async getNotificationSettings(userId: string): Promise<any> {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    return userData?.notificationSettings || {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      promotions: true,
      newProducts: true,
      security: true,
      system: true,
    };
  }

  async updateNotificationSettings(userId: string, settings: any): Promise<any> {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      notificationSettings: settings,
      updatedAt: new Date()
    });
    return settings;
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const notificationRef = db.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists || notificationDoc.data()?.userId !== userId) {
      throw new Error('Notification not found or unauthorized');
    }

    await notificationRef.update({
      isRead: true,
      readAt: new Date()
    });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .get();

    const batch = db.batch();
    notificationsSnapshot.docs.forEach((doc: any) => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: new Date()
      });
    });

    await batch.commit();
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notificationRef = db.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists || notificationDoc.data()?.userId !== userId) {
      throw new Error('Notification not found or unauthorized');
    }

    await notificationRef.delete();
  }

  // User stats and activity methods
  async getUserStats(userId: string): Promise<any> {
    // Obtener conteo de favoritos
    const favoritesSnapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();
    const favoritesCount = favoritesSnapshot.size;

    // Obtener conteo de pedidos
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .get();
    const ordersCount = ordersSnapshot.size;

    // Obtener conteo de reseñas
    const reviewsSnapshot = await db.collection('reviews')
      .where('userId', '==', userId)
      .get();
    const reviewsCount = reviewsSnapshot.size;

    return {
      favoritesCount,
      ordersCount,
      reviewsCount,
    };
  }

  async getUserActivity(userId: string): Promise<any[]> {
    const activities: any[] = [];

    // Obtener favoritos recientes
    const favoritesSnapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    favoritesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'favorite',
        description: `Agregaste "${data.perfumeName || 'Perfume'}" a favoritos`,
        date: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        productName: data.perfumeName,
      });
    });

    // Obtener pedidos recientes
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    ordersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'order',
        description: `Completaste tu pedido #${doc.id.slice(-4)}`,
        date: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        orderId: doc.id,
      });
    });

    // Obtener reseñas recientes
    const reviewsSnapshot = await db.collection('reviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    reviewsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'review',
        description: `Escribiste una reseña para "${data.perfumeName || 'Perfume'}"`,
        date: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        productName: data.perfumeName,
      });
    });

    // Ordenar todas las actividades por fecha (más reciente primero)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Retornar solo las 10 actividades más recientes
    return activities.slice(0, 10);
  }

  // Tracking methods
  async getOrderById(orderId: string): Promise<any> {
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    
    if (!orderSnap.exists) {
      return null;
    }
    
    return { id: orderSnap.id, ...orderSnap.data() };
  }

  async getOrdersByEmail(email: string): Promise<any[]> {
    const query = await db.collection('orders').where('customer_email', '==', email).get();
    return query.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async getOrderTrackingHistory(orderId: string): Promise<any[]> {
    const historySnap = await db.collection('orders').doc(orderId).collection('tracking').get();
    return historySnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async addOrderTrackingEntry(orderId: string, entry: any): Promise<void> {
    const trackingRef = db.collection('orderTracking').doc(orderId).collection('history');
    await trackingRef.add({
      ...entry,
      timestamp: new Date(),
      createdAt: new Date()
    });
  }

  async getPerfumeById(perfumeId: string): Promise<any> {
    const perfumeRef = db.collection('perfumes').doc(perfumeId);
    const perfumeSnap = await perfumeRef.get();
    
    if (!perfumeSnap.exists) {
      return null;
    }
    
    return { id: perfumeSnap.id, ...perfumeSnap.data() };
  }

  // Funciones adicionales para gestión de sesiones
  async getAllSessions(): Promise<any[]> {
    try {
      const sessionsSnap = await db.collection('sessions').get();
      return sessionsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return [];
    }
  }

  async getActiveSessions(): Promise<any[]> {
    try {
      const now = new Date();
      const sessionsSnap = await db.collection('sessions')
        .where('expiresAt', '>', now)
        .get();
      
      return sessionsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  async getSessionById(sid: string): Promise<any> {
    try {
      const sessionRef = db.collection('sessions').doc(sid);
      const sessionSnap = await sessionRef.get();
      
      if (!sessionSnap.exists) {
        return null;
      }
      
      const sessionData = sessionSnap.data();
      
      // Verificar si la sesión ha expirado
      if (sessionData?.expiresAt && new Date() > sessionData.expiresAt.toDate()) {
        await sessionRef.delete();
        return null;
      }
      
      return { id: sessionSnap.id, ...sessionData };
    } catch (error) {
      console.error('Error getting session by ID:', error);
      return null;
    }
  }

  async updateSession(sid: string, updates: any): Promise<any> {
    try {
      const sessionRef = db.collection('sessions').doc(sid);
      const sessionSnap = await sessionRef.get();
      
      if (!sessionSnap.exists) {
        throw new Error('Session not found');
      }
      
      await sessionRef.update({
        ...updates,
        updatedAt: new Date()
      });
      
      const updatedSnap = await sessionRef.get();
      return { id: updatedSnap.id, ...updatedSnap.data() };
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  async deleteExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      const expiredSessionsSnap = await db.collection('sessions')
        .where('expiresAt', '<=', now)
        .get();
      
      const deletePromises = expiredSessionsSnap.docs.map((doc: any) => doc.ref.delete());
      await Promise.all(deletePromises);
      
      return expiredSessionsSnap.size;
    } catch (error) {
      console.error('Error deleting expired sessions:', error);
      return 0;
    }
  }

  async getSessionStats(): Promise<any> {
    try {
      const now = new Date();
      const allSessionsSnap = await db.collection('sessions').get();
      const activeSessionsSnap = await db.collection('sessions')
        .where('expiresAt', '>', now)
        .get();
      
      const expiredSessionsSnap = await db.collection('sessions')
        .where('expiresAt', '<=', now)
        .get();
      
      return {
        total: allSessionsSnap.size,
        active: activeSessionsSnap.size,
        expired: expiredSessionsSnap.size,
        lastCleanup: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return { total: 0, active: 0, expired: 0, lastCleanup: new Date().toISOString() };
    }
  }
}

export const storage = new FirestoreStorage(); 