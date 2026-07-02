export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim())
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || 'RESERVAYA <onboarding@resend.dev>'
}
