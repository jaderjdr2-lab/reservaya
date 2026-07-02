# FASE 2 — Deploy producción RESERVAYA

**Estado:** Git instalado ✅ | GitHub push pendiente (requiere tu cuenta) | Vercel pendiente | Dominio pendiente | Wompi pendiente credenciales

---

## Paso 1 — Git local (hecho o en curso)

```powershell
cd C:\Users\PC\Desktop\RESERVAYA
git init
git add .
git commit -m "checkpoint-mvp-auditoria-fase1"
```

## Paso 2 — Crear repo en GitHub

1. Entra a [github.com/new](https://github.com/new)
2. Nombre: `reservaya`
3. **Privado** recomendado
4. No inicialices con README (ya tenemos código)

```powershell
git remote add origin https://github.com/TU_USUARIO/reservaya.git
git branch -M main
git push -u origin main
```

> GitHub pedirá login. Usa **Personal Access Token** si no tienes Git Credential Manager.

## Paso 3 — Vercel

1. [vercel.com/new](https://vercel.com/new) → Import `reservaya`
2. Framework: Next.js
3. **Environment Variables** (copia desde tu `.env` local, sin commitear):

| Variable | Notas |
|----------|-------|
| `DATABASE_URL` | Pooler :6543 |
| `DIRECT_URL` | :5432 |
| `NEXT_PUBLIC_SUPABASE_URL` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | |
| `ADMIN_EMAIL` | |
| `NEXT_PUBLIC_API_URL` | `https://reservaya.co` (o `.vercel.app` temporal) |

4. Deploy → espera build verde

## Paso 4 — Dominio reservaya.co

### En Vercel (Settings → Domains)

- `reservaya.co`
- `*.reservaya.co` (wildcard para subdominios de negocios)

### DNS (registrador del dominio)

Vercel te dará registros exactos. Típicamente:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `@` | IP de Vercel |
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `*` | `cname.vercel-dns.com` |

### Código

`lib/constants.ts` ya incluye `reservaya.co` en `MAIN_DOMAINS`. Subdominios de negocios (`barberia.reservaya.co`) los maneja el middleware.

## Paso 5 — Supabase Auth (producción)

Supabase → **Authentication** → **URL Configuration**

**Site URL:**
```
https://reservaya.co
```

**Redirect URLs** (añadir todas):
```
https://reservaya.co/auth/callback
https://reservaya.co/auth/callback?next=/reset-password
https://reservaya.co/auth/callback?next=/dashboard
https://*.vercel.app/auth/callback
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/reset-password
```

**Forgot password:** Supabase envía enlace → `/auth/callback?next=/reset-password` → usuario define nueva clave.

## Paso 6 — QA E2E

Ejecutar checklist en `docs/QA_CHECKLIST.md` contra URL de producción.

## Paso 7 — Wompi sandbox

Cuando tengas credenciales de [comercios.wompi.co](https://comercios.wompi.co):

```env
WOMPI_PUBLIC_KEY=pub_test_...
WOMPI_PRIVATE_KEY=prv_test_...
WOMPI_EVENTS_SECRET=...
WOMPI_ENV=sandbox
```

Endpoints preparados (inactivos sin credenciales):

- `POST /api/billing/checkout`
- `POST /api/billing/webhook`

Ver `docs/WOMPI_PLAN.md`.

---

## Checklist rápido post-deploy

- [ ] Landing carga en `https://reservaya.co`
- [ ] Registro + confirmación email
- [ ] Login + onboarding
- [ ] `https://reservaya.co/mi-negocio` o subdominio wildcard
- [ ] Reserva pública sin login
- [ ] Admin solo con `ADMIN_EMAIL`
- [ ] Forgot-password funciona en producción
