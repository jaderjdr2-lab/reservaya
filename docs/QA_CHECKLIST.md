# QA_CHECKLIST — RESERVAYA

## Automatizado ✅

- [x] Normalización WhatsApp
- [x] Validación subdominio
- [x] Generación slots
- [x] Bloqueo reserva pasado (Bogotá)
- [x] Detección doble reserva
- [x] Bloqueo PAST_DUE
- [x] Rate limit reservas
- [x] Validación fecha YYYY-MM-DD
- [x] Hostname producción reservaya.co

Comando: `npm test` → **16/16**

## Build ✅

- [x] `npx prisma validate`
- [x] `npm run lint`
- [x] `npm run build`

## Manual producción (pendiente Jhon)

### Auth
- [ ] Registro en https://reservaya-swart.vercel.app/register
- [ ] Confirmar email Supabase
- [ ] Login
- [ ] Forgot-password / reset-password
- [ ] Logout

### Negocio
- [ ] Onboarding con WhatsApp válido
- [ ] Crear servicio
- [ ] Configurar horarios
- [ ] Copiar URL pública

### Reserva pública
- [ ] Abrir `/[subdomain]` sin login
- [ ] Reserva válida + WhatsApp
- [ ] Rechazo doble reserva
- [ ] Rechazo fecha pasada

### Admin
- [ ] Solo `ADMIN_EMAIL` accede
- [ ] Suspender / reactivar negocio
- [ ] PAST_DUE bloquea reservas

> **Bloqueador conocido:** login producción requiere Supabase redirects — ver `docs/SUPABASE_PRODUCTION.md`
