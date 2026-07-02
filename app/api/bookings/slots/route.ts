import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ACTIVE_BOOKING_STATUSES, getAvailableSlots } from '@/lib/booking'
import { canTenantAcceptBookings } from '@/lib/tenant-public'
import { getDayOfWeekFromDateRaw, isPastBookingDateTime, isValidDateRaw, parseBookingDate } from '@/lib/datetime'
import { getDefaultBusinessHours } from '@/lib/default-business-hours'

export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get('subdomain')
  const serviceId = request.nextUrl.searchParams.get('serviceId')
  const date = request.nextUrl.searchParams.get('date')

  if (!subdomain || !serviceId || !date) {
    return NextResponse.json({ error: 'Parámetros incompletos' }, { status: 400 })
  }

  if (!isValidDateRaw(date)) {
    return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 })
  }

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: { subscription: true },
  })

  if (!tenant || !canTenantAcceptBookings(tenant)) {
    return NextResponse.json({ error: 'Negocio no disponible' }, { status: 404 })
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId: tenant.id, isActive: true },
  })

  if (!service) {
    return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
  }

  const bookingDate = parseBookingDate(date)
  const dayOfWeek = getDayOfWeekFromDateRaw(date)

  let businessHour = await prisma.businessHour.findUnique({
    where: {
      tenantId_dayOfWeek: {
        tenantId: tenant.id,
        dayOfWeek,
      },
    },
  })

  if (!businessHour) {
    const hoursCount = await prisma.businessHour.count({ where: { tenantId: tenant.id } })
    if (hoursCount === 0) {
      await prisma.businessHour.createMany({
        data: getDefaultBusinessHours().map((hour) => ({ ...hour, tenantId: tenant.id })),
      })
      businessHour = await prisma.businessHour.findUnique({
        where: {
          tenantId_dayOfWeek: {
            tenantId: tenant.id,
            dayOfWeek,
          },
        },
      })
    }
  }

  if (!businessHour) {
    return NextResponse.json({
      slots: [],
      message: 'Este negocio aún no tiene horarios configurados.',
    })
  }

  if (businessHour.isClosed) {
    return NextResponse.json({
      slots: [],
      message: 'El negocio está cerrado este día. Elige otra fecha.',
    })
  }

  const bookings = await prisma.booking.findMany({
    where: {
      tenantId: tenant.id,
      bookingDate,
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
    },
    select: { startTime: true, endTime: true },
  })

  let slots = getAvailableSlots({
    openTime: businessHour.openTime,
    closeTime: businessHour.closeTime,
    durationMinutes: service.durationMinutes,
    bookedSlots: bookings,
  })

  slots = slots.filter((slot) => !isPastBookingDateTime(date, slot))

  return NextResponse.json({ slots })
}
