# Configuración de Cloudinary para LH Decants

## ¿Por qué Cloudinary?

Cloudinary es una alternativa gratuita a Firebase Storage que ofrece:
- **Plan gratuito generoso**: 25 GB de almacenamiento, 25 GB de ancho de banda/mes
- **Optimización automática**: Redimensiona y comprime imágenes automáticamente
- **CDN global**: Entrega rápida de imágenes en todo el mundo
- **Transformaciones en tiempo real**: Cambiar formato, tamaño, calidad sin re-subir
- **API simple**: Fácil integración con Node.js

## Pasos para configurar Cloudinary:

### 1. Crear cuenta en Cloudinary
1. Ve a: https://cloudinary.com/
2. Haz clic en "Sign Up For Free"
3. Completa el registro con tu email
4. Confirma tu cuenta

### 2. Obtener credenciales
1. Ve a tu Dashboard de Cloudinary
2. En la sección "Account Details" encontrarás:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Configurar variables de entorno
Agrega estas líneas a tu archivo `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 4. Ejemplo de configuración:
```env
CLOUDINARY_CLOUD_NAME=myapp123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

## Funcionalidades implementadas:

### ✅ Subida de imágenes desde URL
```typescript
// Endpoint: POST /api/images/upload
{
  "imageUrl": "https://ejemplo.com/imagen.jpg"
}
```

### ✅ Eliminación de imágenes
```typescript
// Endpoint: DELETE /api/images/:publicId
```

### ✅ Optimización automática
- Redimensionamiento a 800x800 máximo
- Compresión automática
- Conversión a formato optimizado (WebP)

### ✅ Validación de URLs
- Verifica que la URL sea válida
- Acepta formatos: .jpg, .jpeg, .png, .gif, .webp
- Manejo de errores robusto

## Uso en la aplicación:

### Frontend (React)
```typescript
// El componente ImageUpload ya está configurado para usar Cloudinary
<ImageUpload 
  onImageUpload={(url) => setImageUrl(url)}
  currentImage={perfume.imageUrl}
/>
```

### Backend (Node.js)
```typescript
// Subir imagen desde URL
const cloudinaryUrl = await uploadFromUrl(imageUrl, 'perfumes');

// Eliminar imagen
await deleteImage(publicId);
```

## Ventajas sobre Firebase Storage:

| Característica | Cloudinary | Firebase Storage |
|----------------|------------|------------------|
| **Plan gratuito** | 25 GB + 25 GB/mes | 5 GB + 1 GB/mes |
| **Optimización** | Automática | Manual |
| **CDN** | Global incluido | Limitado |
| **Transformaciones** | En tiempo real | No disponible |
| **Configuración** | Simple | Compleja |

## Seguridad:

- ✅ **API Key y Secret** en variables de entorno
- ✅ **Validación de URLs** antes de subir
- ✅ **Límites de tamaño** (5MB por archivo)
- ✅ **Formatos permitidos** solo imágenes
- ✅ **Autenticación requerida** para subir/eliminar

## Soporte:

Si tienes problemas con Cloudinary:
1. Verifica las credenciales en `.env`
2. Revisa los logs del servidor
3. Consulta la documentación: https://cloudinary.com/documentation
4. Contacta soporte: https://support.cloudinary.com/

¡Cloudinary está listo para usar! 🚀 