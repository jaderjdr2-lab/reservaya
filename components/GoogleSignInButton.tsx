'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAuthCallbackPath } from '@/lib/auth-messages'
import { Button, Alert } from '@/components/ui'

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true'

export function GoogleSignInButton({
  label = 'Continuar con Google',
  next = '/dashboard',
}: {
  label?: string
  next?: string
}) {
  const [error, setError] = useState('')

  if (!GOOGLE_ENABLED) {
    return null
  }

  async function handleGoogleSignIn() {
    setError('')
    const supabase = createClient()
    const redirectTo = `${window.location.origin}${getAuthCallbackPath(next)}`

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (oauthError) {
      setError(
        'Google no está configurado todavía. Actívalo en Supabase o entra con correo y contraseña.'
      )
    }
  }

  return (
    <div>
      {error && <Alert message={error} />}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
      >
        <span className="flex items-center justify-center gap-2">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
            <path
              fill="#EA4335"
              d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.5-5.1 3.5-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.6 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.5H12z"
            />
          </svg>
          {label}
        </span>
      </Button>
    </div>
  )
}

export function AuthDivider() {
  if (!GOOGLE_ENABLED) {
    return null
  }

  return (
    <div className="my-4 flex items-center gap-3 text-xs text-gray-500">
      <div className="h-px flex-1 bg-gray-200" />
      <span>o</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  )
}
