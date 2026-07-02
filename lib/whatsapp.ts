export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('57') ? digits : `57${digits}`
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

/** Mensaje al negocio cuando el cliente reserva solo (flujo público legacy). */
export function buildBookingCustomerMessage(params: {
  businessName: string
  serviceName: string
  dateLabel: string
  timeLabel: string
  customerName: string
}): string {
  return `Hola, soy ${params.customerName}. Acabo de reservar ${params.serviceName} en ${params.businessName} para ${params.dateLabel} a las ${params.timeLabel}.`
}

/** Confirmación al cliente + enlace para reservar la próxima vez. */
export function buildClientBookingConfirmationMessage(params: {
  customerName: string
  businessName: string
  serviceName: string
  dateLabel: string
  timeLabel: string
  publicUrl: string
}): string {
  return [
    `Hola ${params.customerName} 👋`,
    '',
    `Tu cita en *${params.businessName}* quedó confirmada:`,
    `📅 ${params.dateLabel}`,
    `🕐 ${params.timeLabel}`,
    `✂️ ${params.serviceName}`,
    '',
    `Para tu próxima cita, reserva en línea aquí:`,
    params.publicUrl,
    '',
    '¡Te esperamos!',
  ].join('\n')
}

/** Solo el enlace de reservas (compartir con clientes nuevos). */
export function buildPublicPageShareMessage(params: {
  businessName: string
  publicUrl: string
}): string {
  return [
    `Hola 👋`,
    '',
    `Reserva tu cita en *${params.businessName}* en línea, sin filas:`,
    params.publicUrl,
    '',
    'Elige servicio, fecha y hora. ¡Te esperamos!',
  ].join('\n')
}

export function buildBookingBusinessMessage(params: {
  customerName: string
  customerPhone: string
  serviceName: string
  dateLabel: string
  timeLabel: string
}): string {
  return `Hola ${params.customerName}, te escribimos desde RESERVAYA para confirmar tu cita de ${params.serviceName} el ${params.dateLabel} a las ${params.timeLabel}.`
}
