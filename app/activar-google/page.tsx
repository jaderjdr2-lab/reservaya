'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Alert, Button, Input, Label } from '@/components/ui'
import { SUPABASE_GOOGLE_CALLBACK } from '@/lib/supabase-google-setup'

const PROJECT_CREATE = 'https://console.cloud.google.com/projectcreate'
const SUPABASE_TOKEN = 'https://supabase.com/dashboard/account/tokens'
const CONSENT_SCREEN =
  'https://console.cloud.google.com/apis/credentials/consent'

export default function ActivarGooglePage() {
  const [step, setStep] = useState(1)
  const [projectId, setProjectId] = useState('')
  const [supabaseToken, setSupabaseToken] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  const [alreadyEnabled, setAlreadyEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/setup/google-oauth')
      .then((r) => r.json())
      .then((d) => setAlreadyEnabled(!!d.enabled))
      .catch(() => setAlreadyEnabled(null))
  }, [])

  function open(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function copyRedirect() {
    await navigator.clipboard.writeText(SUPABASE_GOOGLE_CALLBACK)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function activate() {
    setError('')
    setSuccess('')
    setLoading(true)

    const res = await fetch('/api/setup/google-oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseAccessToken: supabaseToken,
        googleClientId: clientId,
        googleClientSecret: clientSecret,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'No se pudo activar Gmail.')
      return
    }

    setSuccess(data.message || 'Listo.')
    setAlreadyEnabled(true)
    setStep(5)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm font-semibold text-emerald-700">
            ← RESERVAYA
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Activar Gmail en 5 pasos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Solo clics y copiar/pegar. Yo configuro Supabase automáticamente al final.
          </p>
          {alreadyEnabled === true && (
            <p className="mt-2 text-sm font-medium text-green-700">✅ Gmail ya parece estar activo</p>
          )}
        </div>

        <div className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
          {error && <Alert message={error} />}
          {success && <Alert type="success" message={success} />}

          {step === 1 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Paso 1 — Crear proyecto en Google</h2>
              <p className="text-sm text-gray-600">
                Importante: crea un proyecto <strong>nuevo</strong>. No uses &quot;reservaya&quot; si te
                sale error de permisos.
              </p>
              <Button type="button" className="w-full" onClick={() => open(PROJECT_CREATE)}>
                Abrir Google Cloud → Crear proyecto
              </Button>
              <p className="text-xs text-gray-500">
                Nombre sugerido: <strong>reservaya-app</strong> → Crear → espera 30 segundos.
              </p>
              <Button type="button" className="w-full" onClick={() => setStep(2)}>
                Ya creé el proyecto → Siguiente
              </Button>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Paso 2 — Pantalla de consentimiento (solo 1 vez)</h2>
              <Button type="button" className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => open(CONSENT_SCREEN)}>
                Abrir pantalla de consentimiento OAuth
              </Button>
              <p className="text-xs text-gray-500">
                Externo → nombre RESERVAYA → email jaderjdr2@gmail.com → Guardar.
              </p>
              <div>
                <Label>ID del proyecto Google (arriba en la consola)</Label>
                <Input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value.trim())}
                  placeholder="ej: reservaya-app-123456"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" className="bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button type="button" className="flex-1" disabled={!projectId} onClick={() => setStep(3)}>
                  Siguiente
                </Button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Paso 3 — Crear credenciales OAuth</h2>
              <Button
                type="button"
                className="w-full"
                onClick={() =>
                  open(
                    `https://console.cloud.google.com/apis/credentials/oauthclient?project=${encodeURIComponent(projectId)}`
                  )
                }
              >
                Abrir crear credenciales OAuth
              </Button>
              <p className="text-sm text-gray-600">
                Tipo: <strong>Aplicación web</strong>
              </p>
              <div className="rounded-lg border bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-700">Redirect URI (copia esto):</p>
                <p className="mt-1 break-all font-mono text-xs">{SUPABASE_GOOGLE_CALLBACK}</p>
                <Button type="button" className="mt-2 w-full bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={copyRedirect}>
                  {copied ? '¡Copiado!' : 'Copiar Redirect URI'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Crear → copia Client ID y Secret para el paso 4.</p>
              <div className="flex gap-2">
                <Button type="button" className="bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => setStep(2)}>
                  Atrás
                </Button>
                <Button type="button" className="flex-1" onClick={() => setStep(4)}>
                  Ya tengo Client ID y Secret →
                </Button>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Paso 4 — Pegar aquí (yo activo Supabase)</h2>
              <Button type="button" className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => open(SUPABASE_TOKEN)}>
                Abrir token de Supabase (copiar sbp_…)
              </Button>
              <div>
                <Label>Token Supabase (sbp_…)</Label>
                <Input
                  value={supabaseToken}
                  onChange={(e) => setSupabaseToken(e.target.value.trim())}
                  placeholder="sbp_..."
                />
              </div>
              <div>
                <Label>Google Client ID</Label>
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value.trim())}
                  placeholder="....apps.googleusercontent.com"
                />
              </div>
              <div>
                <Label>Google Client Secret</Label>
                <Input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value.trim())}
                  placeholder="GOCSPX-..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" className="bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => setStep(3)}>
                  Atrás
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={loading || !supabaseToken || !clientId || !clientSecret}
                  onClick={activate}
                >
                  {loading ? 'Activando…' : 'ACTIVAR GMAIL AHORA'}
                </Button>
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-4 text-center">
              <h2 className="text-lg font-semibold text-green-800">¡Gmail activado!</h2>
              <p className="text-sm text-gray-600">Prueba iniciar sesión con tu cuenta de Google.</p>
              <Link href="/login">
                <Button type="button" className="w-full">
                  Ir a login con Google
                </Button>
              </Link>
              <Link href="/register">
                <Button type="button" className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Ir a registro con Google
                </Button>
              </Link>
            </section>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Paso {Math.min(step, 4)} de 4 · Los tokens no se guardan en la app
        </p>
      </div>
    </div>
  )
}
