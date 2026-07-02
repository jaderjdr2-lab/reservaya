# Prompt de auditoría — RESERVAYA (copiar y pegar)

Usa este prompt en un chat **Agent** con acceso al repo (Fable 5, Opus, etc.).

---

## PROMPT (copiar desde aquí)

```
Eres auditor senior de software. Audita el proyecto RESERVAYA de punta a punta y entrégame un plan de acción ejecutable — no un resumen genérico.

## Contexto del producto

- **Qué es:** SaaS de reservas para negocios de servicios en Colombia (barberías, spas, etc.)
- **Modelo:** $150.000 COP/mes por negocio. Cliente final reserva SIN cuenta.
- **Mercado piloto:** Barrancabermeja, Colombia
- **Admin maestro:** solo jaderjdr2@gmail.com accede a /admin

## Stack

- Next.js 14 App Router, TypeScript, Tailwind
- Prisma 5 + PostgreSQL (Supabase)
- Supabase Auth (email + Google OAuth)
- Deploy: Vercel
- Repo privado: https://github.com/jaderjdr2-lab/reservaya (rama main)
- Producción: https://reservaya-swart.vercel.app

## Lo que DEBES hacer tú (obligatorio)

1. **Explorar el código** — no asumas. Lee al menos:
   - `prisma/schema.prisma`
   - `middleware.ts`
   - `lib/` (auth, tenant-access, datetime, rate-limit, validators)
   - `app/api/` (bookings, auth, dashboard, admin, onboarding, setup)
   - `app/[subdomain]/PublicBookingForm.tsx`
   - `app/admin/`, `app/dashboard/`
   - `docs/DIAGNOSTIC.md`, `docs/E2E_TRAINING_REPORT.md`, `docs/AUDIT_REPORT.md`

2. **Verificar estado actual** ejecutando si puedes:
   - `npm test`
   - `npm run lint`
   - `npm run build`
   - Revisar si hay cambios sin commitear (`git status`)

3. **Contrastar docs vs código** — marca discrepancias (docs desactualizados = finding)

4. **Priorizar por impacto en piloto real** (1–5 negocios pagando/usando en 30 días)

## Áreas de auditoría (todas obligatorias)

| Área | Preguntas clave |
|------|-----------------|
| Seguridad | ¿APIs expuestas? ¿IDOR? ¿Admin bypass? ¿Secrets en repo? ¿Rate limit efectivo en serverless? |
| Auth | Email, Google OAuth, callbacks, sesiones SSR, recovery password |
| Multi-tenant | Aislamiento entre negocios, subdominios, reservas cruzadas |
| Reservas | Doble booking, timezone Bogotá, validaciones teléfono, slots, PAST_DUE/SUSPENDED |
| Pagos | Wompi stub — qué falta para cobrar $150k/mes |
| UX público | Formulario reserva móvil, onboarding dueño, dashboard |
| Datos | Modelo Prisma, índices, migraciones, seed |
| Ops | Vercel env, Supabase config, monitoreo, backups, dominio propio |
| Legal | /privacy, /terms — listos para Colombia? |
| Tests | Cobertura real vs crítico; qué E2E falta |
| Deuda técnica | Código muerto, duplicación, dependencias obsoletas |

## Lo que YA se hizo (verificar que sigue válido)

- Rate limit 15 req/min en POST /api/bookings (in-memory — ¿problema en Vercel?)
- Transacción anti doble reserva
- Admin protegido por ADMIN_EMAIL
- Dashboard APIs con requireOwner()
- Google OAuth habilitado + wizard /activar-google
- E2E training: 30/30 PASS en prod (jul 2026)
- Precio $150.000 COP centralizado
- Fix formulario público (dark mode, horarios default)

## Formato de salida OBLIGATORIO

Responde en **español** con esta estructura exacta:

### 1. Veredicto ejecutivo
(3–5 líneas: ¿listo para piloto? ¿listo para cobrar? ¿qué bloquea?)

### 2. Scorecard (0–10)
| Dimensión | Nota | Una línea de evidencia |
|-----------|------|------------------------|
| Seguridad | | |
| Reservas core | | |
| Auth/onboarding | | |
| Monetización | | |
| Ops/producción | | |
| UX móvil | | |
| Tests/QA | | |
| Legal/compliance | | |

### 3. Hallazgos por severidad

Para CADA hallazgo usa este formato:
```
ID: RY-001
Severidad: CRÍTICO | ALTO | MEDIO | BAJO
Área: [seguridad|reservas|auth|...]
Evidencia: [archivo:línea o comportamiento verificado]
Riesgo: [qué pasa si no se arregla]
Acción: [qué hacer en 1–3 frases concretas]
Esfuerzo: S | M | L
Owner sugerido: dev | Jhon (config manual) | abogado
```

### 4. Plan de acción — 48 horas
(checklist numerada, máximo 8 items, orden de ejecución)

### 5. Plan de acción — 7 días
(checklist para piloto con 1 negocio real)

### 6. Plan de acción — 30 días
(checklist para 5 negocios + cobro automático)

### 7. Quick wins (< 2 horas c/u)
(lista de mejoras fáciles con alto impacto)

### 8. No hacer todavía
(cosa que parece urgente pero puede esperar post-MVP)

### 9. Preguntas bloqueantes
(solo si necesitas decisión de negocio de Jhon — máximo 5)

## Reglas

- Cita archivos con rutas reales del repo
- Diferencia "bug confirmado" vs "riesgo teórico"
- No propongas reescribir el stack salvo bloqueador real
- No incluyas secrets ni pidas .env
- Si algo ya está bien, dilo en una línea (no inflar el reporte)
- Máximo 25 hallazgos — prioriza calidad sobre cantidad

Empieza explorando el repo ahora. No preguntes permiso para leer archivos.
```

---

## Cómo usarlo en Cursor

1. Chat nuevo → modelo **Fable 5** (o el que prefieras) → modo **Agent**
2. Pega el prompt de arriba
3. Añade referencias:
   ```
   @docs/
   @app/
   @lib/
   @prisma/
   ```
4. Espera el informe completo antes de implementar cambios

## Repo

- https://github.com/jaderjdr2-lab/reservaya (PRIVATE, rama `main`)
