import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/cookies'
import { ensureUserProfile } from '@/lib/auth'
import { getAuthErrorMessage } from '@/lib/auth-messages'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim()
    const password = String(body.password || '')
    const fullName = String(body.fullName || '').trim()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Completa todos los campos.' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_API_URL || ''

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      return NextResponse.json({ error: getAuthErrorMessage(error.message) }, { status: 400 })
    }

    if (data.session) {
      await ensureUserProfile()
      return NextResponse.json({ ok: true, needsEmailConfirmation: false })
    }

    return NextResponse.json({
      ok: true,
      needsEmailConfirmation: true,
      message:
        'Cuenta creada. Revisa tu correo y confirma el enlace. Luego podrás iniciar sesión.',
    })
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json({ error: 'Error interno al crear la cuenta.' }, { status: 500 })
  }
}
