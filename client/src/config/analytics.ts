import React from 'react';

// Configuración de Google Analytics y Search Console
export const ANALYTICS_CONFIG = {
  // Google Analytics 4
  GA_MEASUREMENT_ID: 'G-XXXXXXXXXX', // Reemplazar con tu ID real
  
  // Google Tag Manager
  GTM_ID: 'GTM-XXXXXXXX', // Reemplazar con tu ID real
  
  // Google Search Console
  SEARCH_CONSOLE_VERIFICATION: 'your-verification-code', // Reemplazar con tu código
  
  // Bing Webmaster Tools
  BING_VERIFICATION: 'your-bing-verification-code', // Reemplazar con tu código
  
  // Yandex Webmaster
  YANDEX_VERIFICATION: 'your-yandex-verification-code', // Reemplazar con tu código
};

// Función para inicializar Google Analytics
export function initializeGoogleAnalytics() {
  if (typeof window !== 'undefined' && ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    // Google Analytics 4
    window.gtag = window.gtag || function() {
      (window.gtag as any).q = (window.gtag as any).q || [];
      (window.gtag as any).q.push(arguments);
    };
    
    (window.gtag as any)('js', new Date());
    (window.gtag as any)('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
    
    console.log('✅ Google Analytics inicializado');
  }
}

// Función para trackear eventos personalizados
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    (window.gtag as any)('event', eventName, parameters);
  }
}

// Función para trackear páginas vistas
export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    (window.gtag as any)('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: url,
    });
  }
}

// Función para trackear conversiones de e-commerce
export function trackPurchase(transactionId: string, value: number, currency: string = 'EUR') {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
  });
}

// Función para trackear agregar al carrito
export function trackAddToCart(productId: string, productName: string, price: number, quantity: number = 1) {
  trackEvent('add_to_cart', {
    currency: 'EUR',
    value: price * quantity,
    items: [{
      item_id: productId,
      item_name: productName,
      price: price,
      quantity: quantity,
    }],
  });
}

// Función para trackear búsquedas
export function trackSearch(searchTerm: string, resultsCount: number) {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

// Función para trackear clics en enlaces
export function trackLinkClick(linkText: string, linkUrl: string) {
  trackEvent('click', {
    link_text: linkText,
    link_url: linkUrl,
  });
}

// Función para trackear tiempo en página
export function trackTimeOnPage(timeSpent: number) {
  trackEvent('timing_complete', {
    name: 'page_view_time',
    value: timeSpent,
  });
}

// Función para trackear errores
export function trackError(errorMessage: string, errorCode?: string) {
  trackEvent('exception', {
    description: errorMessage,
    fatal: false,
    custom_parameter: errorCode,
  });
}

// Función para trackear scroll
export function trackScroll(depth: number) {
  trackEvent('scroll', {
    scroll_depth: depth,
  });
}

// Función para trackear engagement
export function trackEngagement(action: string, category: string, label?: string) {
  trackEvent('custom_event', {
    event_category: category,
    event_action: action,
    event_label: label,
  });
}

// Hook personalizado para trackear tiempo en página
export function usePageTracking() {
  React.useEffect(() => {
    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime;
      trackTimeOnPage(timeSpent);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}

// Hook personalizado para trackear scroll
export function useScrollTracking() {
  React.useEffect(() => {
    let maxScroll = 0;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Trackear en intervalos de 25%
        if (maxScroll >= 25 && maxScroll < 50) {
          trackScroll(25);
        } else if (maxScroll >= 50 && maxScroll < 75) {
          trackScroll(50);
        } else if (maxScroll >= 75 && maxScroll < 100) {
          trackScroll(75);
        } else if (maxScroll >= 100) {
          trackScroll(100);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

// Declaración de tipos para window
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
} 