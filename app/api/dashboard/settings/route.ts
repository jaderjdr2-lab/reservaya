import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleAuthRouteError, requireOwner } from '@/lib/tenant-access'
import { getBaseUrl } from '@/lib/getBaseUrl'
import { isValidColombianPhone } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { tenant } = await requireOwner()
    const publicUrl = `${getBaseUrl()}/${tenant.subdomain}`

    return NextResponse.json({
      subdomain: tenant.subdomain,
      name: tenant.name,
      publicUrl,
      whatsapp: tenant.whatsapp,
    })
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { tenant } = await requireOwner()

    const body = await request.json()
    const whatsapp = String(body.whatsapp || tenant.whatsapp || '').trim()

    if (whatsapp && !isValidColombianPhone(whatsapp)) {
      return NextResponse.json(
        { error: 'WhatsApp inválido. Usa un celular colombiano de 10 dígitos.' },
        { status: 400 }
      )
    }

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name: String(body.name || tenant.name).trim(),
        description: body.description ? String(body.description).trim() : null,
        logoUrl: body.logoUrl ? String(body.logoUrl).trim() : null,
        whatsapp,
        address: body.address ? String(body.address).trim() : null,
        city: String(body.city || tenant.city).trim(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    const handled = handleAuthRouteError(error)
    return NextResponse.json({ error: handled.error }, { status: handled.status })
  }
}
