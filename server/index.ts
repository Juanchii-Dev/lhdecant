import 'dotenv/config';

import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import helmet from 'helmet';
import compression from 'compression';
// import { setupVite, serveStatic, log } from "./vite";

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

// Configuración de CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://lhdecant.netlify.app',
    'https://www.lhdecant.netlify.app'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
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
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
    }
  );
})();
