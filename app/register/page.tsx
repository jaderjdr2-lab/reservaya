'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthShell, Alert, Button, Input, Label } from '@/components/ui'
import { AuthDivider, GoogleSignInButton } from '@/components/GoogleSignInButton'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error || 'No se pudo crear la cuenta.')
      return
    }

    if (data.needsEmailConfirmation) {
      setSuccess(
        data.message ||
          'Cuenta creada. Revisa tu correo, confirma el enlace y luego inicia sesión.'
      )
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <AuthShell title="Crear cuenta" subtitle="Empieza a recibir reservas para tu negocio.">
      <GoogleSignInButton label="Registrarse con Google" next="/onboarding" />
      <AuthDivider />
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert message={error} />}
        {success && <Alert type="success" message={success} />}
        <div>
          <Label>Nombre completo</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <Label>Correo electrónico</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label>Contraseña</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creando cuenta...' : 'Registrarme con correo'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-emerald-700">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  )
}
