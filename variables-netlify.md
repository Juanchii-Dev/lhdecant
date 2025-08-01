# VARIABLES DE ENTORNO PARA NETLIFY (FRONTEND)

## 🌐 VARIABLES NECESARIAS PARA NETLIFY:

### 1️⃣ VITE_API_URL (CRÍTICA)
**Valor:** `https://lhdecant-backend.onrender.com`
**Descripción:** URL del backend para todas las peticiones API
**Ubicación:** Environment Variables en Netlify Dashboard

### 2️⃣ VITE_STRIPE_PUBLISHABLE_KEY
**Valor:** `pk_live_51RZxiqGC1P4caX5Q1fR8JiItLb112fwF9yjPTWHbBYCZEdBth6ywexPvwUZlCQApc0goLv9NM0rALKg5uxwQz5eq00SLwE8jpz`
**Descripción:** Clave pública de Stripe para pagos
**Ubicación:** Environment Variables en Netlify Dashboard

### 3️⃣ VITE_GOOGLE_CLIENT_ID
**Valor:** `146579938759-92haah9cmejdukbps1krv2vdfd3pla5m.apps.googleusercontent.com`
**Descripción:** Client ID de Google OAuth para autenticación
**Ubicación:** Environment Variables en Netlify Dashboard

---

## 📋 CÓMO CONFIGURAR EN NETLIFY:

### Paso 1: Acceder al Dashboard
1. Ve a [netlify.com](https://netlify.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu sitio `lhdecant`

### Paso 2: Configurar Variables de Entorno
1. Ve a **Site settings**
2. Haz clic en **Environment variables**
3. Haz clic en **Add a variable**

### Paso 3: Agregar Variables
Agrega estas variables una por una:

#### Variable 1:
- **Key:** `VITE_API_URL`
- **Value:** `https://lhdecant-backend.onrender.com`
- **Scopes:** Production, Deploy Preview, Branch Deploy

#### Variable 2:
- **Key:** `VITE_STRIPE_PUBLISHABLE_KEY`
- **Value:** `pk_live_51RZxiqGC1P4caX5Q1fR8JiItLb112fwF9yjPTWHbBYCZEdBth6ywexPvwUZlCQApc0goLv9NM0rALKg5uxwQz5eq00SLwE8jpz`
- **Scopes:** Production, Deploy Preview, Branch Deploy

#### Variable 3:
- **Key:** `VITE_GOOGLE_CLIENT_ID`
- **Value:** `146579938759-92haah9cmejdukbps1krv2vdfd3pla5m.apps.googleusercontent.com`
- **Scopes:** Production, Deploy Preview, Branch Deploy

### Paso 4: Guardar y Deploy
1. Haz clic en **Save**
2. Ve a **Deploys**
3. Haz clic en **Trigger deploy** → **Deploy site**

---

## 🔍 VERIFICACIÓN:

### 1. Verificar Variables en el Frontend
Abre la consola del navegador en https://lhdecant.com y ejecuta:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

### 2. Verificar Funcionalidad
- ✅ Login con Google funciona
- ✅ Peticiones API funcionan
- ✅ Pagos con Stripe funcionan
- ✅ No hay errores en consola

---

## 📝 NOTAS IMPORTANTES:

### Prefijo VITE_
- Todas las variables de entorno en Vite deben empezar con `VITE_`
- Solo las variables con este prefijo estarán disponibles en el frontend

### Seguridad
- Las variables de entorno del frontend son **públicas**
- No incluyas claves secretas (como `STRIPE_SECRET_KEY`)
- Solo incluye claves públicas necesarias para el frontend

### Redeploy
- Después de cambiar variables de entorno, Netlify hará redeploy automáticamente
- Puede tomar 1-2 minutos para que los cambios se reflejen

---

## 🚨 PROBLEMAS COMUNES:

### Error: "Cannot read property of undefined"
- **Causa:** Variable de entorno no configurada
- **Solución:** Verificar que la variable esté agregada en Netlify

### Error: "API URL not found"
- **Causa:** `VITE_API_URL` no configurada
- **Solución:** Agregar la variable con el valor correcto

### Error: "Stripe not configured"
- **Causa:** `VITE_STRIPE_PUBLISHABLE_KEY` no configurada
- **Solución:** Agregar la clave pública de Stripe

---

## ✅ LISTA DE VERIFICACIÓN:

- [ ] `VITE_API_URL` configurada
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` configurada  
- [ ] `VITE_GOOGLE_CLIENT_ID` configurada
- [ ] Redeploy completado
- [ ] Variables verificadas en consola
- [ ] Funcionalidad probada 