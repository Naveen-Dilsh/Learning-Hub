/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
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