import { NextRequest, NextResponse } from 'next/server'
import { BookingCreateError, createBooking } from '@/lib/create-booking'
import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation'
import { getBaseUrl } from '@/lib/getBaseUrl'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { formatDateEs, formatTime } from '@/lib/utils'
import { buildClientBookingConfirmationMessage, buildWhatsAppLink } from '@/lib/whatsapp'
import {
  isValidColombianPhone,
  isValidCustomerName,
  isValidEmailRequired,
  normalizeColombianPhone,
  sanitizeNotes,
} from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rate = checkRateLimit(`booking:${ip}`, 15, 60_000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espera un momento e intenta de nuevo.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 60) } }
      )
    }

    const body = await request.json()
    const subdomain = String(body.subdomain || '')
    const serviceId = String(body.serviceId || '')
    const bookingDateRaw = String(body.bookingDate || '')
    const startTime = String(body.startTime || '')
    const customerName = String(body.customerName || '').trim()
    const customerPhoneRaw = String(body.customerPhone || '').trim()
    const customerEmail = String(body.customerEmail || '').trim()
    const notes = sanitizeNotes(body.notes)

    if (
      !subdomain ||
      !serviceId ||
      !bookingDateRaw ||
      !startTime ||
      !customerName ||
      !customerPhoneRaw ||
      !customerEmail
    ) {
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

    if (!isValidEmailRequired(customerEmail)) {
      return NextResponse.json({ error: 'Ingresa un correo electrónico válido.' }, { status: 400 })
    }

    const customerPhone = normalizeColombianPhone(customerPhoneRaw)

    const { booking, tenant, service, bookingDate } = await createBooking({
      subdomain,
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
    const publicUrl = `${getBaseUrl()}/${tenant.subdomain}`

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

    return NextResponse.json(
      {
        booking: { id: booking.id, status: booking.status },
        customerWhatsappLink,
        publicUrl,
        emailSent: emailResult.sent,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof BookingCreateError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
