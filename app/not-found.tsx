import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Página no encontrada</h1>
        <p className="mt-3 text-gray-600">El negocio o la página que buscas no existe.</p>
        <Link href="/" className="mt-6 inline-block text-emerald-700 hover:underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
