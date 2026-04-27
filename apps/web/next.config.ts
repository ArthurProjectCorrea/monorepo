import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheHandler:
    process.env.NODE_ENV === 'production' ? require.resolve('./lib/cache-handler.ts') : undefined,
}

export default nextConfig
