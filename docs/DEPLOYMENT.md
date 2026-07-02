# DEPLOYMENT — RESERVAYA en Vercel + Supabase

## Prerrequisitos

1. **Git** instalado en Windows ([git-scm.com](https://git-scm.com/))
2. Cuenta **GitHub**
3. Cuenta **Vercel**
4. Proyecto **Supabase** existente (`ofsvjygoyhmkrorkvzsa`)

## 1. Instalar Git (si falta)

```powershell
winget install Git.Git
```

Reinicia terminal y verifica: `git --version`

## 2. Crear repositorio GitHub

```powershell
cd C:\Users\PC\Desktop\RESERVAYA
git init
git add .
git commit -m "checkpoint-mvp-local"
```

Crea repo en GitHub y:

```powershell
git remote add origin https://github.com/TU_USUARIO/reservaya.git
git branch -M main
git push -u origin main
```

> **Importante:** `.env` está en `.gitignore`. Nunca subir secretos.

## 3. Conectar Vercel

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository
2. Framework: Next.js (detectado)
3. Build: `prisma generate && next build` (ya en `vercel.json`)

## 4. Variables de entorno en Vercel

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Pooler Supabase puerto 6543 |
| `DIRECT_URL` | Pooler Supabase puerto 5432 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ofsvjygoyhmkrorkvzsa.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (Settings → API) |
| `ADMIN_EMAIL` | Email admin (ej. jaderjdr2@gmail.com) |
| `NEXT_PUBLIC_API_URL` | `https://reservaya.co` o URL Vercel temporal |

## 5. Configurar Supabase Auth

En Supabase → Authentication → URL Configuration:

- **Site URL:** `https://reservaya.co` (o tu dominio Vercel)
- **Redirect URLs:**
  - `https://reservaya.co/auth/callback`
  - `https://*.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

Para recuperación de contraseña, el redirect debe incluir `/auth/callback?next=/reset-password`.

## 6. Dominio

### Opción A — Vercel subdomain
Usar `tu-proyecto.vercel.app` y setear `NEXT_PUBLIC_API_URL`.

### Opción B — Dominio propio
1. Comprar `reservaya.co`
2. Vercel → Domains → Add `reservaya.co` y `*.reservaya.co`
3. DNS según instrucciones Vercel
4. Actualizar `lib/constants.ts` `MAIN_DOMAINS` / `isMainHostname` para incluir `reservaya.co`

## 7. Base de datos

Schema ya aplicado vía `prisma db push`. En CI/CD futuro considerar migraciones formales.

```powershell
npx prisma db push
npx prisma generate
```

## 8. Probar producción

1. Registro + login
2. Onboarding
3. Página pública `/subdomain`
4. Reserva sin login
5. Admin con `ADMIN_EMAIL`

## Troubleshooting

- **Login no persiste:** revisar cookies y Site URL en Supabase
- **Subdominios:** wildcard DNS + middleware rewrite
- **Prisma en build:** `vercel.json` incluye `prisma generate`
