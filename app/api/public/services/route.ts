import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { canTenantAcceptBookings } from '@/lib/tenant-public'

export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get('subdomain')

  if (!subdomain) {
    return NextResponse.json({ error: 'Subdominio requerido' }, { status: 400 })
  }

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: { subscription: true },
  })

  if (!tenant || !canTenantAcceptBookings(tenant)) {
    return NextResponse.json({ error: 'Negocio no disponible' }, { status: 404 })
  }

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id, isActive: true },
    select: { id: true, name: true, durationMinutes: true, priceCents: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    subdomain: tenant.subdomain,
    name: tenant.name,
    services,
  })
}
