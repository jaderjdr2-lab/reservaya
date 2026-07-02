/** Activo por defecto; desactivar con NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=false */
export const GOOGLE_OAUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED !== 'false'

export const APP_NAME = 'RESERVAYA'

/** Precio mensual de referencia (fase piloto: cobro manual, sin Wompi aún) */
export const MONTHLY_PRICE_COP = 40_000

export const MONTHLY_PRICE_CENTS = 4_000_000

export const DEFAULT_CITY = 'Barrancabermeja'

export const DEFAULT_TIMEZONE = 'America/Bogota'

export const RESERVED_SUBDOMAINS = [
  'admin',
  'api',
  'auth',
  'login',
  'register',
  'dashboard',
  'onboarding',
  'www',
  'app',
  'mail',
  'support',
  'help',
  'static',
  'assets',
  'settings',
  'services',
  'bookings',
  'hours',
  'privacy',
  'terms',
]

export const MAIN_DOMAINS = ['localhost', '127.0.0.1', 'reservaya.co', 'www.reservaya.co']

export function isMainHostname(hostname: string): boolean {
  if (MAIN_DOMAINS.includes(hostname)) return true
  if (hostname.endsWith('.vercel.app')) return true
  if (hostname.endsWith('.trycloudflare.com')) return true
  if (hostname.endsWith('.loca.lt')) return true
  return false
}

export const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]
