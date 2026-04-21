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
    // optimizeCss: true, // 暂时禁用 - 需要critters依赖且不稳定
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
  
  // API 代理由 Next.js Route Handler (src/app/api/[...path]/route.ts) 处理
  // 读取 NEXT_PUBLIC_API_URL_INTERNAL / NEXT_PUBLIC_API_PORT 环境变量
  // 兼容 standalone 模式，无需 rewrite
}

module.exports = nextConfig
