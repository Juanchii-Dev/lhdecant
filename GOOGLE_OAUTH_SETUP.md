# Configuración de Google OAuth para LH Decants

## Pasos para configurar Google OAuth real:

### 1. Ir a Google Cloud Console
- Ve a: https://console.cloud.google.com
- Inicia sesión con tu cuenta de Google

### 2. Crear o seleccionar un proyecto
- Si no tienes un proyecto, crea uno nuevo
- Dale un nombre como "LH Decants OAuth"

### 3. Habilitar APIs necesarias
- Ve a "APIs y servicios" > "Biblioteca"
- Busca y habilita:
  - Google+ API
  - Google Identity API

### 4. Crear credenciales OAuth 2.0
- Ve a "APIs y servicios" > "Credenciales"
- Haz clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
- Selecciona "Aplicación web"

### 5. Configurar la aplicación OAuth
- **Nombre:** LH Decants
- **Orígenes autorizados de JavaScript:**
  ```
  http://localhost:5173
  ```
- **URIs de redirección autorizados:**
  ```
  http://localhost:5000/api/auth/google/callback
  ```

### 6. Obtener las credenciales
- Después de crear, copia:
  - **ID de cliente** (Client ID)
  - **Secreto del cliente** (Client Secret)

### 7. Configurar el archivo .env
Agrega estas líneas a tu archivo `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

### 8. Reiniciar el servidor
```bash
npm run dev
```

### 9. Probar la autenticación
- Ve a: http://localhost:5173/auth
- Haz clic en "Continuar con Google"
- Deberías poder usar tu cuenta real de Google

## Solución de problemas:

### Error "redirect_uri_mismatch"
- Verifica que la URI de redirección en Google Console coincida exactamente con: `http://localhost:5000/api/auth/google/callback`

### Error "unauthorized_client"
- Verifica que el Client ID y Client Secret estén correctos en tu archivo .env

### Error 500 en el callback
- Verifica que las APIs estén habilitadas en Google Console
- Revisa los logs del servidor para más detalles

## Notas importantes:
- Las credenciales de desarrollo solo funcionan en localhost
- Para producción, necesitarás configurar dominios adicionales
- Nunca compartas tu Client Secret públicamente 