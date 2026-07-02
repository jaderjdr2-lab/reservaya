import prisma from './prisma'

/**
 * Legacy helper para entornos Edge donde Prisma no está disponible.
 * En producción (Vercel) las páginas usan Prisma directamente en Node runtime.
 */
export async function getTenantBySubdomain(subdomain: string) {
  if (process.env.NEXT_RUNTIME === 'edge') {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${baseUrl}/api/tenant?subdomain=${encodeURIComponent(subdomain)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch tenant')
    }
    return response.json()
  }

  return prisma.tenant.findUnique({
    where: { subdomain },
  })
}

export async function getAllTenants() {
  return prisma.tenant.findMany()
}