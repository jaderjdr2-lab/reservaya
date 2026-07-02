import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleAuthRouteError, requireOwner } from '@/lib/tenant-access'
import { isValidBusinessHours } from '@/lib/validators'
import { getDefaultBusinessHours } from '@/lib/default-business-hours'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { tenant } = await requireOwner()

    let hours = await prisma.businessHour.findMany({
      where: { tenantId: tenant.id },
      orderBy: { dayOfWeek: 'asc' },
    })

    if (hours.length === 0) {
      const defaults = getDefaultBusinessHours()
      await prisma.businessHour.createMany({
        data: defaults.map((hour) => ({ ...hour, tenantId: tenant.id })),
      })
      hours = await prisma.businessHour.findMany({
        where: { tenantId: tenant.id },
        orderBy: { dayOfWeek: 'asc' },
      })
    }

    return NextResponse.json(hours)
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { tenant } = await requireOwner()
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
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}
