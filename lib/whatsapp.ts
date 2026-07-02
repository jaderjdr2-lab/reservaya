export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('57') ? digits : `57${digits}`
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function buildBookingCustomerMessage(params: {
  businessName: string
  serviceName: string
  dateLabel: string
  timeLabel: string
  customerName: string
}): string {
  return `Hola, soy ${params.customerName}. Acabo de reservar ${params.serviceName} en ${params.businessName} para ${params.dateLabel} a las ${params.timeLabel}.`
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
