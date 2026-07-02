import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ensureUserProfile, getOwnedTenant } from '@/lib/auth'
import { DashboardShell, Card, Alert } from '@/components/ui'
import { CopyPublicUrl } from '@/components/CopyPublicUrl'
import { getBaseUrl } from '@/lib/getBaseUrl'
import { formatCop } from '@/lib/utils'
import { MONTHLY_PRICE_COP } from '@/lib/constants'

export default async function DashboardPage() {
  const profile = await ensureUserProfile()
  if (!profile) redirect('/login')

  const tenant = await getOwnedTenant(profile.id)
  if (!tenant) redirect('/onboarding')

  const [totalBookings, upcomingBookings, subscription] = await Promise.all([
    prisma.booking.count({ where: { tenantId: tenant.id } }),
    prisma.booking.count({
      where: {
        tenantId: tenant.id,
        bookingDate: { gte: new Date(new Date().toDateString()) },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
    prisma.subscription.findUnique({ where: { tenantId: tenant.id } }),
  ])

  const publicUrl = `${getBaseUrl()}/${tenant.subdomain}`
  const subscriptionWarning =
    tenant.subscriptionStatus === 'PAST_DUE' ||
    tenant.subscriptionStatus === 'CANCELLED' ||
    tenant.subscriptionStatus === 'SUSPENDED'

  return (
    <DashboardShell title="Resumen" publicUrl={publicUrl}>
      {subscriptionWarning && (
        <Alert
          message={`Tu suscripción está en estado ${tenant.subscriptionStatus}. Contacta soporte para reactivar tu negocio.`}
        />
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Negocio</p>
          <p className="mt-2 text-xl font-semibold">{tenant.name}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Reservas totales</p>
          <p className="mt-2 text-xl font-semibold">{totalBookings}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Próximas reservas</p>
          <p className="mt-2 text-xl font-semibold">{upcomingBookings}</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-gray-500">Estado de suscripción</p>
          <p className="mt-2 text-lg font-semibold">{tenant.subscriptionStatus}</p>
          {subscription && (
            <p className="mt-2 text-sm text-gray-600">
              Plan: {formatCop(subscription.monthlyPriceCents)} / mes
            </p>
          )}
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Enlace público</p>
          <p className="mt-2 break-all text-sm text-emerald-700">{publicUrl}</p>
          <CopyPublicUrl url={publicUrl} />
        </Card>
      </div>
      <p className="mt-6 text-xs text-gray-500">
        Plan referencia: ${MONTHLY_PRICE_COP.toLocaleString('es-CO')} COP / mes
      </p>
    </DashboardShell>
  )
}
