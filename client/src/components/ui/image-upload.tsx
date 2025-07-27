import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./button";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

export default function ImageUpload({ onImageUpload, currentImage, className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      // Crear preview inmediato
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Simular carga a Cloudinary (aquí implementarías la carga real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // URL simulada de Cloudinary (reemplazar con URL real)
      const cloudinaryUrl = `https://res.cloudinary.com/lhdecant/image/upload/v1/perfumes/${file.name}`;
      
      onImageUpload(cloudinaryUrl);
      setUploading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploading(false);
      setPreview(null);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = () => {
    setPreview(null);
    onImageUpload("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview de imagen actual */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="relative w-full h-48 bg-charcoal rounded-lg overflow-hidden border border-luxury-gold/20">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                onClick={removeImage}
                variant="destructive"
                size="sm"
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Eliminar</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Área de drop */}
      <div {...getRootProps()}>
        <motion.div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'border-luxury-gold bg-luxury-gold/10' 
              : 'border-luxury-gold/30 hover:border-luxury-gold/50 hover:bg-charcoal/50'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              <Loader2 className="w-8 h-8 text-luxury-gold animate-spin" />
              <div>
                <p className="text-luxury-gold font-medium">Subiendo imagen...</p>
                <p className="text-gray-400 text-sm">Por favor espera</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              {isDragActive ? (
                <>
                  <Upload className="w-8 h-8 text-luxury-gold" />
                  <p className="text-luxury-gold font-medium">Suelta la imagen aquí</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">
                      {preview ? 'Cambiar imagen' : 'Arrastra una imagen aquí'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      o haz clic para seleccionar
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      PNG, JPG, WEBP hasta 5MB
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
} 