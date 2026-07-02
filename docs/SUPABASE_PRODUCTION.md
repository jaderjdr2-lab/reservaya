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
