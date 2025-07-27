# LH Decants - Tienda de Perfumes

Una aplicación web moderna y elegante para la venta de perfumes y decants, construida con React, Node.js y Firebase.

## 🚀 Características

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes
- **Framer Motion** para animaciones
- **TanStack Query** para gestión de estado
- **Wouter** para enrutamiento

### Backend
- **Node.js** con Express
- **Firebase Firestore** como base de datos
- **Passport.js** para autenticación
- **Google OAuth2** integrado
- **Stripe** para pagos
- **Nodemailer** para emails

### Funcionalidades Principales
- ✅ Autenticación completa (local + Google OAuth2)
- ✅ Catálogo de perfumes con filtros
- ✅ Carrito de compras
- ✅ Sistema de favoritos
- ✅ Gestión de pedidos y seguimiento
- ✅ Perfil de usuario completo
- ✅ Configuraciones personalizables
- ✅ Panel de administración
- ✅ Sistema de pagos con Stripe
- ✅ Notificaciones por email

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase
- Cuenta de Google Cloud (para OAuth2)
- Cuenta de Stripe (opcional)

### 1. Clonar el repositorio
```bash
git clone https://github.com/Juanchii-Dev/lhdecant.git
cd lhdecant
```

### 2. Instalar dependencias
```bash
# Instalar dependencias del servidor
npm install

# Instalar dependencias del cliente
cd client
npm install
cd ..
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Firebase
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY=tu-clave-privada
FIREBASE_CLIENT_EMAIL=tu-email-cliente

# Google OAuth2
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Stripe (opcional)
STRIPE_SECRET_KEY=tu-stripe-secret-key
STRIPE_WEBHOOK_SECRET=tu-webhook-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-app
SMTP_FROM=tu-email@gmail.com

# URLs
FRONTEND_URL=http://localhost:5173
RESET_PASSWORD_URL=http://localhost:5173/reset-password
ADMIN_EMAIL=admin@lhdecant.com
```

### 4. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firestore Database
3. Crear cuenta de servicio y descargar credenciales
4. Configurar reglas de seguridad en Firestore

### 5. Configurar Google OAuth2

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto o seleccionar existente
3. Habilitar Google+ API
4. Crear credenciales OAuth2
5. Configurar URIs de redirección

## 🏃‍♂️ Ejecutar el proyecto

### Desarrollo
```bash
# Ejecutar servidor y cliente en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:5000` y el cliente en `http://localhost:5173`.

### Producción
```bash
# Construir cliente
cd client
npm run build
cd ..

# Ejecutar servidor en producción
npm start
```

## 📁 Estructura del Proyecto

```
LhDecant/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── lib/           # Utilidades y configuración
│   │   └── main.tsx       # Punto de entrada
│   ├── package.json
│   └── vite.config.ts
├── server/                # Backend Node.js
│   ├── auth.ts           # Configuración de autenticación
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # Rutas de la API
│   ├── storage.ts        # Capa de acceso a datos
│   └── vite.ts           # Integración con Vite
├── shared/               # Código compartido
├── package.json
└── README.md
```

## 🔧 Configuración de Base de Datos

### Colecciones de Firestore

- **users**: Información de usuarios
- **perfumes**: Catálogo de perfumes
- **collections**: Colecciones de perfumes
- **orders**: Pedidos de usuarios
- **favorites**: Favoritos de usuarios
- **addresses**: Direcciones de envío
- **paymentMethods**: Métodos de pago
- **settings**: Configuraciones del sistema

## 🎨 Personalización

### Temas y Colores
El proyecto usa un sistema de colores personalizable en `tailwind.config.ts`:

```typescript
colors: {
  'luxury-gold': '#D4AF37',
  'charcoal': '#2C2C2C',
  // ... más colores
}
```

### Componentes
Los componentes están basados en Shadcn/ui y pueden ser personalizados en `client/src/components/ui/`.

## 🔒 Seguridad

- Autenticación JWT con Passport.js
- Validación de datos con Zod
- Sanitización de inputs
- CORS configurado
- Variables de entorno protegidas

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Pantallas grandes (1440px+)

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Heroku
```bash
# Crear app en Heroku
heroku create lhdecant-app

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set FIREBASE_PROJECT_ID=tu-proyecto

# Desplegar
git push heroku main
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Juanchii-Dev** - *Desarrollo inicial* - [GitHub](https://github.com/Juanchii-Dev)

## 🙏 Agradecimientos

- [Shadcn/ui](https://ui.shadcn.com/) por los componentes
- [Tailwind CSS](https://tailwindcss.com/) por el framework de CSS
- [Firebase](https://firebase.google.com/) por la infraestructura
- [Vite](https://vitejs.dev/) por el bundler

## 📞 Soporte

Si tienes alguna pregunta o problema:

- 📧 Email: support@lhdecant.com
- 🐛 Issues: [GitHub Issues](https://github.com/Juanchii-Dev/lhdecant/issues)
- 📖 Documentación: [Wiki del proyecto](https://github.com/Juanchii-Dev/lhdecant/wiki)

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub! 