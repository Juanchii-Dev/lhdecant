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

// CONFIGURACIÓN CORS DEFINITIVA
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lhdecant.netlify.app',
  'https://www.lhdecant.netlify.app',
  'https://lhdecant.com',
  'https://www.lhdecant.com',
  'https://lhdecant-frontend.netlify.app',
  'https://lhdecant-backend.onrender.com'
];
    
    console.log('🌐 CORS Request from origin:', origin);
    
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) {
      console.log('✅ CORS allowed: No origin (mobile app, Postman, etc.)');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for origin:', origin);
      return callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      // EN PRODUCCIÓN, PERMITIR TODOS LOS ORÍGENES COMO SOLUCIÓN TEMPORAL
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 Production mode: Allowing all origins temporarily');
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  },
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
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// Middleware adicional para CORS como respaldo
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🔍 Additional CORS check for origin:', origin);
  
  // Si el middleware de CORS no se aplicó, aplicar headers manualmente
  if (!res.getHeader('Access-Control-Allow-Origin')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
  }
  
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
      cors: 'enabled'
    });
  });

  // Debug endpoint para verificar CORS
  app.get('/api/debug/cors', (req, res) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lhdecant.netlify.app',
  'https://www.lhdecant.netlify.app',
  'https://lhdecant.com',
  'https://www.lhdecant.com',
  'https://lhdecant-frontend.netlify.app',
  'https://lhdecant-backend.onrender.com'
];
    
    res.json({
      origin: origin,
      allowedOrigins: allowedOrigins,
      isAllowed: origin ? allowedOrigins.includes(origin) : true,
      headers: req.headers,
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
      log('🔧 CORS configuration loaded');
    }
  );
})();
