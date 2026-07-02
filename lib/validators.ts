const COLOMBIA_PHONE_REGEX = /^(57)?3\d{9}$/

export function normalizeColombianPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('57') && digits.length === 12) {
    return digits.slice(2)
  }
  return digits
}

export function isValidColombianPhone(value: string): boolean {
  const digits = normalizeColombianPhone(value)
  return COLOMBIA_PHONE_REGEX.test(`57${digits}`)
}

export function isValidCustomerName(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length >= 2 && trimmed.length <= 100
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmailOptional(value?: string | null): boolean {
  if (!value) return true
  return EMAIL_REGEX.test(value.trim())
}

export function isValidEmailRequired(value?: string | null): boolean {
  if (!value?.trim()) return false
  return EMAIL_REGEX.test(value.trim())
}

export function sanitizeNotes(value?: string | null, maxLength = 500): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

export function isValidBusinessHours(openTime: string, closeTime: string, isClosed: boolean): boolean {
  if (isClosed) return true
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  const openMinutes = oh * 60 + om
  const closeMinutes = ch * 60 + cm
  return openMinutes < closeMinutes
}

export function isValidServiceDuration(minutes: number): boolean {
  return Number.isFinite(minutes) && minutes >= 15 && minutes <= 480
}

export function isValidPriceCents(cents: number): boolean {
  return Number.isFinite(cents) && cents > 0 && cents <= 100000000
}
