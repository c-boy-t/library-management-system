/** @type {import('next').NextConfig} */
const localApiTarget = process.env.LOCAL_API_PROXY_TARGET || 'http://localhost:8080'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${localApiTarget}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
