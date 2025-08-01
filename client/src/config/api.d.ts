// Declaración de tipos para la configuración de API
export interface API_CONFIG {
  BASE_URL: string;
  REQUEST_CONFIG: {
    headers: {
      'Content-Type': string;
    };
    credentials: 'include';
  };
}

export declare const API_CONFIG: API_CONFIG;
export declare function buildApiUrl(endpoint: string): string;
export declare function apiRequest(endpoint: string, options?: RequestInit): Promise<any>; 