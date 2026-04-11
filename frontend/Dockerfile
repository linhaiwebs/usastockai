# 前端 Dockerfile - Next.js

# Stage 1: 依赖安装
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Stage 2: 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 接受构建参数
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_PORT
ARG NEXT_PUBLIC_DEFAULT_LOCALE

# 设置环境变量（构建时）
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_PORT=$NEXT_PUBLIC_API_PORT
ENV NEXT_PUBLIC_DEFAULT_LOCALE=$NEXT_PUBLIC_DEFAULT_LOCALE

# 构建应用
RUN npm run build

# 检查构建产物
RUN ls -la .next/ && ls -la .next/standalone/ || echo "Build output check"

# Stage 3: 运行
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public files (must exist in builder)
COPY --from=builder /app/public ./public

# Copy Next.js standalone and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 检查文件是否存在
RUN ls -la /app/ && ls -la /app/.next/ || echo "File check"

USER nextjs
EXPOSE 3000
ENV PORT=3000

# 使用 node 直接启动，添加错误处理
CMD ["sh", "-c", "node server.js 2>&1 || (echo 'Failed to start server'; cat /app/.next/standalone/server.js | head -20)"]
