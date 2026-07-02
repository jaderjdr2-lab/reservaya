import prisma from '@/lib/prisma'
import {
  ACTIVE_BOOKING_STATUSES,
  addMinutesToTime,
  getAvailableSlots,
  hasBookingConflict,
} from '@/lib/booking'
import {
  getDayOfWeekFromDateRaw,
  isPastBookingDateTime,
  isValidDateRaw,
  parseBookingDate,
} from '@/lib/datetime'
import { canTenantAcceptBookings } from '@/lib/tenant-public'
import type { Booking, Service, Tenant } from '@prisma/client'

export class BookingCreateError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export type CreateBookingInput = {
  subdomain?: string
  tenantId?: string
  serviceId: string
  bookingDateRaw: string
  startTime: string
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  notes?: string | null
}

export type CreatedBookingResult = {
  booking: Booking & { service: Service }
  tenant: Tenant
  service: Service
  bookingDate: Date
}

export async function createBooking(input: CreateBookingInput): Promise<CreatedBookingResult> {
  const {
    serviceId,
    bookingDateRaw,
    startTime,
    customerName,
    customerPhone,
    customerEmail = null,
    notes = null,
  } = input

  if (!isValidDateRaw(bookingDateRaw)) {
    throw new BookingCreateError('Fecha inválida.', 400)
  }

  if (isPastBookingDateTime(bookingDateRaw, startTime)) {
    throw new BookingCreateError('No puedes reservar en el pasado.', 400)
  }

  const tenant = input.tenantId
    ? await prisma.tenant.findUnique({
        where: { id: input.tenantId },
        include: { subscription: true },
      })
    : await prisma.tenant.findUnique({
        where: { subdomain: input.subdomain },
        include: { subscription: true },
      })

  if (!tenant || !canTenantAcceptBookings(tenant)) {
    throw new BookingCreateError('Este negocio no está recibiendo reservas.', 403)
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId: tenant.id, isActive: true },
  })

  if (!service) {
    throw new BookingCreateError('Servicio no válido.', 404)
  }

  const bookingDate = parseBookingDate(bookingDateRaw)
  const dayOfWeek = getDayOfWeekFromDateRaw(bookingDateRaw)
  const businessHour = await prisma.businessHour.findUnique({
    where: {
      tenantId_dayOfWeek: { tenantId: tenant.id, dayOfWeek },
    },
  })

  if (!businessHour || businessHour.isClosed) {
    throw new BookingCreateError('El negocio está cerrado ese día.', 400)
  }

  const endTime = addMinutesToTime(startTime, service.durationMinutes)

  const availableSlots = getAvailableSlots({
    openTime: businessHour.openTime,
    closeTime: businessHour.closeTime,
    durationMinutes: service.durationMinutes,
    bookedSlots: [],
  })

  if (!availableSlots.includes(startTime)) {
    throw new BookingCreateError('La hora seleccionada está fuera del horario disponible.', 400)
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const existingBookings = await tx.booking.findMany({
        where: {
          tenantId: tenant.id,
          bookingDate,
          status: { in: [...ACTIVE_BOOKING_STATUSES] },
        },
        select: { startTime: true, endTime: true },
      })

      if (hasBookingConflict(startTime, endTime, existingBookings)) {
        throw new Error('SLOT_TAKEN')
      }

      return tx.booking.create({
        data: {
          tenantId: tenant.id,
          serviceId: service.id,
          customerName,
          customerPhone,
          customerEmail,
          notes,
          bookingDate,
          startTime,
          endTime,
          status: 'CONFIRMED',
        },
        include: { service: true },
      })
    })

    return { booking, tenant, service, bookingDate }
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      throw new BookingCreateError('Esa hora ya no está disponible.', 409)
    }
    throw error
  }
}
