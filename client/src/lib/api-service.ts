import { getAuthToken } from './auth-helpers';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

class ApiService {
  private baseURL: string = 'https://lhdecant-backend.onrender.com/api';

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
        return { data, status: response.status, success: true };
      } catch {
        return { status: response.status, success: true };
      }
    }

    if (response.status === 404) {
      return { status: 404, error: 'Endpoint not found', success: false };
    }

    if (response.status === 401) {
      return { status: 401, error: 'Authentication failed', success: false };
    }

    if (response.status === 500) {
      return { status: 500, error: 'Internal server error', success: false };
    }

    try {
      const errorData = await response.json();
      return { status: response.status, error: errorData.message || 'Request failed', success: false };
    } catch {
      return { status: response.status, error: 'Request failed', success: false };
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
      return { status: 0, error: 'Network error', success: false };
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

  // Métodos específicos para autenticación
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<any>> {
    return this.post('/auth/login', credentials);
  }

  async register(credentials: { username: string; password: string; email: string }): Promise<ApiResponse<any>> {
    return this.post('/auth/register', credentials);
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.post('/auth/logout');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService(); 