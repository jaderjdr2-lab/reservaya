import Link from 'next/link'
import { SiteHeader } from '@/components/ui'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 prose prose-gray">
        <h1>Términos y Condiciones (borrador preliminar)</h1>
        <p className="text-sm text-gray-500">Última actualización: julio 2026</p>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm not-prose">
          Texto preliminar sujeto a revisión jurídica. Al usar RESERVAYA aceptas estos términos en
          su versión vigente.
        </p>

        <h2>1. Servicio</h2>
        <p>
          RESERVAYA es una plataforma SaaS que permite a negocios de servicios recibir reservas en
          línea. Los clientes finales pueden reservar sin crear cuenta.
        </p>

        <h2>2. Cuentas de negocio</h2>
        <p>
          El titular del negocio es responsable de la veracidad de la información publicada,
          horarios, precios y atención al cliente.
        </p>

        <h2>3. Suscripción</h2>
        <p>
          El plan mensual referencia es de $150.000 COP por negocio. La activación y cobro pueden
          gestionarse manualmente hasta integrar pasarela de pagos (Wompi).
        </p>

        <h2>4. Uso aceptable</h2>
        <p>No está permitido usar la plataforma para actividades ilegales, spam o suplantación.</p>

        <h2>5. Limitación de responsabilidad</h2>
        <p>
          RESERVAYA facilita la gestión de reservas pero no garantiza disponibilidad ininterrumpida
          ni se hace responsable por cancelaciones, retrasos o disputas entre negocio y cliente
          final, en la medida permitida por la ley.
        </p>

        <h2>6. Datos personales</h2>
        <p>
          El tratamiento de datos se describe en la{' '}
          <Link href="/privacy" className="text-emerald-700">
            Política de Privacidad
          </Link>
          .
        </p>

        <h2>7. Contacto</h2>
        <p>[Pendiente — canal de contacto del responsable]</p>

        <p className="not-prose mt-8">
          <Link href="/" className="text-emerald-700 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </main>
    </div>
  )
}
