import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleAuthRouteError, requireOwner } from '@/lib/tenant-access'
import { isValidPriceCents, isValidServiceDuration } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { tenant } = await requireOwner()

    const services = await prisma.service.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenant } = await requireOwner()
    const body = await request.json()
    const name = String(body.name || '').trim()
    const description = body.description ? String(body.description).trim() : null
    const durationMinutes = Number(body.durationMinutes)
    const priceCents = Math.round(Number(body.priceCents))

    if (!name || !durationMinutes || !priceCents) {
      return NextResponse.json({ error: 'Completa todos los campos obligatorios.' }, { status: 400 })
    }

    if (!isValidServiceDuration(durationMinutes)) {
      return NextResponse.json({ error: 'Duración inválida (15-480 minutos).' }, { status: 400 })
    }

    if (!isValidPriceCents(priceCents)) {
      return NextResponse.json({ error: 'Precio inválido.' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        tenantId: tenant.id,
        name,
        description,
        durationMinutes,
        priceCents,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { tenant } = await requireOwner()
    const body = await request.json()
    const id = String(body.id || '')

    if (!id) {
      return NextResponse.json({ error: 'ID de servicio requerido' }, { status: 400 })
    }

    const existing = await prisma.service.findFirst({ where: { id, tenantId: tenant.id } })
    if (!existing) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

    const durationMinutes = body.durationMinutes ? Number(body.durationMinutes) : existing.durationMinutes
    const priceCents = body.priceCents ? Math.round(Number(body.priceCents)) : existing.priceCents

    if (!isValidServiceDuration(durationMinutes)) {
      return NextResponse.json({ error: 'Duración inválida (15-480 minutos).' }, { status: 400 })
    }

    if (!isValidPriceCents(priceCents)) {
      return NextResponse.json({ error: 'Precio inválido.' }, { status: 400 })
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: body.name ? String(body.name).trim() : existing.name,
        description: body.description !== undefined ? String(body.description).trim() || null : existing.description,
        durationMinutes,
        priceCents,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}
