import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { getAuthToken, getRefreshToken, debugAuth } from '../lib/auth-helpers';
import { buildApiUrl } from '../config/api';

export function AuthDebug() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const info = {
      hasAuthToken: !!getAuthToken(),
      hasRefreshToken: !!getRefreshToken(),
      authTokenLength: getAuthToken()?.length || 0,
      refreshTokenLength: getRefreshToken()?.length || 0,
      userData: localStorage.getItem('userData'),
      isAuthenticated,
      isLoading,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username
      } : null
    };
    setDebugInfo(info);
  }, [user, isAuthenticated, isLoading]);

  const testAuth = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setTestResult('❌ No hay token de autenticación');
        return;
      }

      const response = await fetch(buildApiUrl('/api/user'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setTestResult(`✅ Autenticación exitosa: ${userData.email}`);
      } else {
        const error = await response.json();
        setTestResult(`❌ Error ${response.status}: ${error.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setTestResult(`❌ Error de red: ${error}`);
    }
  };

  const testCart = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setTestResult('❌ No hay token de autenticación');
        return;
      }

      const response = await fetch(buildApiUrl('/api/cart'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const cartData = await response.json();
        setTestResult(`✅ Carrito accesible: ${cartData.length} items`);
      } else {
        const error = await response.json();
        setTestResult(`❌ Error carrito ${response.status}: ${error.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setTestResult(`❌ Error de red: ${error}`);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    window.location.reload();
  };

  if (!import.meta.env.DEV) {
    return null; // Solo mostrar en desarrollo
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-sm text-xs z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      
      <div className="space-y-1 mb-3">
        <div>Token: {debugInfo.hasAuthToken ? '✅' : '❌'}</div>
        <div>Refresh: {debugInfo.hasRefreshToken ? '✅' : '❌'}</div>
        <div>Auth: {debugInfo.isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {debugInfo.isLoading ? '⏳' : '✅'}</div>
        {debugInfo.user && (
          <div>User: {debugInfo.user.email}</div>
        )}
      </div>

      <div className="space-y-2">
        <button 
          onClick={testAuth}
          className="bg-blue-600 px-2 py-1 rounded text-xs w-full"
        >
          Test Auth
        </button>
        
        <button 
          onClick={testCart}
          className="bg-green-600 px-2 py-1 rounded text-xs w-full"
        >
          Test Cart
        </button>
        
        <button 
          onClick={clearAuth}
          className="bg-red-600 px-2 py-1 rounded text-xs w-full"
        >
          Clear Auth
        </button>
      </div>

      {testResult && (
        <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
          {testResult}
        </div>
      )}
    </div>
  );
} 