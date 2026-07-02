import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ACTIVE_BOOKING_STATUSES, getAvailableSlots, isPastBooking } from '@/lib/booking'
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

  const bookingDate = new Date(`${date}T00:00:00`)
  const dayOfWeek = bookingDate.getDay()

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

  slots = slots.filter((slot) => !isPastBooking(bookingDate, slot))

  return NextResponse.json({ slots })
}
