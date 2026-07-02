import {
  buildBookingConfirmationHtml,
  buildBookingConfirmationSubject,
  buildBookingConfirmationText,
  type BookingConfirmationContentParams,
} from '@/lib/email/booking-confirmation-content'
import { getEmailFrom, isEmailConfigured } from '@/lib/email/config'

export type SendBookingConfirmationInput = BookingConfirmationContentParams & {
  to: string
}

export async function sendBookingConfirmationEmail(
  input: SendBookingConfirmationInput
): Promise<{ sent: boolean; reason?: string }> {
  if (!isEmailConfigured()) {
    return { sent: false, reason: 'email_not_configured' }
  }

  const apiKey = process.env.RESEND_API_KEY!.trim()
  const subject = buildBookingConfirmationSubject(input.businessName)
  const text = buildBookingConfirmationText(input)
  const html = buildBookingConfirmationHtml(input)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getEmailFrom(),
        to: input.to,
        subject,
        text,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('Resend booking confirmation error:', res.status, body)
      return { sent: false, reason: 'provider_error' }
    }

    return { sent: true }
  } catch (error) {
    console.error('Send booking confirmation error:', error)
    return { sent: false, reason: 'send_failed' }
  }
}
