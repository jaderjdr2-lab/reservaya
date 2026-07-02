export type BusinessHourInput = {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
}

export function getDefaultBusinessHours(): BusinessHourInput[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    openTime: dayOfWeek === 0 ? '00:00' : '08:00',
    closeTime: dayOfWeek === 0 ? '00:00' : '18:00',
    isClosed: dayOfWeek === 0,
  }))
}
