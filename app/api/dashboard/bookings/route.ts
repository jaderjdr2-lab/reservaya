import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleAuthRouteError, requireOwner } from '@/lib/tenant-access'
import { buildWhatsAppLink, buildBookingBusinessMessage } from '@/lib/whatsapp'
import { formatDateEs, formatTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { tenant } = await requireOwner()

    const bookings = await prisma.booking.findMany({
      where: { tenantId: tenant.id },
      include: { service: true },
      orderBy: [{ bookingDate: 'desc' }, { startTime: 'desc' }],
    })

    const enriched = bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      status: booking.status,
      service: { name: booking.service.name },
      whatsappLink: buildWhatsAppLink(
        booking.customerPhone,
        buildBookingBusinessMessage({
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          serviceName: booking.service.name,
          dateLabel: formatDateEs(booking.bookingDate),
          timeLabel: formatTime(booking.startTime),
        })
      ),
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { tenant } = await requireOwner()
    const body = await request.json()
    const id = String(body.id || '')
    const status = String(body.status || '')

    if (!id) {
      return NextResponse.json({ error: 'ID de reserva requerido' }, { status: 400 })
    }

    if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const existing = await prisma.booking.findFirst({ where: { id, tenantId: tenant.id } })
    if (!existing) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' },
      include: { service: true },
    })

    return NextResponse.json(booking)
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}
