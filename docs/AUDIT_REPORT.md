# AUDIT_REPORT — RESERVAYA

**Fecha:** julio 2026  
**Alcance:** MVP local + preparación producción  
**Metodología:** Loop Engineering (Fases 0–17)

---

## 1. Mapa de rutas públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/forgot-password` | Recuperar contraseña |
| `/reset-password` | Nueva contraseña (post-enlace) |
| `/privacy` | Política de privacidad (borrador) |
| `/terms` | Términos (borrador) |
| `/[subdomain]` | Página pública del negocio + reserva |
| `/auth/callback` | Callback Supabase Auth |
| `/api/tenant` | Lookup tenant por subdominio (datos mínimos) |
| `/api/bookings` | POST reserva pública |
| `/api/bookings/slots` | GET horarios disponibles |

## 2. Mapa de rutas privadas

| Ruta | Protección |
|------|------------|
| `/onboarding` | Middleware → login |
| `/dashboard/*` | Middleware → login |
| `/admin` | Middleware → login + `ADMIN_EMAIL` en API |
| `/api/onboarding` | Sesión Supabase |
| `/api/dashboard/*` | Sesión + tenant del usuario |
| `/api/admin/*` | `requireAdmin()` |

## 3. Mapa de APIs

| Endpoint | Método | Auth | Notas |
|----------|--------|------|-------|
| `/api/auth/login` | POST | No | Login servidor |
| `/api/auth/register` | POST | No | Registro |
| `/api/auth/logout` | POST | Sesión | Logout |
| `/api/auth/profile` | GET | Sesión | Perfil |
| `/api/onboarding` | POST | Sesión | Crear negocio |
| `/api/dashboard/services` | GET/POST/PUT | Owner tenant | CRUD servicios |
| `/api/dashboard/hours` | GET/PUT | Owner tenant | Horarios |
| `/api/dashboard/bookings` | GET/PUT | Owner tenant | Reservas |
| `/api/dashboard/settings` | PUT | Owner (`requireOwner`) | Config negocio |
| `/api/admin/tenants` | GET/PUT | Admin email | Gestión manual |
| `/api/create-tenant` | POST | **403 bloqueado** | Legacy boilerplate |
| `/api/tenant` | GET | No | Solo campos públicos |
| `/api/bookings` | POST | No | Reserva pública |
| `/api/bookings/slots` | GET | No | Slots disponibles |

## 4. Modelos Prisma

- **Tenant** — negocio multi-tenant (`subdomain`, `subscriptionStatus`, `isActive`)
- **UserProfile** — perfil vinculado a Supabase Auth
- **TenantMember** — OWNER / STAFF
- **Service** — servicios del negocio
- **BusinessHour** — horario por día (0–6)
- **Booking** — reservas (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- **Subscription** — suscripción manual (TRIAL, ACTIVE, PAST_DUE, CANCELLED)

## 5. Flujos críticos

1. Registro → confirmación email → login → onboarding → dashboard
2. Cliente público → `/[subdomain]` → selecciona servicio/fecha/hora → POST booking
3. Negocio → dashboard bookings → cambia estado → WhatsApp manual
4. Admin → `/admin` → activar/suspender / cambiar suscripción

## 6. Bugs detectados (inicial)

| ID | Severidad | Descripción | Estado |
|----|-----------|-------------|--------|
| B1 | ALTO | Precio $40.000 vs $150.000 COP | **Corregido** |
| B2 | MEDIO | PAST_DUE no bloqueaba reservas | **Corregido** |
| B3 | MEDIO | Doble reserva sin transacción | **Corregido** (tx + overlap) |
| B4 | BAJO | `lib/tenants.ts` endpoint `/api/tenants/` roto | **Corregido** |
| B5 | MEDIO | Sin recuperación de contraseña | **Corregido** |
| B6 | BAJO | `package.json` name legacy | **Corregido** |
| B7 | MEDIO | Validación teléfono CO débil | **Corregido** |
| B8 | BAJO | Admin sin confirmaciones | **Corregido** |

## 7. Riesgos de seguridad

| ID | Severidad | Riesgo | Mitigación |
|----|-----------|--------|------------|
| S1 | ALTO | Cross-tenant en APIs dashboard | Filtro `tenantId` desde servidor |
| S2 | MEDIO | `/api/create-tenant` legacy | Bloqueado 403 |
| S3 | MEDIO | Admin solo en API, no layout | Middleware login + API `requireAdmin` |
| S4 | BAJO | Sin rate limiting en reservas públicas | Pendiente producción |
| S5 | INFO | Google OAuth UI sin credenciales | Documentado, no rompe |

## 8. Problemas UX

- Landing sin links legales → **Corregido**
- Dashboard sin copiar URL → **Corregido**
- Login sin “olvidé contraseña” → **Corregido**
- Mensajes técnicos en inglés → Mayormente español

## 9. Problemas de deploy

- Git no instalado en máquina local
- Sin dominio `reservaya.co` configurado
- `NEXT_PUBLIC_API_URL` debe apuntar a URL producción en Vercel
- Supabase Auth redirect URLs pendientes de configurar

## 10. Variables .env requeridas

```
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_EMAIL=
NEXT_PUBLIC_API_URL=   # URL pública del sitio
```

**No usar en frontend:** `SUPABASE_SERVICE_ROLE_KEY`

## 11. Dependencias posiblemente no usadas

- `@neondatabase/serverless`
- `@prisma/adapter-pg`
- `pg`

> No eliminadas automáticamente; verificar antes de remover.

## 12. Prioridad de corrección

1. ~~Precio consistente $150.000~~
2. ~~Seguridad multi-tenant helpers~~
3. ~~Reservas endurecidas~~
4. ~~Auth recuperación contraseña~~
5. Deploy Vercel + GitHub
6. Wompi (fase siguiente)
7. WhatsApp API (fase siguiente)
8. Sentry / monitoreo (fase siguiente)
