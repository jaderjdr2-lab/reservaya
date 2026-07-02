'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardShell, Alert, Button, Input, Label, Textarea } from '@/components/ui'
import { DEFAULT_CITY } from '@/lib/constants'

export default function OnboardingForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity] = useState(DEFAULT_CITY)
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subdomain, whatsapp, city, address, description }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'No se pudo crear el negocio.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <DashboardShell title="Configura tu negocio">
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        {error && <Alert message={error} />}
        <div>
          <Label>Nombre del negocio</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Subdominio</Label>
          <Input
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            placeholder="peluqueria-juan"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Tu página será: /{subdomain || 'tu-negocio'}
          </p>
        </div>
        <div>
          <Label>WhatsApp del negocio</Label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="3001234567" required />
        </div>
        <div>
          <Label>Ciudad</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div>
          <Label>Dirección (opcional)</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <Label>Descripción (opcional)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando negocio...' : 'Crear negocio'}
        </Button>
      </form>
    </DashboardShell>
  )
}
