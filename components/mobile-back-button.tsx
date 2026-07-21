"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileBackButton() {
  const router = useRouter()

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground rounded-none h-14 px-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base font-medium">Back</span>
      </Button>
    </div>
  )
}
