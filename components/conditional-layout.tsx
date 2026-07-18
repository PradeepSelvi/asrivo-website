'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if the current route is an admin route
  const isAdminRoute = pathname?.startsWith('/admin')

  // For admin routes, don't show header and footer
  if (isAdminRoute) {
    return <>{children}</>
  }

  // For public routes, show header and footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
