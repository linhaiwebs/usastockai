/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // 启用压缩
  compress: true,
  
  // 优化构建
  swcMinify: true,
  
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天
  },
  
  // 实验性特性
  experimental: {
    optimizeCss: true, // 优化CSS
    optimizePackageImports: ['lucide-react'], // 优化包导入
  },
  
  // HTTP头缓存配置
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // 重定向和重写规则
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    }
  },
}

module.exports = nextConfig
