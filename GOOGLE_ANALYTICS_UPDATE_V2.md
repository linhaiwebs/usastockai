# Google Analytics 功能更新说明

## 更新内容

根据需求，重新设计了谷歌统计配置，改为三个独立的输入框：

### 1. 数据库结构更新

**新的表结构：**
```sql
CREATE TABLE google_analytics (
    id SERIAL PRIMARY KEY,
    ads_tracking_id VARCHAR(100),              -- Google Ads 转化跟踪 ID (如: AW-17303658824)
    ga4_property_id VARCHAR(100),              -- GA4 媒体资源 ID (如: G-BDPP2WPMQR)
    conversion_id VARCHAR(200),                -- 完整的转化ID (如: AW-17303658824/KrXGCNHaoZQcEMjCg7tA)
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 三个独立的配置字段

1. **Google Ads Tracking ID** (`ads_tracking_id`)
   - 格式：`AW-17303658824`
   - 用途：Google Ads 转化跟踪

2. **GA4 Property ID** (`ga4_property_id`)
   - 格式：`G-BDPP2WPMQR`
   - 用途：Google Analytics 4 媒体资源

3. **Conversion ID** (`conversion_id`)
   - 格式：`AW-17303658824/KrXGCNHaoZQcEMjCg7tA`
   - 用途：用于 `gtag_report_conversion(url)` 函数

### 3. 前端注入代码生成

配置完成后，前端会自动生成以下代码：

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

### 4. "Start AI Diagnosis" 按钮事件

需要在前端的 "Start AI Diagnosis" 按钮点击时添加：

```javascript
// 在按钮点击事件中添加
if (typeof gtag === 'function') {
    gtag('event', 'Bdd');
}
```

## 文件更新清单

### 后端文件
- ✅ `backend/app/models/google_analytics.py` - 更新数据模型
- ✅ `backend/app/api/admin.py` - 更新API端点
- ✅ `init.sql` - 更新数据库初始化脚本
- ✅ `migration_google_analytics_v2.sql` - 创建迁移脚本

### 前端文件
- ✅ `frontend/src/components/GoogleAnalytics.tsx` - 更新注入逻辑
- ⏳ `frontend/src/app/adsadmin/dashboard/page.tsx` - 需要更新表单界面
- ⏳ `frontend/src/components/SearchBox.tsx` - 需要添加 gtag 事件

## 迁移步骤

### 对于新部署
直接使用新的 `init.sql` 初始化数据库。

### 对于现有部署
执行迁移脚本：

```bash
docker exec -i stockai-db-1 psql -U stockai -d stockai < migration_google_analytics_v2.sql
```

## 下一步工作

1. 更新前端dashboard页面的表单界面
2. 在SearchBox组件中添加 "Start AI Diagnosis" 按钮的 gtag 事件
3. 测试完整的谷歌统计功能

## 使用示例

配置示例：
- Google Ads Tracking ID: `AW-17303658824`
- GA4 Property ID: `G-BDPP2WPMQR`
- Conversion ID: `AW-17303658824/KrXGCNHaoZQcEMjCg7tA`
- Enabled: ✅

保存后，前端页面会自动加载谷歌统计代码。
