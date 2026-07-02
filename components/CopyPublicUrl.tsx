'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

export function CopyPublicUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button type="button" onClick={copy} className="mt-2 text-sm">
      {copied ? 'Copiado' : 'Copiar enlace'}
    </Button>
  )
}
