# 前端落地页重构总结

按照 DESIGN.md 中的 Wise 设计规范，对前端落地页进行了全面重构。保留了所有原有功能逻辑，仅对 UI、主题色、文案和布局进行了重构。

## 重构内容

### 1. Tailwind 配置 (`tailwind.config.ts`)

**颜色系统更新**
- 主背景色：`#ffffff` (白色，而非之前的深色 `#0A0E1A`)
- 近黑色文本：`#0e0f0c` (Near Black)
- Wise Green (主色调)：`#9fe870` - 用于按钮和强调色
- Dark Green：`#163300` - 用于按钮文本
- Light Mint：`#e2f6d5` - 用于徽章背景
- Pastel Green：`#cdffad` - 用于 hover 状态
- Positive Green：`#054d28` - 用于涨幅显示
- Danger Red：`#d03238` - 用于跌幅显示

**圆角系统**
- `rounded-card`: 16px (小卡片)
- `rounded-card-large`: 30px (大卡片)
- `rounded-card-section`: 40px (区域容器)
- `rounded-pill`: 9999px (药丸形按钮)

**阴影系统**
- 仅使用 ring shadow：`rgba(14,15,12,0.12) 0px 0px 0px 1px`
- 避免传统阴影

**字体系统**
- Inter 字体，weight 600 作为默认正文粗细
- 标题使用 weight 900 (black)，line-height 0.85 (超紧凑)

### 2. 全局样式 (`globals.css`)

- 启用 OpenType `"calt"` (contextual alternates) 特性
- 标题默认使用 weight 900, line-height 0.85
- 添加 `.btn-scale-hover` 类：hover 时 scale(1.05)，active 时 scale(0.95)
- 添加 `.wise-card`、`.wise-pill-btn` 等实用类
- 滚动条颜色更新为 Wise Green

### 3. HeroSection 组件

**之前**: 蓝色渐变标题，深色背景
**之后**: 
- 黑色粗体标题 (weight 900, line-height 0.85)
- 白色背景
- Wise Green 装饰线条
- Inter weight 600 副标题

### 4. SearchBox 组件

**之前**: 深色输入框，蓝色渐变按钮
**之后**:
- 白色输入框，浅色边框
- Wise Green pill 按钮 (圆角 9999px)
- Dark Green 按钮文本
- hover 时 scale(1.05) 动画

### 5. StockCard & StockGrid 组件

**之前**: 深色卡片，小圆角，蓝色边框
**之后**:
- 白色卡片，30px 圆角
- 浅色边框 `rgba(14,15,12,0.1)`
- hover 时显示 ring shadow
- Positive Green 显示涨幅，Danger Red 显示跌幅
- 按钮式卡片，hover 时 scale(1.05)

### 6. FeatureGrid 组件

**之前**: 深色背景卡片，小圆角
**之后**:
- 白色卡片，30px 圆角
- 浅色边框
- 更大的内边距
- 清晰的标题层级

### 7. BrandSection 组件

**之前**: 深色标签，小圆角
**之后**:
- Light Mint 背景
- Wise Green 边框
- Pill 形状标签
- Dark Green 文本

### 8. CTAButton 组件

**之前**: 蓝色渐变背景，白色文本
**之后**:
- Wise Green 背景
- Dark Green 文本
- Pill 形状
- scale(1.05) hover 动画

### 9. Footer 组件

**之前**: 深色背景，蓝色链接
**之后**:
- 白色背景
- 浅色上边框
- Dark Green hover 链接

### 10. AnalysisModal 组件

**之前**: 深色模态框，蓝色/紫色元素
**之后**:
- 白色模态框，40px 圆角
- Wise Green 加载动画
- Light Mint 思考过程区域
- Wise Green WhatsApp 按钮

## 设计原则总结

1. **颜色**: 白色背景 + Near Black 文本 + Wise Green 强调色
2. **字体**: Inter，weight 900 用于标题，weight 600 用于正文
3. **圆角**: 大圆角 (30px-40px) 用于卡片，pill (9999px) 用于按钮
4. **动画**: scale(1.05) hover，scale(0.95) active
5. **边框**: 浅色边框 `rgba(14,15,12,0.1-0.12)`
6. **阴影**: 仅使用 ring shadow，无传统阴影

## 文件修改列表

1. `/frontend/tailwind.config.ts` - Tailwind 配置
2. `/frontend/src/app/globals.css` - 全局样式
3. `/frontend/src/app/layout.tsx` - 主题色更新
4. `/frontend/src/components/HeroSection.tsx` - 英雄区组件
5. `/frontend/src/components/SearchBox.tsx` - 搜索框组件
6. `/frontend/src/components/StockCard.tsx` - 股票卡片组件
7. `/frontend/src/components/StockGrid.tsx` - 股票网格组件
8. `/frontend/src/components/FeatureGrid.tsx` - 特性网格组件
9. `/frontend/src/components/BrandSection.tsx` - 品牌区域组件
10. `/frontend/src/components/CTAButton.tsx` - CTA 按钮组件
11. `/frontend/src/components/Footer.tsx` - 页脚组件
12. `/frontend/src/components/AnalysisModal.tsx` - 分析模态框组件

## 验证

重构完成后，所有组件逻辑保持不变，仅更新了：
- UI 样式（颜色、边框、圆角、阴影）
- 主题色（从深色主题转为浅色主题）
- 文案（保持原有英文文案，仅调整字体样式）
- 布局（应用 Wise 设计系统的间距和圆角）
