import { buildApiUrl } from '../config/api';
import { getAuthToken, refreshToken } from './auth-helpers';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = buildApiUrl('');
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.ok) {
      try {
        const data = await response.json();
        return { data, status: response.status };
      } catch {
        return { status: response.status };
      }
    }

    if (response.status === 401) {
      // Intentar refresh del token
      const refreshed = await refreshToken();
      if (refreshed) {
        return { status: 401, error: 'Token refreshed' };
      }
      return { status: 401, error: 'Authentication failed' };
    }

    if (response.status === 500) {
      return { status: 500, error: 'Internal server error' };
    }

    try {
      const errorData = await response.json();
      return { status: response.status, error: errorData.message || 'Request failed' };
    } catch {
      return { status: response.status, error: 'Request failed' };
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return { status: 0, error: 'Network error' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // Métodos específicos para el carrito
  async getCart(): Promise<ApiResponse<any[]>> {
    return this.get('/api/cart');
  }

  async addToCart(productId: string, quantity: number = 1, size?: string): Promise<ApiResponse<any>> {
    return this.post('/api/cart', { productId, quantity, size });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<any>> {
    return this.put(`/api/cart/${itemId}`, { quantity });
  }

  async removeCartItem(itemId: string): Promise<ApiResponse<any>> {
    return this.delete(`/api/cart/${itemId}`);
  }

  async clearCart(): Promise<ApiResponse<any>> {
    return this.delete('/api/cart');
  }

  // Métodos específicos para autenticación
  async getUser(): Promise<ApiResponse<any>> {
    return this.get('/api/user');
  }

  async login(credentials: { username: string; password: string }): Promise<ApiResponse<any>> {
    return this.post('/api/auth/login', credentials);
  }

  async register(credentials: { username: string; password: string; email: string }): Promise<ApiResponse<any>> {
    return this.post('/api/auth/register', credentials);
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.post('/api/auth/logout');
  }
}

export const apiService = new ApiService(); 