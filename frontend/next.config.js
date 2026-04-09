/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 禁用 x-forwarded-host 头检查，允许在 Docker 中运行
  experimental: {
    // 允许在运行时设置环境变量
    serverActions: true,
  },
}

module.exports = nextConfig
