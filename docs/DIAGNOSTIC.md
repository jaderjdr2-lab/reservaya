# DIAGNÓSTICO RESERVAYA — Auditoría Loop Engineering

**Fecha:** julio 2026  
**Entorno:** Local + producción `https://reservaya-swart.vercel.app`  
**Repo:** https://github.com/jaderjdr2-lab/reservaya  

---

## 1. VEREDICTO

| Criterio | Estado |
|----------|--------|
| Demo / piloto local | ✅ Listo |
| Piloto con clientes reales | ⚠️ Casi — falta Supabase redirects producción + dominio propio |
| Producción pública escalable | ⚠️ Pendiente Wompi, rate limiting, monitoreo |

**Salud general:** **7.5/10** — MVP sólido con bugs corregidos en esta auditoría; deuda operativa (Supabase prod, dominio, pagos) pendiente.

---

## 2. BUGS ENCONTRADOS Y CORREGIDOS (esta sesión)

| ID | Severidad | Bug | Corrección |
|----|-----------|-----|------------|
| B-01 | **ALTO** | Fechas/horas de reserva usaban TZ del servidor (UTC en Vercel), no `America/Bogota` | Nuevo `lib/datetime.ts`, reservas y slots actualizados |
| B-02 | **ALTO** | `dayOfWeek` incorrecto por parseo `new Date('YYYY-MM-DD')` en UTC | `getDayOfWeekFromDateRaw()` |
| B-03 | **MEDIO** | `/admin` accesible a cualquier usuario logueado (UI vacía) | `app/admin/layout.tsx` + middleware con `ADMIN_EMAIL` |
| B-04 | **MEDIO** | `/api/tenant` exponía `id` interno del tenant | Eliminado del response |
| B-05 | **MEDIO** | Onboarding sin validar WhatsApp colombiano | `isValidColombianPhone()` |
| B-06 | **BAJO** | PUT servicios sin validar duración/precio | Validación en update |
| B-07 | **BAJO** | Admin PUT sin validar `tenantId` | 400/404 antes de update |
| B-08 | **BAJO** | Notas reserva sin límite en UI | `maxLength={500}` |

---

## 3. BUGS / RIESGOS PENDIENTES (no corregidos — requieren acción externa)

| ID | Severidad | Issue | Acción |
|----|-----------|-------|--------|
| P-01 | **ALTO** | Login en producción si Supabase redirects no configurados | Configurar URLs en Supabase |
| P-02 | **MEDIO** | Negocios viejos con `monthlyPriceCents = 4000000` en BD | SQL migración manual |
| P-03 | **MEDIO** | Sin rate limiting en `/api/bookings` | Futuro: middleware o Vercel WAF |
| P-04 | **MEDIO** | Google OAuth UI sin credenciales | Configurar o ocultar botón |
| P-05 | **BAJO** | Deps no usadas (`pg`, `@neondatabase/serverless`) | Limpiar cuando confirmes build |
| P-06 | **BAJO** | Vercel ↔ GitHub auto-deploy no conectado | Conectar en Vercel dashboard |
| P-07 | **INFO** | Wompi stubs (503) — esperado | Credenciales sandbox |

---

## 4. SEGURIDAD MULTI-TENANT

| Check | Estado |
|-------|--------|
| Dashboard filtra por `tenantId` del servidor | ✅ |
| Settings exige OWNER | ✅ |
| `/api/create-tenant` bloqueada | ✅ |
| Admin solo `ADMIN_EMAIL` (API + layout + middleware) | ✅ **mejorado** |
| Reserva pública sin login | ✅ |
| Cross-tenant en bookings/services | ✅ No detectado |
| Secretos en Git | ✅ `.env` ignorado |
| `service_role` en frontend | ✅ No usado |

---

## 5. VALIDACIONES EJECUTADAS

```
npx prisma validate  ✅
npm run lint         ✅
npm run build        ✅ (35 rutas)
npm test             ✅ 14/14 (post-fix imports)
```

---

## 6. PRODUCCIÓN

- **URL:** https://reservaya-swart.vercel.app — landing OK
- **Variables Vercel:** configuradas
- **GitHub:** código en `main`
- **Pendiente:** Supabase Auth URLs producción, dominio `reservaya.co`

---

## 7. ARCHIVOS MODIFICADOS (auditoría)

- `lib/datetime.ts` (nuevo)
- `lib/admin.ts` (nuevo)
- `lib/booking.ts`, `lib/auth.ts`
- `middleware.ts`
- `app/admin/layout.tsx` (nuevo)
- `app/api/tenant/route.ts`
- `app/api/bookings/route.ts`, `slots/route.ts`
- `app/api/onboarding/route.ts`
- `app/api/dashboard/services/route.ts`
- `app/api/admin/tenants/route.ts`
- `app/[subdomain]/PublicBookingForm.tsx`
- `tests/core.test.ts`

---

## 8. PRÓXIMOS 5 PASOS

1. Configurar Supabase Auth redirects para `reservaya-swart.vercel.app`
2. Probar login + reserva E2E en producción
3. Conectar GitHub en Vercel para deploy automático
4. Dominio `reservaya.co` + wildcard
5. Credenciales Wompi sandbox

---

## 9. PROMPT SIGUIENTE FASE

```
Auditoría RESERVAYA completada. Continúa con:
1. QA E2E en https://reservaya-swart.vercel.app (login, onboarding, reserva, admin)
2. Migrar precios viejos en BD a 15000000 cents
3. Integrar Wompi sandbox con credenciales
4. Configurar dominio reservaya.co
Loop Engineering, no force-reset BD.
```
