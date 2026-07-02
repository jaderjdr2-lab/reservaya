import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { enableGoogleOAuthInSupabase, isGoogleOAuthEnabled } from '@/lib/supabase-google-setup'

export const dynamic = 'force-dynamic'

export async function GET() {
  const enabled = await isGoogleOAuthEnabled()
  return NextResponse.json({ enabled })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rate = checkRateLimit(`setup-google:${ip}`, 5, 60_000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera un momento.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const supabaseAccessToken = String(body.supabaseAccessToken || '').trim()
    const googleClientId = String(body.googleClientId || '').trim()
    const googleClientSecret = String(body.googleClientSecret || '').trim()

    if (!supabaseAccessToken || !googleClientId || !googleClientSecret) {
      return NextResponse.json({ error: 'Completa los 3 campos.' }, { status: 400 })
    }

    if (!googleClientId.includes('.apps.googleusercontent.com')) {
      return NextResponse.json(
        { error: 'El Client ID no parece válido (debe terminar en .apps.googleusercontent.com).' },
        { status: 400 }
      )
    }

    await enableGoogleOAuthInSupabase({
      supabaseAccessToken,
      googleClientId,
      googleClientSecret,
    })

    const enabled = await isGoogleOAuthEnabled()
    return NextResponse.json({
      ok: true,
      enabled,
      message: enabled
        ? 'Gmail activado. Prueba iniciar sesión con Google.'
        : 'Configuración guardada. Si falla el login, revisa el Redirect URI en Google Cloud.',
    })
  } catch (error) {
    console.error('Setup Google OAuth error:', error)
    const message = error instanceof Error ? error.message : 'Error al configurar Google'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
