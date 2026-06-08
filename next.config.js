/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Images: allow company logo domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.github.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
    ],
  },
}

module.exports = nextConfig
