import type { Subscription, Tenant } from '@prisma/client'

type TenantWithSubscription = Tenant & { subscription?: Subscription | null }

export function canTenantAcceptBookings(tenant: TenantWithSubscription): boolean {
  if (!tenant.isActive) return false
  if (tenant.subscriptionStatus === 'CANCELLED') return false
  if (tenant.subscriptionStatus === 'SUSPENDED') return false
  if (tenant.subscriptionStatus === 'PAST_DUE') return false
  if (tenant.subscription?.status === 'CANCELLED') return false
  if (tenant.subscription?.status === 'PAST_DUE') return false
  return true
}

export function getTenantUnavailableMessage(): string {
  return 'Este negocio no está recibiendo reservas en este momento.'
}
