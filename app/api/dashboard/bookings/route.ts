import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { BookingCreateError, createBooking } from '@/lib/create-booking'
import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation'
import { getBaseUrl } from '@/lib/getBaseUrl'
import { handleAuthRouteError, requireOwner } from '@/lib/tenant-access'
import { formatDateEs, formatTime } from '@/lib/utils'
import {
  buildClientBookingConfirmationMessage,
  buildWhatsAppLink,
} from '@/lib/whatsapp'
import {
  isValidColombianPhone,
  isValidCustomerName,
  isValidEmailOptional,
  normalizeColombianPhone,
  sanitizeNotes,
} from '@/lib/validators'

export const dynamic = 'force-dynamic'

function getPublicUrl(subdomain: string) {
  return `${getBaseUrl()}/${subdomain}`
}

export async function GET() {
  try {
    const { tenant } = await requireOwner()

    const bookings = await prisma.booking.findMany({
      where: { tenantId: tenant.id },
      include: { service: true },
      orderBy: [{ bookingDate: 'desc' }, { startTime: 'desc' }],
    })

    const publicUrl = getPublicUrl(tenant.subdomain)

    const enriched = bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      status: booking.status,
      service: { name: booking.service.name },
      customerWhatsappLink: buildWhatsAppLink(
        booking.customerPhone,
        buildClientBookingConfirmationMessage({
          customerName: booking.customerName,
          businessName: tenant.name,
          serviceName: booking.service.name,
          dateLabel: formatDateEs(booking.bookingDate),
          timeLabel: formatTime(booking.startTime),
          publicUrl,
        })
      ),
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenant } = await requireOwner()
    const body = await request.json()

    const serviceId = String(body.serviceId || '')
    const bookingDateRaw = String(body.bookingDate || '')
    const startTime = String(body.startTime || '')
    const customerName = String(body.customerName || '').trim()
    const customerPhoneRaw = String(body.customerPhone || '').trim()
    const customerEmail = body.customerEmail ? String(body.customerEmail).trim() : null
    const notes = sanitizeNotes(body.notes)

    if (!serviceId || !bookingDateRaw || !startTime || !customerName || !customerPhoneRaw) {
      return NextResponse.json({ error: 'Completa los campos obligatorios.' }, { status: 400 })
    }

    if (!isValidCustomerName(customerName)) {
      return NextResponse.json({ error: 'Ingresa un nombre válido (2-100 caracteres).' }, { status: 400 })
    }

    if (!isValidColombianPhone(customerPhoneRaw)) {
      return NextResponse.json(
        { error: 'WhatsApp inválido. Usa un celular colombiano de 10 dígitos.' },
        { status: 400 }
      )
    }

    if (!isValidEmailOptional(customerEmail)) {
      return NextResponse.json({ error: 'El correo electrónico no es válido.' }, { status: 400 })
    }

    const customerPhone = normalizeColombianPhone(customerPhoneRaw)

    const { booking, service, bookingDate } = await createBooking({
      tenantId: tenant.id,
      serviceId,
      bookingDateRaw,
      startTime,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    })

    const dateLabel = formatDateEs(bookingDate)
    const timeLabel = formatTime(startTime)
    const publicUrl = getPublicUrl(tenant.subdomain)

    const customerWhatsappLink = buildWhatsAppLink(
      customerPhone,
      buildClientBookingConfirmationMessage({
        customerName,
        businessName: tenant.name,
        serviceName: service.name,
        dateLabel,
        timeLabel,
        publicUrl,
      })
    )

    let emailSent = false
    if (customerEmail) {
      const emailResult = await sendBookingConfirmationEmail({
        to: customerEmail,
        customerName,
        businessName: tenant.name,
        serviceName: service.name,
        dateLabel,
        timeLabel,
        businessAddress: tenant.address,
        businessCity: tenant.city,
        businessWhatsapp: tenant.whatsapp,
        notes,
        publicUrl,
      })
      emailSent = emailResult.sent
    }

    return NextResponse.json(
      {
        booking: {
          id: booking.id,
          status: booking.status,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          service: { name: service.name },
        },
        customerWhatsappLink,
        publicUrl,
        emailSent,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof BookingCreateError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
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
