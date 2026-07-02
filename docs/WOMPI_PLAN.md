# WOMPI_PLAN — Integración futura

> **Estado actual:** Wompi NO está implementado. Admin gestiona suscripciones manualmente.

## Flujo recomendado

1. Negocio en TRIAL (14–30 días según política comercial)
2. Al vencer trial → estado PAST_DUE → bloqueo reservas públicas
3. Negocio paga $150.000 COP/mes vía Wompi
4. Webhook confirma pago → ACTIVE + extiende `currentPeriodEnd`
5. Fallo de pago → PAST_DUE

## Variables .env futuras

```
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_EVENTS_SECRET=        # firma webhooks
WOMPI_ENV=sandbox|production
```

## Endpoints futuros (propuesta)

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/billing/checkout` | POST | Crear transacción / link de pago |
| `/api/billing/webhook` | POST | Recibir eventos Wompi |
| `/api/billing/status` | GET | Estado suscripción del tenant |

## Webhooks

- Validar firma con `WOMPI_EVENTS_SECRET`
- Idempotencia por `event.id`
- Eventos: `transaction.updated` → APPROVED / DECLINED
- Actualizar `Subscription.status` y `Tenant.subscriptionStatus`

## Riesgos

- Cobro duplicado sin idempotencia
- Webhook sin verificación de firma
- Exponer `WOMPI_PRIVATE_KEY` en frontend (nunca)
- Desincronización manual vs automática durante migración

## Preparación actual en código

- Constantes: `MONTHLY_PRICE_COP`, `MONTHLY_PRICE_CENTS`
- Modelo `Subscription` con estados TRIAL/ACTIVE/PAST_DUE/CANCELLED
- Admin puede activar/suspender manualmente
- Landing no promete “cobro automático”

## Referencias

- [Documentación Wompi](https://docs.wompi.co/)
