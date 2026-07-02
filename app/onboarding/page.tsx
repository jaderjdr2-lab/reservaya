import { redirect } from 'next/navigation'
import { ensureUserProfile, getOwnedTenant } from '@/lib/auth'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage() {
  const profile = await ensureUserProfile()
  if (!profile) redirect('/login')

  const tenant = await getOwnedTenant(profile.id)
  if (tenant) redirect('/dashboard')

  return <OnboardingForm />
}
