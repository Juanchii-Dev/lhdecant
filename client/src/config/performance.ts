import React from 'react';

// Configuración de rendimiento y optimización
export const PERFORMANCE_CONFIG = {
  // Lazy loading
  LAZY_LOAD_OFFSET: 100, // Píxeles antes de que el elemento entre en viewport
  
  // Image optimization
  IMAGE_QUALITY: 85,
  IMAGE_FORMATS: ['webp', 'avif', 'jpg'],
  
  // Caching
  CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
  
  // Preloading
  PRELOAD_CRITICAL_RESOURCES: true,
  
  // Service Worker
  ENABLE_SERVICE_WORKER: true,
  
  // Compression
  ENABLE_COMPRESSION: true,
  
  // CDN
  CDN_URL: 'https://lhdecant-cdn.com',
};

// Función para optimizar imágenes
export function optimizeImageUrl(url: string, width?: number, height?: number, quality?: number): string {
  if (!url) return url;
  
  // Si ya es una URL optimizada, devolverla tal como está
  if (url.includes('cloudinary.com') || url.includes('lhdecant-cdn.com')) {
    return url;
  }
  
  // Para imágenes locales, usar el CDN
  if (url.startsWith('/')) {
    const optimizedUrl = `${PERFORMANCE_CONFIG.CDN_URL}${url}`;
    
    if (width || height || quality) {
      const params = new URLSearchParams();
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      if (quality) params.append('q', quality.toString());
      
      return `${optimizedUrl}?${params.toString()}`;
    }
    
    return optimizedUrl;
  }
  
  return url;
}

// Función para lazy loading de imágenes
export function useLazyImage(src: string, alt: string, className?: string) {
  const [imageSrc, setImageSrc] = React.useState<string>('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: `${PERFORMANCE_CONFIG.LAZY_LOAD_OFFSET}px`,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (isInView) {
      setImageSrc(src);
    }
  }, [isInView, src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return {
    imgRef,
    imageSrc,
    isLoaded,
    handleLoad,
    className: `${className || ''} ${isLoaded ? 'opacity-100' : 'opacity-0'}`.trim(),
  };
}

// Función para preload recursos críticos
export function preloadCriticalResources() {
  if (!PERFORMANCE_CONFIG.PRELOAD_CRITICAL_RESOURCES) return;

  const criticalResources = [
    '/fonts/montserrat.woff2',
    '/fonts/playfair-display.woff2',
    '/images/hero-bg.jpg',
    '/images/logo.png',
  ];

  criticalResources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    if (resource.includes('.woff2')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (resource.includes('.jpg') || resource.includes('.png')) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

// Función para medir Core Web Vitals
export function measureCoreWebVitals() {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    if (lastEntry) {
      const lcp = lastEntry.startTime;
      console.log('LCP:', lcp);
      
      // Enviar a analytics
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'LCP',
          value: Math.round(lcp),
        });
      }
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay (FID)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    
    entries.forEach((entry: any) => {
      const fid = entry.processingStart - entry.startTime;
      console.log('FID:', fid);
      
      // Enviar a analytics
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'FID',
          value: Math.round(fid),
        });
      }
    });
  }).observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  let clsEntries: any[] = [];

  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        clsEntries.push(entry);
      }
    });
    
    console.log('CLS:', clsValue);
    
    // Enviar a analytics
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'CLS',
        value: Math.round(clsValue * 1000) / 1000,
      });
    }
  }).observe({ entryTypes: ['layout-shift'] });
}

// Función para optimizar el rendimiento de la aplicación
export function optimizeAppPerformance() {
  // Preload recursos críticos
  preloadCriticalResources();
  
  // Medir Core Web Vitals
  measureCoreWebVitals();
  
  // Optimizar scroll
  if (typeof window !== 'undefined') {
    let ticking = false;
    
    const updateScroll = () => {
      // Aquí puedes agregar lógica de optimización de scroll
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }
}

// Hook para optimizar el rendimiento de componentes
export function usePerformanceOptimization() {
  React.useEffect(() => {
    // Optimizar el componente cuando se monta
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log del tiempo de renderizado en desarrollo
      if (import.meta.env.DEV && renderTime > 16) {
        console.warn(`⚠️ Component render time: ${renderTime.toFixed(2)}ms (target: <16ms)`);
      }
    };
  }, []);
}

// Función para comprimir datos
export function compressData(data: any): string {
  if (typeof data === 'string') {
    return data;
  }
  
  const jsonString = JSON.stringify(data);
  
  // Comprimir usando LZ-string si está disponible
  if (typeof window !== 'undefined' && (window as any).LZString) {
    return (window as any).LZString.compress(jsonString);
  }
  
  return jsonString;
}

// Función para descomprimir datos
export function decompressData(compressedData: string): any {
  if (typeof window !== 'undefined' && (window as any).LZString) {
    const decompressed = (window as any).LZString.decompress(compressedData);
    return JSON.parse(decompressed);
  }
  
  return JSON.parse(compressedData);
}

// Función para cachear datos
export function cacheData(key: string, data: any, duration?: number): void {
  if (typeof window === 'undefined') return;
  
  const cacheItem = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + (duration || PERFORMANCE_CONFIG.CACHE_DURATION),
  };
  
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

// Función para obtener datos cacheados
export function getCachedData(key: string): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`cache_${key}`);
    if (!cached) return null;
    
    const cacheItem = JSON.parse(cached);
    
    if (Date.now() > cacheItem.expiresAt) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.warn('Failed to get cached data:', error);
    return null;
  }
}

// Función para limpiar cache expirado
export function cleanExpiredCache(): void {
  if (typeof window === 'undefined') return;
  
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key => key.startsWith('cache_'));
  
  cacheKeys.forEach(key => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const cacheItem = JSON.parse(cached);
        if (Date.now() > cacheItem.expiresAt) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      localStorage.removeItem(key);
    }
  });
} 