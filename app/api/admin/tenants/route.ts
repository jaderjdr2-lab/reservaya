import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleAuthRouteError, requireAdminUser } from '@/lib/tenant-access'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdminUser()

    const tenants = await prisma.tenant.findMany({
      include: {
        subscription: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tenants)
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminUser()
    const body = await request.json()
    const tenantId = String(body.tenantId || '')

    if (!tenantId) {
      return NextResponse.json({ error: 'ID de negocio requerido' }, { status: 400 })
    }

    const existing = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!existing) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        subscriptionStatus: body.subscriptionStatus || undefined,
      },
      include: { subscription: true },
    })

    if (body.subscriptionStatus && tenant.subscription) {
      const subStatus = String(body.subscriptionStatus)
      if (['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED'].includes(subStatus)) {
        await prisma.subscription.update({
          where: { tenantId },
          data: { status: subStatus as 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' },
        })
      }
    }

    return NextResponse.json(tenant)
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}
