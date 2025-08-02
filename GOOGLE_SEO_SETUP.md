# Configuración de SEO para Google - LH Decants

## 📋 Resumen de Optimizaciones Implementadas

### ✅ Metadatos SEO
- **Title tags** optimizados para cada página
- **Meta descriptions** descriptivas y atractivas
- **Meta keywords** relevantes para el nicho de perfumes
- **Open Graph** para redes sociales
- **Twitter Cards** para Twitter
- **Canonical URLs** para evitar contenido duplicado

### ✅ Structured Data (JSON-LD)
- **Organization** schema para la empresa
- **WebSite** schema con funcionalidad de búsqueda
- **Store** schema para la tienda online
- **Product** schema para cada perfume
- **ItemList** schema para el catálogo
- **ContactPage** schema para la página de contacto

### ✅ Archivos Técnicos
- **sitemap.xml** con todas las páginas importantes
- **robots.txt** configurado para crawlers
- **manifest.json** para PWA
- **Favicons** en múltiples tamaños

### ✅ Optimización de Rendimiento
- **Core Web Vitals** tracking
- **Lazy loading** de imágenes
- **Preloading** de recursos críticos
- **Caching** optimizado
- **Compresión** de datos

## 🔧 Configuración de Google Search Console

### 1. Crear cuenta en Google Search Console
1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Agregar propiedad"

### 2. Verificar propiedad
Elige uno de estos métodos:

#### Método A: Archivo HTML (Recomendado)
1. Descarga el archivo de verificación que te proporciona Google
2. Sube el archivo a la raíz de tu sitio web (`https://lhdecant.com/`)
3. Haz clic en "Verificar"

#### Método B: Meta tag
1. Copia el meta tag que te proporciona Google
2. Reemplaza el contenido en `client/index.html`:
```html
<meta name="google-site-verification" content="TU-CODIGO-DE-VERIFICACION" />
```

### 3. Configurar sitemap
1. En Google Search Console, ve a "Sitemaps"
2. Agrega tu sitemap: `https://lhdecant.com/sitemap.xml`
3. Haz clic en "Enviar"

### 4. Configurar dominio preferido
1. Ve a "Configuración" > "Configuración del sitio"
2. Establece tu dominio preferido como `https://lhdecant.com`

## 📊 Configuración de Google Analytics 4

### 1. Crear propiedad en Google Analytics
1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una nueva propiedad
3. Configura la información de la empresa:
   - Nombre: LH Decants
   - Industria: Comercio electrónico
   - Zona horaria: Europe/Madrid
   - Moneda: EUR

### 2. Obtener Measurement ID
1. En la configuración de la propiedad, copia el **Measurement ID** (formato: G-XXXXXXXXXX)
2. Reemplaza en `client/src/config/analytics.ts`:
```typescript
GA_MEASUREMENT_ID: 'G-TU-MEASUREMENT-ID',
```

### 3. Configurar eventos personalizados
Los siguientes eventos ya están configurados:
- **purchase**: Compra completada
- **add_to_cart**: Producto agregado al carrito
- **search**: Búsqueda realizada
- **click**: Clics en enlaces
- **scroll**: Profundidad de scroll
- **web_vitals**: Core Web Vitals

### 4. Configurar conversiones
En Google Analytics, configura estos eventos como conversiones:
- `purchase`
- `add_to_cart`
- `search`

## 🔍 Configuración de Google Tag Manager (Opcional)

### 1. Crear cuenta en GTM
1. Ve a [Google Tag Manager](https://tagmanager.google.com/)
2. Crea una nueva cuenta y contenedor
3. Obtén el **Container ID** (formato: GTM-XXXXXXXX)

### 2. Configurar en el código
Reemplaza en `client/src/config/analytics.ts`:
```typescript
GTM_ID: 'GTM-TU-CONTAINER-ID',
```

## 📱 Configuración de Google My Business

### 1. Crear perfil de empresa
1. Ve a [Google My Business](https://business.google.com/)
2. Crea un perfil para LH Decants
3. Completa toda la información:
   - Nombre: LH Decants
   - Categoría: Tienda de perfumes
   - Dirección: Tu dirección física
   - Teléfono: Tu número de contacto
   - Horarios: Horarios de atención
   - Descripción: Descripción de la empresa

### 2. Verificar propiedad
- Sigue las instrucciones para verificar tu negocio
- Esto ayudará con el SEO local

## 🎯 Configuración de Google Ads (Opcional)

### 1. Crear cuenta de Google Ads
1. Ve a [Google Ads](https://ads.google.com/)
2. Crea una nueva cuenta
3. Configura la información de facturación

### 2. Configurar remarketing
1. Crea una lista de remarketing
2. Configura el código de remarketing en Google Tag Manager
3. Esto te permitirá mostrar anuncios a visitantes anteriores

## 📈 Monitoreo y Optimización

### 1. Revisar Search Console regularmente
- **Errores de rastreo**: Corregir errores 404, 500, etc.
- **Cobertura del índice**: Verificar que las páginas importantes estén indexadas
- **Consultas de búsqueda**: Analizar qué términos buscan los usuarios
- **Posiciones**: Monitorear el ranking de palabras clave importantes

### 2. Revisar Analytics regularmente
- **Tráfico orgánico**: Monitorear el crecimiento del tráfico de búsqueda
- **Conversiones**: Analizar la tasa de conversión
- **Comportamiento**: Ver qué páginas son más populares
- **Audiencia**: Entender quién visita tu sitio

### 3. Optimización continua
- **Contenido**: Crear contenido relevante para tu nicho
- **Palabras clave**: Investigar nuevas palabras clave
- **Enlaces internos**: Mejorar la estructura de enlaces
- **Velocidad**: Mantener el sitio rápido

## 🔧 Configuración de Variables de Entorno

### Para producción, configura estas variables:

```bash
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager
VITE_GTM_ID=GTM-XXXXXXXX

# Google Search Console
VITE_SEARCH_CONSOLE_VERIFICATION=your-verification-code

# Bing Webmaster Tools
VITE_BING_VERIFICATION=your-bing-verification-code

# Yandex Webmaster
VITE_YANDEX_VERIFICATION=your-yandex-verification-code
```

## 📋 Checklist de Verificación

### ✅ Configuración Básica
- [ ] Google Search Console configurado y verificado
- [ ] Sitemap.xml enviado a Search Console
- [ ] Google Analytics 4 configurado
- [ ] Measurement ID actualizado en el código
- [ ] Eventos personalizados configurados
- [ ] Google My Business configurado (si tienes ubicación física)

### ✅ Optimización Técnica
- [ ] Metadatos optimizados en todas las páginas
- [ ] Structured data implementado
- [ ] Core Web Vitals monitoreados
- [ ] Velocidad del sitio optimizada
- [ ] Mobile-friendly verificado

### ✅ Contenido y SEO
- [ ] Títulos únicos y descriptivos
- [ ] Meta descriptions atractivas
- [ ] URLs amigables para SEO
- [ ] Contenido relevante y de calidad
- [ ] Enlaces internos optimizados

### ✅ Monitoreo
- [ ] Alertas configuradas en Search Console
- [ ] Reportes regulares programados
- [ ] Análisis de competencia realizado
- [ ] Palabras clave objetivo definidas

## 🚀 Próximos Pasos

1. **Implementar las configuraciones** de Google Search Console y Analytics
2. **Monitorear el rendimiento** durante las primeras semanas
3. **Optimizar basándose en datos** de Analytics y Search Console
4. **Crear contenido SEO** para palabras clave importantes
5. **Construir enlaces de calidad** desde sitios relevantes

## 📞 Soporte

Si necesitas ayuda con la configuración:
- Consulta la documentación oficial de Google
- Revisa los logs de la aplicación para errores
- Verifica que todas las variables de entorno estén configuradas correctamente

---

**Nota**: Esta configuración te ayudará a mejorar significativamente la visibilidad de LH Decants en Google y otros motores de búsqueda. Recuerda que el SEO es un proceso a largo plazo que requiere paciencia y optimización continua. 