# QA_CHECKLIST — RESERVAYA

Checklist manual E2E + automatizado.

## Automatizado (`npm test`)

- [x] Normalización WhatsApp
- [x] Validación subdominio
- [x] Generación slots
- [x] Bloqueo reserva pasado
- [x] Detección doble reserva (overlap)
- [x] Bloqueo PAST_DUE en tenant público

## Manual obligatorio

### Landing y auth
- [ ] Abrir `/` — landing carga, precio $150.000 COP
- [ ] Registrarse con email nuevo
- [ ] Confirmar email (Supabase) e iniciar sesión
- [ ] Probar `/forgot-password` — recibir enlace
- [ ] Restablecer contraseña en `/reset-password`
- [ ] Logout y login con nueva contraseña

### Onboarding y dashboard
- [ ] Crear negocio en `/onboarding`
- [ ] Subdominio reservado (`admin`) rechazado
- [ ] Dashboard muestra URL pública + botón copiar
- [ ] Crear servicio (duración, precio COP)
- [ ] Configurar horarios (día cerrado, open < close)
- [ ] Alerta si suscripción PAST_DUE/CANCELLED

### Reserva pública
- [ ] Abrir `/[subdomain]` sin login
- [ ] Crear reserva válida
- [ ] Botón “Enviar confirmación por WhatsApp” funciona
- [ ] Intentar misma hora dos veces → error 409
- [ ] Intentar día cerrado → sin slots / error
- [ ] Intentar pasado → error

### Dashboard reservas
- [ ] Ver reserva en `/dashboard/bookings`
- [ ] Cambiar estado CONFIRMED / CANCELLED / COMPLETED
- [ ] “Escribir al cliente” abre wa.me

### Admin
- [ ] `/admin` con usuario NO admin → acceso denegado
- [ ] `/admin` con `ADMIN_EMAIL` → lista negocios
- [ ] Suspender negocio → página pública no permite reservar
- [ ] Reactivar negocio → reservas funcionan
- [ ] Marcar PAST_DUE → bloqueo reservas

### Seguridad
- [ ] `/dashboard` sin sesión → redirect login
- [ ] Usuario A no puede ver/editar negocio B (API 404/403)

### Build
- [ ] `npx prisma validate`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm test`

## Notas

- Google OAuth: probar solo si está configurado en Supabase
- Wompi: no aplica en esta fase
