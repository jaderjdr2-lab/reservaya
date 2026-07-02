'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthShell, Alert, Button, Input, Label } from '@/components/ui'
import { AuthDivider, GoogleSignInButton } from '@/components/GoogleSignInButton'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const authError = searchParams.get('error')
  const resetOk = searchParams.get('reset') === 'ok'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(
    authError === 'oauth'
      ? 'No se pudo completar el acceso con Google. Verifica que Google esté activado en Supabase.'
      : authError === 'callback'
        ? 'El enlace de acceso expiró o no es válido. Intenta iniciar sesión de nuevo.'
        : ''
  )
  const [success, setSuccess] = useState(
    resetOk ? 'Contraseña actualizada. Ya puedes iniciar sesión.' : ''
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error || 'No se pudo iniciar sesión.')
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <AuthShell title="Iniciar sesión" subtitle="Accede al panel de tu negocio.">
      <GoogleSignInButton next={redirectTo} />
      <AuthDivider />
      <form onSubmit={handleSubmit} className="space-y-4">
        {success && <Alert type="success" message={success} />}
        {error && <Alert message={error} />}
        <div>
          <Label>Correo electrónico</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <Label>Contraseña</Label>
            <Link href="/forgot-password" className="text-xs text-emerald-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-medium text-emerald-700">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  )
}
