import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const tenants = await prisma.tenant.findMany({
      include: {
        subscription: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tenants)
  } catch {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
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
    console.error('Admin update error:', error)
    return NextResponse.json({ error: 'Acceso denegado o error interno' }, { status: 403 })
  }
}
