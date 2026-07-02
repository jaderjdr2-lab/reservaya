# MONITORING — RESERVAYA

> Sentry no instalado en MVP. Plan futuro documentado.

## Qué monitorear

| Área | Señales |
|------|---------|
| Reservas | POST `/api/bookings` 4xx/5xx, conflictos 409 |
| Auth | Login fallido, callback errors, sesiones expiradas |
| API | Errores 500 en dashboard/admin |
| Prisma | Timeouts, connection pool exhausted |
| Supabase | Auth rate limits, DB unavailable |

## Errores críticos

- Reserva creada pero tenant suspendido (no debe ocurrir post-fix)
- Cross-tenant data leak
- Admin accesible sin `ADMIN_EMAIL`
- Secretos expuestos en cliente

## Logs actuales

- `console.error` en rutas API críticas
- Vercel Function Logs en producción

## Plan futuro con Sentry

1. Instalar `@sentry/nextjs`
2. DSN en variable `SENTRY_DSN`
3. Capturar:
   - Excepciones no manejadas
   - Errores Prisma
   - Fallos webhook Wompi (fase 2)
4. Alertas Slack/email para error rate > umbral

## Métricas de negocio (manual / admin)

- Negocios activos vs suspendidos
- Reservas por día
- Tenants PAST_DUE / CANCELLED
- Conversión trial → ACTIVE

## Health check sugerido (futuro)

`GET /api/health` → `{ ok: true, db: "connected" }`

No implementado en MVP para minimizar superficie.
