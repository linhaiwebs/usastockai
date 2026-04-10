# Google Analytics 功能实现说明

## 功能概述

为后台管理系统添加了谷歌统计（Google Analytics）配置功能，支持动态注入谷歌统计代码到前端页面。

## 主要变更

### 1. 数据库变更

#### 新增表：`google_analytics`
```sql
CREATE TABLE google_analytics (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(100) NOT NULL UNIQUE,      -- 跟踪ID，如：AW-17303658824
    conversion_label VARCHAR(100),                  -- 转化标签（可选）
    is_enabled BOOLEAN DEFAULT TRUE,               -- 是否启用
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 更新表：`redirect_links`
- 新增 `name` 字段：链接名称
- 新增 `is_active` 字段：是否激活
- 重命名 `call_count` 为 `click_count`：点击计数

### 2. 后端 API 变更

#### 新增端点 (`/backend/app/api/admin.py`)

**谷歌统计管理（需要认证）：**
- `GET /api/admin/google-analytics` - 获取所有谷歌统计配置
- `POST /api/admin/google-analytics` - 创建新的谷歌统计配置
- `PUT /api/admin/google-analytics/{id}` - 更新谷歌统计配置
- `DELETE /api/admin/google-analytics/{id}` - 删除谷歌统计配置

**公开端点（无需认证）：**
- `GET /api/admin/public/google-analytics` - 获取启用的谷歌统计配置（前端使用）

### 3. 前端变更

#### 后台管理界面 (`/frontend/src/app/adsadmin/dashboard/page.tsx`)

**新增标签卡管理：**
- "Redirect Management" - 分流链接管理
- "Google Analytics" - 谷歌统计管理

**谷歌统计管理功能：**
- 添加新的谷歌统计配置
- 编辑现有配置
- 删除配置
- 启用/禁用配置

#### 谷歌统计注入组件 (`/frontend/src/components/GoogleAnalytics.tsx`)

**功能特性：**
- 自动从后端获取启用的谷歌统计配置
- 动态生成并注入谷歌统计代码
- 支持多个跟踪ID
- 支持转化跟踪（Conversion Label）
- 自动生成 `gtag_report_conversion` 函数

**注入的代码示例：**
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17303658824"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'AW-17303658824');
    gtag('config', 'G-BDPP2WPMQR');
    function gtag_report_conversion(url) {
        var callback = function () {
            if (typeof url !== 'undefined') {
                window.location = url;
            }
        };
        gtag('event', 'Add');
        gtag('event', 'conversion', {
            'send_to': 'AW-17303658824/KrXGCNHaoZQcEMjCg7tA',
            'transaction_id': '',
            'event_callback': callback
        });
        return false;
    }
</script>
```

### 4. 数据模型

#### 新增模型：`GoogleAnalytics` (`/backend/app/models/google_analytics.py`)
```python
class GoogleAnalytics(Base):
    __tablename__ = "google_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(100), nullable=False, unique=True)
    conversion_label = Column(String(100), nullable=True)
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

## 使用方法

### 1. 数据库迁移

执行迁移脚本：
```bash
psql -U stockai -d stockai -f migration_add_google_analytics.sql
```

### 2. 后台配置

1. 访问后台：`http://yourdomain.com/adsadmin`
2. 登录后台（用户名：adsadmin，密码：Mm123567..）
3. 点击"Google Analytics"标签
4. 点击"+ Add Google Analytics"添加配置

### 3. 配置示例

**示例1：Google Ads 转化跟踪**
- Tracking ID: `AW-17303658824`
- Conversion Label: `KrXGCNHaoZQcEMjCg7tA`
- Enabled: ✅

**示例2：GA4 分析**
- Tracking ID: `G-BDPP2WPMQR`
- Conversion Label: （留空）
- Enabled: ✅

**示例3：Google Ads 无转化**
- Tracking ID: `AW-123456789`
- Conversion Label: （留空）
- Enabled: ✅

### 4. 前端自动注入

配置完成后，前端页面加载时会自动：
1. 调用 `/api/admin/public/google-analytics` 获取配置
2. 动态生成谷歌统计代码
3. 注入到页面 `<head>` 中

## 支持的跟踪ID格式

- **Google Ads**: `AW-XXXXXXXXXX`
- **GA4**: `G-XXXXXXXXXX`
- **Universal Analytics**: `UA-XXXXX-X`（已废弃，但仍支持）

## 优势

1. **动态配置**：无需修改代码即可添加/删除谷歌统计
2. **多ID支持**：支持同时使用多个谷歌统计ID
3. **转化跟踪**：支持Google Ads转化跟踪
4. **启用/禁用**：可以临时禁用某个跟踪ID
5. **统一管理**：后台统一管理所有谷歌统计配置

## 注意事项

1. 转化标签（Conversion Label）仅用于Google Ads转化跟踪
2. 可以添加多个跟踪ID，它们会同时生效
3. 禁用配置后，前端将不再加载该跟踪ID
4. 删除配置是不可逆操作
5. 所有谷歌统计配置仅在前端页面生效，后台管理页面不会加载

## 文件清单

### 新增文件
- `/backend/app/models/google_analytics.py` - 谷歌统计数据模型
- `/frontend/src/components/GoogleAnalytics.tsx` - 谷歌统计注入组件
- `/frontend/src/components/ClientLayout.tsx` - 客户端布局组件
- `/migration_add_google_analytics.sql` - 数据库迁移脚本

### 修改文件
- `/backend/app/api/admin.py` - 添加谷歌统计API端点
- `/backend/app/models/redirect.py` - 更新RedirectLink模型
- `/frontend/src/app/adsadmin/dashboard/page.tsx` - 重写后台界面，添加标签卡
- `/frontend/src/app/layout.tsx` - 注入谷歌统计组件
- `/init.sql` - 更新数据库初始化脚本

## 测试建议

1. 在后台添加谷歌统计配置
2. 访问前端页面
3. 打开浏览器开发者工具
4. 查看 Network 标签，确认 gtag.js 加载成功
5. 查看 Console，确认输出 "Google Analytics loaded: [...]"
6. 使用 Google Analytics Debugger 扩展验证跟踪

## 后续优化建议

1. 添加谷歌统计配置的测试功能
2. 支持自定义事件跟踪
3. 添加统计数据的可视化展示
4. 支持导入/导出配置
5. 添加配置的历史记录
