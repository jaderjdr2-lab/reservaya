import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import PublicBookingForm from './PublicBookingForm'
import { formatCop } from '@/lib/utils'
import { canTenantAcceptBookings, getTenantUnavailableMessage } from '@/lib/tenant-public'

export default async function SubdomainPage({ params }: { params: { subdomain: string } }) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: params.subdomain },
    include: {
      services: { where: { isActive: true }, orderBy: { name: 'asc' } },
      subscription: true,
    },
  })

  if (!tenant) notFound()

  if (!canTenantAcceptBookings(tenant)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Página no disponible</h1>
          <p className="mt-3 text-gray-600">{getTenantUnavailableMessage()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          {tenant.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logoUrl} alt={tenant.name} className="mb-4 h-16 w-16 rounded-full object-cover" />
          )}
          <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
          {tenant.description && <p className="mt-3 text-gray-600">{tenant.description}</p>}
          <div className="mt-4 space-y-1 text-sm text-gray-500">
            {tenant.address && <p>{tenant.address}</p>}
            <p>{tenant.city}</p>
            {tenant.whatsapp && <p>WhatsApp: {tenant.whatsapp}</p>}
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Servicios disponibles</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {tenant.services.map((service) => (
              <div key={service.id} className="rounded-xl border p-4">
                <h3 className="font-semibold">{service.name}</h3>
                {service.description && <p className="mt-1 text-sm text-gray-600">{service.description}</p>}
                <p className="mt-2 text-sm">
                  {service.durationMinutes} min · {formatCop(service.priceCents)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Reservar cita</h2>
          <p className="mt-2 text-sm text-gray-600">No necesitas crear cuenta para reservar.</p>
          <div className="mt-6">
            <PublicBookingForm
              tenantSubdomain={tenant.subdomain}
              services={tenant.services.map((service) => ({
                id: service.id,
                name: service.name,
                durationMinutes: service.durationMinutes,
              }))}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
