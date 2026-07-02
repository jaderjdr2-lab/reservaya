export function getAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de entrar. Revisa tu bandeja de entrada y spam.'
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos. Si acabas de registrarte, confirma tu correo primero.'
  }

  if (normalized.includes('user already registered')) {
    return 'Este correo ya está registrado. Inicia sesión o usa Google.'
  }

  if (normalized.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  return message || 'No se pudo completar la autenticación.'
}

export function getAuthCallbackPath(next = '/dashboard') {
  return `/auth/callback?next=${encodeURIComponent(next)}`
}
