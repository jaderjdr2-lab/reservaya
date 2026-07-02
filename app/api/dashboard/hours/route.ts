import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ensureUserProfile, getOwnedTenant } from '@/lib/auth'
import { isValidBusinessHours } from '@/lib/validators'

export async function GET() {
  const profile = await ensureUserProfile()
  if (!profile) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const tenant = await getOwnedTenant(profile.id)
  if (!tenant) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const hours = await prisma.businessHour.findMany({
    where: { tenantId: tenant.id },
    orderBy: { dayOfWeek: 'asc' },
  })

  return NextResponse.json(hours)
}

export async function PUT(request: NextRequest) {
  try {
    const profile = await ensureUserProfile()
    if (!profile) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const tenant = await getOwnedTenant(profile.id)
    if (!tenant) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

    const body = await request.json()
    const hours = Array.isArray(body.hours) ? body.hours : []

    for (const hour of hours) {
      const openTime = String(hour.openTime)
      const closeTime = String(hour.closeTime)
      const isClosed = Boolean(hour.isClosed)
      if (!isValidBusinessHours(openTime, closeTime, isClosed)) {
        return NextResponse.json(
          { error: 'Horario inválido: la hora de apertura debe ser menor que la de cierre.' },
          { status: 400 }
        )
      }
    }

    await prisma.$transaction(
      hours.map((hour: {
        dayOfWeek: number
        openTime: string
        closeTime: string
        isClosed: boolean
      }) =>
        prisma.businessHour.upsert({
          where: {
            tenantId_dayOfWeek: {
              tenantId: tenant.id,
              dayOfWeek: Number(hour.dayOfWeek),
            },
          },
          update: {
            openTime: String(hour.openTime),
            closeTime: String(hour.closeTime),
            isClosed: Boolean(hour.isClosed),
          },
          create: {
            tenantId: tenant.id,
            dayOfWeek: Number(hour.dayOfWeek),
            openTime: String(hour.openTime),
            closeTime: String(hour.closeTime),
            isClosed: Boolean(hour.isClosed),
          },
        })
      )
    )

    const updated = await prisma.businessHour.findMany({
      where: { tenantId: tenant.id },
      orderBy: { dayOfWeek: 'asc' },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update hours error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
