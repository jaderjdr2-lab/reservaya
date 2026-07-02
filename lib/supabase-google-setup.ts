const PROJECT_REF = 'ofsvjygoyhmkrorkvzsa'

export const SUPABASE_GOOGLE_CALLBACK = `https://${PROJECT_REF}.supabase.co/auth/v1/callback`

export async function enableGoogleOAuthInSupabase(input: {
  supabaseAccessToken: string
  googleClientId: string
  googleClientSecret: string
}) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${input.supabaseAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_google_enabled: true,
      external_google_client_id: input.googleClientId.trim(),
      external_google_secret: input.googleClientSecret.trim(),
    }),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(text || `Supabase API error ${res.status}`)
  }

  return text
}

export async function isGoogleOAuthEnabled(): Promise<boolean> {
  const res = await fetch(
    `https://${PROJECT_REF}.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fexample.com`,
    { redirect: 'manual' }
  )

  if (res.status === 400) {
    const body = await res.text()
    return !body.includes('provider is not enabled')
  }

  return res.status === 302 || res.status === 200
}
