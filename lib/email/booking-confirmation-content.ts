export type BookingConfirmationContentParams = {
  customerName: string
  businessName: string
  serviceName: string
  dateLabel: string
  timeLabel: string
  businessAddress?: string | null
  businessCity?: string | null
  businessWhatsapp?: string | null
  notes?: string | null
  publicUrl?: string | null
}

export function buildBookingConfirmationSubject(businessName: string): string {
  return `Reserva confirmada — ${businessName}`
}

export function buildBookingConfirmationText(params: BookingConfirmationContentParams): string {
  const lines = [
    `Hola ${params.customerName},`,
    '',
    `Tu reserva en ${params.businessName} quedó confirmada.`,
    '',
    `Servicio: ${params.serviceName}`,
    `Fecha: ${params.dateLabel}`,
    `Hora: ${params.timeLabel}`,
  ]

  if (params.notes) {
    lines.push(`Notas: ${params.notes}`)
  }

  if (params.businessAddress || params.businessCity) {
    lines.push('', 'Ubicación:')
    if (params.businessAddress) lines.push(params.businessAddress)
    if (params.businessCity) lines.push(params.businessCity)
  }

  if (params.businessWhatsapp) {
    lines.push('', `WhatsApp del negocio: ${params.businessWhatsapp}`)
  }

  if (params.publicUrl) {
    lines.push('', `Reserva tu próxima cita aquí: ${params.publicUrl}`)
  }

  lines.push('', 'Si necesitas cambiar o cancelar, contacta directamente al negocio.', '', '— RESERVAYA')

  return lines.join('\n')
}

export function buildBookingConfirmationHtml(params: BookingConfirmationContentParams): string {
  const location =
    params.businessAddress || params.businessCity
      ? `<p style="margin:0 0 8px;"><strong>Ubicación</strong><br/>${[params.businessAddress, params.businessCity]
          .filter(Boolean)
          .join('<br/>')}</p>`
      : ''

  const notes = params.notes
    ? `<p style="margin:0 0 8px;"><strong>Notas</strong><br/>${escapeHtml(params.notes)}</p>`
    : ''

  const whatsapp = params.businessWhatsapp
    ? `<p style="margin:0 0 8px;"><strong>WhatsApp del negocio</strong><br/>${escapeHtml(params.businessWhatsapp)}</p>`
    : ''

  const publicLink = params.publicUrl
    ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(params.publicUrl)}" style="color:#059669;font-weight:600;">Reserva tu próxima cita en línea</a></p>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111827;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:20px;margin:0 0 16px;">Reserva confirmada ✅</h1>
  <p style="margin:0 0 16px;">Hola ${escapeHtml(params.customerName)}, tu cita en <strong>${escapeHtml(params.businessName)}</strong> quedó confirmada.</p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 16px;">
    <p style="margin:0 0 8px;"><strong>Servicio</strong><br/>${escapeHtml(params.serviceName)}</p>
    <p style="margin:0 0 8px;"><strong>Fecha</strong><br/>${escapeHtml(params.dateLabel)}</p>
    <p style="margin:0 0 8px;"><strong>Hora</strong><br/>${escapeHtml(params.timeLabel)}</p>
    ${notes}
    ${location}
    ${whatsapp}
  </div>
  <p style="margin:0;font-size:14px;color:#4b5563;">Si necesitas cambiar o cancelar, contacta directamente al negocio.</p>
  ${publicLink}
  <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Enviado por RESERVAYA</p>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
