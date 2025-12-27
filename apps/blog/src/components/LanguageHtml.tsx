'use client';

import React, { useEffect } from 'react';

interface LanguageHtmlProps {
  children: React.ReactNode;
  lang: string;
}

export default function LanguageHtml({ children, lang }: LanguageHtmlProps) {
  useEffect(() => {
    // 设置HTML lang属性
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang;
      
      // 设置direction属性（如果需要支持从右到左的语言）
      document.documentElement.dir = 'ltr';
      
      // 添加语言类名，便于CSS样式定制
      document.documentElement.className = document.documentElement.className
        .replace(/lang-\w+/g, '') + ` lang-${lang}`;
    }
  }, [lang]);

  return <>{children}</>;
}