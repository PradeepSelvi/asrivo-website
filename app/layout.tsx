import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ConditionalLayout } from '@/components/conditional-layout'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'Asrivo Tech - Engineering Digital Innovation',
  description: 'We build scalable software solutions for modern businesses. Custom software development, web & mobile apps, cloud solutions, AI & automation, and enterprise IT consulting.',
  keywords: ['software development', 'web development', 'mobile apps', 'cloud solutions', 'AI', 'automation', 'IT consulting'],
  authors: [{ name: 'Asrivo Tech' }],
  icons: {
    icon: '/asrivo.png',
  },
  openGraph: {
    title: 'Asrivo Tech - Engineering Digital Innovation',
    description: 'We build scalable software solutions for modern businesses.',
    type: 'website',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <ConditionalLayout>{children}</ConditionalLayout>
        <Analytics />
      </body>
    </html>
  )
}
