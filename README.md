# 视频素材搜索平台

一个基于 Next.js 的中文视频、图片、音乐素材搜索平台，支持智能中英文翻译，集成 Pixabay API，提供高质量免费素材搜索服务。

![平台预览](https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&crop=center)

## ✨ 核心功能

### 🔍 智能搜索
- **中文搜索**: 支持中文关键词输入，自动翻译为英文
- **多类型搜索**: 视频、图片、音乐素材一站式搜索
- **实时建议**: 搜索框智能提示和历史记录
- **高级筛选**: 按类型、质量、时长等条件筛选

### 🌐 免费翻译系统
- **多层翻译策略**: 内置词典 + 免费API + 智能备用
- **3000+ 词汇库**: 覆盖商业、自然、科技、生活等领域
- **自动降级**: API失败时智能切换翻译服务
- **结果缓存**: 提高翻译速度和准确性

### 📱 用户体验
- **响应式设计**: 完美适配桌面端和移动端
- **瀑布流布局**: 优雅的搜索结果展示
- **收藏功能**: 登录用户可收藏喜欢的素材
- **搜索历史**: 本地存储和云端同步

### 🎯 素材展示
- **高质量预览**: 真实图片预览和视频缩略图
- **详细信息**: 显示浏览量、下载量、作者信息
- **标签系统**: 英文原始标签保持专业性
- **一键下载**: 直接跳转到 Pixabay 下载页面

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
\`\`\`bash
git clone https://github.com/your-username/video-search-platform.git
cd video-search-platform
\`\`\`

2. **安装依赖**
\`\`\`bash
npm install
# 或
yarn install
\`\`\`

3. **配置环境变量**
\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 \`.env.local\` 文件：
\`\`\`env
# Pixabay API Key (必需)
PIXABAY_API_KEY=your-pixabay-api-key

# 微软翻译API (可选)
MICROSOFT_TRANSLATOR_KEY=your-microsoft-translator-key
MICROSOFT_TRANSLATOR_REGION=your-region
\`\`\`

4. **启动开发服务器**
\`\`\`bash
npm run dev
# 或
yarn dev
\`\`\`

5. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🔧 配置指南

### Pixabay API 配置

1. 访问 [Pixabay API 文档](https://pixabay.com/api/docs/)
2. 注册账号并获取免费 API 密钥
3. 将密钥添加到环境变量中
4. 访问 \`/config\` 页面验证配置

**API 限制**:
- 免费账户: 每小时 100 次请求
- 需要缓存 24 小时
- 不允许批量下载

### 翻译服务配置

平台支持多种免费翻译服务，无需额外配置：

- **内置词典**: 3000+ 常用词汇映射
- **Google 翻译**: 免费 API 接口
- **LibreTranslate**: 开源翻译服务
- **MyMemory**: 免费翻译 API

访问 \`/translation\` 页面测试翻译功能。

## 📁 项目结构

\`\`\`
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── search/        # 搜索 API
│   │   └── translate/     # 翻译 API
│   ├── config/            # 配置页面
│   ├── favorites/         # 收藏页面
│   ├── login/             # 登录页面
│   ├── search/            # 搜索结果页面
│   ├── translation/       # 翻译测试页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   ├── api-status.tsx    # API 状态组件
│   ├── config-banner.tsx # 配置横幅
│   ├── popular-content.tsx # 热门内容
│   ├── search-interface.tsx # 搜索界面
│   ├── search-results.tsx # 搜索结果
│   └── translation-status.tsx # 翻译状态
├── lib/                   # 工具函数
│   ├── api-utils.ts      # API 工具
│   └── utils.ts          # 通用工具
└── public/               # 静态资源
\`\`\`

## 🎨 技术栈

### 前端框架
- **Next.js 15**: React 全栈框架
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 实用优先的 CSS 框架
- **shadcn/ui**: 现代化 UI 组件库

### 状态管理
- **React Hooks**: 组件状态管理
- **localStorage**: 本地数据存储
- **Server Components**: 服务端渲染

### API 集成
- **Pixabay API**: 素材数据源
- **多种翻译 API**: 免费翻译服务
- **Next.js API Routes**: 后端 API 接口

## 🌟 功能特色

### 智能翻译系统
\`\`\`typescript
// 翻译优先级策略
1. 内置词典查找 (最快最准确)
2. Google 翻译 API
3. LibreTranslate 开源服务
4. MyMemory 免费 API
5. 本地智能翻译 (备用)
\`\`\`

### 搜索功能
- 支持中文关键词搜索
- 自动翻译为英文查询 Pixabay
- 智能搜索建议
- 搜索历史记录
- 分页浏览结果

### 用户系统
- 用户注册/登录
- 素材收藏功能
- 搜索历史同步
- 个人设置管理

## 📊 API 文档

### 搜索 API
\`\`\`
GET /api/search?q={query}&type={type}&page={page}
\`\`\`

**参数**:
- \`q\`: 搜索关键词 (必需)
- \`type\`: 素材类型 (all/photos/videos)
- \`page\`: 页码 (默认: 1)

**响应**:
\`\`\`json
{
  "query": "商业会议",
  "translatedQuery": "business meeting",
  "totalHits": 1247,
  "hits": [...],
  "usingMockData": false
}
\`\`\`

### 翻译 API
\`\`\`
POST /api/translate
Content-Type: application/json

{
  "text": "商业会议"
}
\`\`\`

**响应**:
\`\`\`json
{
  "translatedText": "business meeting",
  "source": "manual"
}
\`\`\`

## 🚀 部署指南

### Vercel 部署 (推荐)

1. **连接 GitHub**
\`\`\`bash
# 推送代码到 GitHub
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. **导入到 Vercel**
- 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- 点击 "New Project"
- 导入 GitHub 仓库

3. **配置环境变量**
在 Vercel 项目设置中添加：
\`\`\`
PIXABAY_API_KEY=your-pixabay-api-key
MICROSOFT_TRANSLATOR_KEY=your-translator-key (可选)
\`\`\`

4. **部署完成**
Vercel 会自动构建和部署应用

### 其他部署平台

**Netlify**:
\`\`\`bash
npm run build
npm run export
\`\`\`

**Docker**:
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## 🔧 开发指南

### 本地开发
\`\`\`bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 构建生产版本
npm run build
\`\`\`

### 添加新的翻译词汇
编辑 \`app/api/translate/route.ts\` 中的 \`manualTranslations\` 对象：

\`\`\`typescript
const manualTranslations: Record<string, string> = {
  // 添加新的词汇映射
  "新词汇": "new vocabulary",
  // ...
}
\`\`\`

### 自定义 UI 组件
使用 shadcn/ui 添加新组件：

\`\`\`bash
npx shadcn@latest add button
npx shadcn@latest add card
\`\`\`

## 🐛 常见问题

### Q: API 密钥配置后仍显示演示数据？
A: 请检查：
1. 环境变量名称是否正确 (\`PIXABAY_API_KEY\`)
2. 重启开发服务器
3. 访问 \`/config\` 页面验证配置

### Q: 翻译不准确怎么办？
A: 可以：
1. 访问 \`/translation\` 页面测试翻译
2. 在代码中添加自定义词汇映射
3. 检查翻译服务状态

### Q: 搜索结果为空？
A: 请确认：
1. Pixabay API 密钥有效
2. 网络连接正常
3. 搜索关键词不为空

### Q: 图片加载失败？
A: 这可能是因为：
1. 网络连接问题
2. 图片 URL 过期
3. CORS 限制

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 开启 Pull Request

### 开发规范
- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 规范
- 编写清晰的提交信息
- 添加必要的测试用例

## 📞 支持与反馈

- **问题报告**: [GitHub Issues](https://github.com/your-username/video-search-platform/issues)
- **功能请求**: [GitHub Discussions](https://github.com/your-username/video-search-platform/discussions)
- **邮件联系**: your-email@example.com

## 🙏 致谢

- [Pixabay](https://pixabay.com/) - 提供高质量免费素材
- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 优秀的 CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - 现代化 UI 组件
- [Unsplash](https://unsplash.com/) - 演示图片来源

## 📈 更新日志

### v1.0.0 (2024-01-20)
- ✨ 初始版本发布
- 🔍 中文搜索功能
- 🌐 多层翻译系统
- 📱 响应式设计
- 🎯 Pixabay API 集成

### 计划功能
- [ ] 音乐素材搜索
- [ ] 高级筛选功能
- [ ] 用户评论系统
- [ ] 素材推荐算法
- [ ] 多语言支持
- [ ] 移动端 APP

---

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！**

[🔗 在线演示](https://your-demo-url.vercel.app) | [📖 文档](https://your-docs-url.com) | [🐛 报告问题](https://github.com/your-username/video-search-platform/issues)
