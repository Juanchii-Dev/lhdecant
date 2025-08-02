import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

export function SEO({
  title = 'LH Decants - Perfumes Exclusivos y Fragancias de Lujo',
  description = 'Descubre nuestra colección exclusiva de perfumes y fragancias de lujo. Decants premium de las mejores marcas: Tom Ford, Creed, Maison Francis Kurkdjian y más.',
  keywords = 'perfumes, fragancias, decants, lujo, Tom Ford, Creed, Maison Francis Kurkdjian, perfumes exclusivos, fragancias premium, perfumes de nicho',
  image = 'https://lhdecant.com/og-image.jpg',
  url = 'https://lhdecant.com',
  type = 'website',
  structuredData
}: SEOProps) {
  useEffect(() => {
    // Actualizar título de la página
    document.title = title;

    // Actualizar meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Actualizar meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Actualizar Open Graph
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);

    // Actualizar Twitter Cards
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:url', url);

    // Actualizar canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Agregar structured data si se proporciona
    if (structuredData) {
      addStructuredData(structuredData);
    }

  }, [title, description, keywords, image, url, type, structuredData]);

  return null; // Este componente no renderiza nada
}

function updateMetaTag(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) || 
             document.querySelector(`meta[name="${property}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    if (property.startsWith('og:')) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

function addStructuredData(data: object) {
  // Remover structured data existente
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Agregar nuevo structured data
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

// Componentes específicos para diferentes tipos de páginas
export function HomeSEO() {
  return (
    <SEO
      title="LH Decants - Perfumes Exclusivos y Fragancias de Lujo | Decants Premium"
      description="Descubre nuestra colección exclusiva de perfumes y fragancias de lujo. Decants premium de las mejores marcas: Tom Ford, Creed, Maison Francis Kurkdjian y más. Envío gratis en pedidos superiores a $50."
      keywords="perfumes exclusivos, fragancias de lujo, decants premium, Tom Ford, Creed, Maison Francis Kurkdjian, perfumes de nicho, fragancias premium"
      url="https://lhdecant.com"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "LH Decants",
        "url": "https://lhdecant.com",
        "logo": "https://lhdecant.com/logo.png",
        "description": "Tienda especializada en perfumes exclusivos y fragancias de lujo",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "ES"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "info@lhdecant.com"
        }
      }}
    />
  );
}

export function CatalogSEO() {
  return (
    <SEO
      title="Catálogo de Perfumes Exclusivos | LH Decants"
      description="Explora nuestro catálogo completo de perfumes exclusivos y fragancias de lujo. Encuentra tu fragancia perfecta entre las mejores marcas del mundo."
      keywords="catálogo perfumes, perfumes exclusivos, fragancias lujo, comprar perfumes, perfumes online"
      url="https://lhdecant.com/catalogo"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Catálogo de Perfumes Exclusivos",
        "description": "Colección completa de perfumes exclusivos y fragancias de lujo",
        "url": "https://lhdecant.com/catalogo",
        "numberOfItems": 50
      }}
    />
  );
}

export function ProductSEO({ product }: { product: any }) {
  return (
    <SEO
      title={`${product.name} - ${product.brand} | LH Decants`}
      description={`Descubre ${product.name} de ${product.brand}. ${product.description}. Disponible en diferentes tamaños. Envío gratis.`}
      keywords={`${product.name}, ${product.brand}, perfume, fragancia, decant, ${product.category}`}
      url={`https://lhdecant.com/catalogo/${product.id}`}
      type="product"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "brand": {
          "@type": "Brand",
          "name": product.brand
        },
        "category": product.category,
        "image": product.imageUrl,
        "offers": {
          "@type": "Offer",
          "price": product.prices[0],
          "priceCurrency": "EUR",
          "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      }}
    />
  );
}

export function CollectionsSEO() {
  return (
    <SEO
      title="Colecciones de Perfumes | LH Decants"
      description="Descubre nuestras colecciones temáticas de perfumes exclusivos. Colecciones cuidadosamente curadas para diferentes ocasiones y personalidades."
      keywords="colecciones perfumes, perfumes temáticos, fragancias colección, perfumes exclusivos"
      url="https://lhdecant.com/colecciones"
    />
  );
}

export function ContactSEO() {
  return (
    <SEO
      title="Contacto | LH Decants"
      description="Contáctanos para cualquier consulta sobre nuestros perfumes exclusivos. Estamos aquí para ayudarte a encontrar tu fragancia perfecta."
      keywords="contacto, soporte, ayuda, consultas perfumes, atención al cliente"
      url="https://lhdecant.com/contacto"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contacto LH Decants",
        "description": "Página de contacto para consultas sobre perfumes exclusivos",
        "url": "https://lhdecant.com/contacto"
      }}
    />
  );
} 