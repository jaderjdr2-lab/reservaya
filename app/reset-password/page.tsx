'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthShell, Alert, Button, Input, Label } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('No se pudo actualizar la contraseña. Solicita un nuevo enlace.')
      return
    }

    router.push('/login?reset=ok')
    router.refresh()
  }

  return (
    <AuthShell title="Nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert message={error} />}
        <div>
          <Label>Nueva contraseña</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <Label>Confirmar contraseña</Label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Guardando...' : 'Guardar contraseña'}
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
