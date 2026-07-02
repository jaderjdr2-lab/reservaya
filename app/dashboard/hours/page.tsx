'use client'

import { useEffect, useState } from 'react'
import { DashboardShell, Alert, Button, Input, Label, Card } from '@/components/ui'
import { DAY_NAMES } from '@/lib/constants'

type Hour = {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
}

export default function HoursPage() {
  const [hours, setHours] = useState<Hour[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/hours')
      .then((res) => res.json())
      .then((data) => setHours(data))
  }, [])

  function updateHour(index: number, field: keyof Hour, value: string | boolean) {
    setHours((prev) => prev.map((hour, i) => (i === index ? { ...hour, [field]: value } : hour)))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const response = await fetch('/api/dashboard/hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error || 'No se pudo guardar.')
      return
    }

    setHours(data)
    setMessage('Horarios guardados correctamente.')
  }

  return (
    <DashboardShell title="Horarios">
      <form onSubmit={handleSave} className="space-y-4">
        {error && <Alert message={error} />}
        {message && <Alert type="success" message={message} />}
        {hours.map((hour, index) => (
          <Card key={hour.dayOfWeek}>
            <div className="grid gap-4 md:grid-cols-4 md:items-end">
              <div>
                <Label>Día</Label>
                <p className="mt-2 font-medium">{DAY_NAMES[hour.dayOfWeek]}</p>
              </div>
              <div>
                <Label>Apertura</Label>
                <Input
                  type="time"
                  value={hour.openTime}
                  onChange={(e) => updateHour(index, 'openTime', e.target.value)}
                  disabled={hour.isClosed}
                />
              </div>
              <div>
                <Label>Cierre</Label>
                <Input
                  type="time"
                  value={hour.closeTime}
                  onChange={(e) => updateHour(index, 'closeTime', e.target.value)}
                  disabled={hour.isClosed}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={hour.isClosed}
                  onChange={(e) => updateHour(index, 'isClosed', e.target.checked)}
                />
                Cerrado
              </label>
            </div>
          </Card>
        ))}
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar horarios'}
        </Button>
      </form>
    </DashboardShell>
  )
}
