import Link from 'next/link'
import { SiteHeader } from '@/components/ui'
import { APP_NAME, MONTHLY_PRICE_COP } from '@/lib/constants'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <section className="rounded-2xl bg-white p-10 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Barrancabermeja, Santander
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {APP_NAME}: reservas online para negocios de servicios
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Cada negocio obtiene su propia página pública para recibir citas. Tus clientes reservan
            sin crear cuenta y tú gestionas todo desde un dashboard simple.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
            >
              Crear mi negocio
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-100"
            >
              Ya tengo cuenta
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            <strong className="text-gray-700">Prueba gratis</strong> mientras validamos con negocios
            reales. Plan de referencia después: ${MONTHLY_PRICE_COP.toLocaleString('es-CO')} COP/mes
            por negocio (sin pago automático por ahora).
          </p>
        </section>
        <footer className="mt-8 flex gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-emerald-700">
            Privacidad
          </Link>
          <Link href="/terms" className="hover:text-emerald-700">
            Términos
          </Link>
        </footer>
      </main>
    </div>
  )
}
