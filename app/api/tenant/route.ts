import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get('subdomain')

  if (!subdomain) {
    return NextResponse.json({ error: 'Subdominio requerido' }, { status: 400 })
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        name: true,
        subdomain: true,
        isActive: true,
        subscriptionStatus: true,
      },
    })

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('API tenant error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
