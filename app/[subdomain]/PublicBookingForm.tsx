'use client'

import { useEffect, useState } from 'react'
import { Alert, Button, Input, Label, Textarea } from '@/components/ui'

type ServiceOption = {
  id: string
  name: string
  durationMinutes: number
}

export default function PublicBookingForm({
  tenantSubdomain,
  services,
}: {
  tenantSubdomain: string
  services: ServiceOption[]
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id || '')
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState<{
    message: string
    whatsappLink: string
  } | null>(null)

  useEffect(() => {
    if (!serviceId || !bookingDate) {
      setSlots([])
      return
    }

    fetch(`/api/bookings/slots?subdomain=${tenantSubdomain}&serviceId=${serviceId}&date=${bookingDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.slots) {
          setSlots(data.slots)
          setStartTime(data.slots[0] || '')
        }
      })
  }, [serviceId, bookingDate, tenantSubdomain])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subdomain: tenantSubdomain,
        serviceId,
        bookingDate,
        startTime,
        customerName,
        customerPhone,
        customerEmail,
        notes,
      }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error || 'No se pudo crear la reserva.')
      return
    }

    setConfirmation({
      message: 'Tu reserva fue confirmada.',
      whatsappLink: data.whatsappLink,
    })
  }

  if (confirmation) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <h3 className="text-lg font-semibold text-green-900">{confirmation.message}</h3>
        <p className="mt-2 text-sm text-green-800">
          Guarda estos datos. También puedes avisar al negocio por WhatsApp.
        </p>
        <a
          href={confirmation.whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Enviar confirmación por WhatsApp
        </a>
      </div>
    )
  }

  if (services.length === 0) {
    return <Alert message="Este negocio aún no tiene servicios activos." />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert message={error} />}
      <div>
        <Label>Servicio</Label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Fecha</Label>
        <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required />
      </div>
      <div>
        <Label>Hora disponible</Label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        >
          <option value="">Selecciona una hora</option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Nombre</Label>
        <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
      </div>
      <div>
        <Label>WhatsApp</Label>
        <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
      </div>
      <div>
        <Label>Email (opcional)</Label>
        <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
      </div>
      <div>
        <Label>Notas (opcional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} />
      </div>
      <Button type="submit" disabled={loading || !startTime}>
        {loading ? 'Reservando...' : 'Confirmar reserva'}
      </Button>
    </form>
  )
}
