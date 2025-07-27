# 📸 Ejemplos de URLs de Imágenes Válidas

## ✅ URLs Aceptadas

### Imágenes JPG/JPEG:
- `https://i.imgur.com/dE1AVy1.png`
- `https://example.com/perfume1.jpg`
- `https://cdn.example.com/images/perfume2.jpeg`
- `https://images.unsplash.com/photo-1234567890.jpg`

### Imágenes PNG:
- `https://i.imgur.com/4KOoPSE.png`
- `https://example.com/perfume3.png`
- `https://cdn.example.com/images/perfume4.PNG`

### Imágenes GIF:
- `https://example.com/animation.gif`
- `https://cdn.example.com/loading.gif`

### Imágenes WebP:
- `https://example.com/perfume5.webp`
- `https://cdn.example.com/optimized.webp`

### Imágenes SVG:
- `https://example.com/logo.svg`
- `https://cdn.example.com/icon.svg`

### Imágenes BMP/TIFF:
- `https://example.com/scan.bmp`
- `https://cdn.example.com/document.tiff`

## ❌ URLs No Aceptadas

### Protocolos Inválidos:
- `ftp://example.com/image.jpg` ❌
- `file:///path/to/image.png` ❌
- `http://example.com/image.jpg` ✅
- `https://example.com/image.jpg` ✅

### Extensiones No Válidas:
- `https://example.com/image.txt` ❌
- `https://example.com/document.pdf` ❌
- `https://example.com/video.mp4` ❌

### URLs Mal Formadas:
- `not-a-url.jpg` ❌
- `https://` ❌
- `https://example.com` ❌ (sin extensión)

## 🎯 Cómo Usar en el Panel de Admin

1. **Ve al Panel de Administración**
2. **Selecciona "Perfumes"**
3. **Haz clic en "Agregar Perfume"**
4. **En el campo "URL de Imagen" ingresa una URL válida**
5. **Ejemplo**: `https://i.imgur.com/dE1AVy1.png`

## 🔧 Validación Automática

El sistema valida automáticamente:
- ✅ Protocolo HTTP/HTTPS
- ✅ URL bien formada
- ✅ Extensión de imagen válida
- ✅ Caracteres especiales permitidos

## 📝 Notas Importantes

- **Opcional**: El campo puede estar vacío
- **Cualquier dominio**: Puedes usar cualquier servidor de imágenes
- **Tamaño recomendado**: 300x300px mínimo para mejor calidad
- **Formatos preferidos**: JPG, PNG, WebP para mejor rendimiento 