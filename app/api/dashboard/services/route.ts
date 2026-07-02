import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ensureUserProfile, getOwnedTenant } from '@/lib/auth'
import { isValidPriceCents, isValidServiceDuration } from '@/lib/validators'

export async function GET() {
  const profile = await ensureUserProfile()
  if (!profile) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const tenant = await getOwnedTenant(profile.id)
  if (!tenant) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(services)
}

export async function POST(request: NextRequest) {
  try {
    const profile = await ensureUserProfile()
    if (!profile) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const tenant = await getOwnedTenant(profile.id)
    if (!tenant) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

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
    console.error('Create service error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const profile = await ensureUserProfile()
    if (!profile) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const tenant = await getOwnedTenant(profile.id)
    if (!tenant) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

    const body = await request.json()
    const id = String(body.id || '')

    const existing = await prisma.service.findFirst({ where: { id, tenantId: tenant.id } })
    if (!existing) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: body.name ? String(body.name).trim() : existing.name,
        description: body.description !== undefined ? String(body.description).trim() || null : existing.description,
        durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : existing.durationMinutes,
        priceCents: body.priceCents ? Math.round(Number(body.priceCents)) : existing.priceCents,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
