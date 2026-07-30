'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useEffect, useState } from 'react'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [settings, setSettings] = useState<Record<string, string> | null>(null)
  
  // Check if the current route is an admin route
  const isAdminRoute = pathname?.startsWith('/admin')

  // Fetch settings on mount (only for public routes)
  useEffect(() => {
    if (!isAdminRoute) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSettings(data.data)
          }
        })
        .catch(err => console.error('Error fetching settings:', err))
    }
  }, [isAdminRoute])

  // For admin routes, don't show header and footer
  if (isAdminRoute) {
    return <>{children}</>
  }

  // For public routes, show header and footer
  return (
    <>
      <Header settings={settings || undefined} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
