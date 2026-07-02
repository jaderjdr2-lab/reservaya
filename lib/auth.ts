import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function getSessionUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const user = await getSessionUser()
  if (!user) return null

  return prisma.userProfile.findUnique({
    where: { supabaseUserId: user.id },
  })
}

export async function ensureUserProfile() {
  const user = await getSessionUser()
  if (!user?.email) return null

  return prisma.userProfile.upsert({
    where: { supabaseUserId: user.id },
    update: {
      email: user.email,
      fullName: user.user_metadata?.full_name ?? undefined,
    },
    create: {
      supabaseUserId: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name ?? null,
    },
  })
}

export async function getOwnedTenant(userProfileId: string) {
  const membership = await prisma.tenantMember.findFirst({
    where: { userProfileId, role: 'OWNER' },
    include: { tenant: true },
  })

  return membership?.tenant ?? null
}

export async function requireAuthProfile() {
  const profile = await ensureUserProfile()
  if (!profile) {
    throw new Error('UNAUTHORIZED')
  }
  return profile
}

export async function requireOwnedTenant(userProfileId: string) {
  const tenant = await getOwnedTenant(userProfileId)
  if (!tenant) {
    throw new Error('NO_TENANT')
  }
  return tenant
}

export function isAdminEmail(email?: string | null) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  return !!email && !!adminEmail && email.toLowerCase() === adminEmail
}

export async function requireAdmin() {
  const user = await getSessionUser()
  if (!user?.email || !isAdminEmail(user.email)) {
    throw new Error('FORBIDDEN')
  }
  return user
}
