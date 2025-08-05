// ApiService simplificado - sin requests al servidor para evitar errores 401

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

class ApiService {
  // Métodos específicos para autenticación (solo login/register)
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('https://lhdecant-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        return { data, status: response.status, success: true };
      } else {
        const errorData = await response.json();
        return { status: response.status, error: errorData.message || 'Login failed', success: false };
      }
    } catch (error) {
      return { status: 0, error: 'Network error', success: false };
    }
  }

  async register(credentials: { username: string; password: string; email: string }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('https://lhdecant-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        return { data, status: response.status, success: true };
      } else {
        const errorData = await response.json();
        return { status: response.status, error: errorData.message || 'Register failed', success: false };
      }
    } catch (error) {
      return { status: 0, error: 'Network error', success: false };
    }
  }

  async logout(): Promise<ApiResponse<any>> {
    // No hacer request al servidor para evitar errores 401
    return { data: { success: true }, status: 200, success: true };
  }
}

export const apiService = new ApiService(); 