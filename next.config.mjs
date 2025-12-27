/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // ✅ Add allowed external image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflarestream.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
  },

  // ✅ Enable compression and minification
  compress: true,
  swcMinify: true,
  reactStrictMode: true,

  // ✅ Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
  },

  // ✅ Headers for caching + CSP
  async headers() {
    return [
      // Cache static assets aggressively
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        ],
      },
      // CSP for all pages
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://embed.cloudflarestream.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob: https://imagedelivery.net",
              "font-src 'self' data:",
              "connect-src 'self' https://*.cloudflarestream.com https://api.cloudflare.com https://upload.imagedelivery.net https://*.r2.cloudflarestorage.com",
              "frame-src 'self' https://*.cloudflarestream.com",
              "media-src 'self' https://*.cloudflarestream.com blob:",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
