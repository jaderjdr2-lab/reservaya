# SUPABASE PRODUCCIÓN — RESERVAYA

Configura en: https://supabase.com/dashboard/project/ofsvjygoyhmkrorkvzsa/auth/url-configuration

## Site URL

```
https://reservaya-swart.vercel.app
```

## Redirect URLs (añadir todas)

```
https://reservaya-swart.vercel.app/auth/callback
https://reservaya-swart.vercel.app/auth/callback?next=/reset-password
https://reservaya-swart.vercel.app/auth/callback?next=/dashboard
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/reset-password
```

## Forgot password

El flujo usa Supabase `resetPasswordForEmail` → `/auth/callback?next=/reset-password` → `/reset-password`.

## Cuando tengas dominio propio

Reemplaza `reservaya-swart.vercel.app` por `reservaya.co` en todas las URLs anteriores.

## Google OAuth (Gmail)

Ver guía completa: `docs/GOOGLE_OAUTH.md`

Resumen:
1. Crear OAuth Client en Google Cloud Console
2. Redirect URI en Google: `https://ofsvjygoyhmkrorkvzsa.supabase.co/auth/v1/callback`
3. Activar Google en Supabase Auth → Providers
4. Variable `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` en Vercel
