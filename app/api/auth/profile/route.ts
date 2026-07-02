import { NextResponse } from 'next/server'
import { ensureUserProfile } from '@/lib/auth'

export async function POST() {
  try {
    const profile = await ensureUserProfile()
    if (!profile) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile sync error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
