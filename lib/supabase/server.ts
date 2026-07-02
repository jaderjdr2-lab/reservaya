import { createSupabaseServerClient } from '@/lib/supabase/cookies'

export function createClient() {
  return createSupabaseServerClient()
}
