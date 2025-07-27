import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = "/placeholder-perfume.jpg",
  loading = "lazy" 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Verificar si la URL es válida antes de cargar
  useEffect(() => {
    if (src && !src.includes('imgur.com/example') && !src.includes('imgur.com/bleu-chanel') && !src.includes('imgur.com/la-vie-est-belle') && !src.includes('imgur.com/sauvage')) {
      setCurrentSrc(src);
    } else {
      setCurrentSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-charcoal animate-pulse"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-charcoal flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Imagen no disponible</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      <motion.img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
} 