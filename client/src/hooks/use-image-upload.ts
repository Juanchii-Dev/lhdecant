import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

interface UseImageUploadOptions {
  maxSize?: number; // en bytes
  allowedTypes?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], onSuccess, onError } = options;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    // Validaciones
    if (!allowedTypes.includes(file.type)) {
      const error = `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`;
      toast({
        title: "Error de formato",
        description: error,
        variant: "destructive",
      });
      throw new Error(error);
    }

    if (file.size > maxSize) {
      const error = `Archivo demasiado grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`;
      toast({
        title: "Error de tamaño",
        description: error,
        variant: "destructive",
      });
      throw new Error(error);
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Aquí implementarías la carga real a Cloudinary o Firebase Storage
      // Por ahora simulamos la carga
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setProgress(100);

      // URL simulada de Cloudinary
      const imageUrl = `https://res.cloudinary.com/lhdecant/image/upload/v1/perfumes/${Date.now()}_${file.name}`;
      
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido exitosamente.",
      });

      onSuccess?.(imageUrl);
      return imageUrl;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al subir la imagen";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [maxSize, allowedTypes, onSuccess, onError, toast]);

  const optimizeImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones (máximo 1200px de ancho)
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen optimizada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        }, file.type, 0.8); // Calidad 80%
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  return {
    uploadImage,
    optimizeImage,
    uploading,
    progress,
  };
} 