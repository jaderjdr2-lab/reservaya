'use client'

import { Button } from '@/components/ui'
import { buildPublicPageShareMessage } from '@/lib/whatsapp'

export function SharePublicLinkWhatsApp({
  businessName,
  publicUrl,
}: {
  businessName: string
  publicUrl: string
}) {
  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    buildPublicPageShareMessage({ businessName, publicUrl })
  )}`

  return (
    <Button
      type="button"
      className="mt-2 w-full text-sm"
      onClick={() => window.open(shareUrl, '_blank', 'noopener,noreferrer')}
    >
      Compartir enlace de reservas por WhatsApp
    </Button>
  )
}
