'use client'

import { useEffect, useState } from 'react'
import { Alert, Button, Card } from '@/components/ui'
import { MONTHLY_PRICE_COP } from '@/lib/constants'

type TenantRow = {
  id: string
  name: string
  subdomain: string
  city: string
  isActive: boolean
  subscriptionStatus: string
  createdAt: string
  _count: { bookings: number }
}

export default function AdminPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [error, setError] = useState('')

  async function loadTenants() {
    const response = await fetch('/api/admin/tenants')
    const data = await response.json()
    if (!response.ok) {
      setError(data.error || 'Acceso denegado.')
      return
    }
    setTenants(data)
  }

  useEffect(() => {
    loadTenants()
  }, [])

  async function updateTenant(tenantId: string, payload: Record<string, unknown>, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return

    const response = await fetch('/api/admin/tenants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, ...payload }),
    })

    if (!response.ok) {
      const data = await response.json()
      setError(data.error || 'No se pudo actualizar el negocio.')
      return
    }

    loadTenants()
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">Panel administrador</h1>
        <p className="mt-2 text-gray-600">
          Gestión manual de negocios y suscripciones. Plan: $
          {MONTHLY_PRICE_COP.toLocaleString('es-CO')} COP / mes.
        </p>
        {error && (
          <div className="mt-6">
            <Alert message={error} />
          </div>
        )}
        <div className="mt-8 space-y-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{tenant.name}</h2>
                  <p className="text-sm text-gray-600">
                    {tenant.subdomain} · {tenant.city}
                  </p>
                  <p className="mt-1 text-sm">Reservas: {tenant._count.bookings}</p>
                  <p className="text-sm">
                    Estado: {tenant.isActive ? 'Activo' : 'Suspendido'} · Suscripción:{' '}
                    {tenant.subscriptionStatus}
                  </p>
                  <p className="text-xs text-gray-500">
                    Creado: {new Date(tenant.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      updateTenant(
                        tenant.id,
                        { isActive: !tenant.isActive },
                        tenant.isActive
                          ? `¿Suspender "${tenant.name}"? No podrá recibir reservas.`
                          : `¿Activar "${tenant.name}"?`
                      )
                    }
                  >
                    {tenant.isActive ? 'Suspender' : 'Activar'}
                  </Button>
                  <Button
                    onClick={() =>
                      updateTenant(
                        tenant.id,
                        { subscriptionStatus: 'ACTIVE' },
                        `¿Marcar suscripción ACTIVE para "${tenant.name}"?`
                      )
                    }
                  >
                    Marcar ACTIVE
                  </Button>
                  <Button
                    onClick={() =>
                      updateTenant(
                        tenant.id,
                        { subscriptionStatus: 'PAST_DUE' },
                        `¿Marcar PAST_DUE para "${tenant.name}"? Bloqueará reservas públicas.`
                      )
                    }
                  >
                    Marcar PAST_DUE
                  </Button>
                  <Button
                    onClick={() =>
                      updateTenant(
                        tenant.id,
                        { subscriptionStatus: 'CANCELLED' },
                        `¿Marcar CANCELLED para "${tenant.name}"? Bloqueará reservas públicas.`
                      )
                    }
                  >
                    Marcar CANCELLED
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
