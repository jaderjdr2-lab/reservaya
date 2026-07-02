# Google OAuth — RESERVAYA

Login y registro con Gmail usan **Supabase Auth + Google Cloud**.

## 1. Google Cloud Console

1. Abre https://console.cloud.google.com/apis/credentials
2. Crea un proyecto (o usa uno existente)
3. **OAuth consent screen** → External → completa nombre y email de soporte
4. **Credentials → Create credentials → OAuth client ID**
   - Tipo: **Web application**
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://reservaya-swart.vercel.app
     https://reservaya.co
     ```
   - **Authorized redirect URIs** (obligatorio — va a Supabase, no a tu app):
     ```
     https://ofsvjygoyhmkrorkvzsa.supabase.co/auth/v1/callback
     ```
5. Copia **Client ID** y **Client Secret**

## 2. Supabase Dashboard

1. https://supabase.com/dashboard/project/ofsvjygoyhmkrorkvzsa/auth/providers
2. **Google** → Enable
3. Pega Client ID y Client Secret
4. Guarda

## 3. URLs de redirect (Supabase Auth)

En **Authentication → URL Configuration**, asegúrate de tener:

```
https://reservaya-swart.vercel.app/auth/callback
https://reservaya-swart.vercel.app/auth/callback?next=/onboarding
https://reservaya-swart.vercel.app/auth/callback?next=/dashboard
https://reservaya-swart.vercel.app/auth/callback?next=/reset-password
http://localhost:3000/auth/callback
```

## 4. Variables de entorno

```env
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

En **Vercel** → Project → Settings → Environment Variables → añade la misma variable y redeploy.

Para ocultar el botón sin quitar la config de Supabase:

```env
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=false
```

## 5. Flujo en la app

| Pantalla | Botón | Destino tras Google |
|----------|-------|---------------------|
| `/login` | Continuar con Google | `/dashboard` o `/onboarding` si es usuario nuevo |
| `/register` | Registrarse con Google | `/onboarding` (crear negocio) |

El callback `/auth/callback` crea el perfil en BD y redirige a onboarding si el usuario aún no tiene negocio.

## 6. Probar

1. Abre `/login` o `/register`
2. Clic en **Continuar con Google** / **Registrarse con Google**
3. Elige cuenta Gmail
4. Usuario nuevo → `/onboarding`
5. Usuario con negocio → `/dashboard`

## 7. Activación automática (script)

Si ya tienes credenciales de Google Cloud y un token de Supabase:

```bash
# .env
SUPABASE_ACCESS_TOKEN=sbp_...          # supabase.com/dashboard/account/tokens
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

npm run setup:google
```

Esto activa Google en Supabase vía Management API sin entrar al dashboard.

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `redirect_uri_mismatch` | URI incorrecta en Google Cloud | Usar exactamente `...supabase.co/auth/v1/callback` |
| Botón no aparece | Variable en false | `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` + redeploy |
| Vuelve a login con `?error=oauth` | Google desactivado en Supabase | Activar provider en Supabase |
| `?error=callback` | Redirect URL no permitida en Supabase | Añadir `/auth/callback` en URL Configuration |
