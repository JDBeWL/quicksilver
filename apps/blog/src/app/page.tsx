'use client';

import { useEffect } from 'react';
import { i18n } from '../i18n-config';

function getLocale(): string {
  // 从Cookie中获取用户之前选择的语言
  const cookies = document.cookie;
  const preferredLanguageMatch = cookies.match(/preferred-language=([^;]+)/);
  if (preferredLanguageMatch && preferredLanguageMatch[1]) {
    const cookieLang = preferredLanguageMatch[1];
    if (i18n.locales.includes(cookieLang as any)) {
      return cookieLang;
    }
  }

  // 从浏览器的navigator.language中获取偏好语言
  if (typeof window !== 'undefined' && window.navigator) {
    const browserLanguage = window.navigator.language;
    
    // 将 zh-CN, zh-TW 等映射为 zh
    if (browserLanguage.startsWith('zh-')) return 'zh';
    // 将 en-US, en-GB 等映射为 en
    if (browserLanguage.startsWith('en-')) return 'en';
    
    // 直接匹配支持的语言
    if (i18n.locales.includes(browserLanguage as any)) {
      return browserLanguage;
    }
  }
  
  return i18n.defaultLocale;
}

// 获取 basePath（从当前 URL 推断）
function getBasePath(): string {
  if (typeof window === 'undefined') return '';
  
  const pathname = window.location.pathname;
  // 检查路径是否以已知的语言代码开头或直接是根路径
  // 如果路径是 /quicksilver/ 或 /quicksilver/en 等，提取 basePath
  const segments = pathname.split('/').filter(Boolean);
  
  // 如果第一个段不是语言代码，它可能是 basePath
  if (segments.length > 0 && !i18n.locales.includes(segments[0] as any)) {
    return '/' + segments[0];
  }
  
  return '';
}

// 处理 GitHub Pages 404 重定向
function handleGitHubPagesRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const redirectPath = params.get('p');
  
  if (redirectPath) {
    // 清除 URL 中的重定向参数
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState(null, '', cleanUrl);
    return redirectPath;
  }
  
  return null;
}

export default function RootPage() {
    useEffect(() => {
        const basePath = getBasePath();
        
        // 首先检查是否是从 404 页面重定向过来的
        const redirectPath = handleGitHubPagesRedirect();
        
        if (redirectPath) {
          // 如果有重定向路径，直接跳转到该路径
          // 检查路径是否已经包含语言代码
          const pathSegments = redirectPath.split('/').filter(Boolean);
          const hasLang = pathSegments.length > 0 && i18n.locales.includes(pathSegments[0] as any);
          
          if (hasLang) {
            window.location.replace(`${basePath}${redirectPath}`);
          } else {
            // 添加语言代码
            const locale = getLocale();
            window.location.replace(`${basePath}/${locale}${redirectPath}`);
          }
          return;
        }
        
        // 正常的语言重定向
        const locale = getLocale();
        const targetPath = `${basePath}/${locale}/`;
        
        // 使用 location.replace 进行重定向，避免在历史记录中留下当前页面
        window.location.replace(targetPath);
    }, []);
    
    // 显示加载指示器，等待重定向
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Quicksilver Blog</h1>
                <p className="text-gray-600">Redirecting to your preferred language...</p>
            </div>
        </div>
    );
}
