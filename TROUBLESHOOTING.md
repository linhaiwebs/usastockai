# Docker 部署故障排除指南

## 问题：前端容器启动失败（无日志）

根据您的描述，数据库和后端都正常运行，但前端容器有问题且没有日志输出。

### 🔍 诊断步骤

#### 1. 检查前端容器状态

```bash
# 查看所有容器状态
docker-compose ps

# 查看前端容器详细状态
docker inspect usastockai-frontend-1

# 查看前端容器日志（即使容器已退出）
docker logs usastockai-frontend-1

# 查看最近的容器日志
docker logs --tail 100 usastockai-frontend-1
```

#### 2. 检查构建日志

```bash
# 重新构建前端镜像并查看详细输出
docker-compose build frontend

# 或者完全重新构建
docker-compose build --no-cache frontend
```

#### 3. 手动运行前端容器调试

```bash
# 进入前端容器交互模式
docker-compose run --rm frontend sh

# 或者直接运行并查看输出
docker run --rm -it usastockai-frontend-1 sh
```

### 🐛 常见问题和解决方案

#### 问题 1: 容器立即退出

**可能原因**：
- Next.js 构建失败
- standalone 输出缺失
- 文件权限问题

**解决方案**：
```bash
# 清理并重新构建
docker-compose down -v
docker-compose build --no-cache frontend
docker-compose up
```

#### 问题 2: 构建成功但运行失败

**可能原因**：
- 缺少必要的环境变量
- Next.js 配置问题

**解决方案**：
检查 `docker-compose.yml` 中的环境变量配置：
```yaml
frontend:
  environment:
    - NEXT_PUBLIC_API_URL=http://backend:8000
```

#### 问题 3: 无日志输出

**可能原因**：
- 容器在启动脚本执行前就退出了
- 日志重定向问题

**解决方案**：
新的 Dockerfile 已添加调试输出，重新构建后会显示更多信息。

### 📝 完整的重启流程

```bash
# 1. 停止所有容器
docker-compose down

# 2. 清理旧镜像和缓存
docker system prune -a

# 3. 重新构建（不使用缓存）
docker-compose build --no-cache

# 4. 启动服务（前台运行，查看日志）
docker-compose up

# 5. 或者后台运行并查看日志
docker-compose up -d
docker-compose logs -f frontend
```

### 🔧 调试命令

#### 查看容器详细信息
```bash
# 查看容器状态
docker ps -a | grep frontend

# 查看容器退出代码
docker inspect usastockai-frontend-1 | grep -A 5 "State"

# 查看容器日志
docker logs usastockai-frontend-1 2>&1 | tail -50
```

#### 进入容器调试
```bash
# 使用 Docker Compose 进入
docker-compose exec frontend sh

# 或直接使用 Docker
docker exec -it usastockai-frontend-1 sh
```

#### 检查文件系统
```bash
# 列出容器内的文件
docker exec usastockai-frontend-1 ls -la /app/

# 检查 Next.js 构建产物
docker exec usastockai-frontend-1 ls -la /app/.next/

# 检查 standalone 文件
docker exec usastockai-frontend-1 ls -la /app/.next/standalone/
```

### 🚀 快速修复建议

1. **重新构建前端镜像**：
   ```bash
   docker-compose build --no-cache frontend
   ```

2. **查看构建输出**：
   新的 Dockerfile 会显示构建产物，检查是否有错误信息。

3. **检查容器启动日志**：
   ```bash
   docker-compose up frontend
   ```
   （前台运行，直接查看输出）

4. **验证后端 API 可访问**：
   ```bash
   curl http://localhost:8000/health
   ```

### 📊 健康检查

更新后的配置包含更详细的输出，您可以通过以下命令检查：

```bash
# 查看所有容器状态
docker-compose ps

# 查看前端容器详细信息
docker inspect usastockai-frontend-1 | grep -A 10 "State"

# 查看构建日志
docker-compose logs --tail 100 frontend
```

### 🆘 如果问题仍然存在

请提供以下信息：
1. `docker-compose ps` 的输出
2. `docker logs usastockai-frontend-1` 的输出
3. `docker-compose build frontend` 的完整输出
4. `docker inspect usastockai-frontend-1` 的输出

这些信息将帮助诊断问题的根本原因。

### ✅ 最新的修复

已推送到 GitHub 的更新包括：
- 改进的 Dockerfile，添加了调试输出
- 更好的错误处理和日志记录
- 构建产物验证
- Next.js 配置优化

请拉取最新代码并重新构建：
```bash
git pull
docker-compose build --no-cache frontend
docker-compose up
```
