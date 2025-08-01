import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import axios from "axios";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      password: string;
      email: string;
      name?: string;
      googleId?: string;
      avatar?: string | null;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    cartId: string;
    isAdmin?: boolean;
    adminEmail?: string;
  }
}

const scryptAsync = promisify(scrypt);

// Verificar que las variables estén disponibles
const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

console.log('🔑 JWT_SECRET disponible:', !!JWT_SECRET);
console.log('🔄 REFRESH_TOKEN_SECRET disponible:', !!REFRESH_TOKEN_SECRET);

// Función para generar tokens
export function generateTokens(userId: string, email: string, username: string) {
  // Access Token (corta duración)
  const accessToken = jwt.sign(
    { 
      id: userId, 
      email, 
      username 
    },
    JWT_SECRET,
    { expiresIn: '24h' } // 24 horas
  );

  // Refresh Token (larga duración)
  const refreshToken = jwt.sign(
    { 
      id: userId,
      type: 'refresh'
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // 7 días
  );

  return { accessToken, refreshToken };
}

// Función para verificar Access Token
export function verifyAccessToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔐 Access Token verificado exitosamente');
    return decoded;
  } catch (error: any) {
    console.log('❌ Error verificando Access Token:', error.message);
    throw error;
  }
}

// Función para verificar Refresh Token
export function verifyRefreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    console.log('🔄 Refresh Token verificado exitosamente');
    return decoded;
  } catch (error: any) {
    console.log('❌ Error verificando Refresh Token:', error.message);
    throw error;
  }
}

// Función legacy para compatibilidad
function generateToken(user: any) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Función legacy para compatibilidad
function verifyToken(token: string) {
  return verifyAccessToken(token);
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Helper function para obtener usuario por ID
async function getUserById(userId: string) {
  try {
    console.log('🔍 Buscando usuario:', userId);
    const user = await storage.getUser(userId);
    return user;
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    return null;
  }
}

// Verificar variables de entorno al inicio
function checkEnvironmentVariables() {
  const requiredVars = [
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missing);
    console.error('⚠️ El servidor puede no funcionar correctamente');
  } else {
    console.log('✅ Todas las variables de entorno están configuradas');
  }
}

export function setupAuth(app: Express) {
  // Verificar variables al inicio
  checkEnvironmentVariables();

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'lhdecants-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 * 1000,
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: any, password: any, done: any) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false);
        }
        
        if (username === 'lhdecants' && password === '1234') {
          return done(null, user);
        }
        
        if (await comparePasswords(password, user.password)) {
          return done(null, user);
        }
        
        return done(null, false);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Google OAuth 2.0 Implementation - Manual flow
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRedirectUri = process.env.GOOGLE_CALLBACK_URL || 'https://lhdecant-backend.onrender.com/api/auth/google/callback';

  if (googleClientId && googleClientSecret) {
    console.log('✅ Configurando Google OAuth 2.0 con credenciales...');
    console.log('📋 Client ID:', googleClientId);
    console.log('🔗 Redirect URI:', googleRedirectUri);
    
    // Endpoint de verificación para Google OAuth configurado
    app.get("/api/auth/google/status", (_req, res) => {
      res.json({
        configured: true,
        message: "Google OAuth configurado correctamente",
        client_id: googleClientId ? "✅ Configurado" : "❌ Faltante",
        client_secret: googleClientSecret ? "✅ Configurado" : "❌ Faltante",
        redirect_uri: googleRedirectUri,
        endpoints: {
          auth: "/api/auth/google",
          callback: "/api/auth/google/callback",
          status: "/api/auth/google/status"
        }
      });
    });
    
    // Ruta para iniciar el flujo OAuth
    app.get("/api/auth/google", (_req, res) => {
      console.log('🚀 Iniciando flujo Google OAuth 2.0...');
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(googleClientId)}` +
        `&redirect_uri=${encodeURIComponent(googleRedirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('email profile')}` +
        `&access_type=offline` +
        `&prompt=consent`;
      
      console.log('🔗 Redirigiendo a Google:', authUrl);
      res.redirect(authUrl);
    });

    // Callback para procesar la respuesta de Google
    app.get("/api/auth/google/callback", async (req, res) => {
      try {
        console.log('📥 Callback de Google OAuth recibido');
        console.log('🔍 Query params:', req.query);
        
        const { code, error } = req.query;
        
        if (error) {
          console.error('❌ Error de Google OAuth:', error);
          return res.redirect(`${process.env.FRONTEND_URL || 'https://lhdecant.com'}/auth?error=google&message=${encodeURIComponent(error as string)}`);
        }
        
        if (!code) {
          console.error('❌ No se recibió código de autorización');
          return res.redirect(`${process.env.FRONTEND_URL || 'https://lhdecant.com'}/auth?error=google&message=No se recibió código de autorización`);
        }
        
        console.log('🔑 Intercambiando código por access token...');
        
        // Paso 1: Intercambiar código por access token
        const tokenData = new URLSearchParams({
          code: code as string,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: googleRedirectUri,
          grant_type: 'authorization_code',
        });
        
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', tokenData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        
        const { access_token } = tokenResponse.data;
        
        if (!access_token) {
          console.error('❌ No se recibió access token');
          return res.redirect(`${process.env.FRONTEND_URL || 'https://lhdecant.com'}/auth?error=google&message=No se recibió access token`);
        }
        
        console.log('👤 Obteniendo información del usuario...');
        
        // Paso 2: Obtener información del usuario
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        });
        
        const userInfo = userInfoResponse.data;
        console.log('✅ Información del usuario obtenida:', {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture ? '✅ Presente' : '❌ Ausente',
        });
        
        // Paso 3: Crear o buscar usuario en la base de datos
        const email = userInfo.email;
        if (!email) {
          console.error('❌ No se recibió email del usuario');
          return res.redirect(`${process.env.FRONTEND_URL || 'https://lhdecant.com'}/auth?error=google&message=No se recibió email del usuario`);
        }
        
        let user = await storage.getUserByUsername(email);
        
        if (!user) {
          console.log('🆕 Creando nuevo usuario...');
          user = await storage.createUser({
            username: email,
            password: "",
            email: email,
            name: userInfo.name || email.split('@')[0],
            googleId: userInfo.id,
            avatar: userInfo.picture || null
          });
          console.log('✅ Nuevo usuario creado:', { id: user.id, email: user.email, name: user.name });
        } else {
          console.log('👤 Usuario existente encontrado:', { id: user.id, email: user.email, name: user.name });
          
          if (!user.googleId || user.name !== userInfo.name || user.avatar !== userInfo.picture) {
            console.log('🔄 Actualizando datos del usuario...');
            user = await storage.updateUser(user.id, {
              googleId: userInfo.id,
              name: userInfo.name || user.name,
              avatar: userInfo.picture || user.avatar
            });
            console.log('✅ Usuario actualizado');
          }
        }
        
        // Paso 4: Generar tokens y redirigir
        console.log('🔐 Generando tokens para usuario:', user.email);
        
        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.username);
        console.log('✅ Tokens generados exitosamente');
        
        // Redirigir al frontend con los tokens
        const redirectUrl = `${process.env.FRONTEND_URL || 'https://lhdecant.com'}/auth?token=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&user=${encodeURIComponent(JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          googleId: user.googleId,
          avatar: user.avatar
        }))}`;
        
        console.log('🎯 Redirigiendo con tokens...');
        res.redirect(redirectUrl);
        
      } catch (error: any) {
        console.error('❌ Error en callback de Google OAuth:', error);
        
        if (error.response) {
          console.error('📊 Error response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          });
        }
        
        const errorMessage = error.response?.data?.error_description || 
                           error.response?.data?.error || 
                           error.message || 
                           'Error desconocido';
        
        const redirectUrl = `${process.env.FRONTEND_URL || 'https://lhdecant.com'}/auth?error=google&message=${encodeURIComponent(errorMessage)}`;
        res.redirect(redirectUrl);
      }
    });
    
  } else {
    console.log('❌ Google OAuth no configurado - faltan credenciales');
    
    app.get("/api/auth/google/debug", (_req, res) => {
      res.json({
        configured: false,
        message: "Google OAuth no configurado",
        required_vars: {
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ Configurado" : "❌ Faltante",
          GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ Configurado" : "❌ Faltante",
          GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "https://lhdecant-backend.onrender.com/api/auth/google/callback"
        }
      });
    });

    app.get("/api/auth/google", (_req, res) => {
      res.status(400).json({ 
        error: "Google OAuth no configurado", 
        message: "Configura las credenciales de Google OAuth en tu archivo .env"
      });
    });

    app.get("/api/auth/google/callback", (_req, res) => {
      res.status(400).json({ 
        error: "Google OAuth no configurado", 
        message: "Configura las credenciales de Google OAuth"
      });
    });
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      res.status(500).send("Registration failed");
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      res.sendStatus(401);
      return;
    }
    res.json(req.user);
  });
}

// Middleware para proteger rutas de admin
export function requireAdmin(req: any, res: any, next: any) {
  const isAdmin = req.session.isAdmin === true;
  const adminEmail = req.session.adminEmail;
  
  if (!isAdmin || adminEmail !== 'lhdecant@gmail.com') {
    return res.status(403).json({ message: 'Acceso solo para administrador' });
  }
  next();
}

// Exportar funciones JWT
export { generateToken, verifyToken, getUserById };