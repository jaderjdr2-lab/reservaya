import { describe, expect, it } from 'vitest'
import { getAvailableSlots, hasBookingConflict, isPastBooking } from '@/lib/booking'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { isValidSubdomain } from '@/lib/utils'
import { isMainHostname } from '@/lib/constants'
import { isValidColombianPhone, normalizeColombianPhone } from '@/lib/validators'
import { canTenantAcceptBookings } from '@/lib/tenant-public'

describe('WhatsApp', () => {
  it('normaliza número colombiano con prefijo 57', () => {
    const link = buildWhatsAppLink('3001234567', 'Hola')
    expect(link).toContain('wa.me/573001234567')
  })

  it('mantiene número que ya incluye 57', () => {
    const link = buildWhatsAppLink('573001234567', 'Hola')
    expect(link).toContain('wa.me/573001234567')
  })
})

describe('Subdominio', () => {
  it('acepta subdominios válidos', () => {
    expect(isValidSubdomain('barberia-demo')).toBe(true)
  })

  it('rechaza subdominios inválidos', () => {
    expect(isValidSubdomain('-invalid-')).toBe(false)
    expect(isValidSubdomain('A')).toBe(false)
  })
})

describe('Slots', () => {
  it('genera slots según duración del servicio', () => {
    const slots = getAvailableSlots({
      openTime: '08:00',
      closeTime: '10:00',
      durationMinutes: 60,
      bookedSlots: [],
    })
    expect(slots).toEqual(['08:00', '09:00'])
  })

  it('excluye slots ocupados', () => {
    const slots = getAvailableSlots({
      openTime: '08:00',
      closeTime: '11:00',
      durationMinutes: 60,
      bookedSlots: [{ startTime: '09:00', endTime: '10:00' }],
    })
    expect(slots).not.toContain('09:00')
  })
})

describe('Reservas pasado', () => {
  it('detecta reserva en el pasado', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isPastBooking(yesterday, '10:00')).toBe(true)
  })
})

describe('Doble reserva', () => {
  it('detecta conflicto de solapamiento', () => {
    const conflict = hasBookingConflict('09:00', '10:00', [{ startTime: '09:30', endTime: '10:30' }])
    expect(conflict).toBe(true)
  })
})

describe('Teléfono colombiano', () => {
  it('normaliza y valida celular', () => {
    expect(normalizeColombianPhone('57 300 123 4567')).toBe('3001234567')
    expect(isValidColombianPhone('3001234567')).toBe(true)
    expect(isValidColombianPhone('2001234567')).toBe(false)
  })
})

describe('Hostname producción', () => {
  it('trata reservaya.co como dominio principal', () => {
    expect(isMainHostname('reservaya.co')).toBe(true)
    expect(isMainHostname('www.reservaya.co')).toBe(true)
    expect(isMainHostname('barberia.reservaya.co')).toBe(false)
  })
})

describe('Tenant público', () => {
  it('bloquea reservas si está PAST_DUE', () => {
    expect(
      canTenantAcceptBookings({
        isActive: true,
        subscriptionStatus: 'PAST_DUE',
      } as Parameters<typeof canTenantAcceptBookings>[0])
    ).toBe(false)
  })
})
