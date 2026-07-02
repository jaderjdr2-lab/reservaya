'use client'

import { useEffect, useState } from 'react'
import { DashboardShell, Alert, Button, Input, Label, Textarea, Card } from '@/components/ui'
import { formatCop } from '@/lib/utils'

type Service = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  priceCents: number
  isActive: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    durationMinutes: '60',
    priceCents: '5000000',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadServices() {
    const response = await fetch('/api/dashboard/services')
    const data = await response.json()
    if (response.ok) setServices(data)
  }

  useEffect(() => {
    loadServices()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/dashboard/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        durationMinutes: Number(form.durationMinutes),
        priceCents: Number(form.priceCents),
      }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error || 'No se pudo crear el servicio.')
      return
    }

    setForm({ name: '', description: '', durationMinutes: '60', priceCents: '5000000' })
    loadServices()
  }

  async function toggleService(service: Service) {
    await fetch('/api/dashboard/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: service.id, isActive: !service.isActive }),
    })
    loadServices()
  }

  return (
    <DashboardShell title="Servicios">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Nuevo servicio</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <Alert message={error} />}
            <div>
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Duración (minutos)</Label>
              <Input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Precio en centavos COP</Label>
              <Input
                type="number"
                value={form.priceCents}
                onChange={(e) => setForm({ ...form, priceCents: e.target.value })}
                required
              />
              <p className="mt-1 text-xs text-gray-500">Ejemplo: 5000000 = $50.000 COP</p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear servicio'}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{service.description}</p>
                  <p className="mt-2 text-sm">
                    {service.durationMinutes} min · {formatCop(service.priceCents)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {service.isActive ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <Button onClick={() => toggleService(service)}>
                  {service.isActive ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
