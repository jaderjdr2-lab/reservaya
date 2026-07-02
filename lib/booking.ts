const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED'] as const

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function addMinutesToTime(time: string, duration: number): string {
  return minutesToTime(timeToMinutes(time) + duration)
}

export function getAvailableSlots(params: {
  openTime: string
  closeTime: string
  durationMinutes: number
  bookedSlots: Array<{ startTime: string; endTime: string }>
}): string[] {
  const { openTime, closeTime, durationMinutes, bookedSlots } = params
  const open = timeToMinutes(openTime)
  const close = timeToMinutes(closeTime)
  const slots: string[] = []

  for (let start = open; start + durationMinutes <= close; start += durationMinutes) {
    const end = start + durationMinutes
    const startTime = minutesToTime(start)
    const endTime = minutesToTime(end)

    const overlaps = bookedSlots.some((booking) => {
      const bookingStart = timeToMinutes(booking.startTime)
      const bookingEnd = timeToMinutes(booking.endTime)
      return start < bookingEnd && end > bookingStart
    })

    if (!overlaps) {
      slots.push(startTime)
    }
  }

  return slots
}

export function isPastBooking(date: Date, startTime: string): boolean {
  const [hours, minutes] = startTime.split(':').map(Number)
  const bookingDateTime = new Date(date)
  bookingDateTime.setHours(hours, minutes, 0, 0)
  return bookingDateTime.getTime() < Date.now()
}

export function slotsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const aStartMin = timeToMinutes(aStart)
  const aEndMin = timeToMinutes(aEnd)
  const bStartMin = timeToMinutes(bStart)
  const bEndMin = timeToMinutes(bEnd)
  return aStartMin < bEndMin && aEndMin > bStartMin
}

export function hasBookingConflict(
  startTime: string,
  endTime: string,
  bookedSlots: Array<{ startTime: string; endTime: string }>
): boolean {
  return bookedSlots.some((slot) => slotsOverlap(startTime, endTime, slot.startTime, slot.endTime))
}

export { ACTIVE_BOOKING_STATUSES }
