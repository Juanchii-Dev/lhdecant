# 🎭 LH Decants - Tienda de Perfumes

Una aplicación web moderna para la venta de perfumes con autenticación, carrito de compras, pagos con Stripe y panel de administración.

## 🚀 Despliegue en Producción

### Prerrequisitos
- Cuenta en [Netlify](https://netlify.com) (gratuita)
- Cuenta en [Render](https://render.com) (gratuita)
- Cuenta en [Firebase](https://firebase.google.com) (gratuita)
- Cuenta en [Stripe](https://stripe.com) (gratuita)

### 1. Despliegue del Backend en Render

1. **Conectar repositorio a Render:**
   - Ve a [Render Dashboard](https://dashboard.render.com)
   - Haz clic en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio `lhdecant`

2. **Configurar el servicio:**
   - **Name**: `lhdecant-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Variables de entorno en Render:**
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

### 2. Despliegue del Frontend en Netlify

1. **Conectar repositorio a Netlify:**
   - Ve a [Netlify Dashboard](https://app.netlify.com)
   - Haz clic en "Add new site" → "Import an existing project"
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio `lhdecant`

2. **Configurar el build:**
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Variables de entorno en Netlify:**
   ```env
   VITE_API_URL=https://lhdecant-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RZxiqGC1P4caX5QWMGRoh3wvuJaIuq6R1ifXDjfvotOhkJn0y4uE1IkXa4GRV12iaty790
   ```

### 3. Configuración adicional

#### Webhooks de Stripe
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Crea un nuevo webhook
3. **Endpoint URL**: `https://lhdecant-backend.onrender.com/api/stripe/webhook`
4. **Events**: Selecciona todos los eventos de pago

#### Google OAuth2
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Actualiza las URIs de redirección autorizadas:
   - `https://lhdecant-backend.onrender.com/api/auth/google/callback`

## 🛠️ Desarrollo Local

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/lhdecant.git
cd lhdecant

# Instalar dependencias
npm install
cd client && npm install && cd ..

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### Ejecutar en desarrollo
```bash
# Ejecutar servidor y cliente en paralelo
npm run dev

# Solo servidor
npm run server:dev

# Solo cliente
npm run client:dev
```

### Build para producción
```bash
# Build completo
npm run build

# Solo servidor
npm run server:build

# Solo cliente
npm run client:build
```

## 🏗️ Estructura del Proyecto

```
lhdecant/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilidades y configuración
│   ├── netlify.toml       # Configuración de Netlify
│   └── package.json
├── server/                # Backend Node.js + Express
│   ├── routes.ts          # Rutas de la API
│   ├── auth.ts            # Autenticación
│   ├── storage.ts         # Configuración de Firebase
│   └── cloudinary.ts      # Configuración de Cloudinary
├── shared/                # Esquemas compartidos
├── render.yaml            # Configuración de Render
└── package.json
```

## 🔧 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **Radix UI** - Componentes accesibles
- **React Query** - Manejo de estado del servidor
- **Wouter** - Enrutamiento
- **Stripe** - Pagos

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **Firebase Admin** - Base de datos y autenticación
- **Passport.js** - Autenticación OAuth
- **Stripe** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **Cloudinary** - Almacenamiento de imágenes

## 📱 Funcionalidades

- ✅ Autenticación con Google OAuth
- ✅ Catálogo de perfumes con filtros
- ✅ Carrito de compras
- ✅ Procesamiento de pagos con Stripe
- ✅ Panel de administración
- ✅ Gestión de pedidos
- ✅ Sistema de reseñas
- ✅ Favoritos
- ✅ Notificaciones por email
- ✅ Responsive design

## 🔒 Seguridad

- Autenticación JWT
- CORS configurado
- Helmet para headers de seguridad
- Validación de datos con Zod
- Rate limiting
- Sanitización de inputs

## 📊 Monitoreo

- Health check endpoint: `/api/health`
- Logs estructurados
- Métricas de rendimiento
- Error tracking

## 🚀 URLs de Producción

- **Frontend**: https://lhdecant.netlify.app
- **Backend**: https://lhdecant-backend.onrender.com
- **Health Check**: https://lhdecant-backend.onrender.com/api/health

## 📞 Soporte

Para soporte técnico o preguntas sobre el despliegue:
- Email: lhdecant@gmail.com
- Issues: [GitHub Issues](https://github.com/tu-usuario/lhdecant/issues)

---

¡Tu aplicación LH Decants está lista para producción! 🎉 