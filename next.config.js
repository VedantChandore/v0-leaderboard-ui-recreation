/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable static exports for Vercel
  output: 'export',
  // Optional: Add basePath if your app is not served from the root
  // basePath: '/your-base-path',
  // Optional: Configure image optimization
  images: {
    unoptimized: true, // Required for static exports
  },
  // Handle API routes properly
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
