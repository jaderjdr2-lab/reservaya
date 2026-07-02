/**
 * Activa Google OAuth en Supabase (Management API).
 *
 * Requiere:
 *   SUPABASE_ACCESS_TOKEN  → https://supabase.com/dashboard/account/tokens
 *   GOOGLE_CLIENT_ID       → Google Cloud Console OAuth client
 *   GOOGLE_CLIENT_SECRET   → Google Cloud Console OAuth client
 *
 * Uso:
 *   node --env-file=.env --import tsx scripts/setup-google-oauth.mts
 */
const PROJECT_REF = 'ofsvjygoyhmkrorkvzsa'
const token = process.env.SUPABASE_ACCESS_TOKEN
const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!token || !clientId || !clientSecret) {
  console.error(`
Faltan variables. Añade a .env:

SUPABASE_ACCESS_TOKEN=sbp_...
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

Pasos previos:
1. Google Cloud → OAuth client (Web) con redirect:
   https://${PROJECT_REF}.supabase.co/auth/v1/callback
2. Supabase → Account → Access Tokens
`)
  process.exit(1)
}

const payload = {
  external_google_enabled: true,
  external_google_client_id: clientId,
  external_google_secret: clientSecret,
}

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const body = await res.text()
if (!res.ok) {
  console.error('Error Supabase API:', res.status, body)
  process.exit(1)
}

console.log('✅ Google OAuth activado en Supabase')
console.log('   Proyecto:', PROJECT_REF)
console.log('   Client ID:', clientId.slice(0, 20) + '…')
console.log('\nPrueba: https://reservaya-swart.vercel.app/login')
