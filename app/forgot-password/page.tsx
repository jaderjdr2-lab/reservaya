'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthShell, Alert, Button, Input, Label } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })

    setLoading(false)

    if (resetError) {
      setError('No se pudo enviar el correo. Verifica el email e intenta de nuevo.')
      return
    }

    setMessage(
      'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.'
    )
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu acceso."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert message={error} />}
        {message && <Alert type="success" message={message} />}
        <div>
          <Label>Correo electrónico</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-emerald-700">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthShell>
  )
}
