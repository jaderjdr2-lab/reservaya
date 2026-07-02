import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ensureUserProfile, getOwnedTenant } from '@/lib/auth'
import { MONTHLY_PRICE_CENTS, RESERVED_SUBDOMAINS } from '@/lib/constants'
import { addMonths, isValidSubdomain, normalizeSubdomain, slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const profile = await ensureUserProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
    }

    const existingTenant = await getOwnedTenant(profile.id)
    if (existingTenant) {
      return NextResponse.json({ error: 'Ya tienes un negocio registrado.' }, { status: 409 })
    }

    const body = await request.json()
    const name = String(body.name || '').trim()
    const subdomain = normalizeSubdomain(String(body.subdomain || ''))
    const whatsapp = String(body.whatsapp || '').trim()
    const city = String(body.city || 'Barrancabermeja').trim()
    const address = body.address ? String(body.address).trim() : null
    const description = body.description ? String(body.description).trim() : null

    if (!name || !subdomain || !whatsapp) {
      return NextResponse.json({ error: 'Nombre, subdominio y WhatsApp son obligatorios.' }, { status: 400 })
    }

    if (!isValidSubdomain(subdomain)) {
      return NextResponse.json(
        { error: 'El subdominio solo puede tener letras minúsculas, números y guiones.' },
        { status: 400 }
      )
    }

    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return NextResponse.json({ error: 'Ese subdominio está reservado.' }, { status: 400 })
    }

    const slug = slugify(subdomain)
    const duplicate = await prisma.tenant.findFirst({
      where: {
        OR: [{ subdomain }, { slug }],
      },
    })

    if (duplicate) {
      return NextResponse.json({ error: 'Ese subdominio ya está en uso.' }, { status: 409 })
    }

    const now = new Date()

    const tenant = await prisma.tenant.create({
      data: {
        name,
        subdomain,
        slug,
        whatsapp,
        city,
        address,
        description,
        members: {
          create: {
            userProfileId: profile.id,
            role: 'OWNER',
          },
        },
        subscription: {
          create: {
            status: 'TRIAL',
            monthlyPriceCents: MONTHLY_PRICE_CENTS,
            currentPeriodStart: now,
            currentPeriodEnd: addMonths(now, 1),
          },
        },
        businessHours: {
          create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
            dayOfWeek,
            openTime: dayOfWeek === 0 ? '00:00' : '08:00',
            closeTime: dayOfWeek === 0 ? '00:00' : '18:00',
            isClosed: dayOfWeek === 0,
          })),
        },
      },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
