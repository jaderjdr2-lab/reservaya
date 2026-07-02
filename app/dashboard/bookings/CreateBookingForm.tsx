'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Input, Label, Select, Textarea } from '@/components/ui'
import { getTodayDateRawInBogota } from '@/lib/datetime'

type ServiceOption = {
  id: string
  name: string
  durationMinutes: number
}

type TenantMeta = {
  subdomain: string
  name: string
  publicUrl: string
}

type SuccessState = {
  customerName: string
  customerWhatsappLink: string
  publicUrl: string
  emailSent: boolean
  customerEmail: string
}

export default function CreateBookingForm({ onCreated }: { onCreated: () => void }) {
  const today = useMemo(() => getTodayDateRawInBogota(), [])
  const [tenant, setTenant] = useState<TenantMeta | null>(null)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [serviceId, setServiceId] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsMessage, setSlotsMessage] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<SuccessState | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/settings').then((r) => r.json()),
      fetch('/api/dashboard/services').then((r) => r.json()),
    ]).then(([settings, servicesData]) => {
      if (settings.publicUrl) setTenant(settings)
      if (Array.isArray(servicesData)) {
        const active = servicesData.filter((s: ServiceOption & { isActive?: boolean }) => s.isActive !== false)
        setServices(active)
        if (active[0]) setServiceId(active[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (!tenant?.subdomain || !serviceId || !bookingDate) {
      setSlots([])
      setStartTime('')
      setSlotsMessage('')
      return
    }

    let cancelled = false
    setSlotsLoading(true)
    setSlotsMessage('')
    setStartTime('')

    fetch(
      `/api/bookings/slots?subdomain=${encodeURIComponent(tenant.subdomain)}&serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(bookingDate)}`
    )
      .then(async (res) => {
        const data = await res.json()
        if (cancelled) return

        if (!res.ok) {
          setSlots([])
          setSlotsMessage(data.error || 'No se pudieron cargar los horarios.')
          return
        }

        const nextSlots = Array.isArray(data.slots) ? data.slots : []
        setSlots(nextSlots)
        setStartTime(nextSlots[0] || '')
        if (nextSlots.length === 0) {
          setSlotsMessage(data.message || 'No hay horarios disponibles este día.')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([])
          setSlotsMessage('Error al cargar horarios.')
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tenant?.subdomain, serviceId, bookingDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!serviceId || !bookingDate || !startTime) {
      setError('Selecciona servicio, fecha y hora.')
      return
    }

    setLoading(true)
    setError('')

    const response = await fetch('/api/dashboard/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId,
        bookingDate,
        startTime,
        customerName,
        customerPhone,
        customerEmail: customerEmail.trim() || undefined,
        notes,
      }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error || 'No se pudo crear la reserva.')
      return
    }

    setSuccess({
      customerName,
      customerWhatsappLink: data.customerWhatsappLink,
      publicUrl: data.publicUrl,
      emailSent: Boolean(data.emailSent),
      customerEmail: customerEmail.trim(),
    })

    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setNotes('')
    setBookingDate('')
    setStartTime('')
    onCreated()

    if (data.customerWhatsappLink) {
      window.open(data.customerWhatsappLink, '_blank', 'noopener,noreferrer')
    }
  }

  function resetForm() {
    setSuccess(null)
    setError('')
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <h3 className="text-lg font-semibold text-green-900">Reserva creada para {success.customerName}</h3>
        <p className="mt-2 text-sm text-green-800">
          Se abrió WhatsApp con el mensaje para el cliente. <strong>Toca Enviar</strong> en WhatsApp para
          que reciba la confirmación y el enlace para reservar la próxima vez.
        </p>
        {success.emailSent && success.customerEmail && (
          <p className="mt-2 text-sm text-green-800">
            También enviamos correo a {success.customerEmail}.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={success.customerWhatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Reenviar por WhatsApp
          </a>
          <Button type="button" onClick={resetForm}>
            Agendar otra cita
          </Button>
        </div>
        <p className="mt-3 text-xs text-green-700 break-all">Enlace del negocio: {success.publicUrl}</p>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <Alert message="Primero crea al menos un servicio activo en la sección Servicios." />
    )
  }

  const canSubmit = Boolean(serviceId && bookingDate && startTime && !loading && !slotsLoading)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Registra al cliente que llegó al negocio. Al guardar, se abre WhatsApp para enviarle la
        confirmación y el enlace donde puede reservar solo la próxima vez.
      </p>
      {error && <Alert message={error} />}

      <div>
        <Label>Servicio</Label>
        <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Fecha</Label>
          <Input
            type="date"
            value={bookingDate}
            min={today}
            onChange={(e) => setBookingDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Hora</Label>
          <Select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            disabled={!bookingDate || slotsLoading || slots.length === 0}
          >
            <option value="">
              {slotsLoading ? 'Cargando...' : slots.length === 0 ? 'Sin horarios' : 'Selecciona hora'}
            </option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
          {slotsMessage && <p className="mt-1 text-sm text-amber-700">{slotsMessage}</p>}
        </div>
      </div>

      <div>
        <Label>Nombre del cliente</Label>
        <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
      </div>

      <div>
        <Label>WhatsApp del cliente</Label>
        <Input
          type="tel"
          inputMode="numeric"
          placeholder="3001234567"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Correo (opcional)</Label>
        <Input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="cliente@correo.com"
        />
      </div>

      <div>
        <Label>Notas (opcional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} />
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {loading ? 'Guardando...' : 'Guardar y enviar WhatsApp al cliente'}
      </Button>
    </form>
  )
}
