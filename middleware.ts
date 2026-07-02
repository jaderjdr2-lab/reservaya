import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
import { isMainHostname } from '@/lib/constants'
import { isAdminEmail } from '@/lib/admin'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding']
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const { supabase, response } = createClient(req)

  // Refresca la sesión en cada request (requerido por Supabase SSR)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname
  const url = req.nextUrl

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !user) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (AUTH_ROUTES.includes(pathname) && user) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', '/admin')
      return NextResponse.redirect(redirectUrl)
    }
    if (!isAdminEmail(user.email)) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  if (pathname.startsWith('/auth/callback')) {
    return response
  }

  let hostname = req.headers.get('host') || ''
  hostname = hostname.split(':')[0]

  if (isMainHostname(hostname)) {
    return response
  }

  const subdomain = hostname.split('.')[0]

  if (subdomain) {
    try {
      const apiUrl = new URL('/api/tenant', req.url)
      apiUrl.searchParams.set('subdomain', subdomain)
      const tenantResponse = await fetch(apiUrl.toString())

      if (tenantResponse.ok) {
        return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url))
      }
    } catch (error) {
      console.error('Middleware tenant lookup failed:', error)
    }

    return new NextResponse(null, { status: 404 })
  }

  return response
}
