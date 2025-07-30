# ✅ Lista de Verificación para Despliegue en Producción

## 🎯 Estado Actual: LISTO PARA DESPLIEGUE

### ✅ Configuración Completada

- [x] **Servidor optimizado para producción**
  - [x] Middleware de seguridad (Helmet)
  - [x] Compresión habilitada
  - [x] CORS configurado para múltiples dominios
  - [x] Health check endpoint (`/api/health`)
  - [x] Manejo de errores mejorado

- [x] **Frontend optimizado**
  - [x] Build optimizado con Vite
  - [x] Code splitting configurado
  - [x] Minificación habilitada
  - [x] Cache headers configurados

- [x] **Configuración de despliegue**
  - [x] `render.yaml` para backend
  - [x] `netlify.toml` para frontend
  - [x] Variables de entorno de producción
  - [x] Scripts de build optimizados

- [x] **Documentación actualizada**
  - [x] README con instrucciones de despliegue
  - [x] Guía paso a paso
  - [x] URLs de producción configuradas

## 🚀 Próximos Pasos para Despliegue

### 1. Preparar el Repositorio
```bash
# Asegurar que todos los cambios estén committeados
git add .
git commit -m "feat: Prepare application for production deployment"
git push origin main
```

### 2. Configurar Render (Backend)

1. **Crear servicio en Render:**
   - Ve a [Render Dashboard](https://dashboard.render.com)
   - "New +" → "Web Service"
   - Conecta repositorio GitHub
   - Selecciona `lhdecant`

2. **Configuración del servicio:**
   - **Name**: `lhdecant-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Variables de entorno:**
   ```env
   NODE_ENV=production
   PORT=10000
   FIREBASE_PROJECT_ID=tu-proyecto-firebase
   FIREBASE_PRIVATE_KEY=tu-clave-privada
   FIREBASE_CLIENT_EMAIL=tu-email-cliente
   GOOGLE_CLIENT_ID=tu-client-id
   GOOGLE_CLIENT_SECRET=tu-client-secret
   GOOGLE_REDIRECT_URI=https://lhdecant-backend.onrender.com/api/auth/google/callback
   STRIPE_SECRET_KEY=tu-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=tu-webhook-secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-contraseña-app
   SMTP_FROM=tu-email@gmail.com
   FRONTEND_URL=https://lhdecant.netlify.app
   RESET_PASSWORD_URL=https://lhdecant.netlify.app/reset-password
   ADMIN_EMAIL=lhdecant@gmail.com
   ```

### 3. Configurar Netlify (Frontend)

1. **Crear sitio en Netlify:**
   - Ve a [Netlify Dashboard](https://app.netlify.com)
   - "Add new site" → "Import an existing project"
   - Conecta repositorio GitHub
   - Selecciona `lhdecant`

2. **Configuración del build:**
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Variables de entorno:**
   ```env
   VITE_API_URL=https://lhdecant-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RZxiqGC1P4caX5QWMGRoh3wvuJaIuq6R1ifXDjfvotOhkJn0y4uE1IkXa4GRV12iaty790
   ```

### 4. Configuración Adicional

#### Webhooks de Stripe
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Crea nuevo webhook
3. **Endpoint URL**: `https://lhdecant-backend.onrender.com/api/stripe/webhook`
4. **Events**: Selecciona todos los eventos de pago

#### Google OAuth2
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Actualiza URIs de redirección autorizadas:
   - `https://lhdecant-backend.onrender.com/api/auth/google/callback`

### 5. Verificación Post-Despliegue

#### Backend
```bash
# Verificar health check
curl https://lhdecant-backend.onrender.com/api/health

# Verificar que responde JSON
curl https://lhdecant-backend.onrender.com/api/health | jq
```

#### Frontend
1. Visita `https://lhdecant.netlify.app`
2. Verifica que carga correctamente
3. Prueba funcionalidades principales:
   - Navegación
   - Catálogo
   - Autenticación
   - Carrito de compras

### 6. Monitoreo y Mantenimiento

#### Logs
- **Render**: Ve a tu servicio → "Logs"
- **Netlify**: Ve a tu sitio → "Deploys" → "View deploy log"

#### Métricas
- **Render**: Ve a tu servicio → "Metrics"
- **Netlify**: Ve a tu sitio → "Analytics"

## 🔧 Comandos Útiles

### Verificación Local
```bash
# Verificar configuración
npm run check:prod

# Build completo
npm run build

# Build solo servidor
npm run server:build

# Build solo cliente
npm run client:build
```

### Despliegue Manual
```bash
# Backend en Render
# (Se hace automáticamente al hacer push)

# Frontend en Netlify
# (Se hace automáticamente al hacer push)
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error de CORS**
   - Verificar URLs en configuración de CORS
   - Asegurar que las variables de entorno estén correctas

2. **Error de autenticación**
   - Verificar credenciales de Firebase
   - Comprobar configuración de Google OAuth

3. **Error de Stripe**
   - Verificar claves de API
   - Comprobar configuración de webhooks

4. **Error de build**
   - Revisar logs de build
   - Verificar dependencias

### Contacto de Soporte
- Email: lhdecant@gmail.com
- Issues: [GitHub Issues](https://github.com/tu-usuario/lhdecant/issues)

---

## 🎉 ¡Despliegue Completado!

Una vez completados todos los pasos, tu aplicación estará disponible en:

- **Frontend**: https://lhdecant.netlify.app
- **Backend**: https://lhdecant-backend.onrender.com
- **Health Check**: https://lhdecant-backend.onrender.com/api/health

¡Tu tienda de perfumes LH Decants estará lista para recibir clientes! 🎭✨ 