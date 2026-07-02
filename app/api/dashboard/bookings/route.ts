import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ensureUserProfile, getOwnedTenant } from '@/lib/auth'
import { buildWhatsAppLink, buildBookingBusinessMessage } from '@/lib/whatsapp'
import { formatDateEs, formatTime } from '@/lib/utils'

export async function GET() {
  const profile = await ensureUserProfile()
  if (!profile) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const tenant = await getOwnedTenant(profile.id)
  if (!tenant) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const bookings = await prisma.booking.findMany({
    where: { tenantId: tenant.id },
    include: { service: true },
    orderBy: [{ bookingDate: 'desc' }, { startTime: 'desc' }],
  })

  const enriched = bookings.map((booking) => ({
    ...booking,
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
}

export async function PUT(request: NextRequest) {
  try {
    const profile = await ensureUserProfile()
    if (!profile) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const tenant = await getOwnedTenant(profile.id)
    if (!tenant) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

    const body = await request.json()
    const id = String(body.id || '')
    const status = String(body.status || '')

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
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
