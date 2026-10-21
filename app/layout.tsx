import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ConditionalLayout } from '@/components/conditional-layout'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var p = window.location.pathname || '';
                  if (p === '/reset-password') return;

                  var h = window.location.hash || '';
                  var q = window.location.search || '';

                  // 1. Intercept hash fragments from Supabase recovery redirect
                  var hasAuthHash = (
                    h.indexOf('access_token=') !== -1 ||
                    h.indexOf('type=recovery') !== -1 ||
                    h.indexOf('type=invite') !== -1 ||
                    (h.indexOf('error=') !== -1 && (
                      h.indexOf('recovery') !== -1 ||
                      h.indexOf('otp') !== -1 ||
                      h.indexOf('access_denied') !== -1 ||
                      h.indexOf('token') !== -1
                    ))
                  );

                  // 2. Intercept query parameters (PKCE code, token_hash, or type=recovery)
                  var hasRecoveryQuery = (
                    q.indexOf('type=recovery') !== -1 ||
                    q.indexOf('token_hash=') !== -1 ||
                    (p === '/' && q.indexOf('code=') !== -1) ||
                    (p === '/' && q.indexOf('error=') !== -1)
                  );

                  if (hasAuthHash) {
                    window.location.replace('/reset-password' + h);
                  } else if (hasRecoveryQuery) {
                    window.location.replace('/reset-password' + q);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ConditionalLayout>{children}</ConditionalLayout>
        <Analytics />
      </body>
    </html>
  )
}
