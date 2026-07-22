'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function AdminMobileBack() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="lg:hidden p-2.5 rounded-lg hover:bg-muted transition-colors text-foreground"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  )
}
