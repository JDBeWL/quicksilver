# Quicksilver

> Shape your story, your way.

Quicksilver is a blog engine built for **extreme flexibility and extensibility**. At its heart lies the **Quicksilver Core**, a lightweight, resilient foundation that provides essential writing, publishing, and user management capabilities. All other functionality is powered by a robust plugin system, empowering you to build the platform exactly as you envision it.

## 🛠 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

> Built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**.

## ✨ Key Features

### Quicksilver Core
- **Resilient Architecture**: Built with **Resilience** in mind. Features Incremental Static Regeneration (ISR) to serve cached content even if the database goes offline.
- **System Status Monitoring**: Real-time database connectivity check available on the About page.
- **Dynamic Configuration**: Customize site slogans and hero text directly via the database (`SiteConfig`), editable by users.

### Content & Writing
- **Advanced Markdown Editor**: 
    - Real-time preview with syntax highlighting (Prism.js).
    - "Copy Code" button for code blocks.
    - **MDX Components**: Support for Charts, Alerts, and Modals within posts.
    - Distinct styling for links and formatted content.
- **Internationalization (i18n)**: Fully localized in English and Chinese (Simplified).
- **Dashboard**: Comprehensive stats (Total Posts, Published, Drafts) and post management.

### Platform
- **Modern UI/UX**: Aesthetic design with **Tailwind CSS 4**, utilizing a clean, minimalist logic.
- **Enterprise-Grade Security**:
    - **CSRF Protection**: Comprehensive protection for Server Actions and API routes.
    - **Secure Headers**: Strict Content-Type, Origin, and Referer validation.
    - **Input Validation**: Robust data verification to prevent common vulnerabilities.
- **Secure Authentication**: Robust session management and secure login/register flows with NextAuth.js.
- **Plugin System**: (In Progress) Extensible architecture to add themes, widgets, and features.

## 🚀 Getting Started

Follow these steps to deploy Quicksilver locally.

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Quicksilver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory.
   ```bash
   # Example .env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-key-change-this"
   ```

4. **Database Setup**
   Initialize the database schema using Prisma.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Create Admin User**
   Create your initial administrator account.
   ```bash
   npm run create-admin
   ```

6. **Generate Invite Code** (Optional)
   If you need to invite other users.
   ```bash
   npm run generate-invite
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📝 Usage

- **Home Profile**: View the latest articles with resilient caching.
- **Dashboard**: Track your writing stats (Published/Drafts) and manage content.
- **About**: Check the "System Status" and learn about Quicksilver Core.
- **Writing**: Create posts using the enhanced markdown editor with code highlighting.

## 📄 License

This project is licensed under the MIT License.
