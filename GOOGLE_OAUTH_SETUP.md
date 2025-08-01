# Configuración de Google OAuth 2.0 para Producción

## 🚀 Configuración para Producción

### 1. Variables de Entorno Requeridas

```env
# PRODUCCIÓN - NO localhost
GOOGLE_CLIENT_ID=tu_google_client_id_real
GOOGLE_CLIENT_SECRET=tu_google_client_secret_real
FRONTEND_URL=https://lhdecant.com
BACKEND_URL=https://lhdecant-backend.onrender.com
```

### 2. Configuración en Google Cloud Console

#### Authorized JavaScript origins:
- `https://lhdecant.com`
- `https://lhdecant-backend.onrender.com`

#### Authorized redirect URIs:
- `https://lhdecant-backend.onrender.com/api/auth/google/callback`

### 3. URLs de Producción

- **Frontend**: https://lhdecant.com
- **Backend**: https://lhdecant-backend.onrender.com
- **Callback URL**: https://lhdecant-backend.onrender.com/api/auth/google/callback

### 4. Testing en Producción

1. Ve a: https://lhdecant.com/auth
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Verifica que la URI de redirección en Google Console coincida exactamente con: `https://lhdecant-backend.onrender.com/api/auth/google/callback`

### 5. Troubleshooting

#### Error: "redirect_uri_mismatch"
- Verifica que la URI de redirección en Google Console sea exactamente: `https://lhdecant-backend.onrender.com/api/auth/google/callback`
- Las credenciales de producción solo funcionan con URLs de producción

#### Error: "invalid_client"
- Verifica que GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET estén configurados correctamente
- Asegúrate de usar las credenciales de producción, no las de desarrollo

### 6. Seguridad

- ✅ Usa HTTPS en todas las URLs
- ✅ Configura CORS correctamente para producción
- ✅ Usa variables de entorno para las credenciales
- ❌ NO uses localhost en producción 