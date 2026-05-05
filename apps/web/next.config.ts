import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  cacheHandler:
    process.env.NODE_ENV === 'production' ? require.resolve('./lib/redis.ts') : undefined,
}

export default nextConfig
