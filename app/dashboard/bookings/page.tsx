'use client'

import { useEffect, useState } from 'react'
import { DashboardShell, Alert, Button, Card } from '@/components/ui'
import { formatDateEs, formatTime } from '@/lib/utils'
import CreateBookingForm from './CreateBookingForm'

type Booking = {
  id: string
  customerName: string
  customerPhone: string
  bookingDate: string
  startTime: string
  status: string
  service: { name: string }
  customerWhatsappLink: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(true)

  async function loadBookings() {
    const response = await fetch('/api/dashboard/bookings')
    const data = await response.json()
    if (response.ok) setBookings(data)
    else setError(data.error || 'No se pudieron cargar las reservas.')
  }

  useEffect(() => {
    loadBookings()
  }, [])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/dashboard/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    loadBookings()
  }

  return (
    <DashboardShell title="Reservas">
      {error && <Alert message={error} />}

      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Nueva reserva (cliente en el negocio)</h2>
          <Button type="button" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
        {showForm && <CreateBookingForm onCreated={loadBookings} />}
      </Card>

      <div className="space-y-4">
        {bookings.length === 0 && (
          <Card>
            <p className="text-gray-600">Aún no tienes reservas.</p>
          </Card>
        )}
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold">{booking.customerName}</h3>
                <p className="text-sm text-gray-600">{booking.service.name}</p>
                <p className="mt-1 text-sm">
                  {formatDateEs(new Date(booking.bookingDate))} · {formatTime(booking.startTime)}
                </p>
                <p className="text-sm text-gray-500">WhatsApp: {booking.customerPhone}</p>
                <p className="mt-1 text-xs uppercase text-emerald-700">{booking.status}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={booking.customerWhatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Enviar enlace al cliente
                </a>
                {booking.status !== 'CONFIRMED' && (
                  <Button onClick={() => updateStatus(booking.id, 'CONFIRMED')}>Confirmar</Button>
                )}
                {booking.status !== 'CANCELLED' && (
                  <Button onClick={() => updateStatus(booking.id, 'CANCELLED')}>Cancelar</Button>
                )}
                {booking.status !== 'COMPLETED' && (
                  <Button onClick={() => updateStatus(booking.id, 'COMPLETED')}>Completar</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  )
}
