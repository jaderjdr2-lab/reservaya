import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/cookies'
import { ensureUserProfile, getOwnedTenant } from '@/lib/auth'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const safeNext = next.startsWith('/') ? next : '/dashboard'
  const redirectPath = type === 'recovery' ? '/reset-password' : safeNext

  const supabase = createSupabaseServerClient()
  let authError: Error | null = null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) authError = error
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) authError = error
  } else {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth`)
  }

  if (authError) {
    console.error('Auth callback error:', authError)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=callback`)
  }

  const profile = await ensureUserProfile()
  let destination = redirectPath

  if (profile && type !== 'recovery') {
    const tenant = await getOwnedTenant(profile.id)
    if (!tenant && !destination.startsWith('/admin')) {
      destination = '/onboarding'
    } else if (tenant && destination === '/onboarding') {
      destination = '/dashboard'
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}${destination}`)
}
