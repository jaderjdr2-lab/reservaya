export const APP_TIMEZONE = 'America/Bogota'

export function parseBookingDate(dateRaw: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateRaw)
  if (!match) {
    throw new Error('INVALID_DATE')
  }
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  return new Date(Date.UTC(y, m - 1, d))
}

export function getDayOfWeekFromDateRaw(dateRaw: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateRaw)
  if (!match) return 0
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function getBogotaParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = Object.fromEntries(
    formatter
      .formatToParts(now)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  ) as Record<string, string>

  return parts
}

export function getTodayDateRawInBogota(now = new Date()): string {
  const p = getBogotaParts(now)
  return `${p.year}-${p.month}-${p.day}`
}

export function isPastBookingDateTime(dateRaw: string, startTime: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) return true

  const today = getTodayDateRawInBogota(now)
  if (dateRaw < today) return true
  if (dateRaw > today) return false

  const [hours, minutes] = startTime.split(':').map(Number)
  const p = getBogotaParts(now)
  const nowMinutes = Number(p.hour) * 60 + Number(p.minute)
  return hours * 60 + minutes <= nowMinutes
}
