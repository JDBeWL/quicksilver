'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ClientPlugin } from '../../lib/plugins/types';
import { Search, X } from 'lucide-react';

// 多语言文本
const translations = {
    en: {
        search: 'Search',
        searchPlaceholder: 'Search articles...',
        noResults: 'No articles found',
        startTyping: 'Start typing to search',
        noContent: 'No content available'
    },
    zh: {
        search: '搜索',
        searchPlaceholder: '搜索文章...',
        noResults: '没有找到相关文章',
        startTyping: '输入内容开始搜索',
        noContent: '暂无内容'
    }
};

interface SearchResult {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
}

function SearchBoxComponent() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const [searchIndex, setSearchIndex] = useState<SearchResult[]>([]);
    const [lastUpdated, setLastUpdated] = useState<number>(0); // 用于跟踪最后更新时间
    const inputRef = useRef<HTMLInputElement>(null);
    
    // 在开发环境中，定期检查搜索索引是否需要更新
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        
        const checkForUpdates = async () => {
            try {
                const response = await fetch('/data/search-index.json');
                if (response.ok) {
                    const indexData = await response.json();
                    const indexText = JSON.stringify(indexData);
                    const hash = simpleHash(indexText);
                    
                    // 如果索引有变化，则更新
                    if (hash !== lastUpdated) {
                        console.log('Search index updated, refreshing...');
                        setLastUpdated(hash);
                        
                        // 根据当前语言更新无内容的提示文本
                        const updatedIndex = indexData.map((item: SearchResult) => ({
                            ...item,
                            excerpt: item.excerpt.includes('暂无内容') && currentLang === 'en' 
                                ? 'No content available' 
                                : item.excerpt.includes('No content available') && currentLang === 'zh'
                                ? '暂无内容'
                                : item.excerpt
                        }));
                        setSearchIndex(updatedIndex);
                    }
                }
            } catch (error) {
                console.error('Error checking for search index updates:', error);
            }
        };
        
        // 初始检查
        checkForUpdates();
        
        // 每10秒检查一次
        const interval = setInterval(checkForUpdates, 10000);
        
        return () => clearInterval(interval);
    }, [currentLang, lastUpdated]);
    
    // 简单的哈希函数，用于检测内容变化
    const simpleHash = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash;
    };
    
    // 获取当前语言的翻译文本
    const t = React.useMemo(() => translations[currentLang as keyof typeof translations] || translations.en, [currentLang]);

    // 等待客户端挂载并获取当前语言
    useEffect(() => {
        setMounted(true);
        // 从URL路径中获取当前语言
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const possibleLang = pathParts[0];
            if (possibleLang && (possibleLang === 'en' || possibleLang === 'zh')) {
                setCurrentLang(possibleLang);
            }
        }
    }, []);

    // 加载搜索索引（从静态文件加载）
    useEffect(() => {
        const loadSearchIndex = async () => {
            try {
                // 从静态文件加载搜索索引
                const response = await fetch('/data/search-index.json');
                if (response.ok) {
                    const index = await response.json();
                    // 根据当前语言更新无内容的提示文本
                    const updatedIndex = index.map((item: SearchResult) => ({
                        ...item,
                        excerpt: item.excerpt.includes('暂无内容') && currentLang === 'en' 
                            ? 'No content available' 
                            : item.excerpt.includes('No content available') && currentLang === 'zh'
                            ? '暂无内容'
                            : item.excerpt
                    }));
                    console.log(`Loaded ${updatedIndex.length} posts from search index`);
                    setSearchIndex(updatedIndex);
                    
                    // 初始化哈希值
                    const indexText = JSON.stringify(index);
                    const hash = simpleHash(indexText);
                    setLastUpdated(hash);
                } else {
                    console.error('Failed to load search index:', response.status);
                }
            } catch (error) {
                console.error('Error loading search index:', error);
            }
        };

        loadSearchIndex();
    }, [currentLang]);

    // 客户端搜索功能（基于预生成的索引）- 恢复即时搜索
    const results = useMemo(() => {
        if (query.length < 1 || searchIndex.length === 0) return [];
        
        const searchTerm = query.toLowerCase().trim();
        
        return searchIndex.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(searchTerm);
            const excerptMatch = item.excerpt.toLowerCase().includes(searchTerm);
            const contentMatch = item.content.toLowerCase().includes(searchTerm);
            
            return titleMatch || excerptMatch || contentMatch;
        }).slice(0, 10);
    }, [query, searchIndex]);

    // 键盘快捷键 (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 聚焦输入框
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // 模态框内容
    const modalContent = isOpen ? (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden mb-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 搜索输入 */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="flex-1 bg-transparent outline-none text-lg"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* 搜索结果 */}
                <div className="max-h-96 overflow-y-auto">
                    {query.length >= 1 && results.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            {t.noResults}
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {results.map((result) => (
                                <a
                                    key={result.id}
                                    href={`/${currentLang}/posts/${result.slug}`}
                                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        {result.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {result.excerpt}
                                    </p>
                                </a>
                            ))}
                        </div>
                    )}

                    {query.length < 1 && (
                        <div className="p-8 text-center text-gray-500">
                            {t.startTyping}
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : null;

    return (
        <>
            {/* 搜索按钮 */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={t.search}
            >
                <Search className="w-4 h-4" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.search}...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
                    <span>⌘</span>K
                </kbd>
            </button>

            {/* 使用 Portal 将模态框渲染到 body */}
            {mounted && modalContent && createPortal(modalContent, document.body)}
        </>
    );
}

export const SearchBoxPlugin: ClientPlugin = {
    id: 'search-box',
    name: '搜索框插件',
    description: '提供全站文章搜索功能，支持快捷键 Ctrl/Cmd + K',
    components: {
        'navbar-end': SearchBoxComponent,
    },
    onLoad: () => {
        console.log('Search Box Plugin loaded!');
    }
};
