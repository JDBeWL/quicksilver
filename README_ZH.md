# Quicksilver

> 灵感，塑你所想。

Quicksilver 是一个为**极致灵活性和可扩展性**而设计的博客引擎。其核心是**Quicksilver Core**——一个轻量级且极具韧性的基础架构，提供文章编辑、发布和用户管理等核心功能。所有其他功能都由强大的插件系统驱动，让您能够完全按照自己的设想打造平台。

## 🛠 技术栈

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

> 基于 **Next.js 16**, **React 19**, 和 **Tailwind CSS 4** 构建。

## ✨ 核心特性

### Quicksilver Core (核心引擎)
- **韧性架构 (Resilience)**: 即使数据库离线，也能通过增量静态再生(ISR)技术提供缓存内容，确保网站始终可用。
- **系统状态监控**: 在“关于”页面提供实时的数据库连接状态检查(运行中/维护中)。
- **动态配置**: 支持通过数据库(`SiteConfig`)动态配置网站标语和Hero区域文本，用户可自由定制。

### 内容与写作
- **高级 Markdown 编辑器**:
    - 实时预览，支持语法高亮(Prism.js)。
    - 代码块一键复制功能。
    - **MDX 组件**: 支持在文章中插入图表(Charts)、提示框(Alerts) 和模态框(Modals)。
    - 优化的链接和格式化内容样式。
- **国际化 (i18n)**: 完美支持简体中文和英文切换。
- **仪表盘**: 提供全面的统计数据（文章总数、已发布、草稿）和便捷的文章管理。

### 平台特性
- **现代UI/UX**: 基于**Tailwind CSS 4**打造的极简主义美学设计。
- **安全措施**:
    - **CSRF防护**: 全面保护Server Actions和API路由。
    - **安全标头**: 严格的Content-Type,Origin,和Referer验证。
    - **输入验证**: 强大的数据校验，防止常见漏洞。
- **用户认证**: 强大的会话管理和安全的登录/注册流程(NextAuth.js)。
- **插件系统**: (开发中) 可扩展的架构，支持自定义主题、组件和功能。

## 🚀 快速开始

按照以下步骤在本地部署 Quicksilver。

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone <your-repo-url>
   cd Quicksilver
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   在根目录创建一个`.env`文件。
   ```bash
   # .env 示例
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-key-change-this"
   ```

4. **数据库配置**
   使用Prisma初始化数据库。
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **创建管理员用户**
   创建您的初始管理员账户。
   ```bash
   npm run create-admin
   ```

6. **生成邀请码** (可选)
   如果需要邀请其他用户。
   ```bash
   npm run generate-invite
   ```

7. **启动开发服务器**
   ```bash
   npm run dev
   ```

   在浏览器中访问[http://localhost:3000](http://localhost:3000)查看效果。

## 📝 使用说明

- **首页**: 浏览最新文章，体验离线缓存保护。
- **仪表盘**: 追踪创作数据（已发布/草稿），管理您的文章。
- **关于**: 查看“系统状态”并了解Quicksilver Core理念。
- **写作**: 使用带有代码高亮和复制功能的增强型Markdown编辑器进行创作，支持MDX组件。

## 📄 许可证

本项目采用 MIT 许可证。
