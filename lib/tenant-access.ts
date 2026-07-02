import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

export async function requireUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    throw new AuthError('No autenticado', 401)
  }

  return user
}

export async function requireUserProfile() {
  const user = await requireUser()

  const profile = await prisma.userProfile.upsert({
    where: { supabaseUserId: user.id },
    update: {
      email: user.email!,
      fullName: user.user_metadata?.full_name ?? undefined,
    },
    create: {
      supabaseUserId: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name ?? null,
    },
  })

  return profile
}

export async function getCurrentTenantForUser(userProfileId: string) {
  const membership = await prisma.tenantMember.findFirst({
    where: { userProfileId },
    include: { tenant: { include: { subscription: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return membership
}

export async function requireTenantAccess() {
  const profile = await requireUserProfile()
  const membership = await getCurrentTenantForUser(profile.id)

  if (!membership) {
    throw new AuthError('Negocio no encontrado', 404)
  }

  return { profile, membership, tenant: membership.tenant }
}

export async function requireOwner() {
  const access = await requireTenantAccess()

  if (access.membership.role !== 'OWNER') {
    throw new AuthError('No tienes permisos para esta acción', 403)
  }

  return access
}

export async function requireAdminUser() {
  const user = await requireUser()

  if (!isAdminEmail(user.email)) {
    throw new AuthError('Acceso denegado', 403)
  }

  return user
}

export function handleAuthRouteError(error: unknown) {
  if (error instanceof AuthError) {
    return { error: error.message, status: error.status }
  }
  console.error('Auth route error:', error)
  return { error: 'Error interno del servidor', status: 500 }
}
