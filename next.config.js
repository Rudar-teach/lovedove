/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14+ enables gzip/brotli compression by default for production;
  // `compress: true` is explicit for clarity and applies to dev too.
  compress: true,
  poweredByHeader: false,
  // Security headers fallback (middleware also sets stronger CSP).
  // On Netlify/Render these also come from X-Forwarded-Proto correctly.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
    // next/image auto-serves WebP/AVIF where the browser supports it
    // (used for <img> upgrades in the birthday/create pages).
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days CDN cache for optimized images
  },
  // Static assets in /public are served by the host's CDN with long-lived
  // cache headers; tell Next to version-hash them.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'gsap'],
  },
}

module.exports = nextConfig
