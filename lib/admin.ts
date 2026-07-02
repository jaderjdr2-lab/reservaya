export function isAdminEmail(email?: string | null): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  return !!email && !!adminEmail && email.toLowerCase() === adminEmail
}
