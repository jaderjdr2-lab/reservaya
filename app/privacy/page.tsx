import Link from 'next/link'
import { SiteHeader } from '@/components/ui'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 prose prose-gray">
        <h1>Política de Privacidad (borrador preliminar)</h1>
        <p className="text-sm text-gray-500">Última actualización: julio 2026</p>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm not-prose">
          Este documento es un texto preliminar para revisión jurídica. No constituye asesoría legal
          ni afirma cumplimiento total de la Ley 1581 de 2012 u otras normas colombianas.
        </p>

        <h2>1. Responsable del tratamiento</h2>
        <p>
          <strong>Responsable:</strong> [Pendiente — completar por Jhon / titular legal de RESERVAYA]
        </p>
        <p>
          <strong>Contacto:</strong> [Pendiente — correo o canal de soporte]
        </p>

        <h2>2. Finalidad del tratamiento</h2>
        <p>RESERVAYA trata datos personales para:</p>
        <ul>
          <li>Gestionar reservas de citas entre negocios y clientes finales</li>
          <li>Permitir que los negocios administren servicios, horarios y reservas</li>
          <li>Comunicaciones relacionadas con la reserva (incluido WhatsApp manual)</li>
          <li>Soporte, facturación y operación del servicio SaaS</li>
        </ul>

        <h2>3. Datos que recolectamos</h2>
        <ul>
          <li>
            <strong>Clientes finales (sin cuenta):</strong> nombre, teléfono, correo opcional,
            fecha/hora de cita, servicio, notas opcionales
          </li>
          <li>
            <strong>Negocios (con cuenta):</strong> correo, nombre, datos del negocio, WhatsApp,
            dirección, ciudad
          </li>
          <li>
            <strong>Técnicos:</strong> cookies de sesión, logs básicos de uso y errores
          </li>
        </ul>

        <h2>4. WhatsApp</h2>
        <p>
          Los negocios pueden contactar clientes vía enlaces wa.me. RESERVAYA no envía mensajes
          automáticos por WhatsApp Business API en esta versión MVP.
        </p>

        <h2>5. Derechos del titular</h2>
        <p>
          Puedes solicitar acceso, corrección o eliminación escribiendo a [contacto pendiente].
        </p>

        <h2>6. Proveedores</h2>
        <p>
          Usamos Supabase (base de datos y autenticación) y Vercel (hosting). Sus políticas aplican
          al procesamiento delegado.
        </p>

        <p className="not-prose mt-8">
          <Link href="/" className="text-emerald-700 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </main>
    </div>
  )
}
