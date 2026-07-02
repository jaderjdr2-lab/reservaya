import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Usa el flujo de registro y onboarding para crear un negocio.' },
    { status: 403 }
  )
}
