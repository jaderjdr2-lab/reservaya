import { redirect } from 'next/navigation'
import { ensureUserProfile, getOwnedTenant } from '@/lib/auth'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const profile = await ensureUserProfile()
  if (!profile) redirect('/login')

  const tenant = await getOwnedTenant(profile.id)
  if (!tenant) redirect('/onboarding')

  return <SettingsForm tenant={tenant} />
}
