import { NextResponse } from 'next/server'
import { isWompiConfigured } from '@/lib/wompi/config'

/** Checkout Wompi — requiere credenciales. No activo hasta configurar .env */
export async function POST() {
  if (!isWompiConfigured()) {
    return NextResponse.json(
      {
        error: 'Wompi no está configurado. Contacta soporte para activar pagos.',
        configured: false,
      },
      { status: 503 }
    )
  }

  // Implementación sandbox pendiente de credenciales WOMPI_* del usuario
  return NextResponse.json(
    { error: 'Integración Wompi en desarrollo.', configured: true },
    { status: 501 }
  )
}
