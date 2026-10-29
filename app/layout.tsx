import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/conditional-layout'
import { AuthRecoveryInterceptor } from '@/components/auth-recovery-interceptor'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Asrivo Tech - Building Tomorrow\'s Digital Solutions',
  description: 'Innovative software development and digital transformation services',
  keywords: ['software development', 'web development', 'mobile apps', 'cloud solutions', 'AI', 'automation', 'IT consulting'],
  authors: [{ name: 'Asrivo Tech' }],
  icons: {
    icon: '/asrivo.png',
  },
  openGraph: {
    title: 'Asrivo Tech - Building Tomorrow\'s Digital Solutions',
    description: 'Innovative software development and digital transformation services',
    type: 'website',
    url: 'https://asrivotech.in',
    images: [
      {
        url: 'https://asrivotech.in/asrivo.png',
        width: 1200,
        height: 630,
        alt: 'Asrivo Tech - Digital Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asrivo Tech - Building Tomorrow\'s Digital Solutions',
    description: 'Innovative software development and digital transformation services',
    images: ['https://asrivotech.in/asrivo.png'],
  },
  generator: 'Next.js'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthRecoveryInterceptor />
        <ConditionalLayout>{children}</ConditionalLayout>
        <Analytics />
      </body>
    </html>
  )
}
