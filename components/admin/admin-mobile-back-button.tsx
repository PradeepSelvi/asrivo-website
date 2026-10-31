"use client"

import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminMobileBackButton() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show on main admin dashboard
  if (pathname === '/admin') {
    return null
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs font-medium">Back</span>
      </Button>
      
      <div className="h-3.5 w-px bg-border" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/admin')}
        className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2"
      >
        <Home className="h-4 w-4" />
        <span className="text-xs font-medium">Dashboard</span>
      </Button>
    </div>
  )
}
