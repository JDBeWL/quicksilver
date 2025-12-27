import type { NextConfig } from "next";

// 在生产环境中使用静态导出，在开发环境中使用完全动态模式
const isDev = process.env.NODE_ENV === 'development';

// GitHub Pages 部署时的 basePath（仓库名）
// 设置环境变量 NEXT_PUBLIC_BASE_PATH 来配置，例如 /quicksilver
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
    // 只在非开发环境（生产环境）中使用静态导出
    ...(isDev ? {} : { output: 'export' }),
    // 配置 basePath 用于 GitHub Pages 部署
    ...(basePath ? { basePath } : {}),
    // 为静态导出添加 trailingSlash，确保路由正确工作
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    transpilePackages: ["@quicksilver/content-core"],
};

export default nextConfig;
