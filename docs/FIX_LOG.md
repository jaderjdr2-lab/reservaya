# FIX_LOG — RESERVAYA

Registro de cambios importantes durante auditoría Loop Engineering.

---

## 2026-07-01 — Fase 0–17 (checkpoint auditoría producción)

### Seguridad y multi-tenant
- **Creado** `lib/tenant-access.ts` — `requireUser`, `requireTenantAccess`, `requireOwner`, `requireAdminUser`
- **Creado** `lib/tenant-public.ts` — `canTenantAcceptBookings()` incluye PAST_DUE
- **Actualizado** `app/api/dashboard/settings/route.ts` — usa `requireOwner()`

### Reservas
- **Actualizado** `app/api/bookings/route.ts` — transacción Prisma, validación CO, horario, overlap
- **Actualizado** `app/api/bookings/slots/route.ts` — `canTenantAcceptBookings`
- **Actualizado** `lib/booking.ts` — `hasBookingConflict`, `slotsOverlap`

### Precio suscripción
- **Actualizado** `lib/constants.ts` — `MONTHLY_PRICE_COP = 150_000`
- **Actualizado** `prisma/schema.prisma` — default `monthlyPriceCents = 15000000`
- **Actualizado** onboarding, seed, admin, landing

### Auth
- **Creado** `/forgot-password`, `/reset-password`
- **Actualizado** login con enlace recuperación
- **Actualizado** auth callback para tipo `recovery`

### Config / deuda técnica
- **Corregido** `lib/tenants.ts` — endpoint `/api/tenant?subdomain=`
- **Renombrado** package `reservaya`
- **Marcado** `proxy-server.js` como legacy/dev
- **Ampliado** `RESERVED_SUBDOMAINS`

### UX / Admin / Dashboard
- **Creado** `components/CopyPublicUrl.tsx`
- **Actualizado** dashboard alerta suscripción + copiar URL
- **Actualizado** admin confirmaciones + PAST_DUE + precio

### Legal / Docs
- **Creado** `/privacy`, `/terms`
- **Creado** docs: AUDIT_REPORT, FIX_LOG, WOMPI_PLAN, QA_CHECKLIST, DEPLOYMENT, MONITORING

### Tests
- **Añadido** Vitest + `tests/core.test.ts`

### Validaciones
- **Creado** `lib/validators.ts` — teléfono CO, nombre, email, horarios, precio

### Validación final (2026-07-01)

- `npx prisma validate` ✅
- `npm run lint` ✅
- `npm test` ✅ (10 tests)
- `npm run build` ✅

### Nota datos existentes

Negocios creados antes de esta auditoría pueden tener `monthlyPriceCents = 4000000` en BD. Nuevos negocios usan `15000000`. Admin puede actualizar manualmente o ejecutar SQL de migración cuando Jhon lo apruebe.

## 2026-07-02 — Fase 2 deploy prep

- **Instalado** Git 2.55.0 via winget
- **Inicializado** repo Git — commit `ae01cea` en rama `main`
- **Actualizado** `lib/constants.ts` — `reservaya.co` en MAIN_DOMAINS
- **Creado** `docs/PHASE2_DEPLOY.md` — guía paso a paso Vercel + dominio + Supabase
- **Preparado** Wompi stubs: `lib/wompi/config.ts`, `/api/billing/checkout`, `/api/billing/webhook` (503 sin credenciales)
- **Tests** 11/11 pasando (incl. hostname producción)

### Pendiente (requiere acción de Jhon)

- Push a GitHub (crear repo + `git push`)
- Deploy Vercel + variables entorno
- DNS reservaya.co + wildcard
- Supabase Auth redirect URLs producción
- Credenciales Wompi sandbox
- QA E2E en producción

---

## Backup previo

- ZIP: `C:\Users\PC\Desktop\RESERVAYA-backup-checkpoint-20260701-224745.zip`
- Git: no instalado en equipo del usuario
