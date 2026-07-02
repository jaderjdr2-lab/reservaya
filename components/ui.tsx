import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'

export function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-emerald-700">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-gray-600 hover:text-emerald-700">
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
          >
            Crear cuenta
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{subtitle}</p>
        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">{children}</div>
      </main>
    </div>
  )
}

export function DashboardShell({
  title,
  children,
  publicUrl,
}: {
  title: string
  children: React.ReactNode
  publicUrl?: string
}) {
  const links = [
    { href: '/dashboard', label: 'Resumen' },
    { href: '/dashboard/bookings', label: 'Reservas' },
    { href: '/dashboard/services', label: 'Servicios' },
    { href: '/dashboard/hours', label: 'Horarios' },
    { href: '/dashboard/settings', label: 'Configuración' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-xl font-bold text-emerald-700">
            {APP_NAME}
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="text-sm text-gray-600 hover:text-red-600">Cerrar sesión</button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border bg-white p-4 shadow-sm">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {publicUrl && (
            <div className="mt-6 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900">
              <p className="font-medium">Tu enlace público</p>
              <p className="mt-1 break-all">{publicUrl}</p>
            </div>
          )}
        </aside>
        <main>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  )
}

export function Alert({
  type = 'error',
  message,
}: {
  type?: 'error' | 'success'
  message: string
}) {
  const styles =
    type === 'success'
      ? 'border-green-200 bg-green-50 text-green-800'
      : 'border-red-200 bg-red-50 text-red-800'

  return <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>{message}</div>
}

export function Button({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${className}`}
      {...props}
    />
  )
}

export function Select({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full cursor-pointer appearance-auto rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${className}`}
      {...props}
    />
  )
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-gray-700">{children}</label>
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`rounded-xl border bg-white p-6 shadow-sm ${className}`}>{children}</div>
}
