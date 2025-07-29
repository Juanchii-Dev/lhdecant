# 🚀 Guía de Despliegue - LH Decants

## 📋 Prerrequisitos

- Cuenta en [Netlify](https://netlify.com) (gratuita)
- Cuenta en [Render](https://render.com) (gratuita)
- Cuenta en [Firebase](https://firebase.google.com) (gratuita)
- Cuenta en [Stripe](https://stripe.com) (gratuita)

## 🎯 Despliegue del Backend en Render

### 1. Preparar el repositorio
```bash
# Asegúrate de que todos los cambios estén committeados
git add .
git commit -m "feat: Prepare for deployment"
git push origin main
```

### 2. Crear servicio en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `lhdecant`

### 3. Configurar el servicio

**Configuración básica:**
- **Name**: `lhdecant-backend`
- **Environment**: `Node`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Variables de entorno en Render

Agrega estas variables de entorno en Render:

```env
NODE_ENV=production
PORT=10000

# Firebase
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY=tu-clave-privada
FIREBASE_CLIENT_EMAIL=tu-email-cliente

# Google OAuth2
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=https://lhdecant-backend.onrender.com/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=tu-stripe-secret-key
STRIPE_WEBHOOK_SECRET=tu-webhook-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-app
SMTP_FROM=tu-email@gmail.com

# URLs
FRONTEND_URL=https://lhdecant.netlify.app
RESET_PASSWORD_URL=https://lhdecant.netlify.app/reset-password
ADMIN_EMAIL=lhdecant@gmail.com
```

### 5. Desplegar

1. Haz clic en "Create Web Service"
2. Render comenzará a construir y desplegar tu aplicación
3. El backend estará disponible en: `https://lhdecant-backend.onrender.com`

## 🎨 Despliegue del Frontend en Netlify

### 1. Preparar el frontend

Asegúrate de que el archivo `client/netlify.toml` esté presente.

### 2. Crear sitio en Netlify

1. Ve a [Netlify Dashboard](https://app.netlify.com)
2. Haz clic en "Add new site" → "Import an existing project"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `lhdecant`

### 3. Configurar el build

**Configuración del build:**
- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 4. Variables de entorno en Netlify

Agrega estas variables de entorno en Netlify:

```env
VITE_API_URL=https://lhdecant-backend.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RZxiqGC1P4caX5QWMGRoh3wvuJaIuq6R1ifXDjfvotOhkJn0y4uE1IkXa4GRV12iaty790
```

### 5. Desplegar

1. Haz clic en "Deploy site"
2. Netlify comenzará a construir y desplegar tu frontend
3. El frontend estará disponible en: `https://lhdecant.netlify.app`

## 🔧 Configuración adicional

### Configurar dominio personalizado (opcional)

1. **En Netlify**: Ve a "Domain settings" → "Add custom domain"
2. **En Render**: Ve a "Settings" → "Custom Domains"

### Configurar webhooks de Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Crea un nuevo webhook
3. **Endpoint URL**: `https://lhdecant-backend.onrender.com/api/stripe/webhook`
4. **Events**: Selecciona todos los eventos de pago

### Configurar Google OAuth2

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Actualiza las URIs de redirección autorizadas:
   - `https://lhdecant-backend.onrender.com/api/auth/google/callback`

## 🧪 Verificar el despliegue

### Backend
```bash
# Verificar que el backend responde
curl https://lhdecant-backend.onrender.com/api/health
```

### Frontend
1. Visita `https://lhdecant.netlify.app`
2. Verifica que todas las funcionalidades trabajen
3. Prueba el flujo de compra completo

## 🔍 Troubleshooting

### Problemas comunes

1. **Error de CORS**: Verifica que las URLs estén correctamente configuradas
2. **Error de autenticación**: Verifica las credenciales de Firebase
3. **Error de Stripe**: Verifica las claves de API
4. **Error de build**: Verifica los logs de build en Render/Netlify

### Logs útiles

- **Render**: Ve a tu servicio → "Logs"
- **Netlify**: Ve a tu sitio → "Deploys" → "View deploy log"

## 📞 Soporte

Si tienes problemas con el despliegue:

1. Revisa los logs de error
2. Verifica las variables de entorno
3. Asegúrate de que todas las dependencias estén instaladas
4. Contacta al equipo de desarrollo

---

¡Tu aplicación LH Decants estará lista para producción! 🎉 