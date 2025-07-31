import 'dotenv/config';

import express from "express";
import { registerRoutes } from "./routes";
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
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

// CORS ULTRA PERMISIVO - SOLUCIÓN DEFINITIVA
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Solo loggear si hay un origen definido para evitar spam
  if (origin) {
    console.log('🌐 CORS Request from origin:', origin);
  }
  
  // SOLUCIÓN AGRESIVA - FORZAR CORS CORRECTO
  if (origin === 'https://lhdecant.com' || origin === 'https://www.lhdecant.com') {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('🎯 CORS SET for lhdecant.com:', origin);
  } else if (origin === 'http://localhost:5173' || origin === 'http://localhost:3000') {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('🎯 CORS SET for localhost:', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
    console.log('🎯 CORS SET for wildcard:', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Solo loggear si hay un origen definido
  if (origin) {
    console.log('✅ CORS headers set for origin:', origin);
    console.log('🔧 Access-Control-Allow-Origin:', res.getHeader('Access-Control-Allow-Origin'));
  }
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware adicional de CORS como respaldo
app.use(cors({
  origin: true, // Permitir todos los orígenes
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'Cache-Control'
  ]
}));

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
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
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
      environment: process.env.NODE_ENV || 'development',
      cors: 'ultra-permissive'
    });
  });

  // Debug endpoint para verificar CORS
  app.get('/api/debug/cors', (req, res) => {
    const origin = req.headers.origin;
    
    res.json({
      origin: origin,
      corsHeaders: {
        'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials')
      },
      environment: process.env.NODE_ENV || 'development',
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
      log(`serving on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log('🔧 CORS ultra-permisivo configurado');
    }
  );
})();
