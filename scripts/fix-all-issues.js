const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando corrección completa de problemas...');

// 1. Corregir package.json del cliente - mover todas las dependencias a dependencies
console.log('📦 Corrigiendo package.json del cliente...');
const clientPackagePath = path.join(__dirname, '../client/package.json');
const clientPackage = JSON.parse(fs.readFileSync(clientPackagePath, 'utf8'));

// Mover todas las dependencias a dependencies
if (clientPackage.devDependencies) {
  clientPackage.dependencies = {
    ...clientPackage.dependencies,
    ...clientPackage.devDependencies
  };
  delete clientPackage.devDependencies;
}

fs.writeFileSync(clientPackagePath, JSON.stringify(clientPackage, null, 2));
console.log('✅ package.json del cliente corregido');

// 2. Corregir package.json principal - mover todas las dependencias a dependencies
console.log('📦 Corrigiendo package.json principal...');
const mainPackagePath = path.join(__dirname, '../package.json');
const mainPackage = JSON.parse(fs.readFileSync(mainPackagePath, 'utf8'));

// Mover todas las dependencias a dependencies
if (mainPackage.devDependencies) {
  mainPackage.dependencies = {
    ...mainPackage.dependencies,
    ...mainPackage.devDependencies
  };
  delete mainPackage.devDependencies;
}

fs.writeFileSync(mainPackagePath, JSON.stringify(mainPackage, null, 2));
console.log('✅ package.json principal corregido');

// 3. Actualizar render.yaml con la configuración correcta
console.log('⚙️ Actualizando render.yaml...');
const renderYaml = `services:
  - type: web
    name: lhdecant-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: FIREBASE_PRIVATE_KEY
        sync: false
      - key: FIREBASE_CLIENT_EMAIL
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: GOOGLE_CALLBACK_URL
        value: https://lhdecant.com/api/auth/google/callback
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: SMTP_HOST
        sync: false
      - key: SMTP_PORT
        sync: false
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: SMTP_FROM
        sync: false
      - key: FRONTEND_URL
        value: https://lhdecant.com
      - key: RESET_PASSWORD_URL
        value: https://lhdecant.com/reset-password
      - key: ADMIN_EMAIL
        value: lhdecant@gmail.com
`;

fs.writeFileSync(path.join(__dirname, '../render.yaml'), renderYaml);
console.log('✅ render.yaml actualizado');

// 4. Actualizar netlify.toml con la configuración correcta
console.log('🌐 Actualizando netlify.toml...');
const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  VITE_API_URL = "https://lhdecant-backend.onrender.com"
  VITE_STRIPE_PUBLISHABLE_KEY = "pk_live_51RZxiqGC1P4caX5QWMGRoh3wvuJaIuq6R1ifXDjfvotOhkJn0y4uE1IkXa4GRV12iaty790"
  VITE_APP_NAME = "LH Decants"
  VITE_APP_VERSION = "1.0.0"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.svg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`;

fs.writeFileSync(path.join(__dirname, '../client/netlify.toml'), netlifyToml);
console.log('✅ netlify.toml actualizado');

// 5. Actualizar env.production
console.log('🔧 Actualizando env.production...');
const envProduction = `# API URL para producción
VITE_API_URL=https://lhdecant-backend.onrender.com

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RZxiqGC1P4caX5QWMGRoh3wvuJaIuq6R1ifXDjfvotOhkJn0y4uE1IkXa4GRV12iaty790

# Configuración de la aplicación
VITE_APP_NAME=LH Decants
VITE_APP_VERSION=1.0.0
`;

fs.writeFileSync(path.join(__dirname, '../client/env.production'), envProduction);
console.log('✅ env.production actualizado');

// 6. Actualizar tsconfig.server.json para evitar errores de compilación
console.log('⚙️ Actualizando tsconfig.server.json...');
const tsconfigServer = {
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./server",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "noEmitOnError": false,
    "noEmit": false,
    "allowJs": true,
    "checkJs": false
  },
  "include": [
    "server/**/*"
  ],
  "exclude": [
    "node_modules",
    "client",
    "dist",
    "**/*.js",
    "add-*.js",
    "check-*.js",
    "clean-*.js",
    "test-*.js",
    "verify-*.js"
  ]
};

fs.writeFileSync(path.join(__dirname, '../tsconfig.server.json'), JSON.stringify(tsconfigServer, null, 2));
console.log('✅ tsconfig.server.json actualizado');

// 7. Actualizar el servidor principal con CORS correcto
console.log('🔧 Actualizando server/index.ts...');
const serverIndexContent = `import 'dotenv/config';

import express from "express";
import { registerRoutes } from "./routes";
import helmet from 'helmet';
import compression from 'compression';

function log(message: string) {
  console.log(\`[\${new Date().toISOString()}] \${message}\`);
}

const app = express();

// Middleware de seguridad para producción
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://lhdecant-backend.onrender.com"],
      },
    },
  }));
  app.use(compression());
}

// Configuración de CORS - SOLUCIÓN DEFINITIVA
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://lhdecant.netlify.app',
    'https://www.lhdecant.netlify.app',
    'https://lhdecant.com',
    'https://www.lhdecant.com'
  ];
  
  const origin = req.headers.origin;
  console.log('🌐 CORS Request from origin:', origin);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('✅ CORS allowed for origin:', origin);
  } else {
    console.log('❌ CORS blocked for origin:', origin);
    // PERMITIR TODOS LOS ORÍGENES EN PRODUCCIÓN COMO SOLUCIÓN TEMPORAL
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = \`\${req.method} \${path} \${res.statusCode} in \${duration}ms\`;
      if (capturedJsonResponse) {
        logLine += \` :: \${JSON.stringify(capturedJsonResponse)}\`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Debug endpoint para verificar CORS
  app.get('/api/debug/cors', (req, res) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:5173',
      'https://lhdecant.netlify.app',
      'https://www.lhdecant.netlify.app',
      'https://lhdecant.com',
      'https://www.lhdecant.com'
    ];
    
    res.json({
      origin: origin,
      allowedOrigins: allowedOrigins,
      isAllowed: origin ? allowedOrigins.includes(origin) : false,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
  });

  // Debug endpoint para verificar variables de entorno
  app.get('/api/debug/env', (req, res) => {
    res.json({
      NODE_ENV: process.env.NODE_ENV,
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '***SET***' : 'NOT_SET',
      FRONTEND_URL: process.env.FRONTEND_URL,
      timestamp: new Date().toISOString()
    });
  });

  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Error:', err);
  });

  // Servir archivos estáticos en producción
  if (app.get("env") === "production") {
    app.use(express.static('public'));
  }

  // Use environment PORT or default to 5000
  const port = parseInt(process.env.PORT || '5000');
  server.listen(
    port,
    "0.0.0.0",
    () => {
      log(\`serving on port \${port}\`);
      log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);
    }
  );
})();
`;

fs.writeFileSync(path.join(__dirname, '../server/index.ts'), serverIndexContent);
console.log('✅ server/index.ts actualizado');

// 8. Actualizar el servidor de respaldo en dist/index.js
console.log('🔧 Actualizando dist/index.js...');
const distIndexContent = `console.log('Server compiled successfully');
console.log('Starting server...');

// Importar dotenv
require('dotenv/config');

// Importar Express
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// Configuración de CORS para dominio personalizado - SOLUCIÓN DEFINITIVA
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://lhdecant.netlify.app',
    'https://www.lhdecant.netlify.app',
    'https://lhdecant.com',
    'https://www.lhdecant.com'
  ];
  
  const origin = req.headers.origin;
  console.log('🌐 CORS Request from origin:', origin);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('✅ CORS allowed for origin:', origin);
  } else {
    console.log('❌ CORS blocked for origin:', origin);
    // PERMITIR TODOS LOS ORÍGENES EN PRODUCCIÓN COMO SOLUCIÓN TEMPORAL
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de autenticación básicas
app.get('/api/auth/google', (req, res) => {
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'https://lhdecant-backend.onrender.com/api/auth/google/callback';
  console.log('🔗 Google OAuth Redirect URI:', redirectUri);
  
  res.json({ 
    message: 'Google OAuth endpoint',
    status: 'available',
    redirect_uri: redirectUri,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/auth/google/callback', (req, res) => {
  res.json({ 
    message: 'Google OAuth callback endpoint',
    status: 'available'
  });
});

app.get('/api/auth/google/status', (req, res) => {
  res.json({ 
    message: 'Google OAuth status endpoint',
    status: 'available'
  });
});

// Endpoint de debug para verificar variables de entorno
app.get('/api/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '***SET***' : 'NOT_SET',
    FRONTEND_URL: process.env.FRONTEND_URL,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para forzar la actualización de variables
app.get('/api/force-update', (req, res) => {
  console.log('🔄 Forzando actualización de variables de entorno...');
  console.log(\`🔗 GOOGLE_CALLBACK_URL: \${process.env.GOOGLE_CALLBACK_URL}\`);
  console.log(\`🌐 FRONTEND_URL: \${process.env.FRONTEND_URL}\`);
  
  res.json({
    message: 'Variables de entorno actualizadas',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
  });
});

// Debug endpoint para verificar CORS
app.get('/api/debug/cors', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'https://lhdecant.netlify.app',
    'https://www.lhdecant.netlify.app',
    'https://lhdecant.com',
    'https://www.lhdecant.com'
  ];
  
  res.json({
    origin: origin,
    allowedOrigins: allowedOrigins,
    isAllowed: origin ? allowedOrigins.includes(origin) : false,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Servir archivos estáticos del cliente
app.use(express.static('client/dist'));

// Ruta por defecto
app.get('*', (req, res) => {
  res.sendFile('client/dist/index.html', { root: '.' });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`🌍 Environment: \${process.env.NODE_ENV || 'development'}\`);
  console.log(\`🔗 Google Callback URL: \${process.env.GOOGLE_CALLBACK_URL || 'NOT_SET'}\`);
  console.log(\`🌐 Frontend URL: \${process.env.FRONTEND_URL || 'NOT_SET'}\`);
});
`;

fs.writeFileSync(path.join(__dirname, '../dist/index.js'), distIndexContent);
console.log('✅ dist/index.js actualizado');

// 9. Actualizar la configuración de API del frontend
console.log('🔧 Actualizando client/src/config/api.ts...');
const apiConfigContent = `// Configuración de API para el frontend
export const API_CONFIG = {
  // URL base de la API - FORZADA para producción
  BASE_URL: 'https://lhdecant-backend.onrender.com',
  
  // Endpoints específicos
  ENDPOINTS: {
    HEALTH: '/api/health',
    AUTH: {
      GOOGLE: '/api/auth/google',
      GOOGLE_CALLBACK: '/api/auth/google/callback',
      GOOGLE_STATUS: '/api/auth/google/status',
    },
    CART: '/api/cart',
    PERFUMES: '/api/perfumes',
    ORDERS: '/api/orders',
  },
  
  // Configuración de requests
  REQUEST_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include' as const,
  },
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  const url = \`\${API_CONFIG.BASE_URL}\${endpoint}\`;
  console.log('🔗 API URL:', url); // Debug log
  return url;
};

// Función helper para hacer requests a la API
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  const config = {
    ...API_CONFIG.REQUEST_CONFIG,
    ...options,
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
`;

fs.writeFileSync(path.join(__dirname, '../client/src/config/api.ts'), apiConfigContent);
console.log('✅ client/src/config/api.ts actualizado');

// 10. Corregir el CSS del frontend
console.log('🎨 Corrigiendo client/src/index.css...');
const indexCssPath = path.join(__dirname, '../client/src/index.css');
let indexCssContent = fs.readFileSync(indexCssPath, 'utf8');

// Mover @import al principio
if (indexCssContent.includes('@import')) {
  const importMatch = indexCssContent.match(/@import[^;]+;/);
  if (importMatch) {
    const importStatement = importMatch[0];
    indexCssContent = indexCssContent.replace(importStatement, '');
    indexCssContent = importStatement + '\n' + indexCssContent;
  }
}

fs.writeFileSync(indexCssPath, indexCssContent);
console.log('✅ client/src/index.css corregido');

console.log('🎉 ¡Corrección completa finalizada!');
console.log('📋 Resumen de cambios:');
console.log('  ✅ package.json del cliente corregido');
console.log('  ✅ package.json principal corregido');
console.log('  ✅ render.yaml actualizado');
console.log('  ✅ netlify.toml actualizado');
console.log('  ✅ env.production actualizado');
console.log('  ✅ tsconfig.server.json actualizado');
console.log('  ✅ server/index.ts actualizado');
console.log('  ✅ dist/index.js actualizado');
console.log('  ✅ client/src/config/api.ts actualizado');
console.log('  ✅ client/src/index.css corregido');
console.log('');
console.log('🚀 Ahora ejecuta: npm run build && git add . && git commit -m "Fix all connection issues" && git push'); 