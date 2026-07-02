export type WompiEnv = 'sandbox' | 'production'

export function isWompiConfigured(): boolean {
  return Boolean(
    process.env.WOMPI_PUBLIC_KEY &&
      process.env.WOMPI_PRIVATE_KEY &&
      process.env.WOMPI_EVENTS_SECRET
  )
}

export function getWompiEnv(): WompiEnv {
  return process.env.WOMPI_ENV === 'production' ? 'production' : 'sandbox'
}

export function getWompiApiBaseUrl(): string {
  return getWompiEnv() === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1'
}
