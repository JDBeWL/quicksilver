'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/context/LanguageContext';
import { Locale } from '@/i18n-config';

interface LanguageSwitcherProps {
  currentPath?: string;
  className?: string;
  variant?: 'dropdown' | 'toggle';
}

export function LanguageSwitcher({ 
  currentPath = '', 
  className = '',
  variant = 'dropdown'
}: LanguageSwitcherProps) {
  const { state, changeLanguage, setUserPreference } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 获取当前语言信息
  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === state.currentLanguage
  ) || SUPPORTED_LANGUAGES[0];

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理语言切换
  const handleLanguageChange = (langCode: Locale) => {
    changeLanguage(langCode);
    setUserPreference(langCode);
    setIsOpen(false);
    
    // 构建新路径：替换当前路径中的语言代码
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    
    // 找到语言代码在路径中的位置
    const langIndex = pathSegments.findIndex(segment => 
      SUPPORTED_LANGUAGES.some(lang => lang.code === segment)
    );
    
    if (langIndex !== -1) {
      // 替换现有的语言代码
      pathSegments[langIndex] = langCode;
    } else {
      // 如果没有找到语言代码，在 basePath 之后添加
      // 假设第一个段可能是 basePath（如 'quicksilver'）
      if (pathSegments.length > 0 && !SUPPORTED_LANGUAGES.some(lang => lang.code === pathSegments[0])) {
        // 第一个段是 basePath，在其后插入语言代码
        pathSegments.splice(1, 0, langCode);
      } else {
        // 没有 basePath，直接在开头添加语言代码
        pathSegments.unshift(langCode);
      }
    }
    
    const newPath = '/' + pathSegments.join('/');
    
    // 直接使用 location.href 进行导航，确保页面完全刷新
    window.location.href = newPath;
  };

  // 下拉菜单变体
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors duration-200"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Globe className="w-4 h-4" />
          <span className="flex items-center space-x-1">
            <span>{currentLanguage.flag}</span>
            <span className="hidden md:inline">{currentLanguage.name}</span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <ul
            className="absolute right-0 z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg overflow-hidden"
            role="listbox"
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <li key={language.code} role="option">
                <button
                  onClick={() => handleLanguageChange(language.code as Locale)}
                  className={`flex items-center space-x-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${
                    language.code === state.currentLanguage 
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                  {language.code === state.currentLanguage && (
                    <svg className="w-4 h-4 ml-auto text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
            
            {state.locationInfo && (
              <div className="border-t border-gray-200 dark:border-gray-600 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                <div>检测位置: {state.locationInfo.country}</div>
                {state.languageDetectionSource && (
                  <div>检测来源: {
                    state.languageDetectionSource === 'browser' ? '浏览器设置' :
                    state.languageDetectionSource === 'location' ? '地理位置' :
                    '默认设置'
                  }</div>
                )}
              </div>
            )}
          </ul>
        )}
      </div>
    );
  }

  // 切换按钮变体（在两种语言之间切换）
  if (variant === 'toggle') {
    const otherLanguage = SUPPORTED_LANGUAGES.find(
      lang => lang.code !== state.currentLanguage
    ) || SUPPORTED_LANGUAGES[0];

    return (
      <button
        onClick={() => handleLanguageChange(otherLanguage.code as Locale)}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors duration-200 ${className}`}
      >
        <Globe className="w-4 h-4" />
        <span className="flex items-center space-x-1">
          <span>{otherLanguage.flag}</span>
          <span className="hidden md:inline">{otherLanguage.name}</span>
        </span>
      </button>
    );
  }

  return null;
}

// 语言检测提示组件
interface LanguageDetectionToastProps {
  onDismiss: () => void;
  onAccept: () => void;
  suggestedLanguage: string;
  languageName: string;
  flag: string;
}

export function LanguageDetectionToast({
  onDismiss,
  onAccept,
  suggestedLanguage,
  languageName,
  flag
}: LanguageDetectionToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            检测到您的语言偏好
          </h3>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            我们建议切换到 <span className="font-medium">{flag} {languageName}</span> 以获得更好的浏览体验
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={onAccept}
              className="flex-1 justify-center px-3 py-1.5 text-xs font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              切换语言
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 justify-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              保持当前
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="ml-auto flex-shrink-0 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}