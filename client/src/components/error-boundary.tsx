import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log adicional para debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
    
    // Aquí podrías enviar el error a un servicio de logging como Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center p-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              Algo salió mal
            </h1>
            <p className="text-gray-400 mb-6">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página o contacta soporte si el problema persiste.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-800 p-4 rounded-lg mb-6 text-sm">
                <summary className="cursor-pointer text-yellow-500 mb-2">Detalles del error (solo desarrollo)</summary>
                <pre className="whitespace-pre-wrap text-red-400 overflow-auto">
                  {this.state.error.toString()}
                  {'\n\nStack:\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors mr-3"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 