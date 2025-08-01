# VARIABLES FALTANTES EN RENDER

## ❌ VARIABLE FALTANTE CRÍTICA:

### JWT_SECRET
**Valor:** `lhdecant-jwt-secret-2024-production-secure`
**Descripción:** Clave secreta para firmar y verificar JWT tokens
**Ubicación:** Environment Variables en Render Dashboard

---

## 📋 CÓMO AGREGAR EN RENDER:

1. Ve a tu dashboard de Render
2. Selecciona tu servicio `lhdecant-backend`
3. Ve a "Environment" tab
4. Haz clic en "Add Environment Variable"
5. Agrega:
   - **Key:** `JWT_SECRET`
   - **Value:** `lhdecant-jwt-secret-2024-production-secure`
6. Guarda y redeploy

---

## 🔍 VERIFICACIÓN:

Después de agregar la variable, ejecuta:
```bash
node verificacion-jwt.js
```

Esto verificará que el JWT funcione correctamente.

---

## 📝 NOTA:

Esta variable es **CRÍTICA** para la autenticación. Sin ella, todos los JWT serán inválidos y obtendrás errores 401. 