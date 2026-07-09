import React from 'react'

// Strips the public site Header and Footer from all /admin/* routes
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
