import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para subir imagen desde URL
export async function uploadFromUrl(imageUrl: string, folder: string = 'lhdecant'): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw new Error('Failed to upload image from URL');
  }
}

// Función para eliminar imagen
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

// Función para obtener public ID de una URL de Cloudinary
export function getPublicIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/([^\/]+)\./);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

// Función para validar si una URL es de Cloudinary
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

export default cloudinary; 