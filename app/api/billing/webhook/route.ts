import { NextResponse } from 'next/server'
import { isWompiConfigured } from '@/lib/wompi/config'

/** Webhook Wompi — requiere WOMPI_EVENTS_SECRET para verificar firma */
export async function POST() {
  if (!isWompiConfigured()) {
    return NextResponse.json({ error: 'Wompi no configurado' }, { status: 503 })
  }

  // Verificación de firma + actualización Subscription — pendiente credenciales
  return NextResponse.json({ received: true, processed: false }, { status: 501 })
}
