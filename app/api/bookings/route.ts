import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  ACTIVE_BOOKING_STATUSES,
  addMinutesToTime,
  getAvailableSlots,
  hasBookingConflict,
} from '@/lib/booking'
import { isPastBookingDateTime, parseBookingDate, getDayOfWeekFromDateRaw } from '@/lib/datetime'
import { canTenantAcceptBookings } from '@/lib/tenant-public'
import { buildBookingCustomerMessage, buildWhatsAppLink } from '@/lib/whatsapp'
import { formatDateEs, formatTime } from '@/lib/utils'
import {
  isValidColombianPhone,
  isValidCustomerName,
  isValidEmailOptional,
  normalizeColombianPhone,
  sanitizeNotes,
} from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const subdomain = String(body.subdomain || '')
    const serviceId = String(body.serviceId || '')
    const bookingDateRaw = String(body.bookingDate || '')
    const startTime = String(body.startTime || '')
    const customerName = String(body.customerName || '').trim()
    const customerPhoneRaw = String(body.customerPhone || '').trim()
    const customerEmail = body.customerEmail ? String(body.customerEmail).trim() : null
    const notes = sanitizeNotes(body.notes)

    if (!subdomain || !serviceId || !bookingDateRaw || !startTime || !customerName || !customerPhoneRaw) {
      return NextResponse.json({ error: 'Completa los campos obligatorios.' }, { status: 400 })
    }

    if (!isValidCustomerName(customerName)) {
      return NextResponse.json({ error: 'Ingresa un nombre válido (2-100 caracteres).' }, { status: 400 })
    }

    if (!isValidColombianPhone(customerPhoneRaw)) {
      return NextResponse.json(
        { error: 'Ingresa un celular colombiano válido (10 dígitos, inicia en 3).' },
        { status: 400 }
      )
    }

    if (!isValidEmailOptional(customerEmail)) {
      return NextResponse.json({ error: 'El correo electrónico no es válido.' }, { status: 400 })
    }

    const customerPhone = normalizeColombianPhone(customerPhoneRaw)

    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      include: { subscription: true },
    })

    if (!tenant || !canTenantAcceptBookings(tenant)) {
      return NextResponse.json({ error: 'Este negocio no está recibiendo reservas.' }, { status: 403 })
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, tenantId: tenant.id, isActive: true },
    })

    if (!service) {
      return NextResponse.json({ error: 'Servicio no válido.' }, { status: 404 })
    }

    const bookingDate = parseBookingDate(bookingDateRaw)

    if (isPastBookingDateTime(bookingDateRaw, startTime)) {
      return NextResponse.json({ error: 'No puedes reservar en el pasado.' }, { status: 400 })
    }

    const dayOfWeek = getDayOfWeekFromDateRaw(bookingDateRaw)
    const businessHour = await prisma.businessHour.findUnique({
      where: {
        tenantId_dayOfWeek: { tenantId: tenant.id, dayOfWeek },
      },
    })

    if (!businessHour || businessHour.isClosed) {
      return NextResponse.json({ error: 'El negocio está cerrado ese día.' }, { status: 400 })
    }

    const endTime = addMinutesToTime(startTime, service.durationMinutes)

    const availableSlots = getAvailableSlots({
      openTime: businessHour.openTime,
      closeTime: businessHour.closeTime,
      durationMinutes: service.durationMinutes,
      bookedSlots: [],
    })

    if (!availableSlots.includes(startTime)) {
      return NextResponse.json({ error: 'La hora seleccionada está fuera del horario disponible.' }, { status: 400 })
    }

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

    const whatsappLink = buildWhatsAppLink(
      tenant.whatsapp || tenant.phone || customerPhone,
      buildBookingCustomerMessage({
        businessName: tenant.name,
        serviceName: service.name,
        dateLabel: formatDateEs(bookingDate),
        timeLabel: formatTime(startTime),
        customerName,
      })
    )

    return NextResponse.json({ booking, whatsappLink }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'Esa hora ya no está disponible.' }, { status: 409 })
    }
    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
