# E2E TRAINING REPORT

**URL:** https://reservaya-swart.vercel.app
**Fecha:** 2026-07-02T16:19:07.997Z
**Hoy Bogotá:** 2026-07-02

| ID | Escenario | Resultado | Detalle |
|---|---|---|---|
| L-UNIT | Tests unitarios locales | ✅ | 16/16 PASS |
| P-/ | Página / | ✅ | status 200 |
| P-/login | Página /login | ✅ | status 200 |
| P-/register | Página /register | ✅ | status 200 |
| P-/forgot-password | Página /forgot-password | ✅ | status 200 |
| P-/reset-password | Página /reset-password | ✅ | status 200 |
| P-/privacy | Página /privacy | ✅ | status 200 |
| P-/terms | Página /terms | ✅ | status 200 |
| P-/barberia-demo | Página /barberia-demo | ✅ | status 200 |
| P-/spa-demo | Página /spa-demo | ✅ | status 200 |
| P-404 | Subdominio inexistente | ✅ | status 404 |
| P-DASH-REDIRECT | Dashboard sin sesión → login | ✅ | status 307 |
| P-ADMIN-REDIRECT | Admin sin sesión → login | ✅ | status 307 |
| S-TENANT-NO-ID | Tenant API sin ID interno | ✅ | ok |
| S-BLOCK-CREATE | create-tenant bloqueado | ✅ | status 403 |
| S-WOMPI-OFF | Wompi sin credenciales | ✅ | status 503 |
| S-WOMPI-WH | Webhook Wompi sin credenciales | ✅ | status 503 |
| S-UNAUTH-/api/dashboard/services | /api/dashboard/services sin sesión | ✅ | 401 |
| S-UNAUTH-/api/dashboard/bookings | /api/dashboard/bookings sin sesión | ✅ | 401 |
| S-UNAUTH-/api/admin/tenants | /api/admin/tenants sin sesión | ✅ | 401 |
| B-SERVICES-API | API servicios públicos (fallback HTML) | ✅ | serviceId cmr2xudx… (deploy /api/public/services pendiente) |
| B-SLOTS | Slots disponibles | ✅ | 10 slots el 2026-07-03 |
| B-CREATE | Reserva sin login | ✅ | status 201 |
| B-DOUBLE | Rechazo doble reserva | ✅ | status 409 |
| B-PAST | Rechazo fecha pasada | ✅ | status 400 |
| B-PHONE | Rechazo teléfono inválido | ✅ | status 400 |
| B-BAD-DATE | Rechazo fecha inválida | ✅ | status 400 |
| B-MISSING | Rechazo campos vacíos | ✅ | status 400 |
| B-BAD-TENANT | Rechazo tenant inexistente | ✅ | status 403 |
| B-BAD-SERVICE | Rechazo servicio inválido | ✅ | status 404 |

**Total:** 30/30 PASS (API + unit)

## Verificación navegador (manual Loop Engineering)

| ID | Escenario | Resultado | Detalle |
|---|---|---|---|
| UI-BOOKING | Reserva completa en /barberia-demo | ✅ | Confirmación + link WhatsApp |
| UI-SLOTS | Carga de horarios al elegir fecha | ✅ | 9 slots visibles |
| UI-LOGIN | Login sin botón Google OAuth | ✅ | Solo email/contraseña |
| UI-SUPABASE | URLs Auth configuradas (usuario) | ✅ | Página /login carga sin error |

## Pendiente (requiere credenciales tuyas)

| Escenario | Motivo |
|---|---|
| Login → Dashboard | Requiere contraseña de cuenta negocio |
| Onboarding nuevo negocio | Requiere sesión autenticada |
| Panel Admin | Requiere login con ADMIN_EMAIL |
| Tenant suspendido/PAST_DUE | Requiere cambio de estado en BD |
| Deploy `/api/public/services` | Commit + push + Vercel prod pendiente |
