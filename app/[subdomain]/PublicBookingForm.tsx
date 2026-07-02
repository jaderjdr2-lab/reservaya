'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Input, Label, Select, Textarea } from '@/components/ui'
import { getTodayDateRawInBogota } from '@/lib/datetime'

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
  const today = useMemo(() => getTodayDateRawInBogota(), [])
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
  const [confirmation, setConfirmation] = useState<{
    message: string
    customerWhatsappLink: string
    publicUrl: string
    customerEmail: string
    emailSent: boolean
  } | null>(null)

  useEffect(() => {
    if (services.length > 0 && !serviceId) {
      setServiceId(services[0].id)
    }
  }, [services, serviceId])

  useEffect(() => {
    if (!serviceId || !bookingDate) {
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
      `/api/bookings/slots?subdomain=${encodeURIComponent(tenantSubdomain)}&serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(bookingDate)}`
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
          setSlotsMessage(
            data.message ||
              'No hay horarios disponibles este día. Prueba otra fecha o revisa los horarios del negocio.'
          )
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([])
          setSlotsMessage('Error de conexión al cargar horarios. Intenta de nuevo.')
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [serviceId, bookingDate, tenantSubdomain])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!serviceId || !bookingDate || !startTime) {
      setError('Selecciona servicio, fecha y hora disponible.')
      return
    }

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
      customerWhatsappLink: data.customerWhatsappLink,
      publicUrl: data.publicUrl || '',
      customerEmail: customerEmail.trim(),
      emailSent: Boolean(data.emailSent),
    })
  }

  if (confirmation) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <h3 className="text-lg font-semibold text-green-900">{confirmation.message}</h3>
        <p className="mt-2 text-sm text-green-800">
          {confirmation.emailSent
            ? `Te enviamos la confirmación a ${confirmation.customerEmail}. Revisa tu bandeja de entrada y spam.`
            : `Guarda estos datos. No pudimos enviar el correo a ${confirmation.customerEmail} en este momento.`}
        </p>
        <p className="mt-2 text-sm text-green-800">
          Guarda este enlace para tu próxima cita:{' '}
          <span className="break-all font-medium">{confirmation.publicUrl}</span>
        </p>
        <a
          href={confirmation.customerWhatsappLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Enviarme confirmación por WhatsApp
        </a>
      </div>
    )
  }

  if (services.length === 0) {
    return <Alert message="Este negocio aún no tiene servicios activos." />
  }

  const canSubmit = Boolean(serviceId && bookingDate && startTime && !loading && !slotsLoading)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert message={error} />}

      <div>
        <Label>Servicio</Label>
        <Select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          required
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
      </div>

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
        <Label>Hora disponible</Label>
        <Select
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          disabled={!bookingDate || slotsLoading || slots.length === 0}
        >
          <option value="">
            {slotsLoading
              ? 'Cargando horarios...'
              : !bookingDate
                ? 'Primero elige una fecha'
                : 'Selecciona una hora'}
          </option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </Select>
        {slotsMessage && <p className="mt-2 text-sm text-amber-700">{slotsMessage}</p>}
      </div>

      <div>
        <Label>Nombre</Label>
        <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
      </div>

      <div>
        <Label>WhatsApp</Label>
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="3001234567"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Correo electrónico</Label>
        <Input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
        />
        <p className="mt-1 text-xs text-gray-500">Te enviaremos la confirmación de tu reserva.</p>
      </div>

      <div>
        <Label>Notas (opcional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} />
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full py-3 text-base">
        {loading ? 'Reservando...' : 'Confirmar reserva'}
      </Button>

      {!canSubmit && bookingDate && !slotsLoading && slots.length === 0 && (
        <p className="text-center text-xs text-gray-500">
          Elige otra fecha con horario disponible para confirmar.
        </p>
      )}
    </form>
  )
}
