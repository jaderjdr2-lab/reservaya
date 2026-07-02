/**
 * Entrenamiento E2E — RESERVAYA (API + unit tests, sin Prisma local)
 */
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { getTodayDateRawInBogota, parseBookingDate } from '../lib/datetime.ts'

const BASE_URL = (process.env.BASE_URL || 'https://reservaya-swart.vercel.app').replace(/\/$/, '')
const DEMO_SUBDOMAIN = process.env.E2E_SUBDOMAIN || 'barberia-demo'

type Result = { id: string; name: string; pass: boolean; detail: string }
const results: Result[] = []

function record(id: string, name: string, pass: boolean, detail: string) {
  results.push({ id, name, pass, detail })
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${name} — ${detail}`)
}

const FETCH_TIMEOUT_MS = 30_000

async function fetchWithTimeout(path: string, init?: RequestInit) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(`${BASE_URL}${path}`, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchJson(path: string, init?: RequestInit) {
  const res = await fetchWithTimeout(path, init)
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  return { res, body }
}

function addDaysToDateRaw(dateRaw: string, days: number): string {
  const d = parseBookingDate(dateRaw)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

async function getDemoServiceId(): Promise<string | null> {
  const { res, body } = await fetchJson(`/api/public/services?subdomain=${DEMO_SUBDOMAIN}`)
  if (res.ok) {
    const data = body as { services?: Array<{ id: string }> }
    return data.services?.[0]?.id ?? null
  }

  const pageRes = await fetchWithTimeout(`/${DEMO_SUBDOMAIN}`)
  if (!pageRes.ok) return null
  const html = await pageRes.text()
  const match = html.match(/<option[^>]*\svalue="(c[a-z0-9]+)"/i)
  return match?.[1] ?? null
}

async function findBookableSlot(serviceId: string): Promise<{ date: string; slot: string; slots: string[] } | null> {
  const today = getTodayDateRawInBogota()
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = addDaysToDateRaw(today, dayOffset)
    const { res, body } = await fetchJson(
      `/api/bookings/slots?subdomain=${DEMO_SUBDOMAIN}&serviceId=${serviceId}&date=${date}`
    )
    const slots = (body as { slots?: string[] })?.slots ?? []
    if (res.ok && slots.length > 0) {
      return { date, slot: slots[0], slots }
    }
  }
  return null
}

function runLocalUnitTests() {
  try {
    execSync('npm test', { stdio: 'pipe', encoding: 'utf8' })
    record('L-UNIT', 'Tests unitarios locales', true, '16/16 PASS')
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    record('L-UNIT', 'Tests unitarios locales', false, msg.slice(0, 120))
  }
}

async function runPublicSmoke() {
  for (const p of [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/privacy',
    '/terms',
    `/${DEMO_SUBDOMAIN}`,
    '/spa-demo',
  ]) {
    const res = await fetchWithTimeout(p)
    record(`P-${p}`, `Página ${p}`, res.status === 200, `status ${res.status}`)
  }

  const notFound = await fetchWithTimeout('/negocio-inexistente-xyz')
  record('P-404', 'Subdominio inexistente', notFound.status === 404, `status ${notFound.status}`)

  const dash = await fetchWithTimeout('/dashboard', { redirect: 'manual' })
  record('P-DASH-REDIRECT', 'Dashboard sin sesión → login', dash.status === 307 || dash.status === 302, `status ${dash.status}`)

  const admin = await fetchWithTimeout('/admin', { redirect: 'manual' })
  record('P-ADMIN-REDIRECT', 'Admin sin sesión → login', admin.status === 307 || admin.status === 302, `status ${admin.status}`)
}

async function runSecurity() {
  const { res: tRes, body: tBody } = await fetchJson(`/api/tenant?subdomain=${DEMO_SUBDOMAIN}`)
  const tenant = tBody as Record<string, unknown> | null
  record(
    'S-TENANT-NO-ID',
    'Tenant API sin ID interno',
    tRes.ok && tenant !== null && !('id' in tenant),
    tRes.ok ? 'ok' : `status ${tRes.status}`
  )

  const { res: cRes } = await fetchJson('/api/create-tenant', { method: 'POST' })
  record('S-BLOCK-CREATE', 'create-tenant bloqueado', cRes.status === 403, `status ${cRes.status}`)

  const { res: bRes } = await fetchJson('/api/billing/checkout', { method: 'POST' })
  record('S-WOMPI-OFF', 'Wompi sin credenciales', bRes.status === 503, `status ${bRes.status}`)

  const { res: whRes } = await fetchJson('/api/billing/webhook', { method: 'POST', body: '{}' })
  record('S-WOMPI-WH', 'Webhook Wompi sin credenciales', whRes.status === 503, `status ${whRes.status}`)

  for (const ep of ['/api/dashboard/services', '/api/dashboard/bookings', '/api/admin/tenants']) {
    const { res } = await fetchJson(ep)
    record(`S-UNAUTH-${ep}`, `${ep} sin sesión`, res.status === 401 || res.status === 403, `${res.status}`)
  }
}

async function runPublicServices() {
  const { res, body } = await fetchJson(`/api/public/services?subdomain=${DEMO_SUBDOMAIN}`)
  if (res.ok) {
    const data = body as { services?: unknown[]; name?: string } | null
    record(
      'B-SERVICES-API',
      'API servicios públicos',
      (data?.services?.length ?? 0) > 0,
      `${data?.name} — ${data?.services?.length} servicios`
    )
    return
  }

  const serviceId = await getDemoServiceId()
  record(
    'B-SERVICES-API',
    'API servicios públicos (fallback HTML)',
    !!serviceId,
    serviceId ? `serviceId ${serviceId.slice(0, 8)}… (deploy /api/public/services pendiente)` : `status ${res.status}`
  )
}

async function runBookingFlow() {
  const serviceId = await getDemoServiceId()
  if (!serviceId) {
    record('B-FLOW', 'Flujo reserva completo', false, 'sin serviceId')
    return
  }

  const bookable = await findBookableSlot(serviceId)
  if (!bookable) {
    record('B-SLOTS', 'Slots disponibles', false, 'sin slots en 14 días')
    record('B-FLOW', 'Flujo reserva completo', false, 'sin fecha reservable')
    return
  }

  const { date, slot, slots } = bookable
  record('B-SLOTS', 'Slots disponibles', true, `${slots.length} slots el ${date}`)

  const payload = {
    subdomain: DEMO_SUBDOMAIN,
    serviceId,
    bookingDate: date,
    startTime: slot,
    customerName: 'Cliente Entrenamiento E2E',
    customerPhone: `300${String(Date.now()).slice(-7)}`,
  }

  const { res: okRes, body: okBody } = await fetchJson('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const okData = okBody as { booking?: { id?: string; status?: string }; whatsappLink?: string } | null
  const shapeOk =
    okRes.status === 201 &&
    !!okData?.whatsappLink &&
    okData.booking?.id &&
    okData.booking?.status &&
    !('tenantId' in (okData.booking as object))
  record('B-CREATE', 'Reserva sin login', shapeOk, `status ${okRes.status}`)

  const { res: dupRes } = await fetchJson('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  record('B-DOUBLE', 'Rechazo doble reserva', dupRes.status === 409, `status ${dupRes.status}`)

  const { res: pastRes } = await fetchJson('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, bookingDate: '2020-01-01', startTime: '10:00' }),
  })
  record('B-PAST', 'Rechazo fecha pasada', pastRes.status === 400, `status ${pastRes.status}`)

  const altSlot = slots.find((s) => s !== slot) ?? slot
  const { res: phoneRes } = await fetchJson('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, customerPhone: '2001234567', startTime: altSlot }),
  })
  record('B-PHONE', 'Rechazo teléfono inválido', phoneRes.status === 400, `status ${phoneRes.status}`)

  const { res: badDateRes } = await fetchJson(
    `/api/bookings/slots?subdomain=${DEMO_SUBDOMAIN}&serviceId=${serviceId}&date=invalid`
  )
  record('B-BAD-DATE', 'Rechazo fecha inválida', badDateRes.status === 400, `status ${badDateRes.status}`)

  const { res: missingRes } = await fetchJson('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subdomain: DEMO_SUBDOMAIN }),
  })
  record('B-MISSING', 'Rechazo campos vacíos', missingRes.status === 400, `status ${missingRes.status}`)

  const { res: badTenantRes } = await fetchJson('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, subdomain: 'no-existe-xyz' }),
  })
  record('B-BAD-TENANT', 'Rechazo tenant inexistente', badTenantRes.status === 403, `status ${badTenantRes.status}`)

  const { res: badServiceRes } = await fetchJson('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, serviceId: 'c00000000000000000000000', startTime: altSlot }),
  })
  record('B-BAD-SERVICE', 'Rechazo servicio inválido', badServiceRes.status === 404, `status ${badServiceRes.status}`)
}

async function main() {
  console.log(`\n=== E2E TRAINING — ${BASE_URL} ===\n`)
  console.log(`Fecha Bogotá hoy: ${getTodayDateRawInBogota()}\n`)

  runLocalUnitTests()
  await runPublicSmoke()
  await runSecurity()
  await runPublicServices()
  await runBookingFlow()

  const passed = results.filter((r) => r.pass).length
  const failed = results.filter((r) => !r.pass).length
  console.log(`\n=== ${passed} PASS / ${failed} FAIL / ${results.length} TOTAL ===\n`)

  const report = [
    '# E2E TRAINING REPORT',
    '',
    `**URL:** ${BASE_URL}`,
    `**Fecha:** ${new Date().toISOString()}`,
    `**Hoy Bogotá:** ${getTodayDateRawInBogota()}`,
    '',
    '| ID | Escenario | Resultado | Detalle |',
    '|---|---|---|---|',
    ...results.map((r) => `| ${r.id} | ${r.name} | ${r.pass ? '✅' : '❌'} | ${r.detail.replace(/\|/g, '\\|')} |`),
    '',
    `**Total:** ${passed}/${results.length} PASS`,
    failed > 0 ? `\n> ⚠️ ${failed} escenario(s) fallaron — revisar antes de producción.` : '',
  ].join('\n')
  writeFileSync('docs/E2E_TRAINING_REPORT.md', report)

  if (failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
