import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ACTIVE_BOOKING_STATUSES, addMinutesToTime, getAvailableSlots } from '@/lib/booking'
import { isPastBookingDateTime, parseBookingDate, getDayOfWeekFromDateRaw } from '@/lib/datetime'
import { canTenantAcceptBookings } from '@/lib/tenant-public'

export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get('subdomain')
  const serviceId = request.nextUrl.searchParams.get('serviceId')
  const date = request.nextUrl.searchParams.get('date')

  if (!subdomain || !serviceId || !date) {
    return NextResponse.json({ error: 'Parámetros incompletos' }, { status: 400 })
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

  const businessHour = await prisma.businessHour.findUnique({
    where: {
      tenantId_dayOfWeek: {
        tenantId: tenant.id,
        dayOfWeek,
      },
    },
  })

  if (!businessHour || businessHour.isClosed) {
    return NextResponse.json({ slots: [] })
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
