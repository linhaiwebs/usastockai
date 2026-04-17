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
  // ⚠️ 关键：HTML页面必须 no-store，否则 nginx 反代/CDN/浏览器会缓存旧 HTML
  // 旧 HTML 引用旧 JS chunk hash → 部署后用户看到旧版本
  // /_next/static/ 的文件名包含 content hash，可以安全地长期缓存
  async headers() {
    return [
      // HTML 页面 — 绝不缓存，确保每次都拿到最新版本
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // Next.js 数据路由 (client-side navigation) — 不缓存
      {
        source: '/_next/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      // 静态资源（含 content hash）— 可安全长期缓存
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 图片资源 — 长期缓存
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 字体 — 长期缓存
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
