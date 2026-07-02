import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()

  if (!user) {
    redirect('/login?redirectTo=/admin')
  }

  if (!isAdminEmail(user.email)) {
    redirect('/dashboard')
  }

  return children
}
