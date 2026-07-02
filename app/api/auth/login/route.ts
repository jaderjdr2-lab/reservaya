import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/cookies'
import { ensureUserProfile } from '@/lib/auth'
import { getAuthErrorMessage } from '@/lib/auth-messages'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim()
    const password = String(body.password || '')

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña son obligatorios.' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: getAuthErrorMessage(error.message) }, { status: 401 })
    }

    if (!data.session) {
      return NextResponse.json(
        {
          error:
            'Tu cuenta existe pero aún no está activa. Confirma tu correo o usa Google para entrar.',
        },
        { status: 401 }
      )
    }

    await ensureUserProfile()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({ error: 'Error interno al iniciar sesión.' }, { status: 500 })
  }
}
