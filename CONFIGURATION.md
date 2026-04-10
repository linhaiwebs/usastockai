# 配置说明文档

本文档说明了项目的配置管理方式，所有端口和URL都通过环境变量配置，避免硬编码。

## 📋 配置方式

### 1. 环境变量文件 (.env)

复制 `.env.example` 为 `.env` 并根据实际环境修改：

```bash
cp .env.example .env
```

### 2. Docker Compose 配置

Docker Compose 会自动读取 `.env` 文件中的配置，所有硬编码的端口和URL都已替换为环境变量引用。

## 🔧 配置项说明

### 必需配置

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `SILICONFLOW_API_KEY` | SiliconFlow AI API密钥 | `your_api_key_here` |
| `NEXT_PUBLIC_API_URL` | 后端API地址（浏览器访问） | `http://localhost:8000` |

### 端口配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `BACKEND_PORT` | `8000` | 后端服务端口 |
| `FRONTEND_PORT` | `3000` | 前端服务端口 |
| `DB_PORT` | `5432` | PostgreSQL数据库端口 |

### 数据库配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `DB_HOST` | `db` | 数据库主机 |
| `DB_USER` | `stockai` | 数据库用户名 |
| `DB_PASSWORD` | `stockai123` | 数据库密码 |
| `DB_NAME` | `stockai` | 数据库名称 |

### AI服务配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `SILICONFLOW_BASE_URL` | `https://api.siliconflow.cn/v1` | SiliconFlow API基础URL |
| `SILICONFLOW_MODEL` | `deepseek-ai/DeepSeek-R1-0528-Qwen3-8B` | AI模型 |

### Finance Query API配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `FINANCE_QUERY_HOST` | `https://finance-query.com` | Finance Query服务主机 |
| `FINANCE_QUERY_PORT` | `443` | Finance Query端口 |
| `FINANCE_QUERY_USE_HTTPS` | `true` | 是否使用HTTPS |

### 应用配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `DEFAULT_LOCALE` | `en` | 默认语言 (en/ja) |
| `ENVIRONMENT` | `production` | 运行环境 |
| `DEBUG` | `false` | 调试模式 |

## 🏗️ 架构说明

### 后端配置管理

后端使用 Pydantic Settings 进行配置管理：

```python
# backend/app/core/config.py
class Settings(BaseSettings):
    # 从环境变量读取配置
    DB_HOST: str = "db"
    DB_PORT: int = 5432
    
    @property
    def DATABASE_URL(self) -> str:
        # 动态构建数据库URL
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
```

**优点**：
- 所有配置通过环境变量注入
- 支持默认值
- 类型安全
- 支持属性计算（如 `DATABASE_URL`）

### 前端配置管理

前端使用统一的配置文件管理：

```typescript
// frontend/src/lib/config.ts
export function getApiBase(): string {
  const config = getConfig()
  
  // 服务器端使用内部地址
  if (typeof window === 'undefined') {
    return config.apiUrlInternal || `http://backend:${config.defaultApiPort}`
  }
  
  // 客户端使用外部地址
  return config.apiUrl || /* 智能推断 */
}
```

**优点**：
- 统一的API地址管理
- 支持服务器端和客户端不同配置
- 智能推断机制
- 避免多处硬编码

### Docker Compose 配置

所有配置都通过环境变量传递：

```yaml
services:
  backend:
    ports:
      - "${BACKEND_PORT:-8000}:${BACKEND_PORT:-8000}"
    environment:
      - PORT=${BACKEND_PORT:-8000}
      - DB_HOST=db
      - DB_PORT=${DB_PORT:-5432}
```

**优点**：
- 灵活的端口映射
- 环境变量支持默认值
- 易于部署到不同环境

## 🚀 使用示例

### 开发环境

```bash
# .env
SILICONFLOW_API_KEY=dev_key_xxx
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_PORT=8000
FRONTEND_PORT=3000
FINANCE_QUERY_HOST=http://localhost
FINANCE_QUERY_PORT=8002
FINANCE_QUERY_USE_HTTPS=false
```

### 生产环境

```bash
# .env
SILICONFLOW_API_KEY=prod_key_xxx
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
BACKEND_PORT=8000
FRONTEND_PORT=3000
FINANCE_QUERY_HOST=https://finance-query.com
FINANCE_QUERY_PORT=443
FINANCE_QUERY_USE_HTTPS=true
ENVIRONMENT=production
DEBUG=false
```

### 自定义端口部署

```bash
# 使用不同端口
BACKEND_PORT=9000
FRONTEND_PORT=8080
NEXT_PUBLIC_API_URL=http://localhost:9000
```

## ✅ 改进总结

### 已解决的硬编码问题

1. ✅ **后端数据库连接** - 从硬编码URL改为分离的配置项
2. ✅ **后端Finance Query API** - 支持主机、端口、协议分离配置
3. ✅ **前端API地址** - 统一使用配置管理器
4. ✅ **Docker Compose端口** - 全部使用环境变量
5. ✅ **Healthcheck端口** - 动态读取配置

### 配置最佳实践

- ✅ 所有敏感信息使用环境变量
- ✅ 提供合理的默认值
- ✅ 支持不同环境配置
- ✅ 配置文档清晰完整
- ✅ 避免硬编码端口和URL

## 🔍 验证配置

检查配置是否正确：

```bash
# 查看当前配置
docker-compose config

# 检查环境变量
docker-compose run backend env | grep -E "(PORT|HOST|URL)"
```
