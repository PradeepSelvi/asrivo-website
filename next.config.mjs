const getSupabaseHostname = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return 'csgbpsywrexqgvzkvkqw.supabase.co';
  try {
    return new URL(url).hostname;
  } catch {
    return 'csgbpsywrexqgvzkvkqw.supabase.co';
  }
};

const trustedSupabaseHosts = Array.from(
  new Set(['csgbpsywrexqgvzkvkqw.supabase.co', getSupabaseHostname()].filter(Boolean))
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable compression
  
  // Image optimization & SSRF hardening (CWE-918)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Block redirects completely to prevent redirect-based SSRF / DNS rebinding
    maximumRedirects: 0,
    // Ensure internal / private network IPs are forbidden
    dangerouslyAllowLocalIP: false,
    remotePatterns: [
      ...trustedSupabaseHosts.map((hostname) => ({
        protocol: 'https',
        hostname,
        pathname: '/storage/v1/object/public/**',
      })),
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // Redirects - consolidate duplicate pages
  async redirects() {
    return [
      {
        source: '/book-consult/schedule',
        destination: '/schedule',
        permanent: true, // 301 redirect
      },
    ]
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
      {
        source: '/reset-password',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer'
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ],
      },
      {
        source: '/auth/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer'
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ],
      },
    ]
  },

  // Logging (disabled in production)
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

export default nextConfig
