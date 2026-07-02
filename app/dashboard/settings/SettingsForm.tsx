'use client'

import { useState } from 'react'
import { DashboardShell, Alert, Button, Input, Label, Textarea } from '@/components/ui'

type Tenant = {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  whatsapp: string | null
  address: string | null
  city: string
  subdomain: string
}

export default function SettingsForm({ tenant }: { tenant: Tenant }) {
  const [form, setForm] = useState({
    name: tenant.name,
    description: tenant.description || '',
    logoUrl: tenant.logoUrl || '',
    whatsapp: tenant.whatsapp || '',
    address: tenant.address || '',
    city: tenant.city,
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${tenant.subdomain}`
      : `/${tenant.subdomain}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const response = await fetch('/api/dashboard/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error || 'No se pudo guardar.')
      return
    }

    setMessage('Cambios guardados correctamente.')
  }

  return (
    <DashboardShell title="Configuración" publicUrl={publicUrl}>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        {error && <Alert message={error} />}
        {message && <Alert type="success" message={message} />}
        <div>
          <Label>Nombre del negocio</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Descripción</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </div>
        <div>
          <Label>URL del logo</Label>
          <Input
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          />
        </div>
        <div>
          <Label>WhatsApp</Label>
          <Input
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Dirección</Label>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div>
          <Label>Ciudad</Label>
          <Input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </DashboardShell>
  )
}
